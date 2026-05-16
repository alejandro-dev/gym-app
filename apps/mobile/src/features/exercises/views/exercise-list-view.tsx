import { getMuscleGroupLabelEs } from '@gym-app/types';
import MaterialDesignIcons from '@react-native-vector-icons/material-design-icons';
import { Image } from 'expo-image';
import { router } from 'expo-router';
import { memo, useMemo, useState } from 'react';
import { Pressable, ScrollView, StyleSheet, View } from 'react-native';
import { Searchbar, ActivityIndicator, Text } from 'react-native-paper';

import { resolveApiImageUrl } from '@/services/api/media';
import { AUTH_COLORS, VIEW_COLORS } from '@/theme/colors';

import type { RoutineCatalogExercise } from '../../training-sessions/types';
import useExerciseListView from '../hooks/use-exercise-list-view';

const ExerciseListView = () => {
   const {
      exerciseSearch,
      filteredExercises,
      isLoading,
      isError,
      exercises,
      setExerciseSearch,
      handleSelectExercise,
   } = useExerciseListView();
   const [selectedGroup, setSelectedGroup] = useState<string>('Todos');

   const groupOptions = useMemo(() => {
      const unique = Array.from(
         new Set(filteredExercises.map((exercise) => getMuscleGroupLabelEs(exercise.muscleGroup))),
      );

      return ['Todos', ...unique.slice(0, 3)];
   }, [filteredExercises]);

   const visibleExercises = useMemo(() => {
      if (selectedGroup === 'Todos') return filteredExercises;

      return filteredExercises.filter(
         (exercise) => getMuscleGroupLabelEs(exercise.muscleGroup) === selectedGroup,
      );
   }, [filteredExercises, selectedGroup]);

   return (
      <View style={styles.screen}>
         <View style={styles.header}>
            <Pressable onPress={() => router.back()} style={styles.iconButton}>
               <MaterialDesignIcons color={VIEW_COLORS.onDark} name="arrow-left" size={20} />
            </Pressable>

            <View style={styles.headerCopy}>
               <Text style={styles.eyebrow}>ROUTINE EXERCISES</Text>
               <Text style={styles.title}>Añadir ejercicio</Text>
            </View>
         </View>

         <Searchbar
            value={exerciseSearch}
            onChangeText={setExerciseSearch}
            placeholder="Buscar ejercicio"
            iconColor="#6F7682"
            inputStyle={styles.searchInput}
            placeholderTextColor="#6F7682"
            style={styles.searchbar}
         />

         <View style={styles.filterRow}>
            {groupOptions.map((option) => {
               const isSelected = selectedGroup === option;

               return (
                  <Pressable
                     key={option}
                     onPress={() => setSelectedGroup(option)}
                     style={[styles.filterChip, isSelected && styles.filterChipActive]}
                  >
                     <Text style={[styles.filterText, isSelected && styles.filterTextActive]}>
                        {option}
                     </Text>
                  </Pressable>
               );
            })}
         </View>

         <View style={styles.sectionHeader}>
            <Text style={styles.sectionTitle}>Ejercicios populares</Text>
            <View style={styles.countBadge}>
               <Text style={styles.countBadgeText}>{visibleExercises.length}</Text>
            </View>
         </View>

         <ScrollView
            showsVerticalScrollIndicator={false}
            keyboardShouldPersistTaps="handled"
            contentContainerStyle={styles.exerciseList}
         >
            {visibleExercises.length > 0 ? (
               visibleExercises.map((exercise) => (
                  <ExercisePickerItem
                     key={exercise.id}
                     exercise={exercise}
                     isSelected={exercises.some((item) => item.exerciseId === exercise.id)}
                     onPress={() => handleSelectExercise(exercise)}
                  />
               ))
            ) : isLoading ? (
               <View style={styles.emptyState}>
                  <ActivityIndicator animating color={AUTH_COLORS.primary} />
               </View>
            ) : isError ? (
               <View style={styles.emptyState}>
                  <Text style={styles.emptyText}>No se pudieron cargar los ejercicios.</Text>
               </View>
            ) : (
               <View style={styles.emptyState}>
                  <Text style={styles.emptyText}>No hay ejercicios que coincidan con la búsqueda.</Text>
               </View>
            )}
         </ScrollView>
      </View>
   );
};

function ExercisePickerItem({
   exercise,
   isSelected,
   onPress,
}: {
   exercise: RoutineCatalogExercise;
   isSelected: boolean;
   onPress: () => void;
}) {
   const imageUri = resolveApiImageUrl(exercise.imageUrl);
   const initials = exercise.name
      .split(' ')
      .slice(0, 2)
      .map((part) => part.charAt(0))
      .join('')
      .toUpperCase();

   return (
      <Pressable
         disabled={isSelected}
         onPress={onPress}
         style={[styles.exerciseItem, isSelected && styles.exerciseItemSelected]}
      >
         {imageUri ? (
            <Image
               source={{ uri: imageUri }}
               style={[styles.exerciseImage, isSelected && styles.exerciseImageSelected]}
               contentFit="cover"
            />
         ) : (
            <View style={[styles.initialsBadge, isSelected && styles.initialsBadgeSelected]}>
               <Text style={[styles.initialsText, isSelected && styles.initialsTextSelected]}>
                  {initials}
               </Text>
            </View>
         )}

         <View style={styles.exerciseCopy}>
            <Text numberOfLines={1} style={[styles.exerciseName, isSelected && styles.exerciseNameSelected]}>
               {exercise.name}
            </Text>
            <Text numberOfLines={1} style={[styles.exerciseMeta, isSelected && styles.exerciseMetaSelected]}>
               {[
                  getMuscleGroupLabelEs(exercise.muscleGroup),
                  exercise.equipment,
                  exercise.isCompound ? 'Compuesto' : 'Aislado',
               ]
                  .filter(Boolean)
                  .join(' • ')}
            </Text>
         </View>

         <View style={[styles.addBadge, isSelected && styles.addBadgeSelected]}>
            <MaterialDesignIcons
               color={isSelected ? AUTH_COLORS.primaryForeground : '#FFFFFF'}
               name={isSelected ? 'check' : 'plus'}
               size={18}
            />
         </View>
      </Pressable>
   );
}

