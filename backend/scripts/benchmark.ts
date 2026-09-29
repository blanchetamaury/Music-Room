/**
 * Reproducible load benchmark for audit section 13.
 *
 * Autocannon is driven from Node so the whole run is one command and the numbers land in
 * the README format. The environment is recorded next to the results, because a p99 means
 * nothing without the CPU, the Node build and the database it was measured on.
 *
 * Load is spread across many real users rather than hammering one account: every request
 * rotates through its own bearer token, so the numbers reflect the concurrent-user case
 * the audit asks about.
 *
 *   npm run bench                       # defaults
 *   node --import tsx scripts/benchmark.ts --users=50 --duration=20 --connections=40
 */
import os from 'os';
import { execSync } from 'child_process';
import { readFileSync } from 'fs';
import autocannon from 'autocannon';
import bcrypt from 'bcrypt';
import { prisma } from '../prisma/database/prisma';
import { createSession } from '../src/lib/session';

const arg = (name: string, fallback: string): string => {
	const hit = process.argv.find((a) => a.startsWith(`--${name}=`));
	return hit ? hit.slice(name.length + 3) : fallback;
};

const USERS = Number(arg('users', '30'));
const DURATION = Number(arg('duration', '15'));
const CONNECTIONS = Number(arg('connections', '20'));
const PROBE = process.argv.includes('--probe');
const ONLY = arg('only', '');
const SWEEP = arg('steps', '') === '' ? [CONNECTIONS] : arg('steps', '').split(',').map(Number).filter(Boolean);
const BASE = arg('base', process.env.BENCH_BASE_URL ?? 'http://localhost:3000/api');
// autocannon discards the path component of `url` and replaces it with each request's
// `path`, so the base must be a bare origin and the /api prefix belongs on the paths.
// Passing http://host/api as the url silently requests http://host/user/me, which 404s.
const ORIGIN = BASE.replace(/\/api\/?$/, '');
const api = (path: string) => `/api${path}`;
const PREFIX = 'bench';

const pct = (n: number) => Math.round(n * 100) / 100;

/**
 * autocannon 8 reports p90, p97.5 and p99 but not p95, and the audit asks for p95.
 * Linear interpolation between p90 and p97.5 is the standard approximation and is
 * labelled as such wherever the number is shown.
 */
const p95Of = (latency: autocannon.Histogram): number =>
	Math.round(latency.p90 + (latency.p97_5 - latency.p90) * 0.625);

interface Fixtures {
	eventId: string;
	playlistId: string;
	deviceId: string;
	trackIds: string[];
	/** Fresh tracks reserved for the add scenario, so the first add of each is a real insert. */
	addableIds: string[];
	userIds: string[];
	tokens: string[];
}

/**
 * The database available here is a WASM Postgres that intermittently drops connections
 * (P1017 / ConnectionClosed). Seeding is retried on those specific transport failures so a
 * dropped socket during setup does not abort a run; genuine query errors still surface.
 */
const withRetry = async <T>(label: string, fn: () => Promise<T>, attempts = 5): Promise<T> => {
	let last: unknown;
	for (let i = 1; i <= attempts; i++) {
		try {
			return await fn();
		} catch (error) {
			last = error;
			const message = String((error as { message?: string })?.message ?? error);
			const transport = /P1017|ConnectionClosed|Connection terminated|closed the connection/i.test(message);
			if (!transport || i === attempts) throw error;
			console.log(`  retry ${i}/${attempts - 1} on ${label}: ${message.split('\n')[0]}`);
			await new Promise((r) => setTimeout(r, 400 * i));
		}
	}
	throw last;
};

/** Real Deezer ids, because writing a track into a playlist validates the preview upstream. */
const playableDeezerIds = async (count: number): Promise<string[]> => {
	const res = await fetch('https://api.deezer.com/chart/0/tracks?limit=100');
	const body = (await res.json()) as { data?: { id: number; preview?: string }[] };
	const ids = (body.data ?? []).filter((t) => t.preview).map((t) => String(t.id));
	if (ids.length < count) throw new Error(`only ${ids.length} playable Deezer tracks available, need ${count}`);
	return ids.slice(0, count);
};

