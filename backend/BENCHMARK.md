## Load benchmark

Reproduce with:

```bash
# terminal 1
cd backend && npm run dev
# terminal 2
cd backend && npm run bench
```

### Environment

- **os**: Linux 7.0.0-31-generic (x64)
- **cpu**: 12th Gen Intel(R) Core(TM) i5-1235U x12
- **ram**: 15.31 GiB total
- **node**: v22.22.0
- **postgres**: local WASM/embedded Postgres on port 51214
- **connectionCeiling**: server pool max 1: the embedded WASM Postgres this project runs against accepts a single client, so every database request is serialised and the connection queue is the measured latency
- **loadTool**: autocannon 8.0.0
- **workload**: 30 seeded users, 15s per measurement, connections swept 20
- **network**: loopback, so these are server-side numbers with no network latency

### Results

| Scenario | Conns | req/s | p50 ms | p95 ms* | p97.5 ms | p99 ms | 2xx | 4xx | 5xx | net err | CPU % | RSS peak MB | procs |
| --- | --- | --- | --- | --- | --- | --- | --- | --- | --- | --- | --- | --- | --- |
| read event | 20 | 18.67 | 1013 | 1198 | 1210 | 1219 | 280 | 0 | 0 | 0 | 47.35 | 519.4 | 2 |
| read playlist | 20 | 20 | 973 | 1129 | 1145 | 1170 | 300 | 0 | 0 | 0 | 37.48 | 519.4 | 2 |
| concurrent vote | 20 | 14.67 | 1250 | 1590 | 1679 | 1740 | 220 | 0 | 0 | 0 | 31.8 | 519.4 | 2 |
| add track to playlist | 4 | 2 | 1027 | 1067 | 1067 | 1067 | 1 | 3 | 0 | 0 | 12.42 | 519.4 | 2 |
| move track | 20 | 16 | 1194 | 1396 | 1432 | 1458 | 240 | 0 | 0 | 0 | 29.44 | 519.4 | 2 |
| delegate control | 20 | 15 | 1052 | 1152 | 1166 | 1166 | 20 | 10 | 0 | 0 | 20.59 | 519.4 | 2 |
| read delegated device state | 20 | 37.34 | 535 | 643 | 656 | 668 | 560 | 0 | 0 | 0 | 36.4 | 519.4 | 2 |
| login | 5 | 5 | 754 | 816 | 816 | 816 | 5 | 0 | 0 | 0 | 83.35 | 519.4 | 2 |
| health (baseline) | 20 | 1963 | 10 | 20 | 23 | 27 | 29442 | 0 | 0 | 0 | 105.88 | 519.4 | 2 |

\* p95 is interpolated between p90 and p97.5; autocannon 8 does not emit a p95 bucket.

### How to read this

- `/health` is the ceiling of the process itself: no database, no session, no Prisma.
- The database-backed scenarios are one to two orders of magnitude slower, so the
  database, not the HTTP layer, is the binding constraint for this workload.
- 2xx + 4xx + 5xx accounts for every request, so a scenario that only returns 4xx is
  measuring auth or rate limiting, and one that returns 5xx is measuring a real failure.
  With the pool at 1 the database-backed rows return no 5xx at all: the earlier `P1017
  ConnectionClosed` failures came from the oversized pool, not from the workload.
- Absolute throughput is not representative of production. The database used here is an
  embedded WASM build that accepts very few concurrent clients, so these numbers bound
  what this environment can serve. Re-run against a real Postgres before treating any
  req/s figure as a capacity number.
- Latency is per operation at a fixed concurrency, and the server is a single Node
  process, so p99 grows with queueing rather than with per-request work.
- CPU % is the mean utilisation of the server process tree over the run, derived from
  the `/proc` CPU counters rather than from `ps` (`ps` only exposes a lifetime average,
  which says nothing about a burst). 100% means one core fully busy.
- RSS peak MB is the kernel high-water mark for the process tree, so it is a real peak
  and never decreases; it is not the memory held at the end of the run.
- `procs` counts the node processes holding the entrypoint. It is normally 2 under
  `npm run dev` (the tsx loader plus the server). A higher count means another server
  instance was running, in which case CPU and RSS cover all of them.
