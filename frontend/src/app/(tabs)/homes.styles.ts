import { StyleSheet } from 'react-native';

export const homeStyles = StyleSheet.create({
	content: {
		flex: 1,
		zIndex: 1,
	},
	page: {
		flex: 1,
		minHeight: 0,
	},
	pageContent: {
		flex: 1,
		alignItems: 'center',
		justifyContent: 'center',
		paddingHorizontal: 5,
		backgroundColor: '#0000',
	},
	pageTitle: {
		color: '#fff',
		fontSize: 32,
		fontWeight: '700',
	},
	profileContent: {
		flex: 1,
		width: '100%',
		paddingHorizontal: 20,
		paddingTop: 26,
		paddingBottom: 110,
	},
	profileCard: {
		width: '100%',
		maxWidth: 760,
		alignSelf: 'center',
		borderRadius: 16,
		borderWidth: 1,
		borderColor: 'rgba(255,255,255,0.08)',
		backgroundColor: 'rgba(19,19,22,0.88)',
		overflow: 'hidden',
	},
	profileGradient: {
		position: 'absolute',
		top: 0,
		left: 0,
		right: 0,
		height: 180,
	},
	profileCardContent: {
		padding: 22,
	},
	profileHeader: {
		flexDirection: 'row',
		alignItems: 'center',
		gap: 16,
	},
	profileAvatar: {
		width: 78,
		height: 78,
		borderRadius: 39,
		backgroundColor: 'rgba(62,207,255,0.18)',
	},
	profileAvatarFallback: {
		alignItems: 'center',
		justifyContent: 'center',
	},
	profileInitial: {
		color: '#3ECFFF',
		fontSize: 30,
		fontWeight: '800',
	},
	profileInfo: {
		flex: 1,
		minWidth: 0,
	},
	profileTitle: {
		color: '#fff',
		fontSize: 24,
		fontWeight: '700',
	},
	profileEmail: {
		color: 'rgba(255,255,255,0.58)',
		fontSize: 13,
		marginTop: 4,
	},
	profileDivider: {
		height: 1,
		backgroundColor: 'rgba(255,255,255,0.08)',
		marginVertical: 20,
	},
	profileMeta: {
		flexDirection: 'row',
		gap: 28,
	},
	profileMetaLabel: {
		color: 'rgba(255,255,255,0.45)',
		fontSize: 11,
		textTransform: 'uppercase',
		letterSpacing: 1,
	},
	profileMetaValue: {
		color: '#fff',
		fontSize: 14,
		fontWeight: '600',
		marginTop: 4,
	},
	homeContent: {
		flex: 1,
		width: '100%',
		paddingHorizontal: 0,
		paddingTop: 28,
		zIndex: 2,
		borderRadius: 16,
		borderWidth: 1,
		borderColor: 'rgba(255,255,255,0.07)',
		backgroundColor: 'rgba(19,19,22,0.78)',
	},
	homeContentInner: {
		flex: 1,
		paddingHorizontal: 20,
	},
	separator: {
		height: 1,
		backgroundColor: 'rgba(255,255,255,0.15)',
		marginVertical: 14,
	},
	homeRoot: {
		flex: 1,
		width: '100%',
		backgroundColor: '#0A0A0C',
		overflow: 'hidden',
	},
	backgroundOverlay: {
		...StyleSheet.absoluteFillObject,
		backgroundColor: 'rgba(4, 7, 18, 0.7)',
	},
});
