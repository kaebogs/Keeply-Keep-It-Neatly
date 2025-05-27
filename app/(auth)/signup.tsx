//Working

import Checkbox from "expo-checkbox"; // Import Checkbox from expo-checkbox
import { useRouter } from "expo-router";
import LottieView from "lottie-react-native"; // Import LottieView
import React, { useState } from "react";
import {
  ActivityIndicator,
  Alert,
  KeyboardAvoidingView,
  Platform,
  ScrollView,
  StyleSheet,
  Text,
  TextInput,
  TouchableOpacity,
  View,
} from "react-native";
// Try different import paths - adjust based on your actual file structure
import { useAuth } from "../../contexts/AuthContext";
// Alternative imports if the above doesn't work:
// import { useAuth } from "@/contexts/AuthContext";
// import { useAuth } from "@/context/AuthContext";

const Signup = () => {
  const [username, setUsername] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [isChecked, setIsChecked] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const router = useRouter();
  const authContext = useAuth();

  const handleSignup = async () => {
    console.log("Submit button pressed");

    // Check if signup function exists
    if (!authContext || typeof authContext.signup !== "function") {
      Alert.alert(
        "Error",
        "Authentication service is not available. Please try again later."
      );
      console.error(
        "Auth context or signup function not available:",
        authContext
      );
      return;
    }

    // Input validation
    if (!username.trim() || !email.trim() || !password.trim()) {
      Alert.alert("Sign Up", "Please fill in all fields.");
      return;
    }

    if (!isChecked) {
      Alert.alert(
        "Sign Up",
        "You must agree to the Terms of Service and Privacy Policy."
      );
      return;
    }

    // Email validation
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(email)) {
      Alert.alert("Sign Up", "Please enter a valid email address.");
      return;
    }

    // Password validation (at least 6 characters)
    if (password.length < 6) {
      Alert.alert("Sign Up", "Password must be at least 6 characters long.");
      return;
    }

    setIsLoading(true);

    try {
      // Use default profile URL
      const defaultProfileUrl =
        "https://ui-avatars.com/api/?name=" + encodeURIComponent(username);

      // Register using auth context - changed from register to signup
      await authContext.signup(email, password, username, defaultProfileUrl);
      console.log("User registered successfully");

      // Navigate to home or login after successful registration
      router.replace("/(tabs)/home");
    } catch (error: any) {
      console.error("Registration error:", error);
      Alert.alert(
        "Registration Error",
        error.message || "An unexpected error occurred. Please try again."
      );
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <KeyboardAvoidingView
      style={styles.container}
      behavior={Platform.OS === "ios" ? "padding" : "height"}
      keyboardVerticalOffset={Platform.OS === "ios" ? 0 : 20}
    >
      <ScrollView
        contentContainerStyle={styles.scrollContainer}
        keyboardShouldPersistTaps="handled"
        showsVerticalScrollIndicator={false}
      >
        {/* Lottie Animation */}
        <LottieView
          source={require("../../assets/animations/login.json")} // Replace with your Lottie animation file
          autoPlay
          loop
          style={styles.animation}
        />
        {/* Title */}
        <Text style={styles.title}>Create an Account</Text>
        <Text style={styles.subtitle}>
          Create an account and take control today!
        </Text>

        {/* Username Input */}
        <TextInput
          style={styles.input}
          placeholder="Username"
          placeholderTextColor="#aaa"
          autoCapitalize="none"
          value={username}
          onChangeText={setUsername}
          editable={!isLoading}
        />

        {/* Email Input */}
        <TextInput
          style={styles.input}
          placeholder="Email"
          placeholderTextColor="#aaa"
          keyboardType="email-address"
          autoCapitalize="none"
          value={email}
          onChangeText={setEmail}
          editable={!isLoading}
        />

        {/* Password Input */}
        <TextInput
          style={styles.input}
          placeholder="Password"
          placeholderTextColor="#aaa"
          secureTextEntry
          value={password}
          onChangeText={setPassword}
          editable={!isLoading}
        />

        {/* Terms and Privacy Checkbox */}
        <View style={styles.checkboxContainer}>
          <Checkbox
            value={isChecked}
            onValueChange={setIsChecked}
            color={isChecked ? "#F76A86" : undefined} // Change color when checked
            style={styles.checkbox}
            disabled={isLoading}
          />
          <Text style={styles.checkboxText}>
            I agree to the <Text style={styles.link}>Terms</Text> and{" "}
            <Text style={styles.link}>Privacy Policy</Text>
          </Text>
        </View>

        {/* Signup Button */}
        <TouchableOpacity
          style={[styles.button, isLoading && styles.buttonDisabled]}
          onPress={handleSignup}
          disabled={isLoading}
          activeOpacity={0.9}
        >
          {isLoading ? (
            <ActivityIndicator color="#fff" size="small" />
          ) : (
            <Text style={styles.buttonText}>Sign Up</Text>
          )}
        </TouchableOpacity>

        {/* Already Have an Account */}
        <View style={styles.signInContainer}>
          <Text style={styles.signInText}>Already have an account?</Text>
          <TouchableOpacity
            onPress={() => router.push("/(auth)/login")}
            disabled={isLoading}
          >
            <Text style={styles.signInLink}> Sign In</Text>
          </TouchableOpacity>
        </View>
      </ScrollView>
    </KeyboardAvoidingView>
  );
};

export default Signup;

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: "#fff",
  },
  scrollContainer: {
    flexGrow: 1,
    justifyContent: "center",
    alignItems: "center",
    padding: 20,
    paddingBottom: 40, // Extra padding at bottom for keyboard
  },
  animation: {
    width: 300, // Slightly smaller to fit better with keyboard
    height: 300,
  },
  title: {
    fontSize: 46,
    fontWeight: "900",
    color: "#333",
    marginTop: -20,
  },
  subtitle: {
    fontSize: 16,
    fontWeight: "500",
    color: "#666",
    marginBottom: 30,
  },
  input: {
    width: "100%",
    height: 50,
    backgroundColor: "#fff",
    borderRadius: 8,
    paddingHorizontal: 15,
    fontSize: 16,
    color: "#333",
    marginBottom: 15,
    borderWidth: 1,
    borderColor: "#000",
  },
  checkboxContainer: {
    flexDirection: "row",
    alignItems: "center",
    marginBottom: 20,
    width: "100%",
  },
  checkbox: {
    marginRight: 10,
    width: 20,
    height: 20,
  },
  checkboxText: {
    fontSize: 14,
    color: "#666",
  },
  link: {
    color: "#F76A86",
    fontWeight: "bold",
  },
  button: {
    width: "100%",
    height: 50,
    backgroundColor: "#F76A86",
    justifyContent: "center",
    alignItems: "center",
    borderRadius: 8,
    marginBottom: 15,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.2,
    shadowRadius: 3,
    elevation: 6,
    borderWidth: 2,
    borderColor: "#333",
  },
  buttonDisabled: {
    opacity: 0.7,
  },
  buttonText: {
    color: "#fff",
    fontSize: 18,
    fontWeight: "bold",
  },
  signInContainer: {
    flexDirection: "row",
    justifyContent: "center",
    alignItems: "center",
    marginTop: 10,
  },
  signInText: {
    color: "#666",
    fontSize: 14,
  },
  signInLink: {
    color: "#F76A86",
    fontSize: 14,
    fontWeight: "bold",
  },
});
