import React, { useEffect, useState, useRef } from "react";
import {
  View,
  StyleSheet,
  Text,
  Alert,
  ScrollView,
  TouchableOpacity,
  Dimensions,
  Image,
  StatusBar,
  Animated,
} from "react-native";
import AsyncStorage from "@react-native-async-storage/async-storage";
import { LinearGradient } from "expo-linear-gradient";
import Constants from "expo-constants";
import { getDatabase, ref, onValue } from "firebase/database";
import { getAuth } from "firebase/auth";
import { useRoute } from "@react-navigation/native";

const { width, height } = Dimensions.get("window");
const statusBarHeight = Constants.statusBarHeight;

const cloud1 = require("../../../Assets/JogoLabirinto/cloudOne.png");
const cloud2 = require("../../../Assets/JogoLabirinto/cloudTwo.png");
const cloud3 = require("../../../Assets/JogoLabirinto/cloudThree.png");
const cloud4 = require("../../../Assets/JogoLabirinto/cloudFour.png");
const estrelas = require("../../../Assets/JogoLabirinto/estrelas.png");
const ground = require("../../../Assets/JogoLabirinto/ground.png");

const HomeScreen = ({ navigation, route }) => {

  const { dependentId, dependentName } = route.params || { dependentId: null };  
  const [currentLevel, setCurrentLevel] = useState(1);
  const [totalScore, setTotalScore] = useState(0);
  const groundAnim = useRef(new Animated.Value(0)).current;
  const auth = getAuth();

  
  const loadLevelAndScore = async () => {
    const savedLevel = await AsyncStorage.getItem("currentLevel");
    if (savedLevel) {
      setCurrentLevel(JSON.parse(savedLevel));
    }

    const db = getDatabase();
    const scoreRef = ref(
      db,
      `users/${auth.currentUser.uid}/dependents/${DependenteId}/scores/Labirinto`
    );
    onValue(scoreRef, (snapshot) => {
      const score = snapshot.val();
      if (score) {
        setTotalScore(score);
      }
    });
  };

  useEffect(() => {
    const unsubscribe = navigation.addListener("focus", () => {
      loadLevelAndScore();
    });
    return unsubscribe;
  }, [navigation]);

  useEffect(() => {
    if (currentLevel > 1) {
      Animated.timing(groundAnim, {
        toValue: height,
        duration: 1000,
        useNativeDriver: true,
      }).start();
    } else {
      groundAnim.setValue(0);
    }
  }, [currentLevel]);

  const resetProgress = async () => {
    Alert.alert(
      "Resetar Progresso",
      "Tem certeza que deseja resetar seu progresso?",
      [
        { text: "Cancelar", style: "cancel" },
        {
          text: "Resetar",
          onPress: async () => {
            await AsyncStorage.removeItem("currentLevel");
            setCurrentLevel(1);
            setTotalScore(0);
            Alert.alert("Progresso resetado!", "Seu progresso foi apagado.");
          },
        },
      ]
    );
  };

  const generateTrailSteps = () => {
    const steps = [];
    const maxLevelsToShow = 10;

    for (
      let i = currentLevel - 1;
      i >= 1 && i >= currentLevel - maxLevelsToShow;
      i--
    ) {
      steps.push(
        <View
          key={`prev-${i}`}
          style={[
            styles.trailStep,
            styles.trailStepPrev,
            i % 2 === 0 ? styles.trailStepLeft : styles.trailStepRight,
          ]}
        >
          <Text style={styles.trailStepText}>{i}</Text>
        </View>
      );
    }

    steps.push(
      <View
        key={`current-${currentLevel}`}
        style={[styles.trailStep, styles.trailStepCurrent]}
      >
        <Text style={styles.trailStepText}>{currentLevel}</Text>
      </View>
    );

    for (let i = currentLevel + 1; i <= currentLevel + maxLevelsToShow; i++) {
      steps.push(
        <View
          key={`next-${i}`}
          style={[
            styles.trailStep,
            styles.trailStepNext,
            i % 2 === 0 ? styles.trailStepLeft : styles.trailStepRight,
          ]}
        >
          <Text style={styles.trailStepText}>{i}</Text>
        </View>
      );
    }

    return steps.reverse();
  };

  const getGradientColors = () => {
    const baseColor = [135, 206, 235];
    const darkenFactor = currentLevel * 5;
    const darkerColor = `rgb(${baseColor[0] - darkenFactor}, ${
      baseColor[1] - darkenFactor
    }, ${baseColor[2] - darkenFactor})`;
    return [darkerColor, "#ffffff"];
  };

  const Cloud = ({ image, top, left, speed }) => {
    const [xPos, setXPos] = useState(left);

    useEffect(() => {
      const interval = setInterval(() => {
        setXPos((prevXPos) => (prevXPos + speed) % width);
      }, 50);

      return () => clearInterval(interval);
    }, [speed]);

    return (
      <Image
        source={image}
        style={[
          styles.cloud,
          {
            top: top,
            left: xPos,
          },
        ]}
      />
    );
  };

  return (
    <LinearGradient
      colors={getGradientColors()}
      style={styles.container}
      start={{ x: 0, y: 0 }}
      end={{ x: 0, y: 1 }}
    >
      <Image
        source={estrelas}
        style={[styles.estrelas, { top: 50, left: 20 }]}
      />
      <Image
        source={estrelas}
        style={[styles.estrelas, { top: 150, right: 20 }]}
      />
      <Image
        source={estrelas}
        style={[styles.estrelas, { top: 300, left: 50 }]}
      />

      <Cloud image={cloud1} top={50} left={50} speed={0.5} />
      <Cloud image={cloud2} top={150} left={200} speed={0.3} />
      <Cloud image={cloud3} top={300} left={100} speed={0.7} />
      <Cloud image={cloud4} top={450} left={300} speed={0.2} />

      {currentLevel === 1 && (
        <Animated.Image
          source={ground}
          style={[
            styles.ground,
            {
              transform: [{ translateY: groundAnim }],
            },
          ]}
        />
      )}

      <StatusBar
        barStyle={"light-content"}
        backgroundColor={"#77bad5"}
        networkActivityIndicatorVisible
        showHideTransition={"fade"}
      />
      <Text style={styles.trailText}>Trilha de Progresso</Text>
      <View style={styles.containerScore}>
        <Text style={styles.scoreText}>Pontuação: </Text>
        <Text style={styles.scoreText1}>{totalScore}</Text>
      </View>
      <ScrollView
        contentContainerStyle={styles.trailContainer}
        showsVerticalScrollIndicator={false}
      >
        {generateTrailSteps()}
      </ScrollView>

      {currentLevel === 1 ? (
        <TouchableOpacity
          onPress={() =>
            navigation.navigate("Game", { level: 1, dependentId, dependentName }) 
          }
          style={styles.botoes}
          activeOpacity={0.7}
        >
          <Text style={styles.textBotoes}>Iniciar</Text>
        </TouchableOpacity>
      ) : (
        <View>
          <TouchableOpacity
            onPress={() =>
              navigation.navigate("Game", {
                level: currentLevel,
                dependentId, 
              })
            }
            style={styles.botoes}
            activeOpacity={0.7}
          >
            <Text style={styles.textBotoes}>Continuar</Text>
          </TouchableOpacity>

          <TouchableOpacity
            onPress={resetProgress}
            style={styles.resetar}
            activeOpacity={0.7}
          >
            <Text style={styles.resetText}>Resetar</Text>
          </TouchableOpacity>
        </View>
      )}
    </LinearGradient>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    alignItems: "center",
    justifyContent: "center",
  },
  trailText: {
    fontSize: 24,
    fontWeight: "bold",
    marginBottom: 20,
    color: "#333",
    paddingTop: statusBarHeight,
  },
  trailContainer: {
    alignItems: "center",
  },
  trailStep: {
    width: 70,
    height: 70,
    borderRadius: 35,
    backgroundColor: "rgb(204,204,204)",
    borderColor: "rgb(167, 165, 165)",
    borderWidth: 1,
    alignItems: "center",
    justifyContent: "center",
    marginVertical: 10,
    position: "relative",
  },
  trailStepCurrent: {
    backgroundColor: "rgb(119,186,213)",
    width: 100,
    height: 100,
    borderRadius: 25,
    elevation: 10,
    borderWidth: 2,
    borderColor: "rgb(17, 134, 180)",
  },
  trailStepPrev: {
    backgroundColor: "#a0a0a0",
  },
  trailStepNext: {
    backgroundColor: "#e0e0e0",
  },
  trailStepLeft: {
    alignSelf: "flex-start",
    marginLeft: 100,
  },
  trailStepRight: {
    alignSelf: "flex-end",
    marginRight: 100,
  },
  trailStepText: {
    fontSize: 18,
    fontWeight: "bold",
    color: "rgb(8, 8, 8)",
  },
  botoes: {
    backgroundColor: "rgb(3, 226, 33)",
    width: 200,
    borderColor: "rgb(4, 153, 24)",
    height: 60,
    borderRadius: 8,
    borderWidth: 2,
    elevation: 2,
    margin: 10,
    justifyContent: "center",
    alignItems: "center",
  },
  textBotoes: {
    fontSize: 24,
    textAlign: "center",
    fontWeight: "600",
    color: "rgb(255, 255, 255)",
  },
  resetar: {
    backgroundColor: "rgb(240, 15, 15)",
    borderColor: "rgb(131, 10, 10)",
    width: 200,
    height: 60,
    borderRadius: 8,
    borderWidth: 2,
    elevation: 2,
    margin: 10,
    justifyContent: "center",
    alignItems: "center",
  },
  resetText: {
    fontSize: 24,
    textAlign: "center",
    fontWeight: "600",
    color: "rgb(255, 255, 255)",
  },
  cloud: {
    position: "absolute",
    width: 100,
    height: 60,
    resizeMode: "contain",
  },
  estrelas: {
    position: "absolute",
    width: 50,
    height: 50,
    resizeMode: "contain",
    opacity: 0.6,
  },
  ground: {
    position: "absolute",
    width: width,
    height: 100,
    resizeMode: "cover",
    bottom: 0,
  },
  scoreText: {
    fontSize: 18,
    textAlign: "center",
    fontWeight: "bold",
    paddingHorizontal: 5,
    color: "rgb(255, 207, 207)",
    marginBottom: 10,
  },
  scoreText1: {
    fontSize: 24,
    fontWeight: "bold",
    color: "#333",
    backgroundColor: "rgb(255, 11, 11)",
    textAlign: "center",
    width: 100,
    borderRadius: 6,
  },
  containerScore: {
    backgroundColor: "rgb(190, 2, 2)",
    borderRadius: 8,
    alignItems: "center",
    justifyContent: "center",
    padding: 10,
    width: 150,
    borderColor: "rgb(124, 2, 2)",
    borderWidth: 2,
  },
});

export default HomeScreen;
