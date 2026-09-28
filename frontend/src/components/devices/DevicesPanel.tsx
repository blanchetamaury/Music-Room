import { ThemedText } from '@/src/components/utils/themed-text';
import { useAuth } from '@/src/context/AuthContext';
import {
	useDelegateDeviceMutation,
	useDevicesQuery,
	useRegisterDeviceMutation,
	useRevokeDeviceDelegationMutation,
	useRevokeDeviceMutation,
} from '@/src/lib/fetcher/tanstack/device';
import { Device } from '@/src/types/device/Device';
import { Monitor, Plus, RefreshCw, Shield, Trash2, UserPlus, X } from 'lucide-react-native';
import React, { useState } from 'react';
import { ActivityIndicator, Modal, Platform, Pressable, StyleSheet, TextInput, View } from 'react-native';

const PLATFORM_LABELS: Record<Device['platform'], string> = {
	ios: 'iOS',
	android: 'Android',
	web: 'Web',
};

export function DevicesPanel() {
	const { token } = useAuth();
	const devicesQuery = useDevicesQuery(token);
	const registerMutation = useRegisterDeviceMutation();
	const revokeMutation = useRevokeDeviceMutation();
	const delegateMutation = useDelegateDeviceMutation();
	const revokeDelegationMutation = useRevokeDeviceDelegationMutation();

	const [showRegister, setShowRegister] = useState(false);
	const [showDelegate, setShowDelegate] = useState<Device | null>(null);
	const [deviceName, setDeviceName] = useState('');
	const [appVersion, setAppVersion] = useState('');
	const [delegateUserId, setDelegateUserId] = useState('');

	const devices = devicesQuery.data ?? [];

	const handleRegister = () => {
		if (!token || !deviceName.trim()) return;

		registerMutation.mutate(
			{
				token,
				deviceName: deviceName.trim(),
				platform: Platform.OS === 'ios' || Platform.OS === 'android' ? Platform.OS : 'web',
				appVersion: appVersion.trim() || 'unknown',
			},
			{
				onSuccess: () => {
					setShowRegister(false);
					setDeviceName('');
					setAppVersion('');
				},
			}
		);
	};

	const handleDelegate = () => {
		if (!token || !showDelegate || !delegateUserId.trim()) return;

		delegateMutation.mutate(
			{
				token,
				deviceId: showDelegate.id,
				delegateUserId: delegateUserId.trim(),
				permission: 'CONTROL',
			},
			{
				onSuccess: () => {
					setShowDelegate(null);
					setDelegateUserId('');
				},
			}
		);
	};

	const handleRevoke = (device: Device) => {
		if (!token) return;
		revokeMutation.mutate({ token, deviceId: device.id });
	};

	const handleRevokeDelegation = (device: Device, delegateId: string) => {
		if (!token) return;
		revokeDelegationMutation.mutate({ token, deviceId: device.id, delegateUserId: delegateId });
	};

	const errorMessage =
		devicesQuery.error?.message ??
		registerMutation.error?.message ??
		revokeMutation.error?.message ??
		delegateMutation.error?.message ??
		revokeDelegationMutation.error?.message;

	return (
		<View style={styles.section}>
			<View style={styles.header}>
				<View style={styles.headerText}>
					<ThemedText style={styles.title}>Appareils</ThemedText>
					<ThemedText style={styles.subtitle}>
						Les appareils où votre compte est connecté, et ceux que vous pilotez.
					</ThemedText>
				</View>

				<View style={styles.headerActions}>
					<Pressable
						style={styles.iconBtn}
						onPress={() => devicesQuery.refetch()}
						accessibilityRole="button"
						accessibilityLabel="Rafraîchir la liste des appareils"
					>
						<RefreshCw color="#fff" size={16} />
					</Pressable>
					<Pressable
						style={styles.iconBtn}
						onPress={() => setShowRegister(true)}
						accessibilityRole="button"
						accessibilityLabel="Enregistrer un appareil"
					>
						<Plus color="#fff" size={18} />
					</Pressable>
				</View>
			</View>

			{errorMessage ? <ThemedText style={styles.error}>{errorMessage}</ThemedText> : null}

			{devicesQuery.isPending ? (
				<ActivityIndicator color="#fff" style={styles.loader} />
			) : devices.length === 0 ? (
				<ThemedText style={styles.empty}>Aucun appareil enregistré.</ThemedText>
			) : (
				<View style={styles.list}>
					{devices.map((device) => (
						<View key={device.id} style={styles.card}>
							<View style={styles.cardHeader}>
								<View style={styles.cardTitleRow}>
									<Monitor color="#9aa0b5" size={16} />
									<ThemedText style={styles.cardTitle} numberOfLines={1}>
										{device.deviceName}
									</ThemedText>
								</View>
								<Pressable
									style={styles.iconBtnDanger}
									onPress={() => handleRevoke(device)}
									disabled={revokeMutation.isPending}
									accessibilityRole="button"
									accessibilityLabel={`Révoquer ${device.deviceName}`}
								>
									<Trash2 color="#ffb0b0" size={16} />
								</Pressable>
							</View>

							<ThemedText style={styles.cardMeta}>
								{PLATFORM_LABELS[device.platform]} · v{device.appVersion}
							</ThemedText>

							<View style={styles.permissions}>
								{device.permissions.map((permission) => (
									<View key={permission.id} style={styles.permissionRow}>
										<Shield color="#9aa0b5" size={13} />
										<ThemedText style={styles.permissionText}>
											{permission.delegateUserId} · {permission.permission}
										</ThemedText>
										<Pressable
											onPress={() => handleRevokeDelegation(device, permission.delegateUserId)}
											disabled={revokeDelegationMutation.isPending}
											accessibilityRole="button"
											accessibilityLabel="Révoquer la délégation"
										>
											<X color="#ffb0b0" size={14} />
										</Pressable>
									</View>
								))}
							</View>

							<Pressable
								style={styles.delegateBtn}
								onPress={() => setShowDelegate(device)}
								accessibilityRole="button"
								accessibilityLabel={`Déléguer le contrôle de ${device.deviceName}`}
							>
								<UserPlus color="#fff" size={14} />
								<ThemedText style={styles.delegateLabel}>Déléguer le contrôle</ThemedText>
							</Pressable>
						</View>
					))}
				</View>
			)}

			<Modal
				visible={showRegister}
				transparent
				animationType="fade"
				onRequestClose={() => setShowRegister(false)}
			>
				<Pressable style={styles.backdrop} onPress={() => setShowRegister(false)}>
					<Pressable style={styles.sheet} onPress={() => {}}>
						<View style={styles.sheetHeader}>
							<ThemedText type="defaultSemiBold" style={styles.sheetTitle}>
								Enregistrer un appareil
							</ThemedText>
							<Pressable
								onPress={() => setShowRegister(false)}
								accessibilityRole="button"
								accessibilityLabel="Fermer"
							>
								<X color="#fff" size={20} />
							</Pressable>
						</View>

						<TextInput
							value={deviceName}
							onChangeText={setDeviceName}
							placeholder="Nom de l'appareil"
							placeholderTextColor="#7a7f92"
							style={styles.input}
						/>
						<TextInput
							value={appVersion}
							onChangeText={setAppVersion}
							placeholder="Version de l'application"
							placeholderTextColor="#7a7f92"
							style={styles.input}
						/>

						<Pressable
							style={[
								styles.submitBtn,
								(!deviceName.trim() || registerMutation.isPending) && styles.disabled,
							]}
							onPress={handleRegister}
							disabled={!deviceName.trim() || registerMutation.isPending}
							accessibilityRole="button"
						>
							<ThemedText type="defaultSemiBold" style={styles.submitLabel}>
								Enregistrer
							</ThemedText>
						</Pressable>
					</Pressable>
				</Pressable>
			</Modal>

			<Modal
				visible={showDelegate !== null}
				transparent
				animationType="fade"
				onRequestClose={() => setShowDelegate(null)}
			>
				<Pressable style={styles.backdrop} onPress={() => setShowDelegate(null)}>
					<Pressable style={styles.sheet} onPress={() => {}}>
						<View style={styles.sheetHeader}>
							<ThemedText type="defaultSemiBold" style={styles.sheetTitle}>
								Déléguer {showDelegate?.deviceName}
							</ThemedText>
							<Pressable
								onPress={() => setShowDelegate(null)}
								accessibilityRole="button"
								accessibilityLabel="Fermer"
							>
								<X color="#fff" size={20} />
							</Pressable>
						</View>

						<TextInput
							value={delegateUserId}
							onChangeText={setDelegateUserId}
							placeholder="Identifiant de la personne"
							placeholderTextColor="#7a7f92"
							autoCapitalize="none"
							style={styles.input}
						/>

						<Pressable
							style={[
								styles.submitBtn,
								(!delegateUserId.trim() || delegateMutation.isPending) && styles.disabled,
							]}
							onPress={handleDelegate}
							disabled={!delegateUserId.trim() || delegateMutation.isPending}
							accessibilityRole="button"
						>
							<ThemedText type="defaultSemiBold" style={styles.submitLabel}>
								Déléguer
							</ThemedText>
						</Pressable>
					</Pressable>
				</Pressable>
			</Modal>
		</View>
	);
}

