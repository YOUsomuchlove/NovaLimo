import { NativeStackScreenProps } from '@react-navigation/native-stack';
import React, { useState } from 'react';
import { Button, StyleSheet, Text, View } from 'react-native';
import { endShift, fetchShiftSummary } from '../api/client';
import { useAuth } from '../context/AuthContext';
import type { RootStackParamList } from '../navigation/types';

type Props = NativeStackScreenProps<RootStackParamList, 'EndShift'>;

export function EndShiftScreen({ navigation }: Props) {
  const { token } = useAuth();
  const [summary, setSummary] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);

  const refresh = async () => {
    if (!token) return;
    setLoading(true);
    try {
      const s = await fetchShiftSummary(token);
      const start = s.shift?.started_at
        ? new Date(s.shift.started_at).toLocaleString()
        : '—';
      setSummary(
        `Ca: ${s.active ? 'đang mở' : 'đã đóng'} · Bắt đầu: ${start} · GPS: ${s.location_pings} lần`,
      );
    } catch (e) {
      setSummary(e instanceof Error ? e.message : 'Lỗi');
    } finally {
      setLoading(false);
    }
  };

  const end = async () => {
    if (!token) return;
    setLoading(true);
    try {
      await endShift(token);
      await refresh();
    } catch (e) {
      setSummary(e instanceof Error ? e.message : 'Lỗi kết thúc ca');
    } finally {
      setLoading(false);
    }
  };

  return (
    <View style={styles.root}>
      <Text style={styles.title}>Kết thúc ca & báo cáo</Text>
      <Button title="Tải tóm tắt" onPress={() => void refresh()} />
      <View style={styles.spacer} />
      <Button
        title="Kết thúc ca"
        onPress={() => void end()}
        disabled={loading}
      />
      {summary ? <Text style={styles.summary}>{summary}</Text> : null}
      <View style={styles.spacer} />
      <Button title="Về danh sách chuyến" onPress={() => navigation.navigate('Home')} />
    </View>
  );
}

const styles = StyleSheet.create({
  root: { flex: 1, padding: 16 },
  title: { fontSize: 18, fontWeight: '600', marginBottom: 16 },
  spacer: { height: 12 },
  summary: { marginTop: 16, color: '#333' },
});