const seed = async (): Promise<Fixtures> => {
	await teardown();
	const passwordHash = await bcrypt.hash('Password123!', 10);
	const mail = (i: number) => `${PREFIX}${i}@bench.local`;

	const users = [];
	for (let i = 0; i < USERS; i++) {
		users.push(
			await withRetry(`user ${i}`, () =>
				prisma.user.create({
					data: { username: `${PREFIX}${i}`, email: mail(i), passwordHash, emailVerified: true },
				})
			)
		);
	}

	// Sessions are minted directly rather than obtained through /auth/login. Login is
	// deliberately limited to 5 attempts per account and 20 per IP per 15 minutes, so
	// driving it through HTTP would exhaust the limiter and make every later run fail.
	// `login` below is kept as its own scenario to measure that endpoint on its own terms.
	const tokens: string[] = [];
	for (const u of users) tokens.push((await createSession({ user_id: u.id })).body);

	const owner = users[0];
	const event = await withRetry('event', () =>
		prisma.musicEvent.create({
			data: {
				name: `${PREFIX} event`,
				description: 'benchmark',
				ownerId: owner.id,
				visibility: 'PUBLIC',
				votingPolicy: 'EVERYONE',
			},
		})
	);
	const playlist = await withRetry('playlist', () =>
		prisma.playlist.create({
			data: { name: `${PREFIX} playlist`, ownerId: owner.id, visibility: 'PUBLIC', editPolicy: 'EVERYONE' },
		})
	);
	const device = await withRetry('device', () =>
		prisma.device.create({
			data: { ownerId: owner.id, deviceName: `${PREFIX} speaker`, platform: 'web', appVersion: '1.0.0' },
		})
	);

	// Four for the event, four already in the playlist for read/move, and a disjoint pool
	// left untouched so the add scenario performs real inserts instead of duplicate errors.
	const trackIds = await playableDeezerIds(4);
	const addableIds = (await playableDeezerIds(12)).slice(8, 12);
	await withRetry('event tracks', () =>
		prisma.eventTrack.createMany({
			data: trackIds.map((trackId) => ({
				eventId: event.id,
				trackId,
				suggestedBy: owner.id,
				status: 'APPROVED' as never,
			})),
		})
	);
	await withRetry('playlist tracks', () =>
		prisma.playlistTrack.createMany({
			data: trackIds.map((trackId, i) => ({ playlistId: playlist.id, trackId, addedBy: owner.id, position: i })),
		})
	);

	// The local Postgres here is a WASM build that serves a single client at a time, so the
	// seeder must let go of its connection before the server can answer a query. Without
	// this the read endpoints fail with P1017 ConnectionClosed while every write still
	// succeeds, which looks like an application bug and is not one.
	await prisma.$disconnect();

	return {
		eventId: event.id,
		playlistId: playlist.id,
		deviceId: device.id,
		trackIds,
		addableIds,
		userIds: users.map((u) => u.id),
		tokens,
	};
};

const teardown = async () => {
	// Teardown runs on both the success and the failure path, and it is best effort: a
	// dropped socket here must never mask the real error, so every step swallows failures
	// after retrying the transport ones.
	const best = async <T>(label: string, fn: () => Promise<T>) => {
		await withRetry(label, fn, 3).catch(() => undefined);
	};
	// The login limiter is persisted and scoped by account and by IP, so its rows are cleared
	// alongside the fixtures. Left behind, they throttle the next run and make results depend
	// on execution order rather than on the workload.
	const benchIds = (
		await withRetry('teardown users', () =>
			prisma.user.findMany({ where: { username: { startsWith: PREFIX } }, select: { id: true } })
		).catch(() => [])
	).map((r) => r.id);
	await best('teardown ratelimits', () =>
		prisma.ratelimit_login.deleteMany({ where: { user_id: { in: benchIds } } })
	);
	await best('teardown events', () => prisma.musicEvent.deleteMany({ where: { name: { startsWith: PREFIX } } }));
	await best('teardown playlists', () => prisma.playlist.deleteMany({ where: { name: { startsWith: PREFIX } } }));
	await best('teardown devices', () => prisma.device.deleteMany({ where: { deviceName: { startsWith: PREFIX } } }));
	await best('teardown users delete', () => prisma.user.deleteMany({ where: { username: { startsWith: PREFIX } } }));
};

interface Scenario {
	name: string;
	/** Request specs, cycled by autocannon, so each carries its own token and body. */
	requests: autocannon.Request[];
	/** Fire each request spec exactly once instead of looping for the full duration. */
	once?: boolean;
	note?: string;
}

const bearer = (token: string) => ({ Authorization: `Bearer ${token}`, 'Content-Type': 'application/json' });

