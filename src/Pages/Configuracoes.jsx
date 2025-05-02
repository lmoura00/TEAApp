import React, { useState, useEffect } from "react";
import { 
  View, 
  Text, 
  TouchableOpacity, 
  ScrollView, 
  StyleSheet,
  SafeAreaView,
  Dimensions
} from "react-native";
import Perfil from "./Perfil";
import Dependentes from "./Dependentes";
import { useAuth } from "../Hooks/Auth";
import { LinearGradient } from 'expo-linear-gradient';
import { Ionicons } from '@expo/vector-icons';
import Constants from 'expo-constants';

const { width } = Dimensions.get('window');
const statusBarHeight = Constants.statusBarHeight;

function Configuracoes() {
  const { user, signOut } = useAuth();
  const [currentTab, setCurrentTab] = useState("Perfil");

  const tabs = [
    { id: "Perfil", icon: "person-outline", label: "Perfil" },
    { id: "Dependentes", icon: "people-outline", label: "Dependentes" },
  ];

  return (
    <LinearGradient
      colors={['#3498db', '#2c3e50']}
      style={styles.background}
    >
      <SafeAreaView style={styles.safeArea}>
        <View style={styles.container}>
          {/* Header */}
          <View style={styles.header}>
            <Text style={styles.headerTitle}>Configurações</Text>

          </View>

          {/* Tabs */}
          <View style={styles.tabsContainer}>
            {tabs.map((tab) => (
              <TouchableOpacity
                key={tab.id}
                style={[
                  styles.tab,
                  currentTab === tab.id && styles.activeTab,
                  { width: (width - 40) / tabs.length }
                ]}
                onPress={() => setCurrentTab(tab.id)}
                activeOpacity={0.7}
              >
                <Ionicons 
                  name={tab.icon} 
                  size={24} 
                  color={currentTab === tab.id ? "#3498db" : "#95a5a6"} 
                />
                <Text style={[
                  styles.tabText,
                  currentTab === tab.id && styles.activeTabText
                ]}>
                  {tab.label}
                </Text>
                {currentTab === tab.id && <View style={styles.tabIndicator} />}
              </TouchableOpacity>
            ))}
          </View>

          {/* Content */}
          <ScrollView 
            style={styles.content}
            showsVerticalScrollIndicator={false}
          >
            {currentTab === "Perfil" ? (
              <Perfil user={user} />
            ) : (
              <Dependentes user={user} />
            )}
          </ScrollView>
        </View>
      </SafeAreaView>
    </LinearGradient>
  );
}

const styles = StyleSheet.create({
  background: {
    flex: 1,
  },
  safeArea: {
    flex: 1,
  },
  container: {
    flex: 1,
    paddingTop: statusBarHeight,
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingHorizontal: 20,
    paddingVertical: 15,
    marginTop: -50,
  },
  headerTitle: {
    fontSize: 24,
    fontWeight: '700',
    color: '#fff',
  },
  logoutButton: {
    padding: 5,
  },
  tabsContainer: {
    flexDirection: 'row',
    backgroundColor: '#fff',
    marginHorizontal: 20,
    marginTop: 10,
    borderRadius: 10,
    padding: 5,
    shadowColor: '#000',
    shadowOffset: {
      width: 0,
      height: 2,
    },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 3,
  },
  tab: {
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 12,
    position: 'relative',
  },
  activeTab: {
    backgroundColor: '#f8f9fa',
    borderRadius: 8,
  },
  tabText: {
    fontSize: 14,
    fontWeight: '600',
    color: '#95a5a6',
    marginTop: 5,
  },
  activeTabText: {
    color: '#3498db',
  },
  tabIndicator: {
    position: 'absolute',
    bottom: 0,
    height: 3,
    width: '80%',
    backgroundColor: '#3498db',
    borderRadius: 3,
  },
  content: {
    flex: 1,
    paddingHorizontal: 20,
    marginTop: 15,
  },
});

export default Configuracoes;