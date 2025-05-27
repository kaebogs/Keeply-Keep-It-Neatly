import { Slot } from "expo-router";
import React from "react";
import { StyleSheet } from "react-native";
import { GestureHandlerRootView } from "react-native-gesture-handler";
import { AuthProvider } from "../contexts/AuthContext";
import { LogBox } from 'react-native';
LogBox.ignoreLogs(['useInsertionEffect must not schedule updates']);

export default function RootLayout() {
  return (
    <GestureHandlerRootView style={{ flex: 1 }}>
      <AuthProvider>
        <Slot />
      </AuthProvider>
    </GestureHandlerRootView>
  );
}

const styles = StyleSheet.create({});