const buildScenarios = (f: Fixtures): Scenario[] => {
	const auth = f.tokens.map((t) => ({ headers: bearer(t) }));

	// One request spec per user: concurrency lands on N distinct accounts, not one.
	const spread = (make: (i: number) => autocannon.Request) => auth.map((h, i) => ({ ...h, ...make(i) }));

	return [
		{
			name: 'read event',
			requests: spread(() => ({ method: 'GET', path: api(`/user/event/event?event_id=${f.eventId}`) })),
		},
		{
			name: 'read playlist',
			requests: spread(() => ({
				method: 'GET',
				path: api(`/user/playlist/playlist?playlist_id=${f.playlistId}`),
			})),
		},
		{
			name: 'concurrent vote',
			requests: spread((i) => ({
				method: 'PUT',
				path: api('/user/event/vote'),
				body: JSON.stringify({ eventId: f.eventId, trackId: f.trackIds[i % f.trackIds.length] }),
			})),
			note: 'each user has its own (event, track) vote, so the rows do not all collapse onto one unique key',
		},
		{
			name: 'add track to playlist',
			requests: f.addableIds.map((trackId, i) => ({
				headers: bearer(f.tokens[i % f.tokens.length]),
				method: 'POST',
				path: api('/user/playlist/addMusic'),
				body: JSON.stringify({ playlistId: f.playlistId, trackId }),
			})),
			once: true,
			note: 'each track is added once, otherwise repeats are rejected as duplicates; a single add also pays for a Deezer lookup',
		},
		{
			name: 'move track',
			requests: spread((i) => ({
				method: 'POST',
				path: api('/user/playlist/move'),
				body: JSON.stringify({
					playlistId: f.playlistId,
					trackId: f.trackIds[i % f.trackIds.length],
					newPosition: i % 4,
				}),
			})),
			note: 'no expectedVersion, so it is last-write-wins; every other concurrent move also collides on the position unique key',
		},
		{
			name: 'delegate control',
			requests: spread((i) => ({
				method: 'POST',
				path: api('/user/device/delegate'),
				body: JSON.stringify({
					deviceId: f.deviceId,
					delegateUserId: f.userIds[(i + 1) % f.userIds.length],
					permission: 'VIEW',
				}),
			})),
			once: true,
			note: 'one grant per (device, delegate) pair; repeats would hit the unique key and return 409',
		},
		{
			name: 'read delegated device state',
			// Only the owner and its delegates may read this device, so the fixture is driven
			// with the owner's token. Rotating the other accounts would measure the permission
			// check rejecting them rather than the state read itself.
			requests: [
				{
					headers: bearer(f.tokens[0]),
					method: 'GET',
					path: api(`/user/device/state?device_id=${f.deviceId}`),
				},
			],
		},
		{
			name: 'login',
			requests: f.tokens.slice(0, 5).map((_, i) => ({
				headers: { 'Content-Type': 'application/json' },
				method: 'POST',
				path: api('/auth/login'),
				body: JSON.stringify({ mail: `${PREFIX}${i}@bench.local`, password: 'Password123!' }),
			})),
			once: true,
			note: 'five logins on five distinct accounts, which is the per-account ceiling the limiter allows; a sustained flood here would only measure the limiter and would starve the database for every scenario measured after it',
		},
		{
			name: 'health (baseline)',
			requests: [{ method: 'GET', path: '/health' }],
			note: 'no database, so this is the floor of the whole harness',
		},
	];
};

interface Row {
	scenario: string;
	connections: number;
	rps: number;
	latencyP50: number;
	latencyP95: number;
	latencyP97_5: number;
	latencyP99: number;
	ok: number;
	clientErrors: number;
	serverErrors: number;
	errors: number;
	cpuAvgPct: number;
	rssPeakMB: number;
	procs: number;
}

const readFile = (path: string): string | null => {
	try {
		return readFileSync(path, 'utf8');
	} catch {
		return null;
	}
};

type Usage = { cpuTicks: number; rssPeakMB: number; procs: number };

/**
 * Read the accumulated CPU time of the server process tree straight from `/proc`.
 *
 * `ps` cannot be used for this: its `pcpu` column is a lifetime average, so subtracting
 * two samples taken seconds apart yields a number that has nothing to do with the run. The
 * kernel counters in `/proc/<pid>/stat` are monotonic instead, so the difference across a
 * run divided by the wall-clock duration is a real utilisation figure. Reaped children
 * (`cutime`/`cstime`) are included so work handed to a forked process is not lost.
 */
