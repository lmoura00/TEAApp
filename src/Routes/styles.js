// styles.js
import { StyleSheet, Dimensions } from 'react-native';

const { width, height } = Dimensions.get('window');

export const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#f5f5f5',
  },
  tabBarIconContainer: {
    alignItems: 'center',
    justifyContent: 'center',
  },
  tabBarIcon: {
    width: 65,
    height: 65,
    borderRadius: 35,
    backgroundColor: 'white',
    alignItems: 'center',
    justifyContent: 'center',
    position: 'absolute',
    bottom: 0,
    elevation: 5,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 5 },
    shadowOpacity: 0.3,
    shadowRadius: 5,
  },
  tabBarIconFocused: {
    bottom: 5,
    elevation: 10,
  },
  headerTitle: {
    width: 150,
    height: 60,
    resizeMode: 'contain',
  },
  headerLeftButton: {
    marginLeft: 10,
  },
  lottieAnimation: {
    width: 35,
    height: 35,
  },
  lottieLogout: {
    width: 50,
    height: 50,
  },
  tabBar: {
    height: 60,
    backgroundColor: '#fff',
    borderTopLeftRadius: 20,
    borderTopRightRadius: 20,
    position: 'absolute',
    left: 0,
    right: 0,
    bottom: 0,
    elevation: 5,
  },
  tabBarItem: {
    height: 60,
  },
});