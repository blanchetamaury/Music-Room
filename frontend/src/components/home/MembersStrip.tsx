import { ThemedText } from '@/src/components/utils/themed-text';
import { PlaylistMember, PlaylistOutput } from '@/src/types/playlist/PlaylistOutput';
import { Users } from 'lucide-react-native';
import React from 'react';
import { Image, ScrollView, View } from 'react-native';
import LiquidGlass from '../utils/LiquidGlass';
import { styles } from './HomeSections.styles';

interface MembersStripProps {
	playlist: PlaylistOutput | null;
}

const initials = (username: string): string => username.trim().charAt(0).toUpperCase() || '?';

export function MembersStrip({ playlist }: MembersStripProps) {
	const members = playlist?.members ?? [];
	const pending = members.filter((member) => !member.acceptedAt).length;

	return (
		<View style={styles.section}>
			<LiquidGlass
				style={styles.panel}
				contentStyle={styles.panelContent}
				intensity={16}
				radius={16}
				topLeftRadius={16}
				topRightRadius={16}
				bottomLeftRadius={16}
				bottomRightRadius={16}
			>
				<View style={styles.header}>
					<ThemedText style={styles.title}>Listening together</ThemedText>
					<Users size={16} color="rgba(255,255,255,0.6)" />
				</View>

				{members.length === 0 ? (
					<View style={styles.centered}>
						<ThemedText style={styles.stateText}>
							Nobody else here yet. Invite someone from the playlist to co-edit the queue.
						</ThemedText>
					</View>
				) : (
					<ScrollView horizontal showsHorizontalScrollIndicator={false}>
						{members.map((member) => (
							<Member key={member.id} member={member} />
						))}
					</ScrollView>
				)}

				{pending > 0 ? (
					<ThemedText style={[styles.miniCardHint, { marginTop: 8 }]}>
						{pending} pending invitation{pending > 1 ? 's' : ''}
					</ThemedText>
				) : null}
			</LiquidGlass>
		</View>
	);
}

function Member({ member }: { member: PlaylistMember }) {
	const waiting = !member.acceptedAt;

	return (
		<View style={styles.memberWrap}>
			{member.avatarUrl ? (
				<Image
					source={{ uri: member.avatarUrl }}
					style={[styles.avatar, waiting && { opacity: 0.4 }]}
					accessibilityIgnoresInvertColors
				/>
			) : (
				<View style={[styles.avatar, styles.avatarFallback, waiting && { opacity: 0.4 }]}>
					<ThemedText style={styles.initial}>{initials(member.username)}</ThemedText>
				</View>
			)}
			<ThemedText style={styles.memberName} numberOfLines={1}>
				{member.username}
			</ThemedText>
			<ThemedText style={styles.memberRole}>{waiting ? 'pending' : member.role}</ThemedText>
		</View>
	);
}