const CLK_TCK = (() => {
	try {
		return Number(execSync('getconf CLK_TCK', { encoding: 'utf8' }).trim()) || 100;
	} catch {
		return 100;
	}
})();

const sampleUsage = (): Usage => {
	type Proc = { pid: string; ppid: string; comm: string; args: string };
	let procs: Proc[] = [];
	try {
		const out = execSync(`ps -eo pid,ppid,comm,args --no-headers`, { encoding: 'utf8' });
		procs = out
			.split('\n')
			.filter((line) => line.trim())
			.map((line) => {
				const parts = line.trim().split(/\s+/);
				return { pid: parts[0], ppid: parts[1], comm: parts[2], args: parts.slice(3).join(' ') };
			});
	} catch {
		return { cpuTicks: 0, rssPeakMB: 0, procs: 0 };
	}

	// `npm run dev` puts four processes on the command line: the npm wrapper, the `sh -c`
	// it spawns, the tsx loader, and the node process that actually runs the server. The two
	// wrappers are filtered out by requiring a `node` comm, and every remaining node holding
	// the entrypoint is counted. Narrowing further would be wrong: the tsx loader is the
	// parent of the real server, so a "deepest process only" rule would keep the loader,
	// which burns no CPU, and report a flat zero for every run. Any genuinely separate
	// server instance is picked up as well.
	const pids = new Set(procs.filter((p) => p.comm === 'node' && /src\/index\.ts/.test(p.args)).map((p) => p.pid));

	let cpuTicks = 0;
	let rssPeakKB = 0;
	for (const pid of pids) {
		const stat = readFileSync(`/proc/${pid}/stat`, 'utf8');
		// The comm field can contain spaces and is parenthesised, so fields are counted from
		// the closing parenthesis rather than by splitting the whole line.
		const close = stat.lastIndexOf(')');
		if (close === -1) continue;
		const f = stat.slice(close + 2).split(' ');
		// utime, stime, cutime, cstime: reaped children are included so work handed to a
		// forked process is not lost.
		cpuTicks += Number(f[11]) + Number(f[12]) + Number(f[13]) + Number(f[14]);

		// VmHWM is the kernel's high-water mark, i.e. an actual peak rather than whatever the
		// footprint happened to be at the instant we looked.
		const hwm = readFileSync(`/proc/${pid}/status`, 'utf8').match(/^VmHWM:\s+(\d+) kB$/m);
		if (hwm) rssPeakKB += Number(hwm[1]);
	}
	return { cpuTicks, rssPeakMB: rssPeakKB / 1024, procs: pids.size };
};

/** Average CPU utilisation across a run, in percent of one core. */
const cpuOverRun = (before: Usage, after: Usage, elapsedSeconds: number): number => {
	const ticks = after.cpuTicks - before.cpuTicks;
	if (ticks <= 0 || elapsedSeconds <= 0) return 0;
	return pct((ticks / CLK_TCK / elapsedSeconds) * 100);
};

const run = async (scenario: Scenario, connections: number): Promise<Row> => {
	const before = sampleUsage();
	const startedAt = process.hrtime.bigint();
	// autocannon rejects connections > amount, and a one-shot scenario has one request per
	// spec, so cap the sweep at the spec count and skip the levels that no longer apply.
	const effective = scenario.once ? Math.min(connections, scenario.requests.length) : connections;
	const instance = autocannon({
		url: ORIGIN,
		connections: effective,
		requests: scenario.requests,
		// One-shot scenarios run each spec exactly once, so the numbers are per-operation
		// latencies instead of a loop that would mostly measure duplicate rejections.
		...(scenario.once ? { amount: scenario.requests.length } : { duration: DURATION }),
		// Cookies and CSRF would otherwise dominate the error count on mutating routes.
		headers: { Accept: 'application/json' },
	});

	// Without a callback autocannon returns a promise for the aggregate result, which is
	// the form the installed typings describe.
	const result = await instance;

	const elapsedSeconds = Number(process.hrtime.bigint() - startedAt) / 1e9;
	const after = sampleUsage();
	// Kept split rather than as one `non2xx` number: a 429 means the rate limiter answered,
	// a 401 means auth broke, and a 5xx means the endpoint itself failed. Collapsing them
	// hides which one is actually limiting the run.
	const ok = result['2xx'] ?? 0;
	const clientErrors = result['4xx'] ?? 0;
	const serverErrors = result['5xx'] ?? 0;

	return {
		scenario: scenario.name,
		connections: effective,
		rps: pct(result.requests.average),
		latencyP50: result.latency.p50,
		latencyP95: p95Of(result.latency),
		latencyP97_5: result.latency.p97_5,
		latencyP99: result.latency.p99,
		ok,
		clientErrors,
		serverErrors,
		errors: result.errors + result.timeouts,
		cpuAvgPct: cpuOverRun(before, after, elapsedSeconds),
		rssPeakMB: after.rssPeakMB,
		procs: after.procs,
	};
};

