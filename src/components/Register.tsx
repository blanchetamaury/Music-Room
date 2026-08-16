import { useThemeColor } from '@/src/hooks/use-theme-color';
import React, { useMemo, useState } from 'react';
import { Platform, Pressable, StyleSheet, TextInput, View } from 'react-native';
import LiquidGlass from './LiquidGlass';
import { ThemedText } from './themed-text';

function checkRules(pw: string) {
  const hasUpper = /[A-Z]/.test(pw);
  const hasNumber = /[0-9]/.test(pw);
  const hasSpecial = /[^A-Za-z0-9]/.test(pw);
  return { hasUpper, hasNumber, hasSpecial };
}

export function Register({ onBack, onRegisterComplete, onGoogle }: { onBack?: () => void; onRegisterComplete?: () => void; onGoogle?: () => void }) {
  const [email, setEmail] = useState('');
  const [pw, setPw] = useState('');
  const [confirm, setConfirm] = useState('');
  const [touchedEmail, setTouchedEmail] = useState(false);
  const [emailFocused, setEmailFocused] = useState(false);
  const [touchedConfirm, setTouchedConfirm] = useState(false);
  const [showPw, setShowPw] = useState(false);
  const [showConfirm, setShowConfirm] = useState(false);
  const rules = useMemo(() => checkRules(pw), [pw]);
  const completed = [rules.hasUpper, rules.hasNumber, rules.hasSpecial].filter(Boolean).length;

  const formBg = useThemeColor({ light: 'rgba(255,255,255,0.14)', dark: 'rgba(255,255,255,0.06)' }, 'background');
  const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
  const isEmailValid = emailRegex.test(email);

  return (
    <LiquidGlass
      style={[styles.container, { backgroundColor: formBg }]}
      radius={16}
      topLeftRadius={16}
      topRightRadius={16}
      bottomLeftRadius={16}
      bottomRightRadius={16}
    >
      <Pressable onPress={() => onBack?.()} style={styles.topRightBtn} accessibilityRole="button">
        <View style={styles.iconPlaceholder} />
      </Pressable>

      <ThemedText type="title" style={[styles.title, { color: '#fff' }]}>Create account</ThemedText>

      <View style={[styles.inputWrapper, touchedEmail && !isEmailValid && !emailFocused ? styles.inputInvalid : null]}>
        <TextInput
          placeholder="Email"
          placeholderTextColor="#D1D5D8"
          value={email}
          onChangeText={(v) => setEmail(v)}
          onFocus={() => setEmailFocused(true)}
          onBlur={() => { setEmailFocused(false); setTouchedEmail(true); }}
          keyboardType="email-address"
          autoCapitalize="none"
          underlineColorAndroid="transparent"
          style={[
            styles.input,
            { color: '#fff' },
            Platform.OS === 'web' ? ({ outlineWidth: 0, outlineColor: 'transparent', outlineStyle: 'none' } as any) : null,
          ]}
        />
      </View>
      {touchedEmail && !isEmailValid && !emailFocused && <ThemedText style={styles.error}>Invalid email address</ThemedText>}

      <View style={[styles.inputWrapper, styles.inputDistinct]}>
        <TextInput
          placeholder="Password"
          placeholderTextColor="#D1D5D8"
          value={pw}
          onChangeText={(v) => setPw(v.replace(/\s/g, ''))}
          secureTextEntry={!showPw}
          underlineColorAndroid="transparent"
          style={[
            styles.input,
            { color: '#fff', paddingRight: 48 },
            Platform.OS === 'web' ? ({ outlineWidth: 0, outlineColor: 'transparent', outlineStyle: 'none' } as any) : null,
          ]}
        />
        <Pressable onPress={() => setShowPw((s) => !s)} style={styles.pwToggle} accessibilityRole="button">
          <View style={styles.iconPlaceholder} />
        </Pressable>
      </View>

      <View style={styles.rulesRow}>
        <View style={[styles.ruleBar, { width: `${Math.min(100, Math.round(((completed + (pw.length > 0 ? 1 : 0)) / 4) * 100))}%`, backgroundColor: completed === 3 ? '#4ade80' : '#ff6b6b' }]} />
      </View>
      <View style={styles.rulesList}>
        <ThemedText style={{ color: rules.hasUpper ? '#fff' : '#ddd' }}>{rules.hasUpper ? '✓' : '•'} One uppercase letter</ThemedText>
        <ThemedText style={{ color: rules.hasNumber ? '#fff' : '#ddd' }}>{rules.hasNumber ? '✓' : '•'} One number</ThemedText>
        <ThemedText style={{ color: rules.hasSpecial ? '#fff' : '#ddd' }}>{rules.hasSpecial ? '✓' : '•'} One special character</ThemedText>
      </View>

      <View style={[styles.inputWrapper, styles.inputDistinct]}>
        <TextInput
          placeholder="Confirm password"
          placeholderTextColor="#D1D5D8"
          value={confirm}
          onChangeText={(v) => setConfirm(v.replace(/\s/g, ''))}
          secureTextEntry={!showConfirm}
          underlineColorAndroid="transparent"
          onBlur={() => setTouchedConfirm(true)}
          style={[
            styles.input,
            { color: '#fff', paddingRight: 48 },
            Platform.OS === 'web' ? ({ outlineWidth: 0, outlineColor: 'transparent', outlineStyle: 'none' } as any) : null,
          ]}
        />
        <Pressable onPress={() => setShowConfirm((s) => !s)} style={styles.pwToggle} accessibilityRole="button">
          <View style={styles.iconPlaceholder} />
        </Pressable>
      </View>
      {touchedConfirm && confirm !== pw && <ThemedText style={styles.error}>Passwords do not match</ThemedText>}

      <View style={styles.separatorRow}>
        <View style={styles.separatorLine} />
        <ThemedText style={{ color: '#fff' }}>or</ThemedText>
        <View style={styles.separatorLine} />
      </View>

      <Pressable style={styles.googleBtn} onPress={() => onGoogle?.()} accessibilityRole="button">
        <View style={styles.googleLogoPlaceholder} />
        <ThemedText style={{ color: '#fff' }}>Create with Google</ThemedText>
      </Pressable>

      <Pressable
        style={[styles.createBtn, !(isEmailValid && pw.length >= 6 && confirm === pw && completed === 3) ? { opacity: 0.55 } : null]}
        onPress={() => { if (isEmailValid && pw.length >= 6 && confirm === pw && completed === 3) onRegisterComplete?.(); }}
        accessibilityRole="button"
        disabled={!(isEmailValid && pw.length >= 6 && confirm === pw && completed === 3)}>
        <ThemedText style={{ color: '#fff', fontWeight: '600' }}>Create account</ThemedText>
      </Pressable>

      <Pressable onPress={() => onBack?.()} style={styles.signInLink} accessibilityRole="button">
        <ThemedText style={{ color: '#fff' }}>Already have an account? <ThemedText type="defaultSemiBold">Log in</ThemedText></ThemedText>
      </Pressable>
    </LiquidGlass>
  );
}

