// =====================================================================
// FinTrack: tipos compartilhados
// =====================================================================

// 1) CATEGORIAS --------------------------------------------------------

export type TransactionType = 'income' | 'expense';

export interface Category {
  id: string;
  name: string;
  type: TransactionType;
  icon: string; // nome do ícone (Ionicons)
  color: string; // cor em hexadecimal
}

// 2) TRANSAÇÕES --------------------------------------------------------

export type TransactionSource = 'manual' | 'open_finance';

export interface Transaction {
  id: string;
  user_id: string;
  category_id: string;
  type: TransactionType;
  description: string;
  amount: number;
  date: string; // AAAA-MM-DD
  created_at: string; // ISO 8601

  // Relação (vem do join com categories)
  category: Category | null;

  // Origem do lançamento
  source: TransactionSource;
  connection_id: string | null; // preenchido quando source = 'open_finance'
  external_id: string | null; // id da transação no banco/Pluggy
  account_name: string | null;
}

// Dados enviados ao criar/editar uma transação manual
export type TransactionInput = Pick<
  Transaction,
  'category_id' | 'type' | 'description' | 'amount' | 'date'
>;

// 3) OPEN FINANCE (PLUGGY) ---------------------------------------------

export interface BankConnection {
  id: string;
  pluggy_item_id: string;
  institution_name: string;
  institution_image_url: string | null;
  status: 'connected' | 'error';
  last_error: string | null;
  last_synced_at: string | null; // ISO 8601
  created_at: string; // ISO 8601
}

export interface SyncResult {
  connection_id: string;
  imported: number; // lançamentos novos
  fetched: number; // lançamentos lidos do banco no período
}
