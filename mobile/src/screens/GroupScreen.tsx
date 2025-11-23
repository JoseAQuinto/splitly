// src/screens/GroupScreen.tsx
import { useEffect, useState } from "react";
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  ActivityIndicator,
} from "react-native";
import { supabase } from "../lib/supabase";
import type { NativeStackScreenProps } from "@react-navigation/native-stack";
import type { RootStackParamList } from "../../App";

type Props = NativeStackScreenProps<RootStackParamList, "Group">;

type Expense = {
  id: string;
  description: string;
  amount: number;
  created_at: string | null;
  user_id: string | null;
};

const palette = {
  background: "#FFF7ED",
  primary: "#F97316",
  primarySoft: "#FED7AA",
  primaryDark: "#C2410C",
  card: "#FFFFFF",
  border: "#F3E2D2",
  text: "#111827",
  textMuted: "#6B7280",
};

export default function GroupScreen({ route }: Props) {
  const { groupId, groupName } = route.params;

  const [expenses, setExpenses] = useState<Expense[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const loadExpenses = async () => {
      setLoading(true);
      const { data, error } = await supabase
        .from("expenses")
        .select("*")
        .eq("group_id", groupId)
        .order("created_at", { ascending: false });

      if (!error && data) {
        setExpenses(data as Expense[]);
      } else {
        console.log("Error loading expenses", error);
      }

      setLoading(false);
    };

    loadExpenses();
  }, [groupId]);

  const formatDate = (value: string | null) => {
    if (!value) return "-";
    const d = new Date(value);
    return d.toLocaleDateString("es-ES", {
      day: "2-digit",
      month: "2-digit",
      year: "2-digit",
    });
  };

  return (
    <View style={styles.container}>
      <ScrollView
        contentContainerStyle={styles.content}
        showsVerticalScrollIndicator={false}
      >
        {/* Cabecera del grupo */}
        <View style={styles.headerCard}>
          <Text style={styles.groupName}>{groupName}</Text>
          <Text style={styles.groupSubtitle}>
            Registro de gastos compartidos del grupo.
          </Text>
        </View>

        {/* Resumen simple (de momento solo total del grupo) */}
        <View style={styles.summaryCard}>
          <Text style={styles.sectionTitle}>Resumen del grupo</Text>
          <Text style={styles.summaryLabel}>Total gastado</Text>
          <Text style={styles.summaryValue}>
            {expenses
              .reduce((sum, e) => sum + Number(e.amount || 0), 0)
              .toFixed(2)}{" "}
            €
          </Text>
          <Text style={styles.summaryHint}>
            Más adelante podemos desglosarlo por participante y quién debe a
            quién.
          </Text>
        </View>

        {/* Lista de gastos */}
        <Text style={styles.sectionTitle}>Gastos</Text>

        {loading ? (
          <View style={styles.center}>
            <ActivityIndicator />
            <Text style={styles.textMuted}>Cargando gastos...</Text>
          </View>
        ) : expenses.length === 0 ? (
          <View style={styles.emptyCard}>
            <Text style={styles.emptyTitle}>Todavía no hay gastos</Text>
            <Text style={styles.emptyText}>
              Añade el primer gasto del grupo para empezar a llevar el
              control.
            </Text>
          </View>
        ) : (
          <View style={styles.list}>
            {expenses.map((exp) => (
              <View key={exp.id} style={styles.expenseRow}>
                <View style={{ flex: 1 }}>
                  <Text style={styles.expenseDescription}>
                    {exp.description}
                  </Text>
                  <Text style={styles.expenseMeta}>
                    {formatDate(exp.created_at)} ·{" "}
                    {exp.user_id
                      ? `Pagado por ${exp.user_id.slice(0, 6)}…`
                      : "Pagador desconocido"}
                  </Text>
                </View>
                <Text style={styles.expenseAmount}>
                  {Number(exp.amount).toFixed(2)} €
                </Text>
              </View>
            ))}
          </View>
        )}
      </ScrollView>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: palette.background,
  },
  content: {
    padding: 16,
    paddingBottom: 24,
  },
  headerCard: {
    backgroundColor: palette.card,
    borderRadius: 16,
    padding: 16,
    borderWidth: 1,
    borderColor: palette.border,
    marginBottom: 12,
  },
  groupName: {
    fontSize: 20,
    fontWeight: "700",
    color: palette.primaryDark,
  },
  groupSubtitle: {
    marginTop: 4,
    fontSize: 13,
    color: palette.textMuted,
  },
  summaryCard: {
    backgroundColor: palette.primarySoft,
    borderRadius: 16,
    padding: 16,
    marginBottom: 16,
  },
  sectionTitle: {
    fontSize: 16,
    fontWeight: "600",
    color: palette.text,
    marginBottom: 8,
  },
  summaryLabel: {
    fontSize: 13,
    color: palette.primaryDark,
  },
  summaryValue: {
    fontSize: 22,
    fontWeight: "800",
    color: palette.primaryDark,
    marginTop: 4,
  },
  summaryHint: {
    fontSize: 11,
    color: palette.textMuted,
    marginTop: 6,
  },
  center: {
    alignItems: "center",
    marginTop: 20,
    gap: 4,
  },
  textMuted: {
    fontSize: 13,
    color: palette.textMuted,
  },
  emptyCard: {
    backgroundColor: palette.card,
    borderRadius: 16,
    padding: 16,
    borderWidth: 1,
    borderColor: palette.border,
  },
  emptyTitle: {
    fontSize: 15,
    fontWeight: "600",
    color: palette.text,
    marginBottom: 4,
  },
  emptyText: {
    fontSize: 13,
    color: palette.textMuted,
  },
  list: {
    marginTop: 4,
    gap: 8,
  },
  expenseRow: {
    flexDirection: "row",
    alignItems: "center",
    backgroundColor: palette.card,
    borderRadius: 12,
    paddingVertical: 10,
    paddingHorizontal: 12,
    borderWidth: 1,
    borderColor: palette.border,
  },
  expenseDescription: {
    fontSize: 14,
    fontWeight: "500",
    color: palette.text,
  },
  expenseMeta: {
    fontSize: 11,
    color: palette.textMuted,
    marginTop: 2,
  },
  expenseAmount: {
    marginLeft: 12,
    fontSize: 15,
    fontWeight: "700",
    color: palette.primaryDark,
  },
});
