import type { NativeStackScreenProps } from '@react-navigation/native-stack';
import React, { useState } from 'react';
import {
  ActivityIndicator,
  Pressable,
  StyleSheet,
  Text,
  TextInput,
  View,
} from 'react-native';
import { loginDriver } from '../api/client';
import { useAuth } from '../context/AuthContext';
import type { RootStackParamList } from '../navigation/types';
import { C, FONT, RADIUS } from '../theme/tokens';

type Props = NativeStackScreenProps<RootStackParamList, 'Login'>;

/** mbDrvLogin — nền tối, form đăng nhập SĐT + mật khẩu */
export function LoginScreen({ navigation }: Props) {
  const { setToken } = useAuth();
  const [phone, setPhone] = useState('');
  const [password, setPassword] = useState('');
  const [showPwd, setShowPwd] = useState(false);
  const [loading, setLoading] = useState(false);
  const [err, setErr] = useState<string | null>(null);

  const onSubmit = async () => {
    const trimmedPhone = phone.trim();
    if (!trimmedPhone || !password) {
      setErr('Vui lòng nhập số điện thoại và mật khẩu');
      return;
    }
    setErr(null);
    setLoading(true);
    try {
      const tokens = await loginDriver(trimmedPhone, password);
      setToken(tokens.access_token, tokens.refresh_token);
      navigation.reset({ index: 0, routes: [{ name: 'Permissions' }] });
    } catch (e) {
      setErr(e instanceof Error ? e.message : 'Đăng nhập thất bại');
    } finally {
      setLoading(false);
    }
  };

  return (
    <View style={styles.root}>
      <View style={styles.header}>
        <Text style={styles.brand}>NovaLimo</Text>
        <Text style={styles.sub}>Driver — Đăng nhập & bắt đầu ca</Text>
      </View>

      <View style={styles.form}>
        <Text style={styles.label}>Số điện thoại</Text>
        <TextInput
          value={phone}
          onChangeText={setPhone}
          placeholder="09xxxxxxxx"
          placeholderTextColor={C.muted}
          keyboardType="phone-pad"
          autoCapitalize="none"
          style={styles.input}
        />
        <Text style={styles.label}>Mật khẩu</Text>
        <View style={styles.pwdWrap}>
          <TextInput
            value={password}
            onChangeText={setPassword}
            placeholder="••••••••"
            placeholderTextColor={C.muted}
            secureTextEntry={!showPwd}
            style={[styles.input, styles.pwdInput]}
          />
          <Pressable
            style={styles.pwdToggle}
            onPress={() => setShowPwd((v) => !v)}
          >
            <Text style={styles.pwdToggleTxt}>{showPwd ? 'Ẩn' : 'Hiện'}</Text>
          </Pressable>
        </View>
        {err ? <Text style={styles.err}>{err}</Text> : null}
        <Pressable
          style={[styles.primary, loading && styles.disabled]}
          onPress={() => void onSubmit()}
          disabled={loading}
        >
          {loading ? (
            <ActivityIndicator color={C.bg} />
          ) : (
            <Text style={styles.primaryTxt}>Đăng nhập</Text>
          )}
        </Pressable>
      </View>

      <View style={styles.startSection}>
        <Text style={styles.hint}>
          Sau khi đăng nhập, bạn sẽ được xin quyền vị trí, thông báo & camera để
          điều hành theo ca.
        </Text>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  root: {
    flex: 1,
    backgroundColor: C.bg,
    paddingHorizontal: 24,
    paddingTop: 56,
  },
  header: { gap: 8, marginBottom: 24 },
  brand: {
    fontFamily: FONT.bold,
    fontSize: 28,
    color: C.gold,
  },
  sub: { fontFamily: FONT.regular, color: C.muted, fontSize: 14 },
  form: { gap: 8 },
  label: { fontFamily: FONT.semibold, color: C.text, fontSize: 13 },
  input: {
    borderWidth: 1,
    borderColor: C.stroke,
    borderRadius: RADIUS.input,
    paddingHorizontal: 14,
    paddingVertical: 12,
    color: C.text,
    fontFamily: FONT.regular,
    backgroundColor: C.card,
  },
  pwdWrap: {
    position: 'relative',
    justifyContent: 'center',
  },
  pwdInput: {
    paddingRight: 58,
  },
  pwdToggle: {
    position: 'absolute',
    right: 14,
    paddingVertical: 6,
  },
  pwdToggleTxt: {
    fontFamily: FONT.semibold,
    fontSize: 12,
    color: C.gold,
  },
  err: { color: C.error, fontFamily: FONT.regular, fontSize: 12 },
  primary: {
    marginTop: 12,
    backgroundColor: C.gold,
    borderRadius: RADIUS.card,
    paddingVertical: 14,
    alignItems: 'center',
  },
  primaryTxt: { fontFamily: FONT.semibold, color: C.bg, fontSize: 16 },
  disabled: { opacity: 0.7 },
  startSection: { marginTop: 28 },
  hint: {
    color: C.muted,
    fontFamily: FONT.regular,
    fontSize: 12,
    lineHeight: 18,
  },
});
