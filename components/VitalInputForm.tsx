
import React, { useState } from 'react';
import { Patient, VitalRecord, Nurse } from '../types';

interface Props {
  selectedPatient: Patient;
  currentNurse: Nurse;
  onSave: (record: Omit<VitalRecord, 'id' | 'timestamp'>) => Promise<void>;
}

const VitalInputForm: React.FC<Props> = ({ selectedPatient, currentNurse, onSave }) => {
  const [taSys, setTaSys] = useState('');
  const [taDia, setTaDia] = useState('');
  const [fc, setFc] = useState('');
  const [fr, setFr] = useState('');
  const [spo2, setSpo2] = useState('');
  const [isSaving, setIsSaving] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    // Validaciones de seguridad médica básicas
    const sys = parseInt(taSys);
    const dia = parseInt(taDia);
    const pulse = parseInt(fc);
    const oxygen = parseInt(spo2);

    if (oxygen > 100) return alert('La saturación no puede ser mayor a 100%');
    if (sys < 40 || sys > 250) return alert('Presión Sistólica fuera de rango normal');
    if (pulse < 30 || pulse > 220) return alert('Frecuencia Cardíaca fuera de rango normal');

    setIsSaving(true);
    try {
      await onSave({
        patient: selectedPatient,
        nurseName: currentNurse,
        taSys: sys,
        taDia: dia,
        fc: pulse,
        fr: parseInt(fr),
        spo2: oxygen,
      });
      setTaSys(''); setTaDia(''); setFc(''); setFr(''); setSpo2('');
      alert('Registro guardado exitosamente');
    } catch (err) {
      alert('Error al guardar');
    } finally {
      setIsSaving(false);
    }
  };

  const inputClass = "w-full p-4 text-lg border rounded-xl focus:ring-2 focus:ring-blue-500 focus:outline-none transition-all bg-white shadow-sm";
  const labelClass = "block text-sm font-semibold text-slate-600 mb-1 ml-1";

  return (
    <form onSubmit={handleSubmit} className="space-y-6">
      <div className="bg-white p-6 rounded-3xl shadow-lg border border-slate-100">
        <div className="flex justify-between items-start mb-6">
          <h3 className="text-xl font-bold text-slate-800 flex items-center">
            <span className="bg-blue-100 text-blue-600 w-8 h-8 rounded-full flex items-center justify-center mr-3 text-sm">🫀</span>
            Signos de {selectedPatient}
          </h3>
          <div className="text-right">
            <span className="block text-[10px] uppercase font-bold text-slate-400">En turno</span>
            <span className="text-sm font-semibold text-blue-600 italic">{currentNurse}</span>
          </div>
        </div>

        <div className="grid grid-cols-2 gap-4">
          <div className="col-span-2 flex gap-2">
            <div className="flex-1">
              <label className={labelClass}>TA (Sistólica)</label>
              <input type="number" value={taSys} onChange={e => setTaSys(e.target.value)} placeholder="120" className={inputClass} inputMode="numeric" required />
            </div>
            <div className="flex-1">
              <label className={labelClass}>TA (Diastólica)</label>
              <input type="number" value={taDia} onChange={e => setTaDia(e.target.value)} placeholder="80" className={inputClass} inputMode="numeric" required />
            </div>
          </div>

          <div>
            <label className={labelClass}>F.C. (Pulso)</label>
            <input type="number" value={fc} onChange={e => setFc(e.target.value)} placeholder="72" className={inputClass} inputMode="numeric" required />
          </div>

          <div>
            <label className={labelClass}>F.R. (Resp.)</label>
            <input type="number" value={fr} onChange={e => setFr(e.target.value)} placeholder="16" className={inputClass} inputMode="numeric" required />
          </div>

          <div className="col-span-2">
            <label className={labelClass}>SPO2 (%)</label>
            <input type="number" value={spo2} onChange={e => setSpo2(e.target.value)} placeholder="98" className={inputClass} inputMode="numeric" required />
          </div>
        </div>

        <button
          type="submit"
          disabled={isSaving}
          className={`w-full mt-8 py-4 rounded-2xl text-white font-bold text-lg shadow-xl shadow-blue-200 transition-all active:scale-95 ${
            isSaving ? 'bg-slate-400' : 'bg-blue-600 hover:bg-blue-700'
          }`}
        >
          {isSaving ? 'Guardando...' : 'GUARDAR REGISTRO'}
        </button>
      </div>
    </form>
  );
};

export default VitalInputForm;
