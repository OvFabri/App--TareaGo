import React, { createContext, useContext, useState } from 'react';

const TaskContext = createContext();

export function TaskProvider({ children }) {
  const [tasks, setTasks]       = useState([]);
  const [darkMode, setDarkMode] = useState(false);

  // Perfil
  const [profile, setProfile] = useState({
    nombre:   '',
    apellido: '',
    photo:    null,
  });

  const addTask = (title) => {
    const nueva = {
      id:     Date.now().toString(),
      title:  title.trim(),
      status: 'pending',
      photo:  null,
      date:   'Ahora',
    };
    setTasks(prev => [nueva, ...prev]);
    return nueva.id;
  };

  const toggleTask = (id) => {
    setTasks(prev =>
      prev.map(t =>
        t.id === id
          ? { ...t, status: t.status === 'pending' ? 'completed' : 'pending' }
          : t
      )
    );
  };

  const deleteTask = (id) => {
    setTasks(prev => prev.filter(t => t.id !== id));
  };

  const assignPhoto = (taskId, photoUri) => {
    setTasks(prev =>
      prev.map(t => t.id === taskId ? { ...t, photo: photoUri } : t)
    );
  };

  const updateProfile = (data) => setProfile(prev => ({ ...prev, ...data }));
  const toggleDark    = () => setDarkMode(prev => !prev);

  return (
    <TaskContext.Provider value={{
      tasks, addTask, toggleTask, deleteTask, assignPhoto,
      darkMode, toggleDark,
      profile, updateProfile,
    }}>
      {children}
    </TaskContext.Provider>
  );
}

export function useTasks() {
  return useContext(TaskContext);
}