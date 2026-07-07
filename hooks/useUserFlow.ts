import { useState, useEffect, useCallback } from 'react';
import { useRouter, usePathname } from 'expo-router';
import { useAuth } from '@/context/AuthContext';
import { userSettingsApi } from '@/api/userSettings';

interface UserFlowState {
  currentPath: string;
  userRole: string;
  journeyStep: number;
  progress: number;
  visitedScreens: string[];
  featureAccess: Record<string, boolean>;
}

interface UserFlowActions {
  navigateToPath: (path: string) => void;
  trackJourneyStep: (step: number) => void;
  completeJourney: () => void;
  unlockFeature: (featureId: string) => void;
}

export function useUserFlow(userRole: string, currentPath: string) {
  const [flowState, setFlowState] = useState<UserFlowState>({
    currentPath,
    userRole,
    journeyStep: 1,
    progress: 0,
    visitedScreens: [currentPath],
    featureAccess: {},
  });

  const router = useRouter();
  const pathname = usePathname();
  const { user } = useAuth();

  const loadSettings = useCallback(async () => {
    if (!user?.id) return;
    try {
      const settings = await userSettingsApi.get(user.id);
      setFlowState(prev => ({
        ...prev,
        journeyStep: settings.journeyStep,
        progress: settings.progress,
        visitedScreens: settings.visitedScreens,
        featureAccess: settings.featureAccess,
      }));
    } catch (error) {
      console.error('Erreur chargement settings:', error);
    }
  }, [user?.id]);

  const saveSettings = useCallback(async (updates: Partial<UserFlowState>) => {
    if (!user?.id) return;
    try {
      await userSettingsApi.update(user.id, {
        journeyStep: updates.journeyStep ?? flowState.journeyStep,
        progress: updates.progress ?? flowState.progress,
        visitedScreens: updates.visitedScreens ?? flowState.visitedScreens,
        featureAccess: updates.featureAccess ?? flowState.featureAccess,
      });
    } catch (error) {
      console.error('Erreur sauvegarde settings:', error);
    }
  }, [user?.id, flowState]);

  useEffect(() => {
    loadSettings();
  }, [loadSettings]);

  useEffect(() => {
    if (pathname !== flowState.currentPath) {
      const updatedScreens = [...flowState.visitedScreens, pathname]
        .filter((path, index, self) => self.indexOf(path) === index);
      setFlowState(prev => ({
        ...prev,
        currentPath: pathname,
        visitedScreens: updatedScreens,
      }));
      saveSettings({ visitedScreens: updatedScreens });
    }
  }, [pathname]);

  const navigateToPath = (path: string) => {
    const isAuthorized = user?.role === 'admin' || !path.startsWith('/admin') && !path.startsWith('/worship-management');
    if (isAuthorized) {
      router.push(path as any);
    }
  };

  const trackJourneyStep = (step: number) => {
    const progress = (step / 10) * 100;
    setFlowState(prev => ({ ...prev, journeyStep: step, progress }));
    saveSettings({ journeyStep: step, progress });
  };

  const completeJourney = () => {
    setFlowState(prev => ({ ...prev, journeyStep: 10, progress: 100 }));
    saveSettings({ journeyStep: 10, progress: 100 });
  };

  const unlockFeature = (featureId: string) => {
    const updated = { ...flowState.featureAccess, [featureId]: true };
    setFlowState(prev => ({ ...prev, featureAccess: updated }));
    saveSettings({ featureAccess: updated });
  };

  return {
    ...flowState,
    navigateToPath,
    trackJourneyStep,
    completeJourney,
    unlockFeature,
  };
}
