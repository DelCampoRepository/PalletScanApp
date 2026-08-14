import { NavigationContainer } from '@react-navigation/native';
import { useEffect } from 'react';
import { useAuthStore } from '@/features/auth/store/useAuthStore';
import { LoginScreen } from '@/features/auth/screens/LoginScreen';
import { LockScreen } from '@/features/auth/screens/LockScreen';
import { PalletsNavigator } from './PalletsNavigator';

export function RootNavigator() {
  const status = useAuthStore((s) => s.status);
  const bootstrap = useAuthStore((s) => s.bootstrap);

  useEffect(() => {
    bootstrap();
  }, [bootstrap]);

  return (
    <NavigationContainer>
      {status === 'unauthenticated' && <LoginScreen />}
      {status === 'locked' && <LockScreen />}
      {status === 'authenticated' && <PalletsNavigator />}
      {/* status === 'loading': no renderiza nada, podría ir un splash */}
    </NavigationContainer>
  );
}