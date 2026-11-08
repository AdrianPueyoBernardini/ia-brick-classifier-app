
import {
  Alert,
  Image,
  Pressable,
  StyleSheet,
  Text,
  View,
} from "react-native";

import { CalendarDays, Trash2 } from "lucide-react-native";
import colors from "../constants/colors";

interface PhotoCardProps {
  photo: {
    id: string;
    uri: string;
    createdAt: string;
    classification: string;
    container: string;
  };
  onDelete: (id: string) => Promise<void>;
}

const CONTAINER_COLORS: Record<
  string,
  { background: string; foreground: string; text: string }
> = {
  Azul: {
    background: "#E8F1FC",
    foreground: "#2670C7",
    text: "#FFFFFF",
  },
  Verde: {
    background: "#E8F5EC",
    foreground: "#23834D",
    text: "#FFFFFF",
  },
  Marrón: {
    background: "#F3EBDD",
    foreground: "#90602F",
    text: "#FFFFFF",
  },
  Amarillo: {
    background: "#FFF5D6",
    foreground: "#E0B000",
    text: "#302600",
  },
  "Gris oscuro": {
    background: "#EAEBED",
    foreground: "#555B65",
    text: "#FFFFFF",
  },
};

export default function PhotoCard({
  photo,
  onDelete,
}: PhotoCardProps) {
  const containerColor =
    CONTAINER_COLORS[photo.container] ?? CONTAINER_COLORS["Gris oscuro"];

  function confirmDelete() {
    Alert.alert(
      "Eliminar fotografía",
      "¿Estás seguro de que quieres eliminar esta fotografía? Esta acción no se puede deshacer.",
      [
        { text: "Cancelar", style: "cancel" },
        {
          text: "Eliminar",
          style: "destructive",
          onPress: async () => {
            try {
              await onDelete(photo.id);
            } catch (error) {
              console.error("Error eliminando fotografía:", error);
              Alert.alert("Error", "No se ha podido eliminar la fotografía.");
            }
          },
        },
      ]
    );
  }

  function formatDate(date: string) {
    return new Date(date).toLocaleString("es-ES", {
      day: "2-digit",
      month: "long",
      year: "numeric",
      hour: "2-digit",
      minute: "2-digit",
    });
  }

  return (
    <View
      style={[
        styles.card,
        { backgroundColor: containerColor.background },
      ]}
    >
      <Image
        source={{ uri: photo.uri }}
        style={styles.image}
        resizeMode="cover"
      />

      <View style={styles.info}>
        <Text style={styles.classification}>
          {photo.classification}
        </Text>

        <View
          style={[
            styles.containerBadge,
            { backgroundColor: containerColor.foreground },
          ]}
        >
          <Text
            style={[
              styles.containerBadgeText,
              { color: containerColor.text },
            ]}
          >
            Contenedor {photo.container}
          </Text>
        </View>

        <View style={styles.dateRow}>
          <CalendarDays size={14} color={colors.textSecondary} />
          <Text style={styles.date}>
            {formatDate(photo.createdAt)}
          </Text>
        </View>

        <View style={styles.actions}>
          <Pressable
            style={({ pressed }) => [
              styles.deleteButton,
              pressed && styles.deleteButtonPressed,
            ]}
            onPress={confirmDelete}
          >
            <Trash2 size={15} color={colors.danger} strokeWidth={1.8} />
            <Text style={styles.deleteText}>Eliminar</Text>
          </Pressable>
        </View>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  card: {
    borderRadius: 17,
    overflow: "hidden",
    marginBottom: 16,
    elevation: 2,
  },
  image: {
    width: "100%",
    height: 190,
  },
  info: {
    padding: 16,
  },
  classification: {
    fontFamily: "Manrope_700Bold",
    fontSize: 16,
    color: colors.text,
  },
  containerBadge: {
    alignSelf: "flex-start",
    paddingVertical: 7,
    paddingHorizontal: 12,
    borderRadius: 8,
    marginTop: 9,
  },
  containerBadgeText: {
    fontFamily: "Manrope_700Bold",
    fontSize: 12,
  },
  dateRow: {
    flexDirection: "row",
    alignItems: "center",
    gap: 7,
    marginTop: 12,
  },
  date: {
    fontFamily: "Manrope_400Regular",
    fontSize: 11,
    color: colors.textSecondary,
  },
  actions: {
    flexDirection: "row",
    justifyContent: "flex-end",
    marginTop: 14,
    paddingTop: 12,
    borderTopWidth: 1,
    borderTopColor: "rgba(0,0,0,0.08)",
  },
  deleteButton: {
    flexDirection: "row",
    alignItems: "center",
    gap: 7,
    paddingVertical: 9,
    paddingHorizontal: 13,
    borderRadius: 10,
    backgroundColor: "#FFFFFF",
  },
  deleteButtonPressed: {
    opacity: 0.6,
  },
  deleteText: {
    fontFamily: "Manrope_600SemiBold",
    fontSize: 12,
    color: colors.danger,
  },
});
