import { useFonts } from "@expo-google-fonts/manrope";
import * as NavigationBar from "expo-navigation-bar";
import { Slot } from "expo-router";
import { useEffect } from "react";
import { Platform } from "react-native";

import {
  Manrope_400Regular,
  Manrope_500Medium,
  Manrope_600SemiBold,
  Manrope_700Bold,
} from "@expo-google-fonts/manrope";

import { PhotosProvider } from "../hooks/usePhotos";

export default function RootLayout() {
  const [fontsLoaded] = useFonts({
    Manrope_400Regular,
    Manrope_500Medium,
    Manrope_600SemiBold,
    Manrope_700Bold,
  });

  useEffect(() => {
    if (Platform.OS === "android") {
      NavigationBar.setVisibilityAsync("hidden");
    }
  }, []);

  if (!fontsLoaded) {
    return null;
  }

  return (
    <PhotosProvider>
      <Slot />
    </PhotosProvider>
  );
}
