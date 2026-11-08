import { useRef, useState } from "react";
import { Alert, Image, Pressable, StyleSheet, Text, View } from "react-native";

import { CameraView, useCameraPermissions } from "expo-camera";
import { Camera, Check, RotateCcw } from "lucide-react-native";

import colors from "../constants/colors";

interface CameraPreviewProps {
  onPhotoTaken: (uri: string) => Promise<void>;
}

export default function CameraPreview({ onPhotoTaken }: CameraPreviewProps) {
  const [permission, requestPermission] = useCameraPermissions();
  const cameraRef = useRef<CameraView>(null);

  const [photoUri, setPhotoUri] = useState<string | null>(null);
  const [isSaving, setIsSaving] = useState(false);
  const [isCameraReady, setIsCameraReady] = useState(false);
  const [isCapturing, setIsCapturing] = useState(false);

  async function takePicture() {
    if (!cameraRef.current || !isCameraReady || isCapturing) return;

    try {
      setIsCapturing(true);

      const photo = await cameraRef.current.takePictureAsync({
        quality: 0.8,
      });

      if (photo?.uri) {
        setIsCameraReady(false);
        setPhotoUri(photo.uri);
      }
    } catch (error) {
      console.error("Error al tomar la fotografía:", error);

      Alert.alert(
        "Error de cámara",
        "No se ha podido tomar la fotografía. Comprueba que la cámara está preparada e inténtalo de nuevo.",
      );
    } finally {
      setIsCapturing(false);
    }
  }

  async function confirmPhoto() {
    if (!photoUri || isSaving) return;

    try {
      setIsSaving(true);
      await onPhotoTaken(photoUri);
      setPhotoUri(null);
    } catch (error) {
      console.error("Error al guardar la fotografía:", error);
      Alert.alert("Error al guardar", "No se ha podido guardar la fotografía.");
    } finally {
      setIsSaving(false);
    }
  }

  function repeatPhoto() {
    if (isSaving) return;
    setPhotoUri(null);
    setIsCameraReady(false);
  }

  if (!permission) {
    return (
      <View style={styles.messageContainer}>
        <Text style={styles.message}>Comprobando permisos de cámara...</Text>
      </View>
    );
  }

  if (!permission.granted) {
    return (
      <View style={styles.messageContainer}>
        <Camera size={38} color={colors.primary} strokeWidth={1.5} />

        <Text style={styles.message}>
          Necesitamos permiso para utilizar tu cámara.
        </Text>

        <Pressable style={styles.permissionButton} onPress={requestPermission}>
          <Text style={styles.buttonText}>Conceder permiso</Text>
        </Pressable>
      </View>
    );
  }

  return (
    <View style={styles.container}>
      {photoUri ? (
        <Image
          source={{ uri: photoUri }}
          style={styles.camera}
          resizeMode="cover"
        />
      ) : (
        <CameraView
          ref={cameraRef}
          style={styles.camera}
          facing="back"
          onCameraReady={() => setIsCameraReady(true)}
          onMountError={(event) => {
            console.error("Error iniciando la cámara:", event.message);

            Alert.alert(
              "Error de cámara",
              "No se ha podido iniciar la cámara del dispositivo.",
            );
          }}
        />
      )}

      {photoUri ? (
        <View style={styles.controls}>
          <Pressable
            style={styles.secondaryButton}
            onPress={repeatPhoto}
            disabled={isSaving}
          >
            <RotateCcw size={17} color={colors.text} />
            <Text style={styles.secondaryButtonText}>Repetir</Text>
          </Pressable>

          <Pressable
            style={[styles.confirmButton, isSaving && styles.disabledButton]}
            onPress={confirmPhoto}
            disabled={isSaving}
          >
            <Check size={18} color="#FFFFFF" />
            <Text style={styles.buttonText}>
              {isSaving ? "Guardando..." : "Usar foto"}
            </Text>
          </Pressable>
        </View>
      ) : (
        <View style={styles.controls}>
          <Pressable
            style={[
              styles.captureButton,
              (!isCameraReady || isCapturing) && styles.disabledButton,
            ]}
            onPress={takePicture}
            disabled={!isCameraReady || isCapturing}
          >
            <View style={styles.captureInner} />
          </Pressable>

          {!isCameraReady && (
            <Text style={styles.cameraMessage}>Preparando cámara...</Text>
          )}
        </View>
      )}
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    overflow: "hidden",
    borderRadius: 20,
    backgroundColor: colors.text,
  },
  camera: {
    flex: 1,
  },
  controls: {
    minHeight: 100,
    justifyContent: "center",
    alignItems: "center",
    flexDirection: "row",
    gap: 20,
    backgroundColor: colors.text,
  },
  captureButton: {
    width: 68,
    height: 68,
    borderRadius: 40,
    borderWidth: 4,
    borderColor: "#FFFFFF",
    justifyContent: "center",
    alignItems: "center",
    backgroundColor: colors.primary,
  },
  captureInner: {
    width: 48,
    height: 48,
    borderRadius: 30,
    backgroundColor: "#FFFFFF",
  },
  confirmButton: {
    flexDirection: "row",
    alignItems: "center",
    gap: 9,
    paddingVertical: 14,
    paddingHorizontal: 22,
    borderRadius: 12,
    backgroundColor: colors.primary,
  },
  secondaryButton: {
    flexDirection: "row",
    alignItems: "center",
    gap: 9,
    paddingVertical: 14,
    paddingHorizontal: 20,
    borderRadius: 12,
    backgroundColor: "#FFFFFF",
  },
  secondaryButtonText: {
    fontFamily: "Manrope_600SemiBold",
    color: colors.text,
    fontSize: 13,
  },
  permissionButton: {
    flexDirection: "row",
    paddingVertical: 14,
    paddingHorizontal: 22,
    backgroundColor: colors.primary,
    borderRadius: 12,
    marginTop: 18,
  },
  disabledButton: {
    opacity: 0.4,
  },
  buttonText: {
    fontFamily: "Manrope_700Bold",
    color: "#FFFFFF",
    fontSize: 13,
  },
  cameraMessage: {
    position: "absolute",
    bottom: 5,
    color: "#FFFFFF",
    fontFamily: "Manrope_400Regular",
    fontSize: 11,
  },
  messageContainer: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
    padding: 25,
    gap: 12,
  },
  message: {
    fontFamily: "Manrope_500Medium",
    fontSize: 14,
    textAlign: "center",
    color: colors.text,
  },
});
