import React, { useState, useEffect, useRef } from 'react';
import { View, Text, TouchableOpacity, Image, StyleSheet, Animated } from 'react-native';
import { Audio } from 'expo-av';
import { MaterialIcons } from '@expo/vector-icons'; // Para ícones
import AsyncStorage from '@react-native-async-storage/async-storage'; // Para armazenar o recorde

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

const noiseSound = require('./assets/noise.mp3'); // Adicione um arquivo de ruído

const JogoSonsEImagens = () => {
  const [currentSound, setCurrentSound] = useState(null);
  const [feedback, setFeedback] = useState('');
  const [isPlaying, setIsPlaying] = useState(false);
  const [level, setLevel] = useState(1);
  const [score, setScore] = useState(0); // Pontuação atual
  const [highScore, setHighScore] = useState(0); // Recorde
  const soundObject = useRef(new Audio.Sound());
  const noiseObject = useRef(new Audio.Sound());
  const buttonScale = useRef(new Animated.Value(1)).current; // Animação de escala

  // Carrega o recorde ao iniciar o jogo
  useEffect(() => {
    const loadHighScore = async () => {
      try {
        const savedHighScore = await AsyncStorage.getItem('highScoreSonsEImagens');
        if (savedHighScore !== null) {
          setHighScore(parseInt(savedHighScore, 10));
        }
      } catch (error) {
        console.log('Erro ao carregar o recorde:', error);
      }
    };

    loadHighScore();
  }, []);

  // Salva o recorde quando a pontuação atual é maior
  useEffect(() => {
    if (score > highScore) {
      setHighScore(score);
      AsyncStorage.setItem('highScoreSonsEImagens', score.toString());
    }
  }, [score]);

  const playSound = async (soundKey) => {
    try {
      // Verifica se o som atual está carregado antes de tentar parar/descarregar
      const soundStatus = await soundObject.current.getStatusAsync();
      if (soundStatus.isLoaded) {
        await soundObject.current.stopAsync();
        await soundObject.current.unloadAsync();
      }

      // Verifica se o ruído está carregado antes de tentar parar/descarregar
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
      // Verifica se o som está carregado antes de tentar parar
      const soundStatus = await soundObject.current.getStatusAsync();
      if (soundStatus.isLoaded) {
        await soundObject.current.stopAsync();
      }

      // Verifica se o ruído está carregado antes de tentar parar
      const noiseStatus = await noiseObject.current.getStatusAsync();
      if (noiseStatus.isLoaded) {
        await noiseObject.current.stopAsync();
      }

      setIsPlaying(false);
    } catch (error) {
      console.log('Erro ao parar o som:', error);
    }
  };

  const checkAnswer = (imageKey) => {
    if (imageKey === currentSound) {
      setFeedback('Correto! 🎉');
      setLevel((prevLevel) => prevLevel + 1); // Aumenta o nível
      setScore((prevScore) => prevScore + 10); // Aumenta a pontuação em 10 pontos
      const soundKeys = Object.keys(sounds);
      const randomSoundKey = soundKeys[Math.floor(Math.random() * soundKeys.length)];
      playSound(randomSoundKey); // Toca um novo som
    } else {
      setFeedback('Errado! Tente novamente. 😊');
      setLevel(1); // Reseta o nível
      setScore(0); // Reseta a pontuação
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
      <Text style={styles.feedback}>{feedback}</Text>
      <Text style={styles.levelText}>Nível: {level}</Text>
      <Text style={styles.scoreText}>Pontuação: {score}</Text>
      <Text style={styles.highScoreText}>Recorde: {highScore}</Text>
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
  highScoreText: {
    fontSize: 20,
    marginBottom: 20,
    color: '#E67E22', // Laranja
    fontWeight: 'bold',
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
});

export default JogoSonsEImagens;