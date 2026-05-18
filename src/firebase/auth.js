import { 
  signInWithEmailAndPassword,
  createUserWithEmailAndPassword,
  signOut,
  onAuthStateChanged,
  updateProfile,
  signInWithPopup,
  GoogleAuthProvider
} from 'firebase/auth'
import { auth } from './config'

// Provider de Google
const googleProvider = new GoogleAuthProvider()

// Registrar nuevo usuario
export const registrarUsuario = async (email, password, displayName) => {
  try {
    const userCredential = await createUserWithEmailAndPassword(auth, email, password)
    
    // Actualizar perfil con nombre
    await updateProfile(userCredential.user, {
      displayName: displayName
    })
    
    return { success: true, user: userCredential.user }
  } catch (error) {
    return { success: false, error: getMezuEuskera(error.code) }
  }
}

// Iniciar sesión con email/password
export const hasieraSaioa = async (email, password) => {
  try {
    const userCredential = await signInWithEmailAndPassword(auth, email, password)
    return { success: true, user: userCredential.user }
  } catch (error) {
    return { success: false, error: getMezuEuskera(error.code) }
  }
}

// Iniciar sesión con Google
export const hasieraSaioaGoogle = async () => {
  try {
    const result = await signInWithPopup(auth, googleProvider)
    return { success: true, user: result.user }
  } catch (error) {
    return { success: false, error: getMezuEuskera(error.code) }
  }
}

// Cerrar sesión
export const itxiSaioa = async () => {
  try {
    await signOut(auth)
    return { success: true }
  } catch (error) {
    return { success: false, error: error.message }
  }
}

// Observar cambios en autenticación
export const onAuthChanged = (callback) => {
  return onAuthStateChanged(auth, callback)
}

// Obtener usuario actual
export const getErabiltzaileOraingoa = () => {
  return auth.currentUser
}

// Mensajes de error en euskera
function getMezuEuskera(errorCode) {
  const mezuak = {
    'auth/email-already-in-use': 'Email hau erabilita dago jada',
    'auth/invalid-email': 'Email helbidea ez da baliozkoa',
    'auth/operation-not-allowed': 'Eragiketa ez dago gaituta',
    'auth/weak-password': 'Pasahitza ahula da (gutxienez 6 karaktere)',
    'auth/user-disabled': 'Erabiltzailea desgaituta dago',
    'auth/user-not-found': 'Ez da erabiltzailerik aurkitu',
    'auth/wrong-password': 'Pasahitz okerra',
    'auth/too-many-requests': 'Saiakera gehiegi. Mesedez, itxaron pixka bat',
    'auth/network-request-failed': 'Sareko errorea. Egiaztatu konexioa',
    'auth/popup-closed-by-user': 'Login leihoa itxi da',
    'auth/cancelled-popup-request': 'Login leihoa bertan behera utzi da'
  }
  
  return mezuak[errorCode] || 'Errore bat gertatu da'
}
