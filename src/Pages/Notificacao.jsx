import React, { useEffect, useState } from "react";
import { View, Text, FlatList, TouchableOpacity, StyleSheet } from "react-native";
import { getDatabase, ref, onValue, update } from "firebase/database";
import { getAuth } from "firebase/auth";
import Constants from 'expo-constants';

const statusBarHeight = Constants.statusBarHeight;

function Notificacao() {
  const [notifications, setNotifications] = useState([]);
  const auth = getAuth();

  useEffect(() => {
    const db = getDatabase();
    const notificationsRef = ref(db, `users/${auth.currentUser.uid}/notifications`);

    // Buscar notificações
    const unsubscribe = onValue(notificationsRef, (snapshot) => {
      const data = snapshot.val();
      if (data) {
        const notificationsList = Object.keys(data).map((key) => ({
          id: key,
          ...data[key],
        }));
        setNotifications(notificationsList);
      } else {
        setNotifications([]);
      }
    });

    // Marcar notificações como lidas ao abrir a página
    const markNotificationsAsRead = async () => {
      const updates = {};
      notifications.forEach((notification) => {
        if (!notification.read) {
          updates[`users/${auth.currentUser.uid}/notifications/${notification.id}/read`] = true;
        }
      });
      await update(ref(db), updates);
    };

    markNotificationsAsRead();

    return () => unsubscribe();
  }, []);

  return (
    <View style={styles.container}>
      <Text style={styles.title}>Notificações</Text>
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
});

export default Notificacao;