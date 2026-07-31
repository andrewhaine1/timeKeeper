export interface Palette {
  background: string;
  surface: string;
  card: string;
  text: string;
  textMuted: string;
  border: string;
  primary: string;
  primaryText: string;
  danger: string;
}

export const lightPalette: Palette = {
  background: '#f4f5f7',
  surface: '#ffffff',
  card: '#ffffff',
  text: '#1a1a1a',
  textMuted: '#6b7280',
  border: '#e2e5e9',
  primary: '#3f51b5',
  primaryText: '#ffffff',
  danger: '#dc3545',
};

export const darkPalette: Palette = {
  background: '#121212',
  surface: '#1e1e1e',
  card: '#242424',
  text: '#f4f4f4',
  textMuted: '#a0a0a0',
  border: '#333333',
  primary: '#7986cb',
  primaryText: '#121212',
  danger: '#ef5350',
};

export function getPalette(isDark: boolean): Palette {
  return isDark ? darkPalette : lightPalette;
}
