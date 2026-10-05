import { Ionicons } from '@expo/vector-icons';
import Constants from 'expo-constants';
import { useRouter } from 'expo-router';
import { useState } from 'react';
import { Alert, Platform, Pressable, Share, StyleSheet, Text, View } from 'react-native';

import { Button } from '@/components/Button';
import { Card } from '@/components/Card';
import { Screen } from '@/components/Screen';
import { useAuth } from '@/context/AuthContext';
import { listTransactions } from '@/services/transaction';
import { colors, radius, spacing } from '@/theme';
import { toCsv } from '@/utils/csv';
import { friendlyError } from '@/utils/errors';

// ─── Tela ────────────────────────────────────────────────────────────────────

export default function ProfileScreen() {
  const router = useRouter();
  const { user, signOut } = useAuth();
  const [exporting, setExporting] = useState(false);

  const name = String(user?.user_metadata?.full_name ?? 'Usuário');

  async function exportCsv() {
    setExporting(true);

    try {
      const all = await listTransactions();

      if (all.length === 0) {
        if (Platform.OS === 'web') {
          window.alert('Nada para exportar\n\nRegistre lançamentos primeiro.');
        } else {
          Alert.alert('Nada para exportar', 'Registre lançamentos primeiro.');
        }
        return;
      }

      if (Platform.OS === 'web') {
        const blob = new Blob(['\uFEFF' + toCsv(all)], { type: 'text/csv;charset=utf-8;' });
        const url = URL.createObjectURL(blob);
        const link = document.createElement('a');
        link.href = url;
        link.download = 'fintrack.csv';
        document.body.appendChild(link);
        link.click();
        link.remove();
        URL.revokeObjectURL(url);
      } else {
        await Share.share({ title: 'fintrack.csv', message: toCsv(all) });
      }
    } catch (error) {
      if (Platform.OS === 'web') {
        window.alert(`Erro ao exportar\n\n${friendlyError(error)}`);
      } else {
        Alert.alert('Erro ao exportar', friendlyError(error));
      }
    } finally {
      setExporting(false);
    }
  }

  function confirmSignOut() {
    if (Platform.OS === 'web') {
      if (window.confirm('Sair\n\nDeseja encerrar a sessão?')) {
        signOut().catch((e) => window.alert(`Erro\n\n${friendlyError(e)}`));
      }
      return;
    }

    Alert.alert('Sair', 'Deseja encerrar a sessão?', [
      { text: 'Cancelar', style: 'cancel' },
      {
        text: 'Sair',
        style: 'destructive',
        onPress: () => signOut().catch((e) => Alert.alert('Erro', friendlyError(e))),
      },
    ]);
  }

  return (
    <Screen scroll>
      <Text style={styles.title}>Perfil</Text>

      <Card>
        <View style={styles.avatar}>
          <Text style={styles.avatarText}>{name.charAt(0).toUpperCase()}</Text>
        </View>

        <Text style={styles.name}>{name}</Text>
        <Text style={styles.email}>{user?.email}</Text>
      </Card>

      <Pressable
        accessibilityRole="button"
        onPress={() => router.push('/banks')}
        style={({ pressed }) => [styles.bankRow, pressed && styles.pressed]}
      >
        <Ionicons name="business" size={22} color={colors.primary} />

        <View style={styles.bankInfo}>
          <Text style={styles.bankTitle}>Contas bancárias</Text>
          <Text style={styles.bankText}>Importe lançamentos via Open Finance</Text>
        </View>

        <Ionicons name="chevron-forward" size={20} color={colors.muted} />
      </Pressable>

      <Button
        title="Exportar lançamentos (CSV)"
        variant="secondary"
        onPress={exportCsv}
        loading={exporting}
        style={styles.action}
      />

      <Button title="Sair da conta" variant="danger" onPress={confirmSignOut} />

      <Text style={styles.version}>
        FinTrack v{Constants.expoConfig?.version ?? '1.0.0'}
      </Text>
    </Screen>
  );
}

// ─── Estilos ─────────────────────────────────────────────────────────────────

const styles = StyleSheet.create({
  title: {
    fontSize: 26,
    fontWeight: '800',
    color: colors.text,
    marginBottom: spacing.md,
  },
  avatar: {
    width: 72,
    height: 72,
    borderRadius: 36,
    backgroundColor: colors.primary,
    alignItems: 'center',
    justifyContent: 'center',
    alignSelf: 'center',
    marginBottom: spacing.sm,
  },
  avatarText: { color: '#FFFFFF', fontSize: 30, fontWeight: '800' },
  name: {
    fontSize: 20,
    fontWeight: '700',
    color: colors.text,
    textAlign: 'center',
  },
  email: {
    fontSize: 14,
    color: colors.muted,
    textAlign: 'center',
    marginTop: 2,
  },
  action: { marginBottom: spacing.sm },
  pressed: { opacity: 0.8 },
  bankRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing.md,
    backgroundColor: colors.surface,
    borderRadius: radius.md,
    padding: spacing.md,
    marginBottom: spacing.md,
  },
  bankInfo: { flex: 1 },
  bankTitle: { fontSize: 16, fontWeight: '600', color: colors.text },
  bankText: { fontSize: 13, color: colors.muted, marginTop: 2 },
  version: {
    textAlign: 'center',
    color: colors.muted,
    fontSize: 12,
    marginTop: spacing.lg,
  },
});