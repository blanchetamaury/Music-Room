
import bcrypt from 'bcrypt';
import { prisma } from '../prisma/database/prisma';

const PASSWORD = 'Password123!';
const RESET = process.argv.includes('--reset');

interface SeedUser {
	key: string;
	username: string;
	email: string;
	avatarUrl?: string;
}

const USERS: SeedUser[] = [
	{
		key: 'alice',
		username: 'alice',
		email: 'alice@demo.local',
		avatarUrl: 'https://api.dicebear.com/7.x/initials/svg?seed=alice',
	},
	{
		key: 'bob',
		username: 'bob',
		email: 'bob@demo.local',
		avatarUrl: 'https://api.dicebear.com/7.x/initials/svg?seed=bob',
	},
	{
		key: 'chloe',
		username: 'chloe',
		email: 'chloe@demo.local',
		avatarUrl: 'https://api.dicebear.com/7.x/initials/svg?seed=chloe',
	},
	{ key: 'dave', username: 'dave', email: 'dave@demo.local' },
];

const demoTracks = async (count: number): Promise<{ id: string; title: string }[]> => {
	const res = await fetch('https://api.deezer.com/chart/0/tracks?limit=100');
	if (!res.ok) throw new Error(`Deezer chart unavailable: ${res.status}`);
	const body = (await res.json()) as { data?: { id: number; title: string; preview?: string }[] };
	const usable = (body.data ?? []).filter((t) => t.preview);
	if (usable.length < count) throw new Error(`only ${usable.length} playable tracks available, need ${count}`);
	return usable.slice(0, count).map((t) => ({ id: String(t.id), title: t.title }));
};

const reset = async () => {
	await prisma.eventTrack.deleteMany({ where: { event: { name: { startsWith: 'Demo' } } } });
	const demoEvents = await prisma.musicEvent.findMany({
		where: { name: { startsWith: 'Demo' } },
		select: { id: true },
	});
	const demoEventIds = demoEvents.map((e) => e.id);
	await prisma.eventVote.deleteMany({ where: { eventId: { in: demoEventIds } } });
	await prisma.musicEventMember.deleteMany({ where: { event: { name: { startsWith: 'Demo' } } } });
	await prisma.musicEvent.deleteMany({ where: { name: { startsWith: 'Demo' } } });
	await prisma.playlistTrack.deleteMany({ where: { playlist: { name: { startsWith: 'Demo' } } } });
	await prisma.playlistMember.deleteMany({ where: { playlist: { name: { startsWith: 'Demo' } } } });
	await prisma.playlist.deleteMany({ where: { name: { startsWith: 'Demo' } } });
	await prisma.device.deleteMany({ where: { deviceName: { startsWith: 'Demo' } } });
	await prisma.user.deleteMany({ where: { email: { endsWith: '@demo.local' } } });
	console.log('Removed existing demo data.');
};

