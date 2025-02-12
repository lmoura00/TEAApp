import React, { useState } from "react";
import {
  View,
  Text,
  StyleSheet,
  TextInput,
  TouchableOpacity,
  Alert,
  Image,
  ScrollView,
  Modal,
  Button,
  FlatList
} from "react-native";

import * as ImagePicker from "expo-image-picker";
import { useNavigation } from "@react-navigation/native";
import MaskInput, { Masks } from "react-native-mask-input";
import LottieView from "lottie-react-native";
import { useAuth } from "../Hooks/Auth";
import {
  getAuth,
  createUserWithEmailAndPassword,
  sendEmailVerification,
  onAuthStateChanged,
  updateProfile,
  updatePhoneNumber,
  updateCurrentUser,
} from "firebase/auth";
import { getDatabase, ref, set, onValue } from "firebase/database";
import { getDownloadURL, getStorage, uploadBytes } from "firebase/storage";
import { ref as sRef } from "firebase/storage";

export function Cad() {
  const [image, SetImage] = useState(null);
  const [imageUrl, SetImageUrl] = useState(null);
  const navigation = useNavigation();
  const auth = getAuth();
  const storage = getStorage();
  const planos = [
    { id: "gratuito", nome: "Gratuito" },
    { id: "mensal", nome: "Mensal - R$ 29,90" },
    { id: "anual", nome: "Anual - R$ 299,90" }
  ];
  const pickImage = async () => {
    let result = await ImagePicker.launchImageLibraryAsync({
      mediaTypes: ["images"],
      allowsEditing: true,
      aspect: [4, 3],
      quality: 1,
    });

    console.log("IMAGEURL: ",result.assets[0].uri);
    //console.log(image);
    
    if (!result.canceled) {
      SetImage(result.assets[0].uri);
    }
  };
  const [visibleConfirma, setVisibleConfirma] = useState(false);
  const [visible, setVisible] = useState(false);
  const [confirmar, setConfirmar] = useState(false);
  const [nome, setNome] = useState("");
  const [date, setDate] = useState("");
  const [cpf, setCpf] = useState("");
  const [email, setEmail] = useState("");
  const [telefone, setTelefone] = useState("");
  const [senha, setSenha] = useState("");
  const [confSenha, setConfSenha] = useState("");
  const [sobrenome, setSobrenome] = useState("");
  const [planoSelecionado, setPlanoSelecionado] = useState(null);
  const { setUser } = useAuth();
  const [loading, setLoading] = useState(false)
  // async function salvar() {
  //   createUserWithEmailAndPassword(
  //     auth,
  //     email,
  //     senha,
  //     telefone,
  //     nome,
  //     cpf,
  //     date,
  //     sobrenome,
  //     planoSelecionado
  //   )
  //     .then((userCredential) => {
  //       console.log("usuário criado com sucesso");
  //       let userUid = userCredential.user.uid;
  //       const userTotal = userCredential.user;
  //       async function enviarFoto() {
  //         const response = await fetch(image);
  //         const blob = await response.blob();
  //         const storageRef = sRef(storage, `profile_pictures/${userUid}.jpg`);
  //         const metadata = { contentType: "image/jpeg" };

  //         await uploadBytes(storageRef, blob, metadata)
  //           .then(async (snapshot) => {
  //             console.log("Imagem enviada com sucesso");
  //             const downloadURL = await getDownloadURL(snapshot.ref);
  //             SetImageUrl(downloadURL); // Agora é a URL da imagem
  //             await updateProfile(userTotal, {
  //               displayName: nome, // Opcional, se quiser salvar o nome também
  //               photoURL: downloadURL,
  //             });
  //             await updatePhoneNumber(userTotal, telefone);
  //           })
  //           .catch((error) => console.log("Erro ao enviar imagem:", error));
  //       }

  //       function writeUserData(email, nome, sobrenome, telefone, cpf, date, planoSelecionado) {
  //         const db = getDatabase();
  //         set(ref(db, "users/" + userUid), {
  //           name: nome,
  //           lastname: sobrenome,
  //           email: email,
  //           cpf: cpf,
  //           date: date,
  //           telefone: telefone,
  //           image: userTotal.photoURL,
  //           planoSelecionado: planoSelecionado || "gratuito"
  //         }).then(() => {
  //           console.log("Dados enviados com sucesso");
  //         });
  //       }
  //       writeUserData(email, nome, sobrenome, telefone, cpf, date, planoSelecionado);
  //       sendEmailVerification(auth.currentUser).then(() => {
  //         console.log("email enviado com sucesso");
  //       });

  //       enviarFoto();
  //       setConfirmar(false) || setVisibleConfirma(true);
  //     })
  //     .catch((error) => {
  //       if (error.code === "auth/email-already-in-use") {
  //         Alert.alert(
  //           "Erro de Cadastro",
  //           "Este e-mail já está em uso. Tente outro."
  //         );
  //       } else if (error.code === "auth/invalid-email") {
  //         Alert.alert("Erro de Cadastro", "O e-mail inserido não é válido.");
  //       } else if (error.code === "auth/weak-password") {
  //         Alert.alert(
  //           "Erro de Cadastro",
  //           "A senha é muito fraca. Use pelo menos 6 caracteres."
  //         );
  //       } else {
  //         Alert.alert("Erro de Cadastro", "Algo deu errado. Tente novamente.");
  //       }
  //       console.log("Erro ao criar usuário:", error.message);
  //     });
  // }
  async function salvar() {
    try {
      setLoading(true)
      const userCredential = await createUserWithEmailAndPassword(auth, email, senha);
      const user = userCredential.user;
      const userUid = user.uid;
  
      // Enviar imagem para o Firebase Storage
      let downloadURL = null;
      if (image) {
        const response = await fetch(image);
        const blob = await response.blob();
        const storageRef = sRef(storage, `profile_pictures/${userUid}.jpg`);
        await uploadBytes(storageRef, blob);
        downloadURL = await getDownloadURL(storageRef);
      }
  
      // Atualizar perfil do usuário
      await updateProfile(user, {
        displayName: nome,
        photoURL: downloadURL,
      });
  
      // Salvar dados no Realtime Database
      const db = getDatabase();
      await set(ref(db, `users/${userUid}`), {
        nome,
        sobrenome,
        email,
        telefone,
        cpf,
        dataNascimento: date,
        plano: planoSelecionado || "gratuito",
        fotoPerfil: downloadURL,
      });
  
      // Enviar e-mail de verificação
      await sendEmailVerification(auth.currentUser);
  
      setLoading(false)
      //Alert.alert("Sucesso", "Cadastro realizado com sucesso!");
      setVisibleConfirma(true);
    } catch (error) {
      console.error("Erro ao cadastrar:", error);
      Alert.alert("Erro", error.message);
    }
  }
  

  function CheckSenha() {
    if (senha.length <= 5) {
      Alert.alert(
        "Senha curta demais",
        "O tamanho minimo da senha deve ser de 6 dígitos."
      );
    } else {
      completo();
    }
  }

  function completo() {
    if (senha != confSenha) {
      Alert.alert("As senhas devem ser idênticas.");
    } else {
      if (
        nome === "" ||
        sobrenome === "" ||
        date === "" ||
        cpf === "" ||
        email === "" ||
        telefone === "" ||
        senha === "" ||
        image == null
      ) {
        Alert.alert("Todos os campos são obrigatorios.");
      } else {
        setConfirmar(true);
      }
    }
  }
  const renderItem = ({ item }) => {
    const selecionado = item.id === planoSelecionado;
    return (
      <TouchableOpacity
        style={[styles.item, selecionado && styles.itemSelecionado]}
        onPress={() => setPlanoSelecionado(item.id)||console.log(planoSelecionado)}
      >
        <Text style={[styles.texto, selecionado && styles.textoSelecionado]}>
          {item.nome}
        </Text>
      </TouchableOpacity>
    );
  };
  return (
    <ScrollView style={styles.container}>
      <Modal
        animationType="fade"
        visible={visible}
        statusBarTranslucent={false}
        transparent={true}
        style={{}}
      >
        <View style={styles.modal}>
          <Text style={styles.titleModal}>DESEJA CANCELAR SEU CADASTRO?</Text>
          <TouchableOpacity
            onPress={() => navigation.navigate("Login")}
            style={styles.botaoModal1}
          >
            <Text style={styles.textBotao}>SAIR</Text>
          </TouchableOpacity>
          <TouchableOpacity
            onPress={() => setVisible(false)}
            style={styles.botaoModal2}
          >
            <Text style={styles.textBotao}>VOU CONTINUAR</Text>
          </TouchableOpacity>
        </View>
      </Modal>

      <Modal
        animationType="fade"
        visible={confirmar}
        statusBarTranslucent={false}
        transparent={true}
        style={{}}
      >
        <View style={styles.modal1}>
          <Text style={styles.titleModal}>
            OS DADOS INSERIDOS ESTÃO CORRETOS?
          </Text>
          <Text>⬤ NOME: {nome}</Text>
          <Text>⬤ SOBRENOME: {sobrenome}</Text>
          <Text>⬤ NASCIMENTO: {date}</Text>
          <Text>⬤ CPF: {cpf}</Text>
          <Text>⬤ E-MAIL: {email}</Text>
          <Text>⬤ TELEFONE: {telefone}</Text>
          <Text>⬤ SENHA: {senha}</Text>
          <Text>⬤ PLANO: {planoSelecionado}</Text>

          {image && (
            <Image
              source={{ uri: image }}
              style={{
                width: 100,
                height: 100,
                alignSelf: "center",
                marginBottom: 20,
                marginTop: 20,
              }}
            />
          )}
          <TouchableOpacity onPress={salvar} style={styles.botaoConfirmarModal}>
            <Text style={styles.textBotao}>CONFIRMAR</Text>
          </TouchableOpacity>
          <TouchableOpacity
            onPress={() => setConfirmar(false)}
            style={styles.botaoAlterarDadosModal}
          >
            <Text style={styles.textBotao}>ALTERAR DADOS</Text>
          </TouchableOpacity>
        </View>
      </Modal>

      <Modal
        animationType="fade"
        visible={visibleConfirma}
        statusBarTranslucent={false}
        transparent={true}
        style={{}}
      >
        <View style={styles.modal2}>
          <View style={styles.titleBoxModal}>
            <Text style={styles.titleModal}>SEU CADASTRO FOI CONCLUIDO</Text>
          </View>
          <View>
            <LottieView
              source={require("../Assets/confirmed.json")}
              autoPlay={true}
              loop={true}
              style={{ width: 120, height: 120 }}
            />
          </View>
          <Text style={styles.subTitleModal}>Aproveite o app</Text>
          <TouchableOpacity
            onPress={() =>
              navigation.navigate("Login") || setVisibleConfirma(false)
            }
            style={styles.botaoModal3}
          >
            <Text style={styles.textBotao}>SAIR</Text>
          </TouchableOpacity>
        </View>
      </Modal>
      <View
        style={{
          flex: 1,
          flexDirection: "row",
          alignItems: "center",
          marginTop: 25,
          height: 100,
          marginBottom: 35,
          justifyContent: "center",
          borderTopColor: "#2f2f2f",
          borderTopWidth: 5,
          borderBottomColor: "#2f2f2f",
          borderBottomWidth: 5,
          textAlign: "center",
          width: "80%",
          alignSelf: "center",
        }}
      >
        <Image
          source={require("../images/Praticamente.png")}
          style={{ width: 55, height: 55, marginRight: 15 }}
        />
        <Text style={{ fontSize: 40 }}>CADASTRAR</Text>
      </View>
      <View style={{ flexDirection: "row", alignItems: "center" }}>
        <View>
          <LottieView
            source={require("../Assets/profile-icon.json")}
            autoPlay={true}
            loop={true}
            style={{ width: 40, height: 40 }}
          />
        </View>
        <Text style={styles.title}>NOME</Text>
      </View>
      <TextInput
        style={styles.input}
        placeholder="Nome"
        value={nome}
        onChangeText={setNome}
      ></TextInput>

      <View style={{ flexDirection: "row", alignItems: "center" }}>
        <LottieView
          source={require("../Assets/writing.json")}
          autoPlay={true}
          loop={true}
          style={{ width: 40, height: 40 }}
        />

        <Text style={styles.title}>SOBRENOME</Text>
      </View>
      <TextInput
        style={styles.input}
        placeholder="Sobrenome"
        value={sobrenome}
        onChangeText={setSobrenome}
      ></TextInput>

      <View style={{ flexDirection: "row", alignItems: "center" }}>
        <LottieView
          source={require("../Assets/calendario.json")}
          autoPlay
          loop={true}
          style={{ width: 40, height: 40 }}
        />

        <Text style={styles.title}>DATA DE NASCIMENTO</Text>
      </View>
      <MaskInput
        value={date}
        style={styles.input}
        keyboardType="number-pad"
        onChangeText={setDate}
        mask={Masks.DATE_DDMMYYYY}
      />

      <View>
        <View style={{ flexDirection: "row", alignItems: "center" }}>
          <View>
            <LottieView
              source={require("../Assets/idCheck.json")}
              autoPlay={true}
              loop={true}
              style={{ width: 40, height: 40 }}
            />
          </View>
          <Text style={styles.title}> CPF</Text>
        </View>
        <MaskInput
          value={cpf}
          keyboardType="number-pad"
          style={styles.input}
          mask={Masks.BRL_CPF}
          showObfuscatedValue
          obfuscationCharacter="#"
          onChangeText={(masked, unmasked, obfuscated) => {
            setCpf(obfuscated);
          }}
        />
      </View>

      <View style={{ flexDirection: "row", alignItems: "center" }}>
        <View>
          <LottieView
            source={require("../Assets/mail.json")}
            autoPlay={true}
            loop={true}
            style={{ width: 45, height: 45 }}
          />
        </View>
        <Text style={styles.title}>E-MAIL</Text>
      </View>
      <TextInput
        style={styles.input}
        placeholder="E-mail"
        keyboardType="email-address"
        value={email}
        onChangeText={setEmail}
      ></TextInput>

      <View style={{ flexDirection: "row", alignItems: "center" }}>
        <View>
          <LottieView
            source={require("../Assets/hand-holding-phone.json")}
            autoPlay={true}
            loop={true}
            style={{ width: 40, height: 40 }}
          />
        </View>
        <Text style={styles.title}> TELEFONE</Text>
      </View>
      <MaskInput
        style={styles.input}
        value={telefone}
        keyboardType="numeric"
        onChangeText={(mask, unmasked) => {
          setTelefone(unmasked);
        }}
        mask={[
          "(",
          /\d/,
          /\d/,
          ")",
          " ",
          /\d/,
          /\d/,
          /\d/,
          /\d/,
          /\d/,
          "-",
          /\d/,
          /\d/,
          /\d/,
          /\d/,
        ]}
      />

      <View style={{ flexDirection: "row", alignItems: "center" }}>
        <View style={{ width: 40, height: 40 }}>
          <LottieView
            source={require("../Assets/lock-blue.json")}
            autoPlay={true}
            loop={true}
            style={{ width: 40, height: 40 }}
          />
        </View>
        <Text style={styles.title}> SENHA</Text>
      </View>
      <TextInput
        style={styles.input}
        placeholder="Senha"
        keyboardType="default"
        value={senha}
        maxLength={12}
        onChangeText={setSenha}
      ></TextInput>

      <View style={{ flexDirection: "row", alignItems: "center" }}>
        <View style={{ width: 40, height: 40 }}>
          <LottieView
            source={require("../Assets/checkmark.json")}
            autoPlay={true}
            loop={true}
            style={{ width: 40, height: 40 }}
          />
        </View>
        <Text style={styles.title}> CONFIRME SUA SENHA</Text>
      </View>
      <TextInput
        style={styles.input}
        placeholder="Confirme sua senha"
        keyboardType="default"
        value={confSenha}
        maxLength={12}
        onChangeText={setConfSenha}
      ></TextInput>
      <View style={{ flexDirection: "row", alignItems: "center" }}>
        <View>
          <LottieView
            source={require("../Assets/image-picture.json")}
            autoPlay={true}
            loop={true}
            style={{ width: 40, height: 40 }}
          />
        </View>
        <Text style={styles.title}> SELECIONE SUA FOTO</Text>
      </View>

      {(image || imageUrl) && (
        <View style={{ flexDirection: "row", justifyContent: "space-evenly" }}>
          <Image
            source={{ uri: imageUrl ? imageUrl : image }}
            style={{
              width: 100,
              height: 100,
              alignSelf: "center",
              marginBottom: 20,
              marginTop: 20,
              borderRadius: 50,
              borderWidth: 2,
              borderColor: "#09bfff",
            }}
          />

          <TouchableOpacity
            onPress={() => SetImage(null)}
            style={styles.botao3}
          >
            <Text style={styles.textBotao}>Apagar foto selecionada</Text>
          </TouchableOpacity>
        </View>
      )}

      <TouchableOpacity
        onPress={pickImage}
        style={[{ display: image ? "none" : "flex" }, styles.botao3]}
      >
        <Text style={styles.textBotao}>Selecione a sua foto</Text>
      </TouchableOpacity>


      <View style={{ flexDirection: "row", alignItems: "center" }}>
        <View>
          <LottieView
            source={require("../Assets/Paying.json")}
            autoPlay={true}
            loop={true}
            style={{ width: 40, height: 40 }}
          />
        </View>
        <Text style={styles.title}> SELECIONE SEU PLANO</Text>
      </View>
      <FlatList
        data={planos}
        horizontal
        keyExtractor={(item) => item.id}
        renderItem={renderItem}
        showsHorizontalScrollIndicator={false}
      />

      <TouchableOpacity style={styles.botao1} onPress={CheckSenha}>
        <Text style={styles.textBotao}>SALVAR</Text>
      </TouchableOpacity>

      <TouchableOpacity style={styles.botao2} onPress={() => setVisible(true)}>
        <Text style={styles.textBotao}>CANCELAR</Text>
      </TouchableOpacity>
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    paddingHorizontal: 10,
    backgroundColor: "#f4f6fc",
    padding: 5,
    marginTop: 25,
  },
  line1: {
    fontSize: 25,
    color: "black",
  },
  line2: {
    fontSize: 25,
    color: "black",
    marginBottom: 15,
  },
  title: {
    fontSize: 19,
    color: "#2f2f2f",
    fontWeight: "350",
    margin: 2,
  },
  title1: {
    fontSize: 20,
    color: "#fff",
    fontWeight: "500",
  },
  input: {
    backgroundColor: "#D9D9D9",
    height: 45,
    borderRadius: 7,
    borderWidth: 1,
    marginBottom: 5,
    marginTop: 5,
    paddingHorizontal: 8,
    fontFamily: "BalsamiqSans_700Bold",
    fontSize: 16,
  },
  botao1: {
    backgroundColor: "#0dff31",
    height: 35,
    width: "65%",
    padding: 5,
    margin: 12,
    borderRadius: 8,
    borderWidth: 1,
    marginTop: 55,
    alignSelf: "center",
    elevation: 10,
  },
  botaoConfirmarModal: {
    backgroundColor: "#14BC9C",
    height: 35,
    width: "65%",
    padding: 5,
    margin: 12,
    borderRadius: 15,
    borderWidth: 1,
    marginTop: 10,
    alignSelf: "center",
    elevation: 10,
  },

  botao2: {
    backgroundColor: "#FF3030",
    height: 35,
    width: "65%",
    padding: 5,
    borderRadius: 8,
    borderWidth: 1,
    alignSelf: "center",
    marginBottom: 20,
    elevation: 10,
  },

  textBotao: {
    fontSize: 15,
    fontWeight: "600",
    textAlign: "center",
    justifyContent: "center",
  },
  textBotao3: {
    fontSize: 15,
    fontWeight: "600",
    textAlign: "center",
  },
  botao3: {
    backgroundColor: "#D9D9D9",
    width: "56%",
    height: 35,
    borderRadius: 7,
    borderWidth: 1,
    marginBottom: 5,
    marginTop: 5,
    alignSelf: "center",
    elevation: 10,
    justifyContent: "center",
  },
  image: {
    height: 80,
    width: 80,
    alignSelf: "center",
    borderRadius: 45,
    borderWidth: 2,
    borderColor: "#f9f9f9",
    marginBottom: 15,
    marginTop: 15,
  },
  modal: {
    alignSelf: "center",
    backgroundColor: "#f9f9f9",
    padding: 20,
    elevation: 10,
    borderRadius: 20,
    marginVertical: 280,
    width: "80%",
    height: "25%",
  },
  modal1: {
    alignSelf: "center",
    backgroundColor: "#f9f9f9",
    padding: 20,
    elevation: 10,
    borderRadius: 20,
    marginVertical: 180,
    width: "80%",
    height: "58%",
  },
  botaoModal1: {
    backgroundColor: "#FF3030",
    height: 35,
    width: "65%",
    padding: 5,
    borderRadius: 15,
    borderWidth: 1,
    alignSelf: "center",
    margin: 5,
    elevation: 10,
    marginTop: 20,
  },
  botaoModal2: {
    backgroundColor: "#fff",
    height: 35,
    width: "65%",
    padding: 5,
    borderRadius: 15,
    borderWidth: 1,
    alignSelf: "center",
    elevation: 10,
    marginTop: 5,
  },
  titleModal: {
    textAlign: "center",
    fontSize: 17,
    fontFamily: "BalsamiqSans_700Bold",
    textDecorationLine: "underline",
  },
  botaoAlterarDadosModal: {
    backgroundColor: "#FF3030",
    height: 35,
    width: "65%",
    padding: 5,
    borderRadius: 15,
    borderWidth: 1,
    alignSelf: "center",
    elevation: 10,
    marginTop: 5,
  },
  modal2: {
    alignSelf: "center",
    backgroundColor: "#f9f9f9",
    padding: 20,
    elevation: 10,
    borderRadius: 20,
    marginVertical: 220,
    width: "80%",
    height: "45%",
    justifyContent: "center",
    alignItems: "center",
  },
  subTitleModal: {
    fontSize: 15,
    fontFamily: "Ubuntu_500Medium",
    marginTop: 15,
    textAlign: "center",
  },
  titleBoxModal: {
    backgroundColor: "#fff",
    height: 50,
    width: "95%",
    borderRadius: 8,
    elevation: 10,
    alignItems: "center",
    justifyContent: "center",
  },
  botaoModal3: {
    backgroundColor: "#FF3030",
    height: 35,
    width: "65%",
    padding: 5,
    borderRadius: 15,
    borderWidth: 1,
    alignSelf: "center",
    margin: 5,
    elevation: 10,
    marginTop: 30,
  },
  containerFlatlist:{
    backgroundColor:'grey'
  },
  block:{
    width: 150,
    height: 150,
    backgroundColor: "#d9d9d9",
    marginHorizontal: 10, 
    borderRadius:10,
    textAlign:'center',
    alignItems:"center",
    justifyContent:'center',
  },
  item: {
    padding: 15,
    width: 150,
    height: 80,
    borderRadius: 10,
    backgroundColor: "#d9d9d9",
    marginBottom: 10,
    margin:10,
    alignItems: "center"
  },
  itemSelecionado: {
    backgroundColor: "#4CAF50"
  },
  texto: {
    fontSize: 16,
    textAlign:"center",
    fontFamily: "Ubuntu_500Medium",
  },
  textoSelecionado: {
    color: "white",
    fontWeight: "bold"
  }
});
