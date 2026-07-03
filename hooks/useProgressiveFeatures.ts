import { useState, useEffect } from 'react';
import { useAuth } from '@/context/AuthContext';

interface ProgressiveFeature {
  id: string;
  name: string;
  description: string;
  requiredRole: string;
  isEnabled: boolean;
  rolloutDate?: number;
}

interface ProgressiveFeaturesState {
  availableFeatures: ProgressiveFeature[];
  enabledFeatures: string[];
  isDemoMode: boolean;
}

export function useProgressiveFeatures() {
  const [pfState, setPfState] = useState<ProgressiveFeaturesState>({
    availableFeatures: [
      {
        id: 'advanced-analytics',
        name: 'Analytique Avancée',
        description: 'Rapports de comportement utilisateur détaillés',
        requiredRole: 'leader',
        isEnabled: false,
      },
      {
        id: 'mobile-optimized-lyrics',
        name: 'Lyriques Mobile Optimisées',
        description: 'Interface de lecture améliorée pour mobile',
        requiredRole: 'guest',
        isEnabled: true,
      },
      {
        id: 'advanced-search',
        name: 'Recherche Avancée',
        description: 'Recherche par mots-clés et suggestions intelligentes',
        requiredRole: 'guest',
        isEnabled: true,
      },
      {
        id: 'role-based-access',
        name: 'Accès Basé sur Rôles',
        description: 'Contrôle d\'accès granulaire par rôle',
        requiredRole: 'leader',
        isEnabled: false,
        rolloutDate: Date.now() + 86400000 * 7,
      },
      {
        id: 'customization',
        name: 'Personnalisation',
        description: 'Personnalisation des paramètres d\'interface',
        requiredRole: 'guest',
        isEnabled: true,
      },
    ],
    enabledFeatures: [],
    isDemoMode: false,
  });

  const { user } = useAuth();

  useEffect(() => {
    const checkRolePermissions = () => {
      const newEnabledFeatures: string[] = [];

      pfState.availableFeatures.forEach(feature => {
        const hasPermission = user?.role === 'admin' || user?.role === feature.requiredRole;
        if (hasPermission && !feature.isEnabled) {
          newEnabledFeatures.push(feature.id);
        }
      });

      if (newEnabledFeatures.length > 0) {
        setPfState(prev => ({
          ...prev,
          enabledFeatures: [...prev.enabledFeatures, ...newEnabledFeatures],
        }));
      }

      const isDemo = pfState.availableFeatures.some(f => f.id === 'advanced-analytics' && !f.isEnabled);
      setPfState(prev => ({ ...prev, isDemoMode: isDemo }));
    };

    checkRolePermissions();
  }, [user?.role]);

  const getEnabledFeatures = () => {
    return pfState.availableFeatures.filter(feature =>
      pfState.enabledFeatures.includes(feature.id) || feature.isEnabled
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