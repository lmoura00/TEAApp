import React, { useState, useEffect } from "react";
import {
  View,
  Text,
  Image,
  StyleSheet,
  TouchableOpacity,
  FlatList,
  Dimensions,
  Modal,
  ScrollView,
  Alert,
} from "react-native";
import { useNavigation, useRoute } from "@react-navigation/native";
import Constants from "expo-constants";
import { getDatabase, ref, onValue } from "firebase/database";
import { getAuth } from "firebase/auth";

const statusBarHeight = Constants.statusBarHeight;
const { width } = Dimensions.get("window");
const numColumns = 2; // Número de colunas na grade

function Jogos() {
  const navigation = useNavigation();
  const route = useRoute();
  const [modalVisible, setModalVisible] = useState(false); // Estado para controlar a visibilidade do modal
  const [dependents, setDependents] = useState([]); // Lista de dependentes
  const [selectedDependent, setSelectedDependent] = useState(null); // Dependente selecionado
  const auth = getAuth();

  // Lista de jogos disponíveis
  const games = [
    { id: "1", name: "Labirinto", screen: "JogoLabirinto", image: require("../Assets/IconeJogos/Labirinto.png") },
    { id: "2", name: "Rotinas Diárias", screen: "JogoRotinasDiarias", image: require("../Assets/IconeJogos/rotinas.png") },
    { id: "3", name: "Emoções", screen: "JogoEmocoes", image: require("../Assets/IconeJogos/Emocoes.png") },
    { id: "4", name: "Sequência", screen: "JogoSequencia", image: require("../Assets/IconeJogos/Sequencia.png") },
    { id: "5", name: "Sons e Imagens", screen: "JogoSonsEImagens", image: require("../Assets/IconeJogos/SonsEImagens.png") },
    { id: "6", name: "Memória", screen: "JogoMemoria", image: require("../Assets/IconeJogos/Memoria.png") },
    //{ id: "7", name: "Caça Palavras", screen: "JogoCacaPalavras", image: require("../Assets/IconeJogos/CacaPalavras.png") },
  ];

  // Carregar dependentes do Firebase
  useEffect(() => {
    const db = getDatabase();
    const userId = auth.currentUser.uid;
    const dependentsRef = ref(db, `users/${userId}/dependents`);

    onValue(dependentsRef, (snapshot) => {
      const data = snapshot.val();
      if (data) {
        const dependentsList = Object.keys(data).map((key) => ({
          id: key,
          ...data[key],
        }));
        setDependents(dependentsList);
      } else {
        setDependents([]);
      }
    });
  }, []);

  // Selecionar dependente
  const handleSelectDependent = (dependent) => {
    setSelectedDependent(dependent);
    setModalVisible(false); // Fechar o modal após selecionar
  };

  // Renderizar item da lista de dependentes no modal
  const renderDependentItem = ({ item }) => (
    <TouchableOpacity
      style={styles.dependentItem}
      onPress={() => handleSelectDependent(item)}
    >
      {item.avatar && (
        <Image source={{ uri: item.avatar }} style={styles.dependentImage} />
      )}
      <Text style={styles.dependentName}>{item.nome}</Text>
    </TouchableOpacity>
  );

  // Renderizar item da lista de jogos
  const renderGameItem = ({ item }) => (
    <TouchableOpacity
      style={styles.gameButton}
      onPress={() => {
        if (!selectedDependent) {
          Alert.alert("Selecione um Dependente", "Por favor, selecione um dependente antes de iniciar o jogo.");
          return;
        }
        navigation.navigate(item.screen, { dependentId: selectedDependent.id });
      }}
    >
      <Image source={item.image} style={styles.gameImage} />
      <Text style={styles.gameText}>{item.name}</Text>
    </TouchableOpacity>
  );

  return (
    <View style={styles.container}>

      <View style={styles.header}>
        <TouchableOpacity onPress={() => setModalVisible(true)}>
          {selectedDependent ? (
            <Image
              source={{ uri: selectedDependent.avatar }}
              style={styles.selectedDependentImage}
            />
          ) : (
            <View style={styles.placeholderImage}>
              <Text style={styles.placeholderText}>Selecione</Text>
            </View>
          )}
        </TouchableOpacity>
        <Text style={styles.title}>Jogos Disponíveis</Text>
      </View>

      {/* Modal para selecionar dependente */}
      <Modal
        animationType="slide"
        transparent={true}
        visible={modalVisible}
        onRequestClose={() => setModalVisible(false)}
      >
        <View style={styles.modalContainer}>
          <View style={styles.modalContent}>
            <Text style={styles.modalTitle}>Selecione um Dependente</Text>
            <FlatList
              data={dependents}
              renderItem={renderDependentItem}
              keyExtractor={(item) => item.id}
              contentContainerStyle={styles.modalList}
            />
            <TouchableOpacity
              style={styles.closeButton}
              onPress={() => setModalVisible(false)}
            >
              <Text style={styles.closeButtonText}>Fechar</Text>
            </TouchableOpacity>
          </View>
        </View>
      </Modal>

      {/* Lista de jogos */}
      <FlatList
        data={games}
        renderItem={renderGameItem}
        keyExtractor={(item) => item.id}
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
    paddingBottom: 75,
  },
  header: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    marginVertical: 20,
    marginTop:-30
  },
  selectedDependentImage: {
    width: 50,
    height: 50,
    borderRadius: 25,
    marginRight: 10,
  },
  placeholderImage: {
    width: 50,
    height: 50,
    borderRadius: 25,
    backgroundColor: "#ccc",
    justifyContent: "center",
    alignItems: "center",
    marginRight: 10,
  },
  placeholderText: {
    color: "#fff",
    fontSize: 12,
  },
  title: {
    fontSize: 24,
    fontWeight: "bold",
    color: "#fff",
  },
  modalContainer: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
    backgroundColor: "rgba(0, 0, 0, 0.5)",
  },
  modalContent: {
    width: "80%",
    backgroundColor: "#fff",
    borderRadius: 10,
    padding: 20,
  },
  modalTitle: {
    fontSize: 18,
    fontWeight: "bold",
    marginBottom: 10,
    textAlign: "center",
  },
  modalList: {
    flexGrow: 1,
  },
  dependentItem: {
    flexDirection: "row",
    alignItems: "center",
    padding: 10,
    borderBottomWidth: 1,
    borderBottomColor: "#ccc",
  },
  dependentImage: {
    width: 40,
    height: 40,
    borderRadius: 20,
    marginRight: 10,
  },
  dependentName: {
    fontSize: 16,
  },
  closeButton: {
    marginTop: 10,
    backgroundColor: "#146ebb",
    padding: 10,
    borderRadius: 5,
    alignItems: "center",
  },
  closeButtonText: {
    color: "#fff",
    fontWeight: "bold",
  },
  list: {
    justifyContent: "center",
    marginBottom:80,
    paddingBottom:50
  },
  gameButton: {
    width: (width / numColumns) - 20,
    margin: 10,
    backgroundColor: "#fff",
    borderRadius: 10,
    alignItems: "center",
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
    color: "#333",
    textAlign: "center",
  },
});

export default Jogos;