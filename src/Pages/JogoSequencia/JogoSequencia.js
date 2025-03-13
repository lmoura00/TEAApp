// App.js
import React from 'react';
import { SafeAreaView, StyleSheet } from 'react-native';
import SequenceGame from './components/JogoSequencia';

export function JogoSequencia() {
  return (
    <SafeAreaView style={styles.container}>
      <SequenceGame />
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#fff',
  },
});