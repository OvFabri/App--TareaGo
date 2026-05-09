import React, { createContext, useContext, useState, useEffect } from 'react';
import {
  collection, doc, addDoc, updateDoc, deleteDoc,
  onSnapshot, query, orderBy, setDoc, getDoc,
} from 'firebase/firestore';
import { onAuthStateChanged } from 'firebase/auth';
import { auth, db } from '../src/firebase/config';

const TaskContext = createContext();

export function TaskProvider({ children }) {
  const [tasks, setTasks]     = useState([]);
  const [darkMode, setDarkMode] = useState(false);
  const [profile, setProfile]   = useState({ nombre: '', apellido: '', photo: null });
  const [userId, setUserId]     = useState(null);
  const [loading, setLoading]   = useState(true);

  // ── Escucha el usuario autenticado
  useEffect(() => {
    const unsub = onAuthStateChanged(auth, (user) => {
      if (user) setUserId(user.uid);
      else { setUserId(null); setTasks([]); setLoading(false); }
    });
    return unsub;
  }, []);

  // ── Cuando hay usuario, escucha sus tareas en tiempo real
  useEffect(() => {
    if (!userId) return;

    // Tareas — colección: users/{uid}/tasks
    const q = query(
      collection(db, 'users', userId, 'tasks'),
      orderBy('createdAt', 'desc')
    );
    const unsubTasks = onSnapshot(q, (snap) => {
      const data = snap.docs.map(d => ({ id: d.id, ...d.data() }));
      setTasks(data);
    });

    // Perfil y preferencias — documento: users/{uid}
    const unsubProfile = onSnapshot(doc(db, 'users', userId), (snap) => {
      if (snap.exists()) {
        const data = snap.data();
        if (data.profile)  setProfile(data.profile);
        if (data.darkMode !== undefined) setDarkMode(data.darkMode);
      }
      setLoading(false);
    });

    return () => { unsubTasks(); unsubProfile(); };
  }, [userId]);

  // ── Guardar preferencias (darkMode, perfil) en Firestore
  const saveUserDoc = async (data) => {
    if (!userId) return;
    await setDoc(doc(db, 'users', userId), data, { merge: true });
  };

  // ── Tareas
  const addTask = async (title) => {
    if (!userId) return;
    await addDoc(collection(db, 'users', userId, 'tasks'), {
      title:     title.trim(),
      status:    'pending',
      photo:     null,
      date:      new Date().toLocaleDateString('es-MX', { day: 'numeric', month: 'short' }),
      createdAt: Date.now(),
    });
  };

  const toggleTask = async (id, currentStatus) => {
    if (!userId) return;
    await updateDoc(doc(db, 'users', userId, 'tasks', id), {
      status: currentStatus === 'pending' ? 'completed' : 'pending',
    });
  };

  const deleteTask = async (id) => {
    if (!userId) return;
    await deleteDoc(doc(db, 'users', userId, 'tasks', id));
  };

  const assignPhoto = async (taskId, photoUri) => {
    if (!userId) return;
    await updateDoc(doc(db, 'users', userId, 'tasks', taskId), {
      photo: photoUri,
    });
  };

  // ── Perfil
  const updateProfile = async (data) => {
    const updated = { ...profile, ...data };
    setProfile(updated);
    await saveUserDoc({ profile: updated });
  };

  // ── Dark mode
  const toggleDark = async () => {
    const next = !darkMode;
    setDarkMode(next);
    await saveUserDoc({ darkMode: next });
  };

  return (
    <TaskContext.Provider value={{
      tasks, addTask, toggleTask, deleteTask, assignPhoto,
      darkMode, toggleDark,
      profile, updateProfile,
      loading,
    }}>
      {children}
    </TaskContext.Provider>
  );
}

export function useTasks() {
  return useContext(TaskContext);
}