const styles = StyleSheet.create({
	section: {
		gap: 10,
	},
	header: {
		flexDirection: 'row',
		alignItems: 'flex-start',
		justifyContent: 'space-between',
		gap: 10,
	},
	headerText: {
		flex: 1,
		gap: 2,
	},
	headerActions: {
		flexDirection: 'row',
		gap: 8,
	},
	title: {
		fontSize: 16,
		fontWeight: '600',
	},
	subtitle: {
		fontSize: 12,
		opacity: 0.6,
	},
	iconBtn: {
		width: 36,
		height: 36,
		borderRadius: 18,
		alignItems: 'center',
		justifyContent: 'center',
		backgroundColor: 'rgba(255,255,255,0.1)',
	},
	iconBtnDanger: {
		width: 30,
		height: 30,
		borderRadius: 15,
		alignItems: 'center',
		justifyContent: 'center',
		backgroundColor: 'rgba(120,20,30,0.3)',
	},
	loader: {
		marginVertical: 12,
	},
	empty: {
		fontSize: 13,
		opacity: 0.6,
		paddingVertical: 8,
	},
	error: {
		color: '#ff8f8f',
		fontSize: 12,
	},
	list: {
		gap: 8,
	},
	card: {
		gap: 6,
		padding: 12,
		borderRadius: 12,
		backgroundColor: 'rgba(255,255,255,0.06)',
	},
	cardHeader: {
		flexDirection: 'row',
		alignItems: 'center',
		justifyContent: 'space-between',
		gap: 8,
	},
	cardTitleRow: {
		flex: 1,
		flexDirection: 'row',
		alignItems: 'center',
		gap: 8,
	},
	cardTitle: {
		fontSize: 15,
		fontWeight: '600',
		flexShrink: 1,
	},
	cardMeta: {
		fontSize: 12,
		color: '#9aa0b5',
	},
	permissions: {
		gap: 4,
	},
	permissionRow: {
		flexDirection: 'row',
		alignItems: 'center',
		gap: 6,
	},
	permissionText: {
		flex: 1,
		fontSize: 12,
		color: '#9aa0b5',
	},
	delegateBtn: {
		flexDirection: 'row',
		alignItems: 'center',
		gap: 6,
		alignSelf: 'flex-start',
		marginTop: 4,
		paddingVertical: 8,
		paddingHorizontal: 12,
		borderRadius: 999,
		backgroundColor: 'rgba(90,120,255,0.25)',
	},
	delegateLabel: {
		fontSize: 12,
		fontWeight: '600',
	},
	backdrop: {
		flex: 1,
		backgroundColor: 'rgba(0,0,0,0.65)',
		justifyContent: 'center',
		padding: 20,
	},
	sheet: {
		gap: 12,
		padding: 18,
		borderRadius: 18,
		backgroundColor: '#12121d',
	},
	sheetHeader: {
		flexDirection: 'row',
		alignItems: 'center',
		justifyContent: 'space-between',
	},
	sheetTitle: {
		fontSize: 17,
	},
	input: {
		borderWidth: 1,
		borderColor: 'rgba(255,255,255,0.14)',
		borderRadius: 12,
		paddingHorizontal: 12,
		paddingVertical: 10,
		color: '#fff',
	},
	submitBtn: {
		paddingVertical: 14,
		borderRadius: 12,
		alignItems: 'center',
		backgroundColor: '#ffffff',
	},
	disabled: {
		opacity: 0.5,
	},
	submitLabel: {
		color: '#0b0b12',
	},
});
