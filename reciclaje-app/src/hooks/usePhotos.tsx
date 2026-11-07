import React, {
  createContext,
  useContext,
  useState,
  ReactNode,
} from 'react';

export interface Photo {
  id: string;
  uri: string;
  createdAt: number;
  classification: string;
  container: string;
}

interface PhotosContextType {
  photos: Photo[];
  addPhoto: (uri: string) => void;
}

const PhotosContext = createContext<PhotosContextType | undefined>(
  undefined
);

export function PhotosProvider({ children }: { children: ReactNode }) {
  const [photos, setPhotos] = useState<Photo[]>([]);

  const addPhoto = (uri: string) => {
    const newPhoto: Photo = {
      id: Date.now().toString(),
      uri,
      createdAt: Date.now(),
      classification: 'Pendiente de clasificación',
      container: 'Pendiente',
    };

    setPhotos(current => [newPhoto, ...current]);
  };

  return (
    <PhotosContext.Provider value={{ photos, addPhoto }}>
      {children}
    </PhotosContext.Provider>
  );
}

export function usePhotos() {
  const context = useContext(PhotosContext);

  if (!context) {
    throw new Error('usePhotos debe utilizarse dentro de PhotosProvider');
  }

  return context;
}