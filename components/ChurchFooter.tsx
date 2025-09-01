import React from 'react';
import { View, StyleSheet, TouchableOpacity } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { ThemedText } from './ThemedText';
import { useThemeColor } from '@/hooks/useThemeColor';

export function ChurchFooter() {
  const backgroundColor = useThemeColor({}, 'lightGray');
  const textColor = useThemeColor({}, 'text');
  const iconColor = useThemeColor({}, 'secondary');

  const socialIcons = [
    { name: 'logo-facebook', platform: 'Facebook' },
    { name: 'logo-twitter', platform: 'Twitter' },
    { name: 'logo-linkedin', platform: 'LinkedIn' },
    { name: 'logo-github', platform: 'GitHub' },
  ];

  const footerLinks = ['Ressources', 'Légal', 'Contact'];

  return (
    <View style={[styles.footer, { backgroundColor }]}>
      <View style={styles.footerContent}>
        {/* Left section */}
        <View style={styles.leftSection}>
          <ThemedText style={[styles.madeWith, { color: textColor }]}>
            Made with
          </ThemedText>
          <View style={[styles.vLogo, { backgroundColor: '#8b5cf6' }]}>
            <ThemedText style={styles.vLogoText}>V</ThemedText>
          </View>
        </View>

        {/* Center section */}
        <View style={styles.centerSection}>
          {footerLinks.map((link) => (
            <TouchableOpacity key={link} style={styles.footerLink}>
              <ThemedText style={[styles.linkText, { color: textColor }]}>
                {link}
              </ThemedText>
            </TouchableOpacity>
          ))}
        </View>

        {/* Right section */}
        <View style={styles.rightSection}>
          {socialIcons.map((social) => (
            <TouchableOpacity key={social.platform} style={styles.socialIcon}>
              <Ionicons name={social.name as any} size={20} color={iconColor} />
            </TouchableOpacity>
          ))}
        </View>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  footer: {
    paddingVertical: 20,
    paddingHorizontal: 24,
    borderTopWidth: 1,
    borderTopColor: '#e2e8f0',
  },
  footerContent: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
  },
  leftSection: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
  },
  madeWith: {
    fontSize: 14,
  },
  vLogo: {
    width: 24,
    height: 24,
    borderRadius: 4,
    alignItems: 'center',
    justifyContent: 'center',
  },
  vLogoText: {
    color: 'white',
    fontSize: 16,
    fontWeight: 'bold',
  },
  centerSection: {
    flexDirection: 'row',
    gap: 24,
  },
  footerLink: {
    paddingVertical: 4,
  },
  linkText: {
    fontSize: 14,
    fontWeight: '500',
  },
  rightSection: {
    flexDirection: 'row',
    gap: 16,
  },
  socialIcon: {
    padding: 4,
  },
});
