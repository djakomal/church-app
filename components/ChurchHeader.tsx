import { useAuth } from '@/context/AuthContext';
import { useThemeColor } from '@/hooks/useThemeColor';
import { Ionicons } from '@expo/vector-icons';
import { router } from 'expo-router';
import React from 'react';
import { Alert, ScrollView, StyleSheet, TouchableOpacity, useWindowDimensions, View } from 'react-native';
import { SafeAreaView, useSafeAreaInsets } from 'react-native-safe-area-context';
import { ThemedText } from './ThemedText';

interface ChurchHeaderProps {
  currentPage: string;
  onPageChange: (page: string) => void;
}

export function ChurchHeader({ currentPage, onPageChange }: ChurchHeaderProps) {
  const insets = useSafeAreaInsets();
  const { width } = useWindowDimensions();
  const isSmallScreen = width < 380;
  const backgroundColor = useThemeColor({}, 'background');
  const primaryColor = useThemeColor({}, 'primary');
  const textColor = useThemeColor({}, 'text');
  const accentColor = useThemeColor({}, 'accent');
  const secondaryColor = useThemeColor({}, 'secondary');

  const { user, hasPermission, logout } = useAuth();

  console.log('🔍 ChurchHeader - User:', user ? user.name : 'null');
  console.log('🔍 ChurchHeader - AccentColor:', accentColor);

  const allPages = [
    { 
      id: 'accueil', 
      label: 'Accueil', 
      icon: 'home',
      permission: null,
      route: '/home'
    },
    { 
      id: 'gestion-culte', 
      label: 'Culte', 
      icon: 'calendar',
      permission: 'canManageWorship',
      route: '/worship-management'
    },
    { 
      id: 'mes-chants', 
      label: 'Chants', 
      icon: 'musical-notes',
      permission: null,
      route: '/songs'
    },
    { 
      id: 'notifications', 
      label: 'Notifications', 
      icon: 'notifications',
      permission: null,
      route: '/notifications'
    },
  ];

  // Filtrer les pages selon les permissions
  const pages = allPages.filter(page => 
    !page.permission || hasPermission(page.permission as any)
  );

  const handlePageClick = (page: typeof allPages[0]) => {
    if (page.permission && !hasPermission(page.permission as any)) {
      Alert.alert(
        'Accès refusé',
        'Vous n\'avez pas les permissions nécessaires pour accéder à cette section.',
        [{ text: 'OK' }]
      );
      return;
    }

    onPageChange(page.id);
    if (page.route) {
      router.push(page.route);
    }
  };

  const handleLogout = () => {
    console.log('🔴 Bouton de déconnexion cliqué dans le header');
    Alert.alert(
      'Déconnexion',
      'Êtes-vous sûr de vouloir vous déconnecter ?',
      [
        { text: 'Annuler', style: 'cancel' },
        { 
          text: 'Déconnecter', 
          style: 'destructive',
          onPress: async () => {
            console.log('🔄 Début de la déconnexion depuis le header...');
            try {
              await logout();
              console.log('✅ Logout terminé, redirection...');
              // Rediriger directement vers la page de connexion
              router.replace('/login');
            } catch (error) {
              console.error('❌ Erreur lors de la déconnexion:', error);
              // En cas d'erreur, forcer quand même la redirection
              router.replace('/login');
            }
          }
        }
      ]
    );
  };

  return (
    <SafeAreaView style={{ backgroundColor }}>
    <View style={[styles.header, { backgroundColor, paddingTop: Math.max(12, insets.top), paddingHorizontal: isSmallScreen ? 12 : 16, paddingVertical: isSmallScreen ? 8 : 12 }]}> 
      {/* Logo et titre */}
      <View style={styles.logoContainer}>
        <View style={[styles.logo, { backgroundColor: primaryColor, width: isSmallScreen ? 32 : 40, height: isSmallScreen ? 32 : 40, borderRadius: isSmallScreen ? 6 : 8 }]}>
          <Ionicons name="musical-notes" size={isSmallScreen ? 16 : 20} color="white" />
        </View>
        <View style={styles.titleContainer}>
          <ThemedText style={[styles.appTitle, { color: textColor, fontSize: isSmallScreen ? 16 : 18 }]}> 
            Église
          </ThemedText>
          {user && (
            <ThemedText style={[styles.userRole, { color: secondaryColor, fontSize: isSmallScreen ? 10 : 12 }]}> 
              {user.role === 'admin' ? 'Admin' : 
               user.role === 'editor' ? 'Éditeur' : 'Musicien'}
            </ThemedText>
          )}
        </View>
      </View>

      {/* Navigation avec icônes - scrollable sur petit écran */}
      <ScrollView horizontal showsHorizontalScrollIndicator={false} style={{ flex: 1, marginHorizontal: 8 }} contentContainerStyle={[styles.navigation, { gap: isSmallScreen ? 6 : 8 }]}>
        {pages.map((page) => (
          <TouchableOpacity
            key={page.id}
            style={[
              styles.navItem,
              { minWidth: isSmallScreen ? 52 : 60, paddingHorizontal: isSmallScreen ? 8 : 12, paddingVertical: isSmallScreen ? 6 : 8 },
              currentPage === page.id && { backgroundColor: primaryColor + '20' }
            ]}
            onPress={() => handlePageClick(page)}
          >
            <Ionicons
              name={page.icon as any}
              size={isSmallScreen ? 18 : 20}
              color={currentPage === page.id ? primaryColor : textColor}
            />
            {!isSmallScreen && (
              <ThemedText
                style={[
                  styles.navLabel,
                  { color: currentPage === page.id ? primaryColor : secondaryColor }
                ]}
              >
                {page.label}
              </ThemedText>
            )}
          </TouchableOpacity>
        ))}
      </ScrollView>

      {/* Actions utilisateur */}
      <View style={styles.userActions}>
        {user && !isSmallScreen && (
          <View style={styles.userInfo}>
            <View style={[styles.userAvatar, { backgroundColor: primaryColor + '20' }]}>
              <Ionicons name="person" size={16} color={primaryColor} />
            </View>
            <View style={styles.userDetails}>
              <ThemedText style={[styles.userName, { color: textColor }]}>
                {user.name.split(' ')[0]}
              </ThemedText>
            </View>
          </View>
        )}
        
        {/* Notifications shortcut */}
        <TouchableOpacity 
          style={[styles.logoutButton, { backgroundColor: primaryColor }]}
          onPress={() => router.push('/notifications')}
          activeOpacity={0.7}
          hitSlop={{ top: 12, bottom: 12, left: 12, right: 12 }}
        >
          <Ionicons name="notifications" size={18} color="white" />
        </TouchableOpacity>

        <TouchableOpacity 
          style={[styles.logoutButton, { backgroundColor: accentColor, width: isSmallScreen ? 36 : 40, height: isSmallScreen ? 36 : 40, borderRadius: isSmallScreen ? 18 : 20 }]}
          onPress={handleLogout}
          activeOpacity={0.7}
          hitSlop={{ top: 12, bottom: 12, left: 12, right: 12 }}
        >
          <Ionicons name="log-out-outline" size={isSmallScreen ? 16 : 18} color="white" />
        </TouchableOpacity>
      </View>
    </View>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: 16,
    paddingVertical: 12,
    borderBottomWidth: 1,
    borderBottomColor: '#e2e8f0',
    backgroundColor: 'white',
  },
  logoContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
  },
  logo: {
    width: 40,
    height: 40,
    borderRadius: 8,
    alignItems: 'center',
    justifyContent: 'center',
  },
  titleContainer: {
    flexDirection: 'column',
  },
  appTitle: {
    fontSize: 18,
    fontWeight: 'bold',
  },
  userRole: {
    fontSize: 12,
    textTransform: 'capitalize',
  },
  navigation: {
    flexDirection: 'row',
    gap: 8,
    alignItems: 'center',
  },
  navItem: {
    alignItems: 'center',
    paddingHorizontal: 12,
    paddingVertical: 8,
    borderRadius: 8,
    minWidth: 60,
  },
  navLabel: {
    fontSize: 10,
    fontWeight: '500',
    marginTop: 2,
    textAlign: 'center',
  },
  userActions: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
  },
  userInfo: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
  },
  userAvatar: {
    width: 28,
    height: 28,
    borderRadius: 14,
    alignItems: 'center',
    justifyContent: 'center',
  },
  userDetails: {
    alignItems: 'flex-end',
  },
  userName: {
    fontSize: 12,
    fontWeight: '600',
  },
  logoutButton: {
    width: 40,
    height: 40,
    borderRadius: 20,
    alignItems: 'center',
    justifyContent: 'center',
    elevation: 2,
    boxShadow: '0px 1px 2.22px rgba(0, 0, 0, 0.22)',
  },
});
