import React from "react";
import { View, Text, Image, StyleSheet, TouchableOpacity } from "react-native";
import { useNavigation } from "@react-navigation/native";
import Constants from "expo-constants";
const statusBarHeight = Constants.statusBarHeight;
function Jogos() {
  const navigation = useNavigation();
  const games = [
    { id: "1", name: "Labirinto", screen: "JogoLabirinto" },
    { id: "2", name: "Rotinas Diárias", screen: "JogoRotinasDiarias" },
    { id: "3", name: "Emoções", screen: "JogoEmocoes" },
    { id: "4", name: "Sequência", screen: "JogoSequencia" },
    { id: "5", name: "Sons e Imagens", screen: "JogoSonsEImagens" },
  ];
  return (
    <View
      style={{
        backgroundColor: "#146ebb",
        flex: 1,
        paddingTop: statusBarHeight,
      }}
    >
      <Text style={styles.title}>Jogos Disponíveis</Text>
      {games.map((game) => (
        <TouchableOpacity
          key={game.id}
          style={styles.gameButton}
          onPress={() => navigation.navigate(game.screen)}
        >
          <Text style={styles.gameText}>{game.name}</Text>
        </TouchableOpacity>
      ))}
    </View>
  );
}
const styles = StyleSheet.create({
    container: {
      flex: 1,
      padding: 20,
      backgroundColor: '#f5f5f5',
    },
    title: {
      fontSize: 24,
      fontWeight: 'bold',
      color: '#333',
      marginBottom: 20,
    },
    gameButton: {
      padding: 15,
      backgroundColor: '#fff',
      borderRadius: 10,
      marginBottom: 10,
      elevation: 2,
    },
    gameText: {
      fontSize: 16,
      color: '#333',
    },
  });

export default Jogos;
