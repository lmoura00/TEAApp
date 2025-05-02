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
  SafeAreaView,
  Animated,
  Easing
} from "react-native";
import { useNavigation, useRoute } from "@react-navigation/native";
import Constants from "expo-constants";
import { getDatabase, ref, onValue } from "firebase/database";
import { getAuth } from "firebase/auth";
import { LinearGradient } from 'expo-linear-gradient';
import { Ionicons } from '@expo/vector-icons';
import LottieView from 'lottie-react-native';

const statusBarHeight = Constants.statusBarHeight;
const { width, height } = Dimensions.get("window");
const numColumns = 2;

function Jogos() {
  const navigation = useNavigation();
  const route = useRoute();
  const [modalVisible, setModalVisible] = useState(false);
  const [dependents, setDependents] = useState([]);
  const [selectedDependent, setSelectedDependent] = useState(null);
  const [animation] = useState(new Animated.Value(0));
  const auth = getAuth();

  const games = [
    { id: "1", name: "Labirinto", screen: "JogoLabirinto", image: require("../Assets/IconeJogos/Labirinto.png"), color: "#FF9E7D" },
    { id: "2", name: "Rotinas Diárias", screen: "JogoRotinasDiarias", image: require("../Assets/IconeJogos/rotinas.png"), color: "#7DC8FF" },
    { id: "3", name: "Emoções", screen: "JogoEmocoes", image: require("../Assets/IconeJogos/Emocoes.png"), color: "#FF7D7D" },
    { id: "4", name: "Sequência", screen: "JogoSequencia", image: require("../Assets/IconeJogos/Sequencia.png"), color: "#A37DFF" },
    { id: "5", name: "Sons e Imagens", screen: "JogoSonsEImagens", image: require("../Assets/IconeJogos/SonsEImagens.png"), color: "#7DFF9E" },
    { id: "6", name: "Memória", screen: "JogoMemoria", image: require("../Assets/IconeJogos/Memoria.png"), color: "#FFD37D" },
  ];

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

    // Animação de pulso para o seletor de dependente
    Animated.loop(
      Animated.sequence([
        Animated.timing(animation, {
          toValue: 1,
          duration: 1000,
          easing: Easing.inOut(Easing.ease),
          useNativeDriver: true,
        }),
        Animated.timing(animation, {
          toValue: 0,
          duration: 1000,
          easing: Easing.inOut(Easing.ease),
          useNativeDriver: true,
        }),
      ])
    ).start();
  }, []);

  const scale = animation.interpolate({
    inputRange: [0, 1],
    outputRange: [1, 1.05],
  });

  const handleSelectDependent = (dependent) => {
    setSelectedDependent(dependent);
    setModalVisible(false);
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
      <View style={styles.dependentInfo}>
        <Text style={styles.dependentName}>{item.nome}</Text>
        {item.dataNascimento && (
          <Text style={styles.dependentBirthdate}>{item.dataNascimento}</Text>
        )}
      </View>
    </TouchableOpacity>
  );

  const renderGameItem = ({ item }) => (
    <TouchableOpacity
      style={[styles.gameCard, { backgroundColor: item.color }]}
      onPress={() => {
        if (!selectedDependent) {
          Alert.alert(
            "Selecione um Dependente",
            "Por favor, selecione um dependente antes de iniciar o jogo.",
            [
              { text: "OK", onPress: () => setModalVisible(true) }
            ]
          );
          return;
        }
        navigation.navigate(item.screen, { 
          dependentId: selectedDependent.id, 
          dependentName: selectedDependent.nome 
        });
      }}
      activeOpacity={0.8}
    >
      <View style={styles.gameImageContainer}>
        <Image source={item.image} style={styles.gameImage} resizeMode="contain" />
      </View>
      <Text style={styles.gameName}>{item.name}</Text>
    </TouchableOpacity>
  );

  return (
    <LinearGradient
      colors={['#3498db', '#2c3e50']}
      style={styles.background}
    >
      <SafeAreaView style={styles.safeArea}>
        <ScrollView contentContainerStyle={styles.container}>
          {/* Header */}
          <View style={styles.header}>
            <Text style={styles.title}>Jogos Educacionais</Text>
            
            <Animated.View style={{ transform: [{ scale }] }}>
              <TouchableOpacity 
                style={styles.dependentSelector} 
                onPress={() => setModalVisible(true)}
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
                        <Ionicons name="person" size={24} color="#fff" />
                      </View>
                    )}
                    <Text style={styles.selectedDependentName} numberOfLines={1}>
                      {selectedDependent.nome}
                    </Text>
                  </>
                ) : (
                  <>
                    <View style={styles.selectDependentIcon}>
                      <Ionicons name="person-add" size={24} color="#fff" />
                    </View>
                    <Text style={styles.selectDependentText}>Selecionar</Text>
                  </>
                )}
              </TouchableOpacity>
            </Animated.View>
          </View>

          {/* Modal para selecionar dependente */}
          <Modal
            animationType="slide"
            transparent={true}
            visible={modalVisible}
            onRequestClose={() => setModalVisible(false)}
          >
            <View style={styles.modalOverlay}>
              <View style={styles.modalContainer}>
                <Text style={styles.modalTitle}>Selecione um Dependente</Text>
                
                {dependents.length > 0 ? (
                  <FlatList
                    data={dependents}
                    renderItem={renderDependentItem}
                    keyExtractor={(item) => item.id}
                    contentContainerStyle={styles.modalList}
                  />
                ) : (
                  <View style={styles.noDependentsContainer}>
                    <LottieView
                      source={require('../Assets/Lottie/empty-red.json')}
                      autoPlay
                      loop
                      style={styles.emptyAnimation}
                    />
                    <Text style={styles.noDependentsText}>Nenhum dependente cadastrado</Text>
                  </View>
                )}
                
                <TouchableOpacity
                  style={styles.modalCloseButton}
                  onPress={() => setModalVisible(false)}
                >
                  <Text style={styles.modalCloseButtonText}>Fechar</Text>
                </TouchableOpacity>
              </View>
            </View>
          </Modal>

          {/* Lista de jogos */}
          <View style={styles.gamesContainer}>
            <FlatList
              data={games}
              renderItem={renderGameItem}
              keyExtractor={(item) => item.id}
              numColumns={numColumns}
              scrollEnabled={false}
              contentContainerStyle={styles.gamesList}
            />
          </View>
        </ScrollView>
      </SafeAreaView>
    </LinearGradient>
  );
}

