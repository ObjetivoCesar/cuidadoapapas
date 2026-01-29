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
