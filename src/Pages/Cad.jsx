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
  Dimensions,
  FlatList,
  ActivityIndicator
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
  updateProfile,
} from "firebase/auth";
import { getDatabase, ref, set } from "firebase/database";
import {
  getStorage,
  ref as sRef,
  uploadBytes,
  getDownloadURL,
} from "firebase/storage";
import Constants from "expo-constants";
import { StatusBar } from "expo-status-bar";

const { width, height } = Dimensions.get("window");

export function Cad() {
  const [image, setImage] = useState(null);
  const [nome, setNome] = useState("");
  const [date, setDate] = useState("");
  const [cpf, setCpf] = useState("");
  const [email, setEmail] = useState("");
  const [senha, setSenha] = useState("");
  const [confSenha, setConfSenha] = useState("");
  const [sobrenome, setSobrenome] = useState("");
  const [planoSelecionado, setPlanoSelecionado] = useState(null);
  const [loading, setLoading] = useState(false);
  const [visibleConfirma, setVisibleConfirma] = useState(false);
  const [visible, setVisible] = useState(false);
  const [confirmar, setConfirmar] = useState(false);
  const [etapaAtual, setEtapaAtual] = useState(1); // Controle de etapas
  const [carregando, setCarregando] = useState(false);
  const navigation = useNavigation();
  const auth = getAuth();
  const storage = getStorage();

  const planos = [
    { id: "gratuito", nome: "Gratuito" },
    { id: "mensal", nome: "Mensal - R$ 29,90" },
    { id: "anual", nome: "Anual - R$ 299,90" },
  ];

const closeModal = () => {
  setVisible(false);
  navigation.navigate("Login");
};

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

  const validarEtapa = () => {
    switch (etapaAtual) {
      case 1:
        if (nome === "" || sobrenome === "" || date === "" || cpf === "") {
          Alert.alert("Preencha todos os campos antes de prosseguir.");
          return;
        }
        break;
      case 2:
        if (email === "" || senha === "" || confSenha === "") {
          Alert.alert("Preencha todos os campos antes de prosseguir.");
          return;
        }
        if (!validateEmail(email)) {
          Alert.alert("E-mail inválido.");
          return;
        }
        if (senha !== confSenha) {
          Alert.alert("As senhas não coincidem.");
          return;
        }
        break;
      case 3:
        if (image === null) {
          Alert.alert("Selecione uma foto de perfil antes de prosseguir.");
          return;
        }
        break;
      case 4:
        if (planoSelecionado === null) {
          Alert.alert("Selecione um plano antes de prosseguir.");
          return;
        }
        break;
      default:
        break;
    }
    setEtapaAtual(etapaAtual + 1);
  };
  
  const validateEmail = (email) => {
    const regex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    return regex.test(email);
  };

  const salvar = async () => {
    setLoading(true);
    try {
      const userCredential = await createUserWithEmailAndPassword(
        auth,
        email,
        senha
      );
      const user = userCredential.user;
  
      let downloadURL = null;
      if (image) {
        const response = await fetch(image);
        const blob = await response.blob();
        const storageRef = sRef(storage, `profile_pictures/${user.uid}.jpg`);
        await uploadBytes(storageRef, blob);
        downloadURL = await getDownloadURL(storageRef);
      }
  
      await updateProfile(user, {
        displayName: nome,
        photoURL: downloadURL,
      });
  
      const db = getDatabase();
      await set(ref(db, `users/${user.uid}`), {
        nome,
        sobrenome,
        email,
        cpf,
        dataNascimento: date,
        plano: planoSelecionado || "gratuito",
        fotoPerfil: downloadURL,
      });
  
      setCarregando(false);
      await sendEmailVerification(auth.currentUser);
      setLoading(false);
      setVisibleConfirma(true);
    } catch (error) {
      setCarregando(false);
      setLoading(false);
      console.error("Erro ao cadastrar:", error);
  
     
      if (error.code) {
        switch (error.code) {
          case "auth/email-already-in-use":
            Alert.alert("Erro", "Este e-mail já está em uso. Tente outro e-mail.");
            break;
          case "auth/invalid-email":
            Alert.alert("Erro", "O e-mail fornecido é inválido.");
            break;
          case "auth/weak-password":
            Alert.alert("Erro", "A senha é muito fraca. Use pelo menos 6 caracteres.");
            break;
          case "auth/network-request-failed":
            Alert.alert("Erro", "Falha na conexão com a rede. Verifique sua internet.");
            break;
          case "auth/too-many-requests":
            Alert.alert("Erro", "Muitas tentativas. Tente novamente mais tarde.");
            break;
          default:
            Alert.alert("Erro", "Ocorreu um erro ao cadastrar. Tente novamente.");
            break;
        }
      } else {
        
        Alert.alert("Erro", "Ocorreu um erro ao salvar os dados. Tente novamente.");
      }
    }
  };

  const CheckSenha = () => {
    setCarregando(true)
    if (senha.length <= 5) {
      Alert.alert(
        "Senha curta demais",
        "O tamanho mínimo da senha deve ser de 6 dígitos."
      );
      setCarregando(false)
    } else if (senha !== confSenha) {
      Alert.alert("As senhas devem ser idênticas.");
      setCarregando(false)
    } else if (
      nome === "" ||
      sobrenome === "" ||
      date === "" ||
      cpf === "" ||
      email === "" ||
      senha === "" ||
      image == null
    ) {
      Alert.alert("Todos os campos são obrigatórios.");
      setCarregando(false)
    } else {
      salvar()
    }
  };

  const renderItem = ({ item }) => {
    const selecionado = item.id === planoSelecionado;
    return (
      <TouchableOpacity
        style={[styles.item, selecionado && styles.itemSelecionado]}
        onPress={() => setPlanoSelecionado(item.id)}
      >
        <Text style={[styles.texto, selecionado && styles.textoSelecionado]}>
          {item.nome}
        </Text>
      </TouchableOpacity>
    );
  };

  const renderEtapa = () => {
    switch (etapaAtual) {
      case 1:
        return (
          <>
            <View style={styles.section}>
              <LottieView
                source={require("../Assets/Lottie/profile-icon.json")}
                autoPlay
                loop
                style={styles.icon}
              />
              <Text style={styles.sectionTitle}>NOME</Text>
            </View>
            <TextInput
              style={styles.input}
              placeholder="Nome"
              value={nome}
              onChangeText={setNome}
            />

            <View style={styles.section}>
              <LottieView
                source={require("../Assets/Lottie/writing.json")}
                autoPlay
                loop
                style={styles.icon}
              />
              <Text style={styles.sectionTitle}>SOBRENOME</Text>
            </View>
            <TextInput
              style={styles.input}
              placeholder="Sobrenome"
              value={sobrenome}
              onChangeText={setSobrenome}
            />

            <View style={styles.section}>
              <LottieView
                source={require("../Assets/Lottie/calendario.json")}
                autoPlay
                loop
                style={styles.icon}
              />
              <Text style={styles.sectionTitle}>DATA DE NASCIMENTO</Text>
            </View>
            <MaskInput
              style={styles.input}
              placeholder="DD/MM/AAAA"
              value={date}
              onChangeText={setDate}
              mask={Masks.DATE_DDMMYYYY}
              keyboardType="number-pad"
            />

            <View style={styles.section}>
              <LottieView
                source={require("../Assets/Lottie/idCheck.json")}
                autoPlay
                loop
                style={styles.icon}
              />
              <Text style={styles.sectionTitle}>CPF</Text>
            </View>
            <MaskInput
              style={styles.input}
              placeholder="CPF"
              value={cpf}
              onChangeText={(masked, unmasked) => setCpf(unmasked)}
              mask={Masks.BRL_CPF}
              keyboardType="number-pad"
            />
          </>
        );
      case 2:
        return (
          <>
            <View style={styles.section}>
              <LottieView
                source={require("../Assets/Lottie/mail.json")}
                autoPlay
                loop
                style={styles.icon}
              />
              <Text style={styles.sectionTitle}>E-MAIL</Text>
            </View>
            <TextInput
              style={styles.input}
              placeholder="E-mail"
              value={email}
              onChangeText={setEmail}
              keyboardType="email-address"
            />
            {!validateEmail(email) && email && (
              <Text style={styles.errorText}>E-mail inválido</Text>
            )}

            <View style={styles.section}>
              <LottieView
                source={require("../Assets/Lottie/lock-blue.json")}
                autoPlay
                loop
                style={styles.icon}
              />
              <Text style={styles.sectionTitle}>SENHA</Text>
            </View>
            <TextInput
              style={styles.input}
              placeholder="Senha"
              value={senha}
              onChangeText={setSenha}
              secureTextEntry
            />

            <View style={styles.section}>
              <LottieView
                source={require("../Assets/Lottie/checkmark.json")}
                autoPlay
                loop
                style={styles.icon}
              />
              <Text style={styles.sectionTitle}>CONFIRME SUA SENHA</Text>
            </View>
            <TextInput
              style={styles.input}
              placeholder="Confirme sua senha"
              value={confSenha}
              onChangeText={setConfSenha}
              secureTextEntry
            />
          </>
        );
      case 3:
        return (
          <>
            <View style={styles.section}>
              <LottieView
                source={require("../Assets/Lottie/image-picture.json")}
                autoPlay
                loop
                style={styles.icon}
              />
              <Text style={styles.sectionTitle}>FOTO DE PERFIL</Text>
            </View>
            {image && (
              <Image source={{ uri: image }} style={styles.imagePreview} />
            )}
            <TouchableOpacity style={styles.botao3} onPress={pickImage}>
              <Text style={styles.textBotao}>
                {image ? "ALTERAR FOTO" : "SELECIONAR FOTO"}
              </Text>
            </TouchableOpacity>
          </>
        );
      case 4:
        return (
          <>
            <View style={styles.section}>
              <LottieView
                source={require("../Assets/Lottie/Paying.json")}
                autoPlay
                loop
                style={styles.icon}
              />
              <Text style={styles.sectionTitle}>PLANO</Text>
            </View>
            <FlatList
              data={planos}
              horizontal
              keyExtractor={(item) => item.id}
              renderItem={renderItem}
              showsHorizontalScrollIndicator={false}
              contentContainerStyle={styles.flatList}
            />
          </>
        );
      case 5:
        return (
          <>
            <Text style={styles.titleModal}>CONFIRME SEUS DADOS</Text>
            <Text>⬤ NOME: {nome}</Text>
            <Text>⬤ SOBRENOME: {sobrenome}</Text>
            <Text>⬤ NASCIMENTO: {date}</Text>
            <Text>⬤ CPF: {cpf}</Text>
            <Text>⬤ E-MAIL: {email}</Text>
            <Text>⬤ PLANO: {planoSelecionado}</Text>
            {image && (
              <Image source={{ uri: image }} style={styles.imagePreview} />
            )}

          </>
        );
      default:
        return null;
    }
  };

  return (
    <ScrollView contentContainerStyle={styles.container}>
      <StatusBar barStyle="dark-content" style="dark" translucent={true} />
      <Modal
        animationType="fade"
        visible={visible}
        transparent={true}
        onRequestClose={() => setVisible(false)}
      >
        <View style={styles.modalOverlay}>
          <View style={styles.modal}>
            <Text style={styles.titleModal}>DESEJA CANCELAR SEU CADASTRO?</Text>
            <TouchableOpacity
              style={[styles.botaoModal, styles.botaoModal1]}
              onPress={() => setVisible(false) && navigation.navigate("Login")}
            >
              <Text style={styles.textBotao}>SAIR</Text>
            </TouchableOpacity>
            <TouchableOpacity
              style={[styles.botaoModal, styles.botaoModal2]}
              onPress={() => setVisible(false)}
            >
              <Text style={styles.textBotao}>CONTINUAR</Text>
            </TouchableOpacity>
          </View>
        </View>
      </Modal>

      <Modal
        animationType="fade"
        visible={visibleConfirma}
        transparent={true}
        onRequestClose={() => setVisibleConfirma(false)}
      >
        <View style={styles.modalOverlay}>
          <View style={styles.modal}>
            <Text style={styles.titleModal}>CADASTRO CONCLUÍDO!</Text>
            <LottieView
              source={require("../Assets/Lottie/confirmed.json")}
              autoPlay
              loop={false}
              style={styles.lottie}
            />
            <Text style={styles.subTitleModal}>Aproveite o app!</Text>
            <TouchableOpacity
              style={[styles.botaoModal, styles.botaoModal3]}
              onPress={closeModal}
            >
              <Text style={styles.textBotao}>SAIR</Text>
            </TouchableOpacity>
          </View>
        </View>
      </Modal>

      <View style={styles.header}>
        <Image
          source={require("../images/Praticamente.png")}
          style={styles.logo}
        />
        <Text style={styles.headerText}>CADASTRAR</Text>
      </View>

      {renderEtapa()}
    <View style={styles.navCadastro}>

      <View style={styles.botoesNavegacao}>
        {etapaAtual > 1 && (
          <TouchableOpacity
            style={styles.botaoVoltar}
            onPress={() => setEtapaAtual(etapaAtual - 1)}
          >
            <Text style={styles.textBotao}>VOLTAR</Text>
          </TouchableOpacity>
        )}
        {etapaAtual < 5 && (
          <TouchableOpacity
            style={styles.botaoAvancar}
            onPress={validarEtapa}
          >
            <Text style={styles.textBotao}>PRÓXIMO</Text>
          </TouchableOpacity>
        )}
        {etapaAtual === 5 && (
          <TouchableOpacity style={styles.botao1} onPress={CheckSenha}>
            {carregando ? (
              <ActivityIndicator size="small" color="#fff" />
            ) : (
              <Text style={styles.textBotao}>SALVAR</Text>
            )
            }
          </TouchableOpacity>
        )}
      </View>
      <TouchableOpacity style={styles.botao2} onPress={() => setVisible(true)}>
        <Text style={styles.textBotao}>CANCELAR</Text>
      </TouchableOpacity>
    </View>
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container: {
    flexGrow: 1,
    paddingHorizontal: width * 0.05,
    backgroundColor: "#F0F4F8",
    paddingVertical: 20,
    marginTop: Constants.statusBarHeight,
  },
  header: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    marginBottom: 30,
  },
  logo: {
    width: 55,
    height: 55,
    marginRight: 15,
  },
  headerText: {
    fontSize: 30,
    fontWeight: "bold",
    color: "#2D3748",
  },
  section: {
    flexDirection: "row",
    alignItems: "center",
    marginBottom: 10,
  },
  icon: {
    width: 30,
    height: 30,
    marginRight: 10,
  },
  sectionTitle: {
    fontSize: 18,
    fontWeight: "500",
    color: "#2D3748",
  },
  input: {
    backgroundColor: "#FFF",
    height: 50,
    borderRadius: 10,
    borderWidth: 1,
    borderColor: "#E2E8F0",
    marginBottom: 15,
    paddingHorizontal: 15,
    fontSize: 16,
  },
  errorText: {
    color: "rgb(255, 185, 185)",
    marginBottom: 20,
    fontWeight: "400",
    backgroundColor: "rgb(255, 72, 72)",
    padding: 10,
    borderRadius: 10,
  },
  botao1: {
    backgroundColor: "#4C51BF",
    height: 50,
    width: width * 0.45, 
    borderRadius: 10,
    justifyContent: "center",
    alignItems: "center",
    marginTop: 0,
    elevation: 5,
    alignSelf: "center", 
  },
  botao2: {
    backgroundColor: "#FF3030",
    height: 50,
    width: width * 0.7,
    borderRadius: 10,
    justifyContent: "center",
    alignItems: "center",
    marginTop: 10,
    elevation: 5,
    paddingBottom: 10,
    marginBottom: 120,
    alignSelf: "center",
  },
  botao3: {
    backgroundColor: "#D9D9D9",
    height: 50,
    width: width * 0.7,
    borderRadius: 10,
    justifyContent: "center",
    alignItems: "center",
    marginTop: 10,
    elevation: 5,
    alignSelf: "center",
  },
  textBotao: {
    fontSize: 16,
    fontWeight: "600",
    color: "#FFF",
  },
  modalOverlay: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
    backgroundColor: "rgba(0, 0, 0, 0.5)",
  },
  modal: {
    backgroundColor: "#FFF",
    width: width * 0.8,
    borderRadius: 10,
    padding: 20,
    elevation: 5,
  },
  titleModal: {
    fontSize: 18,
    fontWeight: "bold",
    textAlign: "center",
    marginBottom: 20,
  },
  botaoModal: {
    height: 50,
    borderRadius: 10,
    justifyContent: "center",
    alignItems: "center",
    marginTop: 10,
  },
  botaoModal1: {
    backgroundColor: "#FF3030",
  },
  botaoModal2: {
    backgroundColor: "#4C51BF",
  },
  botaoConfirmarModal: {
    backgroundColor: "#48BB78",
  },
  botaoAlterarDadosModal: {
    backgroundColor: "#FF3030",
  },
  imagePreview: {
    width: 100,
    height: 100,
    borderRadius: 50,
    alignSelf: "center",
    marginBottom: 20,
  },
  flatList: {
    paddingHorizontal: 10,
    marginBottom: 0,
  },
  item: {
    padding: 15,
    width: 150,
    height: 80,
    borderRadius: 10,
    backgroundColor: "#D9D9D9",
    marginRight: 10,
    justifyContent: "center",
    alignItems: "center",
  },
  itemSelecionado: {
    backgroundColor: "#4C51BF",
  },
  texto: {
    fontSize: 16,
    color: "#2D3748",
  },
  textoSelecionado: {
    color: "#FFF",
    fontWeight: "bold",
  },
  botoesNavegacao: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    marginTop: 20,
    paddingHorizontal: 10,

  },
  botaoVoltar: {
    backgroundColor: "#FF3030",
    height: 50,
    width: width * 0.45,
    borderRadius: 10,
    justifyContent: "center",
    alignItems: "center",
    elevation: 5,
    marginRight: 5,
  },
  botaoAvancar: {
    backgroundColor: "#4C51BF",
    height: 50,
    width: width * 0.45,
    borderRadius: 10,
    justifyContent: "center",
    alignItems: "center",
    elevation: 5,
    marginLeft: 5,
  },
  navCadastro:{
    flexDirection: "column",
    
    justifyContent: "space-between",
    alignItems: "center",
    paddingHorizontal: 10,
    bottom:-10,
  },
  subTitleModal: {
    fontSize: 16,
    textAlign: "center",
    marginBottom: 20,
  },
  botaoModal3: {
    backgroundColor: "#D9D9D9",
    height: 50,
    width: width * 0.7,
    borderRadius: 10,
    justifyContent: "center",
    alignItems: "center",
    marginTop: 10,
    elevation: 5,
    alignSelf: "center",
  },
  loadingOverlay: {
    position: "absolute",
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
    justifyContent: "center",
    alignItems: "center",
    backgroundColor: "rgba(255, 255, 255, 0.8)", // Fundo semi-transparente
    zIndex: 1000, // Garante que fique acima de tudo
  },
  lottieLoading: {
    width: 100,
    height: 100,
  },
  loadingText: {
    marginTop: 10,
    fontSize: 16,
    color: "#4C51BF",
  },
});
