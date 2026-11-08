
import { StyleSheet, Text, View } from "react-native";

import BottomNavigation from "../components/BottomNavigation";
import CameraPreview from "../components/CameraPreview";
import colors from "../constants/colors";
import { usePhotos } from "../hooks/usePhotos";
import { classifyImage } from "../services/clasifyImage";

// Traducción de las etiquetas internas del modelo.
const CATEGORY_NAMES: Record<string, string> = {
  "carton-papel": "Cartón y papel",
  cristal: "Cristal",
  organico: "Orgánico",
  plastico: "Plástico",
  restos: "Restos",
};

export default function CameraScreen() {
  const { addPhoto } = usePhotos();

  // Clasifica la imagen y guarda el resultado.
  async function handlePhotoTaken(uri: string) {
    const result = await classifyImage(uri);

    const classification =
      CATEGORY_NAMES[result.category] ?? result.category;

    await addPhoto(
      uri,
      classification,
      result.container
    );
  }

  return (
    <View style={styles.container}>
      <View style={styles.header}>
        <Text style={styles.title}>Cámara</Text>
        <Text style={styles.subtitle}>
          Enfoca un residuo y haz una fotografía
        </Text>
      </View>

      <View style={styles.cameraContainer}>
        <CameraPreview onPhotoTaken={handlePhotoTaken} />
      </View>

      <BottomNavigation />
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: colors.background,
  },
  header: {
    paddingHorizontal: 24,
    paddingTop: 25,
    paddingBottom: 17,
  },
  title: {
    fontFamily: "Manrope_700Bold",
    fontSize: 27,
    color: colors.text,
    letterSpacing: -0.7,
  },
  subtitle: {
    fontFamily: "Manrope_400Regular",
    fontSize: 13,
    color: colors.textSecondary,
    marginTop: 5,
  },
  cameraContainer: {
    flex: 1,
    marginHorizontal: 16,
    marginBottom: 12,
  },
});
