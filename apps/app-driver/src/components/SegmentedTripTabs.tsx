import React from 'react';
import { Pressable, StyleSheet, Text, View } from 'react-native';
import { C, FONT, RADIUS } from '../theme/tokens';

export type SegmentedTab<T extends string> = { key: T; label: string };

type Props<T extends string> = {
  tabs: SegmentedTab<T>[];
  active: T;
  onChange: (key: T) => void;
};

/** mbHomeTabs — pill radius 999, nền #0B1020, stroke #334155 */
export function SegmentedTripTabs<T extends string>({ tabs, active, onChange }: Props<T>) {
  return (
    <View style={styles.track}>
      {tabs.map((t) => {
        const on = active === t.key;
        return (
          <Pressable
            key={t.key}
            onPress={() => onChange(t.key)}
            style={[styles.seg, on && styles.segOn]}
          >
            <Text style={[styles.txt, on && styles.txtOn]} numberOfLines={1}>
              {t.label}
            </Text>
          </Pressable>
        );
      })}
    </View>
  );
}

const styles = StyleSheet.create({
  track: {
    flexDirection: 'row',
    gap: 6,
    padding: 6,
    borderRadius: RADIUS.pill,
    backgroundColor: C.bottomNavWrap,
    borderWidth: 1,
    borderColor: C.stroke,
    minHeight: 52,
    alignItems: 'center',
  },
  seg: {
    flex: 1,
    paddingVertical: 10,
    paddingHorizontal: 8,
    borderRadius: RADIUS.pill,
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: C.card,
  },
  segOn: {
    backgroundColor: C.tabActive,
    borderWidth: 1,
    borderColor: C.stroke,
  },
  txt: {
    fontFamily: FONT.regular,
    fontSize: 12,
    color: C.muted,
  },
  txtOn: {
    color: C.gold,
    fontFamily: FONT.semibold,
  },
});
