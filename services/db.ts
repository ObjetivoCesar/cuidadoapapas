import { VitalRecord, MedicineRecord, Patient } from '../types';

const VITALS_KEY = 'cuidapadres_vitals_v3';
const MEDICINE_KEY = 'cuidapadres_medicine_v3';

// TODO: Remplazar estas constantes con las credenciales reales que me pases
const SUPABASE_URL = 'https://fxjmgpoonjjduwkwoian.supabase.co';
const SUPABASE_KEY = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImZ4am1ncG9vbmpqZHV3a3dvaWFuIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NjU4NDYwMzEsImV4cCI6MjA4MTQyMjAzMX0.d-hQ7kFtFqLdU3VehfF3qdjNTC-3RQ48j22rCED4CUk';

export const dbService = {
  syncRemote: async (table: string, data: any) => {
    if (!SUPABASE_URL || !SUPABASE_KEY) return false;

    // Convert camelCase to snake_case for DB
    const dbData = table === 'vital_records' ? {
      id: data.id,
      patient: data.patient,
      nurse_name: data.nurseName,
      ta_sys: data.taSys ?? null,
      ta_dia: data.taDia ?? null,
      fc: data.fc,
      fr: data.fr,
      spo2: data.spo2,
      timestamp: data.timestamp
    } : {
      id: data.id,
      patient: data.patient,
      nurse_name: data.nurseName,
      medicine_name: data.medicineName,
      dose: data.dose,
      timestamp: data.timestamp
    };

    try {
      const response = await fetch(`${SUPABASE_URL}/rest/v1/${table}`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'apikey': SUPABASE_KEY,
          'Authorization': `Bearer ${SUPABASE_KEY}`,
          'Prefer': 'return=representation'
        },
        body: JSON.stringify(dbData)
      });

      if (!response.ok) {
        const errorData = await response.json();
        console.error(`Error Supabase (${table}):`, errorData);
      }

      return response.ok;
    } catch (e) {
      console.error(`Error de red al sincronizar ${table}:`, e);
      return false;
    }
  },

  fetchRemote: async (table: string): Promise<any[]> => {
    if (!SUPABASE_URL || !SUPABASE_KEY) return [];
    try {
      const response = await fetch(`${SUPABASE_URL}/rest/v1/${table}?select=*`, {
        method: 'GET',
        headers: {
          'apikey': SUPABASE_KEY,
          'Authorization': `Bearer ${SUPABASE_KEY}`
        }
      });

      if (!response.ok) throw new Error(`Fetch error: ${response.statusText}`);
      const data = await response.json();

      // Convert snake_case back to camelCase
      return data.map((item: any) => {
        if (table === 'vital_records') {
          return {
            id: item.id,
            patient: item.patient,
            nurseName: item.nurse_name,
            taSys: item.ta_sys,
            taDia: item.ta_dia,
            fc: item.fc,
            fr: item.fr,
            spo2: item.spo2,
            timestamp: item.timestamp,
            synced: true
          };
        } else {
          return {
            id: item.id,
            patient: item.patient,
            nurseName: item.nurse_name,
            medicineName: item.medicine_name,
            dose: item.dose,
            timestamp: item.timestamp,
            synced: true
          };
        }
      });
    } catch (e) {
      console.error(`Error al descargar ${table}:`, e);
      return [];
    }
  },

  syncFromRemote: async () => {
    console.log('🔄 Iniciando sincronización completa...');
    const remoteVitals = await dbService.fetchRemote('vital_records');
    const remoteMedicines = await dbService.fetchRemote('medicine_records');

    if (remoteVitals.length > 0) {
      // Combinar con locales, evitando duplicados por ID
      const localVitals = await dbService.getAllVitals();
      const combinedVitals = [...remoteVitals];

      localVitals.forEach(local => {
        if (!combinedVitals.find(remote => remote.id === local.id)) {
          combinedVitals.push(local);
        }
      });

      combinedVitals.sort((a, b) => b.timestamp - a.timestamp);
      localStorage.setItem(VITALS_KEY, JSON.stringify(combinedVitals));
    }

    if (remoteMedicines.length > 0) {
      const localMedicines = await dbService.getAllMedicines();
      const combinedMedicines = [...remoteMedicines];

      localMedicines.forEach(local => {
        if (!combinedMedicines.find(remote => remote.id === local.id)) {
          combinedMedicines.push(local);
        }
      });

      combinedMedicines.sort((a, b) => b.timestamp - a.timestamp);
      localStorage.setItem(MEDICINE_KEY, JSON.stringify(combinedMedicines));
    }
    console.log('✅ Sincronización terminada.');
  },

  saveVitalRecord: async (record: Omit<VitalRecord, 'id' | 'timestamp'>): Promise<VitalRecord> => {
    const newRecord: VitalRecord = {
      ...record,
      id: Math.random().toString(36).substr(2, 9),
      timestamp: Date.now(),
      synced: false
    };

    const all = [newRecord, ...await dbService.getAllVitals()];
    localStorage.setItem(VITALS_KEY, JSON.stringify(all));

    const isSynced = await dbService.syncRemote('vital_records', newRecord);
    if (isSynced) {
      newRecord.synced = true;
      const updated = all.map(r => r.id === newRecord.id ? { ...r, synced: true } : r);
      localStorage.setItem(VITALS_KEY, JSON.stringify(updated));
    }
    return newRecord;
  },

  saveMedicineRecord: async (record: Omit<MedicineRecord, 'id' | 'timestamp'>): Promise<MedicineRecord> => {
    const newRecord: MedicineRecord = {
      ...record,
      id: Math.random().toString(36).substr(2, 9),
      timestamp: Date.now(),
      synced: false
    };

    const all = [newRecord, ...await dbService.getAllMedicines()];
    localStorage.setItem(MEDICINE_KEY, JSON.stringify(all));

    const isSynced = await dbService.syncRemote('medicine_records', newRecord);
    if (isSynced) {
      newRecord.synced = true;
      const updated = all.map(r => r.id === newRecord.id ? { ...r, synced: true } : r);
      localStorage.setItem(MEDICINE_KEY, JSON.stringify(updated));
    }
    return newRecord;
  },

  getAllVitals: async (): Promise<VitalRecord[]> => {
    const data = localStorage.getItem(VITALS_KEY);
    return data ? JSON.parse(data) : [];
  },

  getAllMedicines: async (): Promise<MedicineRecord[]> => {
    const data = localStorage.getItem(MEDICINE_KEY);
    return data ? JSON.parse(data) : [];
  },

  getVitalsByPatient: async (patient: Patient): Promise<VitalRecord[]> => {
    const all = await dbService.getAllVitals();
    return all.filter(r => r.patient === patient).sort((a, b) => b.timestamp - a.timestamp);
  }
};
