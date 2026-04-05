import React from 'react';
import { Pressable, StyleSheet, Text, View, type StyleProp, type ViewStyle } from 'react-native';
import { C, FONT, RADIUS } from '../theme/tokens';

type Props = {
  title?: string;
  subtitle?: string;
  children?: React.ReactNode;
  style?: StyleProp<ViewStyle>;
  onPress?: () => void;
};

export function ListCard({ title, subtitle, children, style, onPress }: Props) {
  const inner = (
    <View style={styles.card}>
      {title ? <Text style={styles.title}>{title}</Text> : null}
      {subtitle ? <Text style={styles.sub}>{subtitle}</Text> : null}
      {children}
    </View>
  );
  if (onPress) {
    return (
      <Pressable style={[styles.wrap, style]} onPress={onPress}>
        {inner}
      </Pressable>
    );
  }
  return <View style={[styles.wrap, style]}>{inner}</View>;
}

const styles = StyleSheet.create({
  wrap: { marginBottom: 12 },
  card: {
    backgroundColor: C.card,
    borderRadius: RADIUS.card,
    borderWidth: 1,
    borderColor: C.stroke,
    padding: 14,
    gap: 4,
  },
  title: {
    fontFamily: FONT.semibold,
    fontSize: 16,
    color: C.text,
  },
  sub: {
    fontFamily: FONT.regular,
    fontSize: 13,
    color: C.muted,
  },
});
