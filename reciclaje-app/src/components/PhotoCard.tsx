
import {
  View,
  Text,
  Image,
  StyleSheet,
} from 'react-native';

interface PhotoCardProps {
  photo: {
    id: string;
    uri: string;
    classification: string;
    container: string;
  };
}

export default function PhotoCard({ photo }: PhotoCardProps) {
  return (
    <View style={styles.card}>
      <Image
        source={{ uri: photo.uri }}
        style={styles.image}
        resizeMode="cover"
      />

      <View style={styles.info}>
        <Text style={styles.classification}>
          {photo.classification}
        </Text>

        <Text style={styles.container}>
          Contenedor: {photo.container}
        </Text>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  card: {
    backgroundColor: '#FFFFFF',
    borderRadius: 16,
    overflow: 'hidden',
    marginBottom: 16,
    elevation: 2,
  },
  image: {
    width: '100%',
    height: 190,
  },
  info: {
    padding: 15,
  },
  classification: {
    fontSize: 16,
    fontWeight: 'bold',
    color: '#26332B',
  },
  container: {
    fontSize: 13,
    color: '#858D84',
    marginTop: 5,
  },
});
