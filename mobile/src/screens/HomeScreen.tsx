// src/screens/HomeScreen.tsx
import { useEffect, useState } from "react";
import {
  View,
  Text,
  ScrollView,
  StyleSheet,
  TouchableOpacity,
} from "react-native";
import { supabase } from "../lib/supabase";
import { colors } from "../theme/colors";
import { useNavigation } from "@react-navigation/native";
import type { NativeStackNavigationProp } from "@react-navigation/native-stack";
import type { RootStackParamList } from "../../App";

type Nav = NativeStackNavigationProp<RootStackParamList, "Home">;

type GroupItem = {
  id: string;
  name: string | null;
};

export default function HomeScreen() {
  const navigation = useNavigation<Nav>();

  const [email, setEmail] = useState<string | null>(null);
  const [groups, setGroups] = useState<GroupItem[]>([]); // ✅ faltaba

  useEffect(() => {
    supabase.auth.getUser().then(({ data }) =>
      setEmail(data.user?.email ?? null)
    );
  }, []);

  useEffect(() => {
    const loadGroups = async () => {
      const { data: userData } = await supabase.auth.getUser();
      const userId = userData.user?.id;
      if (!userId) return;

      const { data, error } = await supabase
        .from("group_members")
        .select("group_id, groups(name)")
        .eq("user_id", userId);

      if (!error && data) {
        setGroups(
          data.map((g: any) => ({
            id: g.group_id,
            name: g.groups?.name ?? "Grupo",
          }))
        );
      }
    };

    loadGroups();
  }, []);

  async function logout() {
    await supabase.auth.signOut();
  }

  const shortName = email ? email.split("@")[0] : null;

  return (
    <ScrollView
      style={styles.container}
      contentContainerStyle={styles.content}
      showsVerticalScrollIndicator={false}
    >
      {/* Header */}
      <View style={styles.header}>
        <View>
          <Text style={styles.appTitle}>Splitmate</Text>
          <Text style={styles.greeting}>
            Hola{shortName ? `, ${shortName}` : ""} 👋
          </Text>
        </View>
        <View style={styles.badge}>
          <Text style={styles.badgeText}>BETA</Text>
        </View>
      </View>

      <Text style={styles.subtitle}>
        Revisa tus gastos compartidos de un vistazo.
      </Text>

      {/* Resumen rápido */}
      <View style={styles.card}>
        <Text style={styles.sectionTitle}>Resumen rápido</Text>
        <View style={styles.summaryRow}>
          <View style={styles.summaryItem}>
            <Text style={styles.summaryLabel}>Debes</Text>
            <Text style={styles.summaryValueNegative}>120,50 €</Text>
          </View>
          <View style={styles.summaryItem}>
            <Text style={styles.summaryLabel}>Te deben</Text>
            <Text style={styles.summaryValuePositive}>85,00 €</Text>
          </View>
        </View>
        <Text style={styles.summaryHint}>
          Estos números son de ejemplo. Más adelante los conectaremos a tus
          grupos y gastos reales.
        </Text>
      </View>

      {/* Tus grupos */}
      <View style={styles.card}>
        <Text style={styles.sectionTitle}>Tus grupos</Text>

        {groups.length === 0 ? (
          <Text style={styles.emptyText}>No perteneces a ningún grupo aún.</Text>
        ) : (
          groups.map((g) => (
            <TouchableOpacity
              key={g.id}
              style={styles.groupRow}
              onPress={() =>
                navigation.navigate("Group", {
                  groupId: g.id,
                  groupName: g.name ?? "Grupo",
                })
              }
            >
              <Text style={styles.groupName}>{g.name}</Text>
              <Text style={styles.groupHint}>Ver gastos →</Text>
            </TouchableOpacity>
          ))
        )}
      </View>

      {/* Acciones rápidas */}
      <View style={styles.section}>
        <Text style={styles.sectionTitle}>Acciones rápidas</Text>

        <View style={styles.actionsRow}>
          <ActionButton
  title="Nuevo grupo"
  onPress={() => {
    console.log("CLICK NUEVO GRUPO");
    // @ts-ignore
    alert("Click nuevo grupo");
    navigation.navigate("NewGroup");
  }}
/>

        </View>

        <View style={styles.actionsRow}>
          <ActionButton title="Ver grupos" onPress={() => {}} secondary />
          <ActionButton title="Actividad" onPress={() => {}} secondary />
        </View>
      </View>

      {/* Actividad reciente */}
      <View style={styles.section}>
        <Text style={styles.sectionTitle}>Actividad reciente</Text>
        <View style={styles.emptyState}>
          <Text style={styles.emptyTitle}>Todavía no hay movimientos</Text>
          <Text style={styles.emptyText}>
            Crea un grupo con tus amigos y añade vuestro primer gasto para
            empezar a ver la actividad aquí.
          </Text>
        </View>
      </View>

      {/* Cerrar sesión */}
      <TouchableOpacity style={styles.logoutButton} onPress={logout}>
        <Text style={styles.logoutText}>Cerrar sesión</Text>
      </TouchableOpacity>
    </ScrollView>
  );
}

