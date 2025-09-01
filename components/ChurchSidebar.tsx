import React from 'react';
import { View, StyleSheet, TouchableOpacity } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { ThemedText } from './ThemedText';
import { useThemeColor } from '@/hooks/useThemeColor';

interface ChurchSidebarProps {
  currentPage: string;
  onPageChange: (page: string) => void;
}

export function ChurchSidebar({ currentPage, onPageChange }: ChurchSidebarProps) {
  const backgroundColor = useThemeColor({}, 'lightGray');
  const activeBackgroundColor = useThemeColor({}, 'mediumGray');
  const textColor = useThemeColor({}, 'text');
  const activeTextColor = useThemeColor({}, 'background');

  const menuItems = [
    { id: 'accueil', label: 'Accueil', icon: 'home' },
    { id: 'gestion-culte', label: 'Gestion Culte', icon: 'calendar' },
    { id: 'mes-chants', label: 'Mes Chants', icon: 'musical-notes' },
  ];

  return (
    <View style={[styles.sidebar, { backgroundColor }]}>
      {/* Menu items */}
      <View style={styles.menuContainer}>
        {menuItems.map((item) => (
          <TouchableOpacity
            key={item.id}
            style={[
              styles.menuItem,
              currentPage === item.id && { backgroundColor: activeBackgroundColor }
            ]}
            onPress={() => onPageChange(item.id)}
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

      {/* Settings at bottom */}
      <TouchableOpacity style={styles.settingsItem}>
        <Ionicons name="settings" size={18} color={textColor} />
        <ThemedText style={[styles.menuText, { color: textColor }]}>
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
