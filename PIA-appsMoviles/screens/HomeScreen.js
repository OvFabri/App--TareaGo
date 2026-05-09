import React, { useState } from 'react';
import {
  View, Text, StyleSheet, FlatList, TouchableOpacity,
  TextInput, Modal, Alert, SafeAreaView, KeyboardAvoidingView,
  Platform, Image,
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { useTasks } from '../context/TaskContext';

const getColors = (dark) => dark ? {
  primary:      '#1D9E75',
  primaryLight: '#0F3028',
  warning:      '#EF9F27',
  warningLight: '#3A2800',
  background:   '#111111',
  card:         '#1A1A1A',
  border:       '#2A2A2A',
  text:         '#FFFFFF',
  textMuted:    '#888',
  textLight:    '#444',
  badgePendingText: '#EF9F27',
  badgeDoneText:    '#1D9E75',
} : {
  primary:      '#1D9E75',
  primaryLight: '#E1F5EE',
  warning:      '#EF9F27',
  warningLight: '#FAEEDA',
  background:   '#F7F8FA',
  card:         '#FFFFFF',
  border:       '#EBEBEB',
  text:         '#1A1A1A',
  textMuted:    '#888',
  textLight:    '#BBB',
  badgePendingText: '#854F0B',
  badgeDoneText:    '#1D9E75',
};

export default function HomeScreen() {
  const { tasks, addTask, toggleTask, deleteTask, darkMode } = useTasks();
  const C = getColors(darkMode);

  const [filter, setFilter]         = useState('all');
  const [modalVisible, setModal]    = useState(false);
  const [newTaskTitle, setNewTitle] = useState('');

  const filteredTasks = tasks.filter(t =>
    filter === 'all' ? true : t.status === filter
  );

  const total     = tasks.length;
  const pending   = tasks.filter(t => t.status === 'pending').length;
  const completed = tasks.filter(t => t.status === 'completed').length;

  const handleAdd = () => {
    if (!newTaskTitle.trim()) { Alert.alert('Espera', 'Escribe un nombre para la tarea 📝'); return; }
    addTask(newTaskTitle);
    setNewTitle('');
    setModal(false);
  };

  const handleDelete = (id) => {
    Alert.alert('Eliminar tarea', '¿Seguro que quieres eliminarla?', [
      { text: 'Cancelar', style: 'cancel' },
      { text: 'Eliminar', style: 'destructive', onPress: () => deleteTask(id) },
    ]);
  };

  const renderTask = ({ item }) => {
    const isDone = item.status === 'completed';
    return (
      <View style={[styles.card, { backgroundColor: C.card, borderColor: C.border }, isDone && { opacity: 0.65 }]}>
        <TouchableOpacity
          style={[styles.checkCircle, { borderColor: C.border }, isDone && { backgroundColor: C.primary, borderColor: C.primary }]}
          onPress={() => toggleTask(item.id, item.status)}
          activeOpacity={0.7}
        >
          {isDone && <Ionicons name="checkmark" size={14} color="#fff" />}
        </TouchableOpacity>

        <View style={styles.cardBody}>
          <Text style={[styles.cardTitle, { color: C.text }, isDone && { textDecorationLine: 'line-through', color: C.textMuted }]} numberOfLines={2}>
            {item.title}
          </Text>
          <View style={styles.cardMeta}>
            <View style={[styles.badge, { backgroundColor: isDone ? C.primaryLight : C.warningLight }]}>
              <Text style={[styles.badgeText, { color: isDone ? C.badgeDoneText : C.badgePendingText }]}>
                {isDone ? 'Completada' : 'Pendiente'}
              </Text>
            </View>
            <Text style={[styles.dateText, { color: C.textLight }]}>{item.date}</Text>
          </View>
        </View>

        {item.photo ? (
          <Image source={{ uri: item.photo }} style={[styles.photoThumb, { borderColor: C.border }]} />
        ) : (
          <View style={[styles.photoIcon, { backgroundColor: C.background, borderColor: C.border }]}>
            <Ionicons name="camera-outline" size={16} color={C.textLight} />
          </View>
        )}

        <TouchableOpacity style={styles.deleteBtn} onPress={() => handleDelete(item.id)} activeOpacity={0.7}>
          <Ionicons name="trash-outline" size={16} color={C.textMuted} />
        </TouchableOpacity>
      </View>
    );
  };

  const EmptyState = () => (
    <View style={styles.emptyContainer}>
      <Ionicons name="checkmark-done-circle-outline" size={56} color={C.textLight} />
      <Text style={[styles.emptyTitle, { color: C.textMuted }]}>Sin tareas aquí</Text>
      <Text style={[styles.emptySub, { color: C.textLight }]}>Toca + para agregar una nueva tarea</Text>
    </View>
  );

  return (
    <SafeAreaView style={[styles.safe, { backgroundColor: C.background }]}>

      {/* Stats */}
      <View style={styles.statsRow}>
        {[
          { num: total,     lbl: 'Total',       color: C.text },
          { num: pending,   lbl: 'Pendientes',  color: C.warning },
          { num: completed, lbl: 'Completadas', color: C.primary },
        ].map((s, i) => (
          <View key={i} style={[styles.statPill, { backgroundColor: C.card, borderColor: C.border }]}>
            <Text style={[styles.statNum, { color: s.color }]}>{s.num}</Text>
            <Text style={[styles.statLbl, { color: C.textMuted }]}>{s.lbl}</Text>
          </View>
        ))}
      </View>

      {/* Filtros */}
      <View style={styles.filterRow}>
        {['all', 'pending', 'completed'].map(f => (
          <TouchableOpacity
            key={f}
            style={[styles.filterTab, { backgroundColor: C.card, borderColor: C.border }, filter === f && { backgroundColor: C.primary, borderColor: C.primary }]}
            onPress={() => setFilter(f)}
            activeOpacity={0.8}
          >
            <Text style={[styles.filterTabText, { color: C.textMuted }, filter === f && { color: '#fff' }]}>
              {f === 'all' ? 'Todas' : f === 'pending' ? 'Pendiente' : 'Completada'}
            </Text>
          </TouchableOpacity>
        ))}
      </View>

      {/* Lista */}
      <FlatList
        data={filteredTasks}
        keyExtractor={item => item.id}
        renderItem={renderTask}
        contentContainerStyle={[styles.listContent, filteredTasks.length === 0 && { flex: 1 }]}
        ListEmptyComponent={EmptyState}
        showsVerticalScrollIndicator={false}
      />

      {/* FAB */}
      <TouchableOpacity style={[styles.fab, { backgroundColor: C.primary }]} onPress={() => setModal(true)} activeOpacity={0.85}>
        <Ionicons name="add" size={30} color="#fff" />
      </TouchableOpacity>

      {/* Modal */}
      <Modal visible={modalVisible} animationType="slide" transparent onRequestClose={() => setModal(false)}>
        <KeyboardAvoidingView behavior={Platform.OS === 'ios' ? 'padding' : 'height'} style={styles.modalOverlay}>
          <View style={[styles.modalSheet, { backgroundColor: C.card }]}>
            <View style={[styles.modalHandle, { backgroundColor: C.border }]} />
            <Text style={[styles.modalTitle, { color: C.text }]}>Nueva tarea</Text>
            <TextInput
              style={[styles.input, { backgroundColor: C.background, borderColor: C.border, color: C.text }]}
              placeholder="¿Qué tienes que hacer?"
              placeholderTextColor={C.textLight}
              value={newTaskTitle}
              onChangeText={setNewTitle}
              autoFocus
              multiline
              maxLength={120}
            />
            <View style={styles.modalActions}>
              <TouchableOpacity style={[styles.btnCancel, { backgroundColor: C.background, borderColor: C.border }]} onPress={() => { setModal(false); setNewTitle(''); }}>
                <Text style={[styles.btnCancelText, { color: C.textMuted }]}>Cancelar</Text>
              </TouchableOpacity>
              <TouchableOpacity style={[styles.btnAdd, { backgroundColor: C.primary }]} onPress={handleAdd}>
                <Text style={styles.btnAddText}>Agregar tarea</Text>
              </TouchableOpacity>
            </View>
          </View>
        </KeyboardAvoidingView>
      </Modal>

    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  safe:         { flex: 1 },
  statsRow:     { flexDirection: 'row', gap: 10, paddingHorizontal: 16, paddingTop: 14, paddingBottom: 10 },
  statPill:     { flex: 1, borderRadius: 12, paddingVertical: 10, alignItems: 'center', borderWidth: 0.5 },
  statNum:      { fontSize: 20, fontWeight: '700' },
  statLbl:      { fontSize: 10, marginTop: 2 },
  filterRow:    { flexDirection: 'row', gap: 8, paddingHorizontal: 16, paddingBottom: 12 },
  filterTab:    { paddingHorizontal: 14, paddingVertical: 6, borderRadius: 20, borderWidth: 0.5 },
  filterTabText:{ fontSize: 12, fontWeight: '600' },
  listContent:  { paddingHorizontal: 16, paddingBottom: 100, gap: 10 },
  card:         { flexDirection: 'row', alignItems: 'center', borderRadius: 14, padding: 14, borderWidth: 0.5, gap: 12 },
  checkCircle:  { width: 24, height: 24, borderRadius: 12, borderWidth: 2, alignItems: 'center', justifyContent: 'center' },
  cardBody:     { flex: 1, gap: 6 },
  cardTitle:    { fontSize: 14, fontWeight: '600', lineHeight: 19 },
  cardMeta:     { flexDirection: 'row', alignItems: 'center', gap: 8 },
  badge:        { paddingHorizontal: 8, paddingVertical: 2, borderRadius: 10 },
  badgeText:    { fontSize: 10, fontWeight: '600' },
  dateText:     { fontSize: 11 },
  photoThumb:   { width: 42, height: 42, borderRadius: 10, borderWidth: 0.5 },
  photoIcon:    { width: 42, height: 42, borderRadius: 10, alignItems: 'center', justifyContent: 'center', borderWidth: 0.5 },
  deleteBtn:    { width: 32, height: 32, alignItems: 'center', justifyContent: 'center', borderRadius: 8 },
  emptyContainer: { flex: 1, alignItems: 'center', justifyContent: 'center', gap: 8, paddingBottom: 60 },
  emptyTitle:   { fontSize: 15, fontWeight: '600', marginTop: 8 },
  emptySub:     { fontSize: 13 },
  fab:          { position: 'absolute', bottom: 24, right: 20, width: 56, height: 56, borderRadius: 28, alignItems: 'center', justifyContent: 'center', shadowColor: '#1D9E75', shadowOffset: { width: 0, height: 4 }, shadowOpacity: 0.35, shadowRadius: 8, elevation: 6 },
  modalOverlay: { flex: 1, justifyContent: 'flex-end', backgroundColor: 'rgba(0,0,0,0.4)' },
  modalSheet:   { borderTopLeftRadius: 24, borderTopRightRadius: 24, padding: 24, paddingBottom: 36, gap: 16 },
  modalHandle:  { width: 40, height: 4, borderRadius: 2, alignSelf: 'center', marginBottom: 4 },
  modalTitle:   { fontSize: 18, fontWeight: '700' },
  input:        { borderRadius: 12, borderWidth: 1, padding: 14, fontSize: 15, minHeight: 80, textAlignVertical: 'top' },
  modalActions: { flexDirection: 'row', gap: 10 },
  btnCancel:    { flex: 1, paddingVertical: 14, borderRadius: 12, alignItems: 'center', borderWidth: 1 },
  btnCancelText:{ fontSize: 14, fontWeight: '600' },
  btnAdd:       { flex: 2, paddingVertical: 14, borderRadius: 12, alignItems: 'center' },
  btnAddText:   { fontSize: 14, fontWeight: '700', color: '#fff' },
});