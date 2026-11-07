
import { Slot } from 'expo-router';
import { PhotosProvider } from '../hooks/usePhotos';
import * as NavigationBar from 'expo-navigation-bar';

export default function RootLayout() {
  NavigationBar.setVisibilityAsync('hidden');

  return (
    <PhotosProvider>
      <Slot />
    </PhotosProvider>
  );
}
