import { useEffect } from 'react';
import { useNavigation } from 'expo-router';

import { useNewRoutine } from '../context/new-routine-context';

export function useResetRoutineOnBack() {
   const navigation = useNavigation();
   const { resetRoutine } = useNewRoutine();

   useEffect(() => {
      // Cuando se navega hacia atrás, reseteamos la rutina.
      const unsubscribe = navigation.addListener('beforeRemove', () => {
         resetRoutine();
      });

      return unsubscribe;
   }, [navigation, resetRoutine]);
}
