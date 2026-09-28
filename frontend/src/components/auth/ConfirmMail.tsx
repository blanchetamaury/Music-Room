import { useConfirmEmailMutation, useResendVerificationMutation } from '@/src/lib/fetcher/tanstack/auth';
import { ChevronLeft, MailCheck, Send } from 'lucide-react-native';
import React, { useCallback, useEffect, useRef, useState } from 'react';
import { ActivityIndicator, Pressable, StyleSheet, View } from 'react-native';
import { ThemedText } from '../utils/themed-text';

const RESEND_COOLDOWN_SECONDS = 60;

export function ConfirmMail({
	onBack,
	onConfirmComplete,
	email,
	token,
}: {
	onBack?: (value: boolean) => void;
	onConfirmComplete?: (value: boolean) => void;
	email: string;
	/** Verification token taken from the emailed deep link. */
	token?: string | null;
}) {
	const confirmMutation = useConfirmEmailMutation();
	const resendMutation = useResendVerificationMutation();

	const [cooldown, setCooldown] = useState(0);
	const timerRef = useRef<ReturnType<typeof setInterval> | null>(null);
	const startedRef = useRef(false);

	// A deep link means we already hold a token, so we confirm instead of sending.
	const confirming = Boolean(token);
	const verifying = confirming && confirmMutation.isPending;
	const confirmed = confirmMutation.isSuccess;
	const sent = resendMutation.isSuccess || confirmMutation.isSuccess;
	const busy = verifying || (!confirming && resendMutation.isPending);
	const error = (confirmMutation.error ?? resendMutation.error)?.message ?? null;

	const startCooldown = useCallback(() => {
		if (timerRef.current) clearInterval(timerRef.current);

		setCooldown(RESEND_COOLDOWN_SECONDS);

		timerRef.current = setInterval(() => {
			setCooldown((current) => {
				if (current <= 1) {
					if (timerRef.current) clearInterval(timerRef.current);
					timerRef.current = null;
					return 0;
				}
				return current - 1;
			});
		}, 1000);
	}, []);

	useEffect(() => {
		return () => {
			if (timerRef.current) clearInterval(timerRef.current);
		};
	}, []);

	useEffect(() => {
		if (startedRef.current) return;
		startedRef.current = true;

		if (token) {
			confirmMutation.mutate(token, {
				onSuccess: () => onConfirmComplete?.(true),
			});
			return;
		}

		resendMutation.mutate(email, { onSuccess: startCooldown });
		// eslint-disable-next-line react-hooks/exhaustive-deps
	}, [token]);

	useEffect(() => {
		if (resendMutation.isSuccess && cooldown === 0 && !timerRef.current) startCooldown();
	}, [resendMutation.isSuccess, cooldown, startCooldown]);

	const handleResend = () => {
		if (busy || cooldown > 0) return;
		resendMutation.mutate(email);
	};

	return (
		<View style={styles.container}>
			<View style={styles.headerRow}>
				<Pressable
					onPress={() => onBack?.(false)}
					style={styles.backBtn}
					accessibilityRole="button"
					accessibilityLabel="Back"
				>
					<ChevronLeft size={24} color="#ffffff" />
				</Pressable>
				<ThemedText type="title" style={styles.title}>
					Verify your email
				</ThemedText>
			</View>

			<View style={styles.body}>
				{confirmed ? (
					<View style={styles.iconRow}>
						<MailCheck size={40} color="#4ade80" />
						<ThemedText style={styles.headline}>Email verified</ThemedText>
						<ThemedText style={styles.hint}>
							Your account is ready. You can now sign in with {email}.
						</ThemedText>
						<Pressable onPress={() => onBack?.(false)} style={styles.actionBtn} accessibilityRole="button">
							<ThemedText type="defaultSemiBold" style={styles.actionText}>
								Continue
							</ThemedText>
						</Pressable>
					</View>
				) : (
					<View style={styles.iconRow}>
						<Send size={40} color="#ffffff" />
						<ThemedText style={styles.headline}>
							{verifying ? 'Confirming your email' : 'Check your inbox'}
						</ThemedText>
						<ThemedText style={styles.hint}>
							{verifying
								? 'One moment…'
								: sent
									? `We sent a verification link to ${email}.`
									: busy
										? 'Sending a verification link…'
										: `Send a verification link to ${email}.`}
						</ThemedText>

						{error ? <ThemedText style={styles.error}>{error}</ThemedText> : null}

						{busy ? <ActivityIndicator color="#ffffff" size="small" /> : null}

						<Pressable
							onPress={handleResend}
							disabled={busy || cooldown > 0 || confirming}
							style={[
								styles.actionBtn,
								busy || cooldown > 0 || confirming ? styles.actionBtnDisabled : null,
							]}
							accessibilityRole="button"
						>
							<ThemedText type="defaultSemiBold" style={styles.actionText}>
								{cooldown > 0 ? `Resend (${cooldown}s)` : 'Resend verification link'}
							</ThemedText>
						</Pressable>
					</View>
				)}
			</View>
		</View>
	);
}

const styles = StyleSheet.create({
	container: {
		width: '92%',
		maxWidth: 420,
		padding: 20,
		borderRadius: 16,
		alignItems: 'center',
	},
	headerRow: {
		width: '100%',
		flexDirection: 'row',
		alignItems: 'center',
	},
	backBtn: {
		paddingVertical: 6,
		paddingHorizontal: 8,
		justifyContent: 'center',
		alignItems: 'center',
	},
	title: {
		marginTop: 8,
		marginBottom: 12,
		marginLeft: 8,
	},
	body: {
		width: '100%',
		paddingTop: 15,
	},
	iconRow: {
		alignItems: 'center',
		gap: 12,
	},
	headline: {
		fontSize: 18,
		fontWeight: '600',
	},
	hint: {
		textAlign: 'center',
	},
	actionBtn: {
		marginTop: 8,
		width: '100%',
		paddingVertical: 16,
		paddingHorizontal: 14,
		borderRadius: 12,
		alignItems: 'center',
		backgroundColor: '#0a7ea4',
	},
	actionBtnDisabled: {
		backgroundColor: 'rgba(10,126,164,0.45)',
	},
	actionText: {
		color: '#ffffff',
	},
	error: {
		color: '#ff6b6b',
		textAlign: 'center',
	},
});
