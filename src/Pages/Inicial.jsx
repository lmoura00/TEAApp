import React, { useEffect, useState } from "react";
import {
  View,
  Text,
  TouchableOpacity,
  StyleSheet,
  Image,
  ScrollView,
  Modal,
  TextInput,
  Button,
  Alert,
  FlatList,
  Dimensions,
} from "react-native";
import { useAuth } from "../Hooks/Auth";
import { getAuth, signInWithEmailAndPassword } from "firebase/auth";
import { getDatabase, ref, set, onValue } from "firebase/database";
import AsyncStorage from "@react-native-async-storage/async-storage";
import * as ImagePicker from "expo-image-picker";
import {
  getStorage,
  ref as sRef,
  uploadBytes,
  getDownloadURL,
} from "firebase/storage";
import Constants from "expo-constants";
import { useNavigation } from "@react-navigation/native";

const statusBarHeight = Constants.statusBarHeight;

export function Inicial() {
  const { user, setUser, token, setToken, signOut } = useAuth();
  const auth = getAuth();
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [photo, setPhoto] = useState("");
  const [dependents, setDependents] = useState([]);
  const [selectedDependent, setSelectedDependent] = useState(null); // Estado para o dependente selecionado
  const [modalVisible, setModalVisible] = useState(false);
  const [newDependentName, setNewDependentName] = useState("");
  const [newDependentAvatar, setNewDependentAvatar] = useState("");
  const [newDependentBirthdate, setNewDependentBirthdate] = useState("");
  const [image, setImage] = useState(null);
  const [imageUrl, setImageUrl] = useState(null);
  const navigation = useNavigation();

  // Lista de jogos disponíveis
  const games = [
    { id: "1", name: "Labirinto", screen: "JogoLabirinto", image: require("../Assets/IconeJogos/Labirinto.png") },
    { id: "2", name: "Rotinas Diárias", screen: "JogoRotinasDiarias", image: require("../Assets/IconeJogos/rotinas.png") },
    { id: "3", name: "Emoções", screen: "JogoEmocoes", image: require("../Assets/IconeJogos/Emocoes.png") },
    { id: "4", name: "Sequência", screen: "JogoSequencia", image: require("../Assets/IconeJogos/Sequencia.png") },
    { id: "5", name: "Sons e Imagens", screen: "JogoSonsEImagens", image: require("../Assets/IconeJogos/SonsEImagens.png") },
    { id: "6", name: "Memória", screen: "JogoMemoria", image: require("../Assets/IconeJogos/Memoria.png") },
    { id: "7", name: "Caça Palavras", screen: "JogoCacaPalavras", image: require("../Assets/IconeJogos/CacaPalavras.png") },
  ];

  // Carregar dados do usuário e dependentes
  const inserirTudo = async (usuario) => {
    if (usuario) {
      setName(usuario.displayName || "Nome não disponível");
      setEmail(usuario.email || "E-mail não disponível");
      setPhoto(usuario.photoURL || "");
      loadDependents(usuario.uid);
    }
  };

  // Carregar dependentes do Firebase
  const loadDependents = (userId) => {
    const db = getDatabase();
    const dependentsRef = ref(db, `users/${userId}/dependents`);
    onValue(dependentsRef, (snapshot) => {
      const data = snapshot.val();
      if (data) {
        const dependentsList = Object.keys(data).map((key) => ({
          id: key,
          ...data[key],
          scores: data[key].scores || {}, // Carrega as pontuações
        }));
        setDependents(dependentsList);
      } else {
        setDependents([]);
      }
    });
  };

  // Selecionar dependente
  const selectDependent = (dependent) => {
    setSelectedDependent(dependent);
    Alert.alert("Dependente Selecionado", `Você selecionou ${dependent.nome}`);
  };

  // Adicionar dependente
  const addDependent = async () => {
    try {
      // Validação dos campos obrigatórios
      if (!newDependentName || !newDependentBirthdate) {
        Alert.alert("Erro", "Por favor, preencha o nome e a data de nascimento do dependente.");
        return;
      }
  
      const db = getDatabase();
      const downloadURL = await uploadImage();
  
      // Gera um ID único para o dependente
      const validPath = new Date().toISOString().replace(/[:.]/g, "-");
  
      const newDependentRef = ref(
        db,
        `users/${auth.currentUser.uid}/dependents/${validPath}`
      );
  
      // Cria o objeto do dependente
      const newDependent = {
        nome: newDependentName,
        avatar: downloadURL || "", // URL da imagem ou string vazia
        dataNascimento: newDependentBirthdate,
        scores: {}, // Inicializa sem pontuações
      };
  
      // Salva o dependente no Firebase
      await set(newDependentRef, newDependent);
  
      // Feedback para o usuário
      Alert.alert("Sucesso", "Dependente adicionado com sucesso!");
  
      // Limpa os campos do formulário
      setModalVisible(false);
      setNewDependentName("");
      setNewDependentAvatar("");
      setNewDependentBirthdate("");
      setImage(null);
      setImageUrl(null);
    } catch (error) {
      console.error("Erro ao adicionar dependente:", error);
      Alert.alert("Erro", "Ocorreu um erro ao adicionar o dependente.");
    }
  };
  // Upload da imagem do dependente
  const uploadImage = async () => {
    if (image) {
      const response = await fetch(image);
      const blob = await response.blob();
      const storageRef = sRef(
        getStorage(),
        `dependent_images/${
          auth.currentUser.uid
        }/${new Date().toISOString().replace(/[:.]/g, "-")}.jpg`
      );
      await uploadBytes(storageRef, blob);
      const downloadURL = await getDownloadURL(storageRef);
      setImageUrl(downloadURL);
      return downloadURL;
    }
    return null;
  };

  // Selecionar imagem da galeria
  const pickImage = async () => {
    let result = await ImagePicker.launchImageLibraryAsync({
      mediaTypes: ImagePicker.MediaTypeOptions.Images,
      allowsEditing: true,
      aspect: [4, 3],
      quality: 1,
    });

    if (!result.canceled) {
      setImage(result.assets[0].uri);
    }
  };

  // Navegar para o jogo com o dependente selecionado
  const handleGamePress = (screen) => {
    if (!selectedDependent) {
      Alert.alert("Selecione um Dependente", "Por favor, selecione um dependente antes de iniciar o jogo.");
      return;
    }
    console.log("Dependente selecionado ao navegar:", selectedDependent.id); // Depuração
    navigation.navigate(screen, { dependentId: selectedDependent.id }); // Passa o dependentId
  };

  // Efeito para carregar dados do usuário ao montar o componente
  useEffect(() => {
    const auth = getAuth();

    async function handleLogin() {
      const storedEmail = await AsyncStorage.getItem("@email");
      const storedPassword = await AsyncStorage.getItem("@senha");

      if (storedEmail && storedPassword) {
        try {
          const userCredential = await signInWithEmailAndPassword(
            auth,
            storedEmail,
            storedPassword
          );
          console.log("Usuário logado com sucesso:", userCredential.user.email);
          inserirTudo(userCredential.user);
        } catch (error) {
          console.error("Erro ao fazer login com e-mail e senha:", error);
        }
      } else {
        if (auth.currentUser) {
          inserirTudo(auth.currentUser);
        }
      }
    }

    if (auth.currentUser) {
      inserirTudo(auth.currentUser);
    } else {
      handleLogin();
    }
  }, []);

  return (
    <ScrollView style={styles.container}>
      <View style={styles.bloco}>
        <Text style={styles.title1}>DEPENDENTES</Text>
        {dependents.length > 0 ? (
          <View style={styles.dependentsContainer}>
            {dependents.map((item) => (
              <TouchableOpacity
                key={item.id}
                style={[
                  styles.dependentItem,
                  selectedDependent?.id === item.id && styles.selectedDependent,
                ]}
                onPress={() => selectDependent(item)}
              >
                {item.avatar && (
                  <Image
                    source={{ uri: item.avatar }}
                    style={styles.dependentImage}
                  />
                )}
                <Text style={styles.dependentName}>{item.nome}</Text>
                <Text style={styles.dependentBirthdate}>{item.dataNascimento}</Text>
                <Text style={styles.dependentScore}>
                  Pontuação: {JSON.stringify(item.scores)}
                </Text>
              </TouchableOpacity>
            ))}
          </View>
        ) : (
          <Text style={styles.noDependentsText}>
            Nenhum dependente cadastrado.
          </Text>
        )}
        <TouchableOpacity
          style={styles.addButton}
          onPress={() => setModalVisible(true)}
        >
          <Text style={styles.addButtonText}>Adicionar Dependente</Text>
        </TouchableOpacity>
      </View>

      {/* Modal para adicionar dependente */}
      <Modal
        animationType="slide"
        transparent={true}
        visible={modalVisible}
        onRequestClose={() => setModalVisible(false)}
      >
        <View style={styles.modalView}>
          <TextInput
            placeholder="Nome"
            value={newDependentName}
            onChangeText={setNewDependentName}
            style={styles.input}
          />
          <TextInput
            placeholder="Data de Nascimento"
            value={newDependentBirthdate}
            onChangeText={setNewDependentBirthdate}
            style={styles.input}
          />
          <TouchableOpacity onPress={pickImage} style={styles.botao3}>
            <Text style={styles.textBotao}>Selecione a foto do dependente</Text>
          </TouchableOpacity>
          {image && (
            <Image
              source={{ uri: image }}
              style={{
                width: 100,
                height: 100,
                alignSelf: "center",
                marginBottom: 20,
                marginTop: 20,
              }}
            />
          )}
          <Button title="Adicionar" onPress={addDependent} />
          <Button title="Cancelar" onPress={() => setModalVisible(false)} />
        </View>
      </Modal>

      {/* Lista de jogos */}
      <Text style={styles.title1}>ATIVIDADES</Text>
      <Text style={styles.subtitle}>Outras funções que desenvolvemos</Text>
      <View style={styles.activitiesContainer}>
        <FlatList
          data={games}
          numColumns={2}
          renderItem={({ item }) => (
            <TouchableOpacity
              style={styles.gameButton}
              onPress={() => handleGamePress(item.screen)}
            >
              <Image source={item.image} style={styles.gameImage} />
              <Text style={styles.gameText}>{item.name}</Text>
            </TouchableOpacity>
          )}
          keyExtractor={(item) => item.id}
          contentContainerStyle={styles.list}
        />
      </View>
    </ScrollView>
  );
}