const styles = StyleSheet.create({
  background: {
    flex: 1,
  },
  safeArea: {
    flex: 1,
  },
  container: {
    flexGrow: 1,
    paddingTop: statusBarHeight + 20,
    paddingBottom: 40,
    paddingHorizontal: 20,
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 25,
  },
  title: {
    fontSize: 24,
    fontWeight: '700',
    color: '#fff',
    flex: 1,
  },
  dependentSelector: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: 'rgba(255,255,255,0.2)',
    borderRadius: 20,
    paddingVertical: 8,
    paddingHorizontal: 15,
    marginLeft: 15,
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
  selectDependentIcon: {
    marginRight: 8,
  },
  selectDependentText: {
    color: '#fff',
    fontSize: 14,
    fontWeight: '600',
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
    maxHeight: height * 0.8,
  },
  modalTitle: {
    fontSize: 20,
    fontWeight: '700',
    color: '#2c3e50',
    marginBottom: 20,
    textAlign: 'center',
  },
  modalList: {
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
  dependentInfo: {
    flex: 1,
  },
  dependentName: {
    fontSize: 16,
    color: '#2c3e50',
    fontWeight: '500',
  },
  dependentBirthdate: {
    fontSize: 14,
    color: '#7f8c8d',
    marginTop: 2,
  },
  noDependentsContainer: {
    padding: 30,
    alignItems: 'center',
    justifyContent: 'center',
  },
  emptyAnimation: {
    width: 150,
    height: 150,
  },
  noDependentsText: {
    fontSize: 16,
    color: '#7f8c8d',
    marginTop: 10,
    textAlign: 'center',
  },
  modalCloseButton: {
    backgroundColor: '#3498db',
    borderRadius: 10,
    padding: 15,
    marginTop: 20,
    alignItems: 'center',
  },
  modalCloseButtonText: {
    color: '#fff',
    fontSize: 16,
    fontWeight: '600',
  },
  gamesContainer: {
    marginTop: 10,
    paddingBottom: 80, // Adiciona espaço extra no final para a bottom bar
  },
  gamesList: {
    justifyContent: 'space-between',
    paddingBottom: 20, // Espaço extra no final da lista
  },
  gameCard: {
    width: (width - 60) / numColumns, // Mantém a largura
    aspectRatio: 1,
    borderRadius: 15,
    marginBottom: 20,
    marginHorizontal: 5, // Adiciona espaçamento horizontal entre os cards
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
    textShadowColor: 'rgba(0,0,0,0.3)',
    textShadowOffset: { width: 1, height: 1 },
    textShadowRadius: 2,
  },
});

export default Jogos;