import React, { useCallback, useEffect, useState } from 'react';
import {
  ActivityIndicator,
  FlatList,
  Pressable,
  StyleSheet,
  Text,
  View,
} from 'react-native';
import type { NotificationDto } from '@limousine-workspace/shared-types';
import { fetchDriverNotifications, markNotificationsRead } from '../api/client';
import { ListCard } from '../components/ListCard';
import { ScreenShell } from '../components/ScreenShell';
import { useAuth } from '../context/AuthContext';
import { C, FONT } from '../theme/tokens';

/** mbDrvNotif — danh sách thông báo thực tế + đánh dấu đã đọc */
export function NotificationsScreen() {
  const { token } = useAuth();
  const [items, setItems] = useState<NotificationDto[]>([]);
  const [loading, setLoading] = useState(true);

  const load = useCallback(async () => {
    if (!token) return;
    setLoading(true);
    try {
      const list = await fetchDriverNotifications(token);
      setItems(list);
    } catch {
      setItems([]);
    } finally {
      setLoading(false);
    }
  }, [token]);

  useEffect(() => {
    void load();
  }, [load]);

  const onMarkAllRead = async () => {
    if (!token) return;
    try {
      await markNotificationsRead(token);
      await load();
    } catch {
      /* ignore */
    }
  };

  return (
    <ScreenShell underStackHeader style={styles.shell}>
      <View style={styles.topRow}>
        <Text style={styles.title}>Thông báo ({items.length})</Text>
        {items.some((n) => !n.read_at) ? (
          <Pressable
            style={styles.readBtn}
            onPress={() => void onMarkAllRead()}
          >
            <Text style={styles.readBtnTxt}>Đánh dấu đã đọc hết</Text>
          </Pressable>
        ) : null}
      </View>

      {loading ? <ActivityIndicator color={C.gold} /> : null}

      <FlatList
        data={items}
        keyExtractor={(i) => i.id}
        refreshing={loading}
        onRefresh={() => void load()}
        ListEmptyComponent={
          !loading ? <Text style={styles.muted}>Chưa có thông báo.</Text> : null
        }
        renderItem={({ item }) => (
          <ListCard
            title={item.read_at ? item.title : `● ${item.title}`}
            subtitle={item.body}
          >
            <Text style={styles.time}>
              {new Date(item.created_at).toLocaleString('vi-VN')}
            </Text>
          </ListCard>
        )}
      />
    </ScreenShell>
  );
}

const styles = StyleSheet.create({
  shell: { flex: 1 },
  topRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 12,
  },
  title: {
    fontSize: 20,
    fontFamily: FONT.bold,
    color: C.text,
  },
  readBtn: {
    paddingHorizontal: 10,
    paddingVertical: 6,
    borderRadius: 10,
    borderWidth: 1,
    borderColor: C.stroke,
    backgroundColor: C.card,
  },
  readBtnTxt: { fontFamily: FONT.semibold, fontSize: 12, color: C.gold },
  muted: { color: C.muted, fontFamily: FONT.regular },
  time: {
    fontSize: 11,
    color: C.muted,
    fontFamily: FONT.regular,
    marginTop: 4,
  },
});
