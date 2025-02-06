import React, { useEffect, useState } from "react";
import { View, Text, TouchableOpacity, StyleSheet, Image } from "react-native";
import { useAuth } from "../Hooks/Auth";
import { getAuth, signInWithEmailAndPassword } from "firebase/auth";
import AsyncStorage from "@react-native-async-storage/async-storage";

export function Home() {
  const { user, setUser, token, setToken, signOut } = useAuth();
  const auth = getAuth();
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [photo, setPhoto] = useState("");

  // Função para inserir os dados do usuário
  const inserirTudo = async (usuario) => {
    if (usuario) {
      setName(usuario.displayName || "Nome não disponível");
      setEmail(usuario.email || "E-mail não disponível");
      setPhoto(usuario.photoURL || "");
    }
  };

  useEffect(() => {
    const auth = getAuth();

    async function handleLogin() {
      const storedEmail = await AsyncStorage.getItem("@email");
      const storedPassword = await AsyncStorage.getItem("@senha");

      if (storedEmail && storedPassword) {
        try {
          const userCredential = await signInWithEmailAndPassword(
            auth,
            storedEmail,
            storedPassword
          );
          console.log("Usuário logado com sucesso:", userCredential.user.displayName);
          inserirTudo(userCredential.user); // Preenche os dados do usuário
        } catch (error) {
          console.error("Erro ao fazer login com e-mail e senha:", error);
        }
      } else {
        // Se não houver e-mail/senha no storage, use os dados de auth atual
        if (auth.currentUser) {
          inserirTudo(auth.currentUser);
        }
      }
    }

    // Verificar se o usuário está autenticado
    if (auth.currentUser) {
      inserirTudo(auth.currentUser);
    } else {
      handleLogin();
    }
  }, []); // Rodar uma vez ao montar o componente

  return (
    <View style={styles.container}>
      <Text style={styles.title}>Dados do Usuário</Text>
      <Text>NOME: {name}</Text>
      <Text>EMAIL: {email}</Text>
      {photo ? <Image source={{ uri: photo }} style={{ width: 100, height: 100 }} /> : null}

      <TouchableOpacity onPress={signOut}>
        <Text>SAIR</Text>
      </TouchableOpacity>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    marginTop: 25,
    backgroundColor: "#b9b9b9",
    textAlign: "center",
    justifyContent: "center",
  },
  title: {
    fontSize: 20,
    marginBottom: 10,
  },
});
