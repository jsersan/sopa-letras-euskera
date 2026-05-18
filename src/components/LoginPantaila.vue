<template>
  <div class="login-pantaila">
    <div class="login-content">
      <div class="login-header">
        <h1>🎮 Hitz-Zopa Euskeraz</h1>
        <p>Hasi saioa zure recordak gordetzeko</p>
      </div>

      <div class="login-tabs">
        <button 
          class="tab" 
          :class="{active: mota === 'login'}"
          @click="mota = 'login'"
        >
          Sartu
        </button>
        <button 
          class="tab" 
          :class="{active: mota === 'register'}"
          @click="mota = 'register'"
        >
          Erregistratu
        </button>
      </div>

      <div v-if="errorea" class="alert alert-error">
        {{ errorea }}
      </div>

      <form @submit.prevent="submit" class="login-form">
        <div v-if="mota === 'register'" class="form-group">
          <label>Izena:</label>
          <input 
            v-model="izena"
            type="text"
            placeholder="Zure izena..."
            required
          />
        </div>

        <div class="form-group">
          <label>Email:</label>
          <input 
            v-model="email"
            type="email"
            placeholder="tuemail@example.com"
            required
          />
        </div>

        <div class="form-group">
          <label>Pasahitza:</label>
          <input 
            v-model="pasahitza"
            type="password"
            placeholder="••••••••"
            required
            minlength="6"
          />
        </div>

        <button type="submit" class="btn btn-primary" :disabled="kargatzen">
          <span v-if="!kargatzen">
            {{ mota === 'login' ? '🔑 Sartu' : '✨ Erregistratu' }}
          </span>
          <span v-else>
            ⏳ Itxaron...
          </span>
        </button>
      </form>

      <div class="divider">
        <span>edo</span>
      </div>

      <button @click="googleLogin" class="btn btn-google" :disabled="kargatzen">
        <svg xmlns="http://www.w3.org/2000/svg" width="18" height="18" viewBox="0 0 48 48">
          <path fill="#FFC107" d="M43.611,20.083H42V20H24v8h11.303c-1.649,4.657-6.08,8-11.303,8c-6.627,0-12-5.373-12-12c0-6.627,5.373-12,12-12c3.059,0,5.842,1.154,7.961,3.039l5.657-5.657C34.046,6.053,29.268,4,24,4C12.955,4,4,12.955,4,24c0,11.045,8.955,20,20,20c11.045,0,20-8.955,20-20C44,22.659,43.862,21.35,43.611,20.083z"/>
          <path fill="#FF3D00" d="M6.306,14.691l6.571,4.819C14.655,15.108,18.961,12,24,12c3.059,0,5.842,1.154,7.961,3.039l5.657-5.657C34.046,6.053,29.268,4,24,4C16.318,4,9.656,8.337,6.306,14.691z"/>
          <path fill="#4CAF50" d="M24,44c5.166,0,9.86-1.977,13.409-5.192l-6.19-5.238C29.211,35.091,26.715,36,24,36c-5.202,0-9.619-3.317-11.283-7.946l-6.522,5.025C9.505,39.556,16.227,44,24,44z"/>
          <path fill="#1976D2" d="M43.611,20.083H42V20H24v8h11.303c-0.792,2.237-2.231,4.166-4.087,5.571c0.001-0.001,0.002-0.001,0.003-0.002l6.19,5.238C36.971,39.205,44,34,44,24C44,22.659,43.862,21.35,43.611,20.083z"/>
        </svg>
        <span>Google-rekin sartu</span>
      </button>

      <div class="login-footer">
        <p>Zure recordak seguru gordeko dira Firebase-n</p>
      </div>
    </div>
  </div>
</template>

<script>
import { ref } from 'vue'
import { hasieraSaioa, registrarUsuario, hasieraSaioaGoogle } from '../firebase/auth'
import { sortuErabiltzaileaPerfila } from '../firebase/firestore'

export default {
  name: 'LoginPantaila',
  emits: ['loginZuzena'],
  setup(props, { emit }) {
    const mota = ref('login')
    const izena = ref('')
    const email = ref('')
    const pasahitza = ref('')
    const errorea = ref('')
    const kargatzen = ref(false)

    const submit = async () => {
      errorea.value = ''
      kargatzen.value = true

      try {
        let result

        if (mota.value === 'register') {
          // Registrar nuevo usuario
          result = await registrarUsuario(email.value, pasahitza.value, izena.value)
          
          if (result.success) {
            // Crear perfil en Firestore
            await sortuErabiltzaileaPerfila(result.user.uid, {
              displayName: izena.value,
              email: email.value
            })
          }
        } else {
          // Login
          result = await hasieraSaioa(email.value, pasahitza.value)
        }

        if (result.success) {
          emit('loginZuzena', result.user)
        } else {
          errorea.value = result.error
        }
      } catch (error) {
        errorea.value = 'Errore bat gertatu da'
        console.error(error)
      } finally {
        kargatzen.value = false
      }
    }

    const googleLogin = async () => {
      errorea.value = ''
      kargatzen.value = true

      try {
        const result = await hasieraSaioaGoogle()

        if (result.success) {
          // Crear/actualizar perfil
          await sortuErabiltzaileaPerfila(result.user.uid, {
            displayName: result.user.displayName,
            email: result.user.email
          })
          
          emit('loginZuzena', result.user)
        } else {
          errorea.value = result.error
        }
      } catch (error) {
        errorea.value = 'Errore bat gertatu da Google-rekin'
        console.error(error)
      } finally {
        kargatzen.value = false
      }
    }

    return {
      mota,
      izena,
      email,
      pasahitza,
      errorea,
      kargatzen,
      submit,
      googleLogin
    }
  }
}
</script>

