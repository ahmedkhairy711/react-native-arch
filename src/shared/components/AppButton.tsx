import { ActivityIndicator, Pressable, type PressableProps } from 'react-native';

import { makeStyles, useTheme } from '@/core/theme/ThemeProvider';

import { AppText } from './AppText';

type Props = Omit<PressableProps, 'children'> & {
  title: string;
  variant?: 'primary' | 'outline';
  loading?: boolean;
};

export function AppButton({ title, variant = 'primary', loading = false, disabled, style, ...rest }: Props) {
  const styles = useStyles();
  const theme = useTheme();
  const isDisabled = disabled || loading;
  const isPrimary = variant === 'primary';

  return (
    <Pressable
      accessibilityRole="button"
      accessibilityState={{ disabled: isDisabled, busy: loading }}
      disabled={isDisabled}
      style={(state) => [
        styles.base,
        isPrimary ? styles.primary : styles.outline,
        (state.pressed || isDisabled) && styles.dimmed,
        typeof style === 'function' ? style(state) : style,
      ]}
      {...rest}
    >
      {loading ? (
        <ActivityIndicator color={isPrimary ? theme.colors.onPrimary : theme.colors.primary} />
      ) : (
        <AppText variant="label" color={isPrimary ? 'onPrimary' : 'primary'}>
          {title}
        </AppText>
      )}
    </Pressable>
  );
}

const useStyles = makeStyles((t) => ({
  base: {
    minHeight: 48,
    borderRadius: t.radius.md,
    paddingHorizontal: t.spacing.lg,
    alignItems: 'center',
    justifyContent: 'center',
  },
  primary: { backgroundColor: t.colors.primary },
  outline: { borderWidth: 1, borderColor: t.colors.primary },
  dimmed: { opacity: 0.6 },
}));
