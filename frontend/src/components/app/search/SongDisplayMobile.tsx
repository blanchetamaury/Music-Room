import { Banana, EllipsisVertical, Heart, Plus, ListMusic, Share2 } from 'lucide-react-native';
import { Image, Modal, Pressable, StyleSheet, View, Dimensions } from 'react-native';
import LiquidGlass from '../../LiquidGlass';
import { ThemedText } from '../../themed-text';
import { useEffect, useRef, useState } from 'react';
import { api } from '@/src/lib/api/client';
import { useAuth } from '@/src/context/AuthContext';
import { OutputTrackDeezer } from '@/src/types/deezer/OutputDeezerTrack';
import { PlaylistOutput } from '@/src/types/playlist/PlaylistOutput';

interface SongDisplayProps {
    song: OutputTrackDeezer;
    onPress?: () => void;
    onArtistPress?: (artistId: string | number) => void;
    onAlbumPress?: (albumId: string | number) => void;
    onLike?: (value: boolean) => void;
	playlists?: PlaylistOutput[];
}

const DEBUG = false;

const debugBox = (color: string) => {
    if (!DEBUG) return { borderWidth: 0 };
    return { borderWidth: 2, borderColor: color, backgroundColor: `${color}22` };
};

export function SongDisplayMobile(props: SongDisplayProps) {
    const [isLike, setIsLike] = useState<boolean>(false);
    const [displayMenu, setDisplayMenu] = useState<boolean>(false);
    const [menuPosition, setMenuPosition] = useState({ top: 0, right: 0 });
	const [displayAddToPlaylistMenu, setDisplayAddToPlaylistMenu ] = useState<boolean>(false);
    const { token } = useAuth();

    const menuButtonRef = useRef<View>(null);

    useEffect(() => {
        const findLike = async () => {
            const value = await api.user.like.like(props.song.deezerCUID, token ?? '');
            if (value.data) setIsLike(true);
        };
        findLike();
    }, [props.song.deezerCUID, token]);

    const openMenu = () => {
        menuButtonRef.current?.measureInWindow((x, y, width, height) => {
            const screenWidth = Dimensions.get('window').width;
            setMenuPosition({
                top: y + height + 4,
                right: screenWidth - (x + width),
            });
            setDisplayMenu(true);
        });
    };

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
                                if (isLike === false) {
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
                            {isLike === false ? (
                                <Heart color="#fff" fill={'#ffffff65'} size={19} />
                            ) : (
                                <Heart color="#ff0000be" size={19} fill={'#ff0000'} />
                            )}
                        </Pressable>

                        <Pressable
                            ref={menuButtonRef}
                            style={[styles.iconButton, debugBox('#8800ff')]}
                            onPress={(event) => {
                                event.stopPropagation();
                                openMenu();
                            }}
                            accessibilityLabel="More options"
                        >
                            <EllipsisVertical color="#fff" size={20} />
                        </Pressable>
                    </View>
                </View>
            </LiquidGlass>

            <Modal
                visible={displayMenu}
                transparent
                animationType="fade"
                onRequestClose={() => setDisplayMenu(false)}
            >
                <Pressable style={styles.backdrop} onPress={() => setDisplayMenu(false)}>
                    <View
                        style={[
                            styles.dropdownMenu,
                            { top: menuPosition.top, right: menuPosition.right },
                        ]}
                    >
                        <Pressable
                            style={styles.menuItem}
                            onPress={() => {
                                setDisplayMenu(false);
								setDisplayAddToPlaylistMenu(true);
                            }}
                        >
                            <Plus color="#fff" size={18} />
                            <ThemedText style={styles.menuItemText}>Ajouter à une playlist</ThemedText>
                        </Pressable>

                        <Pressable
                            style={styles.menuItem}
                            onPress={() => {
                                setDisplayMenu(false);
                                
                            }}
                        >
                            <ListMusic color="#fff" size={18} />
                            <ThemedText style={styles.menuItemText}>Ajouter à la file d'attente</ThemedText>
                        </Pressable>

                        <Pressable
                            style={styles.menuItem}
                            onPress={() => {
                                setDisplayMenu(false);
                                // logique partage
                            }}
                        >
                            <Share2 color="#fff" size={18} />
                            <ThemedText style={styles.menuItemText}>Partager</ThemedText>
                        </Pressable>
                    </View>
                </Pressable>
            </Modal>
			<Modal
				visible={displayAddToPlaylistMenu}
				transparent
				animationType="fade"
				onRequestClose={() => setDisplayAddToPlaylistMenu(false)}
			>
				<Pressable style={styles.backdrop} onPress={() => setDisplayAddToPlaylistMenu(false)}>
					<View
						style={[
							styles.dropdownMenu,
							{ top: menuPosition.top, right: menuPosition.right },
						]}
					>
						{
							props.playlists && props.playlists.map((row) => (
									<Pressable
										style={styles.menuItem}
										onPress={() => {
											setDisplayAddToPlaylistMenu(false);
											api.user.playlist.addMusic(token ?? '', row.name, props.song.deezerCUID);
										}}
									>
										<Image source={{ uri: row.cover }} style={styles.cover}></Image>
										<ThemedText style={styles.menuItemText}>{row.name}</ThemedText>
									</Pressable>
							))
						}
					</View>
				</Pressable>
			</Modal>
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

    songArtist: {
        flex: 1,
        minWidth: 0,
        color: 'rgba(255,255,255,0.72)',
        fontSize: 11,
        lineHeight: 15,
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

    iconButton: {
        width: 26,
        height: 34,
        alignItems: 'center',
        justifyContent: 'center',
        flexShrink: 0,
    },

    backdrop: {
        flex: 1,
        backgroundColor: 'rgba(0,0,0,0.15)',
    },

    dropdownMenu: {
        position: 'absolute',
        backgroundColor: '#1c1c1eee',
        borderRadius: 14,
        paddingVertical: 6,
        minWidth: 220,
        shadowColor: '#000',
        shadowOpacity: 0.4,
        shadowRadius: 10,
        shadowOffset: { width: 0, height: 4 },
        elevation: 8,
    },

    menuItem: {
        flexDirection: 'row',
        alignItems: 'center',
        gap: 10,
        paddingHorizontal: 14,
        paddingVertical: 12,
    },

    menuItemText: {
        color: '#fff',
        fontSize: 14,
    },

	cover: {
		width: 48,
		height: 48,
		borderRadius: 10,
		marginRight: 14,
	},
});