// 🔥 CONFIGURACIÓN FIREBASE
// Reemplaza estos valores con los de tu proyecto Firebase

import { initializeApp } from 'firebase/app'
import { getAuth } from 'firebase/auth'
import { getFirestore } from 'firebase/firestore'

// TODO: Reemplazar con tu configuración real de Firebase
const firebaseConfig = {
  apiKey: "AIzaSyB4emFyKXpO5Kd10Tz39_d6g8vEYaLiK7Y",
  authDomain: "sopa-letrak.firebaseapp.com",
  projectId: "sopa-letrak",
  storageBucket: "sopa-letrak.firebasestorage.app",
  messagingSenderId: "24145549693",
  appId: "1:24145549693:web:f2c02b5676be797f7bd414",
  measurementId: "G-LJ2SCYPWKE"
}

// Inicializar Firebase
const app = initializeApp(firebaseConfig)

// Servicios
export const auth = getAuth(app)
export const db = getFirestore(app)

export default app
