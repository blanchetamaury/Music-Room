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
	homeContent: {
		flex: 1,
		width: '100%',
		paddingHorizontal: 0,
		paddingTop: 28,
		paddingBottom: 18,
		zIndex: 2,
	},
	separator: {
		height: 1,
		backgroundColor: 'rgba(255,255,255,0.15)',
		marginVertical: 14,
	},
	homeRoot: {
		flex: 1,
		width: '100%',
		backgroundColor: '#080b1a',
		overflow: 'hidden',
	},
	backgroundOverlay: {
		...StyleSheet.absoluteFillObject,
		backgroundColor: 'rgba(4, 7, 18, 0.7)',
	},
});
