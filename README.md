# CuidaPadres - Registro de Signos Vitales 🩺

Una aplicación móvil (PWA) diseñada para que las enfermeras registren signos vitales y administren medicamentos, permitiendo a la familia monitorear la salud de sus padres mediante un dashboard estadístico.

## 🚀 Características

-   **Registro de Signos Vitales:** Captura de Presión Arterial (opcional), Frecuencia Cardíaca, Frecuencia Respiratoria y Saturación de Oxígeno.
-   **Registro de Medicación:** Control de administración de medicinas por paciente.
-   **Dashboard Familiar:** Visualización gráfica y tabular de la evolución de salud.
-   **Sincronización Híbrida:** Los datos se guardan localmente (Local Storage) y se sincronizan automáticamente con la nube (Supabase).
-   **Multi-Paciente:** Soporte para perfiles independientes (Papa Jorge y Mama Teresa).
-   **Control de Acceso:** Roles diferenciados para Enfermeras y Administradores.

## 🛠️ Stack Tecnológico

-   **Frontend:** React + TypeScript.
-   **Estilos:** Vanilla CSS / Tailwind (Moderno y responsivo).
-   **Base de Datos / Backend:** Supabase (PostgreSQL REST API).
-   **Herramienta de Construcción:** Vite.

## 📂 Estructura del Proyecto

-   `/components`: Componentes modulares (Formularios, Dashboard).
-   `/services`: Lógica de conexión con la base de datos (`db.ts`).
-   `App.tsx`: Orquestador principal de la aplicación.
-   `types.ts`: Definición de interfaces de datos (TypeScript).

## 🔧 Configuración de la Base de Datos (Supabase)

Para que la aplicación funcione con sincronización en la nube, ejecuta el siguiente script en el **SQL Editor** de Supabase. Esto creará las tablas con soporte para UUID y tipos de datos avanzados (JSONB).

### SQL de Creación
```sql
-- 1. Signos Vitales
CREATE TABLE IF NOT EXISTS vital_records (
    id UUID PRIMARY KEY,
    patient TEXT NOT NULL,
    nurse_name TEXT NOT NULL,
    ta_sys INTEGER,
    ta_dia INTEGER,
    fc INTEGER NOT NULL,
    fr INTEGER NOT NULL,
    spo2 INTEGER NOT NULL,
    glucose INTEGER, -- Medición de glucometría opcional
    timestamp BIGINT NOT NULL,
    created_at TIMESTAMPTZ DEFAULT NOW()
);

-- 2. Administración de Medicamentos
CREATE TABLE IF NOT EXISTS medicine_records (
    id UUID PRIMARY KEY,
    patient TEXT NOT NULL,
    nurse_name TEXT NOT NULL,
    medicine_name TEXT NOT NULL,
    dose TEXT NOT NULL,
    timestamp BIGINT NOT NULL,
    created_at TIMESTAMPTZ DEFAULT NOW()
);

-- 3. Bitácora / Informes de Enfermería
CREATE TABLE IF NOT EXISTS nurse_reports (
    id UUID PRIMARY KEY,
    patient TEXT NOT NULL,
    nurse_name TEXT NOT NULL,
    content TEXT NOT NULL,
    observations JSONB, -- Estructura: {bowelMovement: boolean, sleepQuality: string, mood: string, appetite: string}
    timestamp BIGINT NOT NULL,
    created_at TIMESTAMPTZ DEFAULT NOW()
);
```

### 🔐 Seguridad (RLS)
Para evitar los avisos de "RLS Policy Always True" y mantener la seguridad:
1. Habilita RLS en todas las tablas.
2. Usa políticas que requieran el rol `anon` (proporcionado por tu API Key) en lugar de un simple `true`.

```sql
ALTER TABLE vital_records ENABLE ROW LEVEL SECURITY;
ALTER TABLE medicine_records ENABLE ROW LEVEL SECURITY;
ALTER TABLE nurse_reports ENABLE ROW LEVEL SECURITY;

-- Ejemplo de política segura para inserción
CREATE POLICY "Insert Anon" ON nurse_reports 
FOR INSERT WITH CHECK (auth.role() = 'anon');

-- Ejemplo de política segura para lectura
CREATE POLICY "Select Anon" ON nurse_reports 
FOR SELECT USING (auth.role() = 'anon');
```

## 📋 Análisis de Bitácora (Fuente para IA)
Basado en los reportes manuales (cuadernos de enfermería), la IA debe considerar:
*   **Estado de Ánimo**: "Tranquilo", "Estable", "Intranquila", "Enojada".
*   **Alimentación**: "Adecuada", "Poca cantidad".
*   **Eliminación**: "Micción espontánea", "Deposición sí/no".
*   **Hitos Horarios**: Eventos específicos (ej: "Desde las 17:30 intranquila").
*   **Intervenciones**: "Colocación de parche de lidocaína".

---
*Desarrollado con ❤️ para el cuidado de los padres.*
