import { useRouter } from "expo-router";
import LottieView from "lottie-react-native";
import React, { useEffect } from "react";
import { StyleSheet, View } from "react-native";

const Index = () => {
  const router = useRouter();

  useEffect(() => {
    setTimeout(() => {
      router.push("/(auth)/welcome");
      //router.push("/(tabs)/home"); // Navigate to the home screen after 2 seconds
    }, 5000); // Navigate to the welcome screen after 2 seconds
  }, [router]);

  return (
    <View style={styles.container}>
      {/* Lottie Animation */}
      <LottieView
        source={require("@/assets/animations/notes.json")} // Replace with your Lottie animation file
        autoPlay
        loop={false} // Play the animation once
        style={styles.animation}
      />
    </View>
  );
};

export default Index;

const styles = StyleSheet.create({
  container: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
    backgroundColor: "#FCA5AF", // Background color for the splash screen
  },
  animation: {
    width: 200, // Adjust the size of the animation
    height: 200,
  },
});