const main = async () => {
	if (RESET) await reset();

	const passwordHash = await bcrypt.hash(PASSWORD, 10);
	const byKey: Record<string, { id: string }> = {};

	for (const u of USERS) {
		const user = await prisma.user.upsert({
			where: { email: u.email },
			update: { username: u.username, passwordHash, emailVerified: true, avatarUrl: u.avatarUrl },
			create: {
				username: u.username,
				email: u.email,
				passwordHash,
				emailVerified: true,
				avatarUrl: u.avatarUrl,
			},
		});
		byKey[u.key] = user;
	}
	console.log(`Users ready (${USERS.length}), all verified, password: ${PASSWORD}`);

	const tracks = await demoTracks(6);
	console.log(`Using ${tracks.length} real Deezer tracks with previews.`);

	const publicPlaylist = await prisma.playlist.upsert({
		where: { name_ownerId: { name: 'Demo Roadtrip', ownerId: byKey.alice.id } },
		update: { description: 'Public playlist seeded for the demo', visibility: 'PUBLIC', editPolicy: 'EVERYONE' },
		create: {
			name: 'Demo Roadtrip',
			description: 'Public playlist seeded for the demo',
			ownerId: byKey.alice.id,
			visibility: 'PUBLIC',
			editPolicy: 'EVERYONE',
		},
	});
	await prisma.playlistTrack.deleteMany({ where: { playlistId: publicPlaylist.id } });
	await prisma.playlistTrack.createMany({
		data: tracks
			.slice(0, 3)
			.map((t, i) => ({ playlistId: publicPlaylist.id, trackId: t.id, position: i, addedBy: byKey.alice.id })),
	});

	const privatePlaylist = await prisma.playlist.upsert({
		where: { name_ownerId: { name: 'Demo Private', ownerId: byKey.bob.id } },
		update: {
			description: 'Private playlist seeded for the demo',
			visibility: 'PRIVATE',
			editPolicy: 'INVITED_ONLY',
		},
		create: {
			name: 'Demo Private',
			description: 'Private playlist seeded for the demo',
			ownerId: byKey.bob.id,
			visibility: 'PRIVATE',
			editPolicy: 'INVITED_ONLY',
		},
	});
	await prisma.playlistMember.upsert({
		where: { playlistId_userId: { playlistId: privatePlaylist.id, userId: byKey.alice.id } },
		update: { role: 'EDITOR', acceptedAt: new Date() },
		create: { playlistId: privatePlaylist.id, userId: byKey.alice.id, role: 'EDITOR', acceptedAt: new Date() },
	});
	await prisma.playlistMember.upsert({
		where: { playlistId_userId: { playlistId: privatePlaylist.id, userId: byKey.chloe.id } },
		update: { role: 'VIEWER', acceptedAt: new Date() },
		create: { playlistId: privatePlaylist.id, userId: byKey.chloe.id, role: 'VIEWER', acceptedAt: new Date() },
	});
	await prisma.playlistTrack.deleteMany({ where: { playlistId: privatePlaylist.id } });
	await prisma.playlistTrack.createMany({
		data: tracks
			.slice(3, 6)
			.map((t, i) => ({ playlistId: privatePlaylist.id, trackId: t.id, position: i, addedBy: byKey.bob.id })),
	});
	console.log('Playlists ready: "Demo Roadtrip" (public) and "Demo Private" (invite only).');

	const event = await prisma.musicEvent.upsert({
		where: { id: 'demo-event-party' },
		update: { name: 'Demo Listening Party', description: 'Public event seeded for the demo' },
		create: {
			id: 'demo-event-party',
			name: 'Demo Listening Party',
			description: 'Public event seeded for the demo',
			ownerId: byKey.alice.id,
			visibility: 'PUBLIC',
			votingPolicy: 'EVERYONE',
		},
	});
	await prisma.eventTrack.deleteMany({ where: { eventId: event.id } });
	await prisma.eventTrack.createMany({
		data: tracks.slice(0, 4).map((t) => ({
			eventId: event.id,
			trackId: t.id,
			suggestedBy: byKey.alice.id,
			status: 'APPROVED' as never,
		})),
	});
	await prisma.eventVote.upsert({
		where: { eventId_userId_trackId: { eventId: event.id, userId: byKey.bob.id, trackId: tracks[0].id } },
		update: {},
		create: { eventId: event.id, userId: byKey.bob.id, trackId: tracks[0].id },
	});
	await prisma.musicEventMember.upsert({
		where: { eventId_userId: { eventId: event.id, userId: byKey.dave.id } },
		update: { role: 'MEMBER' },
		create: { eventId: event.id, userId: byKey.dave.id, role: 'MEMBER' },
	});
	console.log('Event ready: "Demo Listening Party" with a pending invite for dave.');

	await prisma.device.upsert({
		where: { id: 'demo-device-speaker' },
		update: { deviceName: 'Demo Speaker', lastSeenAt: new Date() },
		create: {
			id: 'demo-device-speaker',
			ownerId: byKey.alice.id,
			deviceName: 'Demo Speaker',
			platform: 'web',
			appVersion: '1.0.0',
			lastSeenAt: new Date(),
		},
	});
	await prisma.devicePlaybackState.upsert({
		where: { deviceId: 'demo-device-speaker' },
		update: {},
		create: { deviceId: 'demo-device-speaker', status: 'IDLE', volume: 80 },
	});

	await prisma.devicePermission.upsert({
		where: { deviceId_delegateUserId: { deviceId: 'demo-device-speaker', delegateUserId: byKey.bob.id } },
		update: { permission: 'VIEW', createdBy: byKey.alice.id, expiresAt: null },
		create: {
			deviceId: 'demo-device-speaker',
			delegateUserId: byKey.bob.id,
			permission: 'VIEW',
			createdBy: byKey.alice.id,
		},
	});
	console.log('Device ready: "Demo Speaker" owned by alice, readable by bob.');

	console.log('\nSign in with any of:');
	for (const u of USERS) console.log(`  ${u.email} / ${PASSWORD}`);
};

main()
	.then(async () => {
		await prisma.$disconnect();
	})
	.catch(async (error) => {
		console.error('Seed failed:', error);
		await prisma.$disconnect();
		process.exit(1);
	});
