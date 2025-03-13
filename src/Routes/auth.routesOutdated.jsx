import { TouchableOpacity, Image, Alert } from "react-native";
import { useNavigation } from "@react-navigation/native";
import { StatusBar } from "expo-status-bar";

import { createBottomTabNavigator } from "@react-navigation/bottom-tabs";
import { createNativeStackNavigator } from "@react-navigation/native-stack";

import { FontAwesome5 } from "@expo/vector-icons";
import { AntDesign } from "@expo/vector-icons";
import { Entypo } from "@expo/vector-icons";
import { MaterialCommunityIcons, Octicons } from "@expo/vector-icons";
import { EvilIcons } from "@expo/vector-icons";
import { Ionicons } from "@expo/vector-icons";
import { useAuth } from "../Hooks/Auth";
import LottieView from "lottie-react-native";
import { getAuth, signOut } from "firebase/auth";
import AsyncStorage from "@react-native-async-storage/async-storage";

import { Home, Inicial } from "../Pages/Inicial";

import {
  getStorage,
  ref as sRef,
  getDownloadURL,
  uploadBytes,
  deleteObject,
} from "firebase/storage";
import { useEffect, useState } from "react";
import Notificacao from "../Pages/Notificacao";
import Configuracoes from "../Pages/Configuracoes";
import Jogos from "../Pages/Jogos";
import Perfil from "../Pages/Perfil";
import JogoLabirinto from "../Pages/JogoLabirinto/JogoLabirinto";
import JogoRotinasDiarias from "../Pages/JogoRotinasDiarias/JogoRotinasDiarias";
import { JogoEmocoes } from "../Pages/JogoEmocoes/JogoEmocoes";
import { JogoSequencia } from "../Pages/JogoSequencia/JogoSequencia";
import JogoSonsEImagens from "../Pages/JogoSonsEImagens/JogoSonsEImagens";

