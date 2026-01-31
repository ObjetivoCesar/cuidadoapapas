import React, { useMemo } from 'react';
import { Patient, Nurse, MedicineRecord, ScheduledMedicine } from '../types';
import { MEDICATION_SCHEDULE } from '../data/medicationSchedule';

interface Props {
    selectedPatient: Patient;
    currentNurse: Nurse;
    todayRecords: MedicineRecord[];
    onMarkAsTaken: (medicine: ScheduledMedicine) => Promise<void>;
}

const MedicineChecklist: React.FC<Props> = ({
    selectedPatient,
    currentNurse,
    todayRecords,
    onMarkAsTaken
}) => {
    const dayOfWeek = new Date().getDay(); // 0-6 (Sun-Sat)

    const activeSchedule = useMemo(() => {
        return MEDICATION_SCHEDULE.filter(m => {
            if (m.patient !== selectedPatient) return false;
            if (m.frequency.type === 'days') {
                return m.frequency.days?.includes(dayOfWeek);
            }
            return true;
        }).sort((a, b) => a.time.localeCompare(b.time));
    }, [selectedPatient, dayOfWeek]);

    const groupedByTime = useMemo(() => {
        const groups: Record<string, ScheduledMedicine[]> = {};
        activeSchedule.forEach(m => {
            if (!groups[m.time]) groups[m.time] = [];
            groups[m.time].push(m);
        });
        return groups;
    }, [activeSchedule]);

    const isTaken = (m: ScheduledMedicine) => {
        // Verificar si existe un registro hoy para este medicamento
        // Buscamos coincidencia por nombre de medicina hoy
        return todayRecords.some(r => r.medicineName === m.name);
    };

    const getTimeStatus = (time: string) => {
        const now = new Date();
        const [hours, minutes] = time.split(':').map(Number);
        const scheduledTime = new Date();
        scheduledTime.setHours(hours, minutes, 0, 0);

        if (now < scheduledTime) return 'PENDIENTE';
        // Si han pasado más de 2 horas, es "ATRASADO"
        if (now.getTime() - scheduledTime.getTime() > 2 * 60 * 60 * 1000) return 'ATRASADO';
        return 'EN HORA';
    };

    return (
        <div className="space-y-6">
            <div className="flex justify-between items-center px-1">
                <h3 className="text-xl font-bold text-slate-800">Cuidado Diario</h3>
                <span className="text-xs font-bold text-slate-400 uppercase tracking-widest">
                    {new Date().toLocaleDateString('es-ES', { weekday: 'long', day: 'numeric', month: 'short' })}
                </span>
            </div>

            {(Object.entries(groupedByTime) as [string, ScheduledMedicine[]][]).map(([time, medicines]) => {
                const status = getTimeStatus(time);
                const allTaken = medicines.every(isTaken);

                return (
                    <div key={time} className={`relative pl-8 border-l-2 ${allTaken ? 'border-emerald-200' : 'border-slate-200'} pb-6`}>
                        {/* Indicador de Hora */}
                        <div className={`absolute -left-3 top-0 w-6 h-6 rounded-full border-4 border-white shadow-sm flex items-center justify-center ${allTaken ? 'bg-emerald-500' : status === 'ATRASADO' ? 'bg-rose-500' : 'bg-blue-500'
                            }`}>
                            {allTaken && <span className="text-[10px] text-white">✓</span>}
                        </div>

                        <div className="mb-4">
                            <span className={`text-sm font-bold ${allTaken ? 'text-emerald-600' : status === 'ATRASADO' ? 'text-rose-600' : 'text-blue-600'}`}>
                                {time} — {allTaken ? 'COMPLETADO' : status}
                            </span>
                        </div>

                        <div className="grid grid-cols-1 gap-3">
                            {medicines.map(m => {
                                const taken = isTaken(m);
                                return (
                                    <button
                                        key={m.id}
                                        onClick={() => !taken && onMarkAsTaken(m)}
                                        disabled={taken}
                                        className={`flex items-center justify-between p-4 rounded-2xl transition-all ${taken
                                            ? 'bg-emerald-50 border-emerald-100 opacity-70'
                                            : 'bg-white border-slate-100 shadow-sm hover:shadow-md active:scale-[0.98]'
                                            } border-2 text-left`}
                                    >
                                        <div>
                                            <p className={`font-bold ${taken ? 'text-emerald-800 line-through' : 'text-slate-800'}`}>
                                                {m.name}
                                            </p>
                                            <p className="text-xs text-slate-500 font-medium">
                                                Dosis: {m.dose} {m.notes && `· ${m.notes}`}
                                            </p>
                                        </div>

                                        <div className={`w-10 h-10 rounded-xl flex items-center justify-center transition-colors ${taken ? 'bg-emerald-500 text-white' : 'bg-slate-50 text-slate-400'
                                            }`}>
                                            {taken ? '✓' : '💊'}
                                        </div>
                                    </button>
                                );
                            })}
                        </div>
                    </div>
                );
            })}

            {activeSchedule.length === 0 && (
                <div className="text-center py-12 bg-slate-50 rounded-3xl border-2 border-dashed border-slate-200">
                    <p className="text-slate-400 italic">No hay medicación programada para hoy.</p>
                </div>
            )}
        </div>
    );
};

export default MedicineChecklist;
