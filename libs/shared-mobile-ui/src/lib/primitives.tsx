import type { ReactNode } from 'react';
import {
  ActivityIndicator,
  Pressable,
  type StyleProp,
  StyleSheet,
  Text as RNText,
  type TextProps,
  TextInput,
  type TextInputProps,
  View,
  type ViewStyle,
} from 'react-native';
import { SafeAreaView, type Edge } from 'react-native-safe-area-context';
import { c, r, sp, theme, type, type TypeVariant } from './theme';

/* ---------- Text ---------- */

export function Text({
  variant = 'body',
  color,
  style,
  ...rest
}: TextProps & { variant?: TypeVariant; color?: string }) {
  return (
    <RNText
      style={[type[variant], color ? { color } : null, style]}
      {...rest}
    />
  );
}

/* ---------- Screen ---------- */

export function Screen({
  children,
  padded = true,
  edges = ['top', 'left', 'right'],
  style,
}: {
  children: ReactNode;
  padded?: boolean;
  edges?: Edge[];
  style?: StyleProp<ViewStyle>;
}) {
  return (
    <SafeAreaView
      edges={edges}
      style={[styles.screen, padded && { paddingHorizontal: sp[5] }, style]}
    >
      {children}
    </SafeAreaView>
  );
}

/* ---------- Header ---------- */

export function Header({
  title,
  subtitle,
  left,
  right,
}: {
  title: string;
  subtitle?: string;
  left?: ReactNode;
  right?: ReactNode;
}) {
  return (
    <View style={styles.header}>
      {left}
      <View style={{ flex: 1 }}>
        <Text variant="title" numberOfLines={1}>
          {title}
        </Text>
        {subtitle ? <Text variant="caption">{subtitle}</Text> : null}
      </View>
      {right}
    </View>
  );
}

/* ---------- Button ---------- */

type ButtonVariant = 'primary' | 'secondary' | 'ghost' | 'danger';

export function Button({
  title,
  onPress,
  variant = 'primary',
  size = 'lg',
  icon,
  loading,
  disabled,
  fullWidth = true,
  style,
}: {
  title: string;
  onPress?: () => void;
  variant?: ButtonVariant;
  size?: 'md' | 'lg';
  icon?: ReactNode;
  loading?: boolean;
  disabled?: boolean;
  fullWidth?: boolean;
  style?: StyleProp<ViewStyle>;
}) {
  const v = buttonVariants[variant];
  const isDisabled = disabled || loading;
  return (
    <Pressable
      accessibilityRole="button"
      accessibilityState={{ disabled: !!isDisabled, busy: !!loading }}
      onPress={onPress}
      disabled={isDisabled}
      style={({ pressed }) => [
        styles.button,
        {
          height: size === 'lg' ? 52 : 44,
          backgroundColor: v.bg,
          borderColor: v.border,
        },
        fullWidth && { alignSelf: 'stretch' },
        variant === 'primary' && theme.elevation.e2,
        pressed && {
          backgroundColor: v.pressed,
          transform: [{ scale: 0.985 }],
        },
        isDisabled && { opacity: 0.45 },
        style,
      ]}
    >
      {loading ? <ActivityIndicator color={v.fg} /> : icon}
      <Text
        variant="bodyMedium"
        color={v.fg}
        style={{ fontFamily: theme.fontFamily.semibold }}
      >
        {title}
      </Text>
    </Pressable>
  );
}

const buttonVariants: Record<
  ButtonVariant,
  { bg: string; fg: string; border: string; pressed: string }
> = {
  primary: {
    bg: c.brand,
    fg: c.onBrand,
    border: c.brand,
    pressed: c.brandActive,
  },
  secondary: {
    bg: c.surface3,
    fg: c.fg,
    border: c.borderDefault,
    pressed: c.surface2,
  },
  ghost: {
    bg: 'transparent',
    fg: c.fgSecondary,
    border: 'transparent',
    pressed: c.surface2,
  },
  danger: {
    bg: c.danger.solid,
    fg: c.fg,
    border: c.danger.solid,
    pressed: c.danger.fg,
  },
};

/* ---------- TextField ---------- */

export function TextField({
  label,
  error,
  hint,
  icon,
  right,
  style,
  ...input
}: TextInputProps & {
  label?: string;
  error?: string;
  hint?: string;
  icon?: ReactNode;
  right?: ReactNode;
}) {
  return (
    <View style={{ gap: sp[1.5] }}>
      {label ? <Text variant="label">{label}</Text> : null}
      <View
        style={[styles.field, error ? { borderColor: c.danger.solid } : null]}
      >
        {icon}
        <TextInput
          placeholderTextColor={c.fgDisabled}
          selectionColor={c.brand}
          style={[styles.input, style]}
          accessibilityLabel={label}
          {...input}
        />
        {right}
      </View>
      {error ? (
        <Text variant="caption" color={c.danger.fg}>
          {error}
        </Text>
      ) : hint ? (
        <Text variant="caption">{hint}</Text>
      ) : null}
    </View>
  );
}

/* ---------- Card / ListItem ---------- */

