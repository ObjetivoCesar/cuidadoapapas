import React, { useMemo, useState } from 'react';
import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, ReferenceLine, Legend, AreaChart, Area } from 'recharts';
import { VitalRecord, MedicineRecord, Patient, NurseReport } from '../types';

interface Props {
  records: VitalRecord[];
  medicines: MedicineRecord[];
  reports: NurseReport[];
  patient: Patient;
  onRefresh: () => void;
}

type TimeRange = 'day' | '7d' | '30d';
type DayFilter = 'all' | 'night';

const Dashboard: React.FC<Props> = ({ records, medicines, reports, patient, onRefresh }) => {
  const [timeRange, setTimeRange] = useState<TimeRange>('day');
  // Usar fecha local real (clásica corrección de offset)
  const getLocalDate = () => {
    const d = new Date();
    d.setMinutes(d.getMinutes() - d.getTimezoneOffset());
    return d.toISOString().split('T')[0];
  };
  const [selectedDate, setSelectedDate] = useState(getLocalDate());
  const [dayFilter, setDayFilter] = useState<DayFilter>('all');

  // Helpers para Ecuador (América/Guayaquil)
  const formatEC = (ts: number, options: Intl.DateTimeFormatOptions) => {
    return new Intl.DateTimeFormat('es-EC', {
      ...options,
      timeZone: 'America/Guayaquil'
    }).format(new Date(ts));
  };

  const humanDate = (ts: number) => formatEC(ts, { weekday: 'short', day: '2-digit', month: 'short' });
  const humanTime = (ts: number) => formatEC(ts, { hour: '2-digit', minute: '2-digit', hour12: false });
  const humanFull = (ts: number) => `${humanDate(ts)}, ${humanTime(ts)}`;

  // 1. Filtrado de Datos
  const filteredRecords = useMemo(() => {
    const msInDay = 24 * 60 * 60 * 1000;

    if (timeRange === 'day') {
      const startOfDay = new Date(selectedDate + 'T00:00:00').getTime();
      const endOfDay = new Date(selectedDate + 'T23:59:59').getTime();

      return records
        .filter(r => r.timestamp >= startOfDay && r.timestamp <= endOfDay)
        .filter(r => {
          if (dayFilter === 'all') return true;
          const date = new Date(r.timestamp);
          const hours = date.getHours();
          return hours >= 20 || hours < 8;
        })
        .reverse();
    }

    const now = Date.now();
    let cutoff = now;
    if (timeRange === '7d') cutoff = now - (7 * msInDay);
    if (timeRange === '30d') cutoff = now - (30 * msInDay);

    return records
      .filter(r => r.timestamp >= cutoff)
      .filter(r => {
        if (dayFilter === 'all') return true;
        const date = new Date(r.timestamp);
        const hours = date.getHours();
        return hours >= 20 || hours < 8;
      })
      .reverse();
  }, [records, timeRange, dayFilter, selectedDate]);

  const filteredMedicines = useMemo(() => {
    const msInDay = 24 * 60 * 60 * 1000;
    const now = Date.now();
    let cutoff = now - (30 * msInDay);
    if (timeRange === 'day') {
      cutoff = new Date(selectedDate + 'T00:00:00').getTime();
    } else if (timeRange === '7d') {
      cutoff = now - (7 * msInDay);
    }

    return medicines
      .filter(m => m.timestamp >= cutoff && (timeRange !== 'day' || m.timestamp <= new Date(selectedDate + 'T23:59:59').getTime()))
      .reverse();
  }, [medicines, timeRange, selectedDate]);

  const filteredReports = useMemo(() => {
    const msInDay = 24 * 60 * 60 * 1000;
    const now = Date.now();
    let cutoff = now - (30 * msInDay);
    if (timeRange === 'day') {
      cutoff = new Date(selectedDate + 'T00:00:00').getTime();
    } else if (timeRange === '7d') {
      cutoff = now - (7 * msInDay);
    }

    return reports
      .filter(r => r.timestamp >= cutoff && (timeRange !== 'day' || r.timestamp <= new Date(selectedDate + 'T23:59:59').getTime()))
      .reverse();
  }, [reports, timeRange, selectedDate]);

  const chartData = useMemo(() => {
    return filteredRecords.map(r => ({
      ...r,
      dateShort: humanDate(r.timestamp),
      timeShort: humanTime(r.timestamp),
      fullLabel: humanFull(r.timestamp),
    }));
  }, [filteredRecords]);

  // 2. Estadísticas / Promedios
  const stats = useMemo(() => {
    if (filteredRecords.length === 0) return null;

    let sysSum = 0, sysCount = 0;
    let diaSum = 0, diaCount = 0;
    let fcSum = 0, fcCount = 0;
    let spo2Sum = 0, spo2Count = 0;

    filteredRecords.forEach(r => {
      if (r.taSys) { sysSum += r.taSys; sysCount++; }
      if (r.taDia) { diaSum += r.taDia; diaCount++; }
      if (r.fc) { fcSum += r.fc; fcCount++; }
      if (r.spo2) { spo2Sum += r.spo2; spo2Count++; }
    });

    return {
      taSys: sysCount > 0 ? Math.round(sysSum / sysCount) : 0,
      taDia: diaCount > 0 ? Math.round(diaSum / diaCount) : 0,
      fc: fcCount > 0 ? Math.round(fcSum / fcCount) : 0,
      spo2: spo2Count > 0 ? Math.round(spo2Sum / spo2Count) : 0,
      count: filteredRecords.length
    };
  }, [filteredRecords]);

  const downloadMarkdown = () => {
    const now = Date.now();
    const text = `# REPORTE MÉDICO: ${patient}\n` +
      `Generado: ${humanFull(now)}\n` +
      `Filtro: ${timeRange === 'day' ? `Día ${selectedDate}` : timeRange} | ${dayFilter === 'night' ? 'SOLO NOCHE (Apnea Monitor)' : 'Todo el día'}\n\n` +
      `## Promedios del Periodo\n` +
      `- Presión: ${stats?.taSys}/${stats?.taDia}\n` +
      `- Pulso: ${stats?.fc} lpm\n` +
      `- Saturación O2: ${stats?.spo2}%\n\n` +
      `## Bitácora de Salud (Informes de Turno)\n` +
      filteredReports.map(r =>
        `### ${humanFull(r.timestamp)} - Enfermera: ${r.nurseName}\n` +
        `**Estado**: Evacuación: ${r.observations?.bowelMovement ? 'SÍ' : 'NO'} | ` +
        `Sueño: ${r.observations?.sleepQuality} | ` +
        `Humor: ${r.observations?.mood} | ` +
        `Apetito: ${r.observations?.appetite}\n\n` +
        `**Detalle**: ${r.content}\n`
      ).join('\n---\n') +
      `\n\n## Historial de Signos Vitales\n` +
      `| Fecha | Hora | TA | FC | SPO2 | Gluco | Enfermera |\n|---|---|---|---|---|---|---|\n` +
      filteredRecords.slice().reverse().map(r => `| ${humanDate(r.timestamp)} | ${humanTime(r.timestamp)} | ${r.taSys}/${r.taDia} | ${r.fc} | ${r.spo2}% | ${r.glucose ?? '-'} | ${r.nurseName} |`).join('\n') +
      `\n\n## Historial de Medicinas\n` +
      `| Fecha | Hora | Medicina | Dosis | Enfermera |\n|---|---|---|---|---|\n` +
      filteredMedicines.slice().reverse().map(m => `| ${humanDate(m.timestamp)} | ${humanTime(m.timestamp)} | ${m.medicineName} | ${m.dose} | ${m.nurseName} |`).join('\n');

    const blob = new Blob([text], { type: 'text/markdown' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a'); a.href = url; a.download = `Reporte_${patient}_${timeRange}.md`; a.click();
  };

  const CustomTooltip = ({ active, payload, label }: any) => {
    if (active && payload && payload.length) {
      return (
        <div className="bg-white/90 p-3 border border-slate-200 shadow-xl rounded-xl text-xs backdrop-blur-sm">
          <p className="font-bold mb-2">{payload[0].payload.fullLabel}</p>
          {payload.map((p: any) => (
            <p key={p.name} style={{ color: p.color }} className="font-semibold">
              {p.name}: {p.value}
            </p>
          ))}
        </div>
      );
    }
    return null;
  };

  return (
    <div className="space-y-6 pb-20">
      {/* HEADER Y FILTROS */}
      <div className="bg-white p-4 rounded-3xl shadow-sm border border-slate-100 no-print space-y-4">
        <div className="flex justify-between items-center">
          <div className="flex items-center gap-2">
            <h1 className="text-xl font-black text-slate-800">📊 Análisis Clínico</h1>
            <button
              onClick={onRefresh}
              className="bg-blue-600 text-white p-1 rounded-full hover:rotate-180 transition-all shadow-md"
              title="Sincronizar ahora"
            >
              🔄
            </button>
          </div>
          <div className="flex bg-slate-100 p-1 rounded-xl">
            {(['day', '7d', '30d'] as TimeRange[]).map(t => (
              <button
                key={t}
                onClick={() => setTimeRange(t)}
                className={`px-3 py-1 rounded-lg text-xs font-bold transition-all ${timeRange === t ? 'bg-white shadow text-blue-600' : 'text-slate-400'}`}
              >
                {t === 'day' ? 'Día' : t}
              </button>
            ))}
          </div>
        </div>

        {timeRange === 'day' && (
          <div className="flex items-center gap-4 bg-slate-50 p-3 rounded-2xl border border-slate-100">
            <span className="text-xs font-bold text-slate-500 uppercase tracking-wider">Fecha:</span>
            <input
              type="date"
              value={selectedDate}
              onChange={(e) => setSelectedDate(e.target.value)}
              className="flex-1 bg-transparent font-bold text-slate-800 outline-none"
            />
          </div>
        )}

        <div className="flex gap-2">
          <button
            onClick={() => setDayFilter('all')}
            className={`flex-1 py-2 px-4 rounded-xl text-xs font-bold border ${dayFilter === 'all' ? 'bg-slate-800 text-white border-slate-800' : 'bg-white text-slate-500 border-slate-200'}`}
          >
            ☀️ Todo el Día
          </button>
          <button
            onClick={() => setDayFilter('night')}
            className={`flex-1 py-2 px-4 rounded-xl text-xs font-bold border flex items-center justify-center gap-2 ${dayFilter === 'night' ? 'bg-indigo-900 text-white border-indigo-900' : 'bg-white text-indigo-900 border-indigo-100'}`}
          >
            🌙 Solo Noche
          </button>
        </div>
      </div>

      {/* BITÁCORA DE TURNO - NUEVO */}
      <div className="bg-white p-6 rounded-[2rem] shadow-xl border border-indigo-50 space-y-4">
        <h3 className="font-black text-indigo-900 flex items-center gap-2">
          <span className="text-xl">📝</span> Bitácora de Salud
        </h3>

        {filteredReports.length === 0 ? (
          <p className="text-xs text-slate-400 italic text-center py-4">No hay informes para este periodo</p>
        ) : (
          <div className="space-y-4">
            {filteredReports.map(r => (
              <div key={r.id} className="p-4 bg-slate-50 rounded-2xl border border-slate-100 space-y-2">
                <div className="flex justify-between items-start">
                  <span className="text-[10px] font-black text-indigo-600 uppercase italic">{r.nurseName}</span>
                  <span className="text-[10px] font-bold text-slate-400">{humanFull(r.timestamp)}</span>
                </div>

                <p className="text-sm font-medium text-slate-700 leading-relaxed">{r.content}</p>

                <div className="flex gap-2 pt-2 border-t border-slate-100 overflow-x-auto">
                  {r.observations?.bowelMovement && <span className="bg-emerald-100 text-emerald-700 text-[8px] px-2 py-0.5 rounded-full font-bold whitespace-nowrap">💩 Evacuación</span>}
                  <span className="bg-blue-100 text-blue-700 text-[8px] px-2 py-0.5 rounded-full font-bold whitespace-nowrap">😴 {r.observations?.sleepQuality}</span>
                  <span className="bg-indigo-100 text-indigo-700 text-[8px] px-2 py-0.5 rounded-full font-bold whitespace-nowrap">😊 {r.observations?.mood}</span>
                  <span className="bg-orange-100 text-orange-700 text-[8px] px-2 py-0.5 rounded-full font-bold whitespace-nowrap">🍕 {r.observations?.appetite}</span>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>

      {/* RESUMEN DE PROMEDIOS */}
      {stats && (
        <div className="grid grid-cols-4 gap-2 no-print">
          <StatBox label="TA Promedio" val={`${stats.taSys}/${stats.taDia}`} color="text-blue-600" bg="bg-blue-50" />
          <StatBox label="Pulso Prom" val={stats.fc} unit="lpm" color="text-rose-600" bg="bg-rose-50" />
          <StatBox label="SPO2 Prom" val={stats.spo2} unit="%" color="text-emerald-600" bg="bg-emerald-50" />
          <StatBox label="Nº Datos" val={stats.count} color="text-slate-600" bg="bg-slate-50" />
        </div>
      )}

      {/* GRÁFICO 1: PRESIÓN ARTERIAL */}
      <ChartCard title="Presión Arterial (TA)" icon="🩸">
        <ResponsiveContainer width="100%" height="100%">
          <LineChart data={chartData}>
            <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#e2e8f0" />
            <XAxis dataKey="dateShort" tick={{ fontSize: 10 }} stroke="#94a3b8" />
            <YAxis tick={{ fontSize: 10 }} domain={['dataMin - 10', 'dataMax + 10']} />
            <Tooltip content={<CustomTooltip />} />
            <ReferenceLine y={140} stroke="#ef4444" strokeDasharray="3 3" label={{ position: 'right', value: '140', fill: '#ef4444', fontSize: 10 }} />
            <ReferenceLine y={90} stroke="#ef4444" strokeDasharray="3 3" />
            <Legend />
            <Line type="monotone" dataKey="taSys" name="Sistólica" stroke="#2563eb" strokeWidth={3} dot={false} activeDot={{ r: 6 }} />
            <Line type="monotone" dataKey="taDia" name="Diastólica" stroke="#3b82f6" strokeWidth={3} strokeDasharray="5 5" dot={false} />
          </LineChart>
        </ResponsiveContainer>
      </ChartCard>

      {/* GRÁFICO 2: OXIGENACIÓN (SPO2) */}
      <ChartCard title="Saturación de Oxígeno (SPO2)" icon="🫁">
        <ResponsiveContainer width="100%" height="100%">
          <AreaChart data={chartData}>
            <defs>
              <linearGradient id="colorSpo2" x1="0" y1="0" x2="0" y2="1">
                <stop offset="5%" stopColor="#10b981" stopOpacity={0.2} />
                <stop offset="95%" stopColor="#10b981" stopOpacity={0} />
              </linearGradient>
            </defs>
            <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#e2e8f0" />
            <XAxis dataKey="timeShort" tick={{ fontSize: 10 }} stroke="#94a3b8" />
            <YAxis tick={{ fontSize: 10 }} domain={[80, 100]} />
            <Tooltip content={<CustomTooltip />} />
            <ReferenceLine y={90} stroke="#f59e0b" strokeDasharray="3 3" label={{ value: 'Alerta 90%', fill: '#f59e0b', fontSize: 10 }} />
            <Area type="monotone" dataKey="spo2" name="SPO2 %" stroke="#10b981" fillOpacity={1} fill="url(#colorSpo2)" strokeWidth={2} />
          </AreaChart>
        </ResponsiveContainer>
      </ChartCard>

      {/* GRÁFICO 3: GLUCOSA */}
      <ChartCard title="Glucosa (mg/dl)" icon="💉">
        <ResponsiveContainer width="100%" height="100%">
          <LineChart data={chartData}>
            <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#e2e8f0" />
            <XAxis dataKey="timeShort" tick={{ fontSize: 10 }} stroke="#94a3b8" />
            <YAxis tick={{ fontSize: 10 }} domain={['dataMin - 10', 'dataMax + 10']} />
            <Tooltip content={<CustomTooltip />} />
            <ReferenceLine y={140} stroke="#ef4444" strokeDasharray="3 3" label={{ position: 'right', value: '140', fill: '#ef4444', fontSize: 10 }} />
            <Line type="monotone" dataKey="glucose" name="Glucosa" stroke="#8b5cf6" strokeWidth={2} connectNulls />
          </LineChart>
        </ResponsiveContainer>
      </ChartCard>

      {/* HISTORIAL DE MEDICINAS */}
      <div className="bg-white p-6 rounded-[2rem] shadow-xl border border-slate-50 space-y-4">
        <h3 className="font-black text-slate-800 flex items-center gap-2">
          <span className="text-xl">💊</span> Historial de Medicinas
        </h3>

        {filteredMedicines.length === 0 ? (
          <p className="text-xs text-slate-400 italic text-center py-4">No hay registros de medicina</p>
        ) : (
          <div className="space-y-3">
            {filteredMedicines.map(m => (
              <div key={m.id} className="flex justify-between items-center p-3 bg-slate-50 rounded-2xl border border-slate-100">
                <div>
                  <p className="text-sm font-black text-slate-800">{m.medicineName}</p>
                  <p className="text-[10px] font-bold text-slate-500 uppercase">{m.dose} • {m.nurseName}</p>
                </div>
                <div className="text-right">
                  <p className="text-[10px] font-black text-slate-900">{humanTime(m.timestamp)}</p>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>

      <div className="flex gap-4 no-print mt-8">
        <button onClick={downloadMarkdown} className="flex-1 p-4 bg-slate-800 text-white rounded-2xl font-bold text-xs shadow-lg active:scale-95 transition-all">DESCARGAR INFORME ({timeRange})</button>
      </div>
    </div >
  );
};

const StatBox = ({ label, val, unit, color, bg }: any) => (
  <div className={`${bg} p-3 rounded-2xl border border-slate-100 text-center`}>
    <p className={`text-[10px] font-black uppercase tracking-wider mb-1 opacity-60 ${color}`}>{label}</p>
    <p className={`text-lg font-black ${color}`}>{val}<span className="text-xs ml-1">{unit}</span></p>
  </div>
);

const ChartCard = ({ title, icon, children }: any) => (
  <div className="bg-white p-4 rounded-3xl shadow-lg border border-slate-50 h-72">
    <h3 className="text-sm font-bold text-slate-700 mb-4 flex items-center gap-2">
      <span className="bg-slate-100 p-1 rounded-lg text-lg">{icon}</span> {title}
    </h3>
    <div className="h-52 w-full">
      {children}
    </div>
  </div>
);

export default Dashboard;
