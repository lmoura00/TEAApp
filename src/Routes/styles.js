import { StyleSheet, Dimensions } from 'react-native';

const { width, height } = Dimensions.get('window');

export const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#f5f5f5',
  },
  loadingContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: '#fff',
  },
  
  // Estilos da TabBar
  tabBar: {
    position: 'absolute',
    bottom: 20,
    left: 20,
    right: 20,
    height: 70,
    borderRadius: 20,
    backgroundColor: '#fff',
    shadowColor: '#000',
    shadowOffset: {
      width: 0,
      height: 2,
    },
    shadowOpacity: 0.25,
    shadowRadius: 8,
    elevation: 5,
    borderTopWidth: 0,
    paddingHorizontal: 10,
  },
  tabBarItem: {
    height: 70,
    paddingVertical: 10,
  },
  tabIconContainer: {
    alignItems: 'center',
    justifyContent: 'center',
    height: '70%',
  },
  activeTabIndicator: {
    position: 'absolute',
    bottom: 8,
    width: 6,
    height: 6,
    borderRadius: 3,
    backgroundColor: '#3498db',
  },
  
  // Estilos dos ícones
  tabBarIconContainer: {
    alignItems: 'center',
    justifyContent: 'center',
  },
  tabBarIcon: {
    width: 60,
    height: 60,
    borderRadius: 30,
    backgroundColor: 'white',
    alignItems: 'center',
    justifyContent: 'center',
    elevation: 3,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
  },
  tabBarIconFocused: {
    backgroundColor: '#f0f8ff',
    transform: [{ scale: 1.1 }],
  },
  
  // Estilos do Header
  header: {
    backgroundColor: '#fff',
    shadowColor: '#000',
    shadowOffset: {
      width: 0,
      height: 2,
    },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 3,
  },
  headerTitle: {
    fontSize: 18,
    fontWeight: '600',
    color: '#2c3e50',
  },
  headerLogo: {
    width: 40,
    height: 40,
    resizeMode: 'contain',
  },
  headerLeftButton: {
    marginLeft: 15,
    padding: 5,
  },
  headerRightButton: {
    marginRight: 15,
    padding: 5,
    position: 'relative',
  },
  
  // Estilos das notificações
  badge: {
    position: 'absolute',
    right: -5,
    top: -5,
    backgroundColor: '#e74c3c',
    borderRadius: 10,
    width: 20,
    height: 20,
    justifyContent: 'center',
    alignItems: 'center',
  },
  badgeText: {
    color: '#fff',
    fontSize: 12,
    fontWeight: 'bold',
  },
  
  // Estilos das animações
  lottieAnimation: {
    width: 35,
    height: 35,
  },
  lottieLogout: {
    width: 30,
    height: 30,
  },
  
  // Outros estilos
  errorText: {
    fontSize: 18,
    color: 'red',
  },
});