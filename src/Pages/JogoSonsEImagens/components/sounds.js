import Sound from 'react-native-sound';

Sound.setCategory('Playback');

const sounds = {
  dog: new Sound('dog.mp3', Sound.MAIN_BUNDLE),
  cat: new Sound('cat.mp3', Sound.MAIN_BUNDLE),
  bird: new Sound('bird.mp3', Sound.MAIN_BUNDLE),
  // Adicione mais sons conforme necessário
};

export default sounds;