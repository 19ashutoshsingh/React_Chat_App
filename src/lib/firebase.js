import { initializeApp } from "firebase/app";
import { getAuth } from "firebase/auth";
import { getFirestore } from "firebase/firestore";
import { getStorage } from "firebase/storage";

const firebaseConfig = {
  apiKey: import.meta.env.VITE_API_KEY,
  authDomain: "reactchat-4965e.firebaseapp.com",
  projectId: "reactchat-4965e",
  storageBucket: "reactchat-4965e.appspot.com",
  messagingSenderId: "1080771899920",
  appId: "1:1080771899920:web:c82de4c0b7a51df979d095"
};

const app = initializeApp(firebaseConfig);

export const auth = getAuth()
export const db = getFirestore()
export const storage = getStorage()