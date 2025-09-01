import React from 'react';
import { View, StyleSheet, TouchableOpacity } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { ThemedText } from './ThemedText';
import { useThemeColor } from '@/hooks/useThemeColor';

interface ChurchHeaderProps {
  currentPage: string;
  onPageChange: (page: string) => void;
}

export function ChurchHeader({ currentPage, onPageChange }: ChurchHeaderProps) {
  const backgroundColor = useThemeColor({}, 'background');
  const primaryColor = useThemeColor({}, 'primary');
  const textColor = useThemeColor({}, 'text');
  const accentColor = useThemeColor({}, 'accent');

  const pages = [
    { id: 'accueil', label: 'Accueil' },
    { id: 'gestion-culte', label: 'Gestion Culte' },
    { id: 'notifications', label: 'Notifications' },
  ];

  return (
    <View style={[styles.header, { backgroundColor }]}>
      {/* Logo */}
      <View style={styles.logoContainer}>
        <View style={[styles.logo, { backgroundColor: primaryColor }]}>
          <Ionicons name="star" size={20} color="white" />
        </View>
      </View>

      {/* Navigation */}
      <View style={styles.navigation}>
        {pages.map((page) => (
          <TouchableOpacity
            key={page.id}
            style={[
              styles.navItem,
              currentPage === page.id && { borderBottomColor: primaryColor, borderBottomWidth: 2 }
            ]}
            onPress={() => onPageChange(page.id)}
          >
            <ThemedText
              style={[
                styles.navText,
                { color: currentPage === page.id ? primaryColor : textColor }
              ]}
            >
              {page.label}
            </ThemedText>
          </TouchableOpacity>
        ))}
      </View>

      {/* User actions */}
      <View style={styles.userActions}>
        <TouchableOpacity style={styles.userIcon}>
          <Ionicons name="person" size={24} color={textColor} />
        </TouchableOpacity>
        <TouchableOpacity style={[styles.logoutButton, { backgroundColor: accentColor }]}>
          <Ionicons name="arrow-forward" size={16} color="white" />
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
    paddingVertical: 12,
    borderBottomWidth: 1,
    borderBottomColor: '#e2e8f0',
  },
  logoContainer: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  logo: {
    width: 32,
    height: 32,
    borderRadius: 6,
    alignItems: 'center',
    justifyContent: 'center',
  },
  navigation: {
    flexDirection: 'row',
    flex: 1,
    justifyContent: 'center',
    marginHorizontal: 20,
  },
  navItem: {
    paddingHorizontal: 16,
    paddingVertical: 8,
    marginHorizontal: 4,
  },
  navText: {
    fontSize: 16,
    fontWeight: '500',
  },
  userActions: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
  },
  userIcon: {
    padding: 4,
  },
  logoutButton: {
    width: 32,
    height: 32,
    borderRadius: 4,
    alignItems: 'center',
    justifyContent: 'center',
  },
});
