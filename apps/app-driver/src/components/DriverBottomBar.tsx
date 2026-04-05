/**
 * Thanh tab dưới khớp app-mobile.pen (mbBottomNavLibrary): #0B1020, radius 20, viền #334155.
 */
import { Ionicons } from '@expo/vector-icons';
import type { BottomTabBarProps } from '@react-navigation/bottom-tabs';
import React from 'react';
import { Pressable, StyleSheet, Text, View } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { C, FONT } from '../theme/tokens';
import type { MainTabParamList } from '../navigation/types';

const LABELS: Record<keyof MainTabParamList, string> = {
  Trips: 'Chuyến',
  Cargo: 'Hàng',
  Chat: 'Chat',
  Shift: 'Ca',
};

const ICONS: Record<
  keyof MainTabParamList,
  React.ComponentProps<typeof Ionicons>['name']
> = {
  Trips: 'map-outline',
  Cargo: 'cube-outline',
  Chat: 'chatbubble-outline',
  Shift: 'power-outline',
};

export function DriverBottomBar({ state, descriptors, navigation }: BottomTabBarProps) {
  const insets = useSafeAreaInsets();
  const bottomPad = Math.max(insets.bottom, 10);

  return (
    <View style={[styles.outer, { paddingBottom: bottomPad }]}>
      <View style={styles.bar}>
        {state.routes.map((route, index) => {
          const isFocused = state.index === index;
          const key = route.name as keyof MainTabParamList;
          const { options } = descriptors[route.key];
          const label = (options.title as string) || LABELS[key];

          const onPress = () => {
            const event = navigation.emit({
              type: 'tabPress',
              target: route.key,
              canPreventDefault: true,
            });
            if (!isFocused && !event.defaultPrevented) {
              navigation.navigate(route.name);
            }
          };

          return (
            <Pressable
              key={route.key}
              accessibilityRole="button"
              accessibilityState={{ selected: isFocused }}
              onPress={onPress}
              style={[styles.cell, isFocused && styles.cellActive]}
            >
              <Ionicons
                name={ICONS[key]}
                size={22}
                color={isFocused ? C.gold : C.muted}
              />
              <Text style={[styles.label, isFocused && styles.labelActive]} numberOfLines={1}>
                {label}
              </Text>
            </Pressable>
          );
        })}
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  outer: {
    backgroundColor: C.bg,
    paddingHorizontal: 12,
    paddingTop: 8,
  },
  bar: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    gap: 8,
    backgroundColor: C.bottomNavWrap,
    borderRadius: 20,
    borderWidth: 1,
    borderColor: C.stroke,
    paddingHorizontal: 10,
    paddingVertical: 8,
    minHeight: 74,
  },
  cell: {
    flex: 1,
    maxWidth: 88,
    alignItems: 'center',
    justifyContent: 'center',
    gap: 6,
    borderRadius: 16,
    paddingVertical: 8,
    backgroundColor: C.card,
  },
  cellActive: {
    backgroundColor: C.tabActive,
    borderWidth: 1,
    borderColor: C.stroke,
  },
  label: {
    fontFamily: FONT.regular,
    fontSize: 11,
    color: C.muted,
  },
  labelActive: {
    color: C.gold,
    fontFamily: FONT.semibold,
  },
});
