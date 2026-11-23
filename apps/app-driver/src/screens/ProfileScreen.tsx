import React, { useEffect, useState } from 'react';
import {
  ActivityIndicator,
  Pressable,
  ScrollView,
  StyleSheet,
  Text,
  TextInput,
  View,
} from 'react-native';
import { changeDriverPassword } from '../api/client';
import { ListCard } from '../components/ListCard';
import { ScreenShell } from '../components/ScreenShell';
import { useAuth } from '../context/AuthContext';
import { rootNavigationRef } from '../navigation/rootNavigation';
import { C, FONT, RADIUS } from '../theme/tokens';

/** mbDrvProfile — hồ sơ tài xế thực tế + đổi mật khẩu + đăng xuất */
export function ProfileScreen() {
  const { token, driver, refreshProfile, logout } = useAuth();
  const [curPwd, setCurPwd] = useState('');
  const [newPwd, setNewPwd] = useState('');
  const [saving, setSaving] = useState(false);
  const [msg, setMsg] = useState<string | null>(null);
  const [err, setErr] = useState<string | null>(null);

  useEffect(() => {
    void refreshProfile();
  }, [refreshProfile]);

  const onChangePassword = async () => {
    if (!token) return;
    if (!curPwd || newPwd.length < 8) {
      setErr('Mật khẩu mới cần tối thiểu 8 ký tự');
      return;
    }
    setSaving(true);
    setErr(null);
    setMsg(null);
    try {
      await changeDriverPassword(token, curPwd, newPwd);
      setCurPwd('');
      setNewPwd('');
      setMsg('Đổi mật khẩu thành công!');
    } catch (e) {
      setErr(e instanceof Error ? e.message : 'Không đổi được mật khẩu');
    } finally {
      setSaving(false);
    }
  };

  const onLogout = () => {
    logout();
    rootNavigationRef.reset({ index: 0, routes: [{ name: 'Login' }] });
  };

  return (
    <ScreenShell underStackHeader style={styles.shell}>
      <Text style={styles.title}>Hồ sơ tài xế</Text>
      <ScrollView contentContainerStyle={{ paddingBottom: 24 }}>
        <ListCard
          title={driver?.full_name ?? 'Tài xế NovaLimo'}
          subtitle={`SĐT: ${driver?.phone ?? '—'} · GPLX: ${driver?.license_number ?? 'Chưa cập nhật'}`}
        >
          <Text style={styles.muted}>
            Hạn GPLX: {driver?.license_expires_on ?? '—'}
          </Text>
          <Text style={styles.muted}>
            Xe mặc định:{' '}
            {driver?.vehicle
              ? `${driver.vehicle.license_plate} (${driver.vehicle.type ?? 'Limousine'})`
              : 'Gán theo phơi lệnh'}
          </Text>
        </ListCard>

        <View style={styles.pwdCard}>
          <Text style={styles.secTitle}>Đổi mật khẩu tài khoản</Text>
          <TextInput
            value={curPwd}
            onChangeText={setCurPwd}
            placeholder="Mật khẩu hiện tại"
            placeholderTextColor={C.muted}
            secureTextEntry
            style={styles.input}
          />
          <TextInput
            value={newPwd}
            onChangeText={setNewPwd}
            placeholder="Mật khẩu mới (tối thiểu 8 ký tự)"
            placeholderTextColor={C.muted}
            secureTextEntry
            style={styles.input}
          />
          {err ? <Text style={styles.err}>{err}</Text> : null}
          {msg ? <Text style={styles.ok}>{msg}</Text> : null}
          <Pressable
            style={[styles.btnPrimary, saving && { opacity: 0.7 }]}
            disabled={saving}
            onPress={() => void onChangePassword()}
          >
            {saving ? (
              <ActivityIndicator color={C.bg} />
            ) : (
              <Text style={styles.btnPrimaryTxt}>Cập nhật mật khẩu</Text>
            )}
          </Pressable>
        </View>

        <Pressable style={styles.logoutBtn} onPress={onLogout}>
          <Text style={styles.logoutTxt}>Đăng xuất khỏi thiết bị</Text>
        </Pressable>
      </ScrollView>
    </ScreenShell>
  );
}

const styles = StyleSheet.create({
  shell: { flex: 1 },
  title: {
    fontFamily: FONT.bold,
    fontSize: 20,
    color: C.text,
    marginBottom: 12,
  },
  muted: {
    fontFamily: FONT.regular,
    fontSize: 13,
    color: C.muted,
    marginTop: 4,
  },
  pwdCard: {
    backgroundColor: C.card,
    borderRadius: RADIUS.card,
    borderWidth: 1,
    borderColor: C.stroke,
    padding: 16,
    gap: 10,
    marginBottom: 14,
  },
  secTitle: { fontFamily: FONT.semibold, fontSize: 15, color: C.gold },
  input: {
    borderWidth: 1,
    borderColor: C.stroke,
    borderRadius: RADIUS.input,
    paddingHorizontal: 14,
    paddingVertical: 11,
    color: C.text,
    fontFamily: FONT.regular,
    backgroundColor: C.bg,
  },
  err: { fontFamily: FONT.regular, fontSize: 12, color: C.error },
  ok: { fontFamily: FONT.semibold, fontSize: 12, color: C.success },
  btnPrimary: {
    backgroundColor: C.gold,
    borderRadius: 12,
    paddingVertical: 12,
    alignItems: 'center',
    marginTop: 4,
  },
  btnPrimaryTxt: { fontFamily: FONT.semibold, color: C.bg, fontSize: 14 },
  logoutBtn: {
    borderRadius: 14,
    borderWidth: 1,
    borderColor: C.noContactStroke,
    backgroundColor: C.noContactBg,
    paddingVertical: 13,
    alignItems: 'center',
  },
  logoutTxt: {
    fontFamily: FONT.semibold,
    color: C.noContactText,
    fontSize: 14,
  },
});
