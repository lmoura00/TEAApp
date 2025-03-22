import React, { useState, useEffect } from "react";
import {
  View,
  Text,
  StyleSheet,
  TextInput,
  TouchableOpacity,
  ActivityIndicator,
  Dimensions,
  Alert,
  Image
} from "react-native";
import { Ionicons } from "@expo/vector-icons";
import { useNavigation } from "@react-navigation/native";
import { useAuth } from "../Hooks/Auth";
import AsyncStorage from '@react-native-async-storage/async-storage';
import { getAuth, signInWithEmailAndPassword } from "firebase/auth";

export function Login() {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [passwordVisible, setPasswordVisible] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [rememberMe, setRememberMe] = useState(false);

  const { setUser, setToken } = useAuth();
  const navigation = useNavigation();
  const { width } = Dimensions.get("window");

  async function handleSignIn() {
    if (!email || !password) {
      Alert.alert("Erro", "Por favor, preencha todos os campos.");
      return;
    }

    setIsLoading(true);
    const auth = getAuth();

    try {
      const userCredential = await signInWithEmailAndPassword(auth, email, password);
      const userToken = await userCredential.user.getIdToken();
      const userData = JSON.stringify(userCredential.user);

      await AsyncStorage.setItem('@token', userToken);
      await AsyncStorage.setItem('@user', userData);

      if (rememberMe) {
        await AsyncStorage.setItem("@email", email);
        await AsyncStorage.setItem("@senha", password);
        await AsyncStorage.setItem("@rememberMe", "true");
      } else {
        await AsyncStorage.removeItem("@email");
        await AsyncStorage.removeItem("@senha");
        await AsyncStorage.removeItem("@rememberMe");
      }

      setToken(userToken);
      setUser(userCredential.user);

      //Alert.alert("Sucesso", "Login realizado com sucesso!");
      //navigation.navigate("Initial"); // Redireciona para a tela principal
    } catch (error) {
      Alert.alert("Erro", "E-mail ou senha inválidos.");
    } finally {
      setIsLoading(false);
    }
  }

  useEffect(() => {
    const loadSavedCredentials = async () => {
      const savedEmail = await AsyncStorage.getItem('@email');
      const savedPassword = await AsyncStorage.getItem('@senha');
      if (savedEmail && savedPassword) {
        setEmail(savedEmail);
        setPassword(savedPassword);
        setRememberMe(true);
      }
    };

    loadSavedCredentials();
  }, []);

  return (
    <View style={styles.container}>
      <View style={styles.containerLogo}>
        <Image
          source={require("../images/Praticamente.png")} // Substitua pelo caminho correto
          style={{ width: 200, height: 200, borderRadius: 20 }}
        />
      </View>

      <View style={styles.containerInput}>
        <View style={styles.inputContainer}>
          <View style={styles.inputWrapper}>
            <Ionicons name="mail-outline" size={20} color="#666" style={styles.icon} />
            <TextInput
              placeholder="Digite seu e-mail"
              placeholderTextColor="#666"
              keyboardType="email-address"
              value={email}
              onChangeText={setEmail}
              style={styles.input}
            />
          </View>

          <View style={styles.inputWrapper}>
            <Ionicons name="lock-closed-outline" size={20} color="#666" style={styles.icon} />
            <TextInput
              placeholder="Digite sua senha"
              placeholderTextColor="#666"
              secureTextEntry={!passwordVisible}
              value={password}
              onChangeText={setPassword}
              style={styles.input}
            />
            <TouchableOpacity onPress={() => setPasswordVisible(!passwordVisible)}>
              <Ionicons name={passwordVisible ? "eye-off-outline" : "eye-outline"} size={20} color="#666" />
            </TouchableOpacity>
          </View>

          <TouchableOpacity onPress={() => setRememberMe(!rememberMe)} style={styles.rememberMe}>
            <Ionicons name={rememberMe ? "checkbox-outline" : "square-outline"} size={20} color="#666" />
            <Text style={styles.rememberMeText}>Lembrar de mim</Text>
          </TouchableOpacity>

          <TouchableOpacity onPress={() => navigation.navigate("EsqueciSenha")}>
            <Text style={styles.forgotPassword}>Esqueci a senha</Text>
          </TouchableOpacity>
        </View>

        <TouchableOpacity style={styles.button} onPress={handleSignIn} disabled={isLoading}>
          {isLoading ? (
            <ActivityIndicator color="#fff" />
          ) : (
            <Text style={styles.buttonText}>ENTRAR</Text>
          )}
        </TouchableOpacity>

        <TouchableOpacity style={styles.secondaryButton} onPress={() => navigation.navigate("Cad")}>
          <Text style={styles.secondaryButtonText}>CADASTRAR</Text>
        </TouchableOpacity>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
    backgroundColor: "#f4f6fc", // Cor de fundo temporária
  },
  containerLogo: {
    flex: 0.4,
    justifyContent: "center",
    alignItems: "center",
  },
  containerInput: {
    flex: 0.6,
    justifyContent: "center",
    alignItems: "center",
    width: "100%",
  },
  inputContainer: {
    width: "90%",
    alignItems: "center",
  },
  inputWrapper: {
    flexDirection: "row",
    alignItems: "center",
    backgroundColor: "#fff",
    borderRadius: 8,
    paddingHorizontal: 10,
    marginBottom: 15,
    width: "100%",
    elevation: 3,
  },
  input: {
    flex: 1,
    height: 50,
    paddingHorizontal: 10,
    fontSize: 16,
  },
  icon: {
    marginRight: 10,
  },
  rememberMe: {
    flexDirection: "row",
    alignItems: "center",
    alignSelf: "flex-start",
    marginBottom: 15,
  },
  rememberMeText: {
    marginLeft: 5,
    color: "#666",
  },
  forgotPassword: {
    color: "#666",
    textDecorationLine: "underline",
    marginBottom: 20,
  },
  button: {
    backgroundColor: "#0dff31",
    height: 50,
    borderRadius: 8,
    justifyContent: "center",
    alignItems: "center",
    width: "90%",
    marginBottom: 15,
    elevation: 3,
  },
  buttonText: {
    fontSize: 18,
    fontWeight: "bold",
    color: "#fff",
  },
  secondaryButton: {
    backgroundColor: "#e1e1e1",
    height: 50,
    borderRadius: 8,
    justifyContent: "center",
    alignItems: "center",
    width: "90%",
    elevation: 3,
  },
  secondaryButtonText: {
    fontSize: 18,
    fontWeight: "bold",
    color: "#333",
  },
});