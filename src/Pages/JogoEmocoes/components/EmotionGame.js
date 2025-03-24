import React, { useState, useEffect } from 'react';
import { View, Text, Image, TouchableOpacity, StyleSheet, Animated, Dimensions, Modal, Alert } from 'react-native';
import { Audio } from 'expo-av';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { MaterialIcons } from '@expo/vector-icons';
import { getDatabase, ref, set, get, push } from 'firebase/database';
import { getAuth } from 'firebase/auth';
import { useRoute } from '@react-navigation/native';
import * as Notifications from 'expo-notifications';

const { width, height } = Dimensions.get('window');

const emotions = [
  { id: 1, name: 'Feliz', image: require('../assets/feliz.png') },
  { id: 2, name: 'Triste', image: require('../assets/triste.png') },
  { id: 3, name: 'Bravo', image: require('../assets/bravo.png') },
  { id: 4, name: 'Surpreso', image: require('../assets/surpreso.png') },
  { id: 5, name: 'Com medo', image: require('../assets/com_medo.png') },
  { id: 6, name: 'Neutro', image: require('../assets/neutro.png') },
  { id: 7, name: 'Nojo', image: require('../assets/nojo.jpg') },
];

const shuffleArray = (array) => {
  for (let i = array.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [array[i], array[j]] = [array[j], array[i]];
  }
  return array;
};

