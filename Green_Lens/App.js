import { StatusBar } from 'expo-status-bar';
import { StyleSheet, View } from 'react-native';
import PlantRecognitionScreen from './screens/PlantRecognitionScreen';

export default function App() {
  return (
    <View style={styles.container}>
      <StatusBar style="auto" />
      <PlantRecognitionScreen />
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#fff',
  },
});
