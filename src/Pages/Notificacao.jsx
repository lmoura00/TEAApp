import React from "react";
import {
  View,
  Text,
  Image,
  StyleSheet,
  TouchableOpacity,
  FlatList,
} from "react-native";
import Constants from 'expo-constants'
const statusBarHeight = Constants.statusBarHeight
function Notificacao() {
  const notifications = [
    { id: "1", message: "Nova mensagem recebida" },
    { id: "2", message: "Atualização disponível" },
    { id: "3", message: "Lembrete: Reunião às 15h" },
  ];

  return (
    <View style={{ backgroundColor: "#146ebb", flex: 1, paddingTop:statusBarHeight, paddingHorizontal:5 }}>
      <Text style={styles.title}>Notificações</Text>
      <FlatList
        data={notifications}
        keyExtractor={(item) => item.id}
        renderItem={({ item }) => (
          <View style={styles.notificationItem}>
            <Text style={styles.notificationText}>{item.message}</Text>
          </View>
        )}
      />
    </View>
  );
}
const styles = StyleSheet.create({
    container: {
      flex: 1,
      padding: 20,
      backgroundColor: '#f5f5f5',
    },
    title: {
      fontSize: 24,
      fontWeight: 'bold',
      color: '#333',
      marginBottom: 20,
    },
    notificationItem: {
      padding: 15,
      backgroundColor: '#fff',
      borderRadius: 10,
      marginBottom: 10,
      elevation: 2,
    },
    notificationText: {
      fontSize: 16,
      color: '#333',
    },
  });
  
export default Notificacao;
