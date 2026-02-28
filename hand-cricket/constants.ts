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
  surface: '#142a1d',
  surfaceBorder: '#234832',
  inputBorder: '#234832',
  textPrimary: 'white',
  textSecondary: '#92c9a8',
  textMuted: '#5a8b6d',
  textPlaceholder: '#5a8b6d',
};

export const getColors = (isDark: boolean) => isDark ? darkColors : lightColors;