import React, { useState, useRef } from 'react';
import {
  View, Text, StyleSheet, TouchableOpacity, Image,
  Alert, SafeAreaView, ScrollView, ActivityIndicator,
} from 'react-native';
import { CameraView, useCameraPermissions } from 'expo-camera';
import * as ImagePicker from 'expo-image-picker';
import { Ionicons } from '@expo/vector-icons';
import { useTasks } from '../context/TaskContext';

const getColors = (dark) => dark ? {
  primary:      '#1D9E75',
  primaryLight: '#0F3028',
  background:   '#111111',
  card:         '#1A1A1A',
  border:       '#2A2A2A',
  text:         '#FFFFFF',
  textMuted:    '#888',
  textLight:    '#444',
  dark:         '#000000',
} : {
  primary:      '#1D9E75',
  primaryLight: '#E1F5EE',
  background:   '#F7F8FA',
  card:         '#FFFFFF',
  border:       '#EBEBEB',
  text:         '#1A1A1A',
  textMuted:    '#888',
  textLight:    '#BBB',
  dark:         '#111111',
};

export default function CameraScreen() {
  const [permission, requestPermission] = useCameraPermissions();
  const [facing, setFacing]             = useState('back');
  const [photo, setPhoto]               = useState(null);
  const [loading, setLoading]           = useState(false);
  const [selectedTaskId, setSelectedTaskId] = useState(null);
  const cameraRef = useRef(null);

  const { tasks, assignPhoto, darkMode } = useTasks();
  const C = getColors(darkMode);

  const pendingTasks = tasks.filter(t => t.status === 'pending');

  if (!permission) {
    return <View style={[styles.centered, { backgroundColor: C.background }]}><ActivityIndicator size="large" color={C.primary} /></View>;
  }

  if (!permission.granted) {
    return (
      <SafeAreaView style={[styles.safe, { backgroundColor: C.background }]}>
        <View style={styles.permissionContainer}>
          <Ionicons name="camera-off-outline" size={64} color={C.textLight} />
          <Text style={[styles.permissionTitle, { color: C.text }]}>Permiso de cámara</Text>
          <Text style={[styles.permissionSub, { color: C.textMuted }]}>TareaGo necesita acceso a tu cámara para tomar fotos de evidencia.</Text>
          <TouchableOpacity style={[styles.btnPrimary, { backgroundColor: C.primary }]} onPress={requestPermission}>
            <Text style={styles.btnPrimaryText}>Dar permiso</Text>
          </TouchableOpacity>
        </View>
      </SafeAreaView>
    );
  }

  const takePicture = async () => {
    if (!cameraRef.current) return;
    try {
      setLoading(true);
      const result = await cameraRef.current.takePictureAsync({ quality: 0.8 });
      setPhoto(result.uri);
    } catch {
      Alert.alert('Error', 'No se pudo tomar la foto. Intenta de nuevo.');
    } finally {
      setLoading(false);
    }
  };

  const pickFromGallery = async () => {
    const { status } = await ImagePicker.requestMediaLibraryPermissionsAsync();
    if (status !== 'granted') { Alert.alert('Sin permiso', 'Necesitamos acceso a tu galería.'); return; }
    const result = await ImagePicker.launchImageLibraryAsync({ mediaTypes: ImagePicker.MediaTypeOptions.Images, quality: 0.8 });
    if (!result.canceled) setPhoto(result.assets[0].uri);
  };

  const discardPhoto = () => {
    Alert.alert('Descartar foto', '¿Quieres tomar otra foto?', [
      { text: 'Cancelar', style: 'cancel' },
      { text: 'Sí, descartar', style: 'destructive', onPress: () => setPhoto(null) },
    ]);
  };

  const handleAssign = () => {
    if (!selectedTaskId) { Alert.alert('Selecciona una tarea', 'Elige a qué tarea quieres asignar esta foto.'); return; }
    assignPhoto(selectedTaskId, photo);
    Alert.alert('¡Listo!', 'La foto fue asignada a la tarea.', [
      { text: 'OK', onPress: () => { setPhoto(null); setSelectedTaskId(null); } },
    ]);
  };

  // ── VISTA PREVIA
  if (photo) {
    return (
      <SafeAreaView style={[styles.safe, { backgroundColor: C.background }]}>
        <ScrollView contentContainerStyle={styles.previewContainer}>
          <Image source={{ uri: photo }} style={[styles.previewImage, { borderColor: C.border }]} resizeMode="cover" />

          <View style={[styles.sectionBox, { backgroundColor: C.card, borderColor: C.border }]}>
            <Text style={[styles.sectionTitle, { color: C.text }]}>Asignar a una tarea</Text>
            {pendingTasks.length === 0 ? (
              <Text style={[styles.noTasksText, { color: C.textMuted }]}>No tienes tareas pendientes. Crea una primero.</Text>
            ) : (
              pendingTasks.map(t => (
                <TouchableOpacity
                  key={t.id}
                  style={[
                    styles.taskOption,
                    { backgroundColor: C.background, borderColor: C.border },
                    selectedTaskId === t.id && { borderColor: C.primary, backgroundColor: C.primaryLight },
                  ]}
                  onPress={() => setSelectedTaskId(t.id)}
                  activeOpacity={0.8}
                >
                  <View style={[styles.radioCircle, { borderColor: C.border }, selectedTaskId === t.id && { borderColor: C.primary }]}>
                    {selectedTaskId === t.id && <View style={[styles.radioDot, { backgroundColor: C.primary }]} />}
                  </View>
                  <Text style={[styles.taskOptionText, { color: C.textMuted }, selectedTaskId === t.id && { color: C.primary }]} numberOfLines={1}>
                    {t.title}
                  </Text>
                </TouchableOpacity>
              ))
            )}
          </View>

          <View style={styles.previewActions}>
            <TouchableOpacity style={[styles.btnSecondary, { backgroundColor: C.card, borderColor: C.border }]} onPress={discardPhoto}>
              <Ionicons name="refresh-outline" size={18} color={C.textMuted} />
              <Text style={[styles.btnSecondaryText, { color: C.textMuted }]}>Retomar</Text>
            </TouchableOpacity>
            <TouchableOpacity
              style={[styles.btnPrimary, { backgroundColor: !selectedTaskId ? C.textLight : C.primary }]}
              onPress={handleAssign}
              disabled={!selectedTaskId}
            >
              <Ionicons name="checkmark-outline" size={18} color="#fff" />
              <Text style={styles.btnPrimaryText}>Asignar foto</Text>
            </TouchableOpacity>
          </View>
        </ScrollView>
      </SafeAreaView>
    );
  }

  // ── VISTA CÁMARA
  return (
    <View style={[styles.cameraContainer, { backgroundColor: C.dark }]}>
      <CameraView ref={cameraRef} style={styles.camera} facing={facing}>
        <View style={styles.cameraTopBar}>
          <Text style={styles.cameraHint}>Enfoca la evidencia de tu tarea</Text>
          <TouchableOpacity style={styles.iconBtn} onPress={() => setFacing(p => p === 'back' ? 'front' : 'back')}>
            <Ionicons name="camera-reverse-outline" size={26} color="#fff" />
          </TouchableOpacity>
        </View>

        <View style={styles.guideFrame} pointerEvents="none">
          <View style={[styles.corner, styles.cornerTL]} />
          <View style={[styles.corner, styles.cornerTR]} />
          <View style={[styles.corner, styles.cornerBL]} />
          <View style={[styles.corner, styles.cornerBR]} />
        </View>

        <View style={styles.cameraBottomBar}>
          <TouchableOpacity style={styles.sideBtn} onPress={pickFromGallery}>
            <Ionicons name="images-outline" size={26} color="#fff" />
            <Text style={styles.sideBtnText}>Galería</Text>
          </TouchableOpacity>
          <TouchableOpacity style={styles.shutterBtn} onPress={takePicture} activeOpacity={0.8} disabled={loading}>
            {loading ? <ActivityIndicator color={C.primary} /> : <View style={styles.shutterInner} />}
          </TouchableOpacity>
          <View style={styles.sideBtn} />
        </View>
      </CameraView>
    </View>
  );
}

