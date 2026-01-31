// Enum para pacientes
export enum Patient {
  JORGE = 'Jorge',
  TERESA = 'Teresa'
}

// Tipos de enfermeras
export type Nurse = 'Mónica' | 'Yesse' | 'Génesis' | 'Maricela';

// Roles de usuario
export enum UserRole {
  NURSE = 'ENFERMERA',
  ADMIN = 'ADMINISTRADOR'
}

// Módulos de la aplicación
export enum AppModule {
  VITALS = 'SIGNOS_VITALES',
  DASHBOARD = 'ESTADISTICAS',
  MEDICINES = 'MEDICINAS',
  REPORTS = 'REPORTES'
}

// Registro de Signos Vitales (Usando UUID)
export interface VitalRecord {
  id: string; // UUID v4
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

// Registro de Administración de Medicamento
export interface MedicineRecord {
  id: string; // UUID v4
  patient: Patient;
  nurseName: Nurse;
  medicineName: string;
  dose: string;
  timestamp: number;
  synced?: boolean;
}

// Informe de Enfermería (Estructurado para IA)
export interface NurseReport {
  id: string; // UUID v4
  patient: Patient;
  nurseName: Nurse;
  content: string; // Texto libre
  observations?: {
    bowelMovement?: boolean;
    sleepQuality?: 'Bien' | 'Regular' | 'Mal';
    mood?: 'Estable' | 'Inquieto' | 'Deprimido';
    appetite?: 'Normal' | 'Poco' | 'Nada';
  };
  timestamp: number;
  synced?: boolean;
}

// Cronograma de Medicación (Definición estática)
export interface ScheduledMedicine {
  id: string;
  patient: Patient;
  time: string; // Ej: "08:00"
  name: string;
  dose: string;
  frequency: {
    type: 'daily' | 'days' | 'interval';
    days?: number[]; // [1, 3, 5] para Lun/Mie/Vie (0-6)
    intervalHours?: number; // Ej: cada 8 horas
  };
  notes?: string;
}
