import { Redirect } from 'expo-router';
import React from 'react';

export default function Index() {
  // Forcer la page de login comme page d'entrée
  return <Redirect href="/login" />;
}