export default function EmotionGame() {
  const route = useRoute();
  const { dependentId, dependentName } = route.params || { dependentId: null, dependentName: null };

  // Verifica se o dependentId está definido
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

  const [currentEmotion, setCurrentEmotion] = useState(emotions[0]);
  const [shuffledEmotions, setShuffledEmotions] = useState(shuffleArray([...emotions]));
  const [feedback, setFeedback] = useState('');
  const [score, setScore] = useState(0);
  const [highScore, setHighScore] = useState(0);
  const [sound, setSound] = useState(null);
  const [isMuted, setIsMuted] = useState(false);
  const [isMenuVisible, setIsMenuVisible] = useState(false);
  const [level, setLevel] = useState(1);
  const [time, setTime] = useState(0);
  const [isGameStarted, setIsGameStarted] = useState(false);
  const [attempts, setAttempts] = useState(0); // Contador de tentativas
  const feedbackAnimation = new Animated.Value(0);

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
    const db = getDatabase();
    const notificationsRef = ref(db, `users/${userId}/notifications`);
    await push(notificationsRef, notification);
  };

  useEffect(() => {
    const loadSoundsAndHighScore = async () => {
      const { sound: successSound } = await Audio.Sound.createAsync(require('../assets/sucess.mp3'));
      const { sound: failSound } = await Audio.Sound.createAsync(require('../assets/fail.mp3'));
      setSound({ success: successSound, fail: failSound });

      const savedHighScore = await AsyncStorage.getItem('highScoreEmotion');
      if (savedHighScore) setHighScore(parseInt(savedHighScore, 10));
    };

    loadSoundsAndHighScore();

    return () => {
      if (sound) {
        sound.success.unloadAsync();
        sound.fail.unloadAsync();
      }
    };
  }, []);

  useEffect(() => {
    let timer;
    if (isGameStarted) {
      timer = setInterval(() => {
        setTime((prevTime) => prevTime + 1);
      }, 1000);
    }
    return () => clearInterval(timer);
  }, [isGameStarted]);

  useEffect(() => {
    if (score > highScore) {
      setHighScore(score);
      AsyncStorage.setItem('highScoreEmotion', score.toString());
    }
  }, [score]);

  const startGame = () => {
    setIsGameStarted(true);
    setTime(0); // Reinicia o tempo
    setAttempts(0); // Reinicia as tentativas
  };

  const saveScore = async (score, time, attempts) => {
    try {
      const db = getDatabase();
      const auth = getAuth();
      const scoreRef = ref(
        db,
        `users/${auth.currentUser.uid}/dependents/${dependentId}/scores/EmotionGame/nivel${level}/tentativa${attempts}`
      );

      // Salvar a pontuação, tempo e timestamp
      const scoreData = {
        score: score,
        time: time,
        timestamp: Date.now(),
      };

      await set(scoreRef, scoreData);

      console.log('Pontuação salva com sucesso!');
    } catch (error) {
      console.error('Erro ao salvar pontuação:', error);
    }
  };
  const auth = getAuth();
  const animateFeedback = () => {
    Animated.sequence([
      Animated.timing(feedbackAnimation, { toValue: 1, duration: 200, useNativeDriver: true }),
      Animated.timing(feedbackAnimation, { toValue: 0, duration: 200, useNativeDriver: true }),
    ]).start();
  };

  const checkAnswer = async (selectedEmotion) => {
    if (selectedEmotion.id === currentEmotion.id) {
      setFeedback('Correto! 🎉');
      const pointsEarned = calculatePoints(time, attempts);
      setScore((prev) => prev + pointsEarned);
      if (sound && !isMuted) await sound.success.replayAsync();
      animateFeedback();
      setTimeout(() => {
        const nextEmotion = emotions[(emotions.indexOf(currentEmotion) + 1) % emotions.length];
        setCurrentEmotion(nextEmotion);
        setShuffledEmotions(shuffleArray([...emotions]));
        setFeedback('');
      }, 1000);

     
      if (score + pointsEarned >= level * 50) {
        saveScore(score + pointsEarned, time, attempts); 
        const notification = {
          title: 'Novo Desempenho!',
          body: `O dependente ${dependentName} acabou de jogar o Jogo das Emoções. Sua pontuação foi de ${score + pointsEarned} pontos.`,
          timestamp: Date.now(),
          read: false,
        };
        saveNotification(auth.currentUser.uid, notification);
     
        sendNotification(dependentName, 'Jogo das Emoções', score + pointsEarned);


        Alert.alert(
          'Parabéns!',
          `Você completou o nível ${level} com ${time} segundos e ${attempts} tentativas!`,
          [
            {
              text: 'Próximo Nível',
              onPress: () => {
                setLevel((prevLevel) => prevLevel + 1); // Avança para o próximo nível
                setTime(0); // Reinicia o tempo
                setAttempts(0); // Reinicia as tentativas
                setIsGameStarted(true); // Reinicia o timer
              },
            },
          ]
        );
      }
    } else {
      setFeedback('Tente novamente! ❌');
      if (sound && !isMuted) await sound.fail.replayAsync();
      animateFeedback();
      setAttempts((prevAttempts) => prevAttempts + 1); // Incrementa o contador de tentativas
    }
  };

  const calculatePoints = (time, attempts) => {
    const basePoints = 100;
    const timePenalty = Math.floor(time / 10); // Penalidade de 1 ponto a cada 10 segundos
    const attemptsPenalty = attempts * 5; // Penalidade de 5 pontos por tentativa
    return Math.max(10, basePoints - timePenalty - attemptsPenalty); // Mínimo de 10 pontos
  };

  const toggleMute = () => setIsMuted(!isMuted);

  const resetProgress = () => {
    setScore(0);
    AsyncStorage.removeItem('highScore');
    setHighScore(0);
    setLevel(1);
    setTime(0);
    setAttempts(0);
    setIsGameStarted(false);
  };

  return (
    <View style={styles.container}>
      <TouchableOpacity style={styles.menuButton} onPress={() => setIsMenuVisible(true)}>
        <MaterialIcons name="menu" size={30} color="#2E86C1" />
      </TouchableOpacity>

      <Modal visible={isMenuVisible} transparent animationType="slide">
        <View style={styles.modalOverlay}>
          <View style={styles.modalContent}>
            <TouchableOpacity style={styles.modalOption} onPress={toggleMute}>
              <Text style={styles.modalText}>{isMuted ? 'Ativar Sons do Jogo' : 'Desativar Sons do Jogo'}</Text>
            </TouchableOpacity>
            <TouchableOpacity style={styles.modalOption} onPress={resetProgress}>
              <Text style={styles.modalText}>Resetar Progresso</Text>
            </TouchableOpacity>
            <TouchableOpacity style={styles.modalCloseButton} onPress={() => setIsMenuVisible(false)}>
              <Text style={styles.modalCloseText}>Fechar</Text>
            </TouchableOpacity>
          </View>
        </View>
      </Modal>

      {!isGameStarted && (
        <TouchableOpacity style={styles.startButton} onPress={startGame}>
          <Text style={styles.startButtonText}>Iniciar Jogo</Text>
        </TouchableOpacity>
      )}

      {isGameStarted && (
        <>
          <Text style={styles.title}>Quem está {currentEmotion.name.toLowerCase()}?</Text>
          <View style={styles.grid}>
            {shuffledEmotions.map((emotion) => (
              <TouchableOpacity
                key={emotion.id}
                onPress={() => checkAnswer(emotion)}
                style={styles.imageContainer}
              >
                <Image source={emotion.image} style={styles.image} resizeMode="contain" />
              </TouchableOpacity>
            ))}
          </View>
          <Animated.Text
            style={[
              styles.feedback,
              { transform: [{ scale: feedbackAnimation.interpolate({ inputRange: [0, 1], outputRange: [1, 1.2] }) }] },
            ]}
          >
            {feedback}
          </Animated.Text>
          <Text style={styles.scoreText}>Pontuação: {score}</Text>
          <Text style={styles.highScoreText}>Recorde: {highScore}</Text>
          <Text style={styles.levelText}>Nível: {level}</Text>
          <Text style={styles.timeText}>Tempo: {time}s</Text>
          <Text style={styles.attemptsText}>Tentativas: {attempts}</Text>
        </>
      )}
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    padding: 20,
    backgroundColor: '#F9F9F9',
  },
  menuButton: {
    position: 'absolute',
    top: 40,
    left: 20,
  },
  title: {
    fontSize: width * 0.06,
    marginBottom: 20,
    color: '#2E86C1',
    fontWeight: 'bold',
  },
  grid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    justifyContent: 'space-around',
    width: '100%',
  },
  imageContainer: {
    width: '30%',
    padding: 10,
    borderRadius: 20,
    backgroundColor: '#FFF',
    elevation: 3,
    shadowColor: '#000',
    shadowOffset: { width: 1, height: 1 },
    shadowOpacity: 0.3,
    shadowRadius: 2,
    marginBottom: 10,
  },
  image: {
    width: '100%',
    height: width * 0.2,
  },
  feedback: {
    marginTop: 20,
    fontSize: width * 0.05,
    color: '#27AE60',
    fontWeight: 'bold',
  },
  scoreText: {
    marginTop: 10,
    fontSize: width * 0.05,
    color: '#2E86C1',
    fontWeight: 'bold',
  },
  highScoreText: {
    marginTop: 5,
    fontSize: width * 0.05,
    color: '#E67E22',
    fontWeight: 'bold',
  },
  levelText: {
    marginTop: 5,
    fontSize: width * 0.05,
    color: '#8E44AD',
    fontWeight: 'bold',
  },
  timeText: {
    marginTop: 5,
    fontSize: width * 0.05,
    color: '#C0392B',
    fontWeight: 'bold',
  },
  attemptsText: {
    marginTop: 5,
    fontSize: width * 0.05,
    color: '#16A085',
    fontWeight: 'bold',
  },
  modalOverlay: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: 'rgba(0, 0, 0, 0.5)',
  },
  modalContent: {
    width: width * 0.8,
    backgroundColor: '#FFF',
    borderRadius: 10,
    padding: 20,
  },
  modalOption: {
    padding: 15,
    borderBottomWidth: 1,
    borderBottomColor: '#EEE',
  },
  modalText: {
    fontSize: 16,
    color: '#333',
  },
  modalCloseButton: {
    marginTop: 10,
    padding: 15,
    alignItems: 'center',
  },
  modalCloseText: {
    fontSize: 16,
    color: '#2E86C1',
    fontWeight: 'bold',
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
  startButton: {
    backgroundColor: '#2E86C1',
    padding: 15,
    borderRadius: 10,
    width:'100%',
    paddingHorizontal:140
  },
  startButtonText: {
    color: '#FFF',
    fontSize: 18,
    fontWeight: 'bold',
    width:'100%'
  },
});