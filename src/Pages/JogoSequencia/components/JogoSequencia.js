import React, { useState, useEffect } from 'react';
import { View, Text, Image, TouchableOpacity, StyleSheet, Animated, Dimensions, Modal } from 'react-native';
import { Audio } from 'expo-av';
import { MaterialIcons } from '@expo/vector-icons';
import AsyncStorage from '@react-native-async-storage/async-storage';

const { width, height } = Dimensions.get('window');

const SequenceGame = () => {
  const [currentSequence, setCurrentSequence] = useState(0);
  const [feedback, setFeedback] = useState('');
  const [score, setScore] = useState(0);
  const [highScore, setHighScore] = useState(0);
  const [successSound, setSuccessSound] = useState(null);
  const [failSound, setFailSound] = useState(null);
  const [isMuted, setIsMuted] = useState(false);
  const [isMenuVisible, setIsMenuVisible] = useState(false);
  const [isLoading, setIsLoading] = useState(true); // Estado para controlar o carregamento
  const feedbackAnimation = new Animated.Value(0);

  const sequences = [
    { images: ['apple', 'banana', 'apple'], correctAnswer: 'banana' },
    { images: ['banana', 'orange', 'banana'], correctAnswer: 'orange' },
  ];

  // Carregar sons e configurações salvas
  useEffect(() => {
    const loadSoundsAndSettings = async () => {
      const { sound: success } = await Audio.Sound.createAsync(require('../assets/success.mp3'));
      const { sound: fail } = await Audio.Sound.createAsync(require('../assets/fail.mp3'));
      setSuccessSound(success);
      setFailSound(fail);

      // Carregar recorde salvo
      const savedHighScore = await AsyncStorage.getItem('highScoreSequencia');
      if (savedHighScore) setHighScore(parseInt(savedHighScore, 10));

      setIsLoading(false); // Finalizar o carregamento
    };

    loadSoundsAndSettings();

    // Descarregar sons ao desmontar o componente
    return () => {
      if (successSound) successSound.unloadAsync();
      if (failSound) failSound.unloadAsync();
    };
  }, []);

  // Salvar pontuação recorde
  useEffect(() => {
    if (score > highScore) {
      setHighScore(score);
      AsyncStorage.setItem('highScoreSequencia', score.toString());
    }
  }, [score]);

  const animateFeedback = () => {
    Animated.sequence([
      Animated.timing(feedbackAnimation, { toValue: 1, duration: 200, useNativeDriver: true }),
      Animated.timing(feedbackAnimation, { toValue: 0, duration: 200, useNativeDriver: true }),
    ]).start();
  };

  const handleAnswer = async (answer) => {
    if (answer === sequences[currentSequence].correctAnswer) {
      setFeedback('Correto! 🎉');
      setScore((prev) => prev + 10);
      if (successSound && !isMuted) await successSound.replayAsync();
      animateFeedback();
      setTimeout(() => {
        setFeedback('');
        setCurrentSequence((prev) => (prev + 1) % sequences.length);
      }, 1000);
    } else {
      setFeedback('Tente novamente! 😊');
      setScore(0);
      if (failSound && !isMuted) await failSound.replayAsync();
      animateFeedback();
    }
  };

  const toggleMute = () => setIsMuted(!isMuted);

  const resetProgress = () => {
    setScore(0);
    setCurrentSequence(0);
    AsyncStorage.removeItem('highScoreSequencia');
    setHighScore(0);
  };

  // Se ainda estiver carregando, exibir uma mensagem de carregamento
  if (isLoading) {
    return (
      <View style={styles.container}>
        <Text>Carregando...</Text>
      </View>
    );
  }

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

      <Text style={styles.title}>Complete a Sequência:</Text>
      <View style={styles.sequenceContainer}>
        {sequences[currentSequence].images.map((image, index) => (
          <Image key={index} source={getImageSource(image)} style={styles.image} resizeMode="contain" />
        ))}
        <Text style={styles.questionMark}>?</Text>
      </View>
      <View style={styles.optionsContainer}>
        {['apple', 'banana', 'orange'].map((option, index) => (
          <TouchableOpacity key={index} onPress={() => handleAnswer(option)} style={styles.optionButton}>
            <Image source={getImageSource(option)} style={styles.optionImage} resizeMode="contain" />
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
};

const getImageSource = (imageName) => {
  switch (imageName) {
    case 'apple':
      return require('../assets/apple.png');
    case 'banana':
      return require('../assets/banana.png');
    case 'orange':
      return require('../assets/orange.png');
    default:
      return null;
  }
};

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
  sequenceContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 20,
  },
  image: {
    width: width * 0.15,
    height: width * 0.15,
    marginRight: 10,
  },
  questionMark: {
    fontSize: width * 0.1,
    marginLeft: 10,
    color: '#E67E22',
  },
  optionsContainer: {
    flexDirection: 'row',
    justifyContent: 'space-around',
    width: '100%',
  },
  optionButton: {
    padding: 10,
    borderRadius: 20,
    backgroundColor: '#FFF',
    elevation: 3,
    shadowColor: '#000',
    shadowOffset: { width: 1, height: 1 },
    shadowOpacity: 0.3,
    shadowRadius: 2,
  },
  optionImage: {
    width: width * 0.15,
    height: width * 0.15,
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

export default SequenceGame;