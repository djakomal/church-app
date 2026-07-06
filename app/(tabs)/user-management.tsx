import React from 'react';
import { UserManagementScreen } from '@/components/UserManagementScreen';
import { router } from 'expo-router';

export default function UserManagementPage() {
  return <UserManagementScreen onClose={() => router.back()} />;
}
