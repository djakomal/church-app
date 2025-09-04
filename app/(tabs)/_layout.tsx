import { NotificationTabIcon } from '@/components/NotificationTabIcon';
import { useAuth } from '@/context/AuthContext';
import { useColorScheme } from '@/hooks/useColorScheme';
import { Ionicons } from '@expo/vector-icons';
import { Tabs } from 'expo-router';
import { View } from 'react-native';
import { GestureHandlerRootView } from 'react-native-gesture-handler';

export default function TabLayout() {
  const colorScheme = useColorScheme();
  const { user, hasPermission } = useAuth();
  // Pas d'usage de Dimensions ici (erreur web). Garder simple.

  return (
    <GestureHandlerRootView style={{ flex: 1 }}>
      <Tabs
        screenOptions={{
          headerShown: true,
          headerTitleAlign: 'center',
          tabBarShowLabel: true,
          tabBarActiveTintColor: colorScheme === 'dark' ? '#4F8EF7' : '#2563eb',
          tabBarInactiveTintColor: colorScheme === 'dark' ? '#9ca3af' : '#9ca3af',
          tabBarIconStyle: { marginTop: 6 },
          tabBarLabelStyle: { fontSize: 11, marginBottom: 6, fontWeight: '500' },
          tabBarHideOnKeyboard: true,
          tabBarStyle: {
            position: 'absolute',
            bottom: 0,
            left: 0,
            right: 0,
            height: 90,
            backgroundColor: colorScheme === 'dark' ? '#0f1623' : '#ffffff',
            borderTopWidth: 1,
            borderTopColor: colorScheme === 'dark' ? '#1f2937' : '#e5e7eb',
            paddingBottom: 30,
            paddingTop: 10,
            paddingHorizontal: 15,
            elevation: 15,
            shadowColor: '#000',
            shadowOffset: {
              width: 0,
              height: -4,
            },
            shadowOpacity: 0.2,
            shadowRadius: 8,
            borderTopLeftRadius: 20,
            borderTopRightRadius: 20,
          },
        }}
      >
        <Tabs.Screen
          name="home"
          options={{
            title: 'Accueil',
            tabBarIcon: ({ color, size, focused }) => (
              <Ionicons name={focused ? 'home' : 'home-outline'} size={24} color={color} />
            ),
          }}
        />
        <Tabs.Screen name="index" options={{ href: null }} />
        <Tabs.Screen name="explore" options={{ href: null }} />
        <Tabs.Screen name="more" options={{ href: null }} />
        <Tabs.Screen
          name="songs"
          options={{
            title: 'Chants',
            tabBarIcon: ({ color, size }) => (
              <Ionicons name="musical-notes" size={24} color={color} />
            ),
          }}
        />
        <Tabs.Screen
          name="notifications"
          options={{
            title: 'Notifications',
            tabBarIcon: ({ color, size }) => (
              <NotificationTabIcon color={color} size={24} />
            ),
          }}
        />
        <Tabs.Screen
          name="profile"
          options={{
            title: 'Profil',
            tabBarIcon: ({ color, size }) => (
              <Ionicons name="person-circle" size={24} color={color} />
            ),
          }}
        />
        <Tabs.Screen
          name="worship-management"
          options={{
            title: 'Gestion Culte',
            tabBarIcon: ({ color, size, focused }) => (
              <Ionicons name={focused ? 'calendar' : 'calendar-outline'} size={24} color={color} />
            ),
            href: user && hasPermission('canManageWorship') ? '/worship-management' : null,
          }}
        />
      </Tabs>
    </GestureHandlerRootView>
  );
}
