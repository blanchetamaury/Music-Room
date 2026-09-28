import { StyleSheet } from 'react-native';

export const styles = StyleSheet.create({
	navBar: {
		position: 'absolute',
		left: 0,
		right: 0,
		bottom: 0,
		minHeight: 82,
		maxHeight: 82,
		paddingHorizontal: 14,
		paddingTop: 12,
		paddingBottom: 18,
		zIndex: 30,
		borderTopLeftRadius: 28,
		borderTopRightRadius: 28,
	},
	navBarContent: {
		flexDirection: 'row',
		alignItems: 'center',
		justifyContent: 'space-around',
		width: '100%',
		height: '100%',
	},
	navButton: {
		width: 44,
		height: 44,
		borderRadius: 22,
		alignItems: 'center',
		justifyContent: 'center',
	},
	navButtonActive: {
		backgroundColor: 'rgba(255,255,255,0.12)',
		borderWidth: 1,
		borderColor: 'rgba(255,255,255,0.26)',
	},
	navIndicator: {
		position: 'absolute',
		bottom: 4,
		width: 6,
		height: 6,
		borderRadius: 3,
		backgroundColor: '#fff',
		alignSelf: 'center',
	},
});
