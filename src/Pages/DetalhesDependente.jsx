import React, { useEffect, useState } from "react";
import { View, Text, StyleSheet, FlatList, Dimensions, ScrollView } from "react-native";
import { useRoute } from "@react-navigation/native";
import { getDatabase, ref, onValue } from "firebase/database";
import { BarChart } from "react-native-chart-kit";
import { getAuth } from "firebase/auth";

export function DetalhesDependente() {
  const route = useRoute();
  const { dependentId } = route.params; // Recebe o ID do dependente
  const [dependent, setDependent] = useState(null);
  const auth = getAuth();

  // Carregar dados do dependente
  useEffect(() => {
    const db = getDatabase();
    const dependentRef = ref(db, `users/${auth.currentUser.uid}/dependents/${dependentId}`);
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

  // Preparar dados para os gráficos
  const scores = dependent.scores || {};

  return (
    <ScrollView style={styles.container}>
      <Text style={styles.title}>{dependent.nome}</Text>
      <Text style={styles.subtitle}>Pontuações por Atividade e Nível:</Text>

      {/* Iterar sobre cada atividade */}
      {Object.entries(scores).map(([activity, levels]) => (
        <View key={activity} style={styles.activityContainer}>
          <Text style={styles.activityTitle}>{activity}</Text>

          {/* Verifica se levels é um array */}
          {Array.isArray(levels) ? (
            <View style={styles.levelContainer}>
              <Text style={styles.levelTitle}>Pontuações</Text>
              <BarChart
                data={{
                  labels: levels.map((_, index) => `Jogada ${index + 1}`),
                  datasets: [
                    {
                      data: levels.map((entry) => entry.score),
                    },
                  ],
                }}
                width={Dimensions.get("window").width - 40}
                height={220}
                yAxisLabel="Pontos: "
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
                }}
                style={styles.chart}
              />
            </View>
          ) : (
            <Text style={styles.scoreText}>Nenhuma pontuação registrada.</Text>
          )}
        </View>
      ))}
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    padding: 20,
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