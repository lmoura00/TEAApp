import React, { useState, useEffect, useRef } from 'react';
import { View, Text, TouchableOpacity, Image, StyleSheet, Animated } from 'react-native';
import { Audio } from 'expo-av';
import { MaterialIcons } from '@expo/vector-icons';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { getDatabase, ref, set, get, push } from 'firebase/database';
import { getAuth } from 'firebase/auth';
import { useRoute } from '@react-navigation/native';
import * as Notifications from 'expo-notifications';

const sounds = {
  dog: require('./assets/dog.mp3'),
  cat: require('./assets/cat.mp3'),
  bird: require('./assets/bird.mp3'),
};

const images = {
  dog: require('./assets/dog.png'),
  cat: require('./assets/cat.png'),
  bird: require('./assets/bird.png'),
};

const colors = {
  dog: '#FF6F61', // Coral
  cat: '#6B5B95', // Roxo
  bird: '#88B04B', // Verde
};

const noiseSound = require('./assets/noise.mp3'); // Arquivo de ruído

const JogoSonsEImagens = ({ navigation }) => {
  const route = useRoute();
  const { dependentId, dependentName } = route.params || { dependentId: null, dependentName: null };

  if (!dependentId) {
    return (
      <View style={styles.container}>
        <Text style={styles.errorText}>Erro: Dependente não selecionado.</Text>
        <TouchableOpacity
          style={styles.backButton}
          onPress={() => navigation.goBack()}
        >
          <Text style={styles.backButtonText}>Voltar</Text>
        </TouchableOpacity>
      </View>
    );
  }

  const [currentSound, setCurrentSound] = useState(null);
  const [feedback, setFeedback] = useState('');
  const [isPlaying, setIsPlaying] = useState(false);
  const [level, setLevel] = useState(1);
  const [score, setScore] = useState(0); // Pontuação atual
  const [time, setTime] = useState(0); // Tempo gasto no nível
  const [isGameStarted, setIsGameStarted] = useState(false); // Estado para controlar o início do jogo
  const soundObject = useRef(new Audio.Sound());
  const noiseObject = useRef(new Audio.Sound());
  const buttonScale = useRef(new Animated.Value(1)).current; // Animação de escala
  const auth = getAuth();

  // Função para enviar notificação local
  const sendNotification = async (dependentName, gameName, score) => {
    await Notifications.scheduleNotificationAsync({
      content: {
        title: 'Novo Desempenho!',
        body: `O dependente ${dependentName} acabou de jogar o ${gameName}. Sua pontuação foi de ${score} pontos.`,
        sound: true,
        icon: './assets/adaptive-icon-no-name.png', 
      },
      trigger: { seconds: 1 }, // Notificação será enviada após 1 segundo
    });
  };

  // Função para salvar notificação no Firebase
  const saveNotification = async (userId, notification) => {
    try {
      const db = getDatabase();
      const notificationsRef = ref(db, `users/${userId}/notifications`);
      console.log('Tentando salvar notificação no Firebase:', notification); // Log para depuração
      await push(notificationsRef, notification);
      console.log('Notificação salva com sucesso!');
    } catch (error) {
      console.error('Erro ao salvar notificação:', error);
    }
  };

  // Timer
  useEffect(() => {
    let timer;
    if (isGameStarted) {
      timer = setInterval(() => {
        setTime((prevTime) => prevTime + 1);
      }, 1000);
    }

    return () => {
      if (timer) clearInterval(timer); // Limpa o timer ao desmontar o componente
    };
  }, [isGameStarted]);

  const playSound = async (soundKey) => {
    try {
      // Para e descarrega o som atual, se estiver carregado
      const soundStatus = await soundObject.current.getStatusAsync();
      if (soundStatus.isLoaded) {
        await soundObject.current.stopAsync();
        await soundObject.current.unloadAsync();
      }

      // Para e descarrega o ruído, se estiver carregado
      const noiseStatus = await noiseObject.current.getStatusAsync();
      if (noiseStatus.isLoaded) {
        await noiseObject.current.stopAsync();
        await noiseObject.current.unloadAsync();
      }

      // Toca o som principal
      await soundObject.current.loadAsync(sounds[soundKey]);
      await soundObject.current.setRateAsync(1 + (level - 1) * 0.2, true); // Aumenta a velocidade conforme o nível

      // Configura o listener para detectar quando o som termina
      soundObject.current.setOnPlaybackStatusUpdate((status) => {
        if (status.didJustFinish) {
          setIsPlaying(false); // Atualiza o estado quando o som termina
        }
      });

      await soundObject.current.playAsync();
      setCurrentSound(soundKey);
      setIsPlaying(true);

      // Adiciona ruído em níveis mais altos
      if (level >= 3) {
        await noiseObject.current.loadAsync(noiseSound);
        await noiseObject.current.playAsync();
      }
    } catch (error) {
      console.log('Erro ao reproduzir o som:', error);
    }
  };

  const stopSound = async () => {
    try {
      // Para o som principal, se estiver carregado
      const soundStatus = await soundObject.current.getStatusAsync();
      if (soundStatus.isLoaded) {
        await soundObject.current.stopAsync();
      }

      // Para o ruído, se estiver carregado
      const noiseStatus = await noiseObject.current.getStatusAsync();
      if (noiseStatus.isLoaded) {
        await noiseObject.current.stopAsync();
      }

      setIsPlaying(false);
    } catch (error) {
      console.log('Erro ao parar o som:', error);
    }
  };

  const saveScore = async () => {
    try {
      const db = getDatabase();
      const scoreRef = ref(
        db,
        `users/${auth.currentUser.uid}/dependents/${dependentId}/scores/SonsEImagens/level${level}`
      );

      const snapshot = await get(scoreRef);
      const currentScores = snapshot.val() || [];

      const newScoreEntry = {
        score: score,
        time: time,
        timestamp: Date.now(),
      };
      const updatedScores = [...currentScores, newScoreEntry];

      await set(scoreRef, updatedScores);

      console.log('Pontuação e tempo salvos com sucesso!');
    } catch (error) {
      console.error('Erro ao salvar pontuação e tempo:', error);
    }
  };

  const nextLevel = () => {
    saveScore(); // Salva a pontuação e o tempo no Firebase

    // Enviar notificação local
    sendNotification(dependentName, 'Jogo de Sons e Imagens', score);

    // Salvar notificação no Firebase
    const notification = {
      title: 'Novo Desempenho!',
      body: `O dependente ${dependentName} acabou de jogar o Jogo de Sons e Imagens. Sua pontuação foi de ${score} pontos.`,
      timestamp: Date.now(),
      read: false,
    };
    saveNotification(auth.currentUser.uid, notification);

    setLevel((prevLevel) => prevLevel + 1); // Avança para o próximo nível
    setTime(0); // Reinicia o tempo
    setScore(0); // Reinicia a pontuação
    setIsGameStarted(false); // Reinicia o estado do jogo
    const soundKeys = Object.keys(sounds);
    const randomSoundKey = soundKeys[Math.floor(Math.random() * soundKeys.length)];
    playSound(randomSoundKey); // Toca um novo som
  };

  const checkAnswer = (imageKey) => {
    if (!isGameStarted) {
      setIsGameStarted(true); // Inicia o jogo na primeira resposta
    }

    if (imageKey === currentSound) {
      setFeedback('Correto! 🎉');
      setScore((prevScore) => prevScore + 10); // Aumenta a pontuação em 10 pontos
      nextLevel(); // Avança para o próximo nível
    } else {
      setFeedback('Errado! Tente novamente. 😊');
      setScore((prevScore) => Math.max(0, prevScore - 5)); // Diminui a pontuação em 5 pontos
      setLevel(1); // Reseta o nível
      setTime(0); // Reinicia o tempo
      setIsGameStarted(false); // Reinicia o estado do jogo
      const soundKeys = Object.keys(sounds);
      const randomSoundKey = soundKeys[Math.floor(Math.random() * soundKeys.length)];
      playSound(randomSoundKey); // Toca um novo som
    }
  };

  // Animação ao pressionar o botão
  const animateButton = () => {
    Animated.sequence([
      Animated.timing(buttonScale, {
        toValue: 0.9,
        duration: 50,
        useNativeDriver: true,
      }),
      Animated.timing(buttonScale, {
        toValue: 1,
        duration: 50,
        useNativeDriver: true,
      }),
    ]).start();
  };

  useEffect(() => {
    const soundKeys = Object.keys(sounds);
    const randomSoundKey = soundKeys[Math.floor(Math.random() * soundKeys.length)];
    playSound(randomSoundKey);

    return () => {
      // Limpeza ao sair da tela
      const cleanup = async () => {
        const soundStatus = await soundObject.current.getStatusAsync();
        if (soundStatus.isLoaded) {
          await soundObject.current.stopAsync();
          await soundObject.current.unloadAsync();
        }

        const noiseStatus = await noiseObject.current.getStatusAsync();
        if (noiseStatus.isLoaded) {
          await noiseObject.current.stopAsync();
          await noiseObject.current.unloadAsync();
        }
      };

      cleanup();
    };
  }, []);

  return (
    <View style={styles.container}>
      <Text style={styles.title}>Qual animal está fazendo este som?</Text>
      <Text style={styles.feedback}>{feedback}</Text>
      <Text style={styles.levelText}>Nível: {level}</Text>
      <Text style={styles.scoreText}>Pontuação: {score}</Text>
      <Text style={styles.timeText}>Tempo: {time}s</Text>
      <View style={styles.grid}>
        {Object.keys(images).map((key) => (
          <TouchableOpacity
            key={key}
            onPress={() => {
              checkAnswer(key);
              animateButton();
            }}
            style={[styles.buttonImage, { backgroundColor: colors[key] }]} // Aplica a cor dinamicamente
          >
            <Image source={images[key]} style={styles.image} />
          </TouchableOpacity>
        ))}
      </View>
      <Animated.View style={{ transform: [{ scale: buttonScale }] }}>
        <TouchableOpacity
          style={[styles.button, { backgroundColor: isPlaying ? '#FF6F61' : '#88B04B' }]} // Vermelho para "Parar Som", Verde para "Repetir Som"
          onPress={() => {
            isPlaying ? stopSound() : playSound(currentSound);
            animateButton();
          }}
        >
          <MaterialIcons
            name={isPlaying ? 'stop' : 'replay'}
            size={24}
            color="#FFF"
            style={styles.icon}
          />
          <Text style={styles.buttonText}>{isPlaying ? 'Parar Som' : 'Repetir Som'}</Text>
        </TouchableOpacity>
      </Animated.View>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: '#F9F9F9', // Fundo claro
  },
  title: {
    fontSize: 24,
    fontWeight: 'bold',
    marginBottom: 20,
    color: '#333',
  },
  feedback: {
    fontSize: 24,
    marginBottom: 10,
    color: '#333',
    fontWeight: 'bold',
  },
  levelText: {
    fontSize: 20,
    marginBottom: 10,
    color: '#555',
  },
  scoreText: {
    fontSize: 20,
    marginBottom: 10,
    color: '#2E86C1', // Azul
    fontWeight: 'bold',
  },
  timeText: {
    fontSize: 20,
    marginBottom: 20,
    color: '#555',
  },
  grid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    justifyContent: 'center',
  },
  buttonImage: {
    margin: 10,
    borderRadius: 20,
    padding: 15,
    alignItems: 'center',
    justifyContent: 'center',
    elevation: 3,
    shadowColor: '#000',
    shadowOffset: { width: 1, height: 1 },
    shadowOpacity: 0.3,
    shadowRadius: 2,
  },
  image: {
    width: 80,
    height: 80,
  },
  button: {
    marginTop: 20,
    padding: 15,
    borderRadius: 25,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    elevation: 3,
    shadowColor: '#000',
    shadowOffset: { width: 1, height: 1 },
    shadowOpacity: 0.3,
    shadowRadius: 2,
  },
  buttonText: {
    color: '#FFF',
    fontSize: 18,
    marginLeft: 10,
    fontWeight: 'bold',
  },
  icon: {
    marginRight: 5,
  },
  errorText: {
    fontSize: 18,
    color: 'red',
    marginBottom: 20,
  },
  backButton: {
    backgroundColor: '#77bad5',
    padding: 10,
    borderRadius: 5,
  },
  backButtonText: {
    color: '#fff',
    fontSize: 16,
  },
});

export default JogoSonsEImagens;