// Estilos
const styles = StyleSheet.create({
  container: {
    flex: 1,
    paddingTop: statusBarHeight,
    backgroundColor: "#146ebb",
  },
  bloco: {
    backgroundColor: "#059e56",
    borderRadius: 8,
    width: "95%",
    alignSelf: "center",
    marginTop: 15,
    padding: 10,
  },
  dependentsContainer: {
    flexDirection: "row",
    flexWrap: "wrap",
    justifyContent: "space-between",
    marginTop: 10,
  },
  dependentItem: {
    width: "48%",
    backgroundColor: "#fff",
    borderRadius: 8,
    padding: 10,
    marginBottom: 10,
    alignItems: "center",
  },
  selectedDependent: {
    borderColor: "#146ebb",
    borderWidth: 2,
  },
  dependentImage: {
    width: 60,
    height: 60,
    borderRadius: 30,
    marginBottom: 10,
  },
  dependentName: {
    fontSize: 16,
    fontWeight: "bold",
    textAlign: "center",
  },
  dependentBirthdate: {
    fontSize: 14,
    color: "#666",
    textAlign: "center",
  },
  dependentScore: {
    fontSize: 12,
    color: "#888",
    textAlign: "center",
  },
  noDependentsText: {
    textAlign: "center",
    color: "#fff",
    marginTop: 10,
  },
  addButton: {
    marginTop: 10,
    backgroundColor: "#fff",
    padding: 10,
    borderRadius: 5,
    alignItems: "center",
  },
  addButtonText: {
    color: "#059e56",
    fontWeight: "bold",
  },
  modalView: {
    margin: 20,
    backgroundColor: "white",
    borderRadius: 20,
    padding: 35,
    alignItems: "center",
    shadowColor: "#000",
    shadowOffset: {
      width: 0,
      height: 2,
    },
    shadowOpacity: 0.25,
    shadowRadius: 4,
    elevation: 5,
  },
  input: {
    height: 40,
    borderColor: "gray",
    borderWidth: 1,
    marginBottom: 10,
    paddingHorizontal: 10,
    width: "100%",
  },
  activitiesContainer: {
    flex: 1,
    marginBottom: 155,
  },
  gameButton: {
    width: 150,
    backgroundColor: "#fff",
    borderRadius: 10,
    padding: 10,
    marginBottom: 10,
    alignItems: "center",
    marginHorizontal: 10,
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
  list: {
    justifyContent: "center",
    alignItems: "center",
  },
  subtitle: {
    color: "#fff",
    marginLeft: 25,
    fontSize: 15,
    fontStyle: "italic",
    marginBottom: 35,
  },
  title1: {
    color: "#fff",
    fontSize: 25,
    fontWeight: "bold",
    marginLeft: 10,
    marginBottom: 10,
  },
});

export default Inicial;