export default memo(ExerciseListView);

const styles = StyleSheet.create({
   addBadge: {
      alignItems: 'center',
      backgroundColor: '#211F26',
      borderRadius: 12,
      height: 28,
      justifyContent: 'center',
      width: 28,
   },
   addBadgeSelected: {
      backgroundColor: AUTH_COLORS.primary,
   },
   countBadge: {
      backgroundColor: '#FFFFFF',
      borderRadius: 999,
      minWidth: 24,
      paddingHorizontal: 7,
      paddingVertical: 3,
   },
   countBadgeText: {
      color: '#111111',
      fontFamily: 'monospace',
      fontSize: 10,
      fontWeight: '800',
      textAlign: 'center',
   },
   emptyState: {
      alignItems: 'center',
      justifyContent: 'center',
      minHeight: 160,
      paddingHorizontal: 24,
   },
   emptyText: {
      color: '#9EA3AD',
      textAlign: 'center',
   },
   exerciseCopy: {
      flex: 1,
      gap: 2,
   },
   exerciseItem: {
      alignItems: 'center',
      backgroundColor: '#181A20',
      borderColor: '#2A2E36',
      borderRadius: 16,
      borderWidth: 1,
      flexDirection: 'row',
      gap: 12,
      minHeight: 54,
      paddingHorizontal: 12,
      paddingVertical: 10,
   },
   exerciseItemSelected: {
      backgroundColor: '#261B11',
      borderColor: AUTH_COLORS.primary,
   },
   exerciseImage: {
      backgroundColor: '#E7E6E0',
      borderRadius: 12,
      height: 42,
      width: 42,
   },
   exerciseImageSelected: {
      opacity: 0.92,
   },
   exerciseList: {
      gap: 10,
      paddingBottom: 28,
   },
   exerciseMeta: {
      color: '#6F7682',
      fontSize: 10,
      lineHeight: 14,
   },
   exerciseMetaSelected: {
      color: '#B8BCC6',
   },
   exerciseName: {
      color: '#FFFFFF',
      fontSize: 14,
      fontWeight: '800',
   },
   exerciseNameSelected: {
      color: AUTH_COLORS.primary,
   },
   eyebrow: {
      color: AUTH_COLORS.primary,
      fontFamily: 'monospace',
      fontSize: 10,
      fontWeight: '700',
      letterSpacing: 0.8,
   },
   filterChip: {
      backgroundColor: '#211F26',
      borderColor: '#34303A',
      borderRadius: 999,
      borderWidth: 1,
      paddingHorizontal: 10,
      paddingVertical: 7,
   },
   filterChipActive: {
      backgroundColor: AUTH_COLORS.primary,
      borderColor: AUTH_COLORS.primary,
   },
   filterRow: {
      flexDirection: 'row',
      flexWrap: 'wrap',
      gap: 8,
   },
   filterText: {
      color: '#B8BCC6',
      fontSize: 10,
      fontWeight: '700',
   },
   filterTextActive: {
      color: AUTH_COLORS.primaryForeground,
   },
   header: {
      alignItems: 'center',
      flexDirection: 'row',
      gap: 12,
      height: 48,
      marginBottom: 6,
   },
   headerCopy: {
      flex: 1,
      gap: 2,
   },
   iconButton: {
      alignItems: 'center',
      backgroundColor: '#211F26',
      borderRadius: 18,
      height: 36,
      justifyContent: 'center',
      width: 36,
   },
   initialsBadge: {
      alignItems: 'center',
      backgroundColor: '#2A2E36',
      borderRadius: 12,
      height: 34,
      justifyContent: 'center',
      width: 34,
   },
   initialsBadgeSelected: {
      backgroundColor: AUTH_COLORS.primary,
   },
   initialsText: {
      color: '#FFFFFF',
      fontFamily: 'monospace',
      fontSize: 12,
      fontWeight: '800',
   },
   initialsTextSelected: {
      color: AUTH_COLORS.primaryForeground,
   },
   screen: {
      flex: 1,
      gap: 12,
      paddingTop: 12,
   },
   searchbar: {
      backgroundColor: '#181A20',
      borderColor: '#2A2E36',
      borderRadius: 14,
      borderWidth: 1,
      height: 48,
   },
   searchInput: {
      color: '#FFFFFF',
      fontSize: 14,
      minHeight: 0,
   },
   sectionHeader: {
      alignItems: 'center',
      flexDirection: 'row',
      justifyContent: 'space-between',
      marginTop: 2,
   },
   sectionTitle: {
      color: '#FFFFFF',
      fontSize: 18,
      fontWeight: '800',
   },
   title: {
      color: '#FFFFFF',
      fontSize: 28,
      fontWeight: '800',
   },
});
