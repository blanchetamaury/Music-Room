import AuthBackground from '@/src/components/auth/AuthBackground';
import LiquidGlass from '@/src/components/utils/LiquidGlass';
import { ThemedText } from '@/src/components/utils/themed-text';
import { useAuth } from '@/src/context/AuthContext';
import { LinearGradient } from 'expo-linear-gradient';
import { useRouter } from 'expo-router';
import { ArrowRight, Headphones, ListMusic, Radio, Sparkles } from 'lucide-react-native';
import React, { useEffect } from 'react';
import { Pressable, ScrollView, StyleSheet, useWindowDimensions, View } from 'react-native';

const features = [
	{ icon: Radio, title: 'Écoute en direct', text: 'Une salle musicale vivante, pensée pour écouter ensemble.' },
	{
		icon: ListMusic,
		title: 'Playlists partagées',
		text: 'Crée, organise et fais évoluer tes playlists avec ton groupe.',
	},
	{
		icon: Headphones,
		title: 'Tes goûts, partout',
		text: 'Retrouve tes morceaux favoris dans une expérience fluide.',
	},
];

export function LandingPage() {
	const router = useRouter();
	const { token, loading } = useAuth();
	const { width } = useWindowDimensions();
	const isDesktop = width >= 800;

	useEffect(() => {
		if (!loading && token) router.replace('/(tabs)/home');
	}, [loading, token, router]);

	if (loading || token) return null;

	return (
		<View style={styles.root}>
			<LinearGradient
				colors={['#070712', '#15102d', '#071820']}
				start={{ x: 0, y: 0 }}
				end={{ x: 1, y: 1 }}
				style={StyleSheet.absoluteFill}
			/>
			<AuthBackground />
			<View style={styles.tint} />
			<ScrollView contentContainerStyle={styles.scrollContent} showsVerticalScrollIndicator={false}>
				<View style={styles.navbar}>
					<View style={styles.brandMark}>
						<View style={styles.brandDot} />
						<ThemedText style={styles.brand}>MUSIC ROOM</ThemedText>
					</View>
					<Pressable onPress={() => router.push('/(auth)/login')} style={styles.navLogin}>
						<ThemedText style={styles.navLoginText}>Se connecter</ThemedText>
					</Pressable>
				</View>

				<View style={[styles.hero, isDesktop && styles.heroDesktop]}>
					<View style={[styles.heroCopy, isDesktop && styles.heroCopyDesktop]}>
						<View style={styles.eyebrow}>
							<Sparkles color="#56e0ff" size={14} />
							<ThemedText style={styles.eyebrowText}>LA MUSIQUE, ENSEMBLE</ThemedText>
						</View>
						<ThemedText style={[styles.title, isDesktop && styles.titleDesktop]}>
							Ta musique.{'\n'}Ton espace.{'\n'}Ton rythme.
						</ThemedText>
						<ThemedText style={styles.subtitle}>
							Music Room rassemble tes morceaux, tes amis et les moments qui méritent d&apos;être rejoués.
						</ThemedText>
						<View style={styles.actions}>
							<Pressable
								onPress={() => router.push('/(auth)/login?mode=register')}
								style={styles.primaryButton}
							>
								<ThemedText style={styles.primaryButtonText}>Commencer gratuitement</ThemedText>
								<ArrowRight color="#061018" size={18} />
							</Pressable>
							<Pressable onPress={() => router.push('/(auth)/login')} style={styles.secondaryButton}>
								<ThemedText style={styles.secondaryButtonText}>J&apos;ai déjà un compte</ThemedText>
							</Pressable>
						</View>
					</View>

					<LiquidGlass
						style={styles.featuredCard}
						contentStyle={styles.featuredContent}
						intensity={28}
						radius={20}
						topLeftRadius={20}
						topRightRadius={20}
						bottomLeftRadius={20}
						bottomRightRadius={20}
					>
						<View style={styles.featuredTop}>
							<View style={styles.equalizer}>
								<View style={[styles.bar, styles.barShort]} />
								<View style={[styles.bar, styles.barTall]} />
								<View style={[styles.bar, styles.barMedium]} />
								<View style={[styles.bar, styles.barShort]} />
							</View>
							<ThemedText style={styles.liveLabel}>LIVE SESSION</ThemedText>
						</View>
						<View style={styles.featuredArtwork}>
							<LinearGradient
								colors={['#b44dff', '#1e6bff', '#3ecfff']}
								start={{ x: 0, y: 0 }}
								end={{ x: 1, y: 1 }}
								style={StyleSheet.absoluteFill}
							/>
							<View style={styles.artworkCircle} />
							<View style={styles.artworkInner} />
						</View>
						<ThemedText style={styles.featuredTitle}>La bande-son du moment</ThemedText>
						<ThemedText style={styles.featuredMeta}>Écoute collective · maintenant</ThemedText>
						<View style={styles.progressTrack}>
							<View style={styles.progressFill} />
						</View>
					</LiquidGlass>
				</View>

				<View style={[styles.features, isDesktop && styles.featuresDesktop]}>
					{features.map(({ icon: Icon, title, text }) => (
						<LiquidGlass
							key={title}
							style={styles.featureCard}
							contentStyle={styles.featureContent}
							intensity={18}
							radius={14}
							topLeftRadius={14}
							topRightRadius={14}
							bottomLeftRadius={14}
							bottomRightRadius={14}
						>
							<View style={styles.featureIcon}>
								<Icon color="#56e0ff" size={19} />
							</View>
							<ThemedText style={styles.featureTitle}>{title}</ThemedText>
							<ThemedText style={styles.featureText}>{text}</ThemedText>
						</LiquidGlass>
					))}
				</View>
				<ThemedText style={styles.footer}>Une expérience musicale simple, sociale et à ton image.</ThemedText>
			</ScrollView>
		</View>
	);
}

