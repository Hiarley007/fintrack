import type { Transaction, TransactionType } from '@/types';

// ─────────────────────────────────────────────────────────────
// Resumo, filtro e agrupamento de transações
// ─────────────────────────────────────────────────────────────

// ── Tipos ────────────────────────────────────────────────────

export interface CategoryTotal {
  categoryId: string;
  name: string;
  color: string;
  icon: string;
  total: number;
  percent: number; // 0 a 100, sobre o total de despesas
}

export interface Summary {
  income: number;
  expense: number;
  balance: number;
  byCategory: CategoryTotal[];
}

export interface DayGroup {
  date: string;
  data: Transaction[];
}

// ── Constantes ───────────────────────────────────────────────

/** Valores usados quando a transação não tem categoria. */
const NO_CATEGORY = {
  id: 'none',
  name: 'Sem categoria',
  color: '#94A3B8',
  icon: 'pricetag',
} as const;

// ── Resumo ───────────────────────────────────────────────────

const toCents = (value: number) => Math.round(value * 100);
const fromCents = (cents: number) => cents / 100;

/** Cria o acumulador de uma categoria (ainda em centavos) a partir da transação. */
function newCategoryTotal(t: Transaction): CategoryTotal {
  return {
    categoryId: t.category?.id ?? NO_CATEGORY.id,
    name: t.category?.name ?? NO_CATEGORY.name,
    color: t.category?.color ?? NO_CATEGORY.color,
    icon: t.category?.icon ?? NO_CATEGORY.icon,
    total: 0,
    percent: 0,
  };
}

/**
 * Totaliza receitas, despesas, saldo e despesas por categoria.
 * A soma é feita em centavos (inteiros) para evitar erros de ponto flutuante.
 */
export function summarize(transactions: Transaction[]): Summary {
  let income = 0;
  let expense = 0;
  const totals = new Map<string, CategoryTotal>();

  for (const t of transactions) {
    const cents = toCents(t.amount);

    if (t.type === 'income') {
      income += cents;
      continue;
    }

    expense += cents;

    const id = t.category?.id ?? NO_CATEGORY.id;
    const current = totals.get(id) ?? newCategoryTotal(t);
    current.total += cents;
    totals.set(id, current);
  }

  const byCategory = Array.from(totals.values())
    .map((c) => ({
      ...c,
      total: fromCents(c.total),
      percent: expense > 0 ? (c.total / expense) * 100 : 0,
    }))
    .sort((a, b) => b.total - a.total);

  return {
    income: fromCents(income),
    expense: fromCents(expense),
    balance: fromCents(income - expense),
    byCategory,
  };
}

// ── Filtro ───────────────────────────────────────────────────

/** Minúsculas e sem acentos, para busca tolerante ("cafe" acha "Café"). */
const normalize = (s: string) =>
  s
    .toLowerCase()
    .normalize('NFD')
    .replace(/[\u0300-\u036f]/g, '');

/** Filtra por tipo e por texto (descrição ou nome da categoria). */
export function filterTransactions(
  list: Transaction[],
  type: 'all' | TransactionType,
  query: string,
): Transaction[] {
  const q = normalize(query.trim());

  return list.filter((t) => {
    if (type !== 'all' && t.type !== type) return false;
    if (!q) return true;
    return normalize(`${t.description} ${t.category?.name ?? ''}`).includes(q);
  });
}

// ── Agrupamento ──────────────────────────────────────────────

/** Agrupa por dia mantendo a ordem recebida (o servidor já ordena por data). */
export function groupByDate(list: Transaction[]): DayGroup[] {
  const groups = new Map<string, Transaction[]>();

  for (const t of list) {
    const day = groups.get(t.date);
    if (day) day.push(t);
    else groups.set(t.date, [t]);
  }

  return Array.from(groups, ([date, data]) => ({ date, data }));
}