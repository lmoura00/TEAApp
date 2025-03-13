import React, { useState, useEffect } from 'react';
import { View, Text, Image, TouchableOpacity, StyleSheet, Animated, Dimensions, Modal } from 'react-native';
import { Audio } from 'expo-av';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { MaterialIcons } from '@expo/vector-icons';

const { width, height } = Dimensions.get('window');

const emotions = [
  { id: 1, name: 'Feliz', image: require('../assets/feliz.png') },
  { id: 2, name: 'Triste', image: require('../assets/triste.png') },
  { id: 3, name: 'Bravo', image: require('../assets/bravo.png') },
];

const shuffleArray = (array) => {
  for (let i = array.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [array[i], array[j]] = [array[j], array[i]];
  }
  return array;
};

export default function EmotionGame() {
  const [currentEmotion, setCurrentEmotion] = useState(emotions[0]);
  const [shuffledEmotions, setShuffledEmotions] = useState(shuffleArray([...emotions]));
  const [feedback, setFeedback] = useState('');
  const [score, setScore] = useState(0);
  const [highScore, setHighScore] = useState(0);
  const [sound, setSound] = useState(null);
  const [isMuted, setIsMuted] = useState(false);
  const [isMenuVisible, setIsMenuVisible] = useState(false);
  const feedbackAnimation = new Animated.Value(0);

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
    if (score > highScore) {
      setHighScore(score);
      AsyncStorage.setItem('highScoreEmotion', score.toString());
    }
  }, [score]);

  const animateFeedback = () => {
    Animated.sequence([
      Animated.timing(feedbackAnimation, { toValue: 1, duration: 200, useNativeDriver: true }),
      Animated.timing(feedbackAnimation, { toValue: 0, duration: 200, useNativeDriver: true }),
    ]).start();
  };

  const checkAnswer = async (selectedEmotion) => {
    if (selectedEmotion.id === currentEmotion.id) {
      setFeedback('Correto! 🎉');
      setScore((prev) => prev + 10);
      if (sound && !isMuted) await sound.success.replayAsync();
      animateFeedback();
      setTimeout(() => {
        const nextEmotion = emotions[(emotions.indexOf(currentEmotion) + 1) % emotions.length];
        setCurrentEmotion(nextEmotion);
        setShuffledEmotions(shuffleArray([...emotions]));
        setFeedback('');
      }, 1000);
    } else {
      setFeedback('Tente novamente! ❌');
      if (sound && !isMuted) await sound.fail.replayAsync();
      animateFeedback();
    }
  };

  const toggleMute = () => setIsMuted(!isMuted);

  const resetProgress = () => {
    setScore(0);
    AsyncStorage.removeItem('highScore');
    setHighScore(0);
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
              <Text style={styles.modalText}>Resetar Pontuação</Text>
            </TouchableOpacity>
            <TouchableOpacity style={styles.modalCloseButton} onPress={() => setIsMenuVisible(false)}>
              <Text style={styles.modalCloseText}>Fechar</Text>
            </TouchableOpacity>
          </View>
        </View>
      </Modal>

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
    justifyContent: 'space-around',
    width: '100%',
  },
  imageContainer: {
    padding: 10,
    borderRadius: 20,
    backgroundColor: '#FFF',
    elevation: 3,
    shadowColor: '#000',
    shadowOffset: { width: 1, height: 1 },
    shadowOpacity: 0.3,
    shadowRadius: 2,
  },
  image: {
    width: width * 0.2,
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
});