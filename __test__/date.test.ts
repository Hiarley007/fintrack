import {
  addDaysISO,
  brToISO,
  dayLabel,
  isoToBr,
  maskBrDate,
  monthLabel,
  monthRange,
  shiftMonth,
} from '@/utils/date';

// ─────────────────────────────────────────────────────────────
// Conversões de datas
// ─────────────────────────────────────────────────────────────

describe('addDaysISO', () => {
  it('soma dias atravessando o mês', () => {
    expect(addDaysISO('2026-03-01', -1)).toBe('2026-02-28');
  });
});

describe('isoToBr / brToISO', () => {
  it('converte ISO para BR e de volta', () => {
    expect(isoToBr('2026-09-19')).toBe('19/09/2026');
    expect(brToISO('19/09/2026')).toBe('2026-09-19');
  });

  it.each([
    ['31/02/2026', 'dia inexistente no mês'],
    ['19/13/2026', 'mês inexistente'],
    ['19/09/26', 'ano com 2 dígitos'],
  ])('rejeita data inválida: "%s" (%s)', (text) => {
    expect(brToISO(text)).toBeNull();
  });
});

describe('maskBrDate', () => {
  it.each([
    ['19092026', '19/09/2026'],
    ['1909', '19/09'],
    ['19a', '19'],
  ])('aplica a máscara DD/MM/AAAA: "%s" -> "%s"', (text, expected) => {
    expect(maskBrDate(text)).toBe(expected);
  });
});

// ─────────────────────────────────────────────────────────────
// Meses
// ─────────────────────────────────────────────────────────────

describe('shiftMonth', () => {
  it('avança atravessando o ano', () => {
    expect(shiftMonth({ year: 2026, month: 12 }, 1)).toEqual({ year: 2027, month: 1 });
  });

  it('volta atravessando o ano', () => {
    expect(shiftMonth({ year: 2026, month: 1 }, -1)).toEqual({ year: 2025, month: 12 });
  });
});

describe('monthRange', () => {
  it('calcula o intervalo do mês', () => {
    expect(monthRange({ year: 2026, month: 12 })).toEqual({
      start: '2026-12-01',
      endExclusive: '2027-01-01',
    });
  });
});

// ─────────────────────────────────────────────────────────────
// Rótulos
// ─────────────────────────────────────────────────────────────

describe('monthLabel', () => {
  it('gera o rótulo em português', () => {
    expect(monthLabel({ year: 2026, month: 9 })).toBe('Setembro 2026');
  });
});

describe('dayLabel', () => {
  const today = '2026-09-19';

  it.each([
    ['2026-09-19', 'Hoje'],
    ['2026-09-18', 'Ontem'],
    ['2026-09-10', '10/09'],
  ])('usa Hoje, Ontem ou dd/mm: %s -> "%s"', (iso, expected) => {
    expect(dayLabel(iso, today)).toBe(expected);
  });
});