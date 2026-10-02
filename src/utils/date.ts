// ─────────────────────────────────────────────────────────────
// Utilitários de datas
//
// As datas do app trafegam como texto AAAA-MM-DD ("ISO"),
// o que evita bugs de fuso horário.
// ─────────────────────────────────────────────────────────────

// ── Tipos e constantes ───────────────────────────────────────

export interface YearMonth {
  year: number;
  month: number; // 1 a 12
}

export const MONTHS_PT = [
  'Janeiro',
  'Fevereiro',
  'Março',
  'Abril',
  'Maio',
  'Junho',
  'Julho',
  'Agosto',
  'Setembro',
  'Outubro',
  'Novembro',
  'Dezembro',
];

/** Data no formato brasileiro com 3 grupos: DD/MM/AAAA. */
const BR_DATE = /^(\d{2})\/(\d{2})\/(\d{4})$/;

// ── Helpers internos ─────────────────────────────────────────

const pad = (n: number) => String(n).padStart(2, '0');

/** Separa "AAAA-MM-DD" em números (mês de 1 a 12). */
function parseISO(iso: string): [year: number, month: number, day: number] {
  const [y, m, d] = iso.split('-').map(Number);
  return [y, m, d];
}

// ── Conversões: Date <-> ISO ─────────────────────────────────

/** Date -> "AAAA-MM-DD" (usa o fuso local). */
export function toISO(date: Date): string {
  return `${date.getFullYear()}-${pad(date.getMonth() + 1)}-${pad(date.getDate())}`;
}

export function todayISO(): string {
  return toISO(new Date());
}

/** Soma (ou subtrai, se negativo) dias a uma data ISO. */
export function addDaysISO(iso: string, days: number): string {
  const [y, m, d] = parseISO(iso);
  return toISO(new Date(y, m - 1, d + days));
}

// ── Conversões: ISO <-> formato brasileiro ───────────────────

/** "2026-12-25" -> "25/12/2026" */
export function isoToBr(iso: string): string {
  const [y, m, d] = iso.split('-');
  return `${d}/${m}/${y}`;
}

/** "25/12/2026" -> "2026-12-25". Retorna null se a data não existir. */
export function brToISO(br: string): string | null {
  const match = BR_DATE.exec(br.trim());
  if (!match) return null;

  const [, dd, mm, yyyy] = match;
  const day = Number(dd);
  const month = Number(mm);
  const year = Number(yyyy);

  // O Date "rola" datas inválidas (31/02 vira março); se algum campo
  // mudou depois da construção, a data original não existia.
  const check = new Date(year, month - 1, day);
  const exists =
    check.getFullYear() === year &&
    check.getMonth() === month - 1 &&
    check.getDate() === day;

  return exists ? `${yyyy}-${mm}-${dd}` : null;
}

/** Máscara DD/MM/AAAA aplicada enquanto o usuário digita. */
export function maskBrDate(text: string): string {
  const digits = text.replace(/\D/g, '').slice(0, 8);

  if (digits.length <= 2) return digits;
  if (digits.length <= 4) return `${digits.slice(0, 2)}/${digits.slice(2)}`;
  return `${digits.slice(0, 2)}/${digits.slice(2, 4)}/${digits.slice(4)}`;
}

// ── Ano/mês ──────────────────────────────────────────────────

export function currentYearMonth(): YearMonth {
  const now = new Date();
  return { year: now.getFullYear(), month: now.getMonth() + 1 };
}

/** Avança (ou recua, se negativo) `delta` meses. */
export function shiftMonth(ym: YearMonth, delta: number): YearMonth {
  // Converte para um índice contínuo de meses, soma e converte de volta.
  const index = ym.year * 12 + (ym.month - 1) + delta;
  return { year: Math.floor(index / 12), month: (index % 12) + 1 };
}

/**
 * Intervalo [start, endExclusive) do mês, em AAAA-MM-DD.
 * O fim é exclusivo: é o dia 1 do mês seguinte.
 */
export function monthRange(ym: YearMonth): { start: string; endExclusive: string } {
  const next = shiftMonth(ym, 1);
  return {
    start: `${ym.year}-${pad(ym.month)}-01`,
    endExclusive: `${next.year}-${pad(next.month)}-01`,
  };
}

// ── Rótulos para exibição ────────────────────────────────────

/** { year: 2026, month: 9 } -> "Setembro 2026" */
export function monthLabel(ym: YearMonth): string {
  return `${MONTHS_PT[ym.month - 1]} ${ym.year}`;
}

/** "Hoje", "Ontem" ou "DD/MM". O parâmetro `today` facilita testes. */
export function dayLabel(iso: string, today: string = todayISO()): string {
  if (iso === today) return 'Hoje';
  if (iso === addDaysISO(today, -1)) return 'Ontem';
  return isoToBr(iso).slice(0, 5);
}

/**
 * "2026-09-19T14:30:00Z" -> "19/09 às 11:30" (horário local do aparelho).
 * Retorna string vazia se o texto não for uma data válida.
 */
export function formatDateTime(isoDateTime: string): string {
  const date = new Date(isoDateTime);
  if (Number.isNaN(date.getTime())) return '';

  const day = `${pad(date.getDate())}/${pad(date.getMonth() + 1)}`;
  const time = `${pad(date.getHours())}:${pad(date.getMinutes())}`;
  return `${day} às ${time}`;
}