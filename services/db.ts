import { VitalRecord, MedicineRecord, Patient, NurseReport } from '../types';

const VITALS_KEY = 'cuidapadres_vitals_v3';
const MEDICINE_KEY = 'cuidapadres_medicine_v3';
const REPORTS_KEY = 'cuidapadres_reports_v3';

const SUPABASE_URL = import.meta.env.VITE_SUPABASE_URL || 'https://fxjmgpoonjjduwkwoian.supabase.co';
const SUPABASE_KEY = import.meta.env.VITE_SUPABASE_KEY || 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImZ4am1ncG9vbmpqZHV3a3dvaWFuIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NjU4NDYwMzEsImV4cCI6MjA4MTQyMjAzMX0.d-hQ7kFtFqLdU3VehfF3qdjNTC-3RQ48j22rCED4CUk';

// Helper para generar UUIDs seguros
const generateId = () => {
  try {
    return self.crypto.randomUUID();
  } catch (e) {
    return Math.random().toString(36).substring(2, 15) + Math.random().toString(36).substring(2, 15);
  }
};

export const dbService = {
  syncRemote: async (table: string, data: any) => {
    if (!SUPABASE_URL || !SUPABASE_KEY) return false;

    let dbData: any;
    if (table === 'vital_records') {
      dbData = {
        id: data.id,
        patient: data.patient,
        nurse_name: data.nurseName,
        ta_sys: data.taSys ?? null,
        ta_dia: data.taDia ?? null,
        fc: data.fc,
        fr: data.fr,
        spo2: data.spo2,
        timestamp: data.timestamp
      };
    } else if (table === 'medicine_records') {
      dbData = {
        id: data.id,
        patient: data.patient,
        nurse_name: data.nurseName,
        medicine_name: data.medicineName,
        dose: data.dose,
        timestamp: data.timestamp
      };
    } else if (table === 'nurse_reports') {
      dbData = {
        id: data.id,
        patient: data.patient,
        nurse_name: data.nurseName,
        content: data.content,
        observations: data.observations ?? null,
        timestamp: data.timestamp
      };
    }

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

      return response.ok;
    } catch (e) {
      console.error(`Error de red al sincronizar ${table}:`, e);
      return false;
    }
  },

  fetchRemote: async (table: string, sinceDays: number = 60): Promise<any[]> => {
    if (!SUPABASE_URL || !SUPABASE_KEY) return [];
    try {
      const cutoff = Date.now() - (sinceDays * 24 * 60 * 60 * 1000);
      const url = `${SUPABASE_URL}/rest/v1/${table}?select=*&timestamp=gte.${cutoff}&order=timestamp.desc`;
      const response = await fetch(url, {
        method: 'GET',
        headers: {
          'apikey': SUPABASE_KEY,
          'Authorization': `Bearer ${SUPABASE_KEY}`
        }
      });

      if (!response.ok) throw new Error(`Fetch error: ${response.statusText}`);
      const data = await response.json();

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
        } else if (table === 'medicine_records') {
          return {
            id: item.id,
            patient: item.patient,
            nurseName: item.nurse_name,
            medicineName: item.medicine_name,
            dose: item.dose,
            timestamp: item.timestamp,
            synced: true
          };
        } else {
          return {
            id: item.id,
            patient: item.patient,
            nurseName: item.nurse_name,
            content: item.content,
            observations: item.observations,
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

  syncFromRemote: async (onProgress?: (msg: string) => void) => {
    onProgress?.('🔄 Sincronizando...');

    // 1. Subir pendientes
    const tables = [
      { key: VITALS_KEY, table: 'vital_records' },
      { key: MEDICINE_KEY, table: 'medicine_records' },
      { key: REPORTS_KEY, table: 'nurse_reports' }
    ];

    for (const { key, table } of tables) {
      const localData = JSON.parse(localStorage.getItem(key) || '[]');
      const pending = localData.filter((r: any) => !r.synced);

      for (const item of pending) {
        if (await dbService.syncRemote(table, item)) {
          const current = JSON.parse(localStorage.getItem(key) || '[]');
          localStorage.setItem(key, JSON.stringify(current.map((r: any) => r.id === item.id ? { ...r, synced: true } : r)));
        }
      }
    }

    // 2. Descargar últimos registros
    const remoteV = await dbService.fetchRemote('vital_records');
    const remoteM = await dbService.fetchRemote('medicine_records');
    const remoteR = await dbService.fetchRemote('nurse_reports');

    const updateLocal = (key: string, remote: any[]) => {
      if (remote.length === 0) return;
      const local = JSON.parse(localStorage.getItem(key) || '[]');
      const combined = [...remote];
      local.forEach((l: any) => { if (!combined.find(r => r.id === l.id)) combined.push(l); });
      combined.sort((a, b) => b.timestamp - a.timestamp);
      // Mantener solo los últimos 100 localmente para rendimiento
      localStorage.setItem(key, JSON.stringify(combined.slice(0, 100)));
    };

    updateLocal(VITALS_KEY, remoteV);
    updateLocal(MEDICINE_KEY, remoteM);
    updateLocal(REPORTS_KEY, remoteR);

    onProgress?.('✅ Al día');
  },

  saveVitalRecord: async (record: Omit<VitalRecord, 'id' | 'timestamp'>): Promise<VitalRecord> => {
    const newRecord: VitalRecord = { ...record, id: generateId(), timestamp: Date.now(), synced: false };
    const all = [newRecord, ...await dbService.getAllVitals()];
    localStorage.setItem(VITALS_KEY, JSON.stringify(all));
    if (await dbService.syncRemote('vital_records', newRecord)) {
      newRecord.synced = true;
      localStorage.setItem(VITALS_KEY, JSON.stringify(all.map(r => r.id === newRecord.id ? { ...r, synced: true } : r)));
    }
    return newRecord;
  },

  saveMedicineRecord: async (record: Omit<MedicineRecord, 'id' | 'timestamp'>): Promise<MedicineRecord> => {
    const newRecord: MedicineRecord = { ...record, id: generateId(), timestamp: Date.now(), synced: false };
    const all = [newRecord, ...await dbService.getAllMedicines()];
    localStorage.setItem(MEDICINE_KEY, JSON.stringify(all));
    if (await dbService.syncRemote('medicine_records', newRecord)) {
      newRecord.synced = true;
      localStorage.setItem(MEDICINE_KEY, JSON.stringify(all.map(r => r.id === newRecord.id ? { ...r, synced: true } : r)));
    }
    return newRecord;
  },

  saveNurseReport: async (record: Omit<NurseReport, 'id' | 'timestamp'>): Promise<NurseReport> => {
    const newRecord: NurseReport = { ...record, id: generateId(), timestamp: Date.now(), synced: false };
    const all = [newRecord, ...await dbService.getAllReports()];
    localStorage.setItem(REPORTS_KEY, JSON.stringify(all));
    if (await dbService.syncRemote('nurse_reports', newRecord)) {
      newRecord.synced = true;
      localStorage.setItem(REPORTS_KEY, JSON.stringify(all.map(r => r.id === newRecord.id ? { ...r, synced: true } : r)));
    }
    return newRecord;
  },

  getAllVitals: async (): Promise<VitalRecord[]> => JSON.parse(localStorage.getItem(VITALS_KEY) || '[]'),
  getAllMedicines: async (): Promise<MedicineRecord[]> => JSON.parse(localStorage.getItem(MEDICINE_KEY) || '[]'),
  getAllReports: async (): Promise<NurseReport[]> => JSON.parse(localStorage.getItem(REPORTS_KEY) || '[]'),

  getVitalsByPatient: async (patient: Patient) => (await dbService.getAllVitals()).filter(r => r.patient === patient),
  getMedicinesByPatient: async (patient: Patient) => (await dbService.getAllMedicines()).filter(r => r.patient === patient),
  getReportsByPatient: async (patient: Patient) => (await dbService.getAllReports()).filter(r => r.patient === patient),
};
