import { useState, useEffect, useCallback } from 'react';
import { useAuth } from '@/context/AuthContext';
import { featuresApi } from '@/api/features';

interface ProgressiveFeature {
  id: string;
  name: string;
  description: string;
  requiredRole: string;
  isEnabled: boolean;
}

interface ProgressiveFeaturesState {
  availableFeatures: ProgressiveFeature[];
  enabledFeatures: string[];
  isDemoMode: boolean;
}

export function useProgressiveFeatures() {
  const [pfState, setPfState] = useState<ProgressiveFeaturesState>({
    availableFeatures: [],
    enabledFeatures: [],
    isDemoMode: false,
  });

  const { user } = useAuth();

  const loadFeatures = useCallback(async () => {
    try {
      const all = await featuresApi.getAll();
      const features: ProgressiveFeature[] = all.map(f => ({
        id: f.id,
        name: f.name,
        description: f.description,
        requiredRole: f.requiredRole,
        isEnabled: f.isEnabled,
      }));
      const enabled = features
        .filter(f => f.isEnabled || user?.role === 'admin' || user?.role === f.requiredRole)
        .map(f => f.id);
      const isDemo = features.some(f => f.id === 'advanced-analytics' && !f.isEnabled);
      setPfState({ availableFeatures: features, enabledFeatures: enabled, isDemoMode: isDemo });
    } catch (error) {
      console.error('Erreur chargement fonctionnalités:', error);
    }
  }, [user?.role]);

  useEffect(() => {
    loadFeatures();
  }, [loadFeatures]);

  const getEnabledFeatures = () => {
    return pfState.availableFeatures.filter(f =>
      pfState.enabledFeatures.includes(f.id) || f.isEnabled
    );
  };

  const canAccessFeature = (featureId: string) => {
    const feature = pfState.availableFeatures.find(f => f.id === featureId);
    if (!feature) return false;
    const hasPermission = user?.role === 'admin' || user?.role === feature.requiredRole;
    return hasPermission && (feature.isEnabled || pfState.enabledFeatures.includes(feature.id));
  };

  return {
    ...pfState,
    getEnabledFeatures,
    canAccessFeature,
  };
}
