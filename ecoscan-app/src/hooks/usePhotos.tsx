
import {
  createContext,
  useContext,
  useEffect,
  useRef,
  useState,
  type ReactNode,
} from "react";

import AsyncStorage from "@react-native-async-storage/async-storage";
import { Directory, File, Paths } from "expo-file-system";

export interface Photo {
  id: string;
  uri: string;
  createdAt: string;
  classification: string;
  container: string;
}

interface PhotosContextType {
  photos: Photo[];
  addPhoto: (
    uri: string,
    classification: string,
    container: string
  ) => Promise<void>;
  deletePhoto: (id: string) => Promise<void>;
}

const PhotosContext = createContext<PhotosContextType | null>(null);
const STORAGE_KEY = "ecoscan_photos";

export function PhotosProvider({ children }: { children: ReactNode }) {
  const [photos, setPhotos] = useState<Photo[]>([]);
  const photosRef = useRef<Photo[]>([]);

  useEffect(() => {
    async function loadPhotos() {
      try {
        const savedPhotos = await AsyncStorage.getItem(STORAGE_KEY);

        if (savedPhotos) {
          const parsedPhotos: Photo[] = JSON.parse(savedPhotos);

          const validPhotos = parsedPhotos.filter(
            (photo) => new File(photo.uri).exists
          );

          photosRef.current = validPhotos;
          setPhotos(validPhotos);

          if (validPhotos.length !== parsedPhotos.length) {
            await AsyncStorage.setItem(
              STORAGE_KEY,
              JSON.stringify(validPhotos)
            );
          }
        }
      } catch (error) {
        console.error("Error recuperando fotografías:", error);
      }
    }

    loadPhotos();
  }, []);

  // Guarda la fotografía junto con el resultado de la IA.
  async function addPhoto(
    uri: string,
    classification: string,
    container: string
  ) {
    try {
      const id = Date.now().toString();

      const photosDirectory = new Directory(Paths.document, "photos");

      if (!photosDirectory.exists) {
        photosDirectory.create({ intermediates: true });
      }

      const sourceFile = new File(uri);
      const destinationFile = new File(photosDirectory, `${id}.jpg`);

      await sourceFile.copy(destinationFile);

      const newPhoto: Photo = {
        id,
        uri: destinationFile.uri,
        createdAt: new Date().toISOString(),
        classification,
        container,
      };

      const updatedPhotos = [newPhoto, ...photosRef.current];

      await AsyncStorage.setItem(
        STORAGE_KEY,
        JSON.stringify(updatedPhotos)
      );

      photosRef.current = updatedPhotos;
      setPhotos(updatedPhotos);
    } catch (error) {
      console.error("Error guardando fotografía:", error);
      throw error;
    }
  }

  async function deletePhoto(id: string) {
    try {
      const photoToDelete = photosRef.current.find(
        (photo) => photo.id === id
      );

      if (!photoToDelete) return;

      const imageFile = new File(photoToDelete.uri);

      if (imageFile.exists) {
        imageFile.delete();
      }

      const updatedPhotos = photosRef.current.filter(
        (photo) => photo.id !== id
      );

      await AsyncStorage.setItem(
        STORAGE_KEY,
        JSON.stringify(updatedPhotos)
      );

      photosRef.current = updatedPhotos;
      setPhotos(updatedPhotos);
    } catch (error) {
      console.error("Error eliminando fotografía:", error);
      throw error;
    }
  }

  return (
    <PhotosContext.Provider value={{ photos, addPhoto, deletePhoto }}>
      {children}
    </PhotosContext.Provider>
  );
}

export function usePhotos() {
  const context = useContext(PhotosContext);

  if (!context) {
    throw new Error("usePhotos debe utilizarse dentro de PhotosProvider");
  }

  return context;
}
