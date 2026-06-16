import { useState } from 'react';
import { useProductionStore } from '@/store/productionStore';
import { Wind, Thermometer, Gauge, Activity, Snowflake, ChevronDown } from 'lucide-react';
import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, AreaChart, Area, BarChart, Bar, Legend } from 'recharts';

export default function Quenching() {
  const records = useProductionStore((s) => s.quenchingRecords);
  const batches = useProductionStore((s) => s.extrusionBatches);
  const [selectedId, setSelectedId] = useState(records[0]?.id || '');

  const selected = records.find((r) => r.id === selectedId);
  const batch = batches.find((b) => b.id === selected?.batchId);

  const zoneTempData = [
    { zone: '入口段', temp: selected?.zone1Temp || 0, standard: 250, type: '实际温度' },
    { zone: '中段', temp: selected?.zone2Temp || 0, standard: 170, type: '实际温度' },
    { zone: '出口段', temp: selected?.zone3Temp || 0, standard: 100, type: '实际温度' },
  ];

  const processTimeline = [
    { t: '0min', z1: 520, z2: 500, z3: 480 },
    { t: '0.5', z1: 420, z2: 380, z3: 340 },
    { t: '1.0', z1: 310, z2: 260, z3: 210 },
    { t: '1.5', z1: 248, z2: 195, z3: 142 },
    { t: '2.0', z1: 245, z2: 168, z3: 95 },
    { t: '2.5', z1: 243, z2: 165, z3: 92 },
    { t: '3.0', z1: 244, z2: 166, z3: 93 },
  ];

  return (
    <div className="space-y-6">
      <div className="bg-white rounded-xl shadow-sm border border-slate-200/60 overflow-hidden">
        <div className="px-5 py-4 border-b border-slate-100 flex items-center justify-between">
          <h3 className="font-bold text-slate-800 flex items-center gap-2">
            <Wind className="w-5 h-5 text-cyan-500" />
            淬火批次记录
          </h3>
          <div className="relative">
            <select
              value={selectedId}
              onChange={(e) => setSelectedId(e.target.value)}
              className="appearance-none pl-3 pr-9 py-2 text-sm bg-slate-50 border border-slate-200 rounded-lg focus:ring-2 focus:ring-cyan-500/30 font-semibold text-slate-700"
            >
              {records.map((r) => (
                <option key={r.id} value={r.id}>
                  {r.batchNumber}
                </option>
              ))}
            </select>
            <ChevronDown className="w-4 h-4 absolute right-2.5 top-1/2 -translate-y-1/2 text-slate-400 pointer-events-none" />
          </div>
        </div>

        {selected && (
          <div className="p-5 bg-gradient-to-br from-cyan-50/70 via-blue-50/30 to-indigo-50/50">
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
              {[
                { icon: Wind, label: '风冷温度', value: `${selected.airTemp}℃`, sub: '环境温度', color: 'cyan', bg: 'from-cyan-400 to-cyan-600' },
                { icon: Activity, label: '风冷速度', value: `${selected.airSpeed} m/s`, sub: '风速标准: 15-22', color: 'blue', bg: 'from-blue-400 to-blue-600' },
                { icon: Thermometer, label: '冷却速率', value: `${selected.coolingRate}℃/s`, sub: '≥35℃/s合格', color: 'emerald', bg: 'from-emerald-400 to-emerald-600' },
                { icon: Gauge, label: '淬火硬度', value: selected.hardness ? `${selected.hardness} HW` : '检测中', sub: '标准: ≥10', color: 'purple', bg: 'from-purple-400 to-purple-600' },
              ].map((s, i) => (
                <div key={i} className="relative bg-white rounded-xl p-4 border border-white shadow-sm overflow-hidden">
                  <div className={`absolute top-0 right-0 w-20 h-20 bg-gradient-to-br ${s.bg} rounded-full -mr-6 -mt-6 opacity-10`} />
                  <div className="flex items-start justify-between mb-3 relative">
                    <div className={`w-10 h-10 rounded-xl bg-gradient-to-br ${s.bg} flex items-center justify-center shadow-md`}>
                      <s.icon className="w-5 h-5 text-white" />
                    </div>
                  </div>
                  <div className="text-xs text-slate-500">{s.label}</div>
                  <div className={`text-2xl font-bold mt-0.5 tabular-nums text-${s.color}-600`}>
                    {s.value}
                  </div>
                  <div className="text-[11px] text-slate-400 mt-1">{s.sub}</div>
                </div>
              ))}
            </div>
          </div>
        )}
      </div>

      {selected && (
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          <div className="bg-white rounded-xl p-5 shadow-sm border border-slate-200/60 lg:col-span-2">
            <h3 className="text-base font-bold text-slate-800 mb-4 flex items-center gap-2">
              <span className="w-1 h-5 bg-cyan-500 rounded-full" />
              淬火各区段温度变化曲线
            </h3>
            <div className="h-60">
              <ResponsiveContainer width="100%" height="100%">
                <AreaChart data={processTimeline}>
                  <defs>
                    <linearGradient id="qz1" x1="0" y1="0" x2="0" y2="1">
                      <stop offset="0%" stopColor="#ef4444" stopOpacity={0.25} />
                      <stop offset="100%" stopColor="#ef4444" stopOpacity={0} />
                    </linearGradient>
                    <linearGradient id="qz2" x1="0" y1="0" x2="0" y2="1">
                      <stop offset="0%" stopColor="#f59e0b" stopOpacity={0.25} />
                      <stop offset="100%" stopColor="#f59e0b" stopOpacity={0} />
                    </linearGradient>
                    <linearGradient id="qz3" x1="0" y1="0" x2="0" y2="1">
                      <stop offset="0%" stopColor="#06b6d4" stopOpacity={0.25} />
                      <stop offset="100%" stopColor="#06b6d4" stopOpacity={0} />
                    </linearGradient>
                  </defs>
                  <CartesianGrid strokeDasharray="3 3" stroke="#f1f5f9" />
                  <XAxis dataKey="t" tick={{ fontSize: 11, fill: '#94a3b8' }} tickLine={false} axisLine={{ stroke: '#e2e8f0' }} label={{ value: '时间 (min)', position: 'bottom', fontSize: 11, fill: '#94a3b8' }} />
                  <YAxis tick={{ fontSize: 11, fill: '#94a3b8' }} tickLine={false} axisLine={false} width={40} label={{ value: '温度 (℃)', angle: -90, position: 'insideLeft', fontSize: 11, fill: '#94a3b8' }} />
                  <Tooltip contentStyle={{ borderRadius: 8, border: '1px solid #e2e8f0', fontSize: 12 }} />
                  <Legend iconType="circle" wrapperStyle={{ fontSize: 12 }} />
                  <Area type="monotone" dataKey="z1" name="入口段" stroke="#ef4444" strokeWidth={2.5} fill="url(#qz1)" />
                  <Area type="monotone" dataKey="z2" name="中段" stroke="#f59e0b" strokeWidth={2.5} fill="url(#qz2)" />
                  <Area type="monotone" dataKey="z3" name="出口段" stroke="#06b6d4" strokeWidth={2.5} fill="url(#qz3)" />
                </AreaChart>
              </ResponsiveContainer>
            </div>
          </div>

          <div className="space-y-6">
            <div className="bg-white rounded-xl p-5 shadow-sm border border-slate-200/60">
              <h3 className="text-base font-bold text-slate-800 mb-4 flex items-center gap-2">
                <Snowflake className="w-5 h-5 text-blue-500" />
                区段温度对比
              </h3>
              <div className="h-44">
                <ResponsiveContainer width="100%" height="100%">
                  <BarChart data={zoneTempData} barSize={20}>
                    <CartesianGrid strokeDasharray="3 3" stroke="#f1f5f9" vertical={false} />
                    <XAxis dataKey="zone" tick={{ fontSize: 11, fill: '#64748b' }} tickLine={false} axisLine={false} />
                    <YAxis tick={{ fontSize: 10, fill: '#94a3b8' }} tickLine={false} axisLine={false} width={32} />
                    <Tooltip contentStyle={{ borderRadius: 8, border: '1px solid #e2e8f0', fontSize: 12 }} />
                    <Bar dataKey="temp" name="实际温度" radius={[4, 4, 0, 0]} fill="#06b6d4" />
                    <Bar dataKey="standard" name="标准值" radius={[4, 4, 0, 0]} fill="#cbd5e1" />
                  </BarChart>
                </ResponsiveContainer>
              </div>
            </div>

            <div className="bg-white rounded-xl p-5 shadow-sm border border-slate-200/60">
              <h4 className="text-sm font-bold text-slate-800 mb-3">工艺参数详情</h4>
              <div className="space-y-2 text-sm">
                {[
                  { k: '批次号', v: selected.batchNumber },
                  { k: '型材类型', v: batch?.profileType || '--' },
                  { k: '开始时间', v: selected.startTime },
                  { k: '结束时间', v: selected.endTime || '进行中' },
                  { k: '操作人员', v: selected.operator },
                ].map((item) => (
                  <div key={item.k} className="flex justify-between py-1.5 border-b border-slate-50 last:border-0">
                    <span className="text-slate-500">{item.k}</span>
                    <span className="font-semibold text-slate-700 font-mono">{item.v}</span>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
