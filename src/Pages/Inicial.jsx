import React, { useEffect, useState } from "react";
import { View, Text, TouchableOpacity, StyleSheet, Image, FlatList, ScrollView } from "react-native";
import { useAuth } from "../Hooks/Auth";
import { getAuth, signInWithEmailAndPassword } from "firebase/auth";
import AsyncStorage from "@react-native-async-storage/async-storage";
import Constants from 'expo-constants'
const statusBarHeight = Constants.statusBarHeight

export function Inicial() {
  const { user, setUser, token, setToken, signOut } = useAuth();
  const auth = getAuth();
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [photo, setPhoto] = useState("");

  
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
          console.log("Usuário logado com sucesso:", userCredential.user.email);
          inserirTudo(userCredential.user); 
        } catch (error) {
          console.error("Erro ao fazer login com e-mail e senha:", error);
        }
      } else {
        
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
  const DATA = Array.from({ length: 10 }, (_, i) => ({ id: i.toString() }));
  return (
    <ScrollView style={styles.container}>
      <View style={styles.bloco}>
        <Text> </Text>
      </View>
      <View style={styles.bloco}>
        <Text> </Text>
      </View>
      <View style={styles.bloco}>
        <Text> </Text>
      </View>
      <Text style={styles.title1}>ATIVIDADES</Text>
      <Text style={styles.subtitle}>Outras funções que desenvolvemos</Text>
      <FlatList
        data={DATA}
        horizontal
        keyExtractor={(item) => item.id}
        renderItem={() => <View style={styles.block} />}
        showsHorizontalScrollIndicator={false}
        style={{marginBottom:155}}
      />
      <Text>teste</Text>
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    paddingTop: statusBarHeight,
    backgroundColor: "#146ebb",
  },
  title: {
    fontSize: 20,
    marginBottom: 10,
  },
  bloco:{
    backgroundColor:"#059e56",
    height:120,
    borderRadius:8,
    width:'95%',
    alignSelf:"center",
    marginTop:15
  },
  title1:{
    color:'#fff',
    fontSize:35,
    letterSpacing:5, 
    marginLeft:25,
    marginBottom:5
  },
  subtitle:{
     color:'#fff',
     marginLeft:25,
     fontSize:15,
     fontStyle:'italic',
     marginBottom:35
  },
  flatlist:{
    backgroundColor:'red',
    width:'auto',
    height:100,
  },
  containerFlatlist:{
    backgroundColor:'grey'
  },
  block:{
    width: 150,
    height: 150,
    backgroundColor: "#d9d9d9",
    marginHorizontal: 10, 
    borderRadius:10,
    
  },
});