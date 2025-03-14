import React, { useEffect, useState } from "react";
import { TouchableOpacity, Image, View } from "react-native";
import { useNavigation } from "@react-navigation/native";
import { createBottomTabNavigator } from "@react-navigation/bottom-tabs";
import { createNativeStackNavigator } from "@react-navigation/native-stack";
import {
  AntDesign,
  FontAwesome5,
  Octicons,
  Ionicons,
  Feather,
} from "@expo/vector-icons";
import LottieView from "lottie-react-native";
import { getAuth, signOut } from "firebase/auth";
import { getStorage, ref as sRef, getDownloadURL } from "firebase/storage";

import { useAuth } from "../Hooks/Auth";
import { Inicial } from "../Pages/Inicial";
import Notificacao from "../Pages/Notificacao";
import Jogos from "../Pages/Jogos";
import Configuracoes from "../Pages/Configuracoes";
import Perfil from "../Pages/Perfil";
import JogoLabirinto from "../Pages/JogoLabirinto/JogoLabirinto";
import JogoRotinasDiarias from "../Pages/JogoRotinasDiarias/JogoRotinasDiarias";
import { JogoEmocoes } from "../Pages/JogoEmocoes/JogoEmocoes";
import { JogoSequencia } from "../Pages/JogoSequencia/JogoSequencia";
import JogoSonsEImagens from "../Pages/JogoSonsEImagens/JogoSonsEImagens";
import { styles } from "./styles";
import { TabBarIcon } from "./TabBarIcon";
import JogoMemoria from "../Pages/JogoMemoria/JogoMemoria";
import JogoCacaPalavras from "../Pages/JogoCacaPalavras/JogoCacaPalavras";

function AuthRoutesTabBar() {
  const navigation = useNavigation();
  const { signOut, user } = useAuth();
  const { Navigator, Screen } = createBottomTabNavigator();
  const auth = getAuth();
  const userId = auth.currentUser ? auth.currentUser.uid : null;
  const [imageUrl, setImageUrl] = useState(null);

  function LogOut() {
    signOut();
  }

  return (
    <Navigator
      screenOptions={({ route }) => ({
        tabBarIcon: ({ focused, color, size }) => {
          let icon;
          let animation;

          if (route.name === "Inicial") {
            animation = require("../Assets/Lottie/home-icon.json");
            icon = <AntDesign name="home" size={size} color={color} />;
          } else if (route.name === "Jogos") {
            animation = require("../Assets/Lottie/playGames.json");
            icon = <Feather name="play" size={size} color={color} />;
          } else if (route.name === "Configuracoes") {
            animation = require("../Assets/Lottie/gears.json");
            icon = <Octicons name="gear" size={size} color={color} />;
          } else if (route.name === "Perfil") {
            animation = require("../Assets/Lottie/profile-icon.json");
            icon = <AntDesign name="user" size={size} color={color} />;
          }

          return (
            <TabBarIcon focused={focused} animation={animation} icon={icon} />
          );
        },
        tabBarActiveTintColor: "blue",
        tabBarInactiveTintColor: "grey",
        tabBarStyle: styles.tabBar,
        tabBarItemStyle: styles.tabBarItem,
      })}
    >
      <Screen
        name="Inicial"
        component={Inicial}
        options={{
          tabBarShowLabel: false,
          headerTitleAlign: "center",
          headerTitle: () => (
            <Image
              source={require("../../assets/adaptive-icon.png")}
              style={styles.headerTitle}
            />
          ),
          headerTitleStyle: { fontFamily: "Ubuntu_700Bold" },
          headerLeft: () => (
            <TouchableOpacity onPress={LogOut} style={styles.headerLeftButton}>
              <LottieView
                source={require("../Assets/Lottie/log-out (1).json")}
                autoPlay
                loop
                style={styles.lottieLogout}
              />
            </TouchableOpacity>
          ),
          headerRight: () => (
            <TouchableOpacity
              onPress={() => navigation.navigate("Notificacao")}
              style={styles.headerRightButton}
            >
              <Ionicons name="notifications" size={24} color="black" />
            </TouchableOpacity>
          ),
        }}
      />
      <Screen
        name="Jogos"
        component={Jogos}
        options={{
          tabBarShowLabel: false,
          headerTitleAlign: "center",
          headerTitle: () => (
            <Image
              source={require("../../assets/adaptive-icon.png")}
              style={styles.headerTitle}
            />
          ),
          headerTitleStyle: { fontFamily: "Ubuntu_700Bold" },
          headerLeft: () => (
            <TouchableOpacity onPress={LogOut} style={styles.headerLeftButton}>
              <LottieView
                source={require("../Assets/Lottie/log-out (1).json")}
                autoPlay
                loop
                style={styles.lottieLogout}
              />
            </TouchableOpacity>
          ),
        }}
      />
      <Screen
        name="Configuracoes"
        component={Configuracoes}
        options={{
          tabBarShowLabel: false,
          headerTitleAlign: "center",
          headerTitle: () => (
            <Image
              source={require("../../assets/adaptive-icon.png")}
              style={styles.headerTitle}
            />
          ),
          headerTitleStyle: { fontFamily: "Ubuntu_700Bold" },
          headerLeft: () => (
            <TouchableOpacity onPress={LogOut} style={styles.headerLeftButton}>
              <LottieView
                source={require("../Assets/Lottie/log-out (1).json")}
                autoPlay
                loop
                style={styles.lottieLogout}
              />
            </TouchableOpacity>
          ),
        }}
      />
    </Navigator>
  );
}

export function AuthRoutes() {
  const { Navigator, Screen } = createNativeStackNavigator();
  return (
    <Navigator>
      <Screen
        name="Home"
        component={AuthRoutesTabBar}
        options={{ headerShown: false, statusBarStyle: "dark" }}
      />
      <Screen name="Inicial" component={Inicial} />
      <Screen
        name="JogoLabirinto"
        component={JogoLabirinto}
        options={{ headerShown: false, statusBarStyle: "dark" }}
      />
      <Screen
        name="Notificacao"
        component={Notificacao}
        options={{ headerShown: false, statusBarStyle: "dark" }}
      />
      <Screen
        name="JogoRotinasDiarias"
        component={JogoRotinasDiarias}
        options={{ headerShown: false, statusBarStyle: "dark" }}
      />
      <Screen
        name="JogoEmocoes"
        component={JogoEmocoes}
        options={{ headerShown: false, statusBarStyle: "dark" }}
      />
      <Screen
        name="JogoSequencia"
        component={JogoSequencia}
        options={{ headerShown: false, statusBarStyle: "dark" }}
      />
      <Screen
        name="JogoSonsEImagens"
        component={JogoSonsEImagens}
        options={{ headerShown: false, statusBarStyle: "dark" }}
      />
      <Screen
        name="JogoMemoria"
        component={JogoMemoria}
        options={{ headerShown: false, statusBarStyle: "dark" }}
      />
      <Screen
        name="JogoCacaPalavras"
        component={JogoCacaPalavras}
        options={{ headerShown: false, statusBarStyle: "dark" }}
      />
    </Navigator>
  );
}
