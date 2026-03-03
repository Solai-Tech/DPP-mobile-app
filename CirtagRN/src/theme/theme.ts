import * as Colors from './colors';

export interface AppTheme {
  dark: boolean;
  colors: {
    primary: string;
    onPrimary: string;
    primaryContainer: string;
    onPrimaryContainer: string;
    secondary: string;
    secondaryContainer: string;
    tertiary: string;
    tertiaryContainer: string;
    background: string;
    surface: string;
    error: string;
    onBackground: string;
    onSurface: string;
    onSurfaceVariant: string;
  };
}

// Botanical Fresh light theme
export const CirtagTheme: AppTheme = {
  dark: false,
  colors: {
    primary: Colors.Accent,
    onPrimary: '#FFFFFF',
    primaryContainer: Colors.PrimaryContainer,
    onPrimaryContainer: Colors.OnPrimaryContainer,
    secondary: Colors.Secondary,
    secondaryContainer: Colors.SecondaryContainer,
    tertiary: Colors.Warm,
    tertiaryContainer: Colors.WarmLight,
    background: Colors.BackgroundDark,
    surface: Colors.SurfaceDark,
    error: Colors.Error,
    onBackground: Colors.TextPrimary,
    onSurface: Colors.TextPrimary,
    onSurfaceVariant: Colors.TextSecondary,
  },
};

export function useAppTheme(): AppTheme {
  return CirtagTheme;
}
