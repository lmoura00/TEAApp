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
    { id: "6", name: "Memória", screen: "JogoMemoria", image: require("../Assets/IconeJogos/Memoria.png") }
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
    navigation.navigate("DetalhesDependente", { dependentId: dependent.id }); // Redireciona para a tela de detalhes
  };

  // Adicionar dependente
  const addDependent = async () => {
    try {
 
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

  const handleGamePress = (screen) => {
    if (!selectedDependent) {
      Alert.alert("Selecione um Dependente", "Por favor, selecione um dependente antes de iniciar o jogo.");
      return;
    }
    console.log("Dependente selecionado ao navegar:", selectedDependent.id);
    navigation.navigate(screen, { dependentId: selectedDependent.id });
  };

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
                style={styles.dependentItem}
                onPress={() => selectDependent(item)} // Redireciona para a tela de detalhes
              >
                {item.avatar && (
                  <Image
                    source={{ uri: item.avatar }}
                    style={styles.dependentImage}
                  />
                )}
                <Text style={styles.dependentName}>{item.nome}</Text>
                <Text style={styles.dependentBirthdate}>{item.dataNascimento}</Text>

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
          <Text style={styles.modalTitle}>Adicionar Dependente</Text>
          <TextInput
            placeholder="Nome"
            value={newDependentName}
            onChangeText={setNewDependentName}
            style={styles.input}
            placeholderTextColor={'#fff'}
            
          />
          <TextInput
            placeholder="Data de Nascimento"
            value={newDependentBirthdate}
            onChangeText={setNewDependentBirthdate}
            style={styles.input}
            placeholderTextColor={'#fff'}
          />
          <TouchableOpacity onPress={pickImage} style={styles.botao3}>
            <Text style={styles.textBotao3}>Selecione a foto do dependente</Text>
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
                borderRadius:50,
                borderWidth:2,
                borderColor:"rgb(20, 110, 187)"
              }}
            />
          )}
          <View style={styles.modalButtons}>
            <TouchableOpacity onPress={addDependent} style={styles.addButtonModal}>
              <Text style={styles.addButtonTextModal}>Adicionar</Text>
            </TouchableOpacity>
            <TouchableOpacity onPress={() => setModalVisible(false)} style={styles.cancelButton}>
              <Text style={styles.cancelButtonText}>Cancelar</Text>
            </TouchableOpacity>
          </View>
        </View>
      </Modal>

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
    backgroundColor: "rgb(20, 110, 187)",
    borderColor: "rgb(13, 59, 99)",
    borderWidth:2,
    borderRadius: 20,
    padding: 35,
    top:95,
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
  modalTitle: {
    fontSize: 24,
    marginBottom: 20,
    color: "#fff",
    fontWeight: "bold", 
  },
  input: {
    height: 40,
    borderColor: "rgb(240, 240, 240)",
    borderWidth: 1,
    marginBottom: 10,
    paddingHorizontal: 10,
    width: "100%",
    borderRadius:8,
    color:'#fff',
    fontSize:16,
    
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
  botao3: {
    backgroundColor: "#059e56",
    borderRadius: 8,
    width: "95%",
    alignSelf: "center",
    marginTop: 15,
    padding: 10,
    elevation:10
  },
  textBotao3: {
    color: "#fff",
    fontSize: 16,
    fontWeight: "bold",
    textAlign: "center",

  },
  modalButtons: {
    flexDirection: "row",
    justifyContent: "space-between",
    marginTop: 20,
    width: "100%",
  },
  modalButton: {
    flex: 1,
    padding: 10,
    borderRadius: 5,
  },
  modalButtonText: {
    color: "#fff",
    fontWeight: "bold",
    textAlign: "center",
  },
  addButtonModal: {
    marginTop: 10,
    backgroundColor: "rgb(0, 157, 87)",
    padding: 10,
    borderRadius: 5,
    alignItems: "center",
    elevation:10
  },
  addButtonTextModal: {
    color: "rgb(235, 235, 235)",
    fontWeight: "bold",
    fontSize:16
  },
  cancelButton: {
    marginTop: 10,
    backgroundColor: "rgb(255, 0, 0)",
    padding: 10,
    borderRadius: 5,
    alignItems: "center",
    elevation:10
  },
  cancelButtonText: {
    color: "rgb(255, 255, 255)",
    fontWeight: "bold",
    fontSize:16
  },
});

export default Inicial;