const styles = StyleSheet.create({
  safe:      { flex: 1 },
  centered:  { flex: 1, alignItems: 'center', justifyContent: 'center' },
  permissionContainer: { flex: 1, alignItems: 'center', justifyContent: 'center', padding: 32, gap: 12 },
  permissionTitle: { fontSize: 20, fontWeight: '700', marginTop: 8 },
  permissionSub:   { fontSize: 14, textAlign: 'center', lineHeight: 21 },
  cameraContainer: { flex: 1 },
  camera:    { flex: 1, justifyContent: 'space-between' },
  cameraTopBar: { flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', paddingHorizontal: 20, paddingTop: 54, paddingBottom: 16, backgroundColor: 'rgba(0,0,0,0.35)' },
  cameraHint:   { color: '#fff', fontSize: 13, fontWeight: '500', opacity: 0.85 },
  iconBtn:      { width: 40, height: 40, alignItems: 'center', justifyContent: 'center' },
  guideFrame:   { alignSelf: 'center', width: 220, height: 220 },
  corner:       { position: 'absolute', width: 24, height: 24, borderColor: '#fff' },
  cornerTL: { top: 0, left: 0, borderTopWidth: 3, borderLeftWidth: 3, borderTopLeftRadius: 4 },
  cornerTR: { top: 0, right: 0, borderTopWidth: 3, borderRightWidth: 3, borderTopRightRadius: 4 },
  cornerBL: { bottom: 0, left: 0, borderBottomWidth: 3, borderLeftWidth: 3, borderBottomLeftRadius: 4 },
  cornerBR: { bottom: 0, right: 0, borderBottomWidth: 3, borderRightWidth: 3, borderBottomRightRadius: 4 },
  cameraBottomBar: { flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', paddingHorizontal: 32, paddingBottom: 48, paddingTop: 20, backgroundColor: 'rgba(0,0,0,0.35)' },
  sideBtn:     { width: 64, alignItems: 'center', gap: 4 },
  sideBtnText: { color: '#fff', fontSize: 11, opacity: 0.85 },
  shutterBtn:  { width: 72, height: 72, borderRadius: 36, backgroundColor: 'rgba(255,255,255,0.25)', alignItems: 'center', justifyContent: 'center', borderWidth: 3, borderColor: '#fff' },
  shutterInner:{ width: 54, height: 54, borderRadius: 27, backgroundColor: '#fff' },
  previewContainer: { padding: 16, gap: 16 },
  previewImage:     { width: '100%', height: 280, borderRadius: 16, borderWidth: 0.5 },
  sectionBox:   { borderRadius: 14, padding: 16, gap: 10, borderWidth: 0.5 },
  sectionTitle: { fontSize: 14, fontWeight: '700', marginBottom: 4 },
  noTasksText:  { fontSize: 13, textAlign: 'center', paddingVertical: 8 },
  taskOption:   { flexDirection: 'row', alignItems: 'center', gap: 10, paddingVertical: 10, paddingHorizontal: 12, borderRadius: 10, borderWidth: 1 },
  taskOptionText: { flex: 1, fontSize: 13, fontWeight: '500' },
  radioCircle:  { width: 18, height: 18, borderRadius: 9, borderWidth: 2, alignItems: 'center', justifyContent: 'center' },
  radioDot:     { width: 8, height: 8, borderRadius: 4 },
  previewActions: { flexDirection: 'row', gap: 10 },
  btnPrimary:   { flex: 2, flexDirection: 'row', alignItems: 'center', justifyContent: 'center', gap: 6, paddingVertical: 14, borderRadius: 12 },
  btnPrimaryText: { color: '#fff', fontWeight: '700', fontSize: 14 },
  btnSecondary: { flex: 1, flexDirection: 'row', alignItems: 'center', justifyContent: 'center', gap: 6, paddingVertical: 14, borderRadius: 12, borderWidth: 1 },
  btnSecondaryText: { fontWeight: '600', fontSize: 14 },
});