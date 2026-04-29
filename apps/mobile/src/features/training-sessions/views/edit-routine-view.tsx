import { View } from "react-native";
import { useLocalSearchParams } from "expo-router";
import { ActivityIndicator, Text } from "react-native-paper";

import useEditRutineView from "../hooks/use-edit-rutine-view";
import NewRoutineView from "./new-routine-view";

export default function EditRoutineView() {
   // Expo Router pasa el id desde /training-sessions/[id]/edit.
   const params = useLocalSearchParams<{ id?: string }>();
   const workoutPlanId = typeof params.id === "string" ? params.id : "";

   const { data, isLoading, isError } = useEditRutineView(workoutPlanId);
   
   if (isLoading) {
      return (
         <View>
            <ActivityIndicator />
         </View>
      );
   }

   if (isError || !data) {
      return (
         <View>
            <Text>No se pudo cargar la rutina.</Text>
         </View>
      );
   }

   return <NewRoutineView mode="edit" />;
}
