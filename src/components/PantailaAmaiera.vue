<template>
  <div class="pantaila-amaiera" v-if="erakutsi">
    <div class="amaiera-content">
      <div class="amaiera-header">
        <h1>🎉 Zorionak!</h1>
        <p>Hitz guztiak aurkitu dituzu!</p>
      </div>
      
      <div class="denbora-info">
        <div class="denbora-label">Zure denbora:</div>
        <div class="denbora-value">{{denboraFormateada}}</div>
        <div v-if="recordBerria" class="record-berria">
          ⭐ RECORD BERRIA! ⭐
        </div>
        <div v-else-if="posizio" class="posizio-info">
          Zure posizioa: #{{posizio}}
        </div>
      </div>

      <div v-if="gordetzen" class="alert alert-info">
        💾 Recorda gordetzen Firebase-n...
      </div>

      <div v-if="errorea" class="alert alert-error">
        ⚠️ {{ errorea }}
      </div>

      <div v-if="gordeta" class="alert alert-success">
        ✅ Recorda gorde da!
      </div>

      <div class="botoiak">
        <button class="btn btn-joko-berria" @click="$emit('jokoaHasi')">
          <span class="icon">🔄</span>
          <span>Joko Berria</span>
        </button>
        <button class="btn btn-recordak" @click="erakutsiRecordak = !erakutsiRecordak">
          <span class="icon">🏆</span>
          <span>Recordak Ikusi</span>
        </button>
      </div>

      <div v-if="erakutsiRecordak" class="recordak-taula">
        <h3>🏆 Nire Recordak - {{tamaina}}x{{tamaina}}</h3>
        <div v-if="!recordakKargatzen && nireRecordak.length === 0" class="ez-dago-recordik">
          <p>Ez dago recordik oraindik.</p>
        </div>
        <div v-else-if="recordakKargatzen" class="loading">
          <div class="loader-small"></div>
          <p>Kargatzen...</p>
        </div>
        <div v-else class="taula-edukia">
          <div v-for="(record, idx) in nireRecordak" :key="idx" 
               class="record-ilara"
               :class="{'record-berriki': idx === 0 && gordeta}">
            <span class="posizio">#{{idx + 1}}</span>
            <span class="denbora">{{formatearDenbora(record.segundoak)}}</span>
            <span class="data">{{formatearData(record.data)}}</span>
          </div>
        </div>
      </div>
    </div>
  </div>
</template>

<script>
import { ref, watch } from 'vue'
import { gordeRecorda, lortuErabiltzaileRecordak } from '../firebase/firestore'

export default {
  name: 'PantailaAmaiera',
  props: {
    erakutsi: { type: Boolean, default: false },
    denbora: { type: Number, default: 0 },
    tamaina: { type: Number, default: 12 },
    erabiltzailea: { type: Object, required: true }
  },
  emits: ['jokoaHasi'],
  setup(props) {
    const erakutsiRecordak = ref(false)
    const recordBerria = ref(false)
    const posizio = ref(null)
    const gordetzen = ref(false)
    const gordeta = ref(false)
    const errorea = ref('')
    const nireRecordak = ref([])
    const recordakKargatzen = ref(false)

    const formatearDenbora = (seg) => {
      const s = seg % 60
      const m = Math.floor((seg - s) / 60) % 60
      const h = Math.floor((seg - (m * 60) - s) / 3600)
      return `${h.toString().padStart(2, '0')}:${m.toString().padStart(2, '0')}:${s.toString().padStart(2, '0')}`
    }

    const formatearData = (data) => {
      if (!data) return ''
      const d = data instanceof Date ? data : new Date(data)
      return `${d.getDate()}/${d.getMonth() + 1}/${d.getFullYear()}`
    }

    const cargarRecords = async () => {
      if (!props.erabiltzailea) return
      
      recordakKargatzen.value = true
      const result = await lortuErabiltzaileRecordak(props.erabiltzailea.uid, props.tamaina)
      
      if (result.success) {
        nireRecordak.value = result.recordak
      }
      recordakKargatzen.value = false
    }

    const guardarRecord = async () => {
      if (!props.erabiltzailea || gordetzen.value || gordeta.value) return
      
      gordetzen.value = true
      errorea.value = ''
      
      const segundoak = Math.floor(props.denbora / 1000)
      const userName = props.erabiltzailea.displayName || props.erabiltzailea.email
      
      const result = await gordeRecorda(
        props.erabiltzailea.uid,
        userName,
        props.tamaina,
        segundoak
      )
      
      gordetzen.value = false
      
      if (result.success) {
        gordeta.value = true
        await cargarRecords()
        
        // Verificar si es record
        if (nireRecordak.value.length > 0 && nireRecordak.value[0].segundoak === segundoak) {
          recordBerria.value = true
        }
      } else {
        errorea.value = result.error || 'Errorea gordetzean'
      }
    }

    // Guardar automáticamente cuando se muestra la pantalla
    watch(() => props.erakutsi, async (berria) => {
      if (berria) {
        gordeta.value = false
        recordBerria.value = false
        errorea.value = ''
        await cargarRecords()
        await guardarRecord()
      }
    })

    return {
      erakutsiRecordak,
      recordBerria,
      posizio,
      gordetzen,
      gordeta,
      errorea,
      nireRecordak,
      recordakKargatzen,
      formatearDenbora,
      formatearData,
      denboraFormateada: formatearDenbora(Math.floor(props.denbora / 1000))
    }
  }
}
</script>

