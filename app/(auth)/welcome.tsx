import { useRouter } from "expo-router";
import LottieView from "lottie-react-native";
import React, { useEffect, useRef } from "react";
import { Animated, StyleSheet, Text, TouchableOpacity } from "react-native";

const Welcome = () => {
  const router = useRouter(); // Use the router object for navigation
  const fadeAnim = useRef(new Animated.Value(0)).current;

  useEffect(() => {
    Animated.timing(fadeAnim, {
      toValue: 1,
      duration: 1000,
      useNativeDriver: true,
    }).start();
  }, [fadeAnim]);

  return (
    <Animated.View style={[styles.container, { opacity: fadeAnim }]}>
      {/* Sign In Text */}
      <Animated.View style={[styles.signIn, { opacity: fadeAnim }]}>
        <TouchableOpacity onPress={() => router.push("/(auth)/login")}>
          <Text style={styles.signInText}>Sign In</Text>
        </TouchableOpacity>
      </Animated.View>

      {/* Lottie Animation */}
      <Animated.View style={{ opacity: fadeAnim }}>
        <LottieView
          source={require("../../assets/animations/get-started.json")}
          autoPlay
          loop
          style={styles.animation}
        />
      </Animated.View>

      {/* Welcome Text */}
      <Animated.View style={{ opacity: fadeAnim }}>
        <Text style={styles.title}>Let’s Keep it Neatly!</Text>
        <Text style={styles.subtitle}>
          Keeply is designed to help you stay neat, organized, focused, and
          productive. Whether you’re managing work projects, personal errands,
          or long-term goals, this app will make sure you never miss a task
          again!
        </Text>
      </Animated.View>

      {/* Get Started Button */}
      <Animated.View style={{ opacity: fadeAnim }}>
        <TouchableOpacity
          style={styles.button}
          onPress={() => router.push("/(auth)/signup")}
        >
          <Text style={styles.buttonText}>Get Started</Text>
        </TouchableOpacity>
      </Animated.View>
    </Animated.View>
  );
};

export default Welcome;

const styles = StyleSheet.create({
  container: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
    backgroundColor: "#fff",
    padding: 20,
  },
  signIn: {
    position: "absolute",
    top: 90,
    right: 30,
    zIndex: 10,
  },
  signInText: {
    fontSize: 20,
    color: "#F76A86",
    fontWeight: "800",
  },
  animation: {
    width: 350,
    height: 350,
    marginBottom: 20,
  },
  title: {
    fontSize: 28,
    fontWeight: "bold",
    color: "#333",
    textAlign: "center",
    marginBottom: 10,
  },
  subtitle: {
    fontSize: 16,
    color: "#666",
    textAlign: "center",
    marginBottom: 30,
    lineHeight: 22,
  },
  button: {
    backgroundColor: "#F76A86",
    paddingVertical: 15,
    paddingHorizontal: 50,
    borderRadius: 6,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.3,
    shadowRadius: 4,
    elevation: 6,
    borderWidth: 2,
    borderColor: "#333",
  },
  buttonText: {
    color: "#fff",
    fontSize: 16,
    fontWeight: "bold",
    textAlign: "center",
    letterSpacing: 1.2,
  },
});
