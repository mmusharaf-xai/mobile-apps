export const lightColors = {
  primary: '#19e62b',
  background: '#f4f7f5',
  surface: '#ffffff',
  surfaceBorder: '#e0e0e0',
  inputBorder: '#d0d0d0',
  textPrimary: '#0a1a11',
  textSecondary: '#64748b',
  textMuted: '#64748b',
  textPlaceholder: '#64748b',
};

export const darkColors = {
  primary: '#19e62b',
  background: '#0a1a11',
  surface: '#1a3d2a',
  surfaceBorder: '#2a5a3a',
  inputBorder: '#3a7a4a',
  textPrimary: 'white',
  textSecondary: '#92c9a8',
  textMuted: '#3a7a4a',
  textPlaceholder: '#3a7a4a',
};

export const getColors = (isDark: boolean) => isDark ? darkColors : lightColors;