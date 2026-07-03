import { DarkTheme, DefaultTheme, ThemeProvider as NavThemeProvider } from '@react-navigation/native';
import { useFonts } from 'expo-font';
import { Stack } from 'expo-router';
import { StatusBar } from 'expo-status-bar';
import 'react-native-reanimated';

import { AuthProvider } from '@/context/AuthContext';
import { CommentProvider } from '@/context/CommentContext';
import { DatabaseProvider } from '@/context/DatabaseContext';
import { NotificationProvider } from '@/context/NotificationContext';
import { ThemeProvider, useThemeContext } from '@/context/ThemeContext';
import { I18nProvider } from '@/context/I18nContext';

function RootLayoutInner() {
  const { colorScheme } = useThemeContext();

  return (
    <DatabaseProvider>
      <AuthProvider>
        <NotificationProvider>
          <CommentProvider>
            <NavThemeProvider value={colorScheme === 'dark' ? DarkTheme : DefaultTheme}>
              <Stack>
                <Stack.Screen name="index" options={{ headerShown: false }} />
                <Stack.Screen name="login" options={{ headerShown: false }} />
                <Stack.Screen name="register" options={{ headerShown: false }} />
                <Stack.Screen name="home" options={{ headerShown: false }} />
                <Stack.Screen name="songs" options={{ headerShown: false }} />
                <Stack.Screen name="notifications" options={{ headerShown: false }} />
                <Stack.Screen name="(tabs)" options={{ headerShown: false }} />
                <Stack.Screen name="worship-management" options={{ headerShown: false }} />
                <Stack.Screen name="my-songs" options={{ headerShown: false }} />
                <Stack.Screen name="user-management" options={{ headerShown: false }} />
                <Stack.Screen name="+not-found" />
              </Stack>
              <StatusBar style={colorScheme === 'dark' ? 'light' : 'dark'} />
            </NavThemeProvider>
          </CommentProvider>
        </NotificationProvider>
      </AuthProvider>
    </DatabaseProvider>
  );
}

export default function RootLayout() {
  const [loaded] = useFonts({
    SpaceMono: require('../assets/fonts/SpaceMono-Regular.ttf'),
  });

  if (!loaded) {
    return null;
  }

  return (
    <I18nProvider>
      <ThemeProvider>
        <RootLayoutInner />
      </ThemeProvider>
    </I18nProvider>
  );
}
