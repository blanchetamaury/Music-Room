import { StyleSheet } from 'react-native';

export const styles = StyleSheet.create({
	wrapper: {
		width: '100%'
	},
	songCard: {
		width: '100%',
		minHeight: 74,
		backgroundColor: '#000000a1'
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
		flexShrink: 0
	},
	mainRow: {
		flex: 1,
		flexDirection: 'row',
		minWidth: 0
	},
	songInfo: {
		flex: 3,
		minWidth: 0,
		flexShrink: 1,
		justifyContent: 'flex-start'
	},
	songTitleRow: {
		width: '100%',
		flexDirection: 'row',
		alignItems: 'center',
		minWidth: 0,
		marginBottom: 3
	},
	songTitle: {
		minWidth: 0,
		flexShrink: 1,
		color: '#fff',
		fontSize: 15,
		fontWeight: '600'
	},
	explicitIcon: {
		marginLeft: 5,
		flexShrink: 0
	},
	songArtist: {
		flex: 1,
		minWidth: 0,
		color: 'rgba(255,255,255,0.72)',
		fontSize: 11,
		lineHeight: 15
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
		flexShrink: 0
	},
	backdrop: {
		flex: 1,
		backgroundColor: 'rgba(0,0,0,0.15)'
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
		paddingVertical: 12
	},
	menuItemText: {
		color: '#fff',
		fontSize: 14
	},
	cover: {
		width: 48,
		height: 48,
		borderRadius: 10,
		marginRight: 14
	},
});
