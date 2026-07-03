import { useState, useEffect } from 'react';
import { useAuth } from '@/context/AuthContext';

interface BehaviorAnalyticsData {
  userId?: string;
  sessionId: string;
  timestamp: number;
  path: string;
  action: string;
  metadata?: Record<string, any>;
  deviceInfo?: {
    screenWidth: number;
    screenHeight: number;
    platform: string;
    language: string;
  };
}

const generateSessionId = (): string => {
  return Math.random().toString(36).substring(2, 15) + Math.random().toString(36).substring(2, 15);
};

const getDeviceInfo = () => {
  if (typeof window === 'undefined') {
    return {
      screenWidth: 0,
      screenHeight: 0,
      platform: 'unknown',
      language: 'unknown',
    };
  }

  return {
    screenWidth: window.screen.width,
    screenHeight: window.screen.height,
    platform: window.navigator.platform,
    language: window.navigator.language,
  };
};

const trackEvent = async (data: BehaviorAnalyticsData): Promise<void> => {
  try {
    const analyticsPayload = {
      ...data,
      timestamp: data.timestamp || Date.now(),
      sessionId: data.sessionId || generateSessionId(),
      deviceInfo: data.deviceInfo || getDeviceInfo(),
    };

    console.log('Tracking user journey event:', analyticsPayload);

    if (__DEV__) {
      console.log('Analytics data (dev mode):', analyticsPayload);
    }

    await new Promise(resolve => setTimeout(resolve, 100));
  } catch (error) {
    console.error('Error tracking analytics:', error);
  }
};

export const trackUserJourney = async (path: string, action: string, metadata?: Record<string, any>): Promise<void> => {
  const user = useAuth?.();
  const deviceInfo = getDeviceInfo();

  const analyticsData: BehaviorAnalyticsData = {
    userId: user?.user?.id,
    sessionId: generateSessionId(),
    timestamp: Date.now(),
    path,
    action,
    metadata,
    deviceInfo,
  };

  await trackEvent(analyticsData);
};

export const funnelTracking = {
  trackFunnelStep: async (step: string, userId?: string, metadata?: any) => {
    await trackEvent({
      userId,
      sessionId: generateSessionId(),
      timestamp: Date.now(),
      path: window?.location?.pathname || '/',
      action: `funnel_step_${step}`,
      metadata: { ...metadata, step },
    });
  },

  trackConversion: async (conversionType: string, value?: number, metadata?: any) => {
    await trackEvent({
      sessionId: generateSessionId(),
      timestamp: Date.now(),
      path: window?.location?.pathname || '/',
      action: `conversion_${conversionType}`,
      metadata: { ...metadata, value },
    });
  },
};

export const behaviorAnalytics = {
  trackUserJourney,
  funnelTracking,
};