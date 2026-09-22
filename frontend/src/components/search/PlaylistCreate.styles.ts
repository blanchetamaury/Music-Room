import { StyleSheet } from 'react-native';

export const styles = StyleSheet.create({
	container: {
		width: '100%',
		padding: 20,
		flexDirection: 'row',
		alignItems: 'flex-start',
		gap: 25,
		minWidth: 0
	},
	leftColumn: {
		width: 128,
		flexShrink: 0,
		alignItems: 'stretch',
		gap: 12
	},
	imageContainer: {
		width: 128,
		height: 128,
		borderRadius: 16,
		overflow: 'hidden',
		backgroundColor: 'rgba(255,255,255,0.08)',
		borderWidth: 1,
		borderColor: 'rgba(255,255,255,0.12)',
	},
	image: {
		width: '100%',
		height: '100%'
	},
	imagePlaceholder: {
		width: '100%',
		height: '100%',
		alignItems: 'center',
		justifyContent: 'center',
		backgroundColor: 'rgba(255,255,255,0.05)',
	},
	placeholderText: {
		fontSize: 12,
		color: 'rgba(255,255,255,0.35)'
	},
	visibility: {
		width: '100%',
		minHeight: 38,
		paddingHorizontal: 10,
		borderRadius: 10,
		flexDirection: 'row',
		alignItems: 'center',
		justifyContent: 'space-between',
		backgroundColor: 'rgba(255,255,255,0.06)',
		borderWidth: 1,
		borderColor: 'rgba(255,255,255,0.1)',
	},
	visibilityText: {
		fontSize: 12,
		fontWeight: '600',
		color: 'rgba(255,255,255,0.7)'
	},
	visibilityButton: {
		width: 28,
		height: 28,
		borderRadius: 8,
		alignItems: 'center',
		justifyContent: 'center',
		backgroundColor: 'rgba(255,255,255,0.08)',
	},
	visibilityButtonActive: {
		backgroundColor: 'rgba(255,255,255,0.14)'
	},
	form: {
		flex: 1,
		minWidth: 0,
		flexShrink: 1,
		gap: 10
	},
	inputForm: {
		borderRadius: 10,
		backgroundColor: 'rgba(255,255,255,0.08)',
		borderWidth: 1
	},
	addButton: {
		width: '100%',
		minHeight: 38,
		borderRadius: 10,
		alignItems: 'center',
		justifyContent: 'center',
		backgroundColor: '#ffffff',
	},
	addText: {
		fontSize: 13,
		fontWeight: '700',
		color: '#000000'
	},
});
