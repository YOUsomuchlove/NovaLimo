import { ChevronsRight } from 'lucide-react-native';
import { type ReactNode, useEffect, useMemo, useState } from 'react';
import {
  Animated,
  Easing,
  type LayoutChangeEvent,
  Modal,
  PanResponder,
  Pressable,
  StyleSheet,
  View,
} from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { Text } from './primitives';
import { c, r, sp, theme } from './theme';

/* ---------- Skeleton ---------- */

export function Skeleton({
  width = '100%',
  height = 16,
  radius = r.control,
}: {
  width?: number | `${number}%`;
  height?: number;
  radius?: number;
}) {
  const [pulse] = useState(() => new Animated.Value(0.5));
  useEffect(() => {
    const loop = Animated.loop(
      Animated.sequence([
        Animated.timing(pulse, {
          toValue: 1,
          duration: 700,
          useNativeDriver: true,
        }),
        Animated.timing(pulse, {
          toValue: 0.5,
          duration: 700,
          useNativeDriver: true,
        }),
      ]),
    );
    loop.start();
    return () => loop.stop();
  }, [pulse]);
  return (
    <Animated.View
      style={{
        width,
        height,
        borderRadius: radius,
        backgroundColor: c.surface3,
        opacity: pulse,
      }}
    />
  );
}

/* ---------- SwipeToConfirm (pickup / drop-off confirmations) ---------- */

const KNOB = 52;

export function SwipeToConfirm({
  label,
  onConfirm,
  disabled,
}: {
  label: string;
  onConfirm: () => void;
  disabled?: boolean;
}) {
  const [trackWidth, setTrackWidth] = useState(0);
  const [x] = useState(() => new Animated.Value(0));
  const max = Math.max(0, trackWidth - KNOB - 8);

  const responder = useMemo(
    () =>
      PanResponder.create({
        onStartShouldSetPanResponder: () => !disabled,
        onMoveShouldSetPanResponder: () => !disabled,
        onPanResponderMove: (_, g) =>
          x.setValue(Math.min(Math.max(0, g.dx), max)),
        onPanResponderRelease: (_, g) => {
          if (g.dx >= max * 0.85) {
            Animated.timing(x, {
              toValue: max,
              duration: 120,
              useNativeDriver: false,
            }).start(() => {
              onConfirm();
              x.setValue(0);
            });
          } else {
            Animated.spring(x, {
              toValue: 0,
              useNativeDriver: false,
              bounciness: 6,
            }).start();
          }
        },
      }),
    [disabled, max, onConfirm, x],
  );

  const fill = x.interpolate({
    inputRange: [0, Math.max(1, max)],
    outputRange: [KNOB + 8, trackWidth || 1],
    extrapolate: 'clamp',
  });
  const labelOpacity = x.interpolate({
    inputRange: [0, Math.max(1, max * 0.6)],
    outputRange: [1, 0],
    extrapolate: 'clamp',
  });

  return (
    <View
      onLayout={(e: LayoutChangeEvent) =>
        setTrackWidth(e.nativeEvent.layout.width)
      }
      style={[styles.track, disabled && { opacity: 0.5 }]}
      accessibilityRole="adjustable"
      accessibilityLabel={label}
      accessibilityActions={[{ name: 'activate', label }]}
      onAccessibilityAction={() => !disabled && onConfirm()}
    >
      <Animated.View style={[styles.fill, { width: fill }]} />
      <Animated.View
        style={[
          StyleSheet.absoluteFill,
          styles.center,
          { opacity: labelOpacity },
        ]}
        pointerEvents="none"
      >
        <Text variant="bodyMedium" color={c.fgSecondary}>
          {label}
        </Text>
      </Animated.View>
      <Animated.View
        {...responder.panHandlers}
        style={[styles.knob, { transform: [{ translateX: x }] }]}
      >
        <ChevronsRight color={c.onBrand} size={26} strokeWidth={2.5} />
      </Animated.View>
    </View>
  );
}

/* ---------- BottomSheet ---------- */

export function BottomSheet({
  visible,
  onClose,
  title,
  children,
}: {
  visible: boolean;
  onClose: () => void;
  title?: string;
  children: ReactNode;
}) {
  const insets = useSafeAreaInsets();
  const [y] = useState(() => new Animated.Value(400));
  useEffect(() => {
    Animated.timing(y, {
      toValue: visible ? 0 : 400,
      duration: theme.motion.duration.slow,
      easing: Easing.bezier(0.2, 0.8, 0.2, 1),
      useNativeDriver: true,
    }).start();
  }, [visible, y]);

  return (
    <Modal
      visible={visible}
      transparent
      animationType="fade"
      onRequestClose={onClose}
      statusBarTranslucent
    >
      <Pressable
        style={styles.scrim}
        onPress={onClose}
        accessibilityLabel="Đóng"
      />
      <Animated.View
        style={[
          styles.sheet,
          {
            paddingBottom: insets.bottom + sp[5],
            transform: [{ translateY: y }],
          },
        ]}
      >
        <View style={styles.grabber} />
        {title ? (
          <Text variant="heading" style={{ marginBottom: sp[4] }}>
            {title}
          </Text>
        ) : null}
        {children}
      </Animated.View>
    </Modal>
  );
}

const styles = StyleSheet.create({
  track: {
    height: KNOB + 8,
    borderRadius: 999,
    backgroundColor: c.surface2,
    borderWidth: 1,
    borderColor: c.borderDefault,
    justifyContent: 'center',
    overflow: 'hidden',
  },
  fill: {
    position: 'absolute',
    left: 0,
    top: 0,
    bottom: 0,
    borderRadius: 999,
    backgroundColor: c.brandSubtle,
  },
  center: { alignItems: 'center', justifyContent: 'center' },
  knob: {
    position: 'absolute',
    left: 4,
    width: KNOB,
    height: KNOB,
    borderRadius: KNOB / 2,
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: c.brand,
    ...theme.elevation.e2,
  },
  scrim: { ...StyleSheet.absoluteFillObject, backgroundColor: c.scrim },
  sheet: {
    position: 'absolute',
    left: 0,
    right: 0,
    bottom: 0,
    paddingHorizontal: sp[5],
    paddingTop: sp[3],
    borderTopLeftRadius: r.sheet,
    borderTopRightRadius: r.sheet,
    backgroundColor: c.surface1,
    borderWidth: 1,
    borderColor: c.borderSubtle,
  },
  grabber: {
    alignSelf: 'center',
    width: 40,
    height: 4,
    borderRadius: 2,
    backgroundColor: c.borderStrong,
    marginBottom: sp[4],
  },
});
