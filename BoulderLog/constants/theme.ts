import { Platform } from 'react-native';

export const colors = {
  wall: '#201E1C',
  chalk: '#F4EFE6',
  chalkDim: '#B7AFA2',
  surface: '#FFFFFF',
  surfaceMuted: '#F1ECDF',
  border: 'rgba(32,30,28,0.08)',
  textMuted: '#8A8378',
  accent: '#3EC1D3',
  accentSoft: '#3EC1D31A',

  tapeGreen: '#6FCB53',
  tapeYellow: '#F4C430',
  tapeOrange: '#FF6B35',
  tapeRed: '#E63946',
};

export const mono = Platform.select({ ios: 'Courier New', android: 'monospace', default: 'monospace' });

export const radius = { sm: 8, md: 12, lg: 16, xl: 22 };

/** Grade tape color, matching the gym-convention legend used across the mockups. */
export function gradeColor(grade: string): string {
  const n = parseInt(grade.replace(/[^\d]/g, ''), 10) || 0;
  if (n <= 2) return colors.tapeGreen;
  if (n <= 4) return colors.tapeYellow;
  if (n <= 6) return colors.tapeOrange;
  return colors.tapeRed;
}

export function conditionColor(condition: 'good' | 'low' | 'worn_out'): string {
  return {
    good: colors.tapeGreen,
    low: colors.tapeYellow,
    worn_out: colors.tapeRed,
  }[condition];
}

export function conditionLabel(condition: 'good' | 'low' | 'worn_out'): string {
  return { good: 'Good', low: 'Low', worn_out: 'Worn out' }[condition];
}
