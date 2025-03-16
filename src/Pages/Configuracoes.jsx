import React, { useState, useEffect } from "react";
import { View, Text, TouchableOpacity, ScrollView, StyleSheet } from "react-native";
import Perfil from "./Perfil";
import Dependentes from "./Dependentes";
import { useAuth } from "../Hooks/Auth";

function Configuracoes() {
  const { user } = useAuth();
  const [currentTab, setCurrentTab] = useState("Perfil");

  return (
    <View style={styles.container}>
      <View style={styles.tabs}>
        <TouchableOpacity
          style={[styles.tab, currentTab === "Perfil" && styles.activeTab]}
          onPress={() => setCurrentTab("Perfil")}
        >
          <Text style={styles.tabText}>Perfil</Text>
        </TouchableOpacity>
        <TouchableOpacity
          style={[styles.tab, currentTab === "Dependentes" && styles.activeTab]}
          onPress={() => setCurrentTab("Dependentes")}
        >
          <Text style={styles.tabText}>Dependentes</Text>
        </TouchableOpacity>
      </View>

      <ScrollView style={styles.content}>
        {currentTab === "Perfil" ? (
          <Perfil user={user} />
        ) : (
          <Dependentes user={user} />
        )}
      </ScrollView>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: "#146ebb",
    paddingBottom:65,
    //marginBottom:45
  },
  tabs: {
    flexDirection: "row",
    justifyContent: "space-around",
    backgroundColor: "#059e56",
    paddingVertical: 10,
  },
  tab: {
    padding: 10,
  },
  activeTab: {
    borderBottomWidth: 2,
    borderBottomColor: "#fff",
  },
  tabText: {
    color: "#fff",
    fontSize: 18,
    fontWeight: "bold",
  },
  content: {
    flex: 1,
    padding: 20,
  },
});

export default Configuracoes;