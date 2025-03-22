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
    bottom: -30,
    elevation: 0,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 5 },
    shadowOpacity: 0.3,
    shadowRadius: 5,
  },
  tabBarIconFocused: {
    bottom: -15,
    elevation:2,
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
    backgroundColor: 'rgba(255, 255, 255, 0.95)', 
    borderTopLeftRadius: 20,
    borderTopRightRadius: 20,
    borderBottomRightRadius: 20,
    borderBottomLeftRadius: 20,
    position: 'absolute',
    left: 0, 
    right: 0, 
    bottom: 10,
    elevation: 10,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 5 },
    shadowOpacity: 0.3,
    shadowRadius: 5,
    alignSelf: 'center', 
    width: '80%', 
    marginHorizontal: '10%',
    alignItems: 'center',
    justifyContent: 'center',
  },
  tabBarItem: {
    height: 60,
  },
  headerRightButton: {
    marginRight: 10,
  },
  badge: {
    position: 'absolute',
    right: -6,
    top: -3,
    backgroundColor: 'red',
    borderRadius: 10,
    width: 20,
    height: 20,
    justifyContent: 'center',
    alignItems: 'center',
  },
  badgeText: {
    color: 'white',
    fontSize: 12,
    fontWeight: 'bold',
  },
});