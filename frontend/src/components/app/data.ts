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
	{
		title: 'Midnight City Lights',
		artist: 'Skyline Echo',
		cover: '#f6b26b',
		preview: 'https://www.soundhelix.com/examples/mp3/SoundHelix-Song-1.mp3',
	},

	{
		title: 'Velvet Waves',
		artist: 'Nova Harbor',
		cover: '#7ec8e3',
		preview: 'https://www.soundhelix.com/examples/mp3/SoundHelix-Song-2.mp3',
	},

	{
		title: 'Afterglow Drive',
		artist: 'Luna Circuit',
		cover: '#9b59b6',
		preview: 'https://www.soundhelix.com/examples/mp3/SoundHelix-Song-3.mp3',
	},

	{
		title: 'Neon Drift',
		artist: 'Soleil Avenue',
		cover: '#ff7f50',
		preview: 'https://www.soundhelix.com/examples/mp3/SoundHelix-Song-4.mp3',
	},

	{
		title: 'Glass Horizon',
		artist: 'Polar Bloom',
		cover: '#5eead4',
		preview: 'https://www.soundhelix.com/examples/mp3/SoundHelix-Song-5.mp3',
	},

	{
		title: 'Starlit Echo',
		artist: 'Echo Bloom',
		cover: '#f9a8d4',
		preview: 'https://www.soundhelix.com/examples/mp3/SoundHelix-Song-6.mp3',
	},

	{
		title: 'Cinematic Sleep',
		artist: 'Night Arcade',
		cover: '#a78bfa',
		preview: 'https://www.soundhelix.com/examples/mp3/SoundHelix-Song-7.mp3',
	},

	{
		title: 'Blue Mirage',
		artist: 'Ocean Thread',
		cover: '#60a5fa',
		preview: 'https://www.soundhelix.com/examples/mp3/SoundHelix-Song-8.mp3',
	},

	{
		title: 'Soft Machines',
		artist: 'Velvet Bloom',
		cover: '#fbbf24',
		preview: 'https://www.soundhelix.com/examples/mp3/SoundHelix-Song-9.mp3',
	},

	{
		title: 'Sunset Tapes',
		artist: 'Mirror Run',
		cover: '#fb7185',
		preview: 'https://www.soundhelix.com/examples/mp3/SoundHelix-Song-10.mp3',
	},

	{
		title: 'Golden Loop',
		artist: 'Wave Theory',
		cover: '#f59e0b',
		preview: 'https://www.soundhelix.com/examples/mp3/SoundHelix-Song-11.mp3',
	},

	{
		title: 'Moonlit Signal',
		artist: 'Luma Blue',
		cover: '#38bdf8',
		preview: 'https://www.soundhelix.com/examples/mp3/SoundHelix-Song-12.mp3',
	},
] as const;

export type Track = (typeof playlistSongs)[number];
