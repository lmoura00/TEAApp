import React, { useState, useEffect, useCallback } from "react";
import {
  View,
  Text,
  Image,
  StyleSheet,
  Button,
  Alert,
  Animated,
  Easing,
} from "react-native";
import { Audio } from "expo-av";
import DraggableFlatList from "react-native-draggable-flatlist";
import { GestureHandlerRootView } from "react-native-gesture-handler";
import Constants from "expo-constants";
import { getDatabase, ref, set, get } from "firebase/database";
import { getAuth } from "firebase/auth";
import { useRoute } from "@react-navigation/native";

// Dados dos níveis
const levels = [
  {
    id: 1,
    title: "Rotina da Manhã",
    steps: [
      { id: "1", image: require("./assets/acordar.png"), text: "Acordar" },
      {
        id: "2",
        image: require("./assets/escovarDentes.jpg"),
        text: "Escovar os dentes",
      },
      {
        id: "3",
        image: require("./assets/colocarRoupa.jpg"),
        text: "Se vestir",
      },
      {
        id: "4",
        image: require("./assets/colegio.png"),
        text: "Ir para o colégio",
      },
    ],
    correctOrder: ["1", "2", "3", "4"],
  },
  {
    id: 2,
    title: "Rotina da Tarde",
    steps: [
      { id: "1", image: require("./assets/almocar.png"), text: "Almoçar" },
      { id: "2", image: require("./assets/estudar.jpg"), text: "Estudar" },
      { id: "3", image: require("./assets/brincar.png"), text: "Brincar" },
      { id: "4", image: require("./assets/lanche.jpg"), text: "Lanche" },
    ],
    correctOrder: ["1", "2", "3", "4"],
  },
  {
    id: 3,
    title: "Rotina da Noite",
    steps: [
      { id: "1", image: require("./assets/jantar.png"), text: "Jantar" },
      {
        id: "2",
        image: require("./assets/escovarDentes.jpg"),
        text: "Escovar os dentes",
      },
      {
        id: "3",
        image: require("./assets/roupaDormir.jpg"),
        text: "Colocar pijama",
      },
      { id: "4", image: require("./assets/dormir.png"), text: "Dormir" },
    ],
    correctOrder: ["1", "2", "3", "4"],
  },
];

const statusBarHeight = Constants.statusBarHeight;

const shuffleArray = (array) => {
  for (let i = array.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [array[i], array[j]] = [array[j], array[i]];
  }
  return array;
};

