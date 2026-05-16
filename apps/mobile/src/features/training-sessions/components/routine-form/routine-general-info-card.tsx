import { memo } from 'react';
import { StyleSheet, View } from 'react-native';
import { Card, Text, TextInput } from 'react-native-paper';

interface RoutineGeneralInfoCardProps {
   name: string;
   description: string;
   onNameChange: (name: string) => void;
   onDescriptionChange: (description: string) => void;
}

// Componente para mostrar, añadir o actualizar los datos generales de la rutina.
const RoutineGeneralInfoCard = ({
   name,
   description,
   onNameChange,
   onDescriptionChange,
}: RoutineGeneralInfoCardProps) => (
   <Card mode="contained" style={styles.card}>
      <Card.Content style={styles.cardContent}>
         <View style={styles.sectionHeader}>
            <Text variant="titleMedium" style={styles.sectionTitle}>
               Datos generales
            </Text>
         </View>

         <TextInput
            mode="outlined"
            label="Nombre"
            value={name}
            onChangeText={onNameChange}
            placeholder="Ej. Push Pull Legs"
            outlineStyle={styles.inputOutline}
            contentStyle={styles.inputContent}
            left={<TextInput.Icon icon="dumbbell" />}
         />

         <TextInput
            mode="outlined"
            label="Descripción"
            value={description}
            onChangeText={onDescriptionChange}
            placeholder="Objetivo del bloque, contexto y notas globales."
            multiline
            numberOfLines={4}
            outlineStyle={styles.inputOutline}
            contentStyle={[styles.inputWithoutIconContent, styles.textareaContent]}
         />
      </Card.Content>
   </Card>
);

export default memo(RoutineGeneralInfoCard);

const styles = StyleSheet.create({
   card: {
      borderRadius: 26,
      borderCurve: 'continuous',
   },
   cardContent: {
      gap: 16,
      paddingVertical: 18,
   },
   sectionHeader: {
      flexDirection: 'row',
      alignItems: 'center',
      justifyContent: 'space-between',
      gap: 12,
   },
   sectionTitle: {
      fontWeight: '800',
   },
   sectionHint: {
      color: '#737373',
      lineHeight: 18,
   },
   inputOutline: {
      borderRadius: 18,
      borderCurve: 'continuous',
   },
   inputContent: {
      paddingHorizontal: 4,
   },
   inputWithoutIconContent: {
      paddingLeft: 16,
   },
   textareaContent: {
      minHeight: 104,
      paddingTop: 12,
   },
});
