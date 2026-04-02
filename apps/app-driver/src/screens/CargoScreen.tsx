import { NativeStackScreenProps } from '@react-navigation/native-stack';
import React, { useCallback, useEffect, useState } from 'react';
import {
  ActivityIndicator,
  Alert,
  Button,
  FlatList,
  StyleSheet,
  Text,
  TextInput,
  View,
} from 'react-native';
import type { Cargo } from '@limousine-workspace/shared-types';
import {
  fetchCargosForRun,
  patchCargoDriverStatus,
} from '../api/client';
import { useAuth } from '../context/AuthContext';
import type { RootStackParamList } from '../navigation/types';

type Props = NativeStackScreenProps<RootStackParamList, 'Cargo'>;

export function CargoScreen({ route }: Props) {
  const { runId } = route.params;
  const { token } = useAuth();
  const [list, setList] = useState<Cargo[]>([]);
  const [loading, setLoading] = useState(false);
  const [manualCode, setManualCode] = useState('');

  const load = useCallback(async () => {
    if (!token) return;
    setLoading(true);
    try {
      const data = await fetchCargosForRun(token, runId);
      setList(data);
    } finally {
      setLoading(false);
    }
  }, [token, runId]);

  useEffect(() => {
    void load();
  }, [load]);

  const matchAndUpdate = async (
    waybill: string,
    target: Cargo['status'],
  ) => {
    if (!token || !waybill.trim()) {
      Alert.alert('Thiếu mã', 'Nhập mã vận đơn.');
      return;
    }
    const c = list.find(
      (x) => x.waybill_code.toLowerCase() === waybill.trim().toLowerCase(),
    );
    if (!c) {
      Alert.alert('Không tìm thấy', 'Mã vận đơn không khớp chuyến này.');
      return;
    }
    try {
      await patchCargoDriverStatus(token, c.id, target);
      await load();
      setManualCode('');
    } catch (e) {
      Alert.alert('Lỗi', e instanceof Error ? e.message : 'Cập nhật thất bại');
    }
  };

  return (
    <View style={styles.root}>
      <Text style={styles.title}>Hàng hóa ký gửi</Text>
      <Text style={styles.hint}>
        Nhập mã vận đơn (quét QR có thể bổ sung sau với camera).
      </Text>
      {loading ? <ActivityIndicator /> : null}
      <TextInput
        style={styles.input}
        placeholder="Mã vận đơn"
        value={manualCode}
        onChangeText={setManualCode}
        autoCapitalize="characters"
      />
      <View style={styles.row}>
        <Button
          title="Đã nhận lên xe"
          onPress={() => void matchAndUpdate(manualCode, 'PICKED_UP')}
        />
        <Button
          title="Đã giao hàng"
          onPress={() => void matchAndUpdate(manualCode, 'DELIVERED')}
        />
      </View>
      <FlatList
        data={list}
        keyExtractor={(item) => item.id}
        ListEmptyComponent={
          <Text style={styles.muted}>Không có hàng trên chuyến này.</Text>
        }
        renderItem={({ item }) => (
          <View style={styles.card}>
            <Text style={styles.waybill}>{item.waybill_code}</Text>
            <Text style={styles.muted}>Trạng thái: {item.status}</Text>
            <Text style={styles.muted}>
              Gửi: {item.sender_info.name} → Nhận: {item.receiver_info.name}
            </Text>
          </View>
        )}
      />
    </View>
  );
}

const styles = StyleSheet.create({
  root: { flex: 1, padding: 12, backgroundColor: '#f5f5f5' },
  title: { fontSize: 18, fontWeight: '600', marginBottom: 4 },
  hint: { color: '#666', marginBottom: 8, fontSize: 12 },
  input: {
    borderWidth: 1,
    borderColor: '#ccc',
    borderRadius: 8,
    padding: 10,
    marginBottom: 8,
    backgroundColor: '#fff',
  },
  row: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginBottom: 12,
    gap: 8,
  },
  card: {
    backgroundColor: '#fff',
    padding: 10,
    borderRadius: 8,
    marginBottom: 8,
    borderWidth: 1,
    borderColor: '#eee',
  },
  waybill: { fontWeight: '600' },
  muted: { color: '#666', marginTop: 2 },
});
