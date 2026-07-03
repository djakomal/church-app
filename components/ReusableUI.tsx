import React from 'react';
import { View, StyleSheet, TextInput, TouchableOpacity, Text, TextInputProps, ViewStyle } from 'react-native';
import { useThemeColor } from '@/hooks/useThemeColor';
import { ThemedText } from '@/components/ThemedText';
import { Ionicons } from '@expo/vector-icons';
import { useAuth } from '@/context/AuthContext';

interface FormInputProps extends TextInputProps {
  label: string;
  value: string;
  onChangeText: (text: string) => void;
  placeholder?: string;
  error?: string;
  icon?: keyof typeof Ionicons.glyphMap;
  containerStyle?: ViewStyle;
}

export function FormInput({ 
  label, 
  value, 
  onChangeText, 
  placeholder, 
  error, 
  icon, 
  containerStyle,
  ...props 
}: FormInputProps) {
  const textColor = useThemeColor({}, 'text');
  const borderColor = useThemeColor({}, 'mediumGray');
  const placeholderColor = useThemeColor({}, 'secondary');
  const errorColor = useThemeColor({}, 'error');

  return (
    <View style={[styles.inputGroup, containerStyle]}>
      <ThemedText style={[styles.label, { color: textColor }]}>
        {label}
      </ThemedText>
      <View style={[styles.inputContainer, { 
        borderColor: error ? errorColor : borderColor,
        backgroundColor: useThemeColor({}, 'cardBackground')
      }]}>
        {icon && (
          <Ionicons name={icon} size={20} color={placeholderColor} style={styles.inputIcon} />
        )}
        <TextInput
          style={[styles.input, { color: textColor }]}
          value={value}
          onChangeText={onChangeText}
          placeholder={placeholder}
          placeholderTextColor={placeholderColor}
          {...props}
        />
      </View>
      {error && (
        <ThemedText style={[styles.errorText, { color: errorColor }]}>
          {error}
        </ThemedText>
      )}
    </View>
  );
}

interface PermissionGateProps {
  permission: string;
  fallback?: React.ReactNode;
  children: React.ReactNode;
}

export function PermissionGate({ permission, fallback, children }: PermissionGateProps) {
  const { hasPermission } = useAuth() as { hasPermission: (perm: string) => boolean };
  
  if (!hasPermission(permission)) {
    return fallback || null;
  }
  
  return children;
}

interface SectionHeaderProps {
  title: string;
  icon?: keyof typeof Ionicons.glyphMap;
  iconColor?: string;
  action?: React.ReactNode;
}

export function SectionHeader({ title, icon, iconColor, action }: SectionHeaderProps) {
  const primaryColor = useThemeColor({}, 'primary');
  const textColor = useThemeColor({}, 'text');

  return (
    <View style={styles.sectionHeader}>
      <View style={styles.sectionHeaderContent}>
        {icon && (
          <Ionicons 
            name={icon} 
            size={24} 
            color={iconColor || primaryColor} 
            style={styles.sectionIcon} 
          />
        )}
        <ThemedText style={[styles.sectionTitle, { color: textColor }]}>
          {title}
        </ThemedText>
      </View>
      {action && <View style={styles.sectionAction}>{action}</View>}
    </View>
  );
}

interface EmptyStateProps {
  icon?: keyof typeof Ionicons.glyphMap;
  title: string;
  message: string;
  action?: React.ReactNode;
}

export function EmptyState({ icon, title, message, action }: EmptyStateProps) {
  const secondaryColor = useThemeColor({}, 'secondary');
  const borderColor = useThemeColor({}, 'mediumGray');
  const backgroundColor = useThemeColor({}, 'background');

  return (
    <View style={[styles.emptyCard, { backgroundColor, borderColor }]}>
      {icon && (
        <Ionicons name={icon} size={48} color={secondaryColor} />
      )}
      <ThemedText style={[styles.emptyTitle, { color: secondaryColor }]}>
        {title}
      </ThemedText>
      <ThemedText style={[styles.emptyMessage, { color: secondaryColor }]}>
        {message}
      </ThemedText>
      {action && <View style={styles.emptyAction}>{action}</View>}
    </View>
  );
}

interface StatusBadgeProps {
  status: 'success' | 'warning' | 'error' | 'info';
  text: string;
}

export function StatusBadge({ status, text }: StatusBadgeProps) {
  const getColors = () => {
    switch (status) {
      case 'success': return {
        backgroundColor: useThemeColor({}, 'success') + '20',
        textColor: useThemeColor({}, 'success')
      };
      case 'warning': return {
        backgroundColor: useThemeColor({}, 'warning') + '20',
        textColor: useThemeColor({}, 'warning')
      };
      case 'error': return {
        backgroundColor: useThemeColor({}, 'error') + '20',
        textColor: useThemeColor({}, 'error')
      };
      case 'info': return {
        backgroundColor: useThemeColor({}, 'primary') + '20',
        textColor: useThemeColor({}, 'primary')
      };
    }
  };

  const colors = getColors();

  return (
    <View style={[styles.statusBadge, { backgroundColor: colors.backgroundColor }]}>
      <ThemedText style={[styles.statusText, { color: colors.textColor }]}>
        {text}
      </ThemedText>
    </View>
  );
}

// Styles
const styles = StyleSheet.create({
  inputGroup: {
    marginBottom: 20,
  },
  label: {
    fontSize: 16,
    fontWeight: '600',
    marginBottom: 8,
  },
  inputContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    borderWidth: 1,
    borderRadius: 12,
    paddingHorizontal: 16,
    paddingVertical: 12,
    gap: 12,
  },
  inputIcon: {
    marginRight: 8,
  },
  input: {
    flex: 1,
    fontSize: 16,
    minHeight: 24,
  },
  errorText: {
    fontSize: 12,
    marginTop: 4,
    fontStyle: 'italic',
  },
  sectionHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 16,
  },
  sectionHeaderContent: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
  },
  sectionIcon: {
    marginRight: 4,
  },
  sectionTitle: {
    fontSize: 20,
    fontWeight: 'bold',
  },
  sectionAction: {
    marginLeft: 'auto',
  },
  emptyCard: {
    padding: 32,
    borderRadius: 12,
    borderWidth: 1,
    borderStyle: 'dashed',
    alignItems: 'center',
    gap: 12,
  },
  emptyTitle: {
    fontSize: 18,
    fontWeight: '600',
    textAlign: 'center',
  },
  emptyMessage: {
    fontSize: 14,
    textAlign: 'center',
    lineHeight: 20,
  },
  emptyAction: {
    marginTop: 8,
  },
  statusBadge: {
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 20,
    alignSelf: 'flex-start',
  },
  statusText: {
    fontSize: 12,
    fontWeight: '600',
  },
});