const JogoRotinasDiarias = () => {
  const route = useRoute();
  const { dependentId } = route.params || { dependentId: null };
  const [currentLevel, setCurrentLevel] = useState(0);
  const [orderedSteps, setOrderedSteps] = useState([]);
  const [sound, setSound] = useState();
  const [isOrderCorrect, setIsOrderCorrect] = useState(false);
  const [score, setScore] = useState(0);
  const [animation] = useState(new Animated.Value(0));
  const [timeElapsed, setTimeElapsed] = useState(0);
  if (!dependentId) {
    return (
      <View style={styles.container}>
        <Text style={styles.errorText}>Erro: Dependente não selecionado.</Text>
        <Button title="Voltar" onPress={() => navigation.goBack()} />
      </View>
    );
  }
  useEffect(() => {
    const timer = setInterval(() => {
      setTimeElapsed((prevTime) => prevTime + 1);
    }, 1000);

    return () => clearInterval(timer);
  }, [currentLevel]);

  // Carrega as etapas do nível atual
  useEffect(() => {
    setOrderedSteps(shuffleArray([...levels[currentLevel].steps]));
  }, [currentLevel]);

  const saveScore = async (score) => {
    try {
      const db = getDatabase();
      const auth = getAuth();
      const levelRef = ref(
        db,
        `users/${
          auth.currentUser.uid
        }/dependents/${dependentId}/scores/RotinasDiarias/level${
          currentLevel + 1
        }`
      );

      // Obter o número de tentativas existentes para o nível atual
      const snapshot = await get(levelRef);
      const currentAttempts = snapshot.val() || {};
      const attemptIndex = Object.keys(currentAttempts).length; // Próximo índice disponível

      // Adicionar a nova tentativa
      const newAttempt = {
        score: score,
        timestamp: Date.now(), // Adiciona um timestamp para identificar quando a pontuação foi registrada
      };

      // Salvar a nova tentativa no Firebase
      await set(
        ref(
          db,
          `users/${
            auth.currentUser.uid
          }/dependents/${dependentId}/scores/RotinasDiarias/level${
            currentLevel + 1
          }/${attemptIndex}`
        ),
        newAttempt
      );

      console.log("Tentativa salva com sucesso!");
    } catch (error) {
      console.error("Erro ao salvar tentativa:", error);
    }
  };

  const playSound = useCallback(async (type) => {
    const { sound } = await Audio.Sound.createAsync(
      type === "success"
        ? require("./assets/sucess.mp3")
        : require("./assets/fail.mp3")
    );
    setSound(sound);
    await sound.playAsync();
  }, []);

  useEffect(() => {
    return sound
      ? () => {
          sound.unloadAsync();
        }
      : undefined;
  }, [sound]);

  const checkOrder = useCallback(() => {
    const isCorrect = orderedSteps.every(
      (step, index) => step.id === levels[currentLevel].correctOrder[index]
    );
    if (isCorrect) {
      playSound("success");
      setIsOrderCorrect(true);

      // Calcula a pontuação com base no tempo decorrido
      const timePenalty = Math.floor(timeElapsed / 10); // Subtrai 1 ponto a cada 10 segundos
      const newScore = Math.max(score + 10 - timePenalty, 0); // Adiciona 10 pontos e subtrai o tempo decorrido
      setScore(newScore);
      saveScore(newScore); // Salva a pontuação no Firebase

      Animated.timing(animation, {
        toValue: 1,
        duration: 1000,
        easing: Easing.linear,
        useNativeDriver: true,
      }).start(() => {
        if (currentLevel < levels.length - 1) {
          Alert.alert(
            "Parabéns!",
            "Você completou este nível! Próximo nível..."
          );
          setCurrentLevel(currentLevel + 1);
          setIsOrderCorrect(false);
          animation.setValue(0);
          setTimeElapsed(0); // Reinicia o tempo para o próximo nível
        } else {
          Alert.alert("Parabéns!", "Você completou todos os níveis!");
        }
      });
    } else {
      playSound("fail");
      setIsOrderCorrect(false);
      const newScore = Math.max(score - 5, 0); // Subtrai 5 pontos em caso de erro
      setScore(newScore);
      Alert.alert("Ops!", "A ordem está incorreta. Tente novamente!");
    }
  }, [orderedSteps, playSound, animation, currentLevel, score, timeElapsed]);

  const renderItem = useCallback(
    ({ item, drag, isActive }) => (
      <Animated.View
        style={[
          styles.stepContainer,
          isActive && { backgroundColor: "#f0f0f0" },
          {
            transform: [
              {
                scale: isActive ? 1.1 : 1,
              },
            ],
          },
        ]}
        onTouchStart={drag}
      >
        <Image source={item.image} style={styles.image} />
        <Text style={styles.text}>{item.text}</Text>
      </Animated.View>
    ),
    []
  );

  // Substituir a animação de `top` por `translateY`
  const confettiAnimation = animation.interpolate({
    inputRange: [0, 1],
    outputRange: [-100, 0], // Movimento de cima para baixo
  });

  const restartGame = () => {
    setCurrentLevel(0);
    setScore(0);
    setIsOrderCorrect(false);
    setOrderedSteps(shuffleArray([...levels[0].steps]));
    setTimeElapsed(0); // Reinicia o tempo
  };

  return (
    <GestureHandlerRootView style={{ flex: 1 }}>
      <View style={styles.container}>
        <Text style={styles.title}>{levels[currentLevel].title}</Text>
        <Text style={styles.score}>Pontuação: {score}</Text>
        <Text style={styles.time}>Tempo: {timeElapsed} segundos</Text>
        <DraggableFlatList
          data={orderedSteps}
          renderItem={renderItem}
          keyExtractor={(item) => item.id}
          onDragEnd={({ data }) => setOrderedSteps(data)}
        />
        {/* Renderiza o botão "Verificar Ordem" apenas se não for o último nível concluído */}
        {!(currentLevel === levels.length - 1 && isOrderCorrect) && (
          <Button title="Verificar Ordem" onPress={checkOrder} />
        )}
        {isOrderCorrect && (
          <Animated.View
            style={[
              styles.confetti,
              { transform: [{ translateY: confettiAnimation }] },
            ]}
          >
            <Text style={styles.correctText}>✅ A ordem está correta!</Text>
          </Animated.View>
        )}
        {!isOrderCorrect && (
          <Text style={styles.incorrectText}>❌ A ordem está incorreta.</Text>
        )}
        {currentLevel === levels.length - 1 && isOrderCorrect && (
          <Button title="Reiniciar Jogo" onPress={restartGame} />
        )}
      </View>
    </GestureHandlerRootView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    paddingTop: statusBarHeight,
    paddingHorizontal: 10,
    backgroundColor: "#f9f9f9",
  },
  title: {
    fontSize: 22,
    fontWeight: "bold",
    marginBottom: 20,
    textAlign: "center",
    color: "#333",
  },
  score: {
    fontSize: 18,
    fontWeight: "bold",
    textAlign: "center",
    color: "#555",
    marginBottom: 10,
  },
  time: {
    fontSize: 16,
    textAlign: 'center',
    color: '#777',
    marginBottom: 10,
  },
  stepContainer: {
    flexDirection: "row",
    alignItems: "center",
    marginBottom: 15,
    padding: 10,
    borderRadius: 10,
    backgroundColor: "#fff",
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 3,
  },
  image: {
    width: 80,
    height: 80,
    marginRight: 15,
    borderRadius: 10,
    resizeMode: "contain",
  },
  text: {
    fontSize: 18,
    fontWeight: "500",
    color: "#555",
  },
  correctText: {
    marginTop: 20,
    color: "green",
    fontSize: 20,
    textAlign: "center",
    fontWeight: "bold",
  },
  incorrectText: {
    marginTop: 20,
    color: "red",
    fontSize: 20,
    textAlign: "center",
    fontWeight: "bold",
  },
  confetti: {
    position: "absolute",
    width: "100%",
    alignItems: "center",
  },
  errorText: {
    fontSize: 18,
    color: "red",
    marginBottom: 20,
    textAlign: "center",
  },
});

export default JogoRotinasDiarias;
