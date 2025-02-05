import React from "react";
import { Image, Text, View, StyleSheet } from "react-native";
import { useNavigation } from "@react-navigation/native";

export function Splash(){
    return(
        <View style={styles.container}>
            <Image source={require('../images/praticamente_splash.png')} style={styles.splashImage} />
        </View>
    )
}

const styles = StyleSheet.create({
    container: {
      flex: 1,
      justifyContent: 'center',
      alignItems: 'center',
      backgroundColor: '#f4f6fc'
    },
    splashImage: {
      width: '100%',  // Força o preenchimento da tela
      height: '100%',
      resizeMode: 'cover',
      position: 'absolute'
    }
  });