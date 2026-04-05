import React from 'react';
import { StyleSheet, Text, View } from 'react-native';
import { C, FONT } from '../theme/tokens';

/**
 * Canvas nhỏ gợi ý Chat + Ca (app-mobile-chat-shift.pen — thay thế mbMiniCanvas khi có id).
 */
export function MiniChatShiftPreview() {
  return (
    <View style={styles.wrap}>
      <View style={styles.col}>
        <Text style={styles.lbl}>Chat ĐH</Text>
        <Text style={styles.hint}>2 tin chưa đọc</Text>
      </View>
      <View style={styles.div} />
      <View style={styles.col}>
        <Text style={styles.lbl}>Ca hiện tại</Text>
        <Text style={styles.hint}>Bắt đầu 06:30</Text>
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
  div: { width: 1, alignSelf: 'stretch', backgroundColor: C.stroke, marginHorizontal: 8 },
  lbl: { fontFamily: FONT.semibold, color: C.text, fontSize: 13 },
  hint: { fontFamily: FONT.regular, color: C.muted, fontSize: 11, marginTop: 2 },
});
