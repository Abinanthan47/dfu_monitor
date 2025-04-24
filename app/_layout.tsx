import { useFonts } from "expo-font";
import { Stack } from "expo-router";
import React from "react";
import { ActivityIndicator, Text, View } from "react-native";

export default function RootLayout() {
  const [fontsLoaded] = useFonts({
    "Inter-Regular": require("../assets/fonts/Inter-Regular.ttf"),
    "Inter-Medium": require("../assets/fonts/Inter_Medium.ttf"),
  });
  if (!fontsLoaded) {
    return (
      <View style={{ flex: 1, justifyContent: "center", alignItems: "center" }}>
        <ActivityIndicator size="large" />
      </View>
    );
  }
  // Suppress TS error and apply Inter-Regular by casting to any
  const TextAny = Text as any;
  TextAny.defaultProps = {
    ...(TextAny.defaultProps || {}),
    style: [{ fontFamily: "Inter-Regular" }, TextAny.defaultProps?.style],
  };

  return (
    <Stack
      screenOptions={{
        headerShown: false,
        headerTitleStyle: { fontFamily: "Inter-Medium" },
        headerLargeTitleStyle: { fontFamily: "Inter-Medium" },
      }}
    />
  );
}