<style scoped>
.login-pantaila {
  min-height: 100vh;
  display: flex;
  align-items: center;
  justify-content: center;
  background: linear-gradient(135deg, var(--color-primary), var(--color-accent));
  padding: 2rem;
}

.login-content {
  background: white;
  border-radius: 16px;
  box-shadow: 0 20px 60px rgba(0, 0, 0, 0.3);
  max-width: 450px;
  width: 100%;
  overflow: hidden;
  animation: slideUp 0.5s ease;
}

@keyframes slideUp {
  from { opacity: 0; transform: translateY(30px); }
  to { opacity: 1; transform: translateY(0); }
}

.login-header {
  background: linear-gradient(135deg, var(--color-primary), var(--color-accent));
  color: white;
  padding: 2.5rem 2rem;
  text-align: center;
}

.login-header h1 {
  margin: 0 0 0.5rem 0;
  font-size: 2rem;
}

.login-header p {
  margin: 0;
  opacity: 0.9;
  font-size: 0.95rem;
}

.login-tabs {
  display: grid;
  grid-template-columns: 1fr 1fr;
  border-bottom: 2px solid var(--color-border);
}

.tab {
  padding: 1rem;
  border: none;
  background: white;
  color: var(--color-text-secondary);
  font-weight: 600;
  cursor: pointer;
  transition: all 0.3s;
  border-bottom: 3px solid transparent;
}

.tab:hover {
  background: var(--color-background);
}

.tab.active {
  color: var(--color-primary);
  border-bottom-color: var(--color-primary);
  background: white;
}

.login-form {
  padding: 2rem;
}

.form-group {
  margin-bottom: 1.5rem;
}

.form-group label {
  display: block;
  margin-bottom: 0.5rem;
  font-weight: 600;
  color: var(--color-text);
}

.form-group input {
  width: 100%;
  padding: 0.75rem;
  border: 2px solid var(--color-border);
  border-radius: 8px;
  font-size: 1rem;
  transition: border-color 0.3s;
}

.form-group input:focus {
  outline: none;
  border-color: var(--color-primary);
}

.btn-primary {
  width: 100%;
  background: var(--color-primary);
  color: white;
  padding: 1rem;
  border: none;
  border-radius: 8px;
  font-size: 1.1rem;
  font-weight: 600;
  cursor: pointer;
  transition: all 0.3s;
}

.btn-primary:hover:not(:disabled) {
  background: var(--color-primary-dark);
  transform: translateY(-2px);
  box-shadow: 0 4px 12px rgba(63, 81, 181, 0.3);
}

.btn-primary:disabled {
  opacity: 0.6;
  cursor: not-allowed;
}

.divider {
  display: flex;
  align-items: center;
  padding: 0 2rem 1rem 2rem;
  color: var(--color-text-secondary);
}

.divider::before,
.divider::after {
  content: '';
  flex: 1;
  height: 1px;
  background: var(--color-border);
}

.divider span {
  padding: 0 1rem;
  font-size: 0.9rem;
}

.btn-google {
  width: calc(100% - 4rem);
  margin: 0 2rem 2rem 2rem;
  background: white;
  color: var(--color-text);
  padding: 0.875rem;
  border: 2px solid var(--color-border);
  border-radius: 8px;
  font-size: 1rem;
  font-weight: 600;
  cursor: pointer;
  transition: all 0.3s;
  display: flex;
  align-items: center;
  justify-content: center;
  gap: 0.75rem;
}

.btn-google:hover:not(:disabled) {
  background: var(--color-background);
  border-color: var(--color-primary);
  transform: translateY(-2px);
}

.btn-google:disabled {
  opacity: 0.6;
  cursor: not-allowed;
}

.login-footer {
  background: var(--color-background);
  padding: 1rem 2rem;
  text-align: center;
  border-top: 1px solid var(--color-border);
}

.login-footer p {
  margin: 0;
  font-size: 0.85rem;
  color: var(--color-text-secondary);
}

.alert {
  margin: 0 2rem 1rem 2rem;
  padding: 0.875rem;
  border-radius: 8px;
  font-size: 0.9rem;
}

.alert-error {
  background: #ffebee;
  color: #c62828;
  border: 1px solid #ef5350;
}
</style>
