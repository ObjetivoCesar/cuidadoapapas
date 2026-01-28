import React, { useMemo, useState } from 'react';
import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, ReferenceLine, Legend, AreaChart, Area } from 'recharts';
import { VitalRecord, Patient } from '../types';

interface Props { records: VitalRecord[]; patient: Patient; }

type TimeRange = '24h' | '7d' | '30d';
type DayFilter = 'all' | 'night';

const Dashboard: React.FC<Props> = ({ records, patient }) => {
  const [timeRange, setTimeRange] = useState<TimeRange>('7d');
  const [dayFilter, setDayFilter] = useState<DayFilter>('all');

  // 1. Filtrado de Datos
  const filteredRecords = useMemo(() => {
    const now = Date.now();
    const msInDay = 24 * 60 * 60 * 1000;

    let cutoff = now;
    if (timeRange === '24h') cutoff = now - msInDay;
    if (timeRange === '7d') cutoff = now - (7 * msInDay);
    if (timeRange === '30d') cutoff = now - (30 * msInDay);

    return records
      .filter(r => r.timestamp >= cutoff)
      .filter(r => {
        if (dayFilter === 'all') return true;
        const date = new Date(r.timestamp);
        const hours = date.getHours();
        // Noche: de 20:00 (8 PM) a 08:00 (8 AM)
        return hours >= 20 || hours < 8;
      })
      .reverse(); // Recharts prefiere orden ascendente (viejo -> nuevo)
  }, [records, timeRange, dayFilter]);

  const chartData = useMemo(() => {
    return filteredRecords.map(r => ({
      ...r,
      dateShort: new Date(r.timestamp).toLocaleDateString(undefined, { day: '2-digit', month: '2-digit' }),
      timeShort: new Date(r.timestamp).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
      fullLabel: `${new Date(r.timestamp).toLocaleDateString()} ${new Date(r.timestamp).toLocaleTimeString()}`,
    }));
  }, [filteredRecords]);

  // 2. Estadísticas / Promedios
  const stats = useMemo(() => {
    if (filteredRecords.length === 0) return null;
    const sum = filteredRecords.reduce((acc, r) => ({
      taSys: acc.taSys + r.taSys,
      taDia: acc.taDia + r.taDia,
      fc: acc.fc + r.fc,
      spo2: acc.spo2 + r.spo2,
    }), { taSys: 0, taDia: 0, fc: 0, spo2: 0 });

    const count = filteredRecords.length;
    return {
      taSys: Math.round(sum.taSys / count),
      taDia: Math.round(sum.taDia / count),
      fc: Math.round(sum.fc / count),
      spo2: Math.round(sum.spo2 / count),
      count
    };
  }, [filteredRecords]);

  const downloadMarkdown = () => {
    const text = `# REPORTE MÉDICO: ${patient}\n` +
      `Generado: ${new Date().toLocaleString()}\n` +
      `Filtro: ${timeRange} | ${dayFilter === 'night' ? 'SOLO NOCHE (Apnea Monitor)' : 'Todo el día'}\n\n` +
      `## Promedios del Periodo\n` +
      `- Presión: ${stats?.taSys}/${stats?.taDia}\n` +
      `- Pulso: ${stats?.fc} lpm\n` +
      `- Saturación O2: ${stats?.spo2}%\n\n` +
      `| Fecha | Hora | TA | FC | SPO2 |\n|---|---|---|---|---|\n` +
      filteredRecords.slice().reverse().map(r => `| ${new Date(r.timestamp).toLocaleDateString()} | ${new Date(r.timestamp).toLocaleTimeString()} | ${r.taSys}/${r.taDia} | ${r.fc} | ${r.spo2}% |`).join('\n');

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
          <h1 className="text-xl font-black text-slate-800 flex items-center gap-2">
            📊 Análisis Clínico
          </h1>
          <div className="flex bg-slate-100 p-1 rounded-xl">
            {(['24h', '7d', '30d'] as TimeRange[]).map(t => (
              <button
                key={t}
                onClick={() => setTimeRange(t)}
                className={`px-3 py-1 rounded-lg text-xs font-bold transition-all ${timeRange === t ? 'bg-white shadow text-blue-600' : 'text-slate-400'}`}
              >
                {t}
              </button>
            ))}
          </div>
        </div>

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
            🌙 Solo Noche <span className="opacity-70 font-normal">(Apnea)</span>
          </button>
        </div>
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

      {/* GRÁFICO 2: OXIGENACIÓN (SPO2) - CRÍTICO PARA APNEA */}
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
            {/* ESCALA FIJA 80-100 PARA VER CAÍDAS */}
            <YAxis tick={{ fontSize: 10 }} domain={[80, 100]} />
            <Tooltip content={<CustomTooltip />} />
            <ReferenceLine y={90} stroke="#f59e0b" strokeDasharray="3 3" label={{ value: 'Alerta 90%', fill: '#f59e0b', fontSize: 10 }} />
            <Area type="monotone" dataKey="spo2" name="SPO2 %" stroke="#10b981" fillOpacity={1} fill="url(#colorSpo2)" strokeWidth={2} />
          </AreaChart>
        </ResponsiveContainer>
      </ChartCard>

      {/* GRÁFICO 3: FRECUENCIA CARDÍACA */}
      <ChartCard title="Frecuencia Cardíaca" icon="❤️">
        <ResponsiveContainer width="100%" height="100%">
          <LineChart data={chartData}>
            <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#e2e8f0" />
            <XAxis dataKey="timeShort" tick={{ fontSize: 10 }} stroke="#94a3b8" />
            <YAxis tick={{ fontSize: 10 }} domain={['dataMin - 5', 'dataMax + 5']} />
            <Tooltip content={<CustomTooltip />} />
            <Line type="monotone" dataKey="fc" name="Pulso" stroke="#e11d48" strokeWidth={2} dot={false} />
          </LineChart>
        </ResponsiveContainer>
      </ChartCard>

      <div className="flex gap-4 no-print mt-8">
        <button onClick={downloadMarkdown} className="flex-1 p-4 bg-slate-800 text-white rounded-2xl font-bold text-xs shadow-lg">DESCARGAR INFORME ({timeRange})</button>
      </div>
    </div>
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
