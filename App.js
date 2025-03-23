import React, { useState, useEffect } from "react";
import { View, Text, Image, StyleSheet, ActivityIndicator } from "react-native";
import * as Notifications from 'expo-notifications';
import {
  Poppins_400Regular,
  Poppins_500Medium,
} from "@expo-google-fonts/poppins";
import {
  Roboto_300Light,
  Roboto_700Bold,
  Roboto_500Medium,
} from "@expo-google-fonts/roboto";
import { useFonts } from "expo-font";
import AppIntroSlider from "react-native-app-intro-slider";
import LottieView from "lottie-react-native";
import { AuthProvider } from "./src/Hooks/Auth";
import { Routes } from "./src/Routes/Index";
import AsyncStorage from '@react-native-async-storage/async-storage';
import {setStatusBarStyle, StatusBar} from 'expo-status-bar'

// Array de slides
const slides = [
  {
    key: "1",
    title: "O QUE É PRATICAMENTE??",
    text: "Aplicativo, baseado nos princípios da Análise do Comportamento Aplicada (ABA), que oferece simulações interativas e personalizadas para o desenvolvimento de habilidades sociais",
    image: require("./src/images/Praticamente.png"), 
  },
  {
    key: "2",
    title: "PARA QUEM É?",
    text: "Crianças com TEA enfrentam desafios no desenvolvimento de habilidades sociais, afetando sua interação, comunicação e adaptação, enquanto pais e profissionais têm dificuldade em encontrar soluções acessíveis e consistentes.",
    image: require("./src/Assets/Lottie/Teaching.json"),
  },
  {
    key: "3",
    title: "O NOSSO APP É PAGO?",
    text: "Teremos versões gratuitas e versões pagas, para todos os tipos de usuários e suas necessidades.",
    image: require("./src/Assets/Lottie/Paying.json"),
  },
];

Notifications.setNotificationHandler({
  handleNotification: async () => ({
    shouldShowAlert: true,
    shouldPlaySound: true,
    shouldSetBadge: true,
  }),
});

export default function App() {
  const [showHome, setShowHome] = useState(false);
  const [fontsLoader] = useFonts({
    Poppins_400Regular,
    Roboto_300Light,
    Roboto_700Bold,
    Poppins_500Medium,
    Roboto_500Medium,
  });

  useEffect(() => {
    async function checkIfAlreadySeen() {
      const seen = await AsyncStorage.getItem("introSeen");
      if (seen === "true") {
        setShowHome(true);
      }
    }
    checkIfAlreadySeen();
    const requestPermissions = async () => {
      const { status } = await Notifications.requestPermissionsAsync();
      if (status !== 'granted') {
        alert('Você precisa habilitar as notificações para receber atualizações.');
      }
    };

    requestPermissions();
  }, []);
  

  async function handleDone() {
    await AsyncStorage.setItem("introSeen", "true");
    setShowHome(true);
  }

  function renderSlides({ item }) {
    return (
      <View style={styles.container}>
        {item.image && typeof item.image === "number" ? (
          <Image source={item.image} style={styles.image} resizeMode="contain" />
        ) : item.image ? (
          <LottieView source={item.image} autoPlay loop style={styles.lottie} />
        ) : null}
        <Text style={styles.title}>{item.title}</Text>
        <Text style={styles.subTitle}>{item.text}</Text>
      </View>
    );
  }

  if (!fontsLoader) {
    return <ActivityIndicator size="large" />;
  } 

  if (showHome) {
    return (

      <AuthProvider>
        <StatusBar style="light"/> 
        <Routes />
      </AuthProvider>
    );
  } 

  return (
    <AuthProvider>
      <StatusBar style="dark"/> 
      {/* //MEXER NISSO HOJE A NOITE */}

      
      <AppIntroSlider
        renderItem={renderSlides}
        data={slides}
        activeDotStyle={{
          backgroundColor: "#0dc4fd",
          width: 30,
        }}
        renderDoneButton={() => (
          <Text
            style={{
              width: 95,
              height: 70,
              fontSize: 17,
              textAlign: "center",
              paddingBottom: 10,
              marginBottom: 15,
              fontFamily: "Roboto_500Medium",
            }}
          >
            Quero saber mais!!!
          </Text>
        )}
        onDone={handleDone}
      />
    </AuthProvider>
  );
}

const styles = StyleSheet.create({
  title: {
    fontFamily: "Roboto_500Medium",
    fontSize: 25,
    textAlign: "center",
    marginBottom: 10,
    elevation: 10,
    color: "#3c3d40",
    marginHorizontal: 10,
  },
  subTitle: {
    fontFamily: "Roboto_300Light",
    fontSize: 18,
    textAlign: "center",
    margin: 5,
    elevation: 10,
    paddingHorizontal: 20,
    color: "black",
    marginHorizontal: 10,
  },
  container: {
    flex: 1,
    marginTop: 55,
    alignItems: "center",
    justifyContent: "center",
    backgroundColor: "#f4f6fc",
  },
  image: {
    width: 300,
    height: 300,
    marginTop: 20,
  },
  lottie: {
    width: 300,
    height: 300,
    marginTop: 20,
  },
});
