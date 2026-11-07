
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
} from 'react-native';

import BottomNavigation from '../components/BottomNavigation';
import PhotoCard from '../components/PhotoCard';
import { usePhotos } from '../hooks/usePhotos';

export default function PhotosScreen() {
  const { photos } = usePhotos();

  return (
    <View style={styles.container}>
      <ScrollView contentContainerStyle={styles.content}>
        <Text style={styles.title}>Mis fotos</Text>

        <Text style={styles.subtitle}>
          Tus fotografías de residuos
        </Text>

        {photos.length === 0 ? (
          <View style={styles.emptyContainer}>
            <Text style={styles.emptyIcon}>📸</Text>

            <Text style={styles.emptyTitle}>
              Todavía no tienes fotos
            </Text>

            <Text style={styles.emptyText}>
              Haz tu primera fotografía desde la pestaña Cámara.
            </Text>
          </View>
        ) : (
          <View style={styles.gallery}>
            {photos.map((photo) => (
              <PhotoCard
                key={photo.id}
                photo={photo}
              />
            ))}
          </View>
        )}
      </ScrollView>

      <BottomNavigation />
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#F8F9F5',
  },
  content: {
    flexGrow: 1,
    padding: 20,
  },
  title: {
    fontSize: 28,
    fontWeight: 'bold',
    color: '#26332B',
    marginTop: 20,
  },
  subtitle: {
    fontSize: 14,
    color: '#858D84',
    marginTop: 8,
    marginBottom: 25,
  },
  emptyContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    paddingHorizontal: 20,
  },
  emptyIcon: {
    fontSize: 55,
    marginBottom: 16,
  },
  emptyTitle: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#26332B',
  },
  emptyText: {
    fontSize: 14,
    color: '#858D84',
    textAlign: 'center',
    marginTop: 8,
    lineHeight: 21,
  },
  gallery: {
    gap: 12,
  },
});
