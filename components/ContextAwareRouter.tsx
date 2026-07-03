import { useState, useEffect, useCallback, useMemo } from 'react';
import { View, TouchableOpacity, StyleSheet, Animated, Text } from 'react-native';
import { useRouter } from 'expo-router';
import { useI18n } from '@/context/I18nContext';
import { useThemeColor } from '@/hooks/useThemeColor';

interface ContextAwareRouterState {
  currentRoute: string;
  availableRoutes: Route[];
  breadcrumbs: Breadcrumb[];
  lastRouteTime: number;
}

interface Route {
  path: string;
  name: string;
  requiredRole?: string;
  component: any;
}

interface Breadcrumb {
  path: string;
  name: string;
  isActive: boolean;
}

export function ContextAwareRouter() {
  const { t } = useI18n();
  const router = useRouter();
  const [routerState, setRouterState] = useState<ContextAwareRouterState>({
    currentRoute: '/',
    availableRoutes: [],
    breadcrumbs: [],
    lastRouteTime: 0,
  });

  useEffect(() => {
    const initialRoutes = generateRoutes();
    setRouterState(prev => ({
      ...prev,
      availableRoutes: initialRoutes,
      breadcrumbs: generateBreadcrumbs('/'),
    }));
  }, []);

  const generateRoutes = (): Route[] => {
    return [
      { path: '/', name: t('home.title'), component: null },
      { path: '/login', name: 'Connexion', component: null },
      { path: '/register', name: 'Inscription', component: null },
      { path: '/home', name: t('home.title'), component: null },
      { path: '/songs', name: 'Listes de chansons', component: null },
      { path: '/my-songs', name: 'Mes chansons', component: null },
      { path: '/worship-management', name: 'Gestion de culte', requiredRole: 'leader', component: null },
      { path: '/notifications', name: t('notifications.title'), component: null },
      { path: '/profile', name: t('profile.title'), component: null },
    ];
  };

  const generateBreadcrumbs = (currentPath: string): Breadcrumb[] => {
    const routes = generateRoutes();
    const filteredRoutes = routes.filter(route => route.path && route.path !== '/');
    const breadcrumbList: Breadcrumb[] = [];

    let currentMatch = '';
    for (const route of filteredRoutes) {
      currentMatch += route.path;
      breadcrumbList.push({
        path: route.path,
        name: route.name,
        isActive: currentMatch === currentPath,
      });
      if (currentMatch !== currentPath) {
        currentMatch += '/';
      }
    }

    return breadcrumbList;
  };

  const updateRouterState = useCallback((path: string) => {
    setRouterState(prev => ({
      ...prev,
      currentRoute: path,
      breadcrumbs: generateBreadcrumbs(path),
      lastRouteTime: Date.now(),
    }));
  }, []);

  const isValidRoute = (path: string): boolean => {
    const routePaths = generateRoutes().map(route => route.path);
    return routePaths.includes(path) || path.startsWith('/');
  };

  const backgroundColor = useThemeColor({}, 'background');
  const textColor = useThemeColor({}, 'text');
  const secondaryColor = useThemeColor({}, 'secondary');
  const borderColor = useThemeColor({}, 'mediumGray');

  const getBreadcrumbNavigation = () => (<View style={[styles.breadcrumbContainer, { backgroundColor }]}>
      {routerState.breadcrumbs.map((crumb, index) => (
        <TouchableOpacity
          key={index}
          style={[styles.breadcrumb, { backgroundColor, borderColor }]}
          onPress={() => navigateTo(crumb.path)}
        >
          <Text style={[styles.breadcrumbText, { color: textColor }]}>{crumb.name}</Text>
          {index < routerState.breadcrumbs.length - 1 && (
            <Text style={[styles.breadcrumbSeparator, { color: secondaryColor }]}>/</Text>
          )}
        </TouchableOpacity>
      ))}
    </View>
  );

  const navigateTo = (path: string) => {
    if (isValidRoute(path)) {
      router.push(path);
      updateRouterState(path);
    } else {
      console.warn('Route invalide:', path);
    }
  };

  const keyboardNavigation = useCallback((event: any) => {
    if (event.key === 'ArrowRight' || event.key === 'ArrowLeft') {
      const currentIndex = routerState.breadcrumbs.findIndex(crumb => crumb.isActive);
      if (event.key === 'ArrowRight' && currentIndex < routerState.breadcrumbs.length - 1) {
        navigateTo(routerState.breadcrumbs[currentIndex + 1].path);
      } else if (event.key === 'ArrowLeft' && currentIndex > 0) {
        navigateTo(routerState.breadcrumbs[currentIndex - 1].path);
      }
    }
  }, [routerState]);

  useEffect(() => {
    document.addEventListener('keydown', keyboardNavigation);
    return () => document.removeEventListener('keydown', keyboardNavigation);
  }, [keyboardNavigation]);

  const styles = StyleSheet.create({
    breadcrumbContainer: {
      flexDirection: 'row',
      alignItems: 'center',
      padding: 12,
      marginBottom: 10,
    },
    breadcrumb: {
      paddingHorizontal: 8,
      paddingVertical: 4,
      marginHorizontal: 2,
      borderRadius: 4,
      borderWidth: 1,
    },
    breadcrumbText: {
      fontSize: 14,
    },
    breadcrumbSeparator: {
      marginHorizontal: 4,
    },
  });

  return {
    getBreadcrumbNavigation,
    navigateTo,
    isValidRoute,
    currentRoute: routerState.currentRoute,
    breadcrumbs: routerState.breadcrumbs,
  };
}