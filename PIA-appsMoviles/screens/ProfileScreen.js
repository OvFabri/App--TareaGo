import React, { useState } from 'react';
import {
  View, Text, StyleSheet, SafeAreaView, ScrollView,
  TouchableOpacity, TextInput, Alert, Modal,
  KeyboardAvoidingView, Platform, Image, Switch,
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import * as ImagePicker from 'expo-image-picker';
import { useTasks } from '../context/TaskContext';

export default function ProfileScreen() {
  const { tasks, darkMode, toggleDark, profile, updateProfile } = useTasks();

  const [editModal, setEditModal]   = useState(false);
  const [tempNombre, setTempNombre]   = useState('');
  const [tempApellido, setTempApellido] = useState('');

  // ── Colores según tema
  const C = darkMode ? {
    bg: '#111', card: '#1A1A1A', border: '#2A2A2A',
    text: '#FFF', muted: '#888', light: '#444',
    primary: '#1D9E75', primaryLight: '#0F3028',
    warning: '#EF9F27', purple: '#9B8FFF',
    input: '#222',
  } : {
    bg: '#F7F8FA', card: '#FFF', border: '#EBEBEB',
    text: '#1A1A1A', muted: '#888', light: '#BBB',
    primary: '#1D9E75', primaryLight: '#E1F5EE',
    warning: '#EF9F27', purple: '#7B61FF',
    input: '#F7F8FA',
  };

  // ── Stats
  const total     = tasks.length;
  const completed = tasks.filter(t => t.status === 'completed').length;
  const pending   = tasks.filter(t => t.status === 'pending').length;
  const withPhoto = tasks.filter(t => t.photo).length;
  const progress  = total === 0 ? 0 : Math.round((completed / total) * 100);

  // ── Iniciales
  const initials = [profile.nombre, profile.apellido]
    .filter(Boolean)
    .map(w => w[0])
    .join('')
    .toUpperCase() || '?';

  const fullName = [profile.nombre, profile.apellido].filter(Boolean).join(' ') || 'Sin nombre';

  // ── Elegir foto de perfil
  const pickProfilePhoto = async () => {
    const { status } = await ImagePicker.requestMediaLibraryPermissionsAsync();
    if (status !== 'granted') {
      Alert.alert('Sin permiso', 'Necesitamos acceso a tu galería.');
      return;
    }
    const result = await ImagePicker.launchImageLibraryAsync({
      mediaTypes: ImagePicker.MediaTypeOptions.Images,
      allowsEditing: true,
      aspect: [1, 1],
      quality: 0.8,
    });
    if (!result.canceled) {
      updateProfile({ photo: result.assets[0].uri });
    }
  };

  // ── Guardar perfil
  const saveProfile = () => {
    updateProfile({ nombre: tempNombre.trim(), apellido: tempApellido.trim() });
    setEditModal(false);
  };

  return (
    <SafeAreaView style={[styles.safe, { backgroundColor: C.bg }]}>
      <ScrollView contentContainerStyle={styles.scroll} showsVerticalScrollIndicator={false}>

        {/* ── Avatar + nombre ── */}
        <View style={[styles.profileHeader, { backgroundColor: C.card, borderColor: C.border }]}>

          {/* Foto o iniciales */}
          <TouchableOpacity onPress={pickProfilePhoto} activeOpacity={0.8} style={styles.avatarWrapper}>
            {profile.photo ? (
              <Image source={{ uri: profile.photo }} style={styles.avatarImg} />
            ) : (
              <View style={[styles.avatar, { backgroundColor: C.primary }]}>
                <Text style={styles.avatarText}>{initials}</Text>
              </View>
            )}
            {/* Badge cámara */}
            <View style={[styles.cameraBadge, { backgroundColor: C.primary }]}>
              <Ionicons name="camera" size={12} color="#fff" />
            </View>
          </TouchableOpacity>

          <Text style={[styles.nameText, { color: C.text }]}>{fullName}</Text>

          <TouchableOpacity
            style={[styles.editBtn, { borderColor: C.primary, backgroundColor: C.primaryLight }]}
            onPress={() => { setTempNombre(profile.nombre); setTempApellido(profile.apellido); setEditModal(true); }}
            activeOpacity={0.8}
          >
            <Ionicons name="pencil-outline" size={14} color={C.primary} />
            <Text style={[styles.editBtnText, { color: C.primary }]}>Editar perfil</Text>
          </TouchableOpacity>
        </View>

        {/* ── Barra de progreso ── */}
        <View style={[styles.card, { backgroundColor: C.card, borderColor: C.border }]}>
          <View style={styles.progressHeader}>
            <Text style={[styles.cardTitle, { color: C.text }]}>Progreso general</Text>
            <Text style={[styles.progressPct, { color: C.primary }]}>{progress}%</Text>
          </View>
          <View style={[styles.progressTrack, { backgroundColor: C.bg }]}>
            <View style={[styles.progressFill, { width: `${progress}%`, backgroundColor: C.primary }]} />
          </View>
          <Text style={[styles.progressSub, { color: C.muted }]}>
            {completed} de {total} tareas completadas
          </Text>
        </View>

        {/* ── Stats grid ── */}
        <View style={styles.statsGrid}>
          {[
            { icon: 'list-outline',             num: total,     lbl: 'Total',       color: C.primary },
            { icon: 'time-outline',             num: pending,   lbl: 'Pendientes',  color: C.warning },
            { icon: 'checkmark-circle-outline', num: completed, lbl: 'Completadas', color: C.primary },
            { icon: 'camera-outline',           num: withPhoto, lbl: 'Con foto',    color: C.purple  },
          ].map((s, i) => (
            <View key={i} style={[styles.statCard, { backgroundColor: C.card, borderColor: s.color }]}>
              <Ionicons name={s.icon} size={22} color={s.color} />
              <Text style={[styles.statNum, { color: s.color }]}>{s.num}</Text>
              <Text style={[styles.statLbl, { color: C.muted }]}>{s.lbl}</Text>
            </View>
          ))}
        </View>

        {/* ── Ajustes ── */}
        <View style={[styles.card, { backgroundColor: C.card, borderColor: C.border }]}>
          <Text style={[styles.cardTitle, { color: C.text }]}>Ajustes</Text>

          {/* Modo oscuro */}
          <View style={[styles.settingRow, { borderTopColor: C.border }]}>
            <View style={styles.settingLeft}>
              <Ionicons name={darkMode ? 'moon' : 'moon-outline'} size={20} color={C.primary} />
              <Text style={[styles.settingText, { color: C.text }]}>Modo oscuro</Text>
            </View>
            <Switch
              value={darkMode}
              onValueChange={toggleDark}
              trackColor={{ false: C.border, true: C.primary }}
              thumbColor="#fff"
            />
          </View>
        </View>

        {/* ── Acerca de ── */}
        <View style={[styles.card, { backgroundColor: C.card, borderColor: C.border }]}>
          <Text style={[styles.cardTitle, { color: C.text }]}>Acerca de TareaGo</Text>
          {[
            { icon: 'phone-portrait-outline', text: 'Proyecto — Apps Móviles' },
            { icon: 'code-slash-outline',     text: 'Hecho con React Native + Expo' },
            { icon: 'git-branch-outline',     text: 'Versión 1.0.0' },
          ].map((r, i) => (
            <View key={i} style={styles.infoRow}>
              <Ionicons name={r.icon} size={16} color={C.muted} />
              <Text style={[styles.infoText, { color: C.muted }]}>{r.text}</Text>
            </View>
          ))}
        </View>

      </ScrollView>

      {/* ── Modal editar perfil ── */}
      <Modal visible={editModal} animationType="slide" transparent onRequestClose={() => setEditModal(false)}>
        <KeyboardAvoidingView behavior={Platform.OS === 'ios' ? 'padding' : 'height'} style={styles.modalOverlay}>
          <View style={[styles.modalSheet, { backgroundColor: C.card }]}>
            <View style={[styles.modalHandle, { backgroundColor: C.border }]} />
            <Text style={[styles.modalTitle, { color: C.text }]}>Editar perfil</Text>

            <View style={styles.fieldGroup}>
              <Text style={[styles.fieldLabel, { color: C.muted }]}>Nombre</Text>
              <TextInput
                style={[styles.input, { backgroundColor: C.input, borderColor: C.border, color: C.text }]}
                value={tempNombre}
                onChangeText={setTempNombre}
                placeholder="Tu nombre"
                placeholderTextColor={C.light}
                autoFocus
                maxLength={40}
              />
            </View>

            <View style={styles.fieldGroup}>
              <Text style={[styles.fieldLabel, { color: C.muted }]}>Apellido</Text>
              <TextInput
                style={[styles.input, { backgroundColor: C.input, borderColor: C.border, color: C.text }]}
                value={tempApellido}
                onChangeText={setTempApellido}
                placeholder="Tu apellido"
                placeholderTextColor={C.light}
                maxLength={40}
              />
            </View>

            <View style={styles.modalActions}>
              <TouchableOpacity style={[styles.btnCancel, { backgroundColor: C.bg, borderColor: C.border }]} onPress={() => setEditModal(false)}>
                <Text style={[styles.btnCancelText, { color: C.muted }]}>Cancelar</Text>
              </TouchableOpacity>
              <TouchableOpacity style={[styles.btnSave, { backgroundColor: C.primary }]} onPress={saveProfile}>
                <Text style={styles.btnSaveText}>Guardar</Text>
              </TouchableOpacity>
            </View>
          </View>
        </KeyboardAvoidingView>
      </Modal>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  safe:   { flex: 1 },
  scroll: { padding: 16, gap: 14, paddingBottom: 40 },

  profileHeader: { alignItems: 'center', borderRadius: 20, paddingVertical: 28, paddingHorizontal: 16, borderWidth: 0.5, gap: 6 },
  avatarWrapper: { marginBottom: 4, position: 'relative' },
  avatarImg:     { width: 80, height: 80, borderRadius: 40 },
  avatar:        { width: 80, height: 80, borderRadius: 40, alignItems: 'center', justifyContent: 'center' },
  avatarText:    { fontSize: 28, fontWeight: '700', color: '#fff' },
  cameraBadge:   { position: 'absolute', bottom: 0, right: 0, width: 26, height: 26, borderRadius: 13, alignItems: 'center', justifyContent: 'center', borderWidth: 2, borderColor: '#fff' },
  nameText:      { fontSize: 20, fontWeight: '700' },
  editBtn:       { flexDirection: 'row', alignItems: 'center', gap: 4, marginTop: 8, paddingHorizontal: 14, paddingVertical: 6, borderRadius: 20, borderWidth: 1 },
  editBtnText:   { fontSize: 12, fontWeight: '600' },

  card:           { borderRadius: 16, padding: 16, gap: 10, borderWidth: 0.5 },
  cardTitle:      { fontSize: 15, fontWeight: '700' },
  progressHeader: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center' },
  progressPct:    { fontSize: 18, fontWeight: '700' },
  progressTrack:  { height: 8, borderRadius: 4, overflow: 'hidden' },
  progressFill:   { height: '100%', borderRadius: 4 },
  progressSub:    { fontSize: 12 },

  statsGrid: { flexDirection: 'row', flexWrap: 'wrap', gap: 10 },
  statCard:  { flex: 1, minWidth: '45%', borderRadius: 14, paddingVertical: 16, alignItems: 'center', gap: 4, borderWidth: 1 },
  statNum:   { fontSize: 22, fontWeight: '700' },
  statLbl:   { fontSize: 11 },

  settingRow:  { flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', paddingTop: 10, borderTopWidth: 0.5 },
  settingLeft: { flexDirection: 'row', alignItems: 'center', gap: 10 },
  settingText: { fontSize: 14, fontWeight: '500' },

  infoRow:  { flexDirection: 'row', alignItems: 'center', gap: 10 },
  infoText: { fontSize: 13 },

  modalOverlay: { flex: 1, justifyContent: 'flex-end', backgroundColor: 'rgba(0,0,0,0.4)' },
  modalSheet:   { borderTopLeftRadius: 24, borderTopRightRadius: 24, padding: 24, paddingBottom: 36, gap: 16 },
  modalHandle:  { width: 40, height: 4, borderRadius: 2, alignSelf: 'center', marginBottom: 4 },
  modalTitle:   { fontSize: 18, fontWeight: '700' },
  fieldGroup:   { gap: 6 },
  fieldLabel:   { fontSize: 12, fontWeight: '600', marginLeft: 2 },
  input:        { borderRadius: 12, borderWidth: 1, padding: 14, fontSize: 15 },
  modalActions: { flexDirection: 'row', gap: 10 },
  btnCancel:    { flex: 1, paddingVertical: 14, borderRadius: 12, alignItems: 'center', borderWidth: 1 },
  btnCancelText:{ fontSize: 14, fontWeight: '600' },
  btnSave:      { flex: 2, paddingVertical: 14, borderRadius: 12, alignItems: 'center' },
  btnSaveText:  { fontSize: 14, fontWeight: '700', color: '#fff' },
});