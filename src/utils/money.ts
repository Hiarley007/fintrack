// ─────────────────────────────────────────────────────────────
// Utilitários de valores monetários (BRL)
// ─────────────────────────────────────────────────────────────

// ── Constantes ───────────────────────────────────────────────

const brlFormatter = new Intl.NumberFormat('pt-BR', {
  style: 'currency',
  currency: 'BRL',
});

/** Qualquer caractere que não seja dígito, ponto ou vírgula. */
const NON_MONEY_CHARS = /[^\d.,]/g;

/** Pelo menos um dígito. */
const HAS_DIGIT = /\d/;

/** Ponto usado apenas como separador de milhar: "1.234", "12.345.678". */
const DOT_THOUSANDS_ONLY = /^\d{1,3}(\.\d{3})+$/;

// ── Exibição ─────────────────────────────────────────────────

/** 1234.5 -> "R$ 1.234,50" */
export function formatMoney(value: number): string {
  return brlFormatter.format(value);
}

/** Valor numérico -> texto de campo: 1234.5 -> "1234,50" */
export function toInputMoney(value: number): string {
  return value.toFixed(2).replace('.', ',');
}

// ── Leitura de texto digitado ────────────────────────────────

/**
 * Converte o texto digitado pelo usuário em número.
 * Aceita "1.234,56", "10,5", "12.5" e "1.234".
 * Retorna NaN quando o texto não representa um valor.
 */
export function parseMoney(text: string): number {
  const clean = text.replace(NON_MONEY_CHARS, '');
  if (!HAS_DIGIT.test(clean)) return NaN;

  return Number(toJsNumberString(clean));
}

/**
 * Normaliza um texto numérico (só dígitos, pontos e vírgulas)
 * para o formato que `Number()` entende.
 */
function toJsNumberString(clean: string): string {
  // Com vírgula: formato pt-BR. Pontos são milhar, vírgula é decimal.
  if (clean.includes(',')) {
    return clean.replace(/\./g, '').replace(',', '.');
  }

  // Sem vírgula, mas com grupos de 3 dígitos após o ponto: é milhar ("1.234").
  if (DOT_THOUSANDS_ONLY.test(clean)) {
    return clean.replace(/\./g, '');
  }

  // Caso contrário, o ponto é decimal ("12.5").
  return clean;
}

// ── Aritmética ───────────────────────────────────────────────

/** Arredonda para 2 casas decimais. */
export function roundMoney(value: number): number {
  return Math.round(value * 100) / 100;
}