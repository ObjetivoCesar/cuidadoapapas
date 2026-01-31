import React, { useState } from 'react';
import { Patient, Nurse, NurseReport } from '../types';

interface Props {
    selectedPatient: Patient;
    currentNurse: Nurse;
    onSave: (record: Omit<NurseReport, 'id' | 'timestamp'>) => Promise<void>;
}

const NurseReportForm: React.FC<Props> = ({ selectedPatient, currentNurse, onSave }) => {
    const [content, setContent] = useState('');
    const [observations, setObservations] = useState<NonNullable<NurseReport['observations']>>({
        bowelMovement: false,
        sleepQuality: 'Bien',
        mood: 'Estable',
        appetite: 'Normal',
    });
    const [isSaving, setIsSaving] = useState(false);

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        if (!content.trim()) return alert('Por favor, escribe un breve informe del turno.');

        setIsSaving(true);
        try {
            await onSave({
                patient: selectedPatient,
                nurseName: currentNurse,
                content: content.trim(),
                observations,
            });
            setContent('');
            setObservations({
                bowelMovement: false,
                sleepQuality: 'Bien',
                mood: 'Estable',
                appetite: 'Normal',
            });
            alert('Informe guardado correctamente');
        } catch (err) {
            alert('Error al guardar el informe');
        } finally {
            setIsSaving(false);
        }
    };

    const sectionClass = "bg-white p-5 rounded-3xl border border-slate-100 shadow-sm";
    const labelClass = "block text-xs font-bold text-slate-400 uppercase tracking-widest mb-3";
    const optionClass = (selected: boolean) =>
        `flex-1 py-3 px-2 text-center rounded-xl text-xs font-bold transition-all border-2 ${selected
            ? 'bg-blue-600 border-blue-600 text-white shadow-md shadow-blue-100'
            : 'bg-slate-50 border-slate-50 text-slate-500 hover:bg-slate-100'
        }`;

    return (
        <form onSubmit={handleSubmit} className="space-y-6 pb-10">
            <div className="flex justify-between items-center px-1">
                <h3 className="text-xl font-bold text-slate-800 italic">Bitácora de {currentNurse}</h3>
                <span className="text-[10px] font-black bg-blue-100 text-blue-600 px-3 py-1 rounded-full uppercase">TURNO ACTUAL</span>
            </div>

            {/* Estado General Rápido */}
            <div className={sectionClass}>
                <label className={labelClass}>Estado General del Turno</label>

                <div className="space-y-6">
                    {/* Evacuación */}
                    <div className="flex items-center justify-between p-3 bg-slate-50 rounded-2xl border-2 border-slate-50">
                        <span className="text-sm font-bold text-slate-700">¿Hubo evacuación / popó?</span>
                        <button
                            type="button"
                            onClick={() => setObservations(prev => ({ ...prev, bowelMovement: !prev.bowelMovement }))}
                            className={`w-14 h-8 rounded-full transition-all relative ${observations.bowelMovement ? 'bg-emerald-500' : 'bg-slate-300'}`}
                        >
                            <div className={`absolute top-1 w-6 h-6 bg-white rounded-full transition-all shadow-sm ${observations.bowelMovement ? 'right-1' : 'left-1'}`} />
                        </button>
                    </div>

                    {/* Sueño */}
                    <div>
                        <span className="block text-xs font-bold text-slate-500 mb-2">Calidad de Sueño</span>
                        <div className="flex gap-2">
                            {(['Bien', 'Regular', 'Mal'] as const).map(opt => (
                                <button
                                    key={opt}
                                    type="button"
                                    onClick={() => setObservations(prev => ({ ...prev, sleepQuality: opt }))}
                                    className={optionClass(observations.sleepQuality === opt)}
                                >
                                    {opt}
                                </button>
                            ))}
                        </div>
                    </div>

                    {/* Humor */}
                    <div>
                        <span className="block text-xs font-bold text-slate-500 mb-2">Humor / Ánimo</span>
                        <div className="flex gap-2">
                            {(['Estable', 'Inquieto', 'Deprimido'] as const).map(opt => (
                                <button
                                    key={opt}
                                    type="button"
                                    onClick={() => setObservations(prev => ({ ...prev, mood: opt }))}
                                    className={optionClass(observations.mood === opt)}
                                >
                                    {opt}
                                </button>
                            ))}
                        </div>
                    </div>
                </div>
            </div>

            {/* Informe Detallado */}
            <div className={sectionClass}>
                <label className={labelClass}>Informe Detallado (Bitácora)</label>

                {/* Sugerencias Rápidas */}
                <div className="mb-4">
                    <span className="block text-[10px] font-bold text-slate-400 uppercase mb-2">Sugerencias Rápidas:</span>
                    <div className="flex flex-wrap gap-2">
                        {[
                            'Micción espontánea',
                            'Deposición normal',
                            'Alimentación adecuada',
                            'Tranquilo/a durante el turno',
                            'Intranquilo/a por momentos',
                            'Dolor controlado',
                            'Sin novedades'
                        ].map(suggestion => (
                            <button
                                key={suggestion}
                                type="button"
                                onClick={() => setContent(prev => prev ? `${prev}. ${suggestion}` : suggestion)}
                                className="px-3 py-1.5 bg-slate-100 hover:bg-blue-100 hover:text-blue-700 text-slate-600 rounded-full text-[11px] font-semibold transition-all active:scale-95"
                            >
                                + {suggestion}
                            </button>
                        ))}
                    </div>
                </div>

                <textarea
                    value={content}
                    onChange={e => setContent(e.target.value)}
                    placeholder="Describe novedades, molestias o detalles del cuidado..."
                    rows={6}
                    className="w-full p-4 bg-slate-50 border-2 border-slate-50 rounded-2xl focus:bg-white focus:border-blue-500 focus:outline-none transition-all text-slate-700 placeholder:text-slate-400 font-medium"
                />
            </div>

            <button
                type="submit"
                disabled={isSaving}
                className={`w-full py-5 rounded-3xl text-white font-black text-lg shadow-xl shadow-blue-100 transition-all active:scale-[0.98] ${isSaving ? 'bg-slate-400' : 'bg-blue-700 hover:bg-blue-800'
                    }`}
            >
                {isSaving ? 'GUARDANDO...' : 'GUARDAR INFORME DEL TURNO'}
            </button>

            <p className="text-[10px] text-center text-slate-400 uppercase font-black tracking-widest">
                Este registro quedará vinculado a su nombre y hora actual
            </p>
        </form>
    );
};

export default NurseReportForm;
