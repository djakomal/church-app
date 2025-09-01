import { GestureHandlerRootView } from 'react-native-gesture-handler';
import { Dimensions } from 'react-native';
import { Drawer } from 'expo-router/drawer';
import { useColorScheme } from '@/hooks/useColorScheme';
import FontAwesome from '@expo/vector-icons/FontAwesome';

export default function TabLayout() {
  const colorScheme = useColorScheme();
  const windowWidth = Dimensions.get('window').width;

  return (
    <GestureHandlerRootView style={{ flex: 1 }}>
      <Drawer
        screenOptions={{
          drawerStyle: {
            width: windowWidth * 0.75,
            backgroundColor: colorScheme === 'dark' ? '#1c1c1c' : '#fff',
          },
          drawerType: 'slide',
          headerShown: true,
          swipeEnabled: true,
          gestureEnabled: true,
          gestureResponseDistance: 10,
          drawerActiveTintColor: colorScheme === 'dark' ? '#fff' : '#000',
          drawerInactiveTintColor: '#666',
          headerTintColor: colorScheme === 'dark' ? '#fff' : '#000',
          headerStyle: {
            backgroundColor: colorScheme === 'dark' ? '#1c1c1c' : '#fff',
          },
        }}>
        <Drawer.Screen
          name="index"
          options={{
            title: 'Accueil',
            drawerIcon: ({ color, size }) => (
              <FontAwesome name="home" size={size} color={color} />
            ),
          }}
        />
        <Drawer.Screen
          name="profile"
          options={{
            title: 'Profil',
            drawerIcon: ({ color, size }) => (
              <FontAwesome name="user" size={size} color={color} />
            ),
          }}
        />
        <Drawer.Screen
          name="worship"
          options={{
            title: 'Louanges',
            drawerIcon: ({ color, size }) => (
              <FontAwesome name="music" size={size} color={color} />
            ),
          }}
        />
        <Drawer.Screen
          name="settings"
          options={{
            title: 'Paramètres',
            drawerIcon: ({ color, size }) => (
              <FontAwesome name="cog" size={size} color={color} />
            ),
          }}
        />
        <Drawer.Screen
          name="calendar"
          options={{
            title: 'Calendrier',
            drawerIcon: ({ color, size }) => (
              <FontAwesome name="calendar" size={size} color={color} />
            ),
          }}
        />
        <Drawer.Screen
          name="notifications"
          options={{
            title: 'Notifications',
            drawerIcon: ({ color, size }) => (
              <FontAwesome name="bell" size={size} color={color} />
            ),
          }}
        />
      </Drawer>
    </GestureHandlerRootView>
  );
}
