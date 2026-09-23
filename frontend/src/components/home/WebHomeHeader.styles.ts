import { StyleSheet } from 'react-native';

export const styles = StyleSheet.create({
	header: {
		zIndex: 10,
		width: '100%',
		minHeight: 58,
		paddingHorizontal: 22,
		paddingTop: 12,
		flexDirection: 'row',
		alignItems: 'center',
		justifyContent: 'space-between',
	},
	iconButton: {
		width: 40,
		height: 40,
		alignItems: 'center',
		justifyContent: 'center',
		borderRadius: 20,
		backgroundColor: 'rgba(0,0,0,0.35)',
	},
	profileButton: {
		width: 40,
		height: 40,
		alignItems: 'center',
		justifyContent: 'center',
		borderRadius: 20,
		backgroundColor: 'rgba(0,0,0,0.35)',
	},
	avatar: {
		width: 30,
		height: 30,
		borderRadius: 15,
	},
	menu: {
		position: 'absolute',
		top: 48,
		left: 0,
		width: 150,
		paddingVertical: 6,
		borderRadius: 10,
		backgroundColor: '#171a26',
		borderWidth: 1,
		borderColor: 'rgba(255,255,255,0.12)',
		shadowColor: '#000',
		shadowOpacity: 0.3,
		shadowRadius: 12,
		shadowOffset: { width: 0, height: 6 },
	},
	menuItem: {
		paddingHorizontal: 14,
		paddingVertical: 10,
	},
	menuText: {
		color: 'rgba(255,255,255,0.75)',
		fontSize: 14,
	},
	menuTextActive: {
		color: '#fff',
		fontWeight: '700',
	},
});
