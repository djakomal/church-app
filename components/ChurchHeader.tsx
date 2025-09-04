import React from 'react';
import { View, StyleSheet, TouchableOpacity, Alert } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { ThemedText } from './ThemedText';
import { useThemeColor } from '@/hooks/useThemeColor';
import { useAuth } from '@/context/AuthContext';
import { router } from 'expo-router';

interface ChurchHeaderProps {
  currentPage: string;
  onPageChange: (page: string) => void;
}

export function ChurchHeader({ currentPage, onPageChange }: ChurchHeaderProps) {
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
              // Forcer la redirection vers la page de connexion
              router.replace('/');
            } catch (error) {
              console.error('❌ Erreur lors de la déconnexion:', error);
              // En cas d'erreur, forcer quand même la redirection
              router.replace('/');
            }
          }
        }
      ]
    );
  };

  return (
    <View style={[styles.header, { backgroundColor }]}>
      {/* Logo et titre */}
      <View style={styles.logoContainer}>
        <View style={[styles.logo, { backgroundColor: primaryColor }]}>
          <Ionicons name="musical-notes" size={20} color="white" />
        </View>
        <View style={styles.titleContainer}>
          <ThemedText style={[styles.appTitle, { color: textColor }]}>
            Église
          </ThemedText>
          {user && (
            <ThemedText style={[styles.userRole, { color: secondaryColor }]}>
              {user.role === 'admin' ? 'Admin' : 
               user.role === 'editor' ? 'Éditeur' : 'Musicien'}
            </ThemedText>
          )}
        </View>
      </View>

      {/* Navigation avec icônes */}
      <View style={styles.navigation}>
        {pages.map((page) => (
          <TouchableOpacity
            key={page.id}
            style={[
              styles.navItem,
              currentPage === page.id && { backgroundColor: primaryColor + '20' }
            ]}
            onPress={() => handlePageClick(page)}
          >
            <Ionicons
              name={page.icon as any}
              size={20}
              color={currentPage === page.id ? primaryColor : textColor}
            />
            <ThemedText
              style={[
                styles.navLabel,
                { color: currentPage === page.id ? primaryColor : secondaryColor }
              ]}
            >
              {page.label}
            </ThemedText>
          </TouchableOpacity>
        ))}
      </View>

      {/* Actions utilisateur */}
      <View style={styles.userActions}>
        {user && (
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
        
        <TouchableOpacity 
          style={[styles.logoutButton, { backgroundColor: accentColor }]}
          onPress={handleLogout}
          activeOpacity={0.7}
        >
          <Ionicons name="log-out-outline" size={18} color="white" />
        </TouchableOpacity>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: 16,
    paddingVertical: 16,
    paddingTop: 50, // Pour le status bar
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
