import React from 'react';
import { View, StyleSheet, TouchableOpacity } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { ThemedText } from './ThemedText';
import { useI18n } from '@/context/I18nContext';

interface DarkSidebarProps {
  currentPage: string;
  onPageChange: (page: string) => void;
}

export function DarkSidebar({ currentPage, onPageChange }: DarkSidebarProps) {
  const { t } = useI18n();
  const menuItems = [
    { id: 'accueil', label: t('home.title'), icon: 'home' },
    { id: 'gestion-culte', label: t('worships.title'), icon: 'calendar' },
    { id: 'mes-chants', label: 'Mes Chants', icon: 'musical-notes' },
  ];

  return (
    <View style={styles.sidebar}>
      {/* Menu items */}
      <View style={styles.menuContainer}>
        {menuItems.map((item) => (
          <TouchableOpacity
            key={item.id}
            style={[
              styles.menuItem,
              currentPage === item.id && styles.activeMenuItem
            ]}
            onPress={() => onPageChange(item.id)}
          >
            <Ionicons
              name={item.icon as any}
              size={18}
              color={currentPage === item.id ? '#1e293b' : '#94a3b8'}
            />
            <ThemedText
              style={[
                styles.menuText,
                { color: currentPage === item.id ? '#1e293b' : '#94a3b8' }
              ]}
            >
              {item.label}
            </ThemedText>
          </TouchableOpacity>
        ))}
      </View>

      {/* Settings at bottom */}
      <TouchableOpacity style={styles.settingsItem}>
        <Ionicons name="settings" size={18} color="#94a3b8" />
        <ThemedText style={[styles.menuText, { color: '#94a3b8' }]}>
          Paramètres
        </ThemedText>
      </TouchableOpacity>
    </View>
  );
}

const styles = StyleSheet.create({
  sidebar: {
    width: 200,
    height: '100%',
    backgroundColor: '#1e40af', // Dark blue background
    paddingVertical: 16,
    paddingHorizontal: 12,
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
  activeMenuItem: {
    backgroundColor: '#cbd5e1', // Light gray background for active item
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