const styles = StyleSheet.create({
  container: {
    width: '92%',
    maxWidth: 420,
    padding: 20,
    borderRadius: 16,
    alignItems: 'stretch',
  },
  topRightBtn: {
    position: 'absolute',
    right: 12,
    top: 12,
  },
  title: {
    marginTop: 8,
    marginBottom: 12,
    color: '#fff',
  },
  inputWrapper: {
    marginTop: 8,
    borderRadius: 12,
    borderWidth: 1,
    borderColor: 'rgba(255,255,255,0.12)',
    paddingHorizontal: 12,
    paddingVertical: 8,
  },
  input: {
    height: 44,
  },
  pwToggle: {
    position: 'absolute',
    right: 12,
    top: 0,
    bottom: 0,
    justifyContent: 'center',
  },
  inputDistinct: {
    backgroundColor: 'rgba(255,255,255,0.03)',
  },
  inputInvalid: {
    borderColor: '#ff6b6b',
  },
  error: {
    marginTop: 6,
    color: '#ff6b6b',
  },
  iconPlaceholder: {
    width: 20,
    height: 20,
    backgroundColor: 'rgba(255,255,255,0.2)',
    borderRadius: 4,
  },
  rulesRow: {
    height: 8,
    backgroundColor: 'rgba(255,255,255,0.08)',
    borderRadius: 6,
    marginTop: 10,
    overflow: 'hidden',
  },
  ruleBar: {
    height: '100%',
  },
  rulesList: {
    marginTop: 8,
    gap: 6,
  },
  separatorRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 10,
    marginTop: 14,
  },
  separatorLine: {
    height: 1,
    flex: 1,
    backgroundColor: 'rgba(255,255,255,0.12)',
  },
  googleBtn: {
    marginTop: 12,
    paddingVertical: 10,
    borderRadius: 12,
    alignItems: 'center',
    backgroundColor: 'rgba(255,255,255,0.06)',
    flexDirection: 'row',
    gap: 10,
    justifyContent: 'center',
  },
  googleLogoPlaceholder: {
    width: 20,
    height: 20,
    backgroundColor: 'rgba(255,255,255,0.2)',
    borderRadius: 4,
  },
  createBtn: {
    marginTop: 14,
    paddingVertical: 12,
    borderRadius: 12,
    alignItems: 'center',
    backgroundColor: 'rgba(255,255,255,0.12)',
  },
  signInLink: {
    marginTop: 12,
    alignSelf: 'center',
  },
});
