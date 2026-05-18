import { 
  collection,
  doc,
  setDoc,
  getDoc,
  getDocs,
  query,
  where,
  orderBy,
  limit,
  addDoc,
  updateDoc,
  serverTimestamp,
  Timestamp
} from 'firebase/firestore'
import { db } from './config'

// ==================== USUARIOS ====================

// Crear o actualizar perfil de usuario
export const sortuErabiltzaileaPerfila = async (userId, userData) => {
  try {
    const userRef = doc(db, 'users', userId)
    await setDoc(userRef, {
      ...userData,
      createdAt: serverTimestamp(),
      totalGames: 0,
      bestTime: null
    }, { merge: true })
    
    return { success: true }
  } catch (error) {
    console.error('Error sortzean erabiltzailea:', error)
    return { success: false, error: error.message }
  }
}

// Obtener perfil de usuario
export const lortuErabiltzaileaPerfila = async (userId) => {
  try {
    const userRef = doc(db, 'users', userId)
    const userSnap = await getDoc(userRef)
    
    if (userSnap.exists()) {
      return { success: true, data: userSnap.data() }
    } else {
      return { success: false, error: 'Ez da erabiltzailea aurkitu' }
    }
  } catch (error) {
    console.error('Error lortzean erabiltzailea:', error)
    return { success: false, error: error.message }
  }
}

// ==================== RECORDS ====================

// Guardar nuevo record
export const gordeRecorda = async (userId, userName, tamaina, segundoak) => {
  try {
    const recordRef = collection(db, 'records')
    const recordData = {
      userId,
      userName,
      tamaina,
      segundoak,
      data: serverTimestamp()
    }
    
    await addDoc(recordRef, recordData)
    
    // Actualizar estadísticas del usuario
    await eguneratuErabiltzaileaEstadistikak(userId, segundoak)
    
    // Actualizar ranking global
    await eguneratuRankingGlobala(tamaina, userId, userName, segundoak)
    
    return { success: true }
  } catch (error) {
    console.error('Error gordetzean recorda:', error)
    return { success: false, error: error.message }
  }
}

// Obtener records del usuario por tamaño
export const lortuErabiltzaileRecordak = async (userId, tamaina) => {
  try {
    const recordsRef = collection(db, 'records')
    const q = query(
      recordsRef,
      where('userId', '==', userId),
      where('tamaina', '==', tamaina),
      orderBy('segundoak', 'asc'),
      limit(10)
    )
    
    const querySnapshot = await getDocs(q)
    const recordak = []
    
    querySnapshot.forEach((doc) => {
      const data = doc.data()
      recordak.push({
        id: doc.id,
        ...data,
        data: data.data?.toDate() || new Date()
      })
    })
    
    return { success: true, recordak }
  } catch (error) {
    console.error('Error lortzean recordak:', error)
    return { success: false, error: error.message, recordak: [] }
  }
}

// Obtener todos los records del usuario
export const lortuErabiltzaileRecordakGuztiak = async (userId) => {
  try {
    const recordsRef = collection(db, 'records')
    const q = query(
      recordsRef,
      where('userId', '==', userId),
      orderBy('data', 'desc')
    )
    
    const querySnapshot = await getDocs(q)
    const recordak = []
    
    querySnapshot.forEach((doc) => {
      const data = doc.data()
      recordak.push({
        id: doc.id,
        ...data,
        data: data.data?.toDate() || new Date()
      })
    })
    
    return { success: true, recordak }
  } catch (error) {
    console.error('Error lortzean recordak guztiak:', error)
    return { success: false, error: error.message, recordak: [] }
  }
}

// ==================== RANKINGS GLOBALES ====================

// Obtener ranking global por tamaño
export const lortuRankingGlobala = async (tamaina) => {
  try {
    const rankingRef = doc(db, 'rankings', tamaina.toString())
    const rankingSnap = await getDoc(rankingRef)
    
    if (rankingSnap.exists()) {
      return { success: true, ranking: rankingSnap.data().top10 || [] }
    } else {
      return { success: true, ranking: [] }
    }
  } catch (error) {
    console.error('Error lortzean ranking globala:', error)
    return { success: false, error: error.message, ranking: [] }
  }
}

// Actualizar ranking global
async function eguneratuRankingGlobala(tamaina, userId, userName, segundoak) {
  try {
    const rankingRef = doc(db, 'rankings', tamaina.toString())
    const rankingSnap = await getDoc(rankingRef)
    
    let top10 = []
    
    if (rankingSnap.exists()) {
      top10 = rankingSnap.data().top10 || []
    }
    
    // Buscar si el usuario ya está en el ranking
    const userIndex = top10.findIndex(r => r.userId === userId)
    
    if (userIndex !== -1) {
      // Actualizar si es mejor tiempo
      if (segundoak < top10[userIndex].segundoak) {
        top10[userIndex].segundoak = segundoak
        top10[userIndex].userName = userName
      }
    } else {
      // Añadir nuevo record
      top10.push({ userId, userName, segundoak })
    }
    
    // Ordenar y mantener solo top 10
    top10.sort((a, b) => a.segundoak - b.segundoak)
    top10 = top10.slice(0, 10)
    
    // Guardar
    await setDoc(rankingRef, {
      top10,
      lastUpdate: serverTimestamp()
    })
    
  } catch (error) {
    console.error('Error eguneratzen ranking globala:', error)
  }
}

// Actualizar estadísticas del usuario
async function eguneratuErabiltzaileaEstadistikak(userId, segundoak) {
  try {
    const userRef = doc(db, 'users', userId)
    const userSnap = await getDoc(userRef)
    
    if (userSnap.exists()) {
      const userData = userSnap.data()
      const updates = {
        totalGames: (userData.totalGames || 0) + 1
      }
      
      // Actualizar mejor tiempo si es mejor
      if (!userData.bestTime || segundoak < userData.bestTime) {
        updates.bestTime = segundoak
      }
      
      await updateDoc(userRef, updates)
    }
  } catch (error) {
    console.error('Error eguneratzen estadistikak:', error)
  }
}

export default {
  sortuErabiltzaileaPerfila,
  lortuErabiltzaileaPerfila,
  gordeRecorda,
  lortuErabiltzaileRecordak,
  lortuErabiltzaileRecordakGuztiak,
  lortuRankingGlobala
}