export function Card({
  children,
  onPress,
  elevated,
  style,
}: {
  children: ReactNode;
  onPress?: () => void;
  elevated?: boolean;
  style?: StyleProp<ViewStyle>;
}) {
  const base = [
    styles.card,
    elevated && { backgroundColor: c.surface2, ...theme.elevation.e2 },
    style,
  ];
  if (!onPress) return <View style={base}>{children}</View>;
  return (
    <Pressable
      accessibilityRole="button"
      onPress={onPress}
      style={({ pressed }) => [
        ...base,
        pressed && {
          borderColor: c.borderStrong,
          transform: [{ scale: 0.99 }],
        },
      ]}
    >
      {children}
    </Pressable>
  );
}

export function ListItem({
  title,
  subtitle,
  leading,
  trailing,
  onPress,
}: {
  title: string;
  subtitle?: string;
  leading?: ReactNode;
  trailing?: ReactNode;
  onPress?: () => void;
}) {
  return (
    <Pressable
      disabled={!onPress}
      onPress={onPress}
      accessibilityRole={onPress ? 'button' : undefined}
      style={({ pressed }) => [
        styles.listItem,
        pressed && { backgroundColor: c.surface2 },
      ]}
    >
      {leading}
      <View style={{ flex: 1, gap: 2 }}>
        <Text variant="bodyMedium" numberOfLines={1}>
          {title}
        </Text>
        {subtitle ? (
          <Text variant="caption" numberOfLines={2}>
            {subtitle}
          </Text>
        ) : null}
      </View>
      {trailing}
    </Pressable>
  );
}

export function Divider({ inset = 0 }: { inset?: number }) {
  return (
    <View
      style={{
        height: StyleSheet.hairlineWidth,
        backgroundColor: c.borderDefault,
        marginLeft: inset,
      }}
    />
  );
}

/* ---------- Badge ---------- */

export type BadgeTone =
  | 'neutral'
  | 'brand'
  | 'success'
  | 'warning'
  | 'danger'
  | 'info';

const badgeTone: Record<BadgeTone, { fg: string; bg: string; border: string }> =
  {
    neutral: { fg: c.fgSecondary, bg: c.surface3, border: c.borderDefault },
    brand: { fg: c.brandFg, bg: c.brandSubtle, border: c.brandSubtle },
    success: c.success,
    warning: c.warning,
    danger: c.danger,
    info: c.info,
  };

export function Badge({
  label,
  tone = 'neutral',
  dot,
}: {
  label: string;
  tone?: BadgeTone;
  dot?: boolean;
}) {
  const t = badgeTone[tone];
  return (
    <View
      style={[styles.badge, { backgroundColor: t.bg, borderColor: t.border }]}
    >
      {dot ? <View style={[styles.dot, { backgroundColor: t.fg }]} /> : null}
      <Text
        variant="caption"
        color={t.fg}
        style={{ fontFamily: theme.fontFamily.semibold }}
      >
        {label}
      </Text>
    </View>
  );
}

/* ---------- Empty state ---------- */

export function EmptyState({
  icon,
  title,
  description,
  action,
}: {
  icon?: ReactNode;
  title: string;
  description?: string;
  action?: ReactNode;
}) {
  return (
    <View style={styles.empty}>
      {icon ? <View style={styles.emptyIcon}>{icon}</View> : null}
      <Text variant="heading" style={{ textAlign: 'center' }}>
        {title}
      </Text>
      {description ? (
        <Text
          variant="caption"
          style={{ textAlign: 'center', fontSize: 14, lineHeight: 20 }}
        >
          {description}
        </Text>
      ) : null}
      {action ? (
        <View style={{ marginTop: sp[3], alignSelf: 'stretch' }}>{action}</View>
      ) : null}
    </View>
  );
}

const styles = StyleSheet.create({
  screen: { flex: 1, backgroundColor: c.canvas },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: sp[3],
    paddingVertical: sp[4],
  },
  button: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: sp[2],
    paddingHorizontal: sp[5],
    borderRadius: r.control + 4,
    borderWidth: 1,
  },
  field: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: sp[2],
    minHeight: 52,
    paddingHorizontal: sp[4],
    borderRadius: r.control + 2,
    borderWidth: 1,
    borderColor: c.borderDefault,
    backgroundColor: c.surface2,
  },
  input: {
    flex: 1,
    color: c.fg,
    fontFamily: theme.fontFamily.regular,
    fontSize: 16,
    paddingVertical: sp[3],
  },
  card: {
    padding: sp[4],
    borderRadius: r.card + 2,
    borderWidth: 1,
    borderColor: c.borderSubtle,
    backgroundColor: c.surface1,
  },
  listItem: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: sp[3],
    paddingVertical: sp[3],
    paddingHorizontal: sp[1],
    borderRadius: r.control,
  },
  badge: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
    alignSelf: 'flex-start',
    paddingHorizontal: sp[2],
    paddingVertical: 3,
    borderRadius: r.tag,
    borderWidth: 1,
  },
  dot: { width: 6, height: 6, borderRadius: 3 },
  empty: {
    alignItems: 'center',
    gap: sp[2],
    paddingVertical: sp[12],
    paddingHorizontal: sp[6],
  },
  emptyIcon: {
    width: 64,
    height: 64,
    borderRadius: 32,
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: sp[2],
    backgroundColor: c.surface2,
    borderWidth: 1,
    borderColor: c.borderDefault,
  },
});