function AuthRoutesTabBar() {
  const navigation = useNavigation();
  const { setUser, signOut } = useAuth();
  const { Navigator, Screen } = createBottomTabNavigator();
  const auth = getAuth();
  const [imageUrl, setImageUrl] = useState(null);
  const Auth = getAuth();
  const userId = Auth.currentUser ? Auth.currentUser.uid : null;

  function LogOut() {
    signOut();
  }

  useEffect(() => {
    const storage = getStorage();
    try {
      getDownloadURL(sRef(storage, `${userId}`))
        .then((url) => {
          //console.log(url),
          setImageUrl(url);
        })
        .catch((error) => {
          console.log(error);
        });
    } catch (error) {
      console.error(error.message);
    }
  }, []);

  return (
    <Navigator
      screenOptions={({ route }) => ({
        tabBarIcon: ({ focused, color, size }) => {
          if (route.name === "Inicial") {
            return focused ? (
              <LottieView
                source={require("../Assets/Lottie/home-icon.json")}
                autoPlay={true}
                loop={true}
                style={{ width: 30, height: 30 }}
              />
            ) : (
              <AntDesign name="home" size={size} color={color} />
            );
          } else if (route.name === "Notificacao") {
            return focused ? (
              <LottieView
                source={require("../Assets/Lottie/history-icon.json")}
                autoPlay={true}
                loop={true}
                style={{ width: 30, height: 30 }}
              />
            ) : (
              <FontAwesome5 name="history" size={size} color={color} />
            );
          } else if (route.name === "Jogos") {
            return focused ? (
              <LottieView
                source={require("../Assets/Lottie/image-picture.json")}
                autoPlay={true}
                loop={true}
                style={{ width: 30, height: 30 }}
              />
            ) : (
              <AntDesign name="picture" size={size} color={color} />
            );
          } else if (route.name === "Configuracao") {
            return focused ? (
              <LottieView
                source={require("../Assets/Lottie/gears.json")}
                autoPlay={true}
                loop={true}
                style={{ width: 30, height: 30 }}
              />
            ) : (
              <Octicons name="gear" size={size} color={color} />
            );
          } else if (route.name === "Perfil") {
            return focused ? (
              <LottieView
                source={require("../Assets/Lottie/profile-icon.json")}
                autoPlay={true}
                loop={true}
                style={{ width: 30, height: 30 }}
              />
            ) : (
              <Octicons name="gear" size={size} color={color} />
            );
          }
        },

        tabBarActiveTintColor: "blue",
        tabBarInactiveTintColor: "grey",
        tabBarStyle: {
          marginBottom: 0,
          marginTop: 5,
          marginHorizontal: 0,
          borderRadius: 8,
          elevation: 0,
          position: "absolute",
          left: 0,
          justifyContent: "space-between",
          width: "100%",
          alignSelf: "center",
        },
        tabBarItemStyle: {
          borderRadius: 8,
          marginHorizontal: 5,
          marginVertical: 2,
        },
      })}
    >
      <Screen
        name="Inicial"
        component={Inicial}
        options={{
          headerShown: true,
          statusBarStyle: "dark",
          tabBarLabel: "INICIAL.",
          headerTitleAlign: "center",
          tabBarActiveBackgroundColor: "#B9B9B9",
          tabBarShowLabel: true,
          tabBarLabelStyle: { fontFamily: "Ubuntu_500Medium", color: "black" },
          headerTitle: "home",
          headerTitleStyle: { fontFamily: "Ubuntu_700Bold" },
          headerLeft: () => (
            <TouchableOpacity onPress={LogOut} style={{ marginRight: 10 }}>
              <LottieView
                source={require("../Assets/Lottie/log-out (1).json")}
                autoPlay={true}
                loop={true}
                style={{ width: 50, height: 50 }}
              />
            </TouchableOpacity>
          ),
          headerRight: () => (
            <TouchableOpacity onPress={() => navigation.navigate("Perfil")}>
              <Image
                source={{ uri: imageUrl }}
                style={{
                  width: 35,
                  height: 35,
                  marginLeft: 15,
                  borderRadius: 8,
                  borderWidth: 1,
                  borderColor: "#F6C445",
                }}
              />
            </TouchableOpacity>
          ),
        }}
      />

      <Screen
        name="Notificacao"
        component={Notificacao}
        options={{
          tabBarLabel: "HISTÓRICO",
          headerTitleAlign: "center",
          tabBarActiveBackgroundColor: "#B9B9B9",
          tabBarShowLabel: true,
          tabBarLabelStyle: { fontFamily: "Ubuntu_500Medium", color: "black" },
          headerTitle: "notificacao",
          headerTitleStyle: { fontFamily: "Ubuntu_700Bold" },
          headerRight: () => (
            <TouchableOpacity
              onPress={() => setUser(null)}
              style={{ marginRight: 10 }}
            >
              <LottieView
                source={require("../Assets/Lottie/log-out (1).json")}
                autoPlay={true}
                loop={true}
                style={{ width: 50, height: 50 }}
              />
            </TouchableOpacity>
          ),
          headerLeft: () => (
            <TouchableOpacity onPress={() => navigation.navigate("Perfil")}>
              <Image
                source={{ uri: imageUrl }}
                style={{
                  width: 35,
                  height: 35,
                  marginLeft: 15,
                  borderRadius: 8,
                  borderWidth: 1,
                  borderColor: "#F6C445",
                }}
              />
            </TouchableOpacity>
          ),
        }}
      />

      <Screen
        name="Jogos"
        component={Jogos}
        options={{
          headerShown: true,
          tabBarActiveBackgroundColor: "#B9B9B9",
          tabBarShowLabel: true,
          tabBarLabelStyle: { fontFamily: "Ubuntu_500Medium", color: "black" },
          tabBarLabel: "Jogos",
          headerTitleAlign: "center",
          headerTitle: "Jogos",
          headerTitleStyle: { fontFamily: "Ubuntu_700Bold" },
          headerRight: () => (
            <TouchableOpacity onPress={LogOut} style={{ marginRight: 10 }}>
              <LottieView
                source={require("../Assets/Lottie/log-out (1).json")}
                autoPlay={true}
                loop={true}
                style={{ width: 50, height: 50 }}
              />
            </TouchableOpacity>
          ),
          headerLeft: () => (
            <TouchableOpacity onPress={() => navigation.navigate("Perfil")}>
              <Image
                source={{ uri: imageUrl }}
                style={{
                  width: 35,
                  height: 35,
                  marginLeft: 15,
                  borderRadius: 8,
                  borderWidth: 1,
                  borderColor: "#F6C445",
                }}
              />
            </TouchableOpacity>
          ),
        }}
      />
      <Screen
        name="Configuracoes"
        component={Configuracoes}
        options={{
          headerShown: true,
          tabBarActiveBackgroundColor: "#B9B9B9",
          tabBarShowLabel: true,
          tabBarLabelStyle: { fontFamily: "Ubuntu_500Medium", color: "black" },
          tabBarLabel: "Configuracoes",
          headerTitleAlign: "center",
          headerTitle: "Configuracoes",
          headerTitleStyle: { fontFamily: "Ubuntu_700Bold" },
          headerRight: () => (
            <TouchableOpacity onPress={LogOut} style={{ marginRight: 10 }}>
              <LottieView
                source={require("../Assets/Lottie/log-out (1).json")}
                autoPlay={true}
                loop={true}
                style={{ width: 50, height: 50 }}
              />
            </TouchableOpacity>
          ),
          headerLeft: () => (
            <TouchableOpacity onPress={() => navigation.navigate("Perfil")}>
              <Image
                source={{ uri: imageUrl }}
                style={{
                  width: 35,
                  height: 35,
                  marginLeft: 15,
                  borderRadius: 8,
                  borderWidth: 1,
                  borderColor: "#F6C445",
                }}
              />
            </TouchableOpacity>
          ),
        }}
      />

      <Screen
        name="Perfil"
        component={Perfil}
        options={{
          tabBarLabel: "PERFIL",
          headerTitleAlign: "center",
          tabBarActiveBackgroundColor: "#B9B9B9",
          tabBarShowLabel: true,
          tabBarLabelStyle: { fontFamily: "Ubuntu_500Medium", color: "black" },
          headerTitle: "PERFIL",
          headerTitleStyle: { fontFamily: "Ubuntu_700Bold" },
          headerRight: () => (
            <TouchableOpacity onPress={LogOut} style={{ marginRight: 10 }}>
              <LottieView
                source={require("../Assets/Lottie/log-out (1).json")}
                autoPlay={true}
                loop={true}
                style={{ width: 50, height: 50 }}
              />
            </TouchableOpacity>
          ),
          headerLeft: () => (
            <TouchableOpacity
              onPress={() =>
                Alert.alert("EI...", "Você já está na tela de perfil. :)")
              }
            >
              <Image
                source={{ uri: imageUrl }}
                style={{
                  width: 35,
                  height: 35,
                  marginLeft: 15,
                  borderRadius: 8,
                  borderWidth: 1,
                  borderColor: "#F6C445",
                }}
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
      <Screen
        name="Inicial"
        component={Inicial}
        options={{ headerShown: false, statusBarStyle: "dark" }}
      />
      <Screen
        name="JogoLabirinto"
        component={JogoLabirinto}
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
    </Navigator>
  );
}
