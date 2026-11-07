
import {
  View,
  Text,
  StyleSheet,
} from 'react-native';

import BottomNavigation from '../components/BottomNavigation';
import CameraPreview from '../components/CameraPreview';
import { usePhotos } from '../hooks/usePhotos';

export default function CameraScreen() {
  const { addPhoto } = usePhotos();

  return (
    <View style={styles.container}>
      <View style={styles.header}>
        <Text style={styles.title}>EcoScan</Text>
        <Text style={styles.subtitle}>
          Enfoca un residuo y haz una fotografía
        </Text>
      </View>

      <View style={styles.cameraContainer}>
        <CameraPreview onPhotoTaken={addPhoto} />
      </View>

      <BottomNavigation />
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#F8F9F5',
  },
  header: {
    paddingHorizontal: 24,
    paddingTop: 20,
    paddingBottom: 15,
  },
  title: {
    fontSize: 28,
    fontWeight: 'bold',
    color: '#356B50',
  },
  subtitle: {
    fontSize: 14,
    color: '#858D84',
    marginTop: 5,
  },
  cameraContainer: {
    flex: 1,
    marginHorizontal: 16,
    marginBottom: 15,
  },
});
