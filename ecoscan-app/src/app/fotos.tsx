import { Images } from "lucide-react-native";
import { ScrollView, StyleSheet, Text, View } from "react-native";

import BottomNavigation from "../components/BottomNavigation";
import PhotoCard from "../components/PhotoCard";
import colors from "../constants/colors";
import { usePhotos } from "../hooks/usePhotos";

export default function PhotosScreen() {
  const { photos, deletePhoto } = usePhotos();

  return (
    <View style={styles.container}>
      <ScrollView contentContainerStyle={styles.content}>
        <Text style={styles.title}>Mis fotos</Text>

        <Text style={styles.subtitle}>
          Tu historial de fotografías de residuos
        </Text>

        {photos.length === 0 ? (
          <View style={styles.emptyContainer}>
            <View style={styles.emptyIconContainer}>
              <Images size={38} color={colors.primary} strokeWidth={1.5} />
            </View>

            <Text style={styles.emptyTitle}>Todavía no tienes fotografías</Text>

            <Text style={styles.emptyText}>
              Haz tu primera fotografía desde la pestaña Cámara. Aquí
              encontrarás todas tus imágenes guardadas.
            </Text>
          </View>
        ) : (
          <View style={styles.gallery}>
            {photos.map((photo) => (
              <PhotoCard key={photo.id} photo={photo} onDelete={deletePhoto} />
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
    backgroundColor: colors.background,
  },
  content: {
    flexGrow: 1,
    padding: 20,
    paddingTop: 25,
  },
  title: {
    fontFamily: "Manrope_700Bold",
    fontSize: 27,
    letterSpacing: -0.7,
    color: colors.text,
  },
  subtitle: {
    fontFamily: "Manrope_400Regular",
    fontSize: 13,
    color: colors.textSecondary,
    marginTop: 6,
    marginBottom: 25,
  },
  emptyContainer: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
    paddingHorizontal: 20,
    paddingBottom: 70,
  },
  emptyIconContainer: {
    width: 82,
    height: 82,
    borderRadius: 26,
    backgroundColor: colors.primaryLight,
    justifyContent: "center",
    alignItems: "center",
    marginBottom: 20,
  },
  emptyTitle: {
    fontFamily: "Manrope_700Bold",
    fontSize: 17,
    color: colors.text,
    textAlign: "center",
  },
  emptyText: {
    fontFamily: "Manrope_400Regular",
    fontSize: 13,
    color: colors.textSecondary,
    textAlign: "center",
    marginTop: 9,
    lineHeight: 21,
  },
  gallery: {
    gap: 12,
  },
});
