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

Para que la aplicación funcione correctamente con la nube, la base de datos debe tener dos tablas principales:

### 1. `vital_records`
| Columna | Tipo | Notas |
| :--- | :--- | :--- |
| `id` | text (PK) | Generado por el cliente |
| `patient` | text | Jorge / Teresa |
| `nurse_name` | text | Nombre de la enfermera |
| `ta_sys` | int4 | Sistólica (**Nullable**) |
| `ta_dia` | int4 | Diastólica (**Nullable**) |
| `fc` | int4 | Frecuencia Cardíaca |
| `fr` | int4 | Frecuencia Respiratoria |
| `spo2` | int4 | Saturación |
| `timestamp` | int8 | Fecha en ms |

### 2. `medicine_records`
| Columna | Tipo | Notas |
| :--- | :--- | :--- |
| `id` | text (PK) | Generado por el cliente |
| `patient` | text | Jorge / Teresa |
| `nurse_name` | text | Nombre de la enfermera |
| `medicine_name`| text | Nombre del medicamento |
| `dose` | text | Dosis administrada |
| `timestamp` | int8 | Fecha en ms |

> [!IMPORTANT]
> Los campos `ta_sys` y `ta_dia` deben configurarse como **"Allow Nullable"** en Supabase para permitir registros sin presión arterial.

## 💻 Desarrollo Local

1.  **Instalar dependencias:**
    ```bash
    npm install
    ```

2.  **Ejecutar en modo desarrollo:**
    ```bash
    npm run dev
    ```

3.  **Configurar credenciales:**
    Las credenciales actuales están hardcodeadas en `services/db.ts` para pruebas rápidas, pero se recomienda moverlas a un archivo `.env` en producción.

## 📝 Notas de Implementación

-   La aplicación prioriza la disponibilidad: si falla la red, el dato queda en el teléfono.
-   Se implementaron validaciones médicas básicas para evitar errores de dedo (ej: saturación > 100%).
-   El diseño es "Mobile First", optimizado para pantallas táctiles de celulares.

---
*Desarrollado con ❤️ para el cuidado de los padres.*
