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
  FlatList,
  Dimensions,
  ActivityIndicator,
  SafeAreaView
} from "react-native";
import { useAuth } from "../Hooks/Auth";
import { getAuth, signInWithEmailAndPassword } from "firebase/auth";
import { getDatabase, ref, set, onValue } from "firebase/database";
import AsyncStorage from "@react-native-async-storage/async-storage";
import * as ImagePicker from "expo-image-picker";
import { getStorage, ref as sRef, uploadBytes, getDownloadURL } from "firebase/storage";
import Constants from "expo-constants";
import { useNavigation } from "@react-navigation/native";
import { LinearGradient } from 'expo-linear-gradient';
import { Ionicons } from '@expo/vector-icons';
import DateTimePicker from '@react-native-community/datetimepicker';

const { width, height } = Dimensions.get("window");
const statusBarHeight = Constants.statusBarHeight;

export function Inicial() {
  const { signOut } = useAuth();
  const auth = getAuth();
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [photo, setPhoto] = useState("");
  const [dependents, setDependents] = useState([]);
  const [newDependentName, setNewDependentName] = useState("");
  const [newDependentAvatar, setNewDependentAvatar] = useState("");
  const [newDependentBirthdate, setNewDependentBirthdate] = useState("");
  const [image, setImage] = useState(null);
  const [imageUrl, setImageUrl] = useState(null);
  const navigation = useNavigation();
  const [selectedDependent, setSelectedDependent] = useState(null);
  const [modalAddDependentVisible, setModalAddDependentVisible] = useState(false);
  const [modalSelectDependentVisible, setModalSelectDependentVisible] = useState(false);
  const [isLoading, setIsLoading] = useState(true);
  const [date, setDate] = useState(new Date());
  const [showDatePicker, setShowDatePicker] = useState(false);

  const games = [
    { id: "1", name: "Labirinto", screen: "JogoLabirinto", image: require("../Assets/IconeJogos/Labirinto.png"), color: "#FF9E7D" },
    { id: "2", name: "Rotinas Diárias", screen: "JogoRotinasDiarias", image: require("../Assets/IconeJogos/rotinas.png"), color: "#7DC8FF" },
    { id: "3", name: "Emoções", screen: "JogoEmocoes", image: require("../Assets/IconeJogos/Emocoes.png"), color: "#FF7D7D" },
    { id: "4", name: "Sequência", screen: "JogoSequencia", image: require("../Assets/IconeJogos/Sequencia.png"), color: "#A37DFF" },
    { id: "5", name: "Sons e Imagens", screen: "JogoSonsEImagens", image: require("../Assets/IconeJogos/SonsEImagens.png"), color: "#7DFF9E" },
    { id: "6", name: "Memória", screen: "JogoMemoria", image: require("../Assets/IconeJogos/Memoria.png"), color: "#FFD37D" }
  ];

  const formatDate = (date) => {
    return date.toLocaleDateString('pt-BR');
  };

  const onChangeDate = (event, selectedDate) => {
    const currentDate = selectedDate || date;
    setShowDatePicker(false);
    setDate(currentDate);
    setNewDependentBirthdate(formatDate(currentDate));
  };

  const inserirTudo = async (usuario) => {
    if (usuario) {
      setName(usuario.displayName || "Nome não disponível");
      setEmail(usuario.email || "E-mail não disponível");
      setPhoto(usuario.photoURL || "");
      loadDependents(usuario.uid);
    }
  };

  const loadDependents = (userId) => {
    const db = getDatabase();
    const dependentsRef = ref(db, `users/${userId}/dependents`);
    onValue(dependentsRef, (snapshot) => {
      const data = snapshot.val();
      if (data) {
        const dependentsList = Object.keys(data).map((key) => ({
          id: key,
          ...data[key],
          scores: data[key].scores || {},
        }));
        setDependents(dependentsList);
      } else {
        setDependents([]);
      }
    });
  };

  const selectDependent = (dependent) => {
    navigation.navigate("DetalhesDependente", { dependentId: dependent.id });
  };

  const addDependent = async () => {
    try {
      if (!newDependentName || !newDependentBirthdate) {
        Alert.alert("Erro", "Por favor, preencha o nome e a data de nascimento do dependente.");
        return;
      }

      const db = getDatabase();
      const downloadURL = await uploadImage();
      
      const validPath = new Date().toISOString().replace(/[:.]/g, "-");

      const newDependentRef = ref(
        db,
        `users/${auth.currentUser.uid}/dependents/${validPath}`
      );

      const newDependent = {
        nome: newDependentName,
        avatar: downloadURL || "",
        dataNascimento: newDependentBirthdate,
        scores: {},
      };

      await set(newDependentRef, newDependent);

      Alert.alert("Sucesso", "Dependente adicionado com sucesso!");

      setModalAddDependentVisible(false);
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

  const handleSelectDependent = (dependent) => {
    setSelectedDependent(dependent);
    setModalSelectDependentVisible(false);
  };

  const renderDependentItem = ({ item }) => (
    <TouchableOpacity
      style={styles.dependentItem}
      onPress={() => handleSelectDependent(item)}
    >
      {item.avatar ? (
        <Image source={{ uri: item.avatar }} style={styles.dependentImage} />
      ) : (
        <View style={styles.dependentImagePlaceholder}>
          <Ionicons name="person" size={24} color="#fff" />
        </View>
      )}
      <Text style={styles.dependentName}>{item.nome}</Text>
    </TouchableOpacity>
  );

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
    navigation.navigate(screen, { 
      dependentId: selectedDependent.id, 
      dependentName: selectedDependent.nome 
    });
  };

  useEffect(() => {
    const checkLogin = async () => {
      const rememberMe = await AsyncStorage.getItem("@rememberMe");
      const storedEmail = await AsyncStorage.getItem("@email");
      const storedPassword = await AsyncStorage.getItem("@senha");

      if (rememberMe === "true" && storedEmail && storedPassword) {
        const auth = getAuth();
        try {
          const userCredential = await signInWithEmailAndPassword(auth, storedEmail, storedPassword);
          inserirTudo(userCredential.user);
        } catch (error) {
          console.error("Erro no login automático:", error);
        }
      } else {
        if (!auth.currentUser) {
          signOut();
        }
      }
      setIsLoading(false);
      inserirTudo(auth.currentUser);
    };

    checkLogin();
  }, []);

  if (isLoading) {
    return (
      <View style={styles.loadingContainer}>
        <ActivityIndicator size="large" color="#3498db" />
      </View>
    );
  }

  return (
    <SafeAreaView style={styles.safeArea}>
      <LinearGradient
        colors={['#3498db', '#2c3e50']}
        style={styles.background}
      >
        <ScrollView contentContainerStyle={styles.container}>
          {/* Seção de Dependentes */}
          <View style={styles.sectionContainer}>
            <View style={styles.sectionHeader}>
              <Text style={styles.sectionTitle}>Meus Dependentes</Text>
              <TouchableOpacity 
                style={styles.addButton}
                onPress={() => setModalAddDependentVisible(true)}
              >
                <Ionicons name="add" size={24} color="#fff" />
              </TouchableOpacity>
            </View>
            
            {dependents.length > 0 ? (
              <FlatList
                data={dependents}
                horizontal
                showsHorizontalScrollIndicator={false}
                contentContainerStyle={styles.dependentsList}
                renderItem={({ item }) => (
                  <TouchableOpacity
                    key={item.id}
                    style={[
                      styles.dependentCard,
                      selectedDependent?.id === item.id && styles.selectedDependentCard
                    ]}
                    onPress={() => selectDependent(item)}
                  >
                    {item.avatar ? (
                      <Image source={{ uri: item.avatar }} style={styles.dependentCardImage} />
                    ) : (
                      <View style={styles.dependentCardImagePlaceholder}>
                        <Ionicons name="person" size={32} color="#fff" />
                      </View>
                    )}
                    <Text style={styles.dependentCardName}>{item.nome}</Text>
                    <Text style={styles.dependentCardBirthdate}>
                      {item.dataNascimento || 'Data não informada'}
                    </Text>
                  </TouchableOpacity>
                )}
                keyExtractor={item => item.id}
              />
            ) : (
              <View style={styles.noDependentsContainer}>
                <Ionicons name="people" size={48} color="#bdc3c7" />
                <Text style={styles.noDependentsText}>Nenhum dependente cadastrado</Text>
                <TouchableOpacity 
                  style={styles.addFirstButton}
                  onPress={() => setModalAddDependentVisible(true)}
                >
                  <Text style={styles.addFirstButtonText}>Adicionar Primeiro Dependente</Text>
                </TouchableOpacity>
              </View>
            )}
          </View>

          {/* Seção de Atividades */}
          <View style={styles.sectionContainer}>
            <View style={styles.sectionHeader}>
              <Text style={styles.sectionTitle}>Atividades</Text>
              <TouchableOpacity 
                style={styles.selectDependentButton}
                onPress={() => setModalSelectDependentVisible(true)}
              >
                {selectedDependent ? (
                  <>
                    {selectedDependent.avatar ? (
                      <Image 
                        source={{ uri: selectedDependent.avatar }} 
                        style={styles.selectedDependentImage} 
                      />
                    ) : (
                      <View style={styles.selectedDependentPlaceholder}>
                        <Ionicons name="person" size={20} color="#fff" />
                      </View>
                    )}
                    <Text style={styles.selectedDependentName} numberOfLines={1}>
                      {selectedDependent.nome}
                    </Text>
                  </>
                ) : (
                  <Text style={styles.selectDependentText}>Selecionar</Text>
                )}
              </TouchableOpacity>
            </View>
            
            <Text style={styles.sectionSubtitle}>Jogos educacionais para desenvolvimento</Text>
            
            <View style={styles.gamesGrid}>
              {games.map((game) => (
                <TouchableOpacity
                  key={game.id}
                  style={[styles.gameCard, { backgroundColor: game.color }]}
                  onPress={() => handleGamePress(game.screen)}
                  disabled={!selectedDependent}
                >
                  <View style={styles.gameImageContainer}>
                    <Image source={game.image} style={styles.gameImage} resizeMode="contain" />
                  </View>
                  <Text style={styles.gameName}>{game.name}</Text>
                </TouchableOpacity>
              ))}
            </View>
          </View>

          {/* Modal para adicionar dependente */}
          <Modal
            animationType="slide"
            transparent={true}
            visible={modalAddDependentVisible}
            onRequestClose={() => setModalAddDependentVisible(false)}
          >
            <View style={styles.modalOverlay}>
              <View style={styles.modalContainer}>
                <Text style={styles.modalTitle}>Adicionar Dependente</Text>
                
                <TouchableOpacity 
                  style={styles.avatarPicker} 
                  onPress={pickImage}
                >
                  {image ? (
                    <Image source={{ uri: image }} style={styles.avatarImage} />
                  ) : (
                    <View style={styles.avatarPlaceholder}>
                      <Ionicons name="camera" size={32} color="#3498db" />
                      <Text style={styles.avatarPlaceholderText}>Adicionar foto</Text>
                    </View>
                  )}
                </TouchableOpacity>
                
                <TextInput
                  placeholder="Nome completo"
                  placeholderTextColor="#95a5a6"
                  value={newDependentName}
                  onChangeText={setNewDependentName}
                  style={styles.modalInput}
                />
                
                <TouchableOpacity 
                  style={styles.modalInput}
                  onPress={() => setShowDatePicker(true)}
                >
                  <Text style={newDependentBirthdate ? styles.modalInputText : styles.modalInputPlaceholder}>
                    {newDependentBirthdate || "Data de nascimento"}
                  </Text>
                </TouchableOpacity>
                
                {showDatePicker && (
                  <DateTimePicker
                    value={date}
                    mode="date"
                    display="default"
                    onChange={onChangeDate}
                    maximumDate={new Date()}
                  />
                )}
                
                <View style={styles.modalButtons}>
                  <TouchableOpacity 
                    style={styles.modalCancelButton}
                    onPress={() => setModalAddDependentVisible(false)}
                  >
                    <Text style={styles.modalButtonText}>Cancelar</Text>
                  </TouchableOpacity>
                  
                  <TouchableOpacity 
                    style={styles.modalConfirmButton}
                    onPress={addDependent}
                  >
                    <Text style={styles.modalButtonText}>Salvar</Text>
                  </TouchableOpacity>
                </View>
              </View>
            </View>
          </Modal>

          {/* Modal para selecionar dependente */}
          <Modal
            animationType="slide"
            transparent={true}
            visible={modalSelectDependentVisible}
            onRequestClose={() => setModalSelectDependentVisible(false)}
          >
            <View style={styles.modalOverlay}>
              <View style={styles.modalContainer}>
                <Text style={styles.modalTitle}>Selecione um Dependente</Text>
                
                <FlatList
                  data={dependents}
                  renderItem={renderDependentItem}
                  keyExtractor={item => item.id}
                  contentContainerStyle={styles.dependentsModalList}
                  ListEmptyComponent={
                    <View style={styles.noDependentsModal}>
                      <Ionicons name="people" size={48} color="#bdc3c7" />
                      <Text style={styles.noDependentsModalText}>Nenhum dependente cadastrado</Text>
                    </View>
                  }
                />
                
                <TouchableOpacity 
                  style={styles.modalCloseButton}
                  onPress={() => setModalSelectDependentVisible(false)}
                >
                  <Text style={styles.modalButtonText}>Fechar</Text>
                </TouchableOpacity>
              </View>
            </View>
          </Modal>
        </ScrollView>
      </LinearGradient>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  safeArea: {
    flex: 1,
    backgroundColor: '#3498db',
  },
  background: {
    flex: 1,
  },
  container: {
    flexGrow: 1,
    paddingTop: statusBarHeight + 20,
    paddingBottom: 40,
    paddingHorizontal: 20,
  },
  loadingContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: '#3498db',
  },
  sectionContainer: {
    marginBottom: 30,
  },
  sectionHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 15,
  },
  sectionTitle: {
    fontSize: 22,
    fontWeight: '700',
    color: '#fff',
  },
  sectionSubtitle: {
    fontSize: 14,
    color: '#ecf0f1',
    marginBottom: 20,
    fontStyle: 'italic',
  },
  addButton: {
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: 'rgba(255,255,255,0.2)',
    justifyContent: 'center',
    alignItems: 'center',
  },
  dependentsList: {
    paddingVertical: 10,
  },
  dependentCard: {
    width: 150,
    backgroundColor: 'rgba(255,255,255,0.1)',
    borderRadius: 15,
    padding: 15,
    marginRight: 15,
    alignItems: 'center',
    borderWidth: 1,
    borderColor: 'rgba(255,255,255,0.2)',
  },
  selectedDependentCard: {
    backgroundColor: 'rgba(255,255,255,0.2)',
    borderColor: '#fff',
  },
  dependentCardImage: {
    width: 80,
    height: 80,
    borderRadius: 40,
    marginBottom: 10,
  },
  dependentCardImagePlaceholder: {
    width: 80,
    height: 80,
    borderRadius: 40,
    backgroundColor: 'rgba(255,255,255,0.2)',
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: 10,
  },
  dependentCardName: {
    fontSize: 16,
    fontWeight: '600',
    color: '#fff',
    textAlign: 'center',
    marginBottom: 5,
  },
  dependentCardBirthdate: {
    fontSize: 12,
    color: '#ecf0f1',
    textAlign: 'center',
  },
  noDependentsContainer: {
    backgroundColor: 'rgba(255,255,255,0.1)',
    borderRadius: 15,
    padding: 30,
    alignItems: 'center',
    justifyContent: 'center',
    borderWidth: 1,
    borderColor: 'rgba(255,255,255,0.2)',
  },
  noDependentsText: {
    fontSize: 16,
    color: '#ecf0f1',
    marginTop: 10,
    textAlign: 'center',
  },
  addFirstButton: {
    marginTop: 20,
    paddingVertical: 10,
    paddingHorizontal: 20,
    backgroundColor: '#fff',
    borderRadius: 20,
  },
  addFirstButtonText: {
    color: '#3498db',
    fontWeight: '600',
  },
  selectDependentButton: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: 'rgba(255,255,255,0.1)',
    borderRadius: 20,
    paddingVertical: 8,
    paddingHorizontal: 15,
  },
  selectedDependentImage: {
    width: 30,
    height: 30,
    borderRadius: 15,
    marginRight: 10,
  },
  selectedDependentPlaceholder: {
    width: 30,
    height: 30,
    borderRadius: 15,
    backgroundColor: 'rgba(255,255,255,0.2)',
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: 10,
  },
  selectedDependentName: {
    color: '#fff',
    fontSize: 14,
    fontWeight: '600',
    maxWidth: 100,
  },
  selectDependentText: {
    color: '#fff',
    fontSize: 14,
    fontWeight: '600',
  },
  gamesGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    justifyContent: 'space-between',
    marginBottom:25
  },
  gameCard: {
    width: '48%',
    aspectRatio: 1,
    borderRadius: 15,
    marginBottom: 15,
    padding: 15,
    justifyContent: 'space-between',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.2,
    shadowRadius: 4,
    elevation: 5,
  },
  gameImageContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  gameImage: {
    width: '70%',
    height: '70%',
  },
  gameName: {
    color: '#fff',
    fontSize: 16,
    fontWeight: '600',
    textAlign: 'center',
    marginTop: 10,
  },
  modalOverlay: {
    flex: 1,
    backgroundColor: 'rgba(0,0,0,0.5)',
    justifyContent: 'center',
    alignItems: 'center',
  },
  modalContainer: {
    width: '90%',
    maxWidth: 400,
    backgroundColor: '#fff',
    borderRadius: 15,
    padding: 25,
  },
  modalTitle: {
    fontSize: 20,
    fontWeight: '700',
    color: '#2c3e50',
    marginBottom: 20,
    textAlign: 'center',
  },
  avatarPicker: {
    alignSelf: 'center',
    marginBottom: 20,
  },
  avatarImage: {
    width: 100,
    height: 100,
    borderRadius: 50,
    borderWidth: 3,
    borderColor: '#3498db',
  },
  avatarPlaceholder: {
    width: 100,
    height: 100,
    borderRadius: 50,
    borderWidth: 3,
    borderColor: '#3498db',
    borderStyle: 'dashed',
    justifyContent: 'center',
    alignItems: 'center',
  },
  avatarPlaceholderText: {
    marginTop: 5,
    color: '#3498db',
    fontSize: 12,
  },
  modalInput: {
    height: 50,
    borderWidth: 1,
    borderColor: '#ecf0f1',
    borderRadius: 10,
    paddingHorizontal: 15,
    marginBottom: 15,
    justifyContent: 'center',
  },
  modalInputText: {
    color: '#2c3e50',
    fontSize: 16,
  },
  modalInputPlaceholder: {
    color: '#95a5a6',
    fontSize: 16,
  },
  modalButtons: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginTop: 10,
  },
  modalCancelButton: {
    flex: 1,
    backgroundColor: '#e74c3c',
    borderRadius: 10,
    padding: 15,
    marginRight: 10,
    alignItems: 'center',
  },
  modalConfirmButton: {
    flex: 1,
    backgroundColor: '#2ecc71',
    borderRadius: 10,
    padding: 15,
    alignItems: 'center',
  },
  modalCloseButton: {
    backgroundColor: '#3498db',
    borderRadius: 10,
    padding: 15,
    marginTop: 10,
    alignItems: 'center',
  },
  modalButtonText: {
    color: '#fff',
    fontSize: 16,
    fontWeight: '600',
  },
  dependentsModalList: {
    paddingVertical: 10,
  },
  dependentItem: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: 15,
    paddingHorizontal: 10,
    borderBottomWidth: 1,
    borderBottomColor: '#ecf0f1',
  },
  dependentImage: {
    width: 50,
    height: 50,
    borderRadius: 25,
    marginRight: 15,
  },
  dependentImagePlaceholder: {
    width: 50,
    height: 50,
    borderRadius: 25,
    backgroundColor: '#bdc3c7',
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: 15,
  },
  dependentName: {
    fontSize: 16,
    color: '#2c3e50',
    fontWeight: '500',
  },
  noDependentsModal: {
    padding: 30,
    alignItems: 'center',
    justifyContent: 'center',
  },
  noDependentsModalText: {
    fontSize: 16,
    color: '#7f8c8d',
    marginTop: 10,
    textAlign: 'center',
  },
});

export default Inicial;