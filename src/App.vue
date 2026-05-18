<template>
  <div id="app">
    <!-- Mostrar Login si no hay usuario autenticado -->
    <LoginPantaila 
      v-if="!erabiltzailea && !kargatzen"
      @loginZuzena="handleLogin"
    />
    
    <!-- Mostrar juego si hay usuario autenticado -->
    <div v-else-if="erabiltzailea && !kargatzen" class="app-wrapper">
      <!-- Barra superior con usuario -->
      <div class="user-bar">
        <div class="user-info">
          <span class="user-icon">👤</span>
          <span class="user-name">{{ erabiltzailea.displayName || erabiltzailea.email }}</span>
        </div>
        <button class="btn-logout" @click="handleLogout">
          <span class="icon">🚪</span>
          <span>Irten</span>
        </button>
      </div>
      
      <!-- Componente del juego -->
      <SopaDeLetras :erabiltzailea="erabiltzailea" />
    </div>
    
    <!-- Pantalla de carga -->
    <div v-else class="loading-screen">
      <div class="loader"></div>
      <p>Kargatzen...</p>
    </div>
  </div>
</template>

<script>
import { ref, onMounted } from 'vue'
import SopaDeLetras from './components/SopaDeLetras.vue'
import LoginPantaila from './components/LoginPantaila.vue'
import { onAuthChanged, itxiSaioa } from './firebase/auth'

export default {
  name: 'App',
  components: {
    SopaDeLetras,
    LoginPantaila
  },
  setup() {
    const erabiltzailea = ref(null)
    const kargatzen = ref(true)

    onMounted(() => {
      // Observar cambios en autenticación
      onAuthChanged((user) => {
        erabiltzailea.value = user
        kargatzen.value = false
        
        if (user) {
          console.log('✅ Usuario autenticado:', user.email)
        } else {
          console.log('❌ No hay usuario autenticado')
        }
      })
    })

    const handleLogin = (user) => {
      erabiltzailea.value = user
      console.log('✅ Login exitoso:', user.email)
    }

    const handleLogout = async () => {
      if (confirm('¿Seguro que quieres salir?')) {
        const result = await itxiSaioa()
        if (result.success) {
          erabiltzailea.value = null
          console.log('👋 Sesión cerrada')
        }
      }
    }

    return {
      erabiltzailea,
      kargatzen,
      handleLogin,
      handleLogout
    }
  }
}
</script>

<style>
:root {
  --color-primary: #3f51b5;
  --color-primary-dark: #303f9f;
  --color-primary-light: #e8eaf6;
  --color-accent: #536dfe;
  --color-success: #4caf50;
  --color-warning: #ff9800;
  --color-danger: #f44336;
  --color-background: #f5f5f5;
  --color-text: #212121;
  --color-text-secondary: #757575;
  --color-border: #e0e0e0;
}

* {
  margin: 0;
  padding: 0;
  box-sizing: border-box;
}

body {
  font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, Oxygen, Ubuntu, Cantarell, sans-serif;
  background: var(--color-background);
  color: var(--color-text);
}

#app {
  min-height: 100vh;
}

.app-wrapper {
  min-height: 100vh;
  display: flex;
  flex-direction: column;
}

.user-bar {
  background: white;
  border-bottom: 2px solid var(--color-primary);
  padding: 0.75rem 1.5rem;
  display: flex;
  justify-content: space-between;
  align-items: center;
  box-shadow: 0 2px 4px rgba(0, 0, 0, 0.1);
  z-index: 100;
}

.user-info {
  display: flex;
  align-items: center;
  gap: 0.75rem;
  font-weight: 600;
  color: var(--color-text);
}

.user-icon {
  font-size: 1.5rem;
  background: var(--color-primary-light);
  width: 40px;
  height: 40px;
  border-radius: 50%;
  display: flex;
  align-items: center;
  justify-content: center;
}

.user-name {
  font-size: 1rem;
}

.btn-logout {
  display: flex;
  align-items: center;
  gap: 0.5rem;
  padding: 0.5rem 1rem;
  background: white;
  color: var(--color-danger);
  border: 2px solid var(--color-danger);
  border-radius: 6px;
  font-weight: 600;
  cursor: pointer;
  transition: all 0.3s;
}

.btn-logout:hover {
  background: var(--color-danger);
  color: white;
  transform: translateY(-2px);
}

.loading-screen {
  min-height: 100vh;
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  background: linear-gradient(135deg, var(--color-primary), var(--color-accent));
  color: white;
}

.loader {
  border: 4px solid rgba(255, 255, 255, 0.3);
  border-top: 4px solid white;
  border-radius: 50%;
  width: 50px;
  height: 50px;
  animation: spin 1s linear infinite;
  margin-bottom: 1rem;
}

@keyframes spin {
  0% { transform: rotate(0deg); }
  100% { transform: rotate(360deg); }
}

.loading-screen p {
  font-size: 1.2rem;
  font-weight: 600;
}

.btn {
  display: inline-flex;
  align-items: center;
  justify-content: center;
  gap: 0.5rem;
  padding: 0.75rem 1.5rem;
  border: none;
  border-radius: 8px;
  font-size: 1rem;
  font-weight: 600;
  cursor: pointer;
  transition: all 0.3s;
  font-family: inherit;
}

.btn:disabled {
  opacity: 0.6;
  cursor: not-allowed;
}

.icon {
  font-size: 1.1rem;
}

@media (max-width: 768px) {
  .user-bar {
    padding: 0.5rem 1rem;
  }
  
  .user-name {
    font-size: 0.9rem;
  }
  
  .btn-logout {
    padding: 0.4rem 0.8rem;
    font-size: 0.9rem;
  }
}
</style>
