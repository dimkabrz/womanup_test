import { initializeApp } from "firebase/app";
import { getStorage } from "firebase/storage";

const firebaseConfig = {
  apiKey: "AIzaSyAR9OqcMi8NIVstKbP_p7IrXJG9AZZn1fs",
  authDomain: "womanup-9b548.firebaseapp.com",
  projectId: "womanup-9b548",
  storageBucket: "womanup-9b548.appspot.com",
  messagingSenderId: "974882762777",
  appId: "1:974882762777:web:40f5e1c19d7c520bd97a88",
  measurementId: "G-C5M5YJ9NRN",
};
const app = initializeApp(firebaseConfig);

export const storage = getStorage(app);
