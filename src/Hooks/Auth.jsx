import React, { useState, useEffect, createContext, useContext } from "react";
import AsyncStorage from "@react-native-async-storage/async-storage";

const AuthContext = createContext();

export function AuthProvider({ children }) {
  const [user, setUser] = useState(null);
  const [token, setToken] = useState(null);
  const [loading, setLoading] = useState(true); // Indica se os dados estão sendo carregados

  // Carregar sessão ao iniciar o app
  useEffect(() => {
    async function loadStorageData() {
      try {
        const storedToken = await AsyncStorage.getItem("@token");
        const storedUser = await AsyncStorage.getItem("@user");


        if (storedToken && storedUser) {
          setToken(storedToken);
          setUser(JSON.parse(storedUser));
        }
      } catch (error) {
        console.error("Erro ao carregar sessão:", error);
      } finally {
        setLoading(false);
      }
    }

    loadStorageData();
  }, []);

  // Função para logout
  async function signOut() {
    await AsyncStorage.removeItem("@token");
    await AsyncStorage.removeItem("@user");
    await AsyncStorage.removeItem("@email");
    await AsyncStorage.removeItem("@senha");
    setToken(null);
    setUser(null);
  }

  return (
    <AuthContext.Provider value={{ user, token, setToken, setUser, signOut }}>
      {!loading && children} 
    </AuthContext.Provider>
  );
}

export function useAuth() {
  return useContext(AuthContext);
}
