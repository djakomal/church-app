import { NotificationTabIcon } from '@/components/NotificationTabIcon';
import { useAuth } from '@/context/AuthContext';
import { useI18n } from '@/context/I18nContext';
import { useThemeColor } from '@/hooks/useThemeColor';
import { Ionicons } from '@expo/vector-icons';
import { Tabs } from 'expo-router';
import { Platform, StyleSheet, View } from 'react-native';
import { GestureHandlerRootView } from 'react-native-gesture-handler';
import { useSafeAreaInsets } from 'react-native-safe-area-context';

export default function TabLayout() {
  const insets = useSafeAreaInsets();
  const { user, hasPermission } = useAuth();
  const { t } = useI18n();
  const primaryColor = useThemeColor({}, 'primary');
  const secondaryColor = useThemeColor({}, 'secondary');
  const backgroundColor = useThemeColor({}, 'background');
  const cardColor = useThemeColor({}, 'cardBackground');

  const isWeb = Platform.OS === 'web';

  return (
    <GestureHandlerRootView style={{ flex: 1 }}>
      <Tabs
        screenOptions={{
          headerShown: true,
          headerTitleAlign: 'center',
          headerStyle: { backgroundColor },
          headerShadowVisible: false,
          tabBarShowLabel: true,
          tabBarActiveTintColor: primaryColor,
          tabBarInactiveTintColor: secondaryColor,
          tabBarLabelStyle: { fontSize: 11, fontWeight: '600', marginTop: 2 },
          tabBarHideOnKeyboard: true,
          tabBarStyle: {
            backgroundColor: cardColor,
            borderTopWidth: 0,
            paddingBottom: isWeb ? 8 : Math.max(insets.bottom - 4, 4),
            paddingTop: 8,
            paddingHorizontal: 8,
            height: isWeb ? 60 : 60 + Math.max(insets.bottom - 4, 0),
            ...(isWeb
              ? {}
              : {
                  position: 'absolute',
                  bottom: 16,
                  left: 16,
                  right: 16,
                  borderRadius: 24,
                  boxShadow: '0px 4px 12px rgba(0,0,0,0.1)',
                  elevation: 8,
                }),
          },
        }}
      >
        <Tabs.Screen
          name="home"
          options={{
            title: t('home.title'),
            headerShown: false,
            tabBarIcon: ({ color, focused }) => (
              <Ionicons name={focused ? 'home' : 'home-outline'} size={22} color={color} />
            ),
          }}
        />
        <Tabs.Screen name="user-management" options={{ href: null, headerShown: false }} />
        <Tabs.Screen
          name="songs"
          options={{
            title: t('songs.title'),
            headerShown: false,
            tabBarIcon: ({ color, focused }) => (
              <Ionicons name={focused ? 'musical-notes' : 'musical-notes-outline'} size={22} color={color} />
            ),
          }}
        />
        <Tabs.Screen
          name="worship-management"
          options={{
            title: t('worships.title'),
            headerShown: false,
            tabBarIcon: ({ color, focused }) => (
              <Ionicons name={focused ? 'calendar' : 'calendar-outline'} size={22} color={color} />
            ),
            href: user && hasPermission('canManageWorship') ? '/worship-management' : null,
          }}
        />
        <Tabs.Screen
          name="notifications"
          options={{
            title: t('notifications.title'),
            headerShown: false,
            tabBarIcon: ({ color }) => (
              <NotificationTabIcon color={color} size={22} />
            ),
          }}
        />
        <Tabs.Screen
          name="profile"
          options={{
            title: t('profile.title'),
            headerShown: false,
            tabBarIcon: ({ color, focused }) => (
              <Ionicons name={focused ? 'person' : 'person-outline'} size={22} color={color} />
            ),
          }}
        />
      </Tabs>
    </GestureHandlerRootView>
  );
}
