export const lightColors = {
  primary: '#39E079',
  background: '#f6f8f7',
  surface: '#ffffff',
  surfaceBorder: '#e0e0e0',
  inputBorder: '#d0d0d0',
  textPrimary: '#122017',
  textSecondary: '#666666',
  textMuted: '#999999',
  textPlaceholder: '#999999',
};

export const darkColors = {
  primary: '#39E079',
  background: '#122017',
  surface: '#193324',
  surfaceBorder: '#234832',
  inputBorder: '#326747',
  textPrimary: 'white',
  textSecondary: '#92c9a8',
  textMuted: '#326747',
  textPlaceholder: '#326747',
};

export const getColors = (isDark: boolean) => isDark ? darkColors : lightColors;