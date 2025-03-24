import React from "react";
import { NavigationContainer, useRoute } from "@react-navigation/native";
import { createNativeStackNavigator} from "@react-navigation/native-stack";
import SequenceGame from "./components/JogoSequencia";

const Stack = createNativeStackNavigator();

export function JogoSequencia() {
    const route = useRoute();
  return (

      <Stack.Navigator initialRouteName="SequenceGame">
        <Stack.Screen
          name="SequenceGame"
          component={SequenceGame}
          initialParams={{ dependentId: route.params?.dependentId, dependentName: route.params?.dependentName }}
        />
      </Stack.Navigator>

  );
}
