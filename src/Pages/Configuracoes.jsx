import React, { useState } from "react";
import {
  View,
  Modal,
  Text,
  StyleSheet,
  TextInput,
  TouchableOpacity,
  Alert,
  Image,
  ScrollView,
} from "react-native";
import * as ImagePicker from "expo-image-picker";
import { useNavigation } from "@react-navigation/native";
import MaskInput, { Masks } from "react-native-mask-input";
import {
  getDatabase,
  ref,
  child,
  get,
  onValue,
  DataSnapshot,
  set,
  update,
  remove,
} from "firebase/database";
import {
  getAuth,
  onAuthStateChanged,
  updateProfile,
  updateEmail,
  updatePassword,
  deleteUser,
  signOut,
} from "firebase/auth";
import { useEffect } from "react";
import { useAuth } from "../Hooks/Auth";
import {
  getStorage,
  ref as sRef,
  getDownloadURL,
  uploadBytes,
  deleteObject,
} from "firebase/storage";
import LottieView from "lottie-react-native";
import { db } from "../../firebaseConfig";

function Configuracoes() {
      const {user} = useAuth()
      const auth = getAuth()
      const [name, setName] = useState();
      const [lastname, setLastname] = useState()
      const [email, setEmail] = useState()
      const [photoURL, setPhotoURL] = useState()
      useEffect(()=>{
        setName(auth.currentUser.displayName)
        setEmail(auth.currentUser.email)
        setPhotoURL(auth.currentUser.photoURL)
      })
  return (
    <View style={{ backgroundColor: "#146ebb", flex: 1 }}>
      <View
        style={{
          flexDirection: "row",
          backgroundColor: "#059e56",
          margin: 10,
          borderRadius: 8,
          padding: 8,
          elevation: 10,
          width: "95%",
        }}
      >
        <View style={{ width: "80%" }}>
          <Text style={styles.title}>Olá, {name}.</Text>
          <Text style={styles.title}>E-mail: {email}</Text>
        </View>
        <View
          style={{
            width: "20%",
            alignItems: "center",
            justifyContent: "center",
          }}
        >
          <Image
            src={photoURL}
            style={{
              width: 70,
              height: 70,
              borderRadius: 35,
              marginLeft: 10,
              alignSelf: "center",
            }}
          />
        </View>
      </View>
    </View>
  );
}
const styles = StyleSheet.create({
  title: {
    fontSize: 25,
    color: "#fff",
  },
});

export default Configuracoes;
