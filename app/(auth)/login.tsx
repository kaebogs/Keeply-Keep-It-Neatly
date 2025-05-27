//Working

import { useRouter } from "expo-router";
import { getAuth, signInWithEmailAndPassword } from "firebase/auth";
import {
  collection,
  doc,
  getDoc,
  getDocs,
  query,
  where,
} from "firebase/firestore";
import LottieView from "lottie-react-native";
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
import { db } from "../../config/firebase";

const Login = () => {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const router = useRouter();

  const fetchEmailFromUsername = async (
    username: string
  ): Promise<string | null> => {
    try {
      const usersRef = collection(db, "users");
      const q = query(usersRef, where("username", "==", username));
      const querySnapshot = await getDocs(q);

      if (querySnapshot.empty) {
        return null;
      }

      return querySnapshot.docs[0].data().email;
    } catch (error) {
      console.error("Error fetching email from username:", error);
      return null;
    }
  };

  const fetchUsernameFromUserId = async (
    userId: string
  ): Promise<string | null> => {
    try {
      const userDocRef = doc(db, "users", userId);
      const userDoc = await getDoc(userDocRef);

      if (userDoc.exists()) {
        return userDoc.data().username || null;
      }

      return null;
    } catch (error) {
      console.error("Error fetching username from user ID:", error);
      return null;
    }
  };

  const handleSubmit = async () => {
    if (!email.trim() || !password.trim()) {
      Alert.alert("Login", "Please fill in all fields.");
      return;
    }

    setIsLoading(true);

    try {
      console.log("Attempting login with:", email);

      let loginEmail = email;

      const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
      if (!emailRegex.test(email)) {
        const usernameToEmail = await fetchEmailFromUsername(email);
        if (!usernameToEmail) {
          throw new Error("No account found for the provided username.");
        }
        loginEmail = usernameToEmail;
      }

      const auth = getAuth();
      const userCredential = await signInWithEmailAndPassword(
        auth,
        loginEmail,
        password
      );

      // Fetch username from Firestore using the user's UID
      const username = await fetchUsernameFromUserId(userCredential.user.uid);

      console.log("Login successful");
      Alert.alert("Success", `Welcome back, ${username || "User"}!`);
      router.replace("/(tabs)/home");
    } catch (error: any) {
      console.error("Login error:", error);
      Alert.alert(
        "Login Failed",
        error.message || "Invalid credentials. Please try again."
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
        <LottieView
          source={require("../../assets/animations/login.json")}
          autoPlay
          loop
          style={styles.animation}
        />
        <Text style={styles.title}>Welcome Back!</Text>
        <Text style={styles.subtitle}>Please enter your credentials</Text>

        <TextInput
          style={styles.input}
          placeholder="Username or Email"
          placeholderTextColor="#aaa"
          autoCapitalize="none"
          value={email}
          onChangeText={setEmail}
          editable={!isLoading}
        />

        <TextInput
          style={styles.input}
          placeholder="Password"
          placeholderTextColor="#aaa"
          secureTextEntry
          value={password}
          onChangeText={setPassword}
          editable={!isLoading}
        />

        <TouchableOpacity
          style={styles.forgotPasswordContainer}
          disabled={isLoading}
        >
          <Text style={styles.forgotPassword}>Forgot Password?</Text>
        </TouchableOpacity>

        <TouchableOpacity
          style={[styles.button, isLoading && styles.buttonDisabled]}
          onPress={handleSubmit}
          disabled={isLoading}
          activeOpacity={0.9}
        >
          {isLoading ? (
            <ActivityIndicator color="#fff" size="small" />
          ) : (
            <Text style={styles.buttonText}>Login</Text>
          )}
        </TouchableOpacity>

        <View style={styles.signUpContainer}>
          <Text style={styles.signUpText}>Don't have an account?</Text>
          <TouchableOpacity
            onPress={() => router.push("/(auth)/signup")}
            disabled={isLoading}
          >
            <Text style={styles.signUpLink}> Sign Up</Text>
          </TouchableOpacity>
        </View>
      </ScrollView>
    </KeyboardAvoidingView>
  );
};

export default Login;

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
  forgotPasswordContainer: {
    width: "100%",
    alignItems: "flex-end",
    marginBottom: 15,
  },
  forgotPassword: {
    color: "#F76A86",
    fontSize: 14,
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
  signUpContainer: {
    flexDirection: "row",
    justifyContent: "center",
    alignItems: "center",
    marginTop: 10,
  },
  signUpText: {
    color: "#666",
    fontSize: 14,
  },
  signUpLink: {
    color: "#F76A86",
    fontSize: 14,
    fontWeight: "bold",
  },
});