<style scoped>
.pantaila-amaiera{
  position:fixed;
  top:0;left:0;right:0;bottom:0;
  background:rgba(0,0,0,0.8);
  display:flex;
  align-items:center;
  justify-content:center;
  padding:2rem;
  z-index:2000;
  animation:fadeIn 0.3s;
}
.amaiera-content{
  background:white;
  border-radius:16px;
  max-width:600px;
  width:100%;
  max-height:90vh;
  overflow-y:auto;
  box-shadow:0 20px 60px rgba(0,0,0,0.5);
  animation:slideUp 0.4s;
}
.amaiera-header{
  background:linear-gradient(135deg,var(--color-primary),var(--color-accent));
  color:white;
  padding:2rem;
  text-align:center;
  border-radius:16px 16px 0 0;
}
.amaiera-header h1{
  margin:0 0 0.5rem 0;
  font-size:2.5rem;
}
.amaiera-header p{
  margin:0;
  font-size:1.1rem;
  opacity:0.9;
}
.denbora-info{
  padding:2rem;
  text-align:center;
  border-bottom:2px solid var(--color-border);
}
.denbora-label{
  font-size:1rem;
  color:var(--color-text-secondary);
  margin-bottom:0.5rem;
}
.denbora-value{
  font-size:3rem;
  font-weight:700;
  color:var(--color-primary);
  font-family:monospace;
}
.record-berria{
  margin-top:1rem;
  padding:0.75rem;
  background:linear-gradient(135deg,#ffd700,#ffed4e);
  color:#000;
  font-weight:700;
  border-radius:8px;
  font-size:1.2rem;
  animation:pulse 1s infinite;
}
@keyframes pulse{
  0%,100%{transform:scale(1)}
  50%{transform:scale(1.05)}
}
.posizio-info{
  margin-top:1rem;
  font-size:1.1rem;
  color:var(--color-accent);
  font-weight:600;
}
.alert{
  margin:1rem 2rem;
  padding:0.875rem;
  border-radius:8px;
  font-size:0.9rem;
  font-weight:600;
}
.alert-info{
  background:#e3f2fd;
  color:#1976d2;
  border:1px solid #64b5f6;
}
.alert-error{
  background:#ffebee;
  color:#c62828;
  border:1px solid #ef5350;
}
.alert-success{
  background:#e8f5e9;
  color:#2e7d32;
  border:1px solid#66bb6a;
}
.botoiak{
  padding:2rem;
  display:flex;
  gap:1rem;
  flex-wrap:wrap;
  border-bottom:2px solid var(--color-border);
}
.botoiak .btn{
  flex:1;
  min-width:150px;
}
.btn-joko-berria{
  background:var(--color-accent);
  color:white;
}
.btn-recordak{
  background:var(--color-warning);
  color:white;
}
.recordak-taula{
  padding:2rem;
  background:var(--color-background);
}
.recordak-taula h3{
  margin:0 0 1rem 0;
  text-align:center;
  color:var(--color-primary);
}
.ez-dago-recordik{
  text-align:center;
  padding:2rem;
  color:var(--color-text-secondary);
}
.loading{
  text-align:center;
  padding:2rem;
}
.loader-small{
  border:3px solid var(--color-border);
  border-top:3px solid var(--color-primary);
  border-radius:50%;
  width:40px;
  height:40px;
  animation:spin 1s linear infinite;
  margin:0 auto 1rem auto;
}
@keyframes spin{
  0%{transform:rotate(0deg)}
  100%{transform:rotate(360deg)}
}
.taula-edukia{
  background:white;
  border-radius:8px;
  overflow:hidden;
}
.record-ilara{
  display:grid;
  grid-template-columns:60px 1fr auto;
  gap:1rem;
  padding:1rem;
  border-bottom:1px solid var(--color-border);
  transition:background 0.3s;
}
.record-ilara:hover{
  background:var(--color-background);
}
.record-ilara:last-child{
  border-bottom:none;
}
.record-berriki{
  background:var(--color-primary-light);
  font-weight:700;
}
.posizio{
  font-weight:700;
  color:var(--color-primary);
}
.denbora{
  font-family:monospace;
  font-weight:600;
  color:var(--color-accent);
  font-size:1.1rem;
}
.data{
  font-size:0.85rem;
  color:var(--color-text-secondary);
}
@keyframes fadeIn{from{opacity:0}to{opacity:1}}
@keyframes slideUp{from{transform:translateY(50px);opacity:0}to{transform:translateY(0);opacity:1}}
@media (max-width:768px){
  .botoiak{flex-direction:column}
  .botoiak .btn{width:100%}
}
</style>
