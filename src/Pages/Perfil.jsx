import React, { useState, useEffect } from "react";
import {
  View,
  Text,
  TextInput,
  TouchableOpacity,
  Image,
  Alert,
  StyleSheet,
  ScrollView,
  ActivityIndicator
} from "react-native";
import * as ImagePicker from "expo-image-picker";
import { getAuth, updateProfile, updateEmail } from "firebase/auth";
import { getStorage, ref as sRef, uploadBytes, getDownloadURL } from "firebase/storage";
import { getDatabase, ref, update, onValue } from "firebase/database";
import MaskInput, { Masks } from "react-native-mask-input";
import { LinearGradient } from 'expo-linear-gradient';
import { Ionicons } from '@expo/vector-icons';
import Constants from 'expo-constants';

const statusBarHeight = Constants.statusBarHeight;

function Perfil({ user }) {
  const [name, setName] = useState("");
  const [lastname, setLastname] = useState("");
  const [email, setEmail] = useState("");
  const [cpf, setCpf] = useState("");
  const [birthdate, setBirthdate] = useState("");
  const [plano, setPlano] = useState("gratuito");
  const [photoURL, setPhotoURL] = useState("");
  const [image, setImage] = useState(null);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    const db = getDatabase();
    const userRef = ref(db, `users/${user.uid}`);

    onValue(userRef, (snapshot) => {
      const data = snapshot.val();
      if (data) {
        setName(data.nome || "");
        setLastname(data.sobrenome || "");
        setEmail(data.email || "");
        setCpf(data.cpf || "");
        setBirthdate(data.dataNascimento || "");
        setPlano(data.plano || "gratuito");
        setPhotoURL(data.fotoPerfil || "");
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
      const storageRef = sRef(getStorage(), `profile_pictures/${user.uid}.jpg`);
      await uploadBytes(storageRef, blob);
      return await getDownloadURL(storageRef);
    }
    return null;
  };

  const salvarPerfil = async () => {
    try {
      setLoading(true);
      const auth = getAuth();
      let downloadURL = photoURL;

      if (image) {
        downloadURL = await uploadImage();
        setPhotoURL(downloadURL);
      }

      await updateProfile(auth.currentUser, {
        displayName: name,
        photoURL: downloadURL,
      });

      if (email !== user.email) {
        await updateEmail(auth.currentUser, email);
      }

      const db = getDatabase();
      await update(ref(db, `users/${user.uid}`), {
        nome: name,
        sobrenome: lastname,
        email: email,
        cpf: cpf,
        dataNascimento: birthdate,
        plano: plano,
        fotoPerfil: downloadURL,
      });

      Alert.alert("Sucesso", "Perfil atualizado com sucesso!");
    } catch (error) {
      console.error("Erro ao atualizar perfil:", error);
      Alert.alert("Erro", error.message);
    } finally {
      setLoading(false);
    }
  };

  return (
    <LinearGradient
      colors={['#3498db', '#2c3e50']}
      style={styles.background}
    >
      <ScrollView
        style={styles.container}
        contentContainerStyle={styles.scrollContent}
      >
        <View style={styles.header}>
          <Text style={styles.title}>Meu Perfil</Text>
        </View>

        <View style={styles.profileSection}>
          <TouchableOpacity onPress={pickImage} style={styles.profileImageContainer}>
            {image || photoURL ? (
              <Image
                source={{ uri: image || photoURL }}
                style={styles.profileImage}
              />
            ) : (
              <View style={styles.profileImagePlaceholder}>
                <Ionicons name="person" size={40} color="#fff" />
              </View>
            )}
            <View style={styles.cameraIcon}>
              <Ionicons name="camera" size={20} color="#fff" />
            </View>
          </TouchableOpacity>
          <Text style={styles.changePhotoText}>Alterar foto</Text>
        </View>

        <View style={styles.formContainer}>
          <View style={styles.inputRow}>
            <View style={[styles.inputContainer, { flex: 1, marginRight: 10 }]}>
              <Text style={styles.inputLabel}>Nome</Text>
              <TextInput
                placeholder="Seu nome"
                value={name}
                onChangeText={setName}
                style={styles.input}
                placeholderTextColor="#95a5a6"
              />
            </View>
            <View style={[styles.inputContainer, { flex: 1 }]}>
              <Text style={styles.inputLabel}>Sobrenome</Text>
              <TextInput
                placeholder="Seu sobrenome"
                value={lastname}
                onChangeText={setLastname}
                style={styles.input}
                placeholderTextColor="#95a5a6"
              />
            </View>
          </View>

          <View style={styles.inputContainer}>
            <Text style={styles.inputLabel}>E-mail</Text>
            <TextInput
              placeholder="seu@email.com"
              value={email}
              onChangeText={setEmail}
              style={styles.input}
              placeholderTextColor="#95a5a6"
              keyboardType="email-address"
              autoCapitalize="none"
            />
          </View>

          <View style={styles.inputRow}>
            <View style={[styles.inputContainer, { flex: 1, marginRight: 10 }]}>
              <Text style={styles.inputLabel}>CPF</Text>
              <MaskInput
                placeholder="000.000.000-00"
                value={cpf}
                onChangeText={setCpf}
                mask={Masks.BRL_CPF}
                style={styles.input}
                placeholderTextColor="#95a5a6"
                keyboardType="numeric"
              />
            </View>
            <View style={[styles.inputContainer, { flex: 1 }]}>
              <Text style={styles.inputLabel}>Nascimento</Text>
              <MaskInput
                placeholder="DD/MM/AAAA"
                value={birthdate}
                onChangeText={setBirthdate}
                mask={Masks.DATE_DDMMYYYY}
                style={styles.input}
                placeholderTextColor="#95a5a6"
                keyboardType="numeric"
              />
            </View>
          </View>

          <View style={styles.inputContainer}>
            <Text style={styles.inputLabel}>Plano Atual</Text>
            <View style={styles.planContainer}>
              <Text style={styles.planText}>{plano.charAt(0).toUpperCase() + plano.slice(1)}</Text>
              <TouchableOpacity style={styles.changePlanButton}>
                <Text style={styles.changePlanText}>Alterar Plano</Text>
              </TouchableOpacity>
            </View>
          </View>
        </View>

        <TouchableOpacity
          style={styles.saveButton}
          onPress={salvarPerfil}
          disabled={loading}
        >
          {loading ? (
            <ActivityIndicator color="#fff" />
          ) : (
            <Text style={styles.saveButtonText}>Salvar Alterações</Text>
          )}
        </TouchableOpacity>
      </ScrollView>
    </LinearGradient>
  );
}

const styles = StyleSheet.create({
  background: {
    flex: 1,
  },
  container: {
    flex: 1,
  },
  scrollContent: {
    paddingTop: statusBarHeight + 20,
    paddingBottom: 150,
    paddingHorizontal: 20,
  },
  header: {
    marginBottom: 30,
    alignItems: 'center',
  },
  title: {
    fontSize: 28,
    fontWeight: '700',
    color: '#fff',
  },
  profileSection: {
    alignItems: 'center',
    marginBottom: 30,
  },
  profileImageContainer: {
    position: 'relative',
    marginBottom: 10,
  },
  profileImage: {
    width: 120,
    height: 120,
    borderRadius: 60,
    borderWidth: 3,
    borderColor: '#fff',
  },
  profileImagePlaceholder: {
    width: 120,
    height: 120,
    borderRadius: 60,
    backgroundColor: '#bdc3c7',
    justifyContent: 'center',
    alignItems: 'center',
    borderWidth: 3,
    borderColor: '#fff',
  },
  cameraIcon: {
    position: 'absolute',
    bottom: 0,
    right: 0,
    backgroundColor: '#3498db',
    width: 40,
    height: 40,
    borderRadius: 20,
    justifyContent: 'center',
    alignItems: 'center',
    borderWidth: 2,
    borderColor: '#fff',
  },
  changePhotoText: {
    color: '#fff',
    fontSize: 16,
    fontWeight: '500',
  },
  formContainer: {
    marginBottom: 30,
  },
  inputRow: {
    flexDirection: 'row',
    marginBottom: 15,
  },
  inputContainer: {
    marginBottom: 15,
  },
  inputLabel: {
    color: '#fff',
    fontSize: 14,
    fontWeight: '500',
    marginBottom: 8,
  },
  input: {
    backgroundColor: 'rgba(255,255,255,0.9)',
    height: 50,
    borderRadius: 10,
    paddingHorizontal: 15,
    fontSize: 16,
    color: '#2c3e50',
  },
  planContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    backgroundColor: 'rgba(255,255,255,0.9)',
    height: 50,
    borderRadius: 10,
    paddingHorizontal: 15,
  },
  planText: {
    fontSize: 16,
    color: '#2c3e50',
    fontWeight: '500',
  },
  changePlanButton: {
    backgroundColor: '#3498db',
    paddingVertical: 5,
    paddingHorizontal: 10,
    borderRadius: 5,
  },
  changePlanText: {
    color: '#fff',
    fontSize: 14,
    fontWeight: '500',
  },
  saveButton: {
    backgroundColor: '#2ecc71',
    height: 50,
    borderRadius: 10,
    justifyContent: 'center',
    alignItems: 'center',
    shadowColor: '#000',
    shadowOffset: {
      width: 0,
      height: 2,
    },
    shadowOpacity: 0.25,
    shadowRadius: 3.84,
    elevation: 5,
  },
  saveButtonText: {
    color: '#fff',
    fontSize: 18,
    fontWeight: '600',
  },
});

export default Perfil;