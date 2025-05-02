import React, { useState, useEffect } from "react";
import {
  View,
  Text,
  FlatList,
  TouchableOpacity,
  Image,
  Modal,
  TextInput,
  Alert,
  StyleSheet,
  ActivityIndicator,
  ScrollView,
  SafeAreaView
} from "react-native";
import * as ImagePicker from "expo-image-picker";
import { getAuth } from "firebase/auth";
import { getDatabase, ref, set, onValue, remove } from "firebase/database";
import { getStorage, ref as sRef, uploadBytes, getDownloadURL } from "firebase/storage";
import { TextInputMask } from "react-native-masked-text";
import { Ionicons } from '@expo/vector-icons';
import { LinearGradient } from 'expo-linear-gradient';
import Constants from 'expo-constants';

const statusBarHeight = Constants.statusBarHeight;

function Dependentes({ user }) {
  const [dependents, setDependents] = useState([]);
  const [modalVisible, setModalVisible] = useState(false);
  const [loading, setLoading] = useState(false);
  const [newDependentName, setNewDependentName] = useState("");
  const [newDependentBirthdate, setNewDependentBirthdate] = useState("");
  const [image, setImage] = useState(null);
  const [editingDependent, setEditingDependent] = useState(null);

  useEffect(() => {
    const db = getDatabase();
    const dependentsRef = ref(db, `users/${user.uid}/dependents`);
    
    const unsubscribe = onValue(dependentsRef, (snapshot) => {
      const data = snapshot.val();
      if (data) {
        const dependentsList = Object.keys(data).map((key) => ({
          id: key,
          ...data[key],
        }));
        setDependents(dependentsList);
      } else {
        setDependents([]);
      }
    });

    return () => unsubscribe();
  }, [user]);

  const pickImage = async () => {
    const { status } = await ImagePicker.requestMediaLibraryPermissionsAsync();
    if (status !== 'granted') {
      Alert.alert('Permissão necessária', 'Precisamos de acesso à sua galeria para selecionar uma foto.');
      return;
    }

    let result = await ImagePicker.launchImageLibraryAsync({
      mediaTypes: ImagePicker.MediaTypeOptions.Images,
      allowsEditing: true,
      aspect: [1, 1],
      quality: 0.8,
    });

    if (!result.canceled) {
      setImage(result.assets[0].uri);
    }
  };

  const uploadImage = async () => {
    if (image) {
      try {
        const response = await fetch(image);
        const blob = await response.blob();
        const storageRef = sRef(
          getStorage(),
          `dependent_images/${user.uid}/${new Date()
            .toISOString()
            .replace(/[:.]/g, "-")}.jpg`
        );
        await uploadBytes(storageRef, blob);
        return await getDownloadURL(storageRef);
      } catch (error) {
        console.error("Erro ao fazer upload da imagem:", error);
        return null;
      }
    }
    return null;
  };

  const saveDependent = async () => {
    if (!newDependentName.trim() || !newDependentBirthdate.trim()) {
      Alert.alert("Erro", "Por favor, preencha todos os campos obrigatórios.");
      return;
    }

    setLoading(true);
    try {
      const db = getDatabase();
      const downloadURL = await uploadImage();

      const dependentData = {
        nome: newDependentName.trim(),
        dataNascimento: newDependentBirthdate,
        avatar: downloadURL || (editingDependent?.avatar || ""),
      };

      if (editingDependent) {
        await set(
          ref(db, `users/${user.uid}/dependents/${editingDependent.id}`),
          dependentData
        );
        Alert.alert("Sucesso", "Dependente atualizado com sucesso!");
      } else {
        const newDependentRef = ref(
          db,
          `users/${user.uid}/dependents/${new Date()
            .toISOString()
            .replace(/[:.]/g, "-")}`
        );
        await set(newDependentRef, dependentData);
        Alert.alert("Sucesso", "Dependente adicionado com sucesso!");
      }

      setModalVisible(false);
      resetForm();
    } catch (error) {
      console.error("Erro ao salvar dependente:", error);
      Alert.alert("Erro", "Ocorreu um erro ao salvar o dependente.");
    } finally {
      setLoading(false);
    }
  };

  const deleteDependent = (id) => {
    Alert.alert(
      "Confirmar exclusão",
      "Tem certeza que deseja excluir este dependente?",
      [
        { text: "Cancelar", style: "cancel" },
        { text: "Excluir", onPress: () => confirmDelete(id) },
      ]
    );
  };

  const confirmDelete = async (id) => {
    try {
      const db = getDatabase();
      await remove(ref(db, `users/${user.uid}/dependents/${id}`));
      Alert.alert("Sucesso", "Dependente excluído com sucesso!");
    } catch (error) {
      console.error("Erro ao excluir dependente:", error);
      Alert.alert("Erro", "Ocorreu um erro ao excluir o dependente.");
    }
  };

  const resetForm = () => {
    setNewDependentName("");
    setNewDependentBirthdate("");
    setImage(null);
    setEditingDependent(null);
  };

  const openAddModal = () => {
    resetForm();
    setModalVisible(true);
  };

  const openEditModal = (dependent) => {
    setEditingDependent(dependent);
    setNewDependentName(dependent.nome);
    setNewDependentBirthdate(dependent.dataNascimento);
    setImage(dependent.avatar);
    setModalVisible(true);
  };

  const renderDependentItem = ({ item }) => (
    <View style={styles.dependentCard}>
      {item.avatar ? (
        <Image source={{ uri: item.avatar }} style={styles.dependentAvatar} />
      ) : (
        <View style={styles.avatarPlaceholder}>
          <Ionicons name="person" size={32} color="#fff" />
        </View>
      )}
      
      <View style={styles.dependentInfo}>
        <Text style={styles.dependentName}>{item.nome}</Text>
        <Text style={styles.dependentBirthdate}>
          {item.dataNascimento || 'Data não informada'}
        </Text>
      </View>
      
      <View style={styles.actionsContainer}>
        <TouchableOpacity 
          style={styles.editButton}
          onPress={() => openEditModal(item)}
        >
          <Ionicons name="create-outline" size={20} color="#3498db" />
        </TouchableOpacity>
        
        <TouchableOpacity 
          style={styles.deleteButton}
          onPress={() => deleteDependent(item.id)}
        >
          <Ionicons name="trash-outline" size={20} color="#e74c3c" />
        </TouchableOpacity>
      </View>
    </View>
  );

  return (
    <LinearGradient
      colors={['#f8f9fa', '#e9ecef']}
      style={styles.background}
    >
      <SafeAreaView style={styles.safeArea}>
        <ScrollView style={styles.container}>
          <View style={styles.header}>
            <Text style={styles.title}>Meus Dependentes</Text>
            <Text style={styles.subtitle}>
              Gerencie os perfis dos seus dependentes
            </Text>
          </View>

          {dependents.length > 0 ? (
            <FlatList
              data={dependents}
              keyExtractor={(item) => item.id}
              renderItem={renderDependentItem}
              scrollEnabled={false}
              contentContainerStyle={styles.listContainer}
            />
          ) : (
            <View style={styles.emptyContainer}>
              <Ionicons name="people-outline" size={60} color="#bdc3c7" />
              <Text style={styles.emptyText}>Nenhum dependente cadastrado</Text>
            </View>
          )}

          <TouchableOpacity
            style={styles.addButton}
            onPress={openAddModal}
          >
            <Ionicons name="add" size={24} color="#fff" />
            <Text style={styles.addButtonText}>Adicionar Dependente</Text>
          </TouchableOpacity>
        </ScrollView>
      </SafeAreaView>

      {/* Modal para adicionar/editar dependente */}
      <Modal
        animationType="slide"
        transparent={true}
        visible={modalVisible}
        onRequestClose={() => {
          setModalVisible(false);
          resetForm();
        }}
      >
        <View style={styles.modalOverlay}>
          <View style={styles.modalContainer}>
            <Text style={styles.modalTitle}>
              {editingDependent ? 'Editar Dependente' : 'Adicionar Dependente'}
            </Text>
            
            <TouchableOpacity 
              style={styles.avatarPicker} 
              onPress={pickImage}
            >
              {image ? (
                <Image source={{ uri: image }} style={styles.avatarImage} />
              ) : (
                <View style={styles.avatarPlaceholder}>
                  <Ionicons name="camera" size={32} color="#3498db" />
                  <Text style={styles.avatarPlaceholderText}>
                    {editingDependent?.avatar ? 'Alterar foto' : 'Adicionar foto'}
                  </Text>
                </View>
              )}
            </TouchableOpacity>
            
            <View style={styles.inputContainer}>
              <Text style={styles.inputLabel}>Nome completo</Text>
              <TextInput
                placeholder="Digite o nome"
                value={newDependentName}
                onChangeText={setNewDependentName}
                style={styles.input}
              />
            </View>
            
            <View style={styles.inputContainer}>
              <Text style={styles.inputLabel}>Data de nascimento</Text>
              <TextInputMask
                placeholder="DD/MM/AAAA"
                value={newDependentBirthdate}
                onChangeText={setNewDependentBirthdate}
                style={styles.input}
                type={'datetime'}
                options={{
                  format: 'DD/MM/YYYY'
                }}
              />
            </View>
            
            <View style={styles.modalButtons}>
              <TouchableOpacity 
                style={styles.cancelButton}
                onPress={() => {
                  setModalVisible(false);
                  resetForm();
                }}
                disabled={loading}
              >
                <Text style={styles.cancelButtonText}>Cancelar</Text>
              </TouchableOpacity>
              
              <TouchableOpacity
                style={styles.saveButton}
                onPress={saveDependent}
                disabled={loading}
              >
                {loading ? (
                  <ActivityIndicator color="#fff" />
                ) : (
                  <Text style={styles.saveButtonText}>
                    {editingDependent ? 'Atualizar' : 'Salvar'}
                  </Text>
                )}
              </TouchableOpacity>
            </View>
          </View>
        </View>
      </Modal>
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
    paddingHorizontal: 20,
    paddingTop: statusBarHeight + 20,
  },
  header: {
    marginBottom: 30,
  },
  title: {
    fontSize: 28,
    fontWeight: '700',
    color: '#2c3e50',
    marginBottom: 5,
  },
  subtitle: {
    fontSize: 16,
    color: '#7f8c8d',
  },
  listContainer: {
    paddingBottom: 20,
  },
  dependentCard: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#fff',
    borderRadius: 15,
    padding: 15,
    marginBottom: 15,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 3,
  },
  dependentAvatar: {
    width: 60,
    height: 60,
    borderRadius: 30,
    marginRight: 15,
  },
  avatarPlaceholder: {
    width: 60,
    height: 60,
    borderRadius: 30,
    backgroundColor: '#bdc3c7',
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: 15,
  },
  dependentInfo: {
    flex: 1,
  },
  dependentName: {
    fontSize: 16,
    fontWeight: '600',
    color: '#2c3e50',
    marginBottom: 5,
  },
  dependentBirthdate: {
    fontSize: 14,
    color: '#7f8c8d',
  },
  actionsContainer: {
    flexDirection: 'row',
  },
  editButton: {
    padding: 8,
    marginRight: 5,
  },
  deleteButton: {
    padding: 8,
  },
  emptyContainer: {
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 50,
    backgroundColor: '#fff',
    borderRadius: 15,
    marginBottom: 20,
  },
  emptyText: {
    fontSize: 16,
    color: '#7f8c8d',
    marginTop: 10,
  },
  addButton: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: '#2ecc71',
    padding: 15,
    borderRadius: 15,
    marginBottom: 30,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.25,
    shadowRadius: 3.84,
    elevation: 5,
  },
  addButtonText: {
    color: '#fff',
    fontSize: 16,
    fontWeight: '600',
    marginLeft: 10,
  },
  modalOverlay: {
    flex: 1,
    backgroundColor: 'rgba(0,0,0,0.5)',
    justifyContent: 'center',
    alignItems: 'center',
  },
  modalContainer: {
    width: '90%',
    maxWidth: 400,
    backgroundColor: '#fff',
    borderRadius: 15,
    padding: 25,
  },
  modalTitle: {
    fontSize: 20,
    fontWeight: '700',
    color: '#2c3e50',
    marginBottom: 20,
    textAlign: 'center',
  },
  avatarPicker: {
    alignSelf: 'center',
    marginBottom: 20,
  },
  avatarImage: {
    width: 100,
    height: 100,
    borderRadius: 50,
    borderWidth: 3,
    borderColor: '#3498db',
  },
  avatarPlaceholder: {
    width: 100,
    height: 100,
    borderRadius: 50,
    borderWidth: 3,
    borderColor: '#3498db',
    borderStyle: 'dashed',
    justifyContent: 'center',
    alignItems: 'center',
  },
  avatarPlaceholderText: {
    marginTop: 5,
    color: '#3498db',
    fontSize: 12,
  },
  inputContainer: {
    marginBottom: 15,
  },
  inputLabel: {
    fontSize: 14,
    color: '#2c3e50',
    fontWeight: '500',
    marginBottom: 8,
  },
  input: {
    height: 50,
    borderWidth: 1,
    borderColor: '#ddd',
    borderRadius: 10,
    paddingHorizontal: 15,
    fontSize: 16,
    backgroundColor: '#f8f9fa',
  },
  modalButtons: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginTop: 20,
  },
  cancelButton: {
    flex: 1,
    backgroundColor: '#e74c3c',
    borderRadius: 10,
    padding: 15,
    marginRight: 10,
    alignItems: 'center',
  },
  saveButton: {
    flex: 1,
    backgroundColor: '#2ecc71',
    borderRadius: 10,
    padding: 15,
    alignItems: 'center',
  },
  cancelButtonText: {
    color: '#fff',
    fontSize: 16,
    fontWeight: '600',
  },
  saveButtonText: {
    color: '#fff',
    fontSize: 16,
    fontWeight: '600',
  },
});

export default Dependentes;