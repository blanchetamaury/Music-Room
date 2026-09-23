import { StyleSheet } from 'react-native';

export const styles = StyleSheet.create({
	songSection: {
		flex: 1,
		minWidth: 0,
		borderRadius: 8,
		backgroundColor: 'rgb(19, 19, 19)',
		padding: 10,
	},
	songListShell: {
		flex: 1,
		width: '100%',
		position: 'relative',
		borderTopLeftRadius: 15,
		borderTopRightRadius: 15,
		overflow: 'hidden',
	},
	songListScroll: {
		flex: 1,
	},
	songListContent: {
		gap: 10,
		paddingBottom: 170,
		borderRadius: 8,
		padding: 10,
	},
	loadingContainer: {
		flex: 1,
		minHeight: 180,
		alignItems: 'center' as const,
		justifyContent: 'center' as const,
		gap: 10,
	},
	loadingText: {
		fontSize: 13,
		color: 'rgba(255,255,255,0.5)',
	},
	sectionTitle: {
		color: '#fff',
		fontSize: 22,
		fontWeight: '700',
		marginBottom: 10,
		paddingLeft: 10,
	},
});
