import { memo, useState } from "react";
import { StyleSheet } from 'react-native';
import {
   Text,
   Avatar,
   Button,
   Card,
   List,
   useTheme,
   Tooltip,
   Appbar,
} from 'react-native-paper';

const TrainingSessionsView = () => {
   const [expanded, setExpanded] = useState<boolean>(true);

   const _handlePress = () => {
      setExpanded(!expanded);
   };

   return (
      <>
         <List.Section 
            title="Rutinas" 
            titleStyle={styles.sectionTitle}
         >
            <Button
               mode="contained"
               contentStyle={[
                  styles.buttonContent,
                  { backgroundColor: useTheme().colors.onPrimary },
               ]}
               labelStyle={styles.buttonLabel}
               style={styles.button}
            >
               Nueva rutina
            </Button>

            <List.Accordion
               expanded={expanded}
               onPress={_handlePress}
               title="Mis rutinas (1)"
               style={styles.accordion}
               contentStyle={styles.accordionContent}
               titleStyle={[
                  styles.accordionTitle,
                  { color: '#cbd5e1' }
               ]}
               rippleColor="transparent"
            >
               <Card
                  style={styles.card}
                  mode="outlined"
               >
                  <Card.Title
                     title="Push"
                     right={(props) => <Tooltip title="More options">
                     <Appbar.Action icon='dots-horizontal' onPress={() => {}} />
                  </Tooltip>}
                  />
                  
                  <Card.Content>
                     <Text>
                     Pecho, hombro y triceps.
                     </Text>
                  </Card.Content>
               </Card>
            </List.Accordion>
         </List.Section>
      </>
      
   );
};

export default memo(TrainingSessionsView);

const styles = StyleSheet.create({
   button: {
      borderRadius: 18,
      borderCurve: 'continuous',
   },
   buttonContent: {
      minHeight: 54,
   },
   buttonLabel: {
      fontSize: 16,
      fontWeight: '600',
      color: '#fff',
   },
   sectionTitle: {
      fontSize: 18,
      fontWeight: '700',
      color: '#fff',
      paddingLeft: 0,
   },
   accordion: {
      paddingLeft: 0,
      marginLeft: 0,
   },
   accordionContent: {
      paddingLeft: 0,
      marginLeft: 0,
   },
   accordionTitle: {
      fontSize: 16,
      marginLeft: 0,
   },
   card: {
      margin: 0,
  },
});