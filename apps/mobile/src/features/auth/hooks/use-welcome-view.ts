import { router } from 'expo-router';

export default function useWelcomeView() {
   return {
      goToLogin: () => router.push('/login'),
      goToRegister: () => router.push('/register'),
   };
}
