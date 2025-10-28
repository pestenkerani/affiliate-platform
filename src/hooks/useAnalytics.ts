'use client';

import { useCallback } from 'react';

interface AnalyticsEvent {
  action: string;
  category: string;
  label?: string;
  value?: number;
}

interface PageViewEvent {
  page_title: string;
  page_location: string;
  page_path?: string;
}

export function useAnalytics() {
  const trackEvent = useCallback((event: AnalyticsEvent) => {
    if (typeof window !== 'undefined' && window.gtag) {
      window.gtag('event', event.action, {
        event_category: event.category,
        event_label: event.label,
        value: event.value,
      });
    }
  }, []);

  const trackPageView = useCallback((event: PageViewEvent) => {
    if (typeof window !== 'undefined' && window.gtag) {
      window.gtag('config', process.env.NEXT_PUBLIC_GOOGLE_ANALYTICS_ID!, {
        page_title: event.page_title,
        page_location: event.page_location,
        page_path: event.page_path,
      });
    }
  }, []);

  const trackPurchase = useCallback((transactionId: string, value: number, currency: string = 'TRY') => {
    if (typeof window !== 'undefined' && window.gtag) {
      window.gtag('event', 'purchase', {
        transaction_id: transactionId,
        value: value,
        currency: currency,
      });
    }
  }, []);

  const trackConversion = useCallback((value: number, currency: string = 'TRY') => {
    if (typeof window !== 'undefined' && window.gtag) {
      window.gtag('event', 'conversion', {
        value: value,
        currency: currency,
      });
    }
  }, []);

  const trackClick = useCallback((element: string, url?: string) => {
    if (typeof window !== 'undefined' && window.gtag) {
      window.gtag('event', 'click', {
        event_category: 'engagement',
        event_label: element,
        link_url: url,
      });
    }
  }, []);

  const trackError = useCallback((error: string, fatal: boolean = false) => {
    if (typeof window !== 'undefined' && window.gtag) {
      window.gtag('event', 'exception', {
        description: error,
        fatal: fatal,
      });
    }
  }, []);

  return {
    trackEvent,
    trackPageView,
    trackPurchase,
    trackConversion,
    trackClick,
    trackError,
  };
}





