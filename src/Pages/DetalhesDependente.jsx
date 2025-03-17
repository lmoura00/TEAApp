import React, { useEffect, useState } from "react";
import { View, Text, StyleSheet, Dimensions, ScrollView } from "react-native";
import { useRoute } from "@react-navigation/native";
import { getDatabase, ref, onValue } from "firebase/database";
import { LineChart } from "react-native-chart-kit"; // Alterado para LineChart
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
          </View>
        ))}
      </View>
    );
  };

  // Função para renderizar gráficos de Rotinas Diárias
  const renderRotinasDiariasChart = (levels) => {
    return (
      <LineChart
        data={{
          labels: levels.map((_, index) => `Nível ${index + 1}`),
          datasets: [
            {
              data: levels.map((entry) => entry.score),
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
    );
  };

  // Função para renderizar gráficos de Memória
  const renderMemoriaChart = (data) => {
    const levels = Object.entries(data).map(([levelKey, levelData]) => {
      return {
        level: levelKey,
        scores: levelData.map((entry) => entry.score),
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

          {activity === "RotinasDiarias" && Array.isArray(data) && (
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

          {!Array.isArray(data) && !data.details && (
            <Text style={styles.scoreText}>Nenhuma pontuação além foi registrada.</Text>
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
});

export default DetalhesDependente;