import { useState, useEffect } from 'react';
import { useRouter, usePathname } from 'expo-router';
import { useAuth } from '@/context/AuthContext';

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

  useEffect(() => {
    if (pathname !== flowState.currentPath) {
      setFlowState(prev => ({
        ...prev,
        currentPath: pathname,
        visitedScreens: [...prev.visitedScreens, pathname].filter((path, index, self) => self.indexOf(path) === index),
      }));
    }
  }, [pathname]);

  const navigateToPath = (path: string) => {
    const { user } = useAuth();
    const isAuthorized = user?.role === 'admin' || !path.startsWith('/admin') && !path.startsWith('/worship-management');
    if (isAuthorized) {
      router.push(path as any);
    }
  };

  const trackJourneyStep = (step: number) => {
    setFlowState(prev => ({
      ...prev,
      journeyStep: step,
      progress: (step / 10) * 100,
    }));
  };

  const completeJourney = () => {
    setFlowState(prev => ({
      ...prev,
      journeyStep: 10,
      progress: 100,
    }));
  };

  const unlockFeature = (featureId: string) => {
    setFlowState(prev => ({
      ...prev,
      featureAccess: { ...prev.featureAccess, [featureId]: true },
    }));
  };

  return {
    ...flowState,
    navigateToPath,
    trackJourneyStep,
    completeJourney,
    unlockFeature,
  };
}