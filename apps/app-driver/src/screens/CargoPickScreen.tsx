import type { NativeStackScreenProps } from '@react-navigation/native-stack';
import React, { useCallback, useEffect, useState } from 'react';
import {
  ActivityIndicator,
  FlatList,
  Pressable,
  StyleSheet,
  Text,
  View,
} from 'react-native';
import { fetchMyCargos } from '../api/client';
import { ListCard } from '../components/ListCard';
import { ScreenShell } from '../components/ScreenShell';
import { useAuth } from '../context/AuthContext';
import type { CargoTabStackParamList } from '../navigation/types';
import { C, FONT } from '../theme/tokens';

type Props = NativeStackScreenProps<CargoTabStackParamList, 'CargoPick'>;

/** mbDrvCargoMng + FAB */
export function CargoPickScreen({ navigation }: Props) {
  const { token } = useAuth();
  const [rows, setRows] = useState<Awaited<ReturnType<typeof fetchMyCargos>>>([]);
  const [loading, setLoading] = useState(true);

  const load = useCallback(async () => {
    if (!token) return;
    setLoading(true);
    try {
      const data = await fetchMyCargos(token);
      setRows(data);
    } catch {
      setRows([]);
    } finally {
      setLoading(false);
    }
  }, [token]);

  useEffect(() => {
    void load();
  }, [load]);

  return (
    <ScreenShell underStackHeader style={styles.shell}>
      <Text style={styles.title}>Hàng ký gửi</Text>
      {loading ? <ActivityIndicator color={C.gold} /> : null}
      <FlatList
        data={rows}
        keyExtractor={(item) => item.id}
        contentContainerStyle={styles.list}
        ListEmptyComponent={
          <Text style={styles.muted}>Không có kiện trong ca hiện tại.</Text>
        }
        renderItem={({ item }) => (
          <Pressable
            onPress={() =>
              navigation.navigate('Cargo', { runId: item.trip_run_id ?? '', cargoId: item.id })
            }
          >
            <ListCard title={item.waybill_code} subtitle={`${item.sender_info.name} → ${item.receiver_info.name}`}>
              <Text style={styles.muted}>Trạng thái: {item.status}</Text>
            </ListCard>
          </Pressable>
        )}
      />
      <Pressable style={styles.fab} onPress={() => navigation.navigate('CargoScan', {})}>
        <Text style={styles.fabIc}>📷</Text>
      </Pressable>
    </ScreenShell>
  );
}

const styles = StyleSheet.create({
  shell: { flex: 1 },
  title: { fontFamily: FONT.bold, fontSize: 18, color: C.text, marginBottom: 12 },
  list: { paddingBottom: 88 },
  muted: { color: C.muted, fontFamily: FONT.regular },
  fab: {
    position: 'absolute',
    right: 20,
    bottom: 24,
    width: 64,
    height: 64,
    borderRadius: 32,
    backgroundColor: C.fabBlue,
    borderWidth: 2,
    borderColor: C.fabBlueStroke,
    alignItems: 'center',
    justifyContent: 'center',
  },
  fabIc: { fontSize: 28 },
});
