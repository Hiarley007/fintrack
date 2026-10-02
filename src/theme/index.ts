// =====================================================================
// FinTrack: tema (cores, espaçamentos, bordas e sombras)
// =====================================================================

// 1) CORES -------------------------------------------------------------

export const colors = {
  // Marca
  primary: '#0F766E',
  primarySoft: '#CCFBF1',

  // Base
  background: '#F4F6F8',
  surface: '#FFFFFF',
  text: '#0F172A',
  muted: '#64748B',
  border: '#E2E8F0',

  // Estados / tipos de transação
  income: '#16A34A',
  expense: '#DC2626',
  danger: '#DC2626',
} as const;

// 2) ESPAÇAMENTOS ------------------------------------------------------

export const spacing = {
  xs: 4,
  sm: 8,
  md: 16,
  lg: 24,
  xl: 32,
} as const;

// 3) BORDAS ARREDONDADAS -----------------------------------------------

export const radius = {
  sm: 8,
  md: 12,
  lg: 20,
  pill: 999,
} as const;

// 4) SOMBRA ------------------------------------------------------------
// Sem `as const` aqui: o StyleSheet espera um tipo mutável.
// shadow* funciona no iOS; `elevation` faz o mesmo no Android.

export const shadow = {
  shadowColor: '#0F172A',
  shadowOpacity: 0.08,
  shadowRadius: 8,
  shadowOffset: { width: 0, height: 2 },
  elevation: 2,
};

// 5) TIPOS ÚTEIS -------------------------------------------------------

export type ColorName = keyof typeof colors;
export type SpacingName = keyof typeof spacing;
export type RadiusName = keyof typeof radius;