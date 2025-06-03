import AsyncStorage from '@react-native-async-storage/async-storage';
import { initializeApp } from 'firebase/app';
import { getReactNativePersistence, initializeAuth } from 'firebase/auth';
import { getFirestore } from 'firebase/firestore';
import { getStorage } from 'firebase/storage';

const firebaseConfig = {
    apiKey: "AIzaSyBZjkW_goxE3pnk9-GGTGiDnNYc_HxxL0g",
    authDomain: "keeply-keepitneatly.firebaseapp.com",
    projectId: "keeply-keepitneatly",
    storageBucket: "keeply-keepitneatly.firebasestorage.app",
    messagingSenderId: "1077290802024",
    appId: "1:1077290802024:web:7095240648462434da14dd",
    measurementId: "G-S6SB9VBQ9B"
};

// Initialize Firebase
const app = initializeApp(firebaseConfig);

// Initialize Firebase Auth with AsyncStorage persistence
const auth = initializeAuth(app, {
    persistence: getReactNativePersistence(AsyncStorage)
});

// Initialize Firestore
const db = getFirestore(app);

// Initialize Storage
const storage = getStorage(app);

export { app, auth, db, storage };

