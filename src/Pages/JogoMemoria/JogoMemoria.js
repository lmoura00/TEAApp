import React, { useState, useEffect } from 'react';
import { StyleSheet, Text, View, TouchableOpacity, Alert } from 'react-native';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { getDatabase, ref, set, get } from 'firebase/database';
import { getAuth } from 'firebase/auth';

const JogoMemoria = ({ route, navigation }) => {
  const { dependentId } = route.params || { dependentId: null }; // Recebe o dependentId como parâmetro
  //onsole.log("DependentId recebido:", dependentId); // Depuração
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
  const [board, setBoard] = useState([]);
  const [flipped, setFlipped] = useState([]);
  const [solved, setSolved] = useState([]);
  const [disabled, setDisabled] = useState(false);
  const [level, setLevel] = useState(1);
  const [score, setScore] = useState(0);
  const [time, setTime] = useState(0);
  const [isGameStarted, setIsGameStarted] = useState(false);
  const auth = getAuth();

  // Cartas disponíveis
  const cards = ['🐶', '🐱', '🐭', '🐹', '🐰', '🦊', '🐻', '🐼'];

  useEffect(() => {
    initializeBoard();
  }, [level]);

  useEffect(() => {
    if (isGameStarted) {
      const timer = setInterval(() => {
        setTime((prevTime) => prevTime + 1);
      }, 1000);
      return () => clearInterval(timer);
    }
  }, [isGameStarted]);

  const initializeBoard = () => {
    const numCards = 4 + (level - 1) * 2; // Aumenta o número de cartas a cada nível
    const selectedCards = cards.slice(0, numCards / 2);
    const doubledCards = [...selectedCards, ...selectedCards];
    const shuffledCards = doubledCards.sort(() => Math.random() - 0.5);
    setBoard(shuffledCards);
    setFlipped([]);
    setSolved([]);
    setDisabled(false);
    setTime(0);
    setIsGameStarted(true);
  };

  const handleCardPress = (index) => {
    if (disabled || flipped.includes(index) || solved.includes(index)) return;

    const newFlipped = [...flipped, index];
    setFlipped(newFlipped);

    if (newFlipped.length === 2) {
      setDisabled(true);
      checkForMatch(newFlipped);
    }
  };

  const checkForMatch = (flippedCards) => {
    const [firstIndex, secondIndex] = flippedCards;
  
    if (board[firstIndex] === board[secondIndex]) {
      setSolved([...solved, ...flippedCards]);
      setFlipped([]);
      setDisabled(false);
  
      // Verifica se todas as cartas foram resolvidas
      if (solved.length + 2 === board.length) {
        const levelScore = calculateScore();
        setScore((prevScore) => prevScore + levelScore);
        saveScore(levelScore); // Salva a pontuação após cada nível
        Alert.alert(
          'Parabéns!',
          `Você completou o nível ${level} com ${time} segundos!`,
          [
            {
              text: 'Próximo Nível',
              onPress: () => {
                setLevel((prevLevel) => prevLevel + 1); // Avança para o próximo nível
              },
            },
          ]
        );
      }
    } else {
      setTimeout(() => {
        setFlipped([]);
        setDisabled(false);
      }, Math.max(500, 1000 - (level - 1) * 200)); // Define um tempo mínimo de 500ms
    }
  };

  const calculateScore = () => {
    const baseScore = 1000;
    const timePenalty = time * 10; // Penalidade de 10 pontos por segundo
    const levelBonus = level * 200; // Bônus de 200 pontos por nível
    return Math.max(0, baseScore - timePenalty + levelBonus);
  };

  const saveScore = async (levelScore) => {
    try {
      const db = getDatabase();
      const scoreRef = ref(
        db,
        `users/${auth.currentUser.uid}/dependents/${dependentId}/scores/Memoria/level${level}`
      );
  
      // Obter o histórico atual de pontuações
      const snapshot = await get(scoreRef);
      const currentScores = snapshot.val() || [];
  
      // Adicionar a nova pontuação e o tempo ao histórico
      const newScoreEntry = {
        score: levelScore,
        time: time, // Adiciona o tempo gasto no nível
        timestamp: Date.now(), // Adiciona um timestamp para identificar quando a pontuação foi registrada
      };
      const updatedScores = [...currentScores, newScoreEntry];
  
      // Salvar o histórico atualizado no Firebase
      await set(scoreRef, updatedScores);
  
      console.log('Pontuação e tempo salvos com sucesso!');
    } catch (error) {
      console.error('Erro ao salvar pontuação e tempo:', error);
    }
  };

  
  const renderCard = (index) => {
    const isFlipped = flipped.includes(index) || solved.includes(index);
    return (
      <TouchableOpacity
        key={index}
        style={[styles.card, isFlipped && styles.cardFlipped]}
        onPress={() => handleCardPress(index)}
        disabled={isFlipped}
      >
        <Text style={styles.cardText}>{isFlipped ? board[index] : '?'}</Text>
      </TouchableOpacity>
    );
  };

  return (
    <View style={styles.container}>
      <Text style={styles.title}>Jogo da Memória - Nível {level}</Text>
      <Text style={styles.scoreText}>Pontuação: {score}</Text>
      <Text style={styles.timeText}>Tempo: {time}s</Text>
      <View style={styles.board}>
        {board.map((_, index) => renderCard(index))}
      </View>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#fff',
    alignItems: 'center',
    justifyContent: 'center',
  },
  title: {
    fontSize: 24,
    marginBottom: 20,
  },
  scoreText: {
    fontSize: 18,
    marginBottom: 10,
  },
  timeText: {
    fontSize: 18,
    marginBottom: 20,
  },
  board: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    justifyContent: 'center',
  },
  card: {
    width: 80,
    height: 80,
    margin: 5,
    backgroundColor: '#ccc',
    alignItems: 'center',
    justifyContent: 'center',
    borderRadius: 10,
  },
  cardFlipped: {
    backgroundColor: '#fff',
  },
  cardText: {
    fontSize: 30,
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

export default JogoMemoria;