import { Text, type TextProps } from 'react-native';

import type { Theme } from '@/core/theme/theme';
import { useTheme } from '@/core/theme/ThemeProvider';

type Props = TextProps & {
  variant?: keyof Theme['typography'];
  color?: keyof Theme['colors'];
};

/** Themed text. Use `textAlign: 'auto'` defaults so text follows LTR/RTL automatically. */
export function AppText({ variant = 'body', color = 'text', style, ...rest }: Props) {
  const theme = useTheme();
  return (
    <Text
      style={[theme.typography[variant], { color: theme.colors[color] }, style]}
      maxFontSizeMultiplier={1.6}
      {...rest}
    />
  );
}
