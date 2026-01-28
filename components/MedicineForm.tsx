
import React, { useState } from 'react';
import { Patient, MedicineRecord, Nurse } from '../types';

interface Props {
    selectedPatient: Patient;
    currentNurse: Nurse;
    onSave: (record: Omit<MedicineRecord, 'id' | 'timestamp'>) => Promise<void>;
}

const MedicineForm: React.FC<Props> = ({ selectedPatient, currentNurse, onSave }) => {
    const [medicineName, setMedicineName] = useState('Medicina 1');
    const [dose, setDose] = useState('1 unidad');
    const [isSaving, setIsSaving] = useState(false);

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        if (!medicineName || !dose) return alert('Complete todos los campos');

        setIsSaving(true);
        try {
            await onSave({
                patient: selectedPatient,
                nurseName: currentNurse,
                medicineName,
                dose,
            });
            alert('Medicina registrada exitosamente');
        } catch (err) {
            alert('Error al guardar');
        } finally {
            setIsSaving(false);
        }
    };

    const inputClass = "w-full p-4 text-lg border rounded-xl focus:ring-2 focus:ring-emerald-500 focus:outline-none transition-all bg-white shadow-sm";
    const labelClass = "block text-sm font-semibold text-slate-600 mb-1 ml-1";

    return (
        <form onSubmit={handleSubmit} className="space-y-6">
            <div className="bg-white p-6 rounded-3xl shadow-lg border border-slate-100">
                <div className="flex justify-between items-start mb-6">
                    <h3 className="text-xl font-bold text-slate-800 flex items-center">
                        <span className="bg-emerald-100 text-emerald-600 w-8 h-8 rounded-full flex items-center justify-center mr-3 text-sm">💊</span>
                        Medicina por {selectedPatient}
                    </h3>
                    <div className="text-right">
                        <span className="block text-[10px] uppercase font-bold text-slate-400">En turno</span>
                        <span className="text-sm font-semibold text-blue-600 italic">{currentNurse}</span>
                    </div>
                </div>

                <div className="space-y-4">
                    <div>
                        <label className={labelClass}>Nombre del Medicamento</label>
                        <select
                            value={medicineName}
                            onChange={e => setMedicineName(e.target.value)}
                            className={inputClass}
                        >
                            <option value="Medicina 1">Medicina 1</option>
                            <option value="Medicina 2">Medicina 2</option>
                        </select>
                    </div>

                    <div>
                        <label className={labelClass}>Dosis / Cantidad</label>
                        <input
                            type="text"
                            value={dose}
                            onChange={e => setDose(e.target.value)}
                            placeholder="Ej: 1 pastilla"
                            className={inputClass}
                            required
                        />
                    </div>
                </div>

                <button
                    type="submit"
                    disabled={isSaving}
                    className={`w-full mt-8 py-4 rounded-2xl text-white font-bold text-lg shadow-xl shadow-emerald-200 transition-all active:scale-95 ${isSaving ? 'bg-slate-400' : 'bg-emerald-600 hover:bg-emerald-700'
                        }`}
                >
                    {isSaving ? 'Guardando...' : 'REGISTRAR MEDICINA'}
                </button>
            </div>
        </form>
    );
};

export default MedicineForm;
