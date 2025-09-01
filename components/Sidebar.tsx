import React, { useState } from 'react';
import { View, TouchableOpacity, StyleSheet, Animated } from 'react-native';
import { useColorScheme } from '@/hooks/useColorScheme';
import FontAwesome from '@expo/vector-icons/FontAwesome';

interface SidebarProps {
  children: React.ReactNode;
}

export const Sidebar = ({ children }: SidebarProps) => {
  const [isCollapsed, setIsCollapsed] = useState(false);
  const colorScheme = useColorScheme();
  const [width] = useState(new Animated.Value(280)); // largeur initiale

  const toggleSidebar = () => {
    Animated.timing(width, {
      toValue: isCollapsed ? 180 : 70,
      duration: 300,
      useNativeDriver: false,
    }).start();
    setIsCollapsed(!isCollapsed);
  };

  return (
    <Animated.View
      style={[
        styles.container,
        {
          width,
          backgroundColor: colorScheme === 'dark' ? '#1c1c1c' : '#fff',
        },
      ]}
    >
      <TouchableOpacity
        style={styles.toggleButton}
        onPress={toggleSidebar}
      >
        <FontAwesome
          name={isCollapsed ? 'angle-right' : 'angle-left'}
          size={24}
          color={colorScheme === 'dark' ? '#fff' : '#000'}
        />
      </TouchableOpacity>
      <View style={styles.content}>
        {children}
      </View>
    </Animated.View>
  );
};

const styles = StyleSheet.create({
  container: {
    height: '100%',
    borderRightWidth: 1,
    borderRightColor: '#e0e0e0',
  },
  toggleButton: {
    padding: 15,
    alignItems: 'center',
    borderBottomWidth: 1,
    borderBottomColor: '#e0e0e0',
  },
  content: {
    flex: 1,
  },
});