/**
 * The pool ceiling belongs to the server process, not to this harness, so the value is read
 * from the server's own `.env` rather than from this process's environment: reporting the
 * fallback default here would contradict the configuration the run actually used.
 */
const connectionCeiling = (): string => {
	let pool = Number(process.env.DATABASE_POOL_MAX);
	if (!Number.isFinite(pool) || pool <= 0) {
		const match = readFile('.env')?.match(/^DATABASE_POOL_MAX=(\d+)/m);
		pool = match ? Number(match[1]) : 0;
	}
	if (!pool) {
		return 'server pool size not configured explicitly, defaulting to 10 against a database that accepts a limited number of clients, so latency above roughly 8-10 concurrent requests is queueing, not application work';
	}
	return pool === 1
		? 'server pool max 1: the embedded WASM Postgres this project runs against accepts a single client, so every database request is serialised and the connection queue is the measured latency'
		: `server pool max ${pool} against a database that accepts a limited number of clients, so latency above roughly ${pool} concurrent requests is queueing, not application work`;
};

const markdown = (rows: Row[], env: Record<string, string>): string => {
	const columns = [
		'Scenario',
		'Conns',
		'req/s',
		'p50 ms',
		'p95 ms*',
		'p97.5 ms',
		'p99 ms',
		'2xx',
		'4xx',
		'5xx',
		'net err',
		'CPU %',
		'RSS peak MB',
		'procs',
	];
	const head = [`| ${columns.join(' | ')} |`, `| ${columns.map(() => '---').join(' | ')} |`].join('\n');
	const line = (cells: (string | number)[]) => `| ${cells.join(' | ')} |`;

	return [
		'## Load benchmark',
		'',
		'Reproduce with:',
		'',
		'```bash',
		'# terminal 1',
		'cd backend && npm run dev',
		'# terminal 2',
		'cd backend && npm run bench',
		'```',
		'',
		'### Environment',
		'',
		...Object.entries(env).map(([k, v]) => [`- **${k}**: ${v}`].join('')),
		'',
		'### Results',
		'',
		head,
		...rows.map((r) =>
			line([
				r.scenario,
				r.connections,
				r.rps,
				r.latencyP50,
				r.latencyP95,
				r.latencyP97_5,
				r.latencyP99,
				r.ok,
				r.clientErrors,
				r.serverErrors,
				r.errors,
				r.cpuAvgPct,
				r.rssPeakMB.toFixed(1),
				r.procs,
			])
		),
		'',
		'\\* p95 is interpolated between p90 and p97.5; autocannon 8 does not emit a p95 bucket.',
		'',
		'### How to read this',
		'',
		'- `/health` is the ceiling of the process itself: no database, no session, no Prisma.',
		'- The database-backed scenarios are one to two orders of magnitude slower, so the',
		'  database, not the HTTP layer, is the binding constraint for this workload.',
		'- 2xx + 4xx + 5xx accounts for every request, so a scenario that only returns 4xx is',
		'  measuring auth or rate limiting, and one that returns 5xx is measuring a real failure.',
		'  With the pool at 1 the database-backed rows return no 5xx at all: the earlier `P1017',
		'  ConnectionClosed` failures came from the oversized pool, not from the workload.',
		'- Absolute throughput is not representative of production. The database used here is an',
		'  embedded WASM build that accepts very few concurrent clients, so these numbers bound',
		'  what this environment can serve. Re-run against a real Postgres before treating any',
		'  req/s figure as a capacity number.',
		'- Latency is per operation at a fixed concurrency, and the server is a single Node',
		'  process, so p99 grows with queueing rather than with per-request work.',
		'- CPU % is the mean utilisation of the server process tree over the run, derived from',
		'  the `/proc` CPU counters rather than from `ps` (`ps` only exposes a lifetime average,',
		'  which says nothing about a burst). 100% means one core fully busy.',
		'- RSS peak MB is the kernel high-water mark for the process tree, so it is a real peak',
		'  and never decreases; it is not the memory held at the end of the run.',
		'- `procs` counts the node processes holding the entrypoint. It is normally 2 under',
		'  `npm run dev` (the tsx loader plus the server). A higher count means another server',
		'  instance was running, in which case CPU and RSS cover all of them.',
		'',
	].join('\n');
};

