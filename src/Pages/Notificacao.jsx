import React, { useEffect, useState } from "react";
import { View, Text, FlatList, TouchableOpacity, StyleSheet, Button, Alert } from "react-native";
import { getDatabase, ref, onValue, update, remove } from "firebase/database";
import { getAuth } from "firebase/auth";
import Constants from 'expo-constants';

const statusBarHeight = Constants.statusBarHeight;

function Notificacao() {
  const [notifications, setNotifications] = useState([]);
  const auth = getAuth();

  // Buscar notificações
  useEffect(() => {
    const db = getDatabase();
    const notificationsRef = ref(db, `users/${auth.currentUser.uid}/notifications`);

    const unsubscribe = onValue(notificationsRef, (snapshot) => {
      const data = snapshot.val();
      if (data) {
        const notificationsList = Object.keys(data).map((key) => ({
          id: key,
          ...data[key],
        }));
        // Ordenar notificações por data (mais recentes primeiro)
        notificationsList.sort((a, b) => b.timestamp - a.timestamp);
        setNotifications(notificationsList);
      } else {
        setNotifications([]);
      }
    });

    return () => unsubscribe();
  }, []);

  // Marcar notificações como lidas ao abrir a página
  useEffect(() => {
    const db = getDatabase();
    const markNotificationsAsRead = async () => {
      const updates = {};
      notifications.forEach((notification) => {
        if (!notification.read) {
          updates[`users/${auth.currentUser.uid}/notifications/${notification.id}/read`] = true;
        }
      });

      if (Object.keys(updates).length > 0) {
        await update(ref(db), updates);

        // Atualizar o estado local para refletir as notificações como lidas
        setNotifications((prevNotifications) =>
          prevNotifications.map((notification) => ({
            ...notification,
            read: true,
          }))
        );
      }
    };

    markNotificationsAsRead();
  }, [notifications]); // Executar sempre que o estado `notifications` mudar

  // Função para apagar todas as notificações
  const deleteAllNotifications = async () => {
    const db = getDatabase();
    const notificationsRef = ref(db, `users/${auth.currentUser.uid}/notifications`);

    Alert.alert(
      "Apagar Notificações",
      "Tem certeza que deseja apagar todas as notificações?",
      [
        {
          text: "Cancelar",
          style: "cancel",
        },
        {
          text: "Apagar",
          onPress: async () => {
            await remove(notificationsRef);
            setNotifications([]);
          },
          style: "destructive",
        },
      ]
    );
  };

  return (
    <View style={styles.container}>
      <View style={styles.header}>
        <Text style={styles.title}>Notificações</Text>
        <TouchableOpacity onPress={deleteAllNotifications} style={styles.deleteButton}>
          <Text style={styles.deleteButtonText}>Apagar tudo</Text>
        </TouchableOpacity>
      </View>

      <FlatList
        data={notifications}
        keyExtractor={(item) => item.id}
        renderItem={({ item }) => (
          <TouchableOpacity style={styles.notificationItem}>
            <Text style={styles.notificationTitle}>{item.title}</Text>
            <Text style={styles.notificationBody}>{item.body}</Text>
            <Text style={styles.notificationTime}>
              {new Date(item.timestamp).toLocaleString()}
            </Text>
          </TouchableOpacity>
        )}
        ListEmptyComponent={
          <View style={styles.emptyContainer}>
            <Text style={styles.emptyText}>Nenhuma notificação encontrada.</Text>
          </View>
        }
      />
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: "#146ebb",
    paddingTop: statusBarHeight,
    paddingHorizontal: 10,
  },
  header: {

    alignItems: "center",
    marginBottom: 20, 
    marginTop: 10
  },
  title: {
    fontSize: 24,
    fontWeight: 'bold',
    color: '#fff',
    marginBottom: 20,
    textAlign: 'center',
  },
  notificationItem: {
    padding: 15,
    backgroundColor: '#fff',
    borderRadius: 10,
    marginBottom: 10,
    elevation: 2,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
  },
  notificationTitle: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#2E86C1',
  },
  notificationBody: {
    fontSize: 16,
    color: '#555',
    marginTop: 5,
  },
  notificationTime: {
    fontSize: 14,
    color: '#888',
    marginTop: 5,
  },
  emptyContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  emptyText: {
    fontSize: 16,
    color: '#fff',
  },
  deleteButton: {
    backgroundColor: 'red',
    padding: 10,
    borderRadius: 5,
    marginTop: 10,
    width:110,
    position: 'absolute',
    top: -10,
    right: 10
  },
  deleteButtonText: {
    color: '#fff',
    fontSize: 16,
    fontWeight: 'bold',
    textAlign: 'center',
  },
});

export default Notificacao;