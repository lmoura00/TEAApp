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
} from "react-native";
import * as ImagePicker from "expo-image-picker";
import { getAuth, updateProfile, updateEmail } from "firebase/auth";
import { getStorage, ref as sRef, uploadBytes, getDownloadURL } from "firebase/storage";
import { getDatabase, ref, update, onValue } from "firebase/database";
import MaskInput, { Masks } from "react-native-mask-input";

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

  // Carregar informações adicionais do Realtime Database
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

      // Atualizar perfil no Firebase Auth
      await updateProfile(auth.currentUser, {
        displayName: name,
        photoURL: downloadURL,
      });

      // Atualizar e-mail no Firebase Auth
      if (email !== user.email) {
        await updateEmail(auth.currentUser, email);
      }

      // Atualizar dados no Realtime Database
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
    <ScrollView
      style={styles.container}
      contentContainerStyle={styles.scrollContent}
    >
      <Text style={styles.title}>Editar Perfil</Text>
      <TouchableOpacity onPress={pickImage}>
        <Image
          source={{ uri: image || photoURL }}
          style={styles.profileImage}
        />
        <Text style={styles.changePhotoText}>Alterar Foto</Text>
      </TouchableOpacity>
      <TextInput
        placeholder="Nome"
        value={name}
        onChangeText={setName}
        style={styles.input}
      />
      <TextInput
        placeholder="Sobrenome"
        value={lastname}
        onChangeText={setLastname}
        style={styles.input}
      />
      <TextInput
        placeholder="E-mail"
        value={email}
        onChangeText={setEmail}
        style={styles.input}
      />
      <MaskInput
        placeholder="CPF"
        value={cpf}
        onChangeText={setCpf}
        mask={Masks.BRL_CPF}
        style={styles.input}
      />
      <MaskInput
        placeholder="Data de Nascimento"
        value={birthdate}
        onChangeText={setBirthdate}
        mask={Masks.DATE_DDMMYYYY}
        style={styles.input}
      />
      <TextInput
        placeholder="Plano"
        value={plano}
        onChangeText={setPlano}
        style={styles.input}
        editable={false} // O plano não pode ser editado pelo usuário
      />
      <TouchableOpacity
        style={styles.saveButton}
        onPress={salvarPerfil}
        disabled={loading}
      >
        <Text style={styles.saveButtonText}>
          {loading ? "Salvando..." : "Salvar Alterações"}
        </Text>
      </TouchableOpacity>
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: "#fff",
    borderEndColor: "#146ebb",
    borderRadius: 10,
  },
  scrollContent: {
    padding: 20,
    paddingBottom: 40,
    marginBottom: 20,
  },
  title: {
    fontSize: 24,
    fontWeight: "bold",
    marginBottom: 20,
    borderRadius: 10,
  },
  profileImage: {
    width: 100,
    height: 100,
    borderRadius: 50,
    alignSelf: "center",
    marginBottom: 10,
  },
  changePhotoText: {
    color: "#146ebb",
    textAlign: "center",
    marginBottom: 20,
  },
  input: {
    height: 40,
    borderColor: "#ccc",
    borderWidth: 1,
    borderRadius: 5,
    paddingHorizontal: 10,
    marginBottom: 15,
    fontSize: 16,
  },
  saveButton: {
    backgroundColor: "#059e56",
    padding: 15,
    borderRadius: 5,
    alignItems: "center",
  },
  saveButtonText: {
    color: "#fff",
    fontSize: 16,
    fontWeight: "bold",
  },
});

export default Perfil;