import { router } from "expo-router";
import { ArrowRight, Leaf, Recycle, ScanLine } from "lucide-react-native";
import { useEffect } from "react";
import { Pressable, StyleSheet, Text, View } from "react-native";
import Animated, {
  useAnimatedStyle,
  useSharedValue,
  withRepeat,
  withSequence,
  withTiming,
} from "react-native-reanimated";

import colors from "../constants/colors";

export default function HomeScreen() {
  function startApp() {
    router.navigate("/camara" as any);
  }

  // Valores compartidos para la animación de vibración / pulso
  const scale = useSharedValue(1);
  const rotation = useSharedValue(0);

  useEffect(() => {
    // Animación de escala sutil tipo latido
    scale.value = withRepeat(
      withSequence(
        withTiming(1.04, { duration: 800 }),
        withTiming(1, { duration: 800 }),
      ),
      -1, // Infinito
      true,
    );

    // Pequeña rotación alternada para dar efecto "vibración / gracioso"
    rotation.value = withRepeat(
      withSequence(
        withTiming(-1.5, { duration: 150 }),
        withTiming(1.5, { duration: 150 }),
        withTiming(0, { duration: 150 }),
      ),
      -1,
      true,
    );
  }, []);

  const animatedStyle = useAnimatedStyle(() => {
    return {
      transform: [{ scale: scale.value }, { rotate: `${rotation.value}deg` }],
    };
  });

  return (
    <View style={styles.container}>
      <View style={styles.top}>
        <View style={styles.logoContainer}>
          <Recycle size={30} color={colors.primary} strokeWidth={1.8} />
        </View>

        <Text style={styles.brand}>EcoScan</Text>
      </View>

      <View style={styles.hero}>
        {/* Contenedor animado con Reanimated */}
        <Animated.View style={[styles.illustration, animatedStyle]}>
          <View style={styles.illustrationCircle}>
            <Leaf size={86} color={colors.primary} strokeWidth={1.35} />

            <View style={styles.scanIcon}>
              <ScanLine
                size={27}
                color={colors.primaryDark}
                strokeWidth={1.8}
              />
            </View>
          </View>
        </Animated.View>

        <Text style={styles.eyebrow}>RECICLAJE INTELIGENTE</Text>

        <Text style={styles.title}>Reciclar mejor{"\n"}empieza aquí.</Text>

        <Text style={styles.description}>
          Identifica tus residuos de forma sencilla y descubre cómo separarlos
          correctamente. Un pequeño gesto puede marcar la diferencia.
        </Text>

        <Pressable
          style={({ pressed }) => [
            styles.startButton,
            pressed && styles.buttonPressed,
          ]}
          onPress={startApp}
        >
          <Text style={styles.startButtonText}>Empezar</Text>
          <ArrowRight size={20} color="#FFFFFF" strokeWidth={2} />
        </Pressable>

        <Text style={styles.privacyText}>
          Clasificación directamente en tu dispositivo
        </Text>
      </View>

      <View style={styles.footer}>
        <View style={styles.footerLine} />
        <Text style={styles.developer}>Desarrollado por APB Labs</Text>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: colors.background,
    paddingHorizontal: 28,
    justifyContent: "space-between",
  },
  top: {
    flexDirection: "row",
    alignItems: "center",
    gap: 10,
    paddingTop: 35,
  },
  logoContainer: {
    width: 44,
    height: 44,
    borderRadius: 14,
    backgroundColor: colors.primaryLight,
    alignItems: "center",
    justifyContent: "center",
  },
  brand: {
    fontFamily: "Manrope_700Bold",
    fontSize: 23,
    color: colors.text,
    letterSpacing: -0.8,
  },
  hero: {
    alignItems: "center",
    width: "100%",
    marginTop: -15,
  },
  illustration: {
    width: 220,
    height: 220,
    alignItems: "center",
    justifyContent: "center",
    marginBottom: 32,
  },
  illustrationCircle: {
    width: 190,
    height: 190,
    borderRadius: 95,
    backgroundColor: colors.primaryLight,
    alignItems: "center",
    justifyContent: "center",
  },
  scanIcon: {
    position: "absolute",
    right: 23,
    bottom: 24,
    width: 52,
    height: 52,
    borderRadius: 18,
    backgroundColor: "#FFFFFF",
    alignItems: "center",
    justifyContent: "center",
    elevation: 3,
  },
  eyebrow: {
    fontFamily: "Manrope_700Bold",
    fontSize: 11,
    letterSpacing: 2,
    color: colors.primary,
    marginBottom: 13,
  },
  title: {
    fontFamily: "Manrope_700Bold",
    fontSize: 35,
    lineHeight: 43,
    letterSpacing: -1.3,
    textAlign: "center",
    color: colors.text,
  },
  description: {
    fontFamily: "Manrope_400Regular",
    fontSize: 14,
    lineHeight: 23,
    color: colors.textSecondary,
    textAlign: "center",
    marginTop: 17,
    maxWidth: 320,
  },
  startButton: {
    width: "100%",
    height: 58,
    borderRadius: 16,
    backgroundColor: colors.primary,
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    gap: 12,
    marginTop: 32,
  },
  buttonPressed: {
    opacity: 0.82,
    transform: [{ scale: 0.985 }],
  },
  startButtonText: {
    fontFamily: "Manrope_700Bold",
    fontSize: 16,
    color: "#FFFFFF",
  },
  privacyText: {
    fontFamily: "Manrope_400Regular",
    fontSize: 11,
    color: colors.textSecondary,
    marginTop: 16,
    textAlign: "center",
  },
  footer: {
    alignItems: "center",
    paddingBottom: 27,
  },
  footerLine: {
    width: 38,
    height: 3,
    borderRadius: 2,
    backgroundColor: "#D7DFD5",
    marginBottom: 13,
  },
  developer: {
    fontFamily: "Manrope_500Medium",
    fontSize: 11,
    color: colors.textSecondary,
    letterSpacing: 0.5,
  },
});
