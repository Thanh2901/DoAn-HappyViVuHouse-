import { initializeApp } from "firebase/app";
import { getAuth } from "firebase/auth";
import { getStorage } from "firebase/storage";
import { getFirestore } from "firebase/firestore";

const firebaseConfig = {
  apiKey: "AIzaSyCwvcuAbr8R3zQHXD6u-C_iKwKYZBM9frs",
  authDomain: "chat-575d2.firebaseapp.com",
  projectId: "chat-575d2",
  storageBucket: "chat-575d2.appspot.com",
  messagingSenderId: "630974775085",
  appId: "1:630974775085:web:f45b1d56a7c29526029da4"
};

// Initialize Firebase
export const app = initializeApp(firebaseConfig);
export const auth = getAuth();
export const storage = getStorage();
export const db = getFirestore()
