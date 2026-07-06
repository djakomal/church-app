import { NotificationTabIcon } from '@/components/NotificationTabIcon';
import { useAuth } from '@/context/AuthContext';
import { useI18n } from '@/context/I18nContext';
import { useThemeColor } from '@/hooks/useThemeColor';
import { Ionicons } from '@expo/vector-icons';
import { Tabs } from 'expo-router';
import { View } from 'react-native';
import { GestureHandlerRootView } from 'react-native-gesture-handler';
import { useSafeAreaInsets } from 'react-native-safe-area-context';

export default function TabLayout() {
  const insets = useSafeAreaInsets();
  const { user, hasPermission } = useAuth();
  const { t } = useI18n();
  const primaryColor = useThemeColor({}, 'primary');
  const secondaryColor = useThemeColor({}, 'secondary');
  const backgroundColor = useThemeColor({}, 'background');
  const borderColor = useThemeColor({}, 'mediumGray');

  return (
    <GestureHandlerRootView style={{ flex: 1 }}>
      <Tabs
        screenOptions={{
          headerShown: true,
          headerTitleAlign: 'center',
          tabBarShowLabel: true,
          tabBarActiveTintColor: primaryColor,
          tabBarInactiveTintColor: secondaryColor,
          tabBarIconStyle: { marginTop: 6 },
          tabBarLabelStyle: { fontSize: 12, marginBottom: 6, fontWeight: '500' },
          tabBarHideOnKeyboard: true,
          tabBarStyle: {
            position: 'absolute',
            bottom: 0,
            left: 0,
            right: 0,
            height: 65,
            backgroundColor,
            borderTopWidth: 1,
            borderTopColor: borderColor,
            paddingBottom: insets.bottom,
            paddingTop: 10,
            paddingHorizontal: 15,
            shadowColor: '#000',
            shadowOffset: { width: 0, height: -4 },
            shadowOpacity: 0.2,
            shadowRadius: 8,
            elevation: 8,
            borderTopLeftRadius: 20,
            borderTopRightRadius: 20,
          },
        }}
      >
        <Tabs.Screen
          name="home"
          options={{
            title: t('home.title'),
            tabBarIcon: ({ color, size, focused }) => (
              <Ionicons name={focused ? 'home' : 'home-outline'} size={24} color={color} />
            ),
          }}
        />
        <Tabs.Screen name="user-management" options={{ href: null, headerShown: false }} />
        <Tabs.Screen
          name="songs"
          options={{
            title: t('songs.title'),
            tabBarIcon: ({ color, size }) => (
              <Ionicons name="musical-notes" size={24} color={color} />
            ),
          }}
        />
        <Tabs.Screen
          name="notifications"
          options={{
            title: t('notifications.title'),
            tabBarIcon: ({ color, size }) => (
              <NotificationTabIcon color={color} size={24} />
            ),
          }}
        />
        <Tabs.Screen
          name="profile"
          options={{
            title: t('profile.title'),
            tabBarIcon: ({ color, size }) => (
              <Ionicons name="person-circle" size={24} color={color} />
            ),
          }}
        />
        <Tabs.Screen
          name="worship-management"
          options={{
            title: t('worships.title'),
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
