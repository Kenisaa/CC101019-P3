import React, { useState } from "react";
import {
  View,
  Text,
  TextInput,
  TouchableOpacity,
  StyleSheet,
  Alert,
  KeyboardAvoidingView,
  Platform,
  ScrollView,
} from "react-native";
import { useAuth } from "../hooks/useAuth";

const API_BASE_URL = process.env.EXPO_PUBLIC_API_URL || 'http://localhost:3000/api';

export default function AuthScreen() {
  const { login } = useAuth();
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [name, setName] = useState("");
  const [verificationCode, setVerificationCode] = useState("");
  const [step, setStep] = useState<"login" | "register" | "verify">("login");
  const [loading, setLoading] = useState(false);
  const [currentUser, setCurrentUser] = useState<any>(null);

  const handleLogin = async () => {
    if (!email || !password) {
      Alert.alert("Error", "Por favor ingresa tu email y contraseña");
      return;
    }

    setLoading(true);
    try {
      const response = await fetch(`${API_BASE_URL}/auth/login`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          identifier: email,
          password: password
        }),
      });

      const data = await response.json();

      if (data.success) {
        setCurrentUser({ identifier: email, userId: data.userId });
        setStep("verify");
        Alert.alert("Código enviado", "Revisa tu email para el código de verificación");
      } else {
        Alert.alert("Error", data.message || "Error al iniciar sesión");
      }
    } catch (error: any) {
      console.error("Error en login:", error);
      Alert.alert("Error", "Error de conexión. Verifica que el backend esté ejecutándose.");
    } finally {
      setLoading(false);
    }
  };

  const handleRegister = async () => {
    if (!name || !email || !password) {
      Alert.alert("Error", "Por favor completa todos los campos");
      return;
    }

    setLoading(true);
    try {
      const response = await fetch(`${API_BASE_URL}/auth/register`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          name,
          email,
          password
        }),
      });

      const data = await response.json();

      if (data.success) {
        setCurrentUser({ identifier: email, userId: data.userId });
        setStep("verify");
        Alert.alert("Registro exitoso", "Revisa tu email para el código de verificación");
      } else {
        Alert.alert("Error", data.message || "Error al registrarse");
      }
    } catch (error: any) {
      console.error("Error en registro:", error);
      Alert.alert("Error", "Error de conexión. Verifica que el backend esté ejecutándose.");
    } finally {
      setLoading(false);
    }
  };

  const handleVerifyCode = async () => {
    if (!verificationCode) {
      Alert.alert("Error", "Por favor ingresa el código de verificación");
      return;
    }

    setLoading(true);
    try {
      const response = await fetch(`${API_BASE_URL}/auth/verify`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          identifier: currentUser?.identifier,
          code: verificationCode
        }),
      });

      const data = await response.json();

      if (data.success) {
        console.log("Verificación exitosa, datos recibidos:", data);
        // Guardar token y usuario usando el hook
        await login(data.token, data.user);
        console.log("Login completado, usuario guardado");
        // El AppNavigator detectará automáticamente el cambio de usuario y navegará al Dashboard
      } else {
        Alert.alert("Error", data.message || "Código incorrecto");
      }
    } catch (error: any) {
      console.error("Error verificando código:", error);
      Alert.alert("Error", "Error de conexión");
    } finally {
      setLoading(false);
    }
  };

  return (
    <KeyboardAvoidingView
      behavior={Platform.OS === "ios" ? "padding" : "height"}
      style={styles.container}
    >
      <ScrollView
        contentContainerStyle={styles.scrollContent}
        keyboardShouldPersistTaps="handled"
      >
        <View style={styles.card}>
          <View style={styles.iconContainer}>
            <Text style={styles.icon}>🍽️</Text>
          </View>

          <Text style={styles.title}>
            {step === "login" ? "Iniciar Sesión" : step === "register" ? "Crear Cuenta" : "Verifica tu código"}
          </Text>

          <Text style={styles.description}>
            {step === "login" 
              ? "Ingresa tus credenciales para acceder"
              : step === "register" 
              ? "Crea tu cuenta para comenzar"
              : "Ingresa el código que enviamos a tu email"}
          </Text>

          {step === "login" ? (
            <View style={styles.form}>
              <Text style={styles.label}>Email</Text>
              <TextInput
                style={styles.input}
                placeholder="tu@email.com"
                value={email}
                onChangeText={setEmail}
                keyboardType="email-address"
                autoComplete="email"
                autoCapitalize="none"
              />

              <Text style={styles.label}>Contraseña</Text>
              <TextInput
                style={styles.input}
                placeholder="Tu contraseña"
                value={password}
                onChangeText={setPassword}
                secureTextEntry
                autoComplete="password"
              />

              <TouchableOpacity
                style={[styles.button, loading && styles.buttonDisabled]}
                onPress={handleLogin}
                disabled={loading}
              >
                <Text style={styles.buttonText}>
                  {loading ? "Iniciando..." : "Iniciar Sesión"}
                </Text>
              </TouchableOpacity>

              <TouchableOpacity
                style={styles.secondaryButton}
                onPress={() => setStep("register")}
              >
                <Text style={styles.secondaryButtonText}>¿No tienes cuenta? Regístrate</Text>
              </TouchableOpacity>
            </View>
          ) : step === "register" ? (
            <View style={styles.form}>
              <Text style={styles.label}>Nombre completo</Text>
              <TextInput
                style={styles.input}
                placeholder="Tu nombre completo"
                value={name}
                onChangeText={setName}
                autoComplete="name"
              />

              <Text style={styles.label}>Email</Text>
              <TextInput
                style={styles.input}
                placeholder="tu@email.com"
                value={email}
                onChangeText={setEmail}
                keyboardType="email-address"
                autoComplete="email"
                autoCapitalize="none"
              />

              <Text style={styles.label}>Contraseña</Text>
              <TextInput
                style={styles.input}
                placeholder="Tu contraseña"
                value={password}
                onChangeText={setPassword}
                secureTextEntry
                autoComplete="password"
              />

              <TouchableOpacity
                style={[styles.button, loading && styles.buttonDisabled]}
                onPress={handleRegister}
                disabled={loading}
              >
                <Text style={styles.buttonText}>
                  {loading ? "Registrando..." : "Crear Cuenta"}
                </Text>
              </TouchableOpacity>

              <TouchableOpacity
                style={styles.secondaryButton}
                onPress={() => setStep("login")}
              >
                <Text style={styles.secondaryButtonText}>¿Ya tienes cuenta? Inicia sesión</Text>
              </TouchableOpacity>
            </View>
          ) : (
            <View style={styles.form}>
              <Text style={styles.label}>Código de verificación</Text>
              <TextInput
                style={[styles.input, styles.codeInput]}
                placeholder="123456"
                value={verificationCode}
                onChangeText={setVerificationCode}
                keyboardType="number-pad"
                maxLength={6}
              />

              <TouchableOpacity
                style={[styles.button, loading && styles.buttonDisabled]}
                onPress={handleVerifyCode}
                disabled={loading}
              >
                <Text style={styles.buttonText}>
                  {loading ? "Verificando..." : "Verificar código"}
                </Text>
              </TouchableOpacity>

              <TouchableOpacity
                style={styles.secondaryButton}
                onPress={() => setStep("login")}
              >
                <Text style={styles.secondaryButtonText}>Volver al login</Text>
              </TouchableOpacity>
            </View>
          )}
        </View>
      </ScrollView>
    </KeyboardAvoidingView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: "#F5F5F5",
  },
  scrollContent: {
    flexGrow: 1,
    justifyContent: "center",
    padding: 20,
  },
  card: {
    backgroundColor: "white",
    borderRadius: 12,
    padding: 24,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 8,
    elevation: 5,
  },
  iconContainer: {
    width: 64,
    height: 64,
    backgroundColor: "#007AFF15",
    borderRadius: 32,
    justifyContent: "center",
    alignItems: "center",
    alignSelf: "center",
    marginBottom: 16,
  },
  icon: {
    fontSize: 32,
  },
  title: {
    fontSize: 24,
    fontWeight: "700",
    textAlign: "center",
    marginBottom: 8,
    color: "#000",
  },
  description: {
    fontSize: 16,
    textAlign: "center",
    color: "#666",
    marginBottom: 24,
  },
  form: {
    gap: 16,
  },
  label: {
    fontSize: 14,
    fontWeight: "600",
    color: "#000",
    marginBottom: -8,
  },
  input: {
    height: 48,
    borderWidth: 1,
    borderColor: "#DDD",
    borderRadius: 8,
    paddingHorizontal: 16,
    fontSize: 16,
    backgroundColor: "#FFF",
  },
  codeInput: {
    textAlign: "center",
    fontSize: 24,
    letterSpacing: 8,
  },
  hint: {
    fontSize: 12,
    color: "#999",
    marginTop: -8,
  },
  button: {
    height: 48,
    backgroundColor: "#007AFF",
    borderRadius: 8,
    justifyContent: "center",
    alignItems: "center",
    marginTop: 8,
  },
  buttonDisabled: {
    opacity: 0.6,
  },
  buttonText: {
    color: "white",
    fontSize: 16,
    fontWeight: "600",
  },
  secondaryButton: {
    height: 48,
    justifyContent: "center",
    alignItems: "center",
  },
  secondaryButtonText: {
    color: "#007AFF",
    fontSize: 16,
    fontWeight: "500",
  },
  devNote: {
    backgroundColor: "#FFF3CD",
    padding: 12,
    borderRadius: 8,
    borderWidth: 1,
    borderColor: "#FFE69C",
  },
  devNoteText: {
    fontSize: 12,
    color: "#856404",
    textAlign: "center",
  },
});
