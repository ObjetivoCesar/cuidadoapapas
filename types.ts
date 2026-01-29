
export enum Patient { JORGE = 'Jorge', TERESA = 'Teresa' }
export type Nurse = 'Mónica' | 'Yesse' | 'Génesis' | 'Maricela';
export enum UserRole { NURSE = 'ENFERMERA', ADMIN = 'ADMINISTRADOR' }
export enum AppModule { VITALS = 'SIGNOS_VITALES', DASHBOARD = 'ESTADISTICAS', MEDICINES = 'MEDICINAS' }

export interface VitalRecord {
  id: string;
  patient: Patient;
  nurseName: Nurse;
  taSys?: number;
  taDia?: number;
  fc: number;
  fr: number;
  spo2: number;
  timestamp: number;
  synced?: boolean;
}

export interface MedicineRecord {
  id: string;
  patient: Patient;
  nurseName: Nurse;
  medicineName: string;
  dose: string;
  timestamp: number;
  synced?: boolean;
}
