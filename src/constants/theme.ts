export const Colors = {
  bg: '#0D1117',
  bgCard: '#161B22',
  bgInput: '#21262D',
  bgModal: '#1C2128',
  primary: '#3375BB',
  primaryLight: '#4A90D9',
  success: '#00C48C',
  warning: '#FFB800',
  danger: '#FF5A5F',
  textPrimary: '#FFFFFF',
  textSecondary: '#8B949E',
  textMuted: '#484F58',
  border: '#30363D',
  borderLight: '#21262D',
  eth: '#627EEA',
  bnb: '#F0B90B',
  matic: '#8247E5',
};

export const Typography = {
  h1: { fontSize: 28, fontWeight: '700' as const, color: Colors.textPrimary },
  h2: { fontSize: 22, fontWeight: '700' as const, color: Colors.textPrimary },
  h3: { fontSize: 18, fontWeight: '600' as const, color: Colors.textPrimary },
  body: { fontSize: 15, fontWeight: '400' as const, color: Colors.textPrimary },
  caption: { fontSize: 12, fontWeight: '400' as const, color: Colors.textSecondary },
  label: { fontSize: 13, fontWeight: '500' as const, color: Colors.textSecondary },
};

export const Spacing = { xs: 4, sm: 8, md: 16, lg: 24, xl: 32, xxl: 48 };
export const Radius = { sm: 8, md: 12, lg: 16, xl: 24, full: 999 };