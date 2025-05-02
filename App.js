import React, { useState, useEffect } from "react";
import { View, Text, Image, StyleSheet, ActivityIndicator, SafeAreaView } from "react-native";
import * as Notifications from 'expo-notifications';
import {
  Poppins_400Regular,
  Poppins_500Medium,
  Poppins_600SemiBold,
} from "@expo-google-fonts/poppins";
import {
  Roboto_300Light,
  Roboto_400Regular,
  Roboto_700Bold,
  Roboto_500Medium,
} from "@expo-google-fonts/roboto";
import { useFonts } from "expo-font";
import AppIntroSlider from "react-native-app-intro-slider";
import LottieView from "lottie-react-native";
import { AuthProvider } from "./src/Hooks/Auth";
import { Routes } from "./src/Routes/Index";
import AsyncStorage from '@react-native-async-storage/async-storage';
import { StatusBar } from 'expo-status-bar';
import Constants from 'expo-constants';
import { LinearGradient } from 'expo-linear-gradient';

// Array de slides
const slides = [
  {
    key: "1",
    title: "O que é o Praticamente?",
    text: "Aplicativo baseado nos princípios da Análise do Comportamento Aplicada (ABA) que oferece simulações interativas e personalizadas para o desenvolvimento de habilidades sociais.",
    image: require("./src/images/Praticamente.png"),
    backgroundColor: "#4a6fa5", // Azul suave
  },
  {
    key: "2",
    title: "Para quem é?",
    text: "Crianças com TEA que enfrentam desafios no desenvolvimento de habilidades sociais, afetando sua interação e comunicação, enquanto pais e profissionais buscam soluções acessíveis.",
    image: require("./src/Assets/Lottie/Teaching.json"),
    backgroundColor: "#6b8c42", // Verde suave
  },
  {
    key: "3",
    title: "O nosso app é pago?",
    text: "Oferecemos versões gratuitas e premium, adaptadas para todos os tipos de usuários e suas necessidades específicas.",
    image: require("./src/Assets/Lottie/Paying.json"),
    backgroundColor: "#d17b46", // Laranja suave
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
  const [fontsLoaded] = useFonts({
    Poppins_400Regular,
    Poppins_500Medium,
    Poppins_600SemiBold,
    Roboto_300Light,
    Roboto_400Regular,
    Roboto_500Medium,
    Roboto_700Bold,
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
        console.log('Permissão para notificações não concedida');
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
      <LinearGradient
        colors={[item.backgroundColor, '#f4f6fc']}
        style={[styles.slideContainer, { backgroundColor: item.backgroundColor }]}
        start={{ x: 0, y: 0 }}
        end={{ x: 1, y: 1 }}
      >
        <SafeAreaView style={styles.safeArea}>
          <View style={styles.contentContainer}>
            {item.image && typeof item.image === "number" ? (
              <Image 
                source={item.image} 
                style={styles.image} 
                resizeMode="contain" 
              />
            ) : item.image ? (
              <LottieView 
                source={item.image} 
                autoPlay 
                loop 
                style={styles.lottie} 
              />
            ) : null}
            
            <View style={styles.textContainer}>
              <Text style={styles.title}>{item.title}</Text>
              <Text style={styles.subTitle}>{item.text}</Text>
            </View>
          </View>
        </SafeAreaView>
      </LinearGradient>
    );
  }

  if (!fontsLoaded) {
    return (
      <View style={styles.loadingContainer}>
        <ActivityIndicator size="large" color="#4a6fa5" />
        <Text style={styles.loadingText}>Carregando...</Text>
      </View>
    );
  } 

  if (showHome) {
    return (
      <AuthProvider>
        <StatusBar style="light" /> 
        <Routes />
      </AuthProvider>
    );
  } 

  return (
    <AuthProvider>
      <StatusBar style="dark" /> 
      <AppIntroSlider
        renderItem={renderSlides}
        data={slides}
        activeDotStyle={{
          backgroundColor: "#ffffff",
          width: 30,
        }}
        dotStyle={{
          backgroundColor: "rgba(255, 255, 255, 0.5)",
        }}
        renderNextButton={() => (
          <View style={styles.button}>
            <Text style={styles.buttonText}>Próximo</Text>
          </View>
        )}
        renderDoneButton={() => (
          <View style={[styles.button, styles.doneButton]}>
            <Text style={[styles.buttonText, styles.doneButtonText]}>Começar</Text>
          </View>
        )}
        onDone={handleDone}
        showSkipButton={true}
        renderSkipButton={() => (
          <View style={styles.skipButton}>
            <Text style={styles.skipButtonText}>Pular</Text>
          </View>
        )}
        bottomButton
      />
    </AuthProvider>
  );
}

const styles = StyleSheet.create({
  loadingContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: '#f4f6fc',
  },
  loadingText: {
    marginTop: 20,
    fontFamily: "Roboto_400Regular",
    fontSize: 16,
    color: '#3c3d40',
  },
  slideContainer: {
    flex: 1,
  },
  safeArea: {
    flex: 1,
  },
  contentContainer: {
    flex: 1,
    alignItems: "center",
    justifyContent: "center",
    paddingHorizontal: 20,
    paddingBottom: 100,
  },
  textContainer: {
    paddingHorizontal: 30,
    marginBottom: 40,
    maxWidth: '90%',
  },
  title: {
    fontFamily: "Poppins_600SemiBold",
    fontSize: 28,
    textAlign: "center",
    marginBottom: 15,
    color: "#ffffff",
    textShadowColor: 'rgba(0, 0, 0, 0.2)',
    textShadowOffset: { width: 1, height: 1 },
    textShadowRadius: 2,
  },
  subTitle: {
    fontFamily: "Roboto_400Regular",
    fontSize: 18,
    lineHeight: 26,
    textAlign: "center",
    color: "#ffffff",
    textShadowColor: 'rgba(0, 0, 0, 0.1)',
    textShadowOffset: { width: 0.5, height: 0.5 },
    textShadowRadius: 1,
    marginTop: 15,
  },
  image: {
    width: '80%',
    height: 300,
    marginBottom: 30,
    borderRadius: 10,
    shadowColor: "#000",
    shadowOffset: {
      width: 0,
      height: 4,
    },
    shadowOpacity: 0.3,
    shadowRadius: 4.65,
    elevation: 8,
  },
  lottie: {
    width: '100%',
    height: 300,
    marginBottom: 30,
  },
  button: {
    backgroundColor: '#ffffff',
    paddingVertical: 12,
    paddingHorizontal: 30,
    borderRadius: 25,
    marginBottom: 40,
    shadowColor: "#000",
    shadowOffset: {
      width: 0,
      height: 2,
    },
    shadowOpacity: 0.25,
    shadowRadius: 3.84,
    elevation: 5,
  },
  doneButton: {
    backgroundColor: '#4a6fa5',
  },
  buttonText: {
    fontFamily: "Roboto_500Medium",
    fontSize: 16,
    color: '#4a6fa5',
    textAlign: 'center',
  },
  doneButtonText: {
    color: '#ffffff',
  },
  skipButton: {
    padding: 10,
    marginLeft: 10,
  },
  skipButtonText: {
    fontFamily: "Roboto_400Regular",
    fontSize: 16,
    color: '#ffffff',
    textAlign: 'center',
  },
});