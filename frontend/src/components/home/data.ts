export const playlistUsers = [
	{ name: 'Ntomé', color: '#f7c59f' },
	{ name: 'Lina', color: '#a0ddff' },
	{ name: 'Milo', color: '#f3b7d2' },
	{ name: 'Rae', color: '#ffd8a8' },
	{ name: 'Sami', color: '#d5b4ff' },
	{ name: 'Ari', color: '#98f5d0' },
	{ name: 'Zoe', color: '#f9a8d4' },
	{ name: 'Kian', color: '#7dd3fc' },
] as const;

export const playlistSongs = [
	{ title: 'Midnight City Lights', artist: 'Skyline Echo', cover: '#f6b26b' },
	{ title: 'Velvet Waves', artist: 'Nova Harbor', cover: '#7ec8e3' },
	{ title: 'Afterglow Drive', artist: 'Luna Circuit', cover: '#9b59b6' },
	{ title: 'Neon Drift', artist: 'Soleil Avenue', cover: '#ff7f50' },
	{ title: 'Glass Horizon', artist: 'Polar Bloom', cover: '#5eead4' },
	{ title: 'Starlit Echo', artist: 'Echo Bloom', cover: '#f9a8d4' },
	{ title: 'Cinematic Sleep', artist: 'Night Arcade', cover: '#a78bfa' },
	{ title: 'Blue Mirage', artist: 'Ocean Thread', cover: '#60a5fa' },
	{ title: 'Soft Machines', artist: 'Velvet Bloom', cover: '#fbbf24' },
	{ title: 'Sunset Tapes', artist: 'Mirror Run', cover: '#fb7185' },
	{ title: 'Golden Loop', artist: 'Wave Theory', cover: '#f59e0b' },
	{ title: 'Moonlit Signal', artist: 'Luma Blue', cover: '#38bdf8' },
] as const;

export type Track = (typeof playlistSongs)[number];
