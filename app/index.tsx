import { useRouter, useRootNavigationState } from 'expo-router';
import { useEffect } from 'react';
import { useAuth } from '@clerk/clerk-expo';

export default function Index() {
  const router = useRouter();
  const rootNavigation = useRootNavigationState();
  const { isSignedIn } = useAuth();

  useEffect(() => {
    if (!rootNavigation?.key) return; // Wait until router is ready

    if (isSignedIn) {
      router.replace('/dashboard');
    } else {
      router.replace('/login');
    }
  }, [rootNavigation, isSignedIn]);

  return null;
}