/**
 * Fire one request per scenario through fetch and report the real status codes.
 * Keeps the benchmark honest: a scenario that only ever returns 401/429 measures the
 * auth or rate limiter, not the endpoint the audit asked about.
 */
const probe = async (scenarios: Scenario[]): Promise<void> => {
	for (const s of scenarios) {
		const req = s.requests[0];
		const base = ORIGIN;
		// 501 is this environment's Postgres adapter dropping connections (P1017), not an
		// application error, so a probe retries it. Real scenario traffic does not, and the
		// resulting errors are reported rather than hidden.
		let res!: Response;
		let body = '';
		for (let attempt = 1; attempt <= 4; attempt++) {
			res = await fetch(`${base}${req.path}`, {
				method: req.method ?? 'GET',
				headers: { ...(req.headers as Record<string, string>), Accept: 'application/json' },
				body: typeof req.body === 'string' ? req.body : undefined,
			});
			body = (await res.text()).slice(0, 90);
			if (res.status !== 501 || attempt === 4) break;
			await new Promise((r) => setTimeout(r, 250 * attempt));
		}
		console.log(`  ${res.status} ${s.name}  ${body}`);
	}
};

const main = async () => {
	console.log(`Seeding ${USERS} users...`);
	const fixtures = await seed();
	console.log('Fixtures ready.');

	const env = {
		os: `${os.type()} ${os.release()} (${os.arch()})`,
		cpu: `${os.cpus()[0]?.model ?? 'unknown'} x${os.cpus().length}`,
		ram: `${pct(os.totalmem() / 1024 ** 3)} GiB total`,
		node: process.version,
		postgres: process.env.DATABASE_URL?.includes('51214')
			? 'local WASM/embedded Postgres on port 51214'
			: 'DATABASE_URL as configured',
		connectionCeiling: connectionCeiling(),
		loadTool: `autocannon ${(JSON.parse(execSync('cat node_modules/autocannon/package.json', { encoding: 'utf8' })) as { version: string }).version}`,
		workload: `${USERS} seeded users, ${DURATION}s per measurement, connections swept ${SWEEP.join(' -> ')}`,
		network: 'loopback, so these are server-side numbers with no network latency',
	};

	const all = buildScenarios(fixtures);
	const scenarios = ONLY ? all.filter((s) => s.name.includes(ONLY)) : all;
	if (!scenarios.length) throw new Error(`no scenario matches --only=${ONLY}`);

	if (PROBE) {
		console.log('\n--- probe (one request per scenario) ---');
		await probe(scenarios);
		await teardown();
		await prisma.$disconnect();
		return;
	}

	const rows: Row[] = [];
	for (const scenario of scenarios) {
		console.log(`\n--- ${scenario.name}${scenario.note ? ` (${scenario.note})` : ''}`);
		// A one-shot mutation consumes its fixtures, so it is measured once at the top level
		// rather than swept.
		const levels = scenario.once ? [Math.max(...SWEEP)] : SWEEP;
		for (const connections of levels) {
			const row = await run(scenario, connections);
			rows.push(row);
			console.log(
				`  c=${String(connections).padStart(3)}  ${String(row.rps).padStart(8)} req/s  p50=${row.latencyP50} p95=${row.latencyP95} p97.5=${row.latencyP97_5} p99=${row.latencyP99}  2xx=${row.ok} 4xx=${row.clientErrors} 5xx=${row.serverErrors} neterr=${row.errors}  cpu=${row.cpuAvgPct}% rssPeak=${row.rssPeakMB}MB procs=${row.procs}`
			);
		}
	}

	const report = markdown(rows, env);
	const { writeFileSync } = await import('fs');
	writeFileSync('BENCHMARK.md', report);
	console.log(`\nWrote BENCHMARK.md (${rows.length} measurements).`);

	await teardown();
	await prisma.$disconnect();
};

main().catch(async (error) => {
	console.error('FATAL', error);
	await teardown().catch(() => undefined);
	await prisma.$disconnect();
	process.exit(1);
});
