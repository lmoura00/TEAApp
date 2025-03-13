// TabBarIcon.js
import React from 'react';
import { View } from 'react-native';
import LottieView from 'lottie-react-native';
import { styles } from './styles';

export const TabBarIcon = ({ focused, animation, icon }) => {
  return (
    <View style={styles.tabBarIconContainer}>
      <View style={[styles.tabBarIcon, focused && styles.tabBarIconFocused]}>
        {focused ? (
          <LottieView
            source={animation}
            autoPlay
            loop
            style={styles.lottieAnimation}
          />
        ) : (
          icon
        )}
      </View>
    </View>
  );
};