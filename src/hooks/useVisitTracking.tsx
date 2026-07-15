import { useEffect } from 'react';
import { supabase } from '@/integrations/supabase/client';

// Records one anonymous visit row per browser session.
// Fire-and-forget: tracking must never affect the app if it fails.
export const useVisitTracking = () => {
  useEffect(() => {
    if (sessionStorage.getItem('visit-tracked')) return;
    sessionStorage.setItem('visit-tracked', '1');

    // site_visits is not in the generated Supabase types yet, hence the cast
    (supabase.from('site_visits' as never) as any)
      .insert({
        path: window.location.pathname,
        language: navigator.language
      })
      .then(({ error }: { error: unknown }) => {
        if (error) console.warn('Visit tracking failed:', error);
      });
  }, []);
};
