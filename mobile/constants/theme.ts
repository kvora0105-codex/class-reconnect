export const Colors = {
  primary: '#6C63FF',
  primaryDark: '#4A43CC',
  primaryLight: '#9D97FF',
  secondary: '#FF6584',
  accent: '#00D2FF',
  accentGreen: '#4ECCA3',

  background: '#0F0F1A',
  surface: '#1A1A2E',
  surface2: '#16213E',
  surface3: '#0D1B2A',
  card: '#1E1E35',
  border: '#2A2A45',

  success: '#4CAF50',
  warning: '#FF9800',
  error: '#F44336',
  info: '#2196F3',

  text: '#FFFFFF',
  textSecondary: '#B0B0C8',
  textMuted: '#6B6B8A',
  textInverse: '#0F0F1A',

  gradientPrimary: ['#6C63FF', '#9D50BB'] as const,
  gradientSecondary: ['#FF6584', '#FF9A8B'] as const,
  gradientDark: ['#1A1A2E', '#0F0F1A'] as const,
  gradientAccent: ['#00D2FF', '#3A7BD5'] as const,
  gradientStudent: ['#6C63FF', '#4A90E2'] as const,
  gradientTeacher: ['#FF6584', '#FF9800'] as const,
};

export const Spacing = {
  xs: 4,
  sm: 8,
  md: 16,
  lg: 24,
  xl: 32,
  xxl: 48,
};

export const FontSize = {
  xs: 11,
  sm: 13,
  md: 15,
  lg: 17,
  xl: 20,
  xxl: 24,
  xxxl: 30,
  display: 38,
};

export const Radius = {
  sm: 8,
  md: 12,
  lg: 16,
  xl: 20,
  xxl: 28,
  full: 999,
};

export const Shadow = {
  sm: {
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.15,
    shadowRadius: 4,
    elevation: 3,
  },
  md: {
    shadowColor: '#6C63FF',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.2,
    shadowRadius: 8,
    elevation: 6,
  },
  lg: {
    shadowColor: '#6C63FF',
    shadowOffset: { width: 0, height: 8 },
    shadowOpacity: 0.3,
    shadowRadius: 16,
    elevation: 12,
  },
};

export const BACKEND_URL = 'http://10.0.2.2:3000'; // Android emulator → localhost
// For physical device: change to your PC's local IP e.g. 'http://192.168.1.x:3000'
