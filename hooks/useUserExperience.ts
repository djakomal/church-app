import { useState, useEffect, useCallback } from 'react';
import { useAuth } from '@/context/AuthContext';
import { useProgressiveFeatures } from '@/hooks/useProgressiveFeatures';

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
    performanceMetrics: {
      loadTime: 0,
      renderTime: 0,
      interactionTime: 0,
    },
  });

  const { user } = useAuth();
  const { isDemoMode } = useProgressiveFeatures();

  useEffect(() => {
    const startTime = performance.now();

    const recordRenderTime = () => {
      const endTime = performance.now();
      setUxState(prev => ({
        ...prev,
        performanceMetrics: {
          ...prev.performanceMetrics,
          renderTime: endTime - startTime,
        },
      }));
    };

    const timeoutId = setTimeout(recordRenderTime, 0);

    return () => clearTimeout(timeoutId);
  }, []);

  const setLoading = useCallback((loading: boolean) => {
    setUxState(prev => ({ ...prev, isLoading: loading }));
  }, []);

  const setError = useCallback((error: string | null) => {
    setUxState(prev => ({ ...prev, error }));
    if (error) {
      trackError(error);
    }
  }, []);

  const recordActivity = useCallback(() => {
    setUxState(prev => ({
      ...prev,
      lastActivity: Date.now(),
    }));
  }, []);

  const toggleAccessibility = useCallback(() => {
    setUxState(prev => ({ ...prev, accessibilityEnabled: !prev.accessibilityEnabled }));
  }, []);

  const increaseFontSize = useCallback(() => {
    setUxState(prev => ({
      ...prev,
      fontSize: Math.min(prev.fontSize + 2, 24),
    }));
  }, []);

  const decreaseFontSize = useCallback(() => {
    setUxState(prev => ({
      ...prev,
      fontSize: Math.max(prev.fontSize - 2, 12),
    }));
  }, []);

  const setTheme = useCallback((theme: 'light' | 'dark' | 'system') => {
    setUxState(prev => ({ ...prev, theme }));
  }, []);

  const clearError = useCallback(() => {
    setUxState(prev => ({ ...prev, error: null }));
  }, []);

  const trackError = async (error: string) => {
    try {
      const { trackUserJourney } = await import('@/utils/behaviorAnalytics');
      await trackUserJourney('/error', 'error_occurred', {
        error,
        userId: user?.id,
        timestamp: Date.now(),
      });
    } catch (err) {
      console.error('Failed to track error:', err);
    }
  };

  useEffect(() => {
    const handleVisibilityChange = () => {
      if (document.visibilityState === 'visible') {
        recordActivity();
      }
    };

    const handleKeyDown = (event: KeyboardEvent) => {
      if (event.key === 'Escape') {
        clearError();
      }
    };

    document.addEventListener('visibilitychange', handleVisibilityChange);
    document.addEventListener('keydown', handleKeyDown);

    return () => {
      document.removeEventListener('visibilitychange', handleVisibilityChange);
      document.removeEventListener('keydown', handleKeyDown);
    };
  }, [recordActivity, clearError]);

  useEffect(() => {
    const interactionStart = performance.now();

    const recordInteractionTime = () => {
      const endTime = performance.now();
      setUxState(prev => ({
        ...prev,
        performanceMetrics: {
          ...prev.performanceMetrics,
          interactionTime: endTime - interactionStart,
        },
      }));
    };

    const timeoutId = setTimeout(recordInteractionTime, 1000);

    return () => clearTimeout(timeoutId);
  }, []);

  return {
    ...uxState,
    ...{
      setLoading,
      setError,
      recordActivity,
      toggleAccessibility,
      increaseFontSize,
      decreaseFontSize,
      setTheme,
      clearError,
    },
  } as UserExperienceState & UserExperienceActions & {
    recordActivity: () => void;
    increaseFontSize: () => void;
    decreaseFontSize: () => void;
    setTheme: (theme: 'light' | 'dark' | 'system') => void;
    clearError: () => void;
  };
}