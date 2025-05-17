import React, { useState, useEffect } from "react";
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
  ActivityIndicator,
} from "react-native";
import * as ImagePicker from "expo-image-picker";
import { useNavigation } from "@react-navigation/native";
import MaskInput, { Masks } from "react-native-mask-input";
import LottieView from "lottie-react-native";
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
  const [etapaAtual, setEtapaAtual] = useState(1);
  const [carregando, setCarregando] = useState(false);
  const navigation = useNavigation();
  const auth = getAuth();
  const storage = getStorage();

  const planos = [
    {
      id: "gratuito",
      nome: "Gratuito",
      descricao: "Acesso básico ao app",
      disponivel: true,
    },
    {
      id: "mensal",
      nome: "Mensal - R$ 29,90",
      descricao: "Em breve",
      disponivel: false,
    },
    {
      id: "anual",
      nome: "Anual - R$ 299,90",
      descricao: "Em breve",
      disponivel: false,
    },
  ];

  useEffect(() => {
    setPlanoSelecionado("gratuito");
  }, []);

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
      console.log("Erro ao cadastrar:", error.message);
      console.error("Erro ao cadastrar:", error);

      if (error.code) {
        switch (error.code) {
          case "auth/email-already-in-use":
            Alert.alert(
              "Erro",
              "Este e-mail já está em uso. Tente outro e-mail."
            );
            break;
          case "auth/invalid-email":
            Alert.alert("Erro", "O e-mail fornecido é inválido.");
            break;
          case "auth/weak-password":
            Alert.alert(
              "Erro",
              "A senha é muito fraca. Use pelo menos 6 caracteres."
            );
            break;
          case "auth/network-request-failed":
            Alert.alert(
              "Erro",
              "Falha na conexão com a rede. Verifique sua internet."
            );
            break;
          case "auth/too-many-requests":
            Alert.alert(
              "Erro",
              "Muitas tentativas. Tente novamente mais tarde."
            );
            break;
          default:
            Alert.alert(
              "Erro",
              "Ocorreu um erro ao cadastrar. Tente novamente."
            );
            break;
        }
      } else {
        Alert.alert(
          "Erro",
          "Ocorreu um erro ao salvar os dados. Tente novamente."
        );
      }
    }
  };

  const CheckSenha = () => {
    setCarregando(true);
    if (senha.length <= 5) {
      Alert.alert(
        "Senha curta demais",
        "O tamanho mínimo da senha deve ser de 6 dígitos."
      );
      setCarregando(false);
    } else if (senha !== confSenha) {
      Alert.alert("As senhas devem ser idênticas.");
      setCarregando(false);
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
      setCarregando(false);
    } else {
      salvar();
    }
  };

  const renderItem = ({ item }) => {
    const selecionado = item.id === planoSelecionado;
    const disponivel = item.disponivel;

    return (
      <TouchableOpacity
        style={[
          styles.itemVertical,
          selecionado && styles.itemSelecionado,
          !disponivel && styles.itemIndisponivel,
        ]}
        onPress={() => disponivel && setPlanoSelecionado(item.id)}
        disabled={!disponivel}
      >
        <Text
          style={[
            styles.texto,
            selecionado && styles.textoSelecionado,
            !disponivel && styles.textoIndisponivel,
          ]}
        >
          {item.nome}
        </Text>
        <Text
          style={[
            styles.descricao,
            selecionado && styles.descricaoSelecionada,
            !disponivel && styles.descricaoIndisponivel,
          ]}
        >
          {item.descricao}
        </Text>
        {!disponivel && (
          <View style={styles.embreveContainer}>
            <Text style={styles.embreveText}>EM BREVE</Text>
          </View>
        )}
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
              //secureTextEntry
              
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
              //secureTextEntry
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
            <TouchableOpacity style={styles.botaoFoto} onPress={pickImage}>
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

            <Text style={styles.infoText}>
              No momento, apenas o plano gratuito está disponível. Em breve
              teremos mais opções!
            </Text>

            <View style={styles.planosContainer}>
              {planos.map((item) => {
                const selecionado = item.id === planoSelecionado;
                const disponivel = item.disponivel;

                return (
                  <TouchableOpacity
                    key={item.id}
                    style={[
                      styles.itemVertical,
                      selecionado && styles.itemSelecionado,
                      !disponivel && styles.itemIndisponivel,
                    ]}
                    onPress={() => disponivel && setPlanoSelecionado(item.id)}
                    disabled={!disponivel}
                  >
                    <Text
                      style={[
                        styles.texto,
                        selecionado && styles.textoSelecionado,
                        !disponivel && styles.textoIndisponivel,
                      ]}
                    >
                      {item.nome}
                    </Text>
                    <Text
                      style={[
                        styles.descricao,
                        selecionado && styles.descricaoSelecionada,
                        !disponivel && styles.descricaoIndisponivel,
                      ]}
                    >
                      {item.descricao}
                    </Text>
                    {!disponivel && (
                      <View style={styles.embreveContainer}>
                        <Text style={styles.embreveText}>EM BREVE</Text>
                      </View>
                    )}
                  </TouchableOpacity>
                );
              })}
            </View>
          </>
        );
      case 5:
        return (
          <View style={styles.confirmacaoContainer}>
            <Text style={styles.tituloConfirmacao}>CONFIRME SEUS DADOS</Text>

            <View style={styles.dadosContainer}>
              <View style={styles.dadosSection}>
                <Text style={styles.sectionHeader}>DADOS PESSOAIS</Text>
                <View style={styles.dadoItem}>
                  <Text style={styles.dadoLabel}>Nome:</Text>
                  <Text style={styles.dadoValue}>{nome}</Text>
                </View>
                <View style={styles.dadoItem}>
                  <Text style={styles.dadoLabel}>Sobrenome:</Text>
                  <Text style={styles.dadoValue}>{sobrenome}</Text>
                </View>
                <View style={styles.dadoItem}>
                  <Text style={styles.dadoLabel}>Nascimento:</Text>
                  <Text style={styles.dadoValue}>{date}</Text>
                </View>
                <View style={styles.dadoItem}>
                  <Text style={styles.dadoLabel}>CPF:</Text>
                  <Text style={styles.dadoValue}>{cpf}</Text>
                </View>
              </View>

              <View style={styles.dadosSection}>
                <Text style={styles.sectionHeader}>CONTA</Text>
                <View style={styles.dadoItem}>
                  <Text style={styles.dadoLabel}>E-mail:</Text>
                  <Text style={styles.dadoValue}>{email}</Text>
                </View>
              </View>

              <View style={styles.dadosSection}>
                <Text style={styles.sectionHeader}>PLANO</Text>
                <View style={styles.planoItem}>
                  <Text style={styles.planoNome}>
                    {planos.find((p) => p.id === planoSelecionado)?.nome}
                  </Text>
                  <Text style={styles.planoDescricao}>
                    {planos.find((p) => p.id === planoSelecionado)?.descricao}
                  </Text>
                </View>
              </View>

              <View style={styles.dadosSection}>
                <Text style={styles.sectionHeader}>FOTO DE PERFIL</Text>
                {image && (
                  <Image
                    source={{ uri: image }}
                    style={styles.imagePreviewConfirmacao}
                  />
                )}
              </View>
            </View>
          </View>
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
              onPress={() => {
                setVisible(false);
                navigation.navigate("Login");
              }}
            >
              <Text style={styles.textBotaoModal1}>SAIR</Text>
            </TouchableOpacity>
            <TouchableOpacity
              style={[styles.botaoModal, styles.botaoModal2]}
              onPress={() => setVisible(false)}
            >
              <Text style={styles.textBotaoModal2}>CONTINUAR</Text>
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
              <Text style={styles.textBotaoModal2}>ENTENDI</Text>
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

      <View style={styles.footer}>
        <View
          style={[
            styles.botoesNavegacao,
            etapaAtual === 1 && styles.primeiraEtapa,
            etapaAtual === 5 && styles.ultimaEtapa,
          ]}
        >
          {etapaAtual > 1 && (
            <TouchableOpacity
              style={[
                styles.botaoVoltar,
                etapaAtual === 5 && styles.botaoUnico,
              ]}
              onPress={() => setEtapaAtual(etapaAtual - 1)}
            >
              <Text style={styles.textBotaoVoltar}>VOLTAR</Text>
            </TouchableOpacity>
          )}

          {etapaAtual < 5 ? (
            <TouchableOpacity
              style={[
                styles.botaoAvancar,
                etapaAtual === 1 && styles.botaoUnico,
              ]}
              onPress={validarEtapa}
            >
              <Text style={styles.textBotao}>PRÓXIMO</Text>
            </TouchableOpacity>
          ) : (
            <TouchableOpacity
              style={styles.botaoConfirmar}
              onPress={CheckSenha}
            >
              {carregando ? (
                <ActivityIndicator size="small" color="#fff" />
              ) : (
                <Text style={styles.textBotao}>CONFIRMAR CADASTRO</Text>
              )}
            </TouchableOpacity>
          )}
        </View>

        {/* Botão Cancelar - sempre visível */}
        <TouchableOpacity
          style={styles.botaoCancelar}
          onPress={() => setVisible(true)}
        >
          <Text style={styles.textBotaoCancelar}>CANCELAR</Text>
        </TouchableOpacity>
      </View>
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container: {
    flexGrow: 1,
    paddingHorizontal: 20,
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
  imagePreview: {
    width: 100,
    height: 100,
    borderRadius: 50,
    alignSelf: "center",
    marginBottom: 20,
  },
  botaoFoto: {
    backgroundColor: "#4C51BF",
    height: 50,
    width: "100%",
    borderRadius: 12,
    justifyContent: "center",
    alignItems: "center",
    marginTop: 10,
    elevation: 3,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.2,
    shadowRadius: 2,
  },
  textBotao: {
    fontSize: 16,
    fontWeight: "600",
    color: "#FFF",
    letterSpacing: 0.5,
  },
  modalOverlay: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
    backgroundColor: "rgba(0, 0, 0, 0.5)",
  },
  modal: {
    backgroundColor: "#FFF",
    width: width * 0.85,
    borderRadius: 12,
    padding: 20,
    elevation: 5,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.2,
    shadowRadius: 2,
  },
  titleModal: {
    fontSize: 18,
    fontWeight: "bold",
    textAlign: "center",
    marginBottom: 20,
  },
  botaoModal: {
    height: 50,
    borderRadius: 12,
    justifyContent: "center",
    alignItems: "center",
    marginTop: 10,
    width: "100%",
  },
  botaoModal1: {
    backgroundColor: "#FFF",
    borderWidth: 2,
    borderColor: "#FF3030",
  },
  botaoModal2: {
    backgroundColor: "#4C51BF",
  },
  botaoModal3: {
    backgroundColor: "#4C51BF",
    width: "80%",
    alignSelf: "center",
  },
  textBotaoModal1: {
    fontSize: 16,
    fontWeight: "600",
    color: "#FF3030",
  },
  textBotaoModal2: {
    fontSize: 16,
    fontWeight: "600",
    color: "#FFF",
  },
  itemVertical: {
    padding: 15,
    width: "100%",
    borderRadius: 10,
    backgroundColor: "#D9D9D9",
    marginBottom: 10,
    justifyContent: "center",
    alignItems: "flex-start",
    position: "relative",
  },
  itemSelecionado: {
    backgroundColor: "#4C51BF",
  },
  itemIndisponivel: {
    backgroundColor: "#E2E8F0",
    opacity: 0.7,
  },
  texto: {
    fontSize: 16,
    color: "#2D3748",
  },
  textoSelecionado: {
    color: "#FFF",
    fontWeight: "bold",
  },
  textoIndisponivel: {
    color: "#A0AEC0",
  },
  descricao: {
    fontSize: 12,
    color: "#718096",
    marginTop: 5,
    textAlign: "left",
  },
  descricaoSelecionada: {
    color: "#E2E8F0",
  },
  descricaoIndisponivel: {
    color: "#A0AEC0",
  },
  embreveContainer: {
    position: "absolute",
    top: 5,
    right: 5,
    backgroundColor: "#F56565",
    borderRadius: 10,
    paddingHorizontal: 6,
    paddingVertical: 2,
  },
  embreveText: {
    fontSize: 10,
    color: "#FFF",
    fontWeight: "bold",
  },
  infoText: {
    fontSize: 14,
    color: "#4A5568",
    textAlign: "center",
    marginBottom: 15,
    paddingHorizontal: 10,
  },
  planosContainer: {
    width: "100%",
    marginBottom: 20,
  },
  footer: {
    width: "100%",
    paddingHorizontal: 20,
    marginTop: 30,
    marginBottom: 40,
  },
  botoesNavegacao: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    marginBottom: 15,
    width: "100%",
  },
  primeiraEtapa: {
    justifyContent: "flex-end",
  },
  ultimaEtapa: {
    flexDirection: "column",
    gap: 10,
    justifyContent: "center",
  },
  botaoVoltar: {
    backgroundColor: "#FFF",
    height: 50,
    width: "48%",
    borderRadius: 12,
    justifyContent: "center",
    alignItems: "center",
    elevation: 3,
    borderWidth: 2,
    borderColor: "#4C51BF",
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.2,
    shadowRadius: 2,
  },
  botaoAvancar: {
    backgroundColor: "#4C51BF",
    height: 50,
    width: "48%",
    borderRadius: 12,
    justifyContent: "center",
    alignItems: "center",
    elevation: 3,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.2,
    shadowRadius: 2,
  },
  botaoUnico: {
    width: "100%", // Para quando há apenas um botão na linha
  },
  botaoConfirmar: {
    backgroundColor: "#4C51BF",
    height: 50,
    width: "100%",
    borderRadius: 12,
    justifyContent: "center",
    alignItems: "center",
    elevation: 3,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.2,
    shadowRadius: 2,
  },
  botaoCancelar: {
    backgroundColor: "#FFF",
    height: 50,
    width: "100%",
    borderRadius: 12,
    justifyContent: "center",
    alignItems: "center",
    elevation: 3,
    borderWidth: 2,
    borderColor: "#FF3030",
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.2,
    shadowRadius: 2,
  },
  textBotaoVoltar: {
    fontSize: 16,
    fontWeight: "600",
    color: "#4C51BF",
    letterSpacing: 0.5,
  },
  textBotaoCancelar: {
    fontSize: 16,
    fontWeight: "600",
    color: "#FF3030",
    letterSpacing: 0.5,
  },
  confirmacaoContainer: {
    width: "100%",
    paddingHorizontal: 15,
  },
  tituloConfirmacao: {
    fontSize: 22,
    fontWeight: "bold",
    color: "#2D3748",
    textAlign: "center",
    marginBottom: 20,
  },
  dadosContainer: {
    width: "100%",
    backgroundColor: "#FFF",
    borderRadius: 12,
    padding: 20,
    elevation: 3,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.2,
    shadowRadius: 2,
  },
  dadosSection: {
    marginBottom: 20,
  },
  sectionHeader: {
    fontSize: 16,
    fontWeight: "600",
    color: "#4C51BF",
    marginBottom: 10,
    paddingBottom: 5,
    borderBottomWidth: 1,
    borderBottomColor: "#E2E8F0",
  },
  dadoItem: {
    flexDirection: "row",
    justifyContent: "space-between",
    marginBottom: 8,
  },
  dadoLabel: {
    fontSize: 14,
    color: "#718096",
    fontWeight: "500",
    width: "40%",
  },
  dadoValue: {
    fontSize: 14,
    color: "#2D3748",
    fontWeight: "600",
    width: "60%",
    textAlign: "right",
  },
  planoItem: {
    backgroundColor: "#EDF2F7",
    borderRadius: 8,
    padding: 12,
  },
  planoNome: {
    fontSize: 15,
    fontWeight: "bold",
    color: "#2D3748",
  },
  planoDescricao: {
    fontSize: 13,
    color: "#718096",
    marginTop: 4,
  },
  imagePreviewConfirmacao: {
    width: 80,
    height: 80,
    borderRadius: 40,
    alignSelf: "center",
    borderWidth: 2,
    borderColor: "#E2E8F0",
  },
  subTitleModal: {
    fontSize: 16,
    textAlign: "center",
    marginBottom: 20,
  },
  lottie: {
    width: 100,
    height: 100,
    alignSelf: "center",
    marginVertical: 20,
  },
});
