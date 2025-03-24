import React, { useState, useEffect } from "react";
import {
  View,
  Text,
  FlatList,
  TouchableOpacity,
  Image,
  Modal,
  TextInput,
  Button,
  Alert,
  StyleSheet,
  ActivityIndicator
} from "react-native";
import * as ImagePicker from "expo-image-picker";
import { getAuth } from "firebase/auth";
import { getDatabase, ref, set, onValue, remove } from "firebase/database";
import {
  getStorage,
  ref as sRef,
  uploadBytes,
  getDownloadURL,
} from "firebase/storage";
import { TextInputMask } from "react-native-masked-text";

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
    onValue(dependentsRef, (snapshot) => {
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
  }, [user]);

  const pickImage = async () => {
    let result = await ImagePicker.launchImageLibraryAsync({
      mediaTypes: ImagePicker.MediaTypeOptions.Images,
      allowsEditing: true,
      aspect: [4, 3],
      quality: 1,
    });

    if (!result.canceled) {
      setImage(result.assets[0].uri);
    }
  };

  const uploadImage = async () => {
    if (image) {
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
    }
    return null;
  };

  const saveDependent = async () => {
    setLoading(true);
    try {
     
      if (!newDependentName.trim() || !newDependentBirthdate.trim()) {
        Alert.alert("Erro", "Por favor, preencha todos os campos obrigatórios.");
        setLoading(false);
        return; 
      }
  
      const db = getDatabase();
      const downloadURL = await uploadImage();
  
      const dependentData = {
        nome: newDependentName,
        dataNascimento: newDependentBirthdate,
        avatar: downloadURL || "",
      };
  
      if (editingDependent) {
        
        await set(
          ref(db, `users/${user.uid}/dependents/${editingDependent.id}`),
          dependentData
        );
        Alert.alert("Sucesso", "Dependente atualizado com sucesso!");
        setLoading(false);
      } else {
        const newDependentRef = ref(
          db,
          `users/${user.uid}/dependents/${new Date()
            .toISOString()
            .replace(/[:.]/g, "-")}`
        );
        await set(newDependentRef, dependentData);
        Alert.alert("Sucesso", "Dependente adicionado com sucesso!");
        setLoading(false);
      }
  
      setModalVisible(false);
      setNewDependentName("");
      setNewDependentBirthdate("");
      setImage(null);
      setEditingDependent(null);
    } catch (error) {
      console.error("Erro ao salvar dependente:", error);
      Alert.alert("Erro", "Ocorreu um erro ao salvar o dependente.");
    }
  };

  const deleteDependent = async (id) => {
    try {
      const db = getDatabase();
      await remove(ref(db, `users/${user.uid}/dependents/${id}`));
      Alert.alert("Sucesso", "Dependente excluído com sucesso!");
    } catch (error) {
      console.error("Erro ao excluir dependente:", error);
      Alert.alert("Erro", "Ocorreu um erro ao excluir o dependente.");
    }
  };

  const openAddModal = () => {
    setEditingDependent(null); 
    setNewDependentName(""); 
    setNewDependentBirthdate(""); 
    setImage(null); 
    setModalVisible(true); 
  };

  return (
    <View style={styles.container}>
      <FlatList
        data={dependents}
        keyExtractor={(item) => item.id}
        ListHeaderComponent={
          <>
            <Text style={styles.title}>Dependentes</Text>
          </>
        }
        ListFooterComponent={
          <TouchableOpacity
            style={styles.addButton}
            onPress={openAddModal}
          >
            <Text style={styles.addButtonText}>Adicionar Dependente</Text>
          </TouchableOpacity>
        }
        renderItem={({ item }) => (
          <View style={styles.dependentItem}>
            <Image
              source={{ uri: item.avatar }}
              style={styles.dependentImage}
            />
            <View>
              <Text style={styles.dependentName}>{item.nome}</Text>
              <Text style={styles.dependentBirthdate}>
                {item.dataNascimento}
              </Text>
            </View>
            <View style={{ flexDirection: "row", alignItems: "center" }}>
              <TouchableOpacity
                style={styles.editButton}
                onPress={() => {
                  setEditingDependent(item);
                  setNewDependentName(item.nome);
                  setNewDependentBirthdate(item.dataNascimento);
                  setImage(item.avatar);
                  setModalVisible(true);
                }}
              >
                <Text style={styles.editButtonText}>Editar</Text>
              </TouchableOpacity>
              <TouchableOpacity
                style={styles.deleteButton}
                onPress={() => deleteDependent(item.id)}
              >
                <Text style={styles.deleteButtonText}>Excluir</Text>
              </TouchableOpacity>
            </View>
          </View>
        )}
      />

      <Modal
        animationType="slide"
        transparent={true}
        visible={modalVisible}
        onRequestClose={() => setModalVisible(false)}
      >
        <View style={styles.modalView}>
          <Text style={styles.modalTitle}>
            {editingDependent ? "EDITAR DEPENDENTE" : "ADICIONAR DEPENDENTE"}
          </Text>
          <TextInput
            placeholder="Nome"
            value={newDependentName}
            onChangeText={setNewDependentName}
            style={styles.input}
            placeholderTextColor={'#fff'}
          />
          {/* Substitua o TextInput por TextInputMask */}
          <TextInputMask
            placeholder="Data de Nascimento"
            value={newDependentBirthdate}
            onChangeText={setNewDependentBirthdate}
            style={styles.input}
            placeholderTextColor={'#fff'}
            type={"datetime"}
            options={{
              format: 'DD/MM/YYYY',
            }}
          />
          <TouchableOpacity onPress={pickImage} style={styles.imageButton}>
            <Text style={styles.imageButtonText}>
              Selecione a foto do dependente
            </Text>
          </TouchableOpacity>
          {image && (
            <Image
              source={{ uri: image }}
              style={{
                width: 100,
                height: 100,
                alignSelf: "center",
                marginBottom: 20,
                marginTop: 20,
                borderRadius: 50,
                borderWidth: 2,
                borderColor: "rgb(20, 110, 187)",
              }}
            />
          )}
          <View style={{ flexDirection: "row", justifyContent: "space-between", width: "100%", marginTop: 20 }}>
            <TouchableOpacity onPress={saveDependent} style={styles.saveButton}>
              {loading ? (
                <ActivityIndicator size="small" color="#fff" />
              ) : (
                <Text style={styles.saveButtonText}>Salvar</Text>
              )}
            </TouchableOpacity>
            <TouchableOpacity onPress={() => setModalVisible(false)} style={styles.cancelButton}>
              <Text style={styles.cancelButtonText}>Cancelar</Text>
            </TouchableOpacity>
          </View>
        </View>
      </Modal>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    padding: 20,
    backgroundColor: "#fff",
    borderRadius:8
  },
  modalTitle: {
    fontSize: 24,
    fontWeight: "bold",
    marginBottom: 20,
    color: "#fff",
    borderBottomColor: "#fff",
    borderBottomWidth: 2,
  },
  title: {
    fontSize: 24,
    fontWeight: "bold",
    marginBottom: 20,
  },
  dependentItem: {
    flexDirection: "row",
    alignItems: "center",
    marginBottom: 15,
    justifyContent:'space-evenly'
  },
  dependentImage: {
    width: 50,
    height: 50,
    borderRadius: 25,
    marginRight: 10,
  },
  dependentName: {
    fontSize: 16,
    fontWeight: "bold",
  },
  dependentBirthdate: {
    fontSize: 14,
    color: "#666",
  },
  editButton: {
    marginLeft: 10,
    backgroundColor: "#146ebb",
    padding: 5,
    borderRadius: 5,
  },
  editButtonText: {
    color: "#fff",
    fontSize: 16,
  },
  deleteButton: {
    marginLeft: 10,
    backgroundColor: "#ff4444",
    padding: 5,
    borderRadius: 5,
  },
  deleteButtonText: {
    color: "#fff",
    fontSize: 16,
  },
  addButton: {
    backgroundColor: "#059e56",
    padding: 15,
    borderRadius: 5,
    alignItems: "center",
  },
  addButtonText: {
    color: "#fff",
    fontSize: 16,
    fontWeight: "bold",
  },
  modalView: {
    margin: 20,
    backgroundColor: "rgba(20, 110, 187, 1)",
    borderColor: "rgba(15, 66, 111, 1)",
    borderWidth: 3,
    borderRadius: 20,
    padding: 35,
    marginTop: 100,
    alignItems: "center",
    shadowColor: "#000",
    shadowOffset: {
      width: 0,
      height: 2,
    },
    shadowOpacity: 0.25,
    shadowRadius: 4,
    elevation: 5,
  },
  inpt: {
    height: 40,
    borderColor: "#ccc",
    borderWidth: 1,
    borderRadius: 5,
    paddingHorizontal: 10,
    marginBottom: 15,
    width: "100%",
    color:"#fff",
    fontSize:16
  },
  imageButton: {
    backgroundColor: "#059e56",
    borderRadius: 8,
    width: "95%",
    alignSelf: "center",
    marginTop: 15,
    padding: 10,
    elevation:10
  },
  imageButtonText: {
    color: "#fff",
    fontSize: 16,
    fontWeight: "bold",
    textAlign: "center",
  },
  saveButton: {
    marginTop: 10,
    backgroundColor: "rgb(0, 157, 87)",
    padding: 10,
    borderRadius: 5,
    alignItems: "center",
    elevation:10
  },
  cancelButton: {
    marginTop: 10,
    backgroundColor: "rgb(255, 0, 0)",
    padding: 10,
    borderRadius: 5,
    alignItems: "center",
    elevation:10
  },
  saveButtonText: {
    color: "#fff",
    textAlign: "center",
    fontSize: 16,
    fontWeight: "bold",
  },
  cancelButtonText: {
    color: "#fff",
    textAlign: "center",
    fontSize: 16,
    fontWeight: "bold",
  },
  input: {
    height: 40,
    borderColor: "rgb(240, 240, 240)",
    borderWidth: 1,
    marginBottom: 10,
    paddingHorizontal: 10,
    width: "100%",
    borderRadius:8,
    color:'#fff',
    fontSize:16,
    
  },
});

export default Dependentes;
