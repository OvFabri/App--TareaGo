import React, { useEffect, useState } from 'react';
import { ActivityIndicator, View } from 'react-native';
import { NavigationContainer } from '@react-navigation/native';
import { createBottomTabNavigator } from '@react-navigation/bottom-tabs';
import { Ionicons } from '@expo/vector-icons';
import { onAuthStateChanged } from 'firebase/auth';

import { auth } from './src/firebase/config';
import { TaskProvider, useTasks } from './context/TaskContext';

import HomeScreen    from './screens/HomeScreen';
import CameraScreen  from './screens/CameraScreen';
import ProfileScreen from './screens/ProfileScreen';
import LoginScreen   from './src/pantallas/LoginScreen';

const Tab = createBottomTabNavigator();

function Tabs() {
  const { darkMode, loading } = useTasks();

  const C = darkMode ? {
    primary: '#1D9E75', bg: '#111', tabBar: '#1A1A1A', inactive: '#555', border: '#2A2A2A', text: '#FFF',
  } : {
    primary: '#1D9E75', bg: '#FFF', tabBar: '#FFF', inactive: '#9E9E9E', border: '#F0F0F0', text: '#1A1A1A',
  };

  // Spinner mientras Firestore carga datos del usuario
  if (loading) {
    return (
      <View style={{ flex: 1, justifyContent: 'center', alignItems: 'center', backgroundColor: C.bg }}>
        <ActivityIndicator size="large" color={C.primary} />
      </View>
    );
  }

  return (
    <Tab.Navigator
      screenOptions={({ route }) => ({
        tabBarIcon: ({ focused, color, size }) => {
          let icon;
          if (route.name === 'Inicio') icon = focused ? 'home'   : 'home-outline';
          if (route.name === 'Cámara') icon = focused ? 'camera' : 'camera-outline';
          if (route.name === 'Perfil') icon = focused ? 'person' : 'person-outline';
          return <Ionicons name={icon} size={size} color={color} />;
        },
        tabBarActiveTintColor:   C.primary,
        tabBarInactiveTintColor: C.inactive,
        tabBarStyle:   { backgroundColor: C.tabBar, borderTopColor: C.border, borderTopWidth: 1, height: 60, paddingBottom: 8, paddingTop: 6 },
        tabBarLabelStyle: { fontSize: 11, fontWeight: '600' },
        headerStyle:   { backgroundColor: C.bg, shadowColor: 'transparent', elevation: 0, borderBottomWidth: 1, borderBottomColor: C.border },
        headerTitleStyle: { fontSize: 20, fontWeight: '700', color: C.text },
        headerTintColor: C.primary,
      })}
    >
      <Tab.Screen name="Inicio" component={HomeScreen}    options={{ headerTitle: 'TareaGo ✓' }} />
      <Tab.Screen name="Cámara" component={CameraScreen}  options={{ headerTitle: 'Tomar Evidencia' }} />
      <Tab.Screen name="Perfil" component={ProfileScreen} options={{ headerTitle: 'Mi Perfil' }} />
    </Tab.Navigator>
  );
}

export default function App() {
  const [user, setUser]   = useState(undefined);
  const [ready, setReady] = useState(false);

  useEffect(() => {
    const unsub = onAuthStateChanged(auth, (firebaseUser) => {
      setUser(firebaseUser);
      setReady(true);
    });
    return unsub;
  }, []);

  if (!ready) {
    return (
      <View style={{ flex: 1, justifyContent: 'center', alignItems: 'center', backgroundColor: '#F7F8FA' }}>
        <ActivityIndicator size="large" color="#1D9E75" />
      </View>
    );
  }

  if (!user) return <LoginScreen />;

  return (
    <TaskProvider>
      <NavigationContainer>
        <Tabs />
      </NavigationContainer>
    </TaskProvider>
  );
}