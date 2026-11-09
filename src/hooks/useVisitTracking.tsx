import { useEffect } from 'react';
import { recordVisit } from '@/integrations/api';

// Records one anonymous visit row per browser session.
// Fire-and-forget: tracking must never affect the app if it fails.
export const useVisitTracking = () => {
  useEffect(() => {
    if (sessionStorage.getItem('visit-tracked')) return;
    sessionStorage.setItem('visit-tracked', '1');

    recordVisit(window.location.pathname, navigator.language).then(({ error }) => {
      if (error) console.warn('Visit tracking failed:', error);
    });
  }, []);
};
