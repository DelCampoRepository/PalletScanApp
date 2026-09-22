import { NavigationContainer } from '@react-navigation/native';
import { useEffect } from 'react';
import { useAuthStore } from '@/features/auth/store/useAuthStore';
import { useLocationStore } from '@/shared/store/useLocationStore';
import { LoginScreen } from '@/features/auth/screens/LoginScreen';
import { LockScreen } from '@/features/auth/screens/LockScreen';
import { LocationSelectScreen } from '@/features/auth/screens/LocationSelectScreen';
import { PalletsNavigator } from './PalletsNavigator';

export function RootNavigator() {
  const status = useAuthStore((s) => s.status);
  const bootstrap = useAuthStore((s) => s.bootstrap);
  const selectedLocation = useLocationStore((s) => s.selected);

  useEffect(() => {
    bootstrap();
  }, [bootstrap]);

  return (
    <NavigationContainer>
      {!selectedLocation ? (
        <LocationSelectScreen />
      ) : (
        <>
          {status === 'unauthenticated' && <LoginScreen />}
          {status === 'locked' && <LockScreen />}
          {status === 'authenticated' && <PalletsNavigator />}
        </>
      )}
    </NavigationContainer>
  );
}