import { router, usePathname } from "expo-router";
import { Camera, Images } from "lucide-react-native";
import { Pressable, StyleSheet, Text, View } from "react-native";

import colors from "../constants/colors";

export default function BottomNavigation() {
  const pathname = usePathname();

  const isCamera = pathname === "/camara";
  const isPhotos = pathname === "/fotos";

  return (
    <View style={styles.container}>
      <Pressable
        style={styles.tab}
        onPress={() => router.navigate("/camara" as any)}
      >
        <Camera
          size={22}
          color={isCamera ? colors.primary : colors.textSecondary}
          strokeWidth={isCamera ? 2.2 : 1.7}
        />

        <Text style={[styles.label, isCamera && styles.activeLabel]}>
          Cámara
        </Text>

        {isCamera && <View style={styles.indicator} />}
      </Pressable>

      <Pressable style={styles.tab} onPress={() => router.navigate("/fotos")}>
        <Images
          size={22}
          color={isPhotos ? colors.primary : colors.textSecondary}
          strokeWidth={isPhotos ? 2.2 : 1.7}
        />

        <Text style={[styles.label, isPhotos && styles.activeLabel]}>
          Mis fotos
        </Text>

        {isPhotos && <View style={styles.indicator} />}
      </Pressable>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    height: 72,
    flexDirection: "row",
    backgroundColor: colors.surface,
    borderTopWidth: 1,
    borderTopColor: colors.border,
    paddingBottom: 7,
  },
  tab: {
    flex: 1,
    alignItems: "center",
    justifyContent: "center",
    gap: 4,
  },
  label: {
    fontFamily: "Manrope_500Medium",
    fontSize: 11,
    color: colors.textSecondary,
  },
  activeLabel: {
    fontFamily: "Manrope_700Bold",
    color: colors.primary,
  },
  indicator: {
    position: "absolute",
    top: 0,
    width: 30,
    height: 3,
    borderBottomLeftRadius: 3,
    borderBottomRightRadius: 3,
    backgroundColor: colors.primary,
  },
});
