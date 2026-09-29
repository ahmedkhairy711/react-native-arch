/** Design tokens. Screens never hardcode colors/sizes - always read them from the theme. */

const palette = {
  primary500: '#4F46E5',
  primary400: '#818CF8',
  red500: '#DC2626',
  red400: '#F87171',
  green500: '#16A34A',
  green400: '#4ADE80',
  white: '#FFFFFF',
  gray50: '#F8FAFC',
  gray100: '#F1F5F9',
  gray200: '#E2E8F0',
  gray400: '#94A3B8',
  gray500: '#64748B',
  gray700: '#334155',
  gray800: '#1E293B',
  gray900: '#111827',
  gray950: '#0B0F19',
} as const;

export type ColorScheme = 'light' | 'dark';

export type ThemeColors = {
  primary: string;
  onPrimary: string;
  background: string;
  surface: string;
  border: string;
  text: string;
  textMuted: string;
  error: string;
  success: string;
};

const lightColors: ThemeColors = {
  primary: palette.primary500,
  onPrimary: palette.white,
  background: palette.gray50,
  surface: palette.white,
  border: palette.gray200,
  text: palette.gray900,
  textMuted: palette.gray500,
  error: palette.red500,
  success: palette.green500,
};

const darkColors: ThemeColors = {
  primary: palette.primary400,
  onPrimary: palette.gray950,
  background: palette.gray950,
  surface: palette.gray800,
  border: palette.gray700,
  text: palette.gray100,
  textMuted: palette.gray400,
  error: palette.red400,
  success: palette.green400,
};

const spacing = { xs: 4, sm: 8, md: 12, lg: 16, xl: 24, xxl: 32 } as const;
const radius = { sm: 6, md: 10, lg: 16, full: 999 } as const;

const typography = {
  title: { fontSize: 28, lineHeight: 34, fontWeight: '700' },
  heading: { fontSize: 20, lineHeight: 26, fontWeight: '600' },
  body: { fontSize: 16, lineHeight: 22, fontWeight: '400' },
  label: { fontSize: 14, lineHeight: 20, fontWeight: '500' },
  caption: { fontSize: 12, lineHeight: 16, fontWeight: '400' },
} as const;

export type Theme = {
  scheme: ColorScheme;
  colors: ThemeColors;
  spacing: typeof spacing;
  radius: typeof radius;
  typography: typeof typography;
};

export const themes: Record<ColorScheme, Theme> = {
  light: { scheme: 'light', colors: lightColors, spacing, radius, typography },
  dark: { scheme: 'dark', colors: darkColors, spacing, radius, typography },
};
