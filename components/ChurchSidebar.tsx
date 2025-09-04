import { useAuth } from '@/context/AuthContext';
import { useThemeColor } from '@/hooks/useThemeColor';
import { Ionicons } from '@expo/vector-icons';
import { router } from 'expo-router';
import React from 'react';
import { Alert, StyleSheet, TouchableOpacity, View } from 'react-native';
import { SafeAreaView, useSafeAreaInsets } from 'react-native-safe-area-context';
import { ThemedText } from './ThemedText';

interface ChurchSidebarProps {
  currentPage: string;
  onPageChange: (page: string) => void;
}

export function ChurchSidebar({ currentPage, onPageChange }: ChurchSidebarProps) {
  const insets = useSafeAreaInsets();
  const backgroundColor = useThemeColor({}, 'lightGray');
  const activeBackgroundColor = useThemeColor({}, 'mediumGray');
  const textColor = useThemeColor({}, 'text');
  const activeTextColor = useThemeColor({}, 'background');
  const disabledColor = useThemeColor({}, 'secondary');

  const { user, hasPermission, logout } = useAuth();

  const allMenuItems = [
    { 
      id: 'accueil', 
      label: 'Accueil', 
      icon: 'home',
      permission: null, // Toujours accessible
      route: '/home'
    },
    { 
      id: 'gestion-culte', 
      label: 'Gestion Culte', 
      icon: 'calendar',
      permission: 'canManageWorship',
      route: '/worship-management'
    },
    { 
      id: 'mes-chants', 
      label: 'Mes Chants', 
      icon: 'musical-notes',
      permission: null, // Accessible à tous, mais avec interface différente
      route: '/songs'
    },
  ];

  // Filtrer les éléments selon les permissions
  const menuItems = allMenuItems.filter(item => 
    !item.permission || hasPermission(item.permission as any)
  );

  const handleMenuClick = (item: typeof allMenuItems[0]) => {
    if (item.permission && !hasPermission(item.permission as any)) {
      Alert.alert(
        'Accès refusé',
        'Vous n\'avez pas les permissions nécessaires pour accéder à cette section.',
        [{ text: 'OK' }]
      );
      return;
    }

    onPageChange(item.id);
    if (item.route) {
      router.push(item.route);
    }
  };

  const handleLogout = async () => {
    try {
      await logout();
      router.replace('/login');
    } catch (error) {
      console.error('Erreur lors de la déconnexion:', error);
      router.replace('/login');
    }
  };

  return (
    <SafeAreaView style={{ flex: 1 }}>
    <View style={[styles.sidebar, { backgroundColor, paddingTop: Math.max(8, insets.top) }]}> 
      {/* User info */}
      {user && (
        <View style={styles.userInfo}>
          <View style={styles.userAvatar}>
            <Ionicons name="person" size={16} color={textColor} />
          </View>
          <View style={styles.userDetails}>
            <ThemedText style={[styles.userName, { color: textColor }]}>
              {user.name}
            </ThemedText>
            <ThemedText style={[styles.userRole, { color: disabledColor }]}>
              {user.role === 'admin' ? 'Administrateur' : 
               user.role === 'editor' ? 'Éditeur' : 'Musicien'}
            </ThemedText>
          </View>
        </View>
      )}

      {/* Menu items */}
      <View style={styles.menuContainer}>
        {menuItems.map((item) => (
          <TouchableOpacity
            key={item.id}
            style={[
              styles.menuItem,
              currentPage === item.id && { backgroundColor: activeBackgroundColor }
            ]}
            onPress={() => handleMenuClick(item)}
          >
            <Ionicons
              name={item.icon as any}
              size={18}
              color={currentPage === item.id ? activeTextColor : textColor}
            />
            <ThemedText
              style={[
                styles.menuText,
                { color: currentPage === item.id ? activeTextColor : textColor }
              ]}
            >
              {item.label}
            </ThemedText>
          </TouchableOpacity>
        ))}
      </View>

      {/* Logout button */}
      <TouchableOpacity style={styles.settingsItem} onPress={handleLogout} activeOpacity={0.7} hitSlop={{ top: 12, bottom: 12, left: 12, right: 12 }}>
        <Ionicons name="log-out" size={18} color={textColor} />
        <ThemedText style={[styles.menuText, { color: textColor }]}>
          Déconnexion
        </ThemedText>
      </TouchableOpacity>
    </View>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  sidebar: {
    width: 200,
    height: '100%',
    paddingVertical: 16,
    paddingHorizontal: 12,
  },
  userInfo: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: 12,
    paddingHorizontal: 8,
    marginBottom: 16,
    borderBottomWidth: 1,
    borderBottomColor: 'rgba(0,0,0,0.1)',
    gap: 8,
  },
  userAvatar: {
    width: 32,
    height: 32,
    borderRadius: 16,
    backgroundColor: 'rgba(0,0,0,0.1)',
    alignItems: 'center',
    justifyContent: 'center',
  },
  userDetails: {
    flex: 1,
  },
  userName: {
    fontSize: 12,
    fontWeight: '600',
    marginBottom: 2,
  },
  userRole: {
    fontSize: 10,
    textTransform: 'capitalize',
  },
  menuContainer: {
    flex: 1,
    gap: 4,
  },
  menuItem: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: 10,
    paddingHorizontal: 12,
    borderRadius: 6,
    gap: 10,
  },
  menuText: {
    fontSize: 13,
    fontWeight: '500',
  },
  settingsItem: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: 10,
    paddingHorizontal: 12,
    borderRadius: 6,
    gap: 10,
    marginTop: 'auto',
  },
});
