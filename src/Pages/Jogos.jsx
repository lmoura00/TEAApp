import React from "react";
import { View, Text, Image, StyleSheet, TouchableOpacity, FlatList, Dimensions } from "react-native";
import { useNavigation } from "@react-navigation/native";
import Constants from "expo-constants";

const statusBarHeight = Constants.statusBarHeight;
const { width } = Dimensions.get('window');
const numColumns = 2; // Número de colunas na grade

function Jogos() {
  const navigation = useNavigation();
  const games = [
    { id: "1", name: "Labirinto", screen: "JogoLabirinto", image: require("../Assets/IconeJogos/Labirinto.png") },
    { id: "2", name: "Rotinas Diárias", screen: "JogoRotinasDiarias", image: require("../Assets/IconeJogos/rotinas.png") },
    { id: "3", name: "Emoções", screen: "JogoEmocoes", image: require("../Assets/IconeJogos/Emocoes.png") },
    { id: "4", name: "Sequência", screen: "JogoSequencia", image: require("../Assets/IconeJogos/Sequencia.png") },
    { id: "5", name: "Sons e Imagens", screen: "JogoSonsEImagens", image: require("../Assets/IconeJogos/SonsEImagens.png") },
    { id: "6", name: "Memória", screen: "JogoMemoria", image: require("../Assets/IconeJogos/Memoria.png") },
    { id: "7", name: "Caça Palavras", screen: "JogoCacaPalavras", image: require("../Assets/IconeJogos/CacaPalavras.png") },
  ];

  const renderItem = ({ item }) => (
    <TouchableOpacity
      style={styles.gameButton}
      onPress={() => navigation.navigate(item.screen)}
    >
      <Image source={item.image} style={styles.gameImage} />
      <Text style={styles.gameText}>{item.name}</Text>
    </TouchableOpacity>
  );

  return (
    <View style={styles.container}>
      <Text style={styles.title}>Jogos Disponíveis</Text>
      <FlatList
        data={games}
        renderItem={renderItem}
        keyExtractor={item => item.id}
        numColumns={numColumns}
        contentContainerStyle={styles.list}
      />
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    paddingTop: statusBarHeight,
    backgroundColor: "#146ebb",
    paddingBottom:25,
    marginTop:-50
  },
  title: {
    fontSize: 24,
    fontWeight: 'bold',
    color: '#fff',
    textAlign: 'center',
    marginVertical: 20,
  },
  list: {
    justifyContent: 'center',
    marginBottom:85,
    paddingBottom:85
  },
  gameButton: {
    width: (width / numColumns) - 20,
    margin: 10,
    backgroundColor: '#fff',
    borderRadius: 10,
    alignItems: 'center',
    padding: 10,
    elevation: 2,
  },
  gameImage: {
    width: 80,
    height: 80,
    marginBottom: 10,
  },
  gameText: {
    fontSize: 16,
    color: '#333',
    textAlign: 'center',
  },
});

export default Jogos;