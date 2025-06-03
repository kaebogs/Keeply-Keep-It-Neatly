import { useRouter } from "expo-router";
import LottieView from "lottie-react-native";
import React, { useEffect, useRef } from "react";
import {
  Animated,
  Dimensions,
  StyleSheet,
  Text,
  TextStyle,
  TouchableOpacity,
  ViewStyle,
} from "react-native";

const { width, height } = Dimensions.get("window");

const Welcome = () => {
  const router = useRouter();
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

const styles = StyleSheet.create<{
  container: ViewStyle;
  signIn: ViewStyle;
  signInText: TextStyle;
  animation: ViewStyle;
  title: TextStyle;
  subtitle: TextStyle;
  button: ViewStyle;
  buttonText: TextStyle;
}>({
  container: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
    backgroundColor: "#fff",
    padding: width * 0.05,
  },
  signIn: {
    position: "absolute",
    top: height * 0.08,
    right: width * 0.07,
    zIndex: 10,
  },
  signInText: {
    fontSize: width * 0.05,
    color: "#F76A86",
    fontWeight: "800",
  },
  animation: {
    width: width * 0.8,
    height: width * 0.8,
    marginBottom: height * 0.03,
  },
  title: {
    fontSize: width * 0.07,
    fontWeight: "bold",
    color: "#333",
    textAlign: "center",
    marginBottom: height * 0.01,
  },
  subtitle: {
    fontSize: width * 0.04,
    color: "#666",
    textAlign: "center",
    marginBottom: height * 0.04,
    lineHeight: width * 0.055,
  },
  button: {
    backgroundColor: "#F76A86",
    paddingVertical: height * 0.02,
    paddingHorizontal: width * 0.18,
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
    fontSize: width * 0.045,
    fontWeight: "bold",
    textAlign: "center",
    letterSpacing: 1.2,
  },
});
