import React, { useEffect, useState } from "react";
import { View, Text, StyleSheet, Dimensions, ScrollView } from "react-native";
import { useRoute } from "@react-navigation/native";
import { getDatabase, ref, onValue } from "firebase/database";
import { LineChart } from "react-native-chart-kit";
import { getAuth } from "firebase/auth";

export function DetalhesDependente() {
  const route = useRoute();
  const { dependentId } = route.params;
  const [dependent, setDependent] = useState(null);
  const auth = getAuth();

  // Função para renderizar gráficos do Labirinto
  const renderLabirintoChart = (data) => {
    const levels = Object.entries(data).map(([levelKey, levelData]) => {
      return {
        level: levelKey,
        scores: levelData.map((entry) => entry.score),
        attempts: levelData.map((entry, index) => ({
          attempt: index + 1,
          score: entry.score,
          time: entry.time,
        })),
      };
    });

    return (
      <View>
        {levels.map((level, levelIndex) => (
          <View key={levelIndex} style={styles.levelContainer}>
            <Text style={styles.levelTitle}>{level.level}</Text>
            <LineChart
              data={{
                labels: level.scores.map((_, i) => `Tentativa ${i + 1}`),
                datasets: [
                  {
                    data: level.scores,
                  },
                ],
              }}
              width={Dimensions.get("window").width - 40}
              height={220}
              chartConfig={{
                backgroundColor: "#ffffff",
                backgroundGradientFrom: "#ffffff",
                backgroundGradientTo: "#ffffff",
                decimalPlaces: 0,
                color: (opacity = 1) => `rgba(0, 122, 255, ${opacity})`,
                labelColor: (opacity = 1) => `rgba(0, 0, 0, ${opacity})`,
                style: {
                  borderRadius: 16,
                },
                propsForDots: {
                  r: "5", // Tamanho dos pontos
                  strokeWidth: "2",
                  stroke: "#ffa726",
                },
              }}
              bezier // Adiciona uma curva suave ao gráfico
              style={styles.chart}
            />
            <View style={styles.attemptsContainer}>
              <Text style={styles.attemptsTitle}>Detalhes das Tentativas:</Text>
              {level.attempts.map((attempt, attemptIndex) => (
                <View key={attemptIndex} style={styles.attemptItem}>
                  <Text style={styles.attemptText}>
                    Tentativa {attempt.attempt}: {attempt.score} pontos (Tempo:{" "}
                    {attempt.time}s)
                  </Text>
                </View>
              ))}
            </View>
          </View>
        ))}
      </View>
    );
  };

  // Função para renderizar gráficos de Rotinas Diárias
  const renderRotinasDiariasChart = (data) => {
    const levels = Object.entries(data).map(([levelKey, levelData]) => {
      return {
        level: levelKey,
        scores: Object.values(levelData).map((entry) => entry.score), // Acessa os valores das tentativas
        attempts: Object.values(levelData).map((entry, index) => ({
          attempt: index + 1,
          score: entry.score,
          time: entry.time,
        })),
      };
    });

    return (
      <View>
        {levels.map((level, levelIndex) => (
          <View key={levelIndex} style={styles.levelContainer}>
            <Text style={styles.levelTitle}>{level.level}</Text>
            <LineChart
              data={{
                labels: level.scores.map((_, i) => `Tentativa ${i + 1}`),
                datasets: [
                  {
                    data: level.scores,
                  },
                ],
              }}
              width={Dimensions.get("window").width - 40}
              height={220}
              chartConfig={{
                backgroundColor: "#ffffff",
                backgroundGradientFrom: "#ffffff",
                backgroundGradientTo: "#ffffff",
                decimalPlaces: 0,
                color: (opacity = 1) => `rgba(255, 0, 0, ${opacity})`,
                labelColor: (opacity = 1) => `rgba(0, 0, 0, ${opacity})`,
                style: {
                  borderRadius: 16,
                },
                propsForDots: {
                  r: "5",
                  strokeWidth: "2",
                  stroke: "#ffa726",
                },
              }}
              bezier
              style={styles.chart}
            />
            <View style={styles.attemptsContainer}>
              <Text style={styles.attemptsTitle}>Detalhes das Tentativas:</Text>
              {level.attempts.map((attempt, attemptIndex) => (
                <View key={attemptIndex} style={styles.attemptItem}>
                  <Text style={styles.attemptText}>
                    Tentativa {attempt.attempt}: {attempt.score} pontos (Tempo:{" "}
                    {attempt.time}s)
                  </Text>
                </View>
              ))}
            </View>
          </View>
        ))}
      </View>
    );
  };

  // Função para renderizar gráficos de Memória
  const renderMemoriaChart = (data) => {
    const levels = Object.entries(data).map(([levelKey, levelData]) => {
      return {
        level: levelKey,
        scores: levelData.map((entry) => entry.score),
        attempts: levelData.map((entry, index) => ({
          attempt: index + 1,
          score: entry.score,
          time: entry.time,
        })),
      };
    });

    return (
      <View>
        {levels.map((level, levelIndex) => (
          <View key={levelIndex} style={styles.levelContainer}>
            <Text style={styles.levelTitle}>{level.level}</Text>
            <LineChart
              data={{
                labels: level.scores.map((_, i) => `Tentativa ${i + 1}`),
                datasets: [
                  {
                    data: level.scores,
                  },
                ],
              }}
              width={Dimensions.get("window").width - 40}
              height={220}
              chartConfig={{
                backgroundColor: "#ffffff",
                backgroundGradientFrom: "#ffffff",
                backgroundGradientTo: "#ffffff",
                decimalPlaces: 0,
                color: (opacity = 1) => `rgba(0, 255, 0, ${opacity})`,
                labelColor: (opacity = 1) => `rgba(0, 0, 0, ${opacity})`,
                style: {
                  borderRadius: 16,
                },
                propsForDots: {
                  r: "5",
                  strokeWidth: "2",
                  stroke: "#ffa726",
                },
              }}
              bezier
              style={styles.chart}
            />
            <View style={styles.attemptsContainer}>
              <Text style={styles.attemptsTitle}>Detalhes das Tentativas:</Text>
              {level.attempts.map((attempt, attemptIndex) => (
                <View key={attemptIndex} style={styles.attemptItem}>
                  <Text style={styles.attemptText}>
                    Tentativa {attempt.attempt}: {attempt.score} pontos (Tempo:{" "}
                    {attempt.time}s)
                  </Text>
                </View>
              ))}
            </View>
          </View>
        ))}
      </View>
    );
  };
  const renderEmotionGameChart = (data) => {
    const levels = Object.entries(data).map(([levelKey, levelData]) => {
      return {
        level: levelKey,
        attempts: Object.entries(levelData).map(
          ([attemptKey, attemptData]) => ({
            attempt: attemptKey,
            score: attemptData.score,
            time: attemptData.time,
            timestamp: attemptData.timestamp,
          })
        ),
      };
    });

    return (
      <View>
        {levels.map((level, levelIndex) => (
          <View key={levelIndex} style={styles.levelContainer}>
            <Text style={styles.levelTitle}>{level.level}</Text>
            <LineChart
              data={{
                labels: level.attempts.map((_, i) => `Tentativa ${i + 1}`),
                datasets: [
                  {
                    data: level.attempts.map((attempt) => attempt.score),
                  },
                ],
              }}
              width={Dimensions.get("window").width - 40}
              height={220}
              chartConfig={{
                backgroundColor: "#ffffff",
                backgroundGradientFrom: "#ffffff",
                backgroundGradientTo: "#ffffff",
                decimalPlaces: 0,
                color: (opacity = 1) => `rgba(255, 165, 0, ${opacity})`, // Laranja
                labelColor: (opacity = 1) => `rgba(0, 0, 0, ${opacity})`,
                style: {
                  borderRadius: 16,
                },
                propsForDots: {
                  r: "5",
                  strokeWidth: "2",
                  stroke: "#ffa726",
                },
              }}
              bezier
              style={styles.chart}
            />
            <View style={styles.attemptsContainer}>
              <Text style={styles.attemptsTitle}>Detalhes das Tentativas:</Text>
              {level.attempts.map((attempt, attemptIndex) => (
                <View key={attemptIndex} style={styles.attemptItem}>
                  <Text style={styles.attemptText}>
                    Tentativa {attempt.attempt}: {attempt.score} pontos (Tempo:{" "}
                    {attempt.time}s)
                  </Text>
                  <Text style={styles.timestampText}>
                    Data: {new Date(attempt.timestamp).toLocaleString()}
                  </Text>
                </View>
              ))}
            </View>
          </View>
        ))}
      </View>
    );
  };

  useEffect(() => {
    const db = getDatabase();
    const dependentRef = ref(
      db,
      `users/${auth.currentUser.uid}/dependents/${dependentId}`
    );
    onValue(dependentRef, (snapshot) => {
      const data = snapshot.val();
      if (data) {
        setDependent(data);
      }
    });
  }, [dependentId]);

  if (!dependent) {
    return <Text>Carregando...</Text>;
  }

  const scores = dependent.scores || {};

  return (
    <ScrollView style={styles.container}>
      <Text style={styles.title}>{dependent.nome}</Text>
      <Text style={styles.subtitle}>Pontuações por Atividade e Nível:</Text>

      {Object.entries(scores).map(([activity, data]) => (
        <View key={activity} style={styles.activityContainer}>
          <Text style={styles.activityTitle}>{activity}</Text>

          {activity === "Labirinto" && (
            <View style={styles.levelContainer}>
              <Text style={styles.levelTitle}>Pontuações por Nível</Text>
              {renderLabirintoChart(data)}
            </View>
          )}

          {activity === "RotinasDiarias" && (
            <View style={styles.levelContainer}>
              <Text style={styles.levelTitle}>Pontuações por Nível</Text>
              {renderRotinasDiariasChart(data)}
            </View>
          )}

          {activity === "Memoria" && (
            <View style={styles.levelContainer}>
              <Text style={styles.levelTitle}>Pontuações por Nível</Text>
              {renderMemoriaChart(data)}
            </View>
          )}

          {activity === "EmotionGame" && (
            <View style={styles.levelContainer}>
              <Text style={styles.levelTitle}>Pontuações por Nível</Text>
              {renderEmotionGameChart(data)}
            </View>
          )}
          {!Array.isArray(data) && !data.details && (
            <Text style={styles.scoreText}>
              Nenhuma pontuação além foi registrada.
            </Text>
          )}
        </View>
      ))}
    </ScrollView>
  );
}

import Constants from "expo-constants";
const statusBarHeight = Constants.statusBarHeight;
const styles = StyleSheet.create({
  container: {
    flex: 1,
    padding: 20,
    paddingTop: statusBarHeight,
    backgroundColor: "#fff",
  },
  title: {
    fontSize: 24,
    fontWeight: "bold",
    marginBottom: 10,
  },
  subtitle: {
    fontSize: 18,
    marginBottom: 20,
  },
  activityContainer: {
    marginBottom: 30,
  },
  activityTitle: {
    fontSize: 20,
    fontWeight: "bold",
    marginBottom: 10,
  },
  levelContainer: {
    marginBottom: 20,
  },
  levelTitle: {
    fontSize: 18,
    fontWeight: "bold",
    marginBottom: 10,
  },
  chart: {
    marginVertical: 10,
    borderRadius: 16,
  },
  scoreText: {
    fontSize: 16,
    color: "#888",
  },
  attemptsContainer: {
    marginTop: 10,
  },
  attemptsTitle: {
    fontSize: 16,
    fontWeight: "bold",
    marginBottom: 5,
  },
  attemptItem: {
    marginBottom: 5,
  },
  attemptText: {
    fontSize: 14,
    color: "#555",
  },
});

export default DetalhesDependente;
