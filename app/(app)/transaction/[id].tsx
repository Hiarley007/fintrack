import { useLocalSearchParams, useRouter } from 'expo-router';
import { Alert, Platform } from 'react-native';

import { Screen } from '@/components/Screen';
import { ImportedTransactionForm } from '@/components/ImportedTransactionForm';
import { ErrorState, LoadingView } from '@/components/StateViews';
import { TransactionForm } from '@/components/TransactionForm';
import {
  useDeleteTransaction,
  useRecategorizeTransaction,
  useSaveTransaction,
  useTransaction,
} from '@/hooks/useTransactions';
import { friendlyError } from '@/utils/errors';

// ─── Helpers (funcionam no web e no celular) ─────────────────────────────────

function showMessage(title: string, message?: string) {
  if (Platform.OS === 'web') {
    window.alert(message ? `${title}\n\n${message}` : title);
    return;
  }
  Alert.alert(title, message);
}

// ─── Tela ────────────────────────────────────────────────────────────────────

export default function EditTransactionScreen() {
  const { id } = useLocalSearchParams<{ id: string }>();
  const router = useRouter();

  const { data, isLoading, isError, error, refetch } = useTransaction(id);
  const save = useSaveTransaction();
  const remove = useDeleteTransaction();
  const recategorize = useRecategorizeTransaction();

  if (isLoading) return <LoadingView />;

  if (isError || !data) {
    return <ErrorState message={friendlyError(error)} onRetry={refetch} />;
  }

  function doDelete() {
    remove.mutate(id, {
      onSuccess: () => router.back(),
      onError: (e) => showMessage('Erro ao excluir', friendlyError(e)),
    });
  }

  function confirmDelete() {
    if (Platform.OS === 'web') {
      if (window.confirm('Excluir lançamento\n\nEssa ação não pode ser desfeita.')) {
        doDelete();
      }
      return;
    }

    Alert.alert('Excluir lançamento', 'Essa ação não pode ser desfeita.', [
      { text: 'Cancelar', style: 'cancel' },
      { text: 'Excluir', style: 'destructive', onPress: doDelete },
    ]);
  }

  if (data.source === 'open_finance') {
    return (
      <Screen scroll edges={['bottom', 'left', 'right']}>
        <ImportedTransactionForm
          transaction={data}
          submitting={recategorize.isPending}
          onSubmit={(categoryId) =>
            recategorize.mutate(
              { id: data.id, categoryId },
              {
                onSuccess: () => router.back(),
                onError: (e) => showMessage('Não foi possível salvar', friendlyError(e)),
              },
            )
          }
        />
      </Screen>
    );
  }

  return (
    <Screen scroll edges={['bottom', 'left', 'right']}>
      <TransactionForm
        initial={data}
        submitting={save.isPending}
        onDelete={confirmDelete}
        onSubmit={(input) =>
          save.mutate(
            { id, input },
            {
              onSuccess: () => router.back(),
              onError: (e) => showMessage('Não foi possível salvar', friendlyError(e)),
            },
          )
        }
      />
    </Screen>
  );
}