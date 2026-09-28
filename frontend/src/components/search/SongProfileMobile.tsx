import { useAuth } from '@/src/context/AuthContext';
import { useAddMusicMutation, useLikeQuery, useManageLikeMutation } from '@/src/lib/fetcher/tanstack/user';
import { api } from '@/src/lib/fetcher/api/client';
import { OutputTrackDeezer } from '@/src/types/deezer/OutputDeezerTrack';
import { PlaylistOutput } from '@/src/types/playlist/PlaylistOutput';
import { Track } from '@/src/types/track/track';
import { Clock3, Heart, ListPlus, Play, TrendingUp } from 'lucide-react-native';
import React, { useEffect, useState } from 'react';
import { Image, Modal, Pressable, View } from 'react-native';
import { SeparatorFull } from '../ui/separator';
import { ThemedText } from '../utils/themed-text';
import { styles } from './SongProfileMobile.styles';

interface SongProfileProps {
	song: OutputTrackDeezer;
	onPlay?: () => void;
	onArtistPress?: (artistId: string | number) => void;
	onAlbumPress?: (albumId: string | null) => void;
	playlists?: PlaylistOutput[];
	onAddToQueue?: (song: OutputTrackDeezer) => void;
}

export function SongProfileMobile({
	song,
	onPlay,
	onArtistPress,
	onAlbumPress,
	playlists = [],
	onAddToQueue,
}: SongProfileProps) {
	const { token } = useAuth();
	const { data: likeData } = useLikeQuery(token ?? '', song.deezerCUID);
	const likeMutation = useManageLikeMutation();
	const addMusicMutation = useAddMusicMutation();
	const [music, setMusic] = useState<Track | null>(null);
	const [playlistPickerOpen, setPlaylistPickerOpen] = useState(false);

	useEffect(() => {
		let mounted = true;
		api.deezer.music.music(Number(song.deezerCUID)).then((response) => {
			if (mounted) setMusic(response.data ?? null);
		});
		return () => {
			mounted = false;
		};
	}, [song.deezerCUID]);

	if (!music)
		return (
			<View style={styles.container}>
				<ThemedText>Chargement...</ThemedText>
			</View>
		);

	return (
		<View style={styles.container}>
			<Pressable style={styles.albumButton} onPress={() => onAlbumPress?.(music.album?.deezerCUID ?? null)}>
				<ThemedText style={styles.albumTitle} numberOfLines={1}>
					{music.album?.title ?? 'Album'}
				</ThemedText>
			</Pressable>
			<View style={styles.coverContainer}>
				{music.album?.coverMedium && <Image source={{ uri: music.album.coverMedium }} style={styles.cover} />}
			</View>
			<View style={styles.titleContainer}>
				<ThemedText style={styles.title}>{music.title}</ThemedText>
			</View>
			<View style={styles.artistsContainer}>
				{music.artists.map((artist, index) => (
					<Pressable
						key={`${artist.deezerCUID}-${index}`}
						style={styles.artistWrapper}
						onPress={() => onArtistPress?.(artist.deezerCUID)}
					>
						<ThemedText style={styles.artist}>
							{artist.name}
							{index < music.artists.length - 1 ? ', ' : ''}
						</ThemedText>
					</Pressable>
				))}
			</View>
			<SeparatorFull />
			<View style={styles.actions}>
				<Pressable
					style={styles.actionButton}
					onPress={() => token && likeMutation.mutate({ token, trackId: song.deezerCUID })}
					accessibilityLabel="Like this music"
				>
					<Heart
						size={22}
						color={likeData ? '#ff6b8a' : '#fff'}
						fill={likeData ? '#ff6b8a' : 'transparent'}
					/>
				</Pressable>
				<Pressable style={styles.playButton} onPress={onPlay} accessibilityLabel="Play this music">
					<Play size={23} color="#fff" fill="#fff" />
				</Pressable>
				<Pressable
					style={styles.actionButton}
					onPress={() => setPlaylistPickerOpen(true)}
					accessibilityLabel="Add to playlist"
				>
					<ListPlus size={23} color="#fff" />
				</Pressable>
			</View>
			<Pressable style={styles.queueButton} onPress={() => onAddToQueue?.(song)}>
				<ListPlus size={18} color="#fff" />
				<ThemedText style={styles.queueText}>Ajouter à la file d&apos;attente</ThemedText>
			</Pressable>
			<SeparatorFull />
			<View style={styles.stats}>
				<ThemedText style={styles.statLabel}>{formatDuration(music.duration)}</ThemedText>
				<Clock3 size={15} color="rgba(255,255,255,0.55)" />
				<ThemedText style={styles.statLabel}>
					{music.releaseDate ? new Date(music.releaseDate).toLocaleDateString('fr-FR') : 'Date inconnue'}
				</ThemedText>
				<TrendingUp size={15} color="rgba(255,255,255,0.55)" />
			</View>
			<Modal
				visible={playlistPickerOpen}
				transparent
				animationType="fade"
				onRequestClose={() => setPlaylistPickerOpen(false)}
			>
				<Pressable style={styles.pickerBackdrop} onPress={() => setPlaylistPickerOpen(false)}>
					<View style={styles.playlistPicker}>
						<ThemedText style={styles.playlistPickerTitle}>Ajouter à une playlist</ThemedText>
						{playlists.map((playlist) => (
							<Pressable
								key={playlist.id}
								style={styles.playlistPickerItem}
								onPress={() => {
									if (token)
										addMusicMutation.mutate({
											token,
											playlistId: playlist.id,
											trackId: song.deezerCUID,
										});
									setPlaylistPickerOpen(false);
								}}
							>
								<ThemedText style={styles.playlistPickerText}>{playlist.name}</ThemedText>
							</Pressable>
						))}
					</View>
				</Pressable>
			</Modal>
		</View>
	);
}

function formatDuration(value: number) {
	const minutes = Math.floor(value / 60);
	return `${minutes}:${String(value % 60).padStart(2, '0')}`;
}
