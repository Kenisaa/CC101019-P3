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
  Dimensions,
} from "react-native";
import Svg, { Path } from "react-native-svg";
import { HugeiconsIcon } from "@hugeicons/react-native";
import {
  Mail01Icon,
  LockPasswordIcon,
  User02Icon,
  Key01Icon
} from "@hugeicons/core-free-icons";
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

  // Focus states for input border animations
  const [emailFocused, setEmailFocused] = useState(false);
  const [passwordFocused, setPasswordFocused] = useState(false);
  const [nameFocused, setNameFocused] = useState(false);
  const [codeFocused, setCodeFocused] = useState(false);

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
        await login(data.token, data.user);
        console.log("Login completado, usuario guardado");
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
      <View style={styles.container}>
        {/* Top Decorative Background */}
        <View style={styles.backgroundContainer}>
          <View style={styles.backgroundCircle1} />
          <View style={styles.backgroundCircle2} />
        </View>

        {/* Wave Effect */}
        <View style={styles.waveContainer}>
          <Svg
            height="100"
            width={Dimensions.get("window").width}
            viewBox={`0 0 ${Dimensions.get("window").width} 100`}
            style={styles.wave}
          >
            <Path
              d={`M0,40 Q${Dimensions.get("window").width / 4},0 ${
                Dimensions.get("window").width / 2
              },40 T${Dimensions.get("window").width},40 L${Dimensions.get(
                "window"
              ).width},100 L0,100 Z`}
              fill="#FFFFFF"
            />
          </Svg>
        </View>

        {/* Bottom Content */}
        <ScrollView
          style={styles.bottomContainer}
          contentContainerStyle={styles.bottomContent}
          keyboardShouldPersistTaps="handled"
          showsVerticalScrollIndicator={false}
        >
          {/* Heading */}
          <View style={styles.headingContainer}>
            <Text style={styles.headingText}>
              {step === "login" ? "Sign In" : step === "register" ? "Sign Up" : "Verify"}
            </Text>
            <View style={styles.headingLine} />
          </View>

          {/* Forms */}
          {step === "login" ? (
            <View style={styles.form}>
              {/* Email Field */}
              <View style={styles.inputField}>
                <Text style={styles.label}>Email</Text>
                <View style={[styles.inputBox, emailFocused && styles.inputBoxFocused]}>
                  <HugeiconsIcon icon={Mail01Icon} size={20} color="#999" />
                  <View style={styles.inputDivider} />
                  <TextInput
                    style={styles.input}
                    placeholder="Enter your email"
                    placeholderTextColor="#999"
                    value={email}
                    onChangeText={setEmail}
                    keyboardType="email-address"
                    autoComplete="email"
                    autoCapitalize="none"
                    onFocus={() => setEmailFocused(true)}
                    onBlur={() => setEmailFocused(false)}
                  />
                </View>
              </View>

              {/* Password Field */}
              <View style={styles.inputField}>
                <Text style={styles.label}>Password</Text>
                <View style={[styles.inputBox, passwordFocused && styles.inputBoxFocused]}>
                  <HugeiconsIcon icon={LockPasswordIcon} size={20} color="#999" />
                  <View style={styles.inputDivider} />
                  <TextInput
                    style={styles.input}
                    placeholder="Enter your password"
                    placeholderTextColor="#999"
                    value={password}
                    onChangeText={setPassword}
                    secureTextEntry
                    autoComplete="password"
                    onFocus={() => setPasswordFocused(true)}
                    onBlur={() => setPasswordFocused(false)}
                  />
                </View>
              </View>

              {/* Buttons */}
              <TouchableOpacity
                style={[styles.primaryButton, loading && styles.buttonDisabled]}
                onPress={handleLogin}
                disabled={loading}
              >
                <Text style={styles.primaryButtonText}>
                  {loading ? "Logging in..." : "Login"}
                </Text>
              </TouchableOpacity>

              <TouchableOpacity
                style={styles.secondaryButton}
                onPress={() => setStep("register")}
              >
                <Text style={styles.secondaryButtonText}>
                  Don't have an Account? <Text style={styles.linkText}>Sign Up</Text>
                </Text>
              </TouchableOpacity>
            </View>
          ) : step === "register" ? (
            <View style={styles.form}>
              {/* Name Field */}
              <View style={styles.inputField}>
                <Text style={styles.label}>Name</Text>
                <View style={[styles.inputBox, nameFocused && styles.inputBoxFocused]}>
                  <HugeiconsIcon icon={User02Icon} size={20} color="#999" />
                  <View style={styles.inputDivider} />
                  <TextInput
                    style={styles.input}
                    placeholder="Enter your name"
                    placeholderTextColor="#999"
                    value={name}
                    onChangeText={setName}
                    autoComplete="name"
                    onFocus={() => setNameFocused(true)}
                    onBlur={() => setNameFocused(false)}
                  />
                </View>
              </View>

              {/* Email Field */}
              <View style={styles.inputField}>
                <Text style={styles.label}>Email</Text>
                <View style={[styles.inputBox, emailFocused && styles.inputBoxFocused]}>
                  <HugeiconsIcon icon={Mail01Icon} size={20} color="#999" />
                  <View style={styles.inputDivider} />
                  <TextInput
                    style={styles.input}
                    placeholder="Enter your email"
                    placeholderTextColor="#999"
                    value={email}
                    onChangeText={setEmail}
                    keyboardType="email-address"
                    autoComplete="email"
                    autoCapitalize="none"
                    onFocus={() => setEmailFocused(true)}
                    onBlur={() => setEmailFocused(false)}
                  />
                </View>
              </View>

              {/* Password Field */}
              <View style={styles.inputField}>
                <Text style={styles.label}>Password</Text>
                <View style={[styles.inputBox, passwordFocused && styles.inputBoxFocused]}>
                  <HugeiconsIcon icon={LockPasswordIcon} size={20} color="#999" />
                  <View style={styles.inputDivider} />
                  <TextInput
                    style={styles.input}
                    placeholder="Enter your password"
                    placeholderTextColor="#999"
                    value={password}
                    onChangeText={setPassword}
                    secureTextEntry
                    autoComplete="password"
                    onFocus={() => setPasswordFocused(true)}
                    onBlur={() => setPasswordFocused(false)}
                  />
                </View>
              </View>

              {/* Buttons */}
              <TouchableOpacity
                style={[styles.primaryButton, loading && styles.buttonDisabled]}
                onPress={handleRegister}
                disabled={loading}
              >
                <Text style={styles.primaryButtonText}>
                  {loading ? "Registering..." : "Sign Up"}
                </Text>
              </TouchableOpacity>

              <TouchableOpacity
                style={styles.secondaryButton}
                onPress={() => setStep("login")}
              >
                <Text style={styles.secondaryButtonText}>
                  Already have an Account? <Text style={styles.linkText}>Sign In</Text>
                </Text>
              </TouchableOpacity>
            </View>
          ) : (
            <View style={styles.form}>
              {/* Code Field */}
              <View style={styles.inputField}>
                <Text style={styles.label}>Verification Code</Text>
                <View style={[styles.inputBox, codeFocused && styles.inputBoxFocused]}>
                  <HugeiconsIcon icon={Key01Icon} size={20} color="#999" />
                  <View style={styles.inputDivider} />
                  <TextInput
                    style={[styles.input, styles.codeInput]}
                    placeholder="123456"
                    placeholderTextColor="#999"
                    value={verificationCode}
                    onChangeText={setVerificationCode}
                    keyboardType="number-pad"
                    maxLength={6}
                    onFocus={() => setCodeFocused(true)}
                    onBlur={() => setCodeFocused(false)}
                  />
                </View>
              </View>

              {/* Buttons */}
              <TouchableOpacity
                style={[styles.primaryButton, loading && styles.buttonDisabled]}
                onPress={handleVerifyCode}
                disabled={loading}
              >
                <Text style={styles.primaryButtonText}>
                  {loading ? "Verifying..." : "Verify Code"}
                </Text>
              </TouchableOpacity>

              <TouchableOpacity
                style={styles.secondaryButton}
                onPress={() => setStep("login")}
              >
                <Text style={styles.secondaryButtonText}>
                  <Text style={styles.linkText}>Back to Login</Text>
                </Text>
              </TouchableOpacity>
            </View>
          )}
        </ScrollView>
      </View>
    </KeyboardAvoidingView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: "#FFFFFF",
  },
  backgroundContainer: {
    height: "55%",
    width: "100%",
    backgroundColor: "#FF8383",
    position: "relative",
    overflow: "hidden",
  },
  backgroundCircle1: {
    position: "absolute",
    width: 300,
    height: 300,
    borderRadius: 150,
    backgroundColor: "rgba(255, 255, 255, 0.1)",
    top: -50,
    right: -100,
  },
  backgroundCircle2: {
    position: "absolute",
    width: 200,
    height: 200,
    borderRadius: 100,
    backgroundColor: "rgba(255, 255, 255, 0.1)",
    bottom: -50,
    left: -50,
  },
  waveContainer: {
    position: "absolute",
    top: "55%",
    left: 0,
    right: 0,
    height: 100,
    marginTop: -50,
  },
  wave: {
    position: "absolute",
    bottom: 0,
  },
  bottomContainer: {
    flex: 1,
    backgroundColor: "transparent",
    marginTop: 0,
  },
  bottomContent: {
    paddingHorizontal: 24,
    paddingTop: 60,
    paddingBottom: 40,
    backgroundColor: "#FFFFFF",
    minHeight: "100%",
  },
  headingContainer: {
    marginBottom: 32,
  },
  headingText: {
    fontSize: 36,
    fontWeight: "600",
    color: "#333",
    marginBottom: 8,
  },
  headingLine: {
    width: 60,
    height: 3,
    backgroundColor: "#FF8383",
    borderRadius: 2,
  },
  form: {
    gap: 20,
  },
  inputField: {
    gap: 8,
  },
  label: {
    fontSize: 16,
    fontWeight: "500",
    color: "#555",
  },
  inputBox: {
    flexDirection: "row",
    alignItems: "center",
    paddingBottom: 10,
    borderBottomWidth: 1,
    borderBottomColor: "#DDD",
    gap: 8,
  },
  inputBoxFocused: {
    borderBottomColor: "#FF8383",
  },
  inputIcon: {
    fontSize: 20,
  },
  inputDivider: {
    width: 1,
    height: 20,
    backgroundColor: "#DDD",
  },
  input: {
    flex: 1,
    fontSize: 16,
    color: "#333",
    paddingVertical: 0,
  },
  codeInput: {
    fontSize: 20,
    fontWeight: "600",
    letterSpacing: 4,
  },
  primaryButton: {
    backgroundColor: "#FF8383",
    paddingVertical: 16,
    borderRadius: 12,
    alignItems: "center",
    marginTop: 12,
  },
  buttonDisabled: {
    opacity: 0.6,
  },
  primaryButtonText: {
    color: "#FFFFFF",
    fontSize: 18,
    fontWeight: "600",
  },
  secondaryButton: {
    paddingVertical: 12,
    alignItems: "center",
  },
  secondaryButtonText: {
    fontSize: 14,
    color: "#999",
  },
  linkText: {
    color: "#FF8383",
    fontWeight: "600",
  },
});
