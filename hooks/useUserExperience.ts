import { useState, useEffect, useCallback } from 'react';
import { useAuth } from '@/context/AuthContext';
import { useProgressiveFeatures } from '@/hooks/useProgressiveFeatures';
import { userSettingsApi } from '@/api/userSettings';

interface UserExperienceState {
  isLoading: boolean;
  error: string | null;
  lastActivity: number;
  accessibilityEnabled: boolean;
  fontSize: number;
  theme: 'light' | 'dark' | 'system';
  performanceMetrics: {
    loadTime: number;
    renderTime: number;
    interactionTime: number;
  };
}

interface UserExperienceActions {
  setLoading: (loading: boolean) => void;
  setError: (error: string | null) => void;
  recordActivity: () => void;
  toggleAccessibility: () => void;
  increaseFontSize: () => void;
  decreaseFontSize: () => void;
  setTheme: (theme: 'light' | 'dark' | 'system') => void;
  clearError: () => void;
}

export function useUserExperience() {
  const [uxState, setUxState] = useState<UserExperienceState>({
    isLoading: false,
    error: null,
    lastActivity: Date.now(),
    accessibilityEnabled: false,
    fontSize: 16,
    theme: 'system',
    performanceMetrics: { loadTime: 0, renderTime: 0, interactionTime: 0 },
  });

  const { user } = useAuth();
  const { isDemoMode } = useProgressiveFeatures();

  const loadSettings = useCallback(async () => {
    if (!user?.id) return;
    try {
      const settings = await userSettingsApi.get(user.id);
      setUxState(prev => ({
        ...prev,
        accessibilityEnabled: settings.accessibilityEnabled,
        fontSize: settings.fontSize,
        theme: settings.theme as 'light' | 'dark' | 'system',
      }));
    } catch (error) {
      console.error('Erreur chargement UX settings:', error);
    }
  }, [user?.id]);

  const saveSettings = useCallback(async (updates: { accessibilityEnabled?: boolean; fontSize?: number; theme?: string }) => {
    if (!user?.id) return;
    try {
      await userSettingsApi.update(user.id, updates);
    } catch (error) {
      console.error('Erreur sauvegarde UX settings:', error);
    }
  }, [user?.id]);

  useEffect(() => {
    loadSettings();
  }, [loadSettings]);

  const setLoading = useCallback((loading: boolean) => {
    setUxState(prev => ({ ...prev, isLoading: loading }));
  }, []);

  const setError = useCallback((error: string | null) => {
    setUxState(prev => ({ ...prev, error }));
  }, []);

  const recordActivity = useCallback(() => {
    setUxState(prev => ({ ...prev, lastActivity: Date.now() }));
  }, []);

  const toggleAccessibility = useCallback(() => {
    const newVal = !uxState.accessibilityEnabled;
    setUxState(prev => ({ ...prev, accessibilityEnabled: newVal }));
    saveSettings({ accessibilityEnabled: newVal });
  }, [uxState.accessibilityEnabled, saveSettings]);

  const increaseFontSize = useCallback(() => {
    const newSize = Math.min(uxState.fontSize + 2, 24);
    setUxState(prev => ({ ...prev, fontSize: newSize }));
    saveSettings({ fontSize: newSize });
  }, [uxState.fontSize, saveSettings]);

  const decreaseFontSize = useCallback(() => {
    const newSize = Math.max(uxState.fontSize - 2, 12);
    setUxState(prev => ({ ...prev, fontSize: newSize }));
    saveSettings({ fontSize: newSize });
  }, [uxState.fontSize, saveSettings]);

  const setTheme = useCallback((theme: 'light' | 'dark' | 'system') => {
    setUxState(prev => ({ ...prev, theme }));
    saveSettings({ theme });
  }, [saveSettings]);

  const clearError = useCallback(() => {
    setUxState(prev => ({ ...prev, error: null }));
  }, []);

  return {
    ...uxState,
    setLoading,
    setError,
    recordActivity,
    toggleAccessibility,
    increaseFontSize,
    decreaseFontSize,
    setTheme,
    clearError,
  };
}