// ActionButton
type ActionButtonProps = {
  title: string;
  onPress: () => void;
  secondary?: boolean;
};

function ActionButton({ title, onPress, secondary }: ActionButtonProps) {
  return (
    <TouchableOpacity
      style={[
        styles.actionButton,
        secondary && styles.actionButtonSecondary,
      ]}
      onPress={onPress}
      activeOpacity={0.8}
    >
      <Text
        style={[
          styles.actionButtonText,
          secondary && styles.actionButtonTextSecondary,
        ]}
      >
        {title}
      </Text>
    </TouchableOpacity>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: colors.background,
  },
  content: {
    padding: 20,
    paddingBottom: 32,
  },
  header: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    marginBottom: 8,
  },
  appTitle: {
    fontSize: 18,
    fontWeight: "700",
    color: colors.primaryDark,
    letterSpacing: 0.5,
  },
  greeting: {
    fontSize: 22,
    fontWeight: "700",
    color: colors.text,
    marginTop: 4,
  },
  subtitle: {
    fontSize: 14,
    color: colors.textMuted,
    marginBottom: 16,
  },
  badge: {
    backgroundColor: colors.primarySoft,
    paddingHorizontal: 10,
    paddingVertical: 4,
    borderRadius: 999,
  },
  badgeText: {
    fontSize: 10,
    fontWeight: "600",
    color: colors.primaryDark,
  },
  card: {
    backgroundColor: colors.card,
    borderRadius: 16,
    padding: 16,
    marginTop: 4,
    marginBottom: 16,
    borderWidth: 1,
    borderColor: colors.border,
    shadowColor: "#000",
    shadowOpacity: 0.04,
    shadowRadius: 6,
    shadowOffset: { width: 0, height: 2 },
    elevation: 2,
  },
  sectionTitle: {
    fontSize: 16,
    fontWeight: "600",
    color: colors.text,
    marginBottom: 12,
  },
  summaryRow: {
    flexDirection: "row",
    gap: 16,
    marginBottom: 8,
  },
  summaryItem: {
    flex: 1,
    padding: 12,
    borderRadius: 12,
    backgroundColor: colors.primarySoft,
  },
  summaryLabel: {
    fontSize: 12,
    color: colors.primaryDark,
    marginBottom: 4,
  },
  summaryValueNegative: {
    fontSize: 18,
    fontWeight: "700",
    color: colors.danger,
  },
  summaryValuePositive: {
    fontSize: 18,
    fontWeight: "700",
    color: colors.primaryDark,
  },
  summaryHint: {
    fontSize: 11,
    color: colors.textMuted,
    marginTop: 4,
  },
  section: {
    marginBottom: 16,
  },
  actionsRow: {
    flexDirection: "row",
    gap: 12,
    marginBottom: 8,
  },
  actionButton: {
    flex: 1,
    paddingVertical: 12,
    borderRadius: 999,
    backgroundColor: colors.primary,
    alignItems: "center",
    justifyContent: "center",
  },
  actionButtonSecondary: {
    backgroundColor: "transparent",
    borderWidth: 1,
    borderColor: colors.border,
  },
  actionButtonText: {
    color: "#FFF",
    fontWeight: "600",
    fontSize: 14,
  },
  actionButtonTextSecondary: {
    color: colors.text,
  },
  emptyState: {
    backgroundColor: colors.card,
    borderRadius: 16,
    padding: 16,
    borderWidth: 1,
    borderColor: colors.border,
  },
  emptyTitle: {
    fontSize: 15,
    fontWeight: "600",
    color: colors.text,
    marginBottom: 4,
  },
  emptyText: {
    fontSize: 13,
    color: colors.textMuted,
  },
  logoutButton: {
    marginTop: 8,
    paddingVertical: 12,
    borderRadius: 999,
    alignItems: "center",
    justifyContent: "center",
    borderWidth: 1,
    borderColor: colors.border,
  },
  logoutText: {
    fontSize: 14,
    fontWeight: "500",
    color: colors.textMuted,
  },

  // 👇 estilos añadidos para grupos
  groupRow: {
    paddingVertical: 10,
    borderBottomWidth: 1,
    borderBottomColor: colors.border,
  },
  groupName: {
    fontSize: 15,
    fontWeight: "600",
    color: colors.text,
  },
  groupHint: {
    fontSize: 12,
    color: colors.textMuted,
  },
});
