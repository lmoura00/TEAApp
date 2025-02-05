import React from "react";
import {View, Text, TouchableOpacity, StyleSheet} from 'react-native'

export function Home(){
    return(
        <View style={styles.container}>
            <Text style={styles.title}>Home</Text>
        </View>
    )
}

const styles = StyleSheet.create({
    container:{
        flex:1,
        marginTop:25,
        backgroundColor:"#b9b9b9",
        textAlign:"center",
        justifyContent:'center'
    },
    title:{
        fontSize:20
    }
})