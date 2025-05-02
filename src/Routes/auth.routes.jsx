import React, { useEffect, useState } from "react";
import {
  Text,
  TouchableOpacity,
  Image,
  View,
  ActivityIndicator,
} from "react-native";
import { useNavigation } from "@react-navigation/native";
import { createBottomTabNavigator } from "@react-navigation/bottom-tabs";
import { createNativeStackNavigator } from "@react-navigation/native-stack";
import {
  AntDesign,
  FontAwesome5,
  Octicons,
  Feather,
} from "@expo/vector-icons";
import Ionicons from "@expo/vector-icons/Ionicons";
import LottieView from "lottie-react-native";
import { getAuth, signOut, onAuthStateChanged } from "firebase/auth";
import { getStorage, ref as sRef, getDownloadURL } from "firebase/storage";
import { getDatabase, ref, set, onValue } from "firebase/database";
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
import Dependentes from "../Pages/Dependentes";
import DetalhesDependente from "../Pages/DetalhesDependente";

function AuthRoutesTabBar() {
  const navigation = useNavigation();
  const { signOut } = useAuth();
  const { Navigator, Screen } = createBottomTabNavigator();
  const auth = getAuth();
  const [unreadNotificationsCount, setUnreadNotificationsCount] = useState(0);
  const [isUserAuthenticated, setIsUserAuthenticated] = useState(false);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, (user) => {
      if (user) {
        setIsUserAuthenticated(true);
        countUnreadNotifications(user.uid);
      } else {
        setIsUserAuthenticated(false);
      }
      setIsLoading(false);
    });

    return () => unsubscribe();
  }, []);

  const countUnreadNotifications = (userId) => {
    const db = getDatabase();
    const notificationsRef = ref(db, `users/${userId}/notifications`);

    onValue(notificationsRef, (snapshot) => {
      const data = snapshot.val();
      if (data) {
        const notificationsList = Object.values(data);
        const unreadCount = notificationsList.filter(
          (notification) => !notification.read
        ).length;
        setUnreadNotificationsCount(unreadCount);
      } else {
        setUnreadNotificationsCount(0);
      }
    });
  };

  if (isLoading) {
    return (
      <View style={styles.loadingContainer}>
        <ActivityIndicator size="large" color="#3498db" />
      </View>
    );
  }

  async function handleLogin() {
    const storedEmail = await AsyncStorage.getItem("@email");
    const storedPassword = await AsyncStorage.getItem("@senha");

    if (storedEmail && storedPassword) {
      try {
        await signInWithEmailAndPassword(auth, storedEmail, storedPassword);
      } catch (error) {
        console.error("Erro ao fazer login:", error);
      }
    } 
  }

  if (!isUserAuthenticated) {
    handleLogin();
  }

  function LogOut() {
    signOut();
  }

  return (
    <Navigator
      screenOptions={({ route }) => ({
        tabBarIcon: ({ focused, color, size }) => {
          let iconName;
          let iconComponent;
          let animation;

          if (route.name === "Inicial") {
            iconName = focused ? "home" : "home-outline";
            iconComponent = (
              <Ionicons name={iconName} size={28} color={color} />
            );
            animation = require("../Assets/Lottie/home-icon.json");
          } else if (route.name === "Jogos") {
            iconName = focused ? "game-controller" : "game-controller-outline";
            iconComponent = (
              <Ionicons name={iconName} size={28} color={color} />
            );
            animation = require("../Assets/Lottie/playGames.json");
          } else if (route.name === "Configuracoes") {
            iconName = focused ? "settings" : "settings-outline";
            iconComponent = (
              <Ionicons name={iconName} size={28} color={color} />
            );
            animation = require("../Assets/Lottie/gears.json");
          } else if (route.name === "Perfil") {
            iconName = focused ? "person" : "person-outline";
            iconComponent = (
              <Ionicons name={iconName} size={28} color={color} />
            );
            animation = require("../Assets/Lottie/profile-icon.json");
          }

          return (
            <View style={styles.tabIconContainer}>
              <TabBarIcon focused={focused} animation={animation} icon={iconComponent} />
              {focused && <View style={styles.activeTabIndicator} />}
            </View>
          );
        },
        tabBarActiveTintColor: "#3498db",
        tabBarInactiveTintColor: "#95a5a6",
        tabBarStyle: styles.tabBar,
        tabBarItemStyle: styles.tabBarItem,
        tabBarShowLabel: false,
        headerTitleAlign: "center",
        headerStyle: styles.header,
        headerTitleStyle: styles.headerTitle,
        headerLeft: () => (
          <TouchableOpacity onPress={LogOut} style={styles.headerLeftButton}>
            <Ionicons name="log-out-outline" size={28} color="#3498db" />
          </TouchableOpacity>
        ),
        headerRight: () => (
          <TouchableOpacity
            onPress={() => navigation.navigate("Notificacao")}
            style={styles.headerRightButton}
          >
            <Ionicons name="notifications-outline" size={28} color="#3498db" />
            {unreadNotificationsCount > 0 && (
              <View style={styles.badge}>
                <Text style={styles.badgeText}>
                  {unreadNotificationsCount > 9 ? "9+" : unreadNotificationsCount}
                </Text>
              </View>
            )}
          </TouchableOpacity>
        ),
      })}
    >
      <Screen
        name="Inicial"
        component={Inicial}
        options={{
          headerTitle: () => (
            <Image
              source={require("../../assets/adaptive-icon.png")}
              style={styles.headerLogo}
            />
          ),
        }}
      />
      <Screen
        name="Jogos"
        component={Jogos}
        options={{
          headerTitle: () => (
            <Image
              source={require("../../assets/adaptive-icon.png")}
              style={styles.headerLogo}
            />
          ),
        }}
      />
      <Screen
        name="Configuracoes"
        component={Configuracoes}
        options={{
          headerTitle: () => (
            <Image
              source={require("../../assets/adaptive-icon.png")}
              style={styles.headerLogo}
            />
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
        options={{ headerStyle: { backgroundColor: "#f4f6fc" } }}
      />
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
      <Screen
        name="Perfil"
        component={Perfil}
        options={{ headerShown: false, statusBarStyle: "dark" }}
      />
      <Screen
        name="Dependentes"
        component={Dependentes}
        options={{ headerShown: false, statusBarStyle: "dark" }}
      />
      <Screen
        name="DetalhesDependente"
        component={DetalhesDependente}
        options={{ headerShown: false, statusBarStyle: "dark" }}
      />
    </Navigator>
  );
}
