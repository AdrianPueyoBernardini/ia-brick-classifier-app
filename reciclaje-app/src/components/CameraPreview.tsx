
import { useRef, useState } from 'react';

import {
  View,
  Text,
  Pressable,
  StyleSheet,
  Image,
} from 'react-native';

import {
  CameraView,
  useCameraPermissions,
} from 'expo-camera';

interface CameraPreviewProps {
  onPhotoTaken: (uri: string) => void;
}

export default function CameraPreview({
  onPhotoTaken,
}: CameraPreviewProps) {
  const [permission, requestPermission] = useCameraPermissions();

  const cameraRef = useRef<CameraView>(null);

  const [photoUri, setPhotoUri] = useState<string | null>(null);

  async function takePicture() {
    if (!cameraRef.current) return;

    const photo = await cameraRef.current.takePictureAsync();

    if (photo) {
      setPhotoUri(photo.uri);
    }
  }

  function confirmPhoto() {
    if (!photoUri) return;

    onPhotoTaken(photoUri);
    setPhotoUri(null);
  }

  if (!permission) {
    return (
      <View style={styles.messageContainer}>
        <Text>Comprobando permisos de cámara...</Text>
      </View>
    );
  }

  if (!permission.granted) {
    return (
      <View style={styles.messageContainer}>
        <Text style={styles.message}>
          Necesitamos permiso para utilizar tu cámara.
        </Text>

        <Pressable
          style={styles.permissionButton}
          onPress={requestPermission}
        >
          <Text style={styles.buttonText}>
            Conceder permiso
          </Text>
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
        />
      )}

      {photoUri ? (
        <View style={styles.controls}>
          <Pressable
            style={styles.secondaryButton}
            onPress={() => setPhotoUri(null)}
          >
            <Text style={styles.buttonText}>Repetir</Text>
          </Pressable>

          <Pressable
            style={styles.captureButton}
            onPress={confirmPhoto}
          >
            <Text style={styles.buttonText}>Usar foto</Text>
          </Pressable>
        </View>
      ) : (
        <View style={styles.controls}>
          <Pressable
            style={styles.captureButton}
            onPress={takePicture}
          >
            <View style={styles.captureInner} />
          </Pressable>
        </View>
      )}
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    overflow: 'hidden',
    borderRadius: 20,
    backgroundColor: '#26332B',
  },
  camera: {
    flex: 1,
  },
  controls: {
    minHeight: 100,
    justifyContent: 'center',
    alignItems: 'center',
    flexDirection: 'row',
    gap: 25,
    backgroundColor: '#26332B',
  },
  captureButton: {
    width: 68,
    height: 68,
    borderRadius: 40,
    borderWidth: 4,
    borderColor: '#FFFFFF',
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: '#356B50',
  },
  captureInner: {
    width: 48,
    height: 48,
    borderRadius: 30,
    backgroundColor: '#FFFFFF',
  },
  secondaryButton: {
    paddingVertical: 14,
    paddingHorizontal: 24,
    borderRadius: 12,
    backgroundColor: '#858D84',
  },
  permissionButton: {
    padding: 15,
    backgroundColor: '#356B50',
    borderRadius: 12,
    marginTop: 15,
  },
  buttonText: {
    color: '#FFFFFF',
    fontWeight: 'bold',
  },
  messageContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    padding: 25,
  },
  message: {
    fontSize: 16,
    textAlign: 'center',
    color: '#26332B',
  },
});
