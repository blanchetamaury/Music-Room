import {
	Banana,
	Clock3,
	FaceAngry,
	FaceNeutral,
	FaceSlightlyFrowningIcon,
	FaceSlightlySmiling,
	FaceSlightlySmilingPlus,
	Headphones,
	TrendingUp,
} from 'lucide-react-native';
import { Image, StyleSheet, View } from 'react-native';

import { api } from '@/src/lib/api/client';
import { DeezerTrack } from '@/src/types/deezer/deezer';
import { useEffect, useState } from 'react';
import { ThemedText } from '../themed-text';
import { HoverText } from '../ui/hoverText';
import { SeparatorFull } from '../ui/separator';

interface SongProfileProps {
	song: DeezerTrack;

	onArtistPress?: (artistId: string | number) => void;

	onAlbumPress?: (albumId: string | null) => void;
}

interface ApiResponse<T> {
    success: boolean;
    message?: string;
    data?: T;
}

interface TrackPayload {
    track: DeezerTrack;
}

function getRankIcon(rank?: number | null) {
	if (!rank) {
		return null;
	}

	const n = Number(rank);

	if (n < 200_000) {
		return <FaceAngry size={17} color="rgba(255,255,255,0.45)" />;
	}

	if (n < 400_000) {
		return <FaceSlightlyFrowningIcon size={17} color="rgba(255,255,255,0.55)" />;
	}

	if (n < 600_000) {
		return <FaceNeutral size={17} color="rgba(255,255,255,0.65)" />;
	}

	if (n < 800_000) {
		return <FaceSlightlySmiling size={17} color="rgba(255,255,255,0.75)" />;
	}

	return <FaceSlightlySmilingPlus size={17} color="rgba(255,255,255,0.9)" />;
}

function formatReleaseDate(date?: string) {
	if (!date) {
		return 'Unknown date';
	}

	const parsedDate = new Date(date);

	if (Number.isNaN(parsedDate.getTime())) {
		return date;
	}

	return parsedDate.toLocaleDateString('fr-FR', {
		day: 'numeric',
		month: 'short',
		year: 'numeric',
	});
}

export function SongProfile({ song, onArtistPress, onAlbumPress }: SongProfileProps) {
    const [music, setMusic] = useState<DeezerTrack | null>(null);
    const [loading, setLoading] = useState<boolean>(true);
    const [error, setError] = useState<string | null>(null);

    useEffect(() => {
        let isMounted = true;

        const loadMusic = async () => {
            try {
                setLoading(true);
                setError(null);

                const data: ApiResponse<TrackPayload> =
                    await api.deezer.music.music(Number(song.id));
					
					const track = data.data?.track;
					console.log(track);

                if (!track) {
                    console.warn('[SongProfile] No track returned');
                    if (isMounted) setError('No track returned');
                    return;
                }

                if (isMounted) {
                    setMusic(track);
                }
            } catch (err) {
                console.error('[SongProfile] failed to load track:', err);
                if (isMounted) setError('Failed to load track');
            } finally {
                if (isMounted) setLoading(false);
            }
        };

        loadMusic();

        return () => {
            isMounted = false; // évite un setState après unmount
        };
    }, [song.id]);

    if (loading) {
        return (
            <View style={styles.container}>
                <ThemedText>Chargement...</ThemedText>
            </View>
        );
    }

    if (error || !music) {
        return (
            <View style={styles.container}>
                <ThemedText>{error ?? 'Aucune donnée'}</ThemedText>
            </View>
        );
    }

    const albumName = music.album?.title ?? 'Album';

    return (
        <View style={styles.container}>
            <View style={styles.header}>
                {music.album?.coverBig && (
                    <Image source={{ uri: music.album.coverBig }} style={styles.cover} />
                )}

                <View style={styles.info}>
                    <View style={styles.titleRow}>
                        <ThemedText style={styles.title}>{music.title}</ThemedText>
                        {music.explicit === true && <Banana size={20} color="rgba(255,255,255,0.7)" />}
                    </View>

                    <View style={styles.metadata}>
                        <HoverText
                            style={styles.artist}
                            onPress={() => {
                                onArtistPress?.(music.artist?.[0]?.deezerCUID ?? '');
                            }}
                        >
                            {music.artist?.[0]?.name ?? 'Unknown artist'}
                        </HoverText>

                        <ThemedText style={styles.dot}>●</ThemedText>

                        <HoverText
                            style={styles.album}
                            onPress={() => {
                                onAlbumPress?.(music.album?.deezerCUID ?? null);
                            }}
                        >
                            {albumName}
                        </HoverText>

                        <ThemedText style={styles.dot}>●</ThemedText>

                        <ThemedText style={styles.releaseDate}>
                            {formatReleaseDate(music.releaseDate?.toString())}
                        </ThemedText>
                    </View>

                    <SeparatorFull />

                    <View style={styles.stats}>
                        <View style={styles.statItem}>
                            <Headphones size={15} color="rgba(255,255,255,0.6)" />
                            <ThemedText style={styles.stat}>{music.bpm}</ThemedText>
                        </View>

                        <ThemedText style={styles.dot}>●</ThemedText>

                        <View style={styles.statItem}>
                            <Clock3 size={15} color="rgba(255,255,255,0.6)" />
                            <ThemedText style={styles.stat}>{formatDuration(music.duration)}</ThemedText>
                        </View>

                        <ThemedText style={styles.dot}>●</ThemedText>

                        <View style={styles.statItem}>
                            <TrendingUp size={15} color="rgba(255,255,255,0.6)" />
                            <ThemedText style={styles.stat}>{'Popularity: '}</ThemedText>
                            {getRankIcon(music.rank)}
                        </View>
                    </View>
                </View>
            </View>
        </View>
    );
}

function formatDuration(duration?: string | number) {
	if (!duration) {
		return '--:--';
	}

	const n = Number(duration);
	const minutes = Math.floor(n / 60);
	const seconds = n % 60;

	return `${minutes}:${seconds.toString().padStart(2, '0')}`;
}

const styles = StyleSheet.create({
	container: {
		padding: 32,
	},

	header: {
		flexDirection: 'row',
		alignItems: 'flex-start',
	},

	cover: {
		width: 180,
		height: 180,
		borderRadius: 18,
		marginRight: 24,
	},

	info: {
		flex: 1,
		justifyContent: 'center',
		paddingTop: 8,
	},

	titleRow: {
		flexDirection: 'row',
		alignItems: 'center',
		gap: 8,
		marginBottom: 12,
	},

	title: {
		fontSize: 28,
		fontWeight: '700',
	},

	metadata: {
		flexDirection: 'row',
		alignItems: 'center',
		flexWrap: 'wrap',
		gap: 8,
	},

	artist: {
		fontSize: 15,
		color: 'rgba(255,255,255,0.85)',
	},

	album: {
		fontSize: 15,
		color: 'rgba(255,255,255,0.85)',
	},

	releaseDate: {
		fontSize: 15,
		color: 'rgba(255,255,255,0.55)',
	},

	dot: {
		fontSize: 7,
		color: 'rgba(255,255,255,0.4)',
	},

	stats: {
		flexDirection: 'row',
		alignItems: 'center',
		flexWrap: 'wrap',
		gap: 10,
		marginTop: 20,
	},

	statItem: {
		flexDirection: 'row',
		alignItems: 'center',
		gap: 6,
	},

	stat: {
		fontSize: 14,
		color: 'rgba(255,255,255,0.7)',
	},
});
