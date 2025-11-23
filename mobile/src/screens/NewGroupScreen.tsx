import { useState } from "react";
import {
  View,
  Text,
  TextInput,
  TouchableOpacity,
  StyleSheet,
  KeyboardAvoidingView,
  Platform,
  Alert,
} from "react-native";
import { supabase } from "../lib/supabase";
import { colors } from "../theme/colors";
import type { NativeStackScreenProps } from "@react-navigation/native-stack";
import type { RootStackParamList } from "../../App";

type Props = NativeStackScreenProps<RootStackParamList, "NewGroup">;

export default function NewGroupScreen({ navigation }: Props) {
  const [name, setName] = useState("");
  const [loading, setLoading] = useState(false);

  async function handleCreateGroup() {
    const trimmed = name.trim();
    if (!trimmed) {
      return Alert.alert("Nombre requerido", "Escribe un nombre para el grupo.");
    }

    setLoading(true);

    const { data: userData } = await supabase.auth.getUser();
    const userId = userData.user?.id;

    if (!userId) {
      setLoading(false);
      return Alert.alert(
        "Error",
        "No se ha podido obtener el usuario actual."
      );
    }

    // 1) Crear grupo
    const { data: group, error: groupError } = await supabase
      .from("groups")
      .insert({ name: trimmed, owner: userId })
      .select("id, name")
      .single();

    if (groupError || !group) {
      setLoading(false);
      console.log(groupError);
      return Alert.alert("Error al crear grupo", groupError?.message);
    }

    // 2) Añadir creador como miembro
    const { error: memberError } = await supabase
      .from("group_members")
      .insert({ group_id: group.id, user_id: userId });

    if (memberError) {
      console.log(memberError);
      Alert.alert(
        "Grupo creado, pero...",
        "Hubo un problema añadiéndote como miembro. Puedes añadirte manualmente."
      );
    }

    setLoading(false);

    // 3) Ir directamente al grupo
    navigation.replace("Group", {
      groupId: group.id,
      groupName: group.name ?? "Grupo",
    });
  }

  return (
    <KeyboardAvoidingView
      style={styles.container}
      behavior={Platform.select({ ios: "padding" })}
    >
      <View style={styles.inner}>
        <Text style={styles.title}>Nuevo grupo</Text>
        <Text style={styles.subtitle}>
          Crea un grupo para compartir gastos con tus amigos.
        </Text>

        <View style={styles.card}>
          <Text style={styles.label}>Nombre del grupo</Text>
          <TextInput
            style={styles.input}
            placeholder="Viaje a Madrid, Piso compartido..."
            placeholderTextColor={colors.textMuted}
            value={name}
            onChangeText={setName}
          />

          <TouchableOpacity
            style={[styles.button, loading && styles.buttonDisabled]}
            onPress={handleCreateGroup}
            disabled={loading}
            activeOpacity={0.85}
          >
            <Text style={styles.buttonText}>
              {loading ? "Creando grupo..." : "Crear grupo"}
            </Text>
          </TouchableOpacity>
        </View>

        <TouchableOpacity
          style={styles.secondaryButton}
          onPress={() => navigation.goBack()}
        >
          <Text style={styles.secondaryButtonText}>Cancelar</Text>
        </TouchableOpacity>
      </View>
    </KeyboardAvoidingView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: colors.background },
  inner: { flex: 1, padding: 20, justifyContent: "center" },
  title: { fontSize: 22, fontWeight: "700", color: colors.primaryDark },
  subtitle: { fontSize: 14, color: colors.textMuted, marginBottom: 20 },
  card: {
    backgroundColor: colors.card,
    borderRadius: 16,
    padding: 18,
    borderWidth: 1,
    borderColor: colors.border,
  },
  label: { fontSize: 13, color: colors.text },
  input: {
    borderWidth: 1,
    borderColor: colors.border,
    borderRadius: 10,
    marginTop: 8,
    paddingHorizontal: 12,
    paddingVertical: 10,
    color: colors.text,
    marginBottom: 16,
  },
  button: {
    backgroundColor: colors.primary,
    paddingVertical: 12,
    borderRadius: 999,
    alignItems: "center",
  },
  buttonDisabled: { opacity: 0.7 },
  buttonText: {
    color: "#FFF",
    fontWeight: "600",
    fontSize: 15,
  },
  secondaryButton: {
    marginTop: 12,
    paddingVertical: 10,
    borderRadius: 999,
    borderWidth: 1,
    borderColor: colors.border,
    alignItems: "center",
  },
  secondaryButtonText: {
    color: colors.textMuted,
    fontSize: 14,
  },
});
