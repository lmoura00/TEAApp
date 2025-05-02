import React, { useEffect, useState } from "react";
import { 
  View, 
  Text, 
  FlatList, 
  TouchableOpacity, 
  StyleSheet, 
  Alert,
  RefreshControl,
  SafeAreaView
} from "react-native";
import { getDatabase, ref, onValue, update, remove } from "firebase/database";
import { getAuth } from "firebase/auth";
import Constants from 'expo-constants';
import { LinearGradient } from 'expo-linear-gradient';
import { Ionicons } from '@expo/vector-icons';
import dayjs from 'dayjs';
import relativeTime from 'dayjs/plugin/relativeTime';
import 'dayjs/locale/pt-br';

dayjs.extend(relativeTime);
dayjs.locale('pt-br');

const statusBarHeight = Constants.statusBarHeight;

function Notificacao() {
  const [notifications, setNotifications] = useState([]);
  const [refreshing, setRefreshing] = useState(false);
  const auth = getAuth();

  const fetchNotifications = () => {
    const db = getDatabase();
    const notificationsRef = ref(db, `users/${auth.currentUser.uid}/notifications`);

    onValue(notificationsRef, (snapshot) => {
      const data = snapshot.val();
      if (data) {
        const notificationsList = Object.keys(data).map((key) => ({
          id: key,
          ...data[key],
        }));
        notificationsList.sort((a, b) => b.timestamp - a.timestamp);
        setNotifications(notificationsList);
      } else {
        setNotifications([]);
      }
      setRefreshing(false);
    });
  };

  useEffect(() => {
    fetchNotifications();
  }, []);

  const markNotificationsAsRead = async () => {
    const db = getDatabase();
    const updates = {};
    notifications.forEach((notification) => {
      if (!notification.read) {
        updates[`users/${auth.currentUser.uid}/notifications/${notification.id}/read`] = true;
      }
    });

    if (Object.keys(updates).length > 0) {
      await update(ref(db), updates);
      setNotifications(prevNotifications =>
        prevNotifications.map(notification => ({
          ...notification,
          read: true
        }))
      );
    }
  };

  const deleteAllNotifications = async () => {
    Alert.alert(
      "Limpar Notificações",
      "Tem certeza que deseja apagar todas as notificações?",
      [
        {
          text: "Cancelar",
          style: "cancel"
        },
        {
          text: "Limpar",
          onPress: async () => {
            const db = getDatabase();
            await remove(ref(db, `users/${auth.currentUser.uid}/notifications`));
            setNotifications([]);
          },
          style: "destructive"
        }
      ]
    );
  };

  const deleteNotification = (id) => {
    Alert.alert(
      "Apagar Notificação",
      "Deseja remover esta notificação?",
      [
        {
          text: "Cancelar",
          style: "cancel"
        },
        {
          text: "Apagar",
          onPress: async () => {
            const db = getDatabase();
            await remove(ref(db, `users/${auth.currentUser.uid}/notifications/${id}`));
          }
        }
      ]
    );
  };

  const onRefresh = () => {
    setRefreshing(true);
    fetchNotifications();
    markNotificationsAsRead();
  };

  const renderNotificationItem = ({ item }) => (
    <View style={[
      styles.notificationCard,
      !item.read && styles.unreadNotification
    ]}>
      <View style={styles.notificationHeader}>
        <Text style={styles.notificationTitle}>{item.title}</Text>
        <TouchableOpacity 
          onPress={() => deleteNotification(item.id)}
          style={styles.deleteIcon}
        >
          <Ionicons name="close" size={20} color="#95a5a6" />
        </TouchableOpacity>
      </View>
      <Text style={styles.notificationBody}>{item.body}</Text>
      <Text style={styles.notificationTime}>
        {dayjs(item.timestamp).fromNow()}
      </Text>
    </View>
  );

  return (
    <LinearGradient
      colors={['#3498db', '#2c3e50']}
      style={styles.background}
    >
      <SafeAreaView style={styles.safeArea}>
        <View style={styles.container}>
          <View style={styles.header}>
            <Text style={styles.title}>Notificações</Text>
            {notifications.length > 0 && (
              <TouchableOpacity 
                onPress={deleteAllNotifications}
                style={styles.clearButton}
              >
                <Ionicons name="trash-outline" size={24} color="#fff" />
              </TouchableOpacity>
            )}
          </View>

          <FlatList
            data={notifications}
            keyExtractor={(item) => item.id}
            renderItem={renderNotificationItem}
            contentContainerStyle={styles.listContent}
            ListEmptyComponent={
              <View style={styles.emptyContainer}>
                <Ionicons name="notifications-off-outline" size={48} color="#bdc3c7" />
                <Text style={styles.emptyText}>Nenhuma notificação</Text>
                <Text style={styles.emptySubtext}>Você não tem novas notificações</Text>
              </View>
            }
            refreshControl={
              <RefreshControl
                refreshing={refreshing}
                onRefresh={onRefresh}
                colors={['#fff']}
                tintColor="#fff"
              />
            }
          />
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
  },
  title: {
    fontSize: 24,
    fontWeight: '700',
    color: '#fff',
  },
  clearButton: {
    padding: 5,
  },
  listContent: {
    paddingHorizontal: 15,
    paddingBottom: 20,
  },
  notificationCard: {
    backgroundColor: '#fff',
    borderRadius: 12,
    padding: 16,
    marginBottom: 12,
    shadowColor: '#000',
    shadowOffset: {
      width: 0,
      height: 2,
    },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 3,
  },
  unreadNotification: {
    borderLeftWidth: 4,
    borderLeftColor: '#2ecc71',
  },
  notificationHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginBottom: 8,
  },
  notificationTitle: {
    fontSize: 16,
    fontWeight: '600',
    color: '#2c3e50',
    flex: 1,
  },
  deleteIcon: {
    padding: 4,
  },
  notificationBody: {
    fontSize: 14,
    color: '#7f8c8d',
    marginBottom: 8,
    lineHeight: 20,
  },
  notificationTime: {
    fontSize: 12,
    color: '#bdc3c7',
    textAlign: 'right',
  },
  emptyContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    padding: 40,
  },
  emptyText: {
    fontSize: 18,
    color: '#fff',
    fontWeight: '600',
    marginTop: 16,
  },
  emptySubtext: {
    fontSize: 14,
    color: '#bdc3c7',
    marginTop: 8,
  },
});

export default Notificacao;