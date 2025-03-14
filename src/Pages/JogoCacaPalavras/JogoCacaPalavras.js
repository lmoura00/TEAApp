import React, { useState, useEffect, useRef } from "react";
import { View, Text, StyleSheet, Alert, PanResponder } from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";

const JogoCacaPalavras = () => {
  const palavras = ["SOL", "LUA", "ESTRELA", "NUVEM", "ARCOIRIS"];
  const [grid, setGrid] = useState([]);
  const [selectedLetters, setSelectedLetters] = useState([]);
  const [foundWords, setFoundWords] = useState([]);
  const [isSelecting, setIsSelecting] = useState(false);

  const gridRef = useRef(null);
  const [gridPosition, setGridPosition] = useState({ x: 0, y: 0 });

  // Gera a grade de caça-palavras
  const generateGrid = () => {
    const size = 10;
    let grid = Array.from({ length: size }, () => Array(size).fill(""));

    palavras.forEach((palavra) => {
      const direction = Math.random() > 0.5 ? "horizontal" : "vertical";
      let startX, startY;

      if (direction === "horizontal") {
        startX = Math.floor(Math.random() * (size - palavra.length));
        startY = Math.floor(Math.random() * size);
        for (let i = 0; i < palavra.length; i++) {
          grid[startY][startX + i] = palavra[i];
        }
      } else {
        startX = Math.floor(Math.random() * size);
        startY = Math.floor(Math.random() * (size - palavra.length));
        for (let i = 0; i < palavra.length; i++) {
          grid[startY + i][startX] = palavra[i];
        }
      }
    });

    for (let i = 0; i < size; i++) {
      for (let j = 0; j < size; j++) {
        if (grid[i][j] === "") {
          grid[i][j] = String.fromCharCode(65 + Math.floor(Math.random() * 26));
        }
      }
    }

    setGrid(grid);
  };

  const checkSelection = () => {
    const selectedWord = selectedLetters.map((cell) => cell.letter).join("");
    if (palavras.includes(selectedWord) && !foundWords.includes(selectedWord)) {
      setFoundWords([...foundWords, selectedWord]);
      Alert.alert("Parabéns!", `Você encontrou a palavra: ${selectedWord}`);
    }
    setSelectedLetters([]);
  };

  // Converte coordenadas de toque para índices da grade
  const handleSelection = (x, y) => {
    const cellSize = 340 / 10; // Tamanho de cada célula

    const adjustedX = x - gridPosition.x; // Ajusta a coordenada X
    const adjustedY = y - gridPosition.y; // Ajusta a coordenada Y

    const row = Math.floor(adjustedY / cellSize);
    const col = Math.floor(adjustedX / cellSize);

    console.log(`Posição pressionada: (${x}, ${y})`);
    console.log(`Posição do grid: (${gridPosition.x}, ${gridPosition.y})`);
    console.log(`Célula selecionada: (${row}, ${col})`);

    // Verifica se row e col estão dentro dos limites da grade
    if (row >= 0 && row < 10 && col >= 0 && col < 10) {
      const cell = { letter: grid[row][col], row, col };

      setSelectedLetters((prev) => {
        if (!prev.some((c) => c.row === row && c.col === col)) {
          return [...prev, cell];
        }
        return prev;
      });
    } else {
      console.log("Célula fora dos limites da grade.");
    }
  };

  const panResponder = useRef(
    PanResponder.create({
      onStartShouldSetPanResponder: () => true,
      onMoveShouldSetPanResponder: () => true,
      onPanResponderGrant: (event, gestureState) => {
        console.log("onPanResponderGrant chamado");
        setIsSelecting(true);
        handleSelection(gestureState.x0, gestureState.y0);
      },
      onPanResponderMove: (event, gestureState) => {
        if (isSelecting) {
          handleSelection(gestureState.moveX, gestureState.moveY);
        }
      },
      onPanResponderRelease: () => {
        console.log("onPanResponderRelease chamado");
        setIsSelecting(false);
        checkSelection();
      },
    })
  ).current;

  useEffect(() => {
    generateGrid(); // Gera a grade ao montar o componente
  }, []);

  return (
    <SafeAreaView style={styles.container}>
      <Text style={styles.title}>Caça-Palavras</Text>
      <View
        ref={gridRef}
        {...panResponder.panHandlers}
        style={styles.gridContainer}
        onLayout={(event) => {
          const { x, y, width, height } = event.nativeEvent.layout;
          setGridPosition({ x, y });
          console.log("GridContainer layout atualizado:", { x, y, width, height });
        }}
      >
        {grid.map((row, rowIndex) =>
          row.map((letter, colIndex) => (
            <View
              key={`${rowIndex}-${colIndex}`}
              style={[
                styles.cell,
                selectedLetters.some(
                  (cell) => cell.row === rowIndex && cell.col === colIndex
                ) && styles.selectedCell,
              ]}
            >
              <Text style={styles.cellText}>{letter}</Text>
            </View>
          ))
        )}
      </View>
      <Text style={styles.foundWords}>
        Palavras encontradas: {foundWords.join(", ")}
      </Text>
    </SafeAreaView>
  );
};

// Estilos
const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: "#f0f8ff",
    alignItems: "center",
    justifyContent: "center",
    padding: 20,
  },
  title: {
    fontSize: 24,
    fontWeight: "bold",
    color: "#333",
    marginBottom: 20,
  },
  gridContainer: {
    width: 340,
    height: 340,
    flexDirection: "row",
    flexWrap: "wrap",
    backgroundColor: "#ccc", // Adicionado para visualização
  },
  cell: {
    width: 30,
    height: 30,
    justifyContent: "center",
    alignItems: "center",
    backgroundColor: "#e0f7fa",
    margin: 2,
    borderRadius: 5,
  },
  selectedCell: {
    backgroundColor: "#80deea",
  },
  cellText: {
    fontSize: 18,
    color: "#333",
  },
  foundWords: {
    marginTop: 20,
    fontSize: 16,
    color: "#333",
  },
});

export default JogoCacaPalavras;