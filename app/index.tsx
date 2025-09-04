import React, { useEffect } from 'react';
import { View, StyleSheet } from 'react-native';
import { Redirect, useRouter } from 'expo-router';
import { useAuth } from '@/context/AuthContext';
import { LoadingIndicator } from '@/components/LoadingIndicator';
import { useThemeColor } from '@/hooks/useThemeColor';

export default function Index() {
  const { user, isLoading } = useAuth();
  const router = useRouter();
  
  const backgroundColor = useThemeColor({}, 'background');

  useEffect(() => {
    if (!isLoading) {
      console.log('🔍 État utilisateur:', user ? 'Connecté' : 'Non connecté');
      
      if (user) {
        console.log('👤 Utilisateur détecté:', user.name, user.email);
        // Utilisateur connecté, rediriger vers l'accueil
        router.replace('/home');
      } else {
        console.log('🔓 Aucun utilisateur, redirection vers login');
        // Utilisateur non connecté, rediriger vers la connexion
        router.replace('/login');
      }
    }
  }, [user, isLoading, router]);

  // Afficher un écran de chargement pendant la vérification
  if (isLoading) {
    return (
      <View style={[styles.container, { backgroundColor }]}>
        <LoadingIndicator />
      </View>
    );
  }

  // Fallback - ne devrait pas être atteint
  return user ? <Redirect href="/home" /> : <Redirect href="/login" />;
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
});