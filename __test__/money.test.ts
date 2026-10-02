import { formatMoney, parseMoney, roundMoney, toInputMoney } from '@/utils/money';

// O Intl usa espaço sem quebra (U+00A0) entre "R$" e o número.
const NBSP = /\u00a0/g;
const withNormalSpaces = (s: string) => s.replace(NBSP, ' ');

// ── formatMoney ──────────────────────────────────────────────

describe('formatMoney', () => {
  it('formata em reais', () => {
    expect(withNormalSpaces(formatMoney(1234.5))).toBe('R$ 1.234,50');
  });
});

// ── parseMoney ───────────────────────────────────────────────

describe('parseMoney', () => {
  it.each([
    ['10,5', 10.5],
    ['0,99', 0.99],
  ])('aceita vírgula decimal: "%s" -> %d', (text, expected) => {
    expect(parseMoney(text)).toBe(expected);
  });

  it.each([
    ['1.234,56', 1234.56],
    ['1.234', 1234],
  ])('aceita ponto como separador de milhar: "%s" -> %d', (text, expected) => {
    expect(parseMoney(text)).toBe(expected);
  });

  it('aceita ponto decimal', () => {
    expect(parseMoney('12.5')).toBe(12.5);
  });

  it.each([[''], ['abc']])('retorna NaN para texto sem números: "%s"', (text) => {
    expect(parseMoney(text)).toBeNaN();
  });
});

// ── roundMoney ───────────────────────────────────────────────

describe('roundMoney', () => {
  it('arredonda para 2 casas', () => {
    expect(roundMoney(0.1 + 0.2)).toBe(0.3);
  });
});

// ── toInputMoney ─────────────────────────────────────────────

describe('toInputMoney', () => {
  it('gera texto de campo com vírgula', () => {
    expect(toInputMoney(1234.5)).toBe('1234,50');
  });
});