// src/screens/LoginScreen.tsx
import { useState } from "react";
import {
  View,
  Text,
  TextInput,
  TouchableOpacity,
  Alert,
  StyleSheet,
  KeyboardAvoidingView,
  Platform,
} from "react-native";
import { supabase } from "../lib/supabase";
import type { NativeStackScreenProps } from "@react-navigation/native-stack";
import type { RootStackParamList } from "../../App";
import { colors } from "../theme/colors";

type Props = NativeStackScreenProps<RootStackParamList, "Login">;

export default function LoginScreen({ navigation }: Props) {
  const [email, setEmail] = useState("kinto.097@gmail.com");
  const [password, setPassword] = useState("diosarceus");
  const [loading, setLoading] = useState(false);

  async function onSignIn() {
    setLoading(true);
    const { data, error } = await supabase.auth.signInWithPassword({
      email,
      password,
    });
    setLoading(false);
    if (error) return Alert.alert("Login error", error.message);
  }

  async function onSignUp() {
    setLoading(true);
    const { error } = await supabase.auth.signUp({ email, password });
    setLoading(false);
    if (error) return Alert.alert("Signup error", error.message);
    Alert.alert("Revisa tu correo", "Confirma tu cuenta y luego inicia sesión.");
  }

  return (
    <KeyboardAvoidingView
      style={styles.container}
      behavior={Platform.select({ ios: "padding", android: undefined })}
    >
      <View style={styles.inner}>
        <Text style={styles.appTitle}>Splitmate</Text>
        <Text style={styles.subtitle}>
          Comparte gastos con tus amigos de forma sencilla.
        </Text>

        <View style={styles.card}>
          <Text style={styles.label}>Email</Text>
          <TextInput
            placeholder="tu@email.com"
            autoCapitalize="none"
            keyboardType="email-address"
            value={email}
            onChangeText={setEmail}
            style={styles.input}
            placeholderTextColor={colors.textMuted}
          />

          <Text style={styles.label}>Contraseña</Text>
          <TextInput
            placeholder="••••••••"
            secureTextEntry
            value={password}
            onChangeText={setPassword}
            style={styles.input}
            placeholderTextColor={colors.textMuted}
          />

          <TouchableOpacity
            style={[styles.button, loading && styles.buttonDisabled]}
            onPress={onSignIn}
            disabled={loading}
            activeOpacity={0.85}
          >
            <Text style={styles.buttonText}>
              {loading ? "Entrando..." : "Iniciar sesión"}
            </Text>
          </TouchableOpacity>

          <TouchableOpacity
            style={styles.secondaryButton}
            onPress={onSignUp}
            activeOpacity={0.85}
          >
            <Text style={styles.secondaryButtonText}>Crear cuenta nueva</Text>
          </TouchableOpacity>
        </View>

        <Text style={styles.helperText}>
          Más adelante podrás iniciar sesión también con otros métodos.
        </Text>
      </View>
    </KeyboardAvoidingView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: colors.background,
  },
  inner: {
    flex: 1,
    padding: 20,
    justifyContent: "center",
  },
  appTitle: {
    fontSize: 26,
    fontWeight: "800",
    color: colors.primaryDark,
    marginBottom: 4,
  },
  subtitle: {
    fontSize: 14,
    color: colors.textMuted,
    marginBottom: 20,
  },
  card: {
    backgroundColor: colors.card,
    borderRadius: 16,
    padding: 18,
    borderWidth: 1,
    borderColor: colors.border,
    shadowColor: "#000",
    shadowOpacity: 0.04,
    shadowRadius: 6,
    shadowOffset: { width: 0, height: 2 },
    elevation: 2,
  },
  label: {
    fontSize: 13,
    fontWeight: "500",
    color: colors.text,
    marginBottom: 6,
    marginTop: 8,
  },
  input: {
    borderWidth: 1,
    borderColor: colors.border,
    borderRadius: 10,
    paddingHorizontal: 12,
    paddingVertical: 10,
    fontSize: 14,
    color: colors.text,
  },
  button: {
    marginTop: 16,
    paddingVertical: 12,
    borderRadius: 999,
    backgroundColor: colors.primary,
    alignItems: "center",
  },
  buttonDisabled: {
    opacity: 0.7,
  },
  buttonText: {
    color: "#FFF",
    fontWeight: "600",
    fontSize: 15,
  },
  secondaryButton: {
    marginTop: 10,
    paddingVertical: 10,
    borderRadius: 999,
    borderWidth: 1,
    borderColor: colors.border,
    alignItems: "center",
  },
  secondaryButtonText: {
    color: colors.text,
    fontSize: 14,
    fontWeight: "500",
  },
  helperText: {
    marginTop: 12,
    fontSize: 12,
    color: colors.textMuted,
    textAlign: "center",
  },
});
