'use client';

import React, { useEffect, useRef } from 'react';
import { createClient } from '@/lib/supabase/client';

const INACTIVITY_LIMIT_MS = 60 * 60 * 1000; // 1 hour (3,600,000 ms)
const LAST_ACTIVITY_KEY = 'faibah_last_activity';
const UPDATE_THROTTLE_MS = 10 * 1000; // Update localStorage at most once every 10 seconds

export default function InactivityGuard({ children }: { children: React.ReactNode }) {
  const lastUpdateRef = useRef<number>(0);

  const handleLogout = async () => {
    try {
      if (typeof window !== 'undefined') {
        localStorage.removeItem(LAST_ACTIVITY_KEY);
      }
      const supabase = createClient();
      await supabase.auth.signOut();
      
      const authUrl = process.env.NEXT_PUBLIC_AUTH_APP_URL || 
        (typeof window !== 'undefined' && window.location.hostname.includes('faibah.com') ? 'https://auth.faibah.com' : 'http://localhost:3001');
      
      window.location.href = `${authUrl}/login?reason=inactivity`;
    } catch (e) {
      console.error('Logout on inactivity failed:', e);
    }
  };

  const updateLastActivity = () => {
    const now = Date.now();
    if (now - lastUpdateRef.current > UPDATE_THROTTLE_MS) {
      lastUpdateRef.current = now;
      try {
        localStorage.setItem(LAST_ACTIVITY_KEY, now.toString());
      } catch (e) {}
    }
  };

  const checkInactivity = () => {
    try {
      const stored = localStorage.getItem(LAST_ACTIVITY_KEY);
      if (!stored) {
        localStorage.setItem(LAST_ACTIVITY_KEY, Date.now().toString());
        return;
      }

      const lastActivityTime = parseInt(stored, 10);
      if (isNaN(lastActivityTime)) {
        localStorage.setItem(LAST_ACTIVITY_KEY, Date.now().toString());
        return;
      }

      const timeSinceLastActivity = Date.now() - lastActivityTime;
      if (timeSinceLastActivity >= INACTIVITY_LIMIT_MS) {
        handleLogout();
      }
    } catch (e) {}
  };

  useEffect(() => {
    // Initial check on mount
    checkInactivity();

    // Interaction listeners
    const events = ['mousemove', 'mousedown', 'keydown', 'scroll', 'touchstart', 'click'];
    const handleUserInteraction = () => {
      updateLastActivity();
    };

    events.forEach(event => window.addEventListener(event, handleUserInteraction, { passive: true }));

    // Listen for storage changes across browser tabs
    const handleStorageChange = (e: StorageEvent) => {
      if (e.key === LAST_ACTIVITY_KEY && e.newValue) {
        const newTime = parseInt(e.newValue, 10);
        if (!isNaN(newTime) && Date.now() - newTime >= INACTIVITY_LIMIT_MS) {
          handleLogout();
        }
      }
    };
    window.addEventListener('storage', handleStorageChange);

    // Periodic check interval every 15 seconds
    const interval = setInterval(() => {
      checkInactivity();
    }, 15000);

    // Check when tab visibility changes or window gains focus
    const handleVisibilityChange = () => {
      if (document.visibilityState === 'visible') {
        checkInactivity();
      }
    };
    document.addEventListener('visibilitychange', handleVisibilityChange);
    window.addEventListener('focus', checkInactivity);

    return () => {
      events.forEach(event => window.removeEventListener(event, handleUserInteraction));
      window.removeEventListener('storage', handleStorageChange);
      document.removeEventListener('visibilitychange', handleVisibilityChange);
      window.removeEventListener('focus', checkInactivity);
      clearInterval(interval);
    };
  }, []);

  return <>{children}</>;
}
