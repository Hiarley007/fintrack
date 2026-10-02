import type { Transaction } from '@/types';
import { isoToBr } from './date';

// ─────────────────────────────────────────────────────────────
// Exportação de transações para CSV
//
// Separador ";" e vírgula decimal: abre corretamente no Excel em português.
// ─────────────────────────────────────────────────────────────

// ── Constantes ───────────────────────────────────────────────

const SEPARATOR = ';';
const LINE_BREAK = '\n';
const HEADER = ['data', 'tipo', 'categoria', 'descricao', 'valor'].join(SEPARATOR);

/** Texto que começa com esses caracteres é lido como fórmula pelo Excel. */
const FORMULA_START = /^[=+\-@]/;

const TYPE_LABEL = {
  income: 'Receita',
  expense: 'Despesa',
} as const;

// ── Formatação de células ────────────────────────────────────

/**
 * Prepara um texto para uma célula CSV:
 * - neutraliza fórmulas (=, +, -, @) com um apóstrofo na frente;
 * - envolve em aspas e escapa aspas internas ("" ).
 */
function cell(value: string): string {
  const safe = FORMULA_START.test(value) ? `'${value}` : value;
  return `"${safe.replace(/"/g, '""')}"`;
}

/** 1234.5 -> "1234,50" */
function formatAmount(amount: number): string {
  return amount.toFixed(2).replace('.', ',');
}

function typeLabel(type: Transaction['type']): string {
  return type === 'income' ? TYPE_LABEL.income : TYPE_LABEL.expense;
}

// ── Exportação ───────────────────────────────────────────────

function toRow(t: Transaction): string {
  return [
    isoToBr(t.date),
    typeLabel(t.type),
    cell(t.category?.name ?? ''),
    cell(t.description),
    formatAmount(t.amount),
  ].join(SEPARATOR);
}

/** Gera o conteúdo do CSV: um cabeçalho e uma linha por transação. */
export function toCsv(transactions: Transaction[]): string {
  return [HEADER, ...transactions.map(toRow)].join(LINE_BREAK);
}