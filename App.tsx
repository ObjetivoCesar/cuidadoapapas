
import React, { useState, useEffect, useCallback } from 'react';
import { Patient, VitalRecord, MedicineRecord, Nurse, UserRole, AppModule, ScheduledMedicine, NurseReport } from './types';
import { dbService } from './services/db';
import VitalInputForm from './components/VitalInputForm';
import MedicineChecklist from './components/MedicineChecklist';
import NurseReportForm from './components/NurseReportForm';
import Dashboard from './components/Dashboard';

const NURSES: Nurse[] = ['Mónica', 'Yesse', 'Génesis', 'Maricela'];
const ADMIN_PASSWORD = 'familia2025';

const App: React.FC = () => {
  const [role, setRole] = useState<UserRole | null>(null);
  const [currentNurse, setCurrentNurse] = useState<Nurse | null>(null);
  const [activeModule, setActiveModule] = useState<AppModule | null>(null);
  const [selectedPatient, setSelectedPatient] = useState<Patient>(Patient.JORGE);
  const [records, setRecords] = useState<VitalRecord[]>([]);
  const [medicines, setMedicines] = useState<MedicineRecord[]>([]);
  const [reports, setReports] = useState<NurseReport[]>([]);
  const [passInput, setPassInput] = useState('');
  const [syncStatus, setSyncStatus] = useState<'idle' | 'syncing' | 'success' | 'error'>('idle');
  const [syncMsg, setSyncMsg] = useState('');

  const performSync = useCallback(async (onStart = true) => {
    if (onStart) setSyncStatus('syncing');
    try {
      await dbService.syncFromRemote((msg) => setSyncMsg(msg));
      setSyncStatus('success');
      setTimeout(() => setSyncStatus('idle'), 3000);
    } catch (e) {
      setSyncStatus('error');
      setSyncMsg('Fallo de red');
    }
  }, []);

  const fetchRecords = useCallback(async () => {
    // Sincronizar antes de cargar
    await performSync(false);

    const [vModel, mModel, rModel] = await Promise.all([
      dbService.getVitalsByPatient(selectedPatient),
      dbService.getMedicinesByPatient(selectedPatient),
      dbService.getReportsByPatient(selectedPatient)
    ]);

    setRecords(vModel);
    setMedicines(mModel);
    setReports(rModel);
  }, [selectedPatient, performSync]);

  useEffect(() => {
    performSync();
  }, [performSync]);

  useEffect(() => {
    // Cargar datos cuando cambia el paciente o se entra a un módulo relevante
    fetchRecords();
  }, [fetchRecords, activeModule]);

  const handleAdminLogin = () => {
    if (passInput === ADMIN_PASSWORD) setRole(UserRole.ADMIN);
    else alert("Clave incorrecta");
  };

  const handleSaveVital = async (data: Omit<VitalRecord, 'id' | 'timestamp'>) => {
    const res = await dbService.saveVitalRecord(data);
    await fetchRecords();
    return res;
  };

  const handleMarkMedicineAsTaken = async (m: ScheduledMedicine) => {
    try {
      await dbService.saveMedicineRecord({
        patient: selectedPatient,
        nurseName: currentNurse!,
        medicineName: m.name,
        dose: m.dose
      });
      await fetchRecords();
    } catch (err) {
      alert("Error al registrar toma de medicina");
    }
  };

  const handleSaveReport = async (data: Omit<NurseReport, 'id' | 'timestamp'>) => {
    await dbService.saveNurseReport(data);
    await fetchRecords();
  };

  // Filtrar medicines de HOY para el checklist
  const todayMedicines = medicines.filter(m => {
    const d = new Date(m.timestamp);
    const now = new Date();
    return d.getDate() === now.getDate() &&
      d.getMonth() === now.getMonth() &&
      d.getFullYear() === now.getFullYear();
  });

  return (
    <div className="min-h-screen bg-slate-50">
      {!role ? (
        <div className="flex flex-col items-center justify-center min-h-screen p-6 space-y-8">
          <div className="text-center">
            <h1 className="text-4xl font-black italic tracking-tighter">CUIDA<span className="text-blue-600">PADRES</span></h1>
            <p className="text-[10px] font-bold text-slate-400 uppercase tracking-widest">Control Médico Familiar</p>
          </div>
          <button onClick={() => setRole(UserRole.NURSE)} className="w-full max-w-xs bg-white p-6 rounded-3xl shadow-xl border border-slate-100 flex items-center gap-4">
            <span className="text-2xl bg-blue-600 p-3 rounded-2xl text-white">🩺</span>
            <div className="text-left font-bold text-slate-800">Soy Enfermera</div>
          </button>
          <div className="w-full max-w-xs bg-slate-900 p-6 rounded-3xl shadow-2xl space-y-4">
            <input type="password" value={passInput} onChange={e => setPassInput(e.target.value)} placeholder="Clave Admin" className="w-full p-3 rounded-xl bg-slate-800 text-white text-sm" />
            <button onClick={handleAdminLogin} className="w-full bg-blue-600 text-white p-3 rounded-xl font-bold">Entrar como Admin</button>
          </div>
        </div>
      ) : role === UserRole.NURSE && !currentNurse ? (
        <div className="p-6 pt-20 flex flex-col items-center">
          <h2 className="text-2xl font-black mb-8 italic">¿Quién está en turno?</h2>
          <div className="grid grid-cols-2 gap-4 w-full max-w-sm">
            {NURSES.map(n => (
              <button key={n} onClick={() => setCurrentNurse(n)} className="bg-white p-6 rounded-3xl shadow-lg border border-slate-100 font-bold">{n}</button>
            ))}
          </div>
        </div>
      ) : (
        <div className="max-w-md mx-auto min-h-screen flex flex-col">
          <header className="p-4 bg-white border-b sticky top-0 z-20 no-print">
            <div className="flex justify-between items-center mb-4">
              <div className="flex items-center gap-2">
                <button onClick={() => setActiveModule(null)} className="text-blue-600 font-bold text-xs tracking-tighter uppercase">← Menú</button>
                <div className={`flex items-center gap-1 px-2 py-1 rounded-full text-[8px] font-bold uppercase transition-all ${syncStatus === 'syncing' ? 'bg-blue-100 text-blue-600 animate-pulse' :
                  syncStatus === 'success' ? 'bg-emerald-100 text-emerald-600' :
                    syncStatus === 'error' ? 'bg-rose-100 text-rose-600' : 'bg-slate-100 text-slate-400'
                  }`}>
                  <span className="text-[10px]">{syncStatus === 'error' ? '☁️⚠️' : '☁️'}</span>
                  {syncMsg || 'Al día'}
                </div>
              </div>
              <div className="flex items-center gap-2">
                {currentNurse && <span className="text-[8px] font-bold text-blue-600 italic">{currentNurse}</span>}
                <span className="bg-slate-900 text-white px-3 py-1 rounded-full text-[10px] font-black uppercase">{selectedPatient}</span>
              </div>
            </div>
            <div className="flex bg-slate-100 p-1 rounded-2xl">
              <button onClick={() => setSelectedPatient(Patient.JORGE)} className={`flex-1 py-2 rounded-xl text-xs font-black ${selectedPatient === Patient.JORGE ? 'bg-white shadow-sm text-blue-600' : 'text-slate-400'}`}>PAPA JORGE</button>
              <button onClick={() => setSelectedPatient(Patient.TERESA)} className={`flex-1 py-2 rounded-xl text-xs font-black ${selectedPatient === Patient.TERESA ? 'bg-white shadow-sm text-rose-600' : 'text-slate-400'}`}>MAMA TERESA</button>
            </div>
          </header>

          <main className="p-4 flex-1">
            {activeModule === null ? (
              <div className="space-y-4 pt-10">
                <button onClick={() => setActiveModule(AppModule.VITALS)} className="group w-full bg-white p-6 rounded-[2rem] shadow-xl border border-blue-50 flex items-center gap-4 active:scale-95 transition-all">
                  <span className="text-3xl bg-blue-50 p-3 rounded-2xl group-hover:scale-110 transition-transform">🫀</span>
                  <div className="text-left font-black text-slate-800 text-lg">Registrar Signos</div>
                </button>
                <button onClick={() => setActiveModule(AppModule.MEDICINES)} className="group w-full bg-white p-6 rounded-[2rem] shadow-xl border border-emerald-50 flex items-center gap-4 active:scale-95 transition-all">
                  <span className="text-3xl bg-emerald-50 p-3 rounded-2xl group-hover:scale-110 transition-transform">💊</span>
                  <div className="text-left font-black text-slate-800 text-lg">Checklist Medicina</div>
                </button>
                <button onClick={() => setActiveModule(AppModule.REPORTS)} className="group w-full bg-white p-6 rounded-[2rem] shadow-xl border border-indigo-50 flex items-center gap-4 active:scale-95 transition-all">
                  <span className="text-3xl bg-indigo-50 p-3 rounded-2xl group-hover:scale-110 transition-transform">📝</span>
                  <div className="text-left font-black text-slate-800 text-lg">Informe del Turno</div>
                </button>
                <button onClick={() => setActiveModule(AppModule.DASHBOARD)} className="group w-full bg-white p-6 rounded-[2rem] shadow-xl border border-slate-50 flex items-center gap-4 active:scale-95 transition-all">
                  <span className="text-3xl bg-slate-50 p-3 rounded-2xl group-hover:scale-110 transition-transform">📊</span>
                  <div className="text-left font-black text-slate-800 text-lg">Ver Historial</div>
                </button>
                <button onClick={() => { setRole(null); setCurrentNurse(null); }} className="w-full p-4 text-slate-400 font-bold text-xs uppercase tracking-widest mt-10">Cerrar Sesión</button>
              </div>
            ) : activeModule === AppModule.VITALS ? (
              <VitalInputForm selectedPatient={selectedPatient} currentNurse={currentNurse!} onSave={handleSaveVital} />
            ) : activeModule === AppModule.MEDICINES ? (
              <MedicineChecklist
                selectedPatient={selectedPatient}
                currentNurse={currentNurse!}
                todayRecords={todayMedicines}
                onMarkAsTaken={handleMarkMedicineAsTaken}
              />
            ) : activeModule === AppModule.REPORTS ? (
              <NurseReportForm
                selectedPatient={selectedPatient}
                currentNurse={currentNurse!}
                onSave={handleSaveReport}
              />
            ) : (
              <Dashboard records={records} patient={selectedPatient} medicines={medicines} onRefresh={fetchRecords} reports={reports} />
            )}
          </main>
        </div>
      )}
    </div>
  );
};
export default App;
