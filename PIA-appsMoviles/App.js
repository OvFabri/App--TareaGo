import { StatusBar } from 'expo-status-bar';
import { NavigationContainer } from '@react-navigation/native';
import { createBottomTabNavigator } from '@react-navigation/bottom-tabs';
import { Ionicons } from '@expo/vector-icons';

import HomeScreen    from './screens/HomeScreen';
import CameraScreen  from './screens/CameraScreen';
import ProfileScreen from './screens/ProfileScreen';
import { TaskProvider, useTasks } from './context/TaskContext';

const Tab = createBottomTabNavigator();

function Tabs() {
  const { darkMode } = useTasks();

  const LIGHT = { primary:'#1D9E75', bg:'#FFFFFF', tabBar:'#FFFFFF', inactive:'#9E9E9E', border:'#F0F0F0', text:'#1A1A1A' };
  const DARK  = { primary:'#1D9E75', bg:'#111111', tabBar:'#1A1A1A', inactive:'#555',    border:'#2A2A2A', text:'#FFFFFF' };
  const C = darkMode ? DARK : LIGHT;

  return (
    <>
      <StatusBar style={darkMode ? 'light' : 'dark'} />
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
          tabBarStyle: { backgroundColor: C.tabBar, borderTopColor: C.border, borderTopWidth: 1, height: 60, paddingBottom: 8, paddingTop: 6 },
          tabBarLabelStyle: { fontSize: 11, fontWeight: '600' },
          headerStyle: { backgroundColor: C.bg, shadowColor: 'transparent', elevation: 0, borderBottomWidth: 1, borderBottomColor: C.border },
          headerTitleStyle: { fontSize: 20, fontWeight: '700', color: C.text },
          headerTintColor: C.primary,
        })}
      >
        <Tab.Screen name="Inicio" component={HomeScreen} options={{ headerTitle: 'TareaGo ✓' }} />
        <Tab.Screen name="Cámara" component={CameraScreen} options={{ headerTitle: 'Tomar Evidencia' }} />
        <Tab.Screen name="Perfil" component={ProfileScreen} options={{ headerTitle: 'Mi Perfil' }} />
      </Tab.Navigator>
    </>
  );
}

export default function App() {
  return (
    <TaskProvider>
      <NavigationContainer>
        <Tabs />
      </NavigationContainer>
    </TaskProvider>
  );
}