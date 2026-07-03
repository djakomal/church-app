import React, { useState, useEffect, useCallback } from 'react';
import { View, Text, TouchableOpacity, StyleSheet, FlatList, TextInput, Alert, Switch } from 'react-native';
import { useAuth } from '@/context/AuthContext';
import { useUserManagement } from '@/hooks/useUserManagement';
import { useThemeContext } from '@/context/ThemeContext';
import { Ionicons } from '@expo/vector-icons';
import { useT } from '@/context/I18nContext';

interface UserManagementScreenProps {
  onClose?: () => void;
}

export function UserManagementScreen({ onClose }: UserManagementScreenProps) {
  const { user, updateUserPermissions } = useAuth();
  const userManagement = useUserManagement();
  const { isDark, setThemeMode } = useThemeContext();
  const t = useT();

  const styles = StyleSheet.create({
    container: {
      flex: 1,
      backgroundColor: isDark ? '#0a0a0a' : '#f5f5f5',
      padding: 20,
    },
    header: {
      flexDirection: 'row',
      justifyContent: 'space-between',
      alignItems: 'center',
      marginBottom: 20,
    },
    title: {
      fontSize: 24,
      fontWeight: 'bold',
      color: isDark ? '#ffffff' : '#000000',
    },
    closeButton: {
      padding: 8,
      backgroundColor: '#e74c3c',
      borderRadius: 8,
    },
    statsContainer: {
      flexDirection: 'row',
      justifyContent: 'space-between',
      marginBottom: 20,
    },
    statCard: {
      flex: 1,
      backgroundColor: isDark ? '#1a1a1a' : '#ffffff',
      padding: 15,
      borderRadius: 10,
      marginHorizontal: 5,
      elevation: 3,
    },
    statTitle: {
      fontSize: 14,
      color: isDark ? '#999999' : '#666666',
      marginBottom: 5,
    },
    statValue: {
      fontSize: 24,
      fontWeight: 'bold',
      color: isDark ? '#ffffff' : '#000000',
    },
    searchContainer: {
      flexDirection: 'row',
      alignItems: 'center',
      backgroundColor: isDark ? '#2a2a2a' : '#ffffff',
      borderRadius: 10,
      padding: 12,
      marginBottom: 20,
      elevation: 2,
    },
    searchInput: {
      flex: 1,
      marginLeft: 10,
      fontSize: 16,
      color: isDark ? '#ffffff' : '#000000',
    },
    filtersContainer: {
      flexDirection: 'row',
      justifyContent: 'space-between',
      marginBottom: 15,
    },
    filterButton: {
      flex: 1,
      padding: 10,
      backgroundColor: isDark ? '#2a2a2a' : '#f0f0f0',
      borderRadius: 8,
      marginHorizontal: 5,
      alignItems: 'center',
    },
    activeFilter: {
      backgroundColor: '#3498db',
    },
    filterText: {
      fontSize: 14,
      fontWeight: '600',
      color: isDark ? '#ffffff' : '#000000',
    },
    activeFilterText: {
      color: '#ffffff',
    },
    usersList: {
      flex: 1,
    },
    userCard: {
      backgroundColor: isDark ? '#1a1a1a' : '#ffffff',
      borderRadius: 10,
      padding: 15,
      marginBottom: 10,
      elevation: 2,
      borderWidth: 2,
      borderColor: 'transparent',
    },
    userCardSelected: {
      borderColor: '#3498db',
      backgroundColor: isDark ? 'rgba(52, 152, 219, 0.1)' : 'rgba(52, 152, 219, 0.05)',
    },
    userHeader: {
      flexDirection: 'row',
      justifyContent: 'space-between',
      alignItems: 'center',
      marginBottom: 10,
    },
    userInfo: {
      flex: 1,
    },
    userName: {
      fontSize: 18,
      fontWeight: 'bold',
      color: isDark ? '#ffffff' : '#000000',
    },
    userEmail: {
      fontSize: 14,
      color: isDark ? '#cccccc' : '#666666',
      marginTop: 2,
    },
    userRoleBadge: {
      paddingHorizontal: 10,
      paddingVertical: 5,
      borderRadius: 15,
      marginTop: 5,
      alignSelf: 'flex-start',
    },
    roleText: {
      fontSize: 12,
      fontWeight: '600',
      color: '#ffffff',
    },
    statusBadge: {
      paddingHorizontal: 8,
      paddingVertical: 3,
      borderRadius: 8,
      alignSelf: 'flex-start',
      marginTop: 5,
    },
    activeStatus: {
      backgroundColor: '#27ae60',
    },
    inactiveStatus: {
      backgroundColor: '#95a5a6',
    },
    pendingStatus: {
      backgroundColor: '#f39c12',
    },
    suspendedStatus: {
      backgroundColor: '#e74c3c',
    },
    statusText: {
      fontSize: 11,
      fontWeight: '600',
      color: '#ffffff',
    },
    permissionsContainer: {
      marginTop: 10,
      padding: 10,
      backgroundColor: isDark ? '#2a2a2a' : '#f9f9f9',
      borderRadius: 8,
    },
    permissionsTitle: {
      fontSize: 14,
      fontWeight: '600',
      color: isDark ? '#ffffff' : '#000000',
      marginBottom: 8,
    },
    permissionTags: {
      flexDirection: 'row',
      flexWrap: 'wrap',
      gap: 6,
    },
    permissionTag: {
      paddingHorizontal: 8,
      paddingVertical: 3,
      backgroundColor: '#ecf0f1',
      borderRadius: 6,
    },
    permissionText: {
      fontSize: 11,
      color: '#2c3e50',
      fontWeight: '500',
    },
    actionButtons: {
      flexDirection: 'row',
      justifyContent: 'flex-end',
      marginTop: 10,
      gap: 10,
    },
    editButton: {
      flexDirection: 'row',
      alignItems: 'center',
      paddingHorizontal: 12,
      paddingVertical: 8,
      backgroundColor: '#3498db',
      borderRadius: 8,
    },
    deleteButton: {
      flexDirection: 'row',
      alignItems: 'center',
      paddingHorizontal: 12,
      paddingVertical: 8,
      backgroundColor: '#e74c3c',
      borderRadius: 8,
    },
    worshipButton: {
      flexDirection: 'row',
      alignItems: 'center',
      paddingHorizontal: 12,
      paddingVertical: 8,
      backgroundColor: '#2ecc71',
      borderRadius: 8,
    },
    worshipButtonRemove: {
      backgroundColor: '#e67e22',
    },
    buttonText: {
      color: '#ffffff',
      fontWeight: '600',
      marginLeft: 5,
    },
    loadingContainer: {
      flex: 1,
      justifyContent: 'center',
      alignItems: 'center',
    },
    loadingText: {
      marginTop: 10,
      color: isDark ? '#ffffff' : '#000000',
    },
    errorContainer: {
      flex: 1,
      justifyContent: 'center',
      alignItems: 'center',
      padding: 20,
    },
    errorText: {
      color: '#e74c3c',
      fontSize: 16,
      textAlign: 'center',
      marginBottom: 10,
    },
    retryButton: {
      backgroundColor: '#3498db',
      paddingHorizontal: 20,
      paddingVertical: 10,
      borderRadius: 8,
    },
    retryButtonText: {
      color: '#ffffff',
      fontWeight: '600',
    },
    themeToggle: {
      padding: 8,
      backgroundColor: isDark ? '#f39c12' : '#2c3e50',
      borderRadius: 8,
      marginRight: 8,
    },
  });

  const getPerm = (item: any, perm: string): boolean => {
    if (Array.isArray(item.permissions)) return item.permissions.some((p: any) => p === perm || (typeof p === 'object' && p.name === perm));
    return item.permissions?.[perm] ?? false;
  };

  const isAdmin = user?.role === 'admin';

  const handleToggleWorship = async (targetUser: any) => {
    const current = getPerm(targetUser, 'canManageWorship');
    try {
      await updateUserPermissions(targetUser.id, { canManageWorship: !current });
      Alert.alert(t('success'), current ? t('um.worshipRemoved') : t('um.worshipGranted'));
      userManagement.refreshData();
    } catch (error) {
      Alert.alert(t('error'), t('um.worshipToggleError'));
    }
  };

  useEffect(() => {
    if (isAdmin) {
      userManagement.refreshData();
    }
  }, [isAdmin, userManagement.refreshData]);

  const getRoleColor = (role: string) => {
    switch (role.toLowerCase()) {
      case 'admin':
      case 'administrateur':
        return '#e74c3c';
      case 'editor':
      case 'éditeur':
        return '#3498db';
      case 'leader':
      case 'responsable':
        return '#9b59b6';
      case 'viewer':
      case 'visualiseur':
        return '#95a5a6';
      case 'guest':
      case 'invité':
        return '#f39c12';
      default:
        return '#7f8c8d';
    }
  };

  const getRoleDisplayName = (role: string) => {
    switch (role.toLowerCase()) {
      case 'admin':
      case 'administrateur':
        return t('auth.admin');
      case 'editor':
      case 'éditeur':
        return t('auth.editor');
      case 'leader':
      case 'responsable':
        return t('um.role.leader');
      case 'viewer':
      case 'visualiseur':
        return t('auth.viewer');
      case 'guest':
      case 'invité':
        return t('um.role.guest');
      default:
        return role;
    }
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'active':
        return styles.activeStatus;
      case 'inactive':
        return styles.inactiveStatus;
      case 'pending':
        return styles.pendingStatus;
      case 'suspended':
        return styles.suspendedStatus;
      default:
        return styles.inactiveStatus;
    }
  };

  const getStatusDisplayName = (status: string) => {
    switch (status) {
      case 'active':
        return t('um.status.active');
      case 'inactive':
        return t('um.status.inactive');
      case 'pending':
        return t('um.status.pending');
      case 'suspended':
        return t('um.status.suspended');
      default:
        return status;
    }
  };

  const handleUserPress = (user: any) => {
    userManagement.setSelectedUser(user);
    userManagement.openUserModal();
  };

  const handleEditUser = (user: any) => {
    userManagement.setSelectedUser(user);
    userManagement.openUserModal();
  };

  const handleDeleteUser = async (user: any) => {
    if (user.email === 'admin@church.com') {
      Alert.alert(t('um.delete'), t('um.cantDeleteAdmin'));
      return;
    }

    Alert.alert(
      t('um.confirmDelete'),
      t('um.confirmDeleteMsg', { name: user.name, email: user.email }),
      [
        { text: t('cancel'), style: 'cancel' },
        {
          text: t('delete'),
          style: 'destructive',
          onPress: async () => {
            try {
              await userManagement.deleteUser(user.id);
              Alert.alert(t('success'), t('um.deleted'));
            } catch (error) {
              Alert.alert(t('error'), t('um.deleteError'));
            }
          }
        },
      ]
    );
  };

  const handleRefresh = async () => {
    try {
      await userManagement.refreshData();
      Alert.alert(t('success'), t('um.refreshed'));
    } catch (error) {
      Alert.alert(t('error'), t('um.refreshError'));
    }
  };

  const handleThemeToggle = () => {
    setThemeMode(isDark ? 'light' : 'dark');
  };

  if (!isAdmin) {
    return (
      <View style={styles.container}>
        <View style={styles.errorContainer}>
          <Ionicons name="lock-closed" size={48} color="#e74c3c" />
          <Text style={styles.errorText}>{t('um.accessDenied')}</Text>
          <Text style={{ color: isDark ? '#cccccc' : '#666666', textAlign: 'center', marginTop: 10 }}>
            {t('um.accessDeniedMsg')}
          </Text>
        </View>
      </View>
    );
  }

  if (userManagement.isLoading && userManagement.users.length === 0) {
    return (
      <View style={styles.loadingContainer}>
        <Ionicons name="people" size={48} color={isDark ? '#3498db' : '#2c3e50'} />
        <Text style={styles.loadingText}>{t('um.loading')}</Text>
      </View>
    );
  }

  if (userManagement.error && !userManagement.isLoading) {
    return (
      <View style={styles.errorContainer}>
        <Ionicons name="alert-circle" size={48} color="#e74c3c" />
        <Text style={styles.errorText}>{t('um.loadError')}</Text>
        <Text style={{ color: isDark ? '#cccccc' : '#666666', textAlign: 'center', marginBottom: 20 }}>
          {userManagement.error}
        </Text>
        <TouchableOpacity style={styles.retryButton} onPress={handleRefresh}>
          <Text style={styles.retryButtonText}>{t('retry')}</Text>
        </TouchableOpacity>
      </View>
    );
  }

  const filteredUsers = userManagement.filteredUsers;

  return (
    <View style={styles.container}>
      <View style={styles.header}>
        <Text style={styles.title}>{t('um.title')}</Text>
        <View style={{ flexDirection: 'row', alignItems: 'center' }}>
          <TouchableOpacity style={styles.themeToggle} onPress={handleThemeToggle}>
            <Ionicons name={isDark ? 'sunny' : 'moon'} size={20} color="#ffffff" />
          </TouchableOpacity>
          {onClose && (
            <TouchableOpacity style={styles.closeButton} onPress={onClose}>
              <Text style={{ color: '#ffffff', fontWeight: 'bold' }}>✕</Text>
            </TouchableOpacity>
          )}
        </View>
      </View>

      <View style={styles.statsContainer}>
        <View style={styles.statCard}>
          <Text style={styles.statTitle}>{t('um.totalUsers')}</Text>
          <Text style={styles.statValue}>{userManagement.users.length}</Text>
        </View>
        <View style={styles.statCard}>
          <Text style={styles.statTitle}>{t('um.active')}</Text>
          <Text style={[styles.statValue, { color: '#27ae60' }]}>
            {userManagement.users.filter(u => u.status === 'active').length}
          </Text>
        </View>
        <View style={styles.statCard}>
          <Text style={styles.statTitle}>{t('um.roles')}</Text>
          <Text style={styles.statValue}>{userManagement.roles.length}</Text>
        </View>
      </View>

      <View style={styles.searchContainer}>
        <Ionicons name="search" size={20} color={isDark ? '#cccccc' : '#666666'} />
        <TextInput
          style={styles.searchInput}
          placeholder={t('um.search')}
          placeholderTextColor={isDark ? '#999999' : '#999999'}
          value={userManagement.searchQuery}
          onChangeText={userManagement.setSearchQuery}
        />
        {userManagement.searchQuery !== '' && (
          <TouchableOpacity onPress={() => userManagement.setSearchQuery('')}>
            <Ionicons name="close-circle" size={20} color={isDark ? '#cccccc' : '#666666'} />
          </TouchableOpacity>
        )}
      </View>

      <View style={styles.filtersContainer}>
        <TouchableOpacity
          style={[styles.filterButton, userManagement.filterRole === 'all' && styles.activeFilter]}
          onPress={() => userManagement.setFilterRole('all')}
        >
          <Text style={[styles.filterText, userManagement.filterRole === 'all' && styles.activeFilterText]}>{t('um.all')}</Text>
        </TouchableOpacity>
        <TouchableOpacity
          style={[styles.filterButton, userManagement.filterRole === 'admin' && styles.activeFilter]}
          onPress={() => userManagement.setFilterRole('admin')}
        >
          <Text style={[styles.filterText, userManagement.filterRole === 'admin' && styles.activeFilterText]}>{t('um.admin')}</Text>
        </TouchableOpacity>
        <TouchableOpacity
          style={[styles.filterButton, userManagement.filterRole === 'editor' && styles.activeFilter]}
          onPress={() => userManagement.setFilterRole('editor')}
        >
          <Text style={[styles.filterText, userManagement.filterRole === 'editor' && styles.activeFilterText]}>{t('um.editor')}</Text>
        </TouchableOpacity>
        <TouchableOpacity
          style={[styles.filterButton, userManagement.filterRole === 'viewer' && styles.activeFilter]}
          onPress={() => userManagement.setFilterRole('viewer')}
        >
          <Text style={[styles.filterText, userManagement.filterRole === 'viewer' && styles.activeFilterText]}>{t('um.viewer')}</Text>
        </TouchableOpacity>
      </View>

      <TouchableOpacity
        style={{ flexDirection: 'row', alignItems: 'center', marginBottom: 10, padding: 10, backgroundColor: isDark ? '#2a2a2a' : '#f0f0f0', borderRadius: 8 }}
        onPress={handleRefresh}
      >
        <Ionicons name="refresh" size={20} color={isDark ? '#3498db' : '#2c3e50'} />
        <Text style={{ marginLeft: 10, color: isDark ? '#ffffff' : '#000000', fontWeight: '600' }}>
          {t('refresh')}
        </Text>
      </TouchableOpacity>

      <FlatList
        data={filteredUsers}
        renderItem={({ item }) => (
          <TouchableOpacity
            style={[styles.userCard, item.id === userManagement.selectedUser?.id && styles.userCardSelected]}
            onPress={() => handleUserPress(item)}
            activeOpacity={0.7}
          >
            <View style={styles.userHeader}>
              <View style={styles.userInfo}>
                <Text style={styles.userName}>{item.name}</Text>
                <Text style={styles.userEmail}>{item.email}</Text>
                <View style={[styles.userRoleBadge, { backgroundColor: getRoleColor(item.role || item.roles?.[0] || 'guest') }]}>
                  <Text style={styles.roleText}>{getRoleDisplayName(item.role || item.roles?.[0] || 'guest')}</Text>
                </View>
                <View style={[styles.statusBadge, getStatusColor(item.status)]}>
                  <Text style={styles.statusText}>{getStatusDisplayName(item.status)}</Text>
                </View>
              </View>
              <View style={{ flexDirection: 'row', gap: 8 }}>
                <TouchableOpacity
                  style={styles.editButton}
                  onPress={() => handleEditUser(item)}
                >
                  <Ionicons name="pencil" size={16} color="#ffffff" />
                  <Text style={styles.buttonText}>{t('um.edit')}</Text>
                </TouchableOpacity>
                <TouchableOpacity
                  style={styles.deleteButton}
                  onPress={() => handleDeleteUser(item)}
                >
                  <Ionicons name="trash" size={16} color="#ffffff" />
                  <Text style={styles.buttonText}>{t('um.delete')}</Text>
                </TouchableOpacity>
              </View>
            </View>

            {isAdmin && item.role !== 'admin' && (
              <View style={{ flexDirection: 'row', justifyContent: 'flex-end', marginTop: 10, gap: 10 }}>
                <TouchableOpacity
                  style={[styles.worshipButton, getPerm(item, 'canManageWorship') && styles.worshipButtonRemove]}
                  onPress={() => handleToggleWorship(item)}
                >
                  <Ionicons name="musical-notes" size={16} color="#ffffff" />
                  <Text style={styles.buttonText}>
                    {getPerm(item, 'canManageWorship') ? 'Retirer cultes' : 'Autoriser cultes'}
                  </Text>
                </TouchableOpacity>
              </View>
            )}

            <View style={styles.permissionsContainer}>
              {(() => {
                const permissionList: any[] = Array.isArray(item.permissions)
                  ? item.permissions
                  : Object.entries(item.permissions || {})
                      .filter(([_, val]) => val)
                      .map(([key]) => key);
                return (
                  <>
                    <Text style={styles.permissionsTitle}>{t('um.permissions')} ({permissionList.length}):</Text>
                    <View style={styles.permissionTags}>
                      {permissionList.slice(0, 5).map((permission: any, index: number) => (
                        <View key={index} style={styles.permissionTag}>
                          <Text style={styles.permissionText}>{typeof permission === 'string' ? permission : permission.name || permission.id}</Text>
                        </View>
                      ))}
                      {permissionList.length > 5 && (
                        <View style={styles.permissionTag}>
                          <Text style={styles.permissionText}>+{permissionList.length - 5} {t('um.others')}</Text>
                        </View>
                      )}
                    </View>
                  </>
                );
              })()}
            </View>
          </TouchableOpacity>
        )}
        keyExtractor={(item) => item.id}
        showsVerticalScrollIndicator={false}
      />
    </View>
  );
}
