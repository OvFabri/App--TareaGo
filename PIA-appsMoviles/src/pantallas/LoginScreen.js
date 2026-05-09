import React, { useState } from 'react';
import {
  View, Text, TextInput, TouchableOpacity, StyleSheet,
  SafeAreaView, KeyboardAvoidingView, Platform, Alert,
  ActivityIndicator,
} from 'react-native';
import { signInWithEmailAndPassword, createUserWithEmailAndPassword } from 'firebase/auth';
import { Ionicons } from '@expo/vector-icons';
import { auth } from '../firebase/config';

const COLORS = {
  primary:      '#1D9E75',
  primaryLight: '#E1F5EE',
  background:   '#F7F8FA',
  card:         '#FFFFFF',
  border:       '#EBEBEB',
  text:         '#1A1A1A',
  textMuted:    '#888',
  textLight:    '#BBB',
};

export default function LoginScreen() {
  const [isRegister, setIsRegister] = useState(false); // false = login, true = registro
  const [email, setEmail]           = useState('');
  const [password, setPassword]     = useState('');
  const [confirmPass, setConfirmPass] = useState('');
  const [showPass, setShowPass]     = useState(false);
  const [showConfirm, setShowConfirm] = useState(false);
  const [loading, setLoading]       = useState(false);

  const resetForm = () => {
    setEmail('');
    setPassword('');
    setConfirmPass('');
    setShowPass(false);
    setShowConfirm(false);
  };

  const switchMode = () => {
    resetForm();
    setIsRegister(prev => !prev);
  };

  // ── Login
  const handleLogin = async () => {
    if (!email.trim() || !password.trim()) {
      Alert.alert('Campos vacíos', 'Por favor ingresa tu correo y contraseña.');
      return;
    }
    try {
      setLoading(true);
      await signInWithEmailAndPassword(auth, email.trim(), password);
    } catch (error) {
      let msg = 'Ocurrió un error. Intenta de nuevo.';
      if (error.code === 'auth/invalid-credential' || error.code === 'auth/wrong-password') msg = 'Correo o contraseña incorrectos.';
      else if (error.code === 'auth/user-not-found')  msg = 'No existe una cuenta con ese correo.';
      else if (error.code === 'auth/invalid-email')   msg = 'El correo no tiene un formato válido.';
      else if (error.code === 'auth/too-many-requests') msg = 'Demasiados intentos. Espera un momento.';
      Alert.alert('Error al iniciar sesión', msg);
    } finally {
      setLoading(false);
    }
  };

  // ── Registro
  const handleRegister = async () => {
    if (!email.trim() || !password.trim() || !confirmPass.trim()) {
      Alert.alert('Campos vacíos', 'Por favor llena todos los campos.');
      return;
    }
    if (password !== confirmPass) {
      Alert.alert('Contraseñas diferentes', 'Las contraseñas no coinciden.');
      return;
    }
    if (password.length < 6) {
      Alert.alert('Contraseña muy corta', 'La contraseña debe tener al menos 6 caracteres.');
      return;
    }
    try {
      setLoading(true);
      await createUserWithEmailAndPassword(auth, email.trim(), password);
      // onAuthStateChanged detecta el nuevo usuario y abre la app
    } catch (error) {
      let msg = 'Ocurrió un error. Intenta de nuevo.';
      if (error.code === 'auth/email-already-in-use') msg = 'Ya existe una cuenta con ese correo.';
      else if (error.code === 'auth/invalid-email')   msg = 'El correo no tiene un formato válido.';
      else if (error.code === 'auth/weak-password')   msg = 'La contraseña es muy débil.';
      Alert.alert('Error al crear cuenta', msg);
    } finally {
      setLoading(false);
    }
  };

  return (
    <SafeAreaView style={styles.safe}>
      <KeyboardAvoidingView behavior={Platform.OS === 'ios' ? 'padding' : 'height'} style={styles.kav}>
        <View style={styles.container}>

          {/* Logo */}
          <View style={styles.logoArea}>
            <View style={styles.logoCircle}>
              <Ionicons name="checkmark-done" size={36} color="#fff" />
            </View>
            <Text style={styles.appName}>TareaGo</Text>
            <Text style={styles.appSub}>
              {isRegister ? 'Crea tu cuenta para empezar' : 'Inicia sesión para continuar'}
            </Text>
          </View>

          {/* Card formulario */}
          <View style={styles.card}>

            {/* Tabs Login / Registro */}
            <View style={styles.modeTabs}>
              <TouchableOpacity
                style={[styles.modeTab, !isRegister && styles.modeTabActive]}
                onPress={() => !isRegister || switchMode()}
                activeOpacity={0.8}
              >
                <Text style={[styles.modeTabText, !isRegister && styles.modeTabTextActive]}>
                  Iniciar sesión
                </Text>
              </TouchableOpacity>
              <TouchableOpacity
                style={[styles.modeTab, isRegister && styles.modeTabActive]}
                onPress={() => isRegister || switchMode()}
                activeOpacity={0.8}
              >
                <Text style={[styles.modeTabText, isRegister && styles.modeTabTextActive]}>
                  Crear cuenta
                </Text>
              </TouchableOpacity>
            </View>

            {/* Email */}
            <View style={styles.fieldGroup}>
              <Text style={styles.fieldLabel}>Correo electrónico</Text>
              <View style={styles.inputWrapper}>
                <Ionicons name="mail-outline" size={18} color={COLORS.textMuted} style={styles.inputIcon} />
                <TextInput
                  style={styles.input}
                  placeholder="correo@ejemplo.com"
                  placeholderTextColor={COLORS.textLight}
                  value={email}
                  onChangeText={setEmail}
                  keyboardType="email-address"
                  autoCapitalize="none"
                  autoCorrect={false}
                />
              </View>
            </View>

            {/* Contraseña */}
            <View style={styles.fieldGroup}>
              <Text style={styles.fieldLabel}>Contraseña</Text>
              <View style={styles.inputWrapper}>
                <Ionicons name="lock-closed-outline" size={18} color={COLORS.textMuted} style={styles.inputIcon} />
                <TextInput
                  style={[styles.input, { flex: 1 }]}
                  placeholder="••••••••"
                  placeholderTextColor={COLORS.textLight}
                  value={password}
                  onChangeText={setPassword}
                  secureTextEntry={!showPass}
                  autoCapitalize="none"
                />
                <TouchableOpacity onPress={() => setShowPass(p => !p)} style={styles.eyeBtn}>
                  <Ionicons name={showPass ? 'eye-off-outline' : 'eye-outline'} size={18} color={COLORS.textMuted} />
                </TouchableOpacity>
              </View>
            </View>

            {/* Confirmar contraseña — solo en registro */}
            {isRegister && (
              <View style={styles.fieldGroup}>
                <Text style={styles.fieldLabel}>Confirmar contraseña</Text>
                <View style={styles.inputWrapper}>
                  <Ionicons name="lock-closed-outline" size={18} color={COLORS.textMuted} style={styles.inputIcon} />
                  <TextInput
                    style={[styles.input, { flex: 1 }]}
                    placeholder="••••••••"
                    placeholderTextColor={COLORS.textLight}
                    value={confirmPass}
                    onChangeText={setConfirmPass}
                    secureTextEntry={!showConfirm}
                    autoCapitalize="none"
                  />
                  <TouchableOpacity onPress={() => setShowConfirm(p => !p)} style={styles.eyeBtn}>
                    <Ionicons name={showConfirm ? 'eye-off-outline' : 'eye-outline'} size={18} color={COLORS.textMuted} />
                  </TouchableOpacity>
                </View>
              </View>
            )}

            {/* Botón principal */}
            <TouchableOpacity
              style={[styles.btnMain, loading && { opacity: 0.7 }]}
              onPress={isRegister ? handleRegister : handleLogin}
              disabled={loading}
              activeOpacity={0.85}
            >
              {loading
                ? <ActivityIndicator color="#fff" />
                : <Text style={styles.btnMainText}>
                    {isRegister ? 'Crear cuenta' : 'Iniciar sesión'}
                  </Text>
              }
            </TouchableOpacity>

          </View>

          <Text style={styles.footer}>TareaGo · Apps Móviles</Text>

        </View>
      </KeyboardAvoidingView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  safe:      { flex: 1, backgroundColor: COLORS.background },
  kav:       { flex: 1 },
  container: { flex: 1, justifyContent: 'center', padding: 24, gap: 24 },

  // Logo
  logoArea:   { alignItems: 'center', gap: 8 },
  logoCircle: { width: 72, height: 72, borderRadius: 36, backgroundColor: COLORS.primary, alignItems: 'center', justifyContent: 'center', marginBottom: 4 },
  appName:    { fontSize: 28, fontWeight: '700', color: COLORS.text, letterSpacing: -0.5 },
  appSub:     { fontSize: 14, color: COLORS.textMuted },

  // Card
  card: { backgroundColor: COLORS.card, borderRadius: 20, padding: 20, gap: 16, borderWidth: 0.5, borderColor: COLORS.border },

  // Tabs modo
  modeTabs:        { flexDirection: 'row', backgroundColor: COLORS.background, borderRadius: 12, padding: 4, gap: 4 },
  modeTab:         { flex: 1, paddingVertical: 8, borderRadius: 10, alignItems: 'center' },
  modeTabActive:   { backgroundColor: COLORS.card, shadowColor: '#000', shadowOffset: { width: 0, height: 1 }, shadowOpacity: 0.08, shadowRadius: 4, elevation: 2 },
  modeTabText:     { fontSize: 13, fontWeight: '600', color: COLORS.textMuted },
  modeTabTextActive: { color: COLORS.primary },

  // Campos
  fieldGroup:   { gap: 6 },
  fieldLabel:   { fontSize: 12, fontWeight: '600', color: COLORS.textMuted, marginLeft: 2 },
  inputWrapper: { flexDirection: 'row', alignItems: 'center', backgroundColor: COLORS.background, borderRadius: 12, borderWidth: 1, borderColor: COLORS.border, paddingHorizontal: 12 },
  inputIcon:    { marginRight: 8 },
  input:        { flex: 1, paddingVertical: 13, fontSize: 15, color: COLORS.text },
  eyeBtn:       { padding: 4 },

  // Botón
  btnMain:     { backgroundColor: COLORS.primary, paddingVertical: 15, borderRadius: 12, alignItems: 'center' },
  btnMainText: { color: '#fff', fontSize: 15, fontWeight: '700' },

  footer: { textAlign: 'center', fontSize: 12, color: COLORS.textLight },
});