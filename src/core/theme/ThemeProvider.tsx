import {
  DarkTheme as NavDarkTheme,
  DefaultTheme as NavLightTheme,
  ThemeProvider as NavigationThemeProvider,
} from 'expo-router';
import * as SystemUI from 'expo-system-ui';
import { createContext, type PropsWithChildren, use, useEffect } from 'react';
import { StyleSheet, useColorScheme } from 'react-native';

import { type ColorScheme, type Theme, themes } from './theme';

export type ThemeMode = 'system' | ColorScheme;

const ThemeContext = createContext<Theme>(themes.light);

export function ThemeProvider({ mode, children }: PropsWithChildren<{ mode: ThemeMode }>) {
  const systemScheme = useColorScheme();
  const scheme: ColorScheme = mode === 'system' ? (systemScheme === 'dark' ? 'dark' : 'light') : mode;
  const theme = themes[scheme];

  // Root view background: avoids white flashes behind screens/keyboard in dark mode.
  useEffect(() => {
    void SystemUI.setBackgroundColorAsync(theme.colors.background);
  }, [theme]);

  const base = scheme === 'dark' ? NavDarkTheme : NavLightTheme;
  const navigationTheme = {
    ...base,
    colors: {
      ...base.colors,
      primary: theme.colors.primary,
      background: theme.colors.background,
      card: theme.colors.surface,
      text: theme.colors.text,
      border: theme.colors.border,
    },
  };

  return (
    <ThemeContext value={theme}>
      <NavigationThemeProvider value={navigationTheme}>{children}</NavigationThemeProvider>
    </ThemeContext>
  );
}

export function useTheme(): Theme {
  return use(ThemeContext);
}

/**
 * Themed styles, defined once at module level:
 *   const useStyles = makeStyles((t) => ({ container: { backgroundColor: t.colors.background } }));
 *   const styles = useStyles();
 * Each StyleSheet is created once per color scheme and reused (no per-render allocations).
 */
export function makeStyles<T extends StyleSheet.NamedStyles<T>>(factory: (theme: Theme) => T) {
  const byScheme = new Map<ColorScheme, T>();
  return function useStyles(): T {
    const theme = useTheme();
    let styles = byScheme.get(theme.scheme);
    if (!styles) {
      styles = StyleSheet.create(factory(theme));
      byScheme.set(theme.scheme, styles);
    }
    return styles;
  };
}
