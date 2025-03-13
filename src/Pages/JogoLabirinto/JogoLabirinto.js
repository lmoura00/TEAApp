import React from 'react';
import { NavigationContainer } from '@react-navigation/native';
import { createNativeStackNavigator } from '@react-navigation/native-stack';
import HomeScreen from './screens/HomeScreen';
import GameScreen from './screens/GameScreen';

const Stack = createNativeStackNavigator()

const JogoLabirinto = () => {
  return (

        
      <Stack.Navigator initialRouteName="Home">
        <Stack.Screen name="Home" component={HomeScreen} options={{headerShown:false}} />
        <Stack.Screen name="Game" component={GameScreen}  options={{headerShown:false}}/>
      </Stack.Navigator>

  );
};

export default JogoLabirinto;