import { initializeApp } from "firebase/app";
import { getFirestore } from "firebase/firestore";

const firebaseConfig = {
    apiKey: process.env.EXPO_PUBLIC_FIREBASE_API_KEY || "AIzaSyCn6zNZob64SMurO2n0qEcM2B8hn7cmLWM",
    authDomain: "drivebyhistory-976cd.firebaseapp.com",
    projectId: "drivebyhistory-976cd",
    storageBucket: "drivebyhistory-976cd.appspot.com",
    messagingSenderId: "537049804535",
    appId: "1:537049804535:web:0bef681df01675a9efedf2",
    measurementId: "G-K58D0E085R"
  };

const app = initializeApp(firebaseConfig);
export const db = getFirestore(app);