
import React from 'react';
import { StyleSheet, View } from 'react-native';
import EmotionGame from './components/EmotionGame';
import Constants from 'expo-constants'
const statusBarHeight = Constants.statusBarHeight
export function JogoEmocoes() {
  return (
    <View style={styles.container}>
      <EmotionGame />
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    paddingTop:statusBarHeight,
    backgroundColor: '#fff',
    alignItems: 'center',
    justifyContent: 'center',
  },
});