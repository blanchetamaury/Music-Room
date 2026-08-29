import { Banana, EllipsisVertical, Heart } from 'lucide-react-native';
import { Image, Pressable, StyleSheet, View } from 'react-native';

import LiquidGlass from '../../LiquidGlass';
import { ThemedText } from '../../themed-text';
import { useEffect, useState } from 'react';
import { Like } from '@/src/types/user/like';
import { api } from '@/src/lib/api/client';
import { useAuth } from '@/src/context/AuthContext';
import { OutputTrackDeezer } from '@/src/types/deezer/OutputDeezerTrack';

interface SongDisplayProps {
	song: OutputTrackDeezer;
	onPress?: () => void;
	onArtistPress?: (artistId: string | number) => void;
	onAlbumPress?: (albumId: string | number) => void;
	onLike?: (value: boolean) => void;
}

const DEBUG = false;

const debugBox = (color: string) => {
	if (!DEBUG) {
		return {
			borderWidth: 0,
		};
	}

	return {
		borderWidth: 2,
		borderColor: color,
		backgroundColor: `${color}22`,
	};
};

export function SongDisplayMobile(props: SongDisplayProps) {
	const [isLike, setIsLike] = useState<boolean>(false);
	const [Like, setLike] = useState<Like>();
	const { token } = useAuth();

	useEffect(() => {
		const findLike = async () => {
			const value = await api.user.like.like(props.song.deezerCUID, token ?? '');
			if (value.data) {
				setLike(value.data);
				if (value.data != null) setIsLike(true);
			}
		};
		findLike();
	}, []);

	return (
		<Pressable onPress={props.onPress} style={[styles.wrapper, debugBox('#ff0000')]}>
			<LiquidGlass
				style={[styles.songCard, debugBox('#00ff00')]}
				contentStyle={[styles.songCardContent, debugBox('#0000ff')]}
				intensity={0}
				radius={22}
				topLeftRadius={20}
				topRightRadius={20}
				bottomLeftRadius={20}
				bottomRightRadius={20}
			>
				<Image
					source={{ uri: props.song.album.CoverMedium ?? '' }}
					resizeMode="cover"
					style={[styles.songCover, debugBox('#09ff00')]}
				/>

				<View style={[styles.mainRow, debugBox('#ffc400')]}>
					<View style={[styles.songInfo, debugBox('#00ffff')]}>
						<View style={[styles.songTitleRow, debugBox('#ff8800')]}>
							<ThemedText
								style={[styles.songTitle, debugBox('#ff0000')]}
								numberOfLines={1}
								ellipsizeMode="tail"
							>
								{props.song.title}
							</ThemedText>

							{props.song.explicit === true && (
								<Banana
									size={14}
									color="rgba(255,255,255,0.7)"
									style={[styles.explicitIcon, debugBox('#ff00ff')]}
								/>
							)}
						</View>

						<ThemedText
							style={[styles.songArtist, debugBox('#00ff00')]}
							numberOfLines={1}
							ellipsizeMode="tail"
						>
							{props.song.artist[0].name}
						</ThemedText>
					</View>

					<View style={[styles.actions, debugBox('#ff0088')]}>
						<Pressable
							style={[styles.iconButton, debugBox('#0088ff')]}
							onPress={(event) => {
								event.stopPropagation();
								if (isLike == false) {
									api.user.like.create(props.song.deezerCUID, token ?? '');
									setIsLike(true);
									if (props.onLike) props.onLike(true);
								} else {
									api.user.like.delete(props.song.deezerCUID, token ?? '');
									setIsLike(false);
									if (props.onLike) props.onLike(true);
								}
							}}
						>
							{isLike == false ? (
								<Heart color="#fff" fill={'#ffffff65'} size={19} />
							) : (
								<Heart color="#ff0000be" size={19} fill={'#ff0000'} />
							)}
						</Pressable>

						<Pressable
							style={[styles.iconButton, debugBox('#8800ff')]}
							onPress={(event) => {
								event.stopPropagation();
							}}
							accessibilityLabel="More options"
						>
							<EllipsisVertical color="#fff" size={20} />
						</Pressable>
					</View>
				</View>
			</LiquidGlass>
		</Pressable>
	);
}

const styles = StyleSheet.create({
	wrapper: {
		width: '100%',
	},

	songCard: {
		width: '100%',
		minHeight: 74,
		backgroundColor: '#000000a1',
	},

	songCardContent: {
		minHeight: 74,
		flexDirection: 'row',
		alignItems: 'center',
		paddingHorizontal: 10,
		paddingVertical: 10,
		gap: 7,
		minWidth: 0,
	},

	songCover: {
		width: 52,
		height: 52,
		borderRadius: 14,
		flexShrink: 0,
	},

	mainRow: {
		flex: 1,
		flexDirection: 'row',
		minWidth: 0,
	},

	songInfo: {
		flex: 3,
		minWidth: 0,
		flexShrink: 1,
		justifyContent: 'flex-start',
	},

	songTitleRow: {
		width: '100%',
		flexDirection: 'row',
		alignItems: 'center',
		minWidth: 0,
		marginBottom: 3,
	},

	songTitle: {
		minWidth: 0,
		flexShrink: 1,
		color: '#fff',
		fontSize: 15,
		fontWeight: '600',
	},

	explicitIcon: {
		marginLeft: 5,
		flexShrink: 0,
	},

	artistAlbumRow: {
		flexDirection: 'row',
		alignItems: 'center',
		width: '100%',
		minWidth: 0,
	},

	songArtist: {
		flex: 1,
		minWidth: 0,
		color: 'rgba(255,255,255,0.72)',
		fontSize: 11,
		lineHeight: 15,
	},

	albumText: {
		flex: 3,
		minWidth: 0,
		color: 'rgba(255,255,255,0.48)',
		textAlign: 'center',
		textAlignVertical: 'center',
		fontSize: 10,
		lineHeight: 13,
		paddingHorizontal: 5,
	},

	actions: {
		flex: 1,
		minWidth: 0,
		flexShrink: 1,
		flexDirection: 'row',
		justifyContent: 'flex-end',
		paddingRight: 10,
		alignItems: 'center',
		gap: 3,
	},

	songDuration: {
		minWidth: 0,
		flexShrink: 0,
		color: '#fff',
		fontSize: 12,
		marginLeft: 2,
	},

	iconButton: {
		width: 26,
		height: 34,
		alignItems: 'center',
		justifyContent: 'center',
		flexShrink: 0,
	},
});
