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

/** mbDrvLogin — nền #020617, form + bắt đầu ca */
export function LoginScreen({ navigation }: Props) {
  const { setToken } = useAuth();
  const [phone, setPhone] = useState('');
  const [password, setPassword] = useState('');
  const [loading, setLoading] = useState(false);
  const [err, setErr] = useState<string | null>(null);

  const onSubmit = async () => {
    setErr(null);
    setLoading(true);
    try {
      const { access_token } = await loginDriver(phone.trim(), password);
      setToken(access_token);
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
          placeholder="0xxxxxxxxx"
          placeholderTextColor={C.muted}
          keyboardType="phone-pad"
          autoCapitalize="none"
          style={styles.input}
        />
        <Text style={styles.label}>Mật khẩu</Text>
        <TextInput
          value={password}
          onChangeText={setPassword}
          placeholder="••••••••"
          placeholderTextColor={C.muted}
          secureTextEntry
          style={styles.input}
        />
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
          Sau khi đăng nhập, bạn sẽ được xin quyền vị trí & thông báo để điều hành theo ca.
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
  hint: { color: C.muted, fontFamily: FONT.regular, fontSize: 12, lineHeight: 18 },
});