const styles = StyleSheet.create({
	root: { flex: 1, backgroundColor: '#070712' },
	tint: { ...StyleSheet.absoluteFillObject, backgroundColor: 'rgba(5,7,18,0.42)' },
	scrollContent: { width: '100%', maxWidth: 1240, alignSelf: 'center', paddingHorizontal: 22, paddingBottom: 38 },
	navbar: { minHeight: 74, flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between' },
	brandMark: { flexDirection: 'row', alignItems: 'center', gap: 9 },
	brandDot: {
		width: 11,
		height: 11,
		borderRadius: 6,
		backgroundColor: '#56e0ff',
		shadowColor: '#56e0ff',
		shadowOpacity: 0.9,
		shadowRadius: 10,
	},
	brand: { color: '#fff', fontSize: 13, fontWeight: '800', letterSpacing: 2 },
	navLogin: { paddingHorizontal: 13, paddingVertical: 9 },
	navLoginText: { color: 'rgba(255,255,255,0.75)', fontSize: 13, fontWeight: '600' },
	hero: { paddingTop: 54, gap: 34 },
	heroDesktop: { minHeight: 500, flexDirection: 'row', alignItems: 'center', paddingTop: 30, gap: 70 },
	heroCopy: { maxWidth: 620 },
	heroCopyDesktop: { flex: 1 },
	eyebrow: { flexDirection: 'row', alignItems: 'center', gap: 8, marginBottom: 16 },
	eyebrowText: { color: '#56e0ff', fontSize: 11, fontWeight: '800', letterSpacing: 1.6 },
	title: { color: '#fff', fontSize: 46, lineHeight: 51, fontWeight: '800', letterSpacing: 0 },
	titleDesktop: { fontSize: 68, lineHeight: 71 },
	subtitle: { maxWidth: 500, color: 'rgba(255,255,255,0.68)', fontSize: 16, lineHeight: 25, marginTop: 22 },
	actions: { flexDirection: 'row', flexWrap: 'wrap', alignItems: 'center', gap: 11, marginTop: 28 },
	primaryButton: {
		minHeight: 48,
		flexDirection: 'row',
		alignItems: 'center',
		justifyContent: 'center',
		gap: 10,
		paddingHorizontal: 17,
		borderRadius: 11,
		backgroundColor: '#56e0ff',
	},
	primaryButtonText: { color: '#061018', fontSize: 13, fontWeight: '800' },
	secondaryButton: {
		minHeight: 48,
		justifyContent: 'center',
		paddingHorizontal: 13,
		borderRadius: 11,
		borderWidth: 1,
		borderColor: 'rgba(255,255,255,0.2)',
	},
	secondaryButtonText: { color: '#fff', fontSize: 13, fontWeight: '600' },
	featuredCard: {
		width: '100%',
		maxWidth: 360,
		alignSelf: 'center',
		borderWidth: 1,
		borderColor: 'rgba(255,255,255,0.14)',
		backgroundColor: 'rgba(13,15,30,0.72)',
	},
	featuredContent: { padding: 18 },
	featuredTop: { flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between' },
	equalizer: { height: 20, flexDirection: 'row', alignItems: 'flex-end', gap: 3 },
	bar: { width: 4, borderRadius: 2, backgroundColor: '#56e0ff' },
	barShort: { height: 8 },
	barTall: { height: 19 },
	barMedium: { height: 13 },
	liveLabel: { color: '#56e0ff', fontSize: 10, fontWeight: '800', letterSpacing: 1.2 },
	featuredArtwork: {
		height: 240,
		marginTop: 18,
		overflow: 'hidden',
		borderRadius: 14,
		alignItems: 'center',
		justifyContent: 'center',
	},
	artworkCircle: {
		width: 170,
		height: 170,
		borderRadius: 85,
		backgroundColor: 'rgba(255,255,255,0.17)',
		borderWidth: 1,
		borderColor: 'rgba(255,255,255,0.5)',
	},
	artworkInner: {
		position: 'absolute',
		width: 70,
		height: 70,
		borderRadius: 35,
		backgroundColor: '#07101e',
		borderWidth: 8,
		borderColor: 'rgba(255,255,255,0.8)',
	},
	featuredTitle: { color: '#fff', fontSize: 18, fontWeight: '700', marginTop: 16 },
	featuredMeta: { color: 'rgba(255,255,255,0.56)', fontSize: 12, marginTop: 5 },
	progressTrack: { height: 4, marginTop: 16, borderRadius: 2, backgroundColor: 'rgba(255,255,255,0.13)' },
	progressFill: { width: '58%', height: 4, borderRadius: 2, backgroundColor: '#56e0ff' },
	features: { gap: 11, marginTop: 46 },
	featuresDesktop: { flexDirection: 'row' },
	featureCard: {
		flex: 1,
		minHeight: 144,
		borderWidth: 1,
		borderColor: 'rgba(255,255,255,0.08)',
		backgroundColor: 'rgba(13,15,30,0.58)',
	},
	featureContent: { padding: 16 },
	featureIcon: {
		width: 34,
		height: 34,
		borderRadius: 10,
		alignItems: 'center',
		justifyContent: 'center',
		backgroundColor: 'rgba(86,224,255,0.12)',
		marginBottom: 12,
	},
	featureTitle: { color: '#fff', fontSize: 15, fontWeight: '700' },
	featureText: { color: 'rgba(255,255,255,0.56)', fontSize: 12, lineHeight: 18, marginTop: 6 },
	footer: { color: 'rgba(255,255,255,0.38)', fontSize: 11, textAlign: 'center', marginTop: 30 },
});
