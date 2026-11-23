import React from 'react';
import { StyleSheet, Text, View } from 'react-native';
import { useAuth } from '../context/AuthContext';
import { C, FONT } from '../theme/tokens';

/**
 * Canvas nhỏ gợi ý Chat + Ca (app-mobile-chat-shift.pen).
 */
export function MiniChatShiftPreview({
  unreadCount = 0,
}: {
  unreadCount?: number;
}) {
  const { driver } = useAuth();
  const shiftStart = driver?.shift?.started_at
    ? new Date(driver.shift.started_at).toLocaleTimeString('vi-VN', {
        hour: '2-digit',
        minute: '2-digit',
      })
    : null;

  return (
    <View style={styles.wrap}>
      <View style={styles.col}>
        <Text style={styles.lbl}>Chat ĐH</Text>
        <Text style={styles.hint}>
          {unreadCount > 0 ? `${unreadCount} tin chưa đọc` : 'Đã xem hết'}
        </Text>
      </View>
      <View style={styles.div} />
      <View style={styles.col}>
        <Text style={styles.lbl}>Ca hiện tại</Text>
        <Text style={styles.hint}>
          {shiftStart ? `Bắt đầu ${shiftStart}` : 'Chưa bắt đầu ca'}
        </Text>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  wrap: {
    flexDirection: 'row',
    alignItems: 'center',
    borderRadius: 14,
    borderWidth: 1,
    borderColor: C.stroke,
    backgroundColor: C.card,
    paddingVertical: 10,
    paddingHorizontal: 12,
    marginTop: 8,
  },
  col: { flex: 1 },
  div: {
    width: 1,
    alignSelf: 'stretch',
    backgroundColor: C.stroke,
    marginHorizontal: 8,
  },
  lbl: { fontFamily: FONT.semibold, color: C.text, fontSize: 13 },
  hint: {
    fontFamily: FONT.regular,
    color: C.muted,
    fontSize: 11,
    marginTop: 2,
  },
});
