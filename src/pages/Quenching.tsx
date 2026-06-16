import { useState, useMemo } from 'react';
import { useProductionStore } from '@/store/productionStore';
import { Wind, Thermometer, Gauge, Activity, Snowflake, ChevronDown, Play, CheckCircle, Clock, Package, Factory, User, X } from 'lucide-react';
import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, AreaChart, Area, BarChart, Bar, Legend } from 'recharts';
import { cn } from '@/lib/utils';

const statusMap: Record<string, { label: string; color: string; bg: string; icon: typeof Clock }> = {
  pending: { label: '待处理', color: 'text-amber-600', bg: 'bg-amber-100', icon: Clock },
  processing: { label: '淬火中', color: 'text-blue-600', bg: 'bg-blue-100', icon: Activity },
  completed: { label: '已完成', color: 'text-emerald-600', bg: 'bg-emerald-100', icon: CheckCircle },
};

export default function Quenching() {
  const records = useProductionStore((s) => s.quenchingRecords);
  const batches = useProductionStore((s) => s.extrusionBatches);
  const startQuenching = useProductionStore((s) => s.startQuenching);
  const completeQuenching = useProductionStore((s) => s.completeQuenching);
  const [tab, setTab] = useState<'pending' | 'processing' | 'completed'>('pending');
  const [selectedId, setSelectedId] = useState<string | null>(null);
  const [showStartModal, setShowStartModal] = useState(false);
  const [showCompleteModal, setShowCompleteModal] = useState(false);
  const [startOperator, setStartOperator] = useState('李工');

  const list = useMemo(() => records.filter((r) => r.status === tab), [records, tab]);
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
      {/* 状态标签页 */}
      <div className="flex items-center gap-2 bg-white rounded-lg p-1 shadow-sm border border-slate-200/60 w-fit">
        {(['pending', 'processing', 'completed'] as const).map((t) => {
          const s = statusMap[t];
          const Icon = s.icon;
          return (
            <button
              key={t}
              onClick={() => setTab(t)}
              className={cn(
                'px-5 py-2 rounded-md text-sm font-semibold transition-all flex items-center gap-2',
                tab === t ? 'bg-cyan-600 text-white shadow-sm' : 'text-slate-600 hover:bg-slate-100'
              )}
            >
              <Icon className="w-4 h-4" />
              {s.label}
              <span className={cn(
                'px-2 py-0.5 rounded-full text-[10px]',
                tab === t ? 'bg-white/20 text-white' : 'bg-slate-100 text-slate-500'
              )}>
                {records.filter(r => r.status === t).length}
              </span>
            </button>
          );
        })}
      </div>

      {/* 列表区 */}
      <div className="bg-white rounded-xl shadow-sm border border-slate-200/60 overflow-hidden">
        <div className="px-5 py-4 border-b border-slate-100 flex items-center justify-between">
          <h3 className="font-bold text-slate-800 flex items-center gap-2">
            <Wind className="w-5 h-5 text-cyan-500" />
            {statusMap[tab].label}批次列表
          </h3>
          <span className="text-xs text-slate-500">共 {list.length} 条</span>
        </div>
        {list.length === 0 ? (
          <div className="p-10 text-center">
            <Clock className="w-10 h-10 text-slate-300 mx-auto mb-2" />
            <div className="text-sm text-slate-400">暂无{statusMap[tab].label}批次</div>
          </div>
        ) : (
          <div className="divide-y divide-slate-100">
            {list.map((r) => {
              const b = batches.find((x) => x.id === r.batchId);
              const s = statusMap[r.status];
              const Icon = s.icon;
              return (
                <div
                  key={r.id}
                  onClick={() => setSelectedId(r.id)}
                  className={cn(
                    'p-4 cursor-pointer transition-colors',
                    selectedId === r.id ? 'bg-cyan-50/40' : 'hover:bg-slate-50'
                  )}
                >
                  <div className="flex items-center justify-between flex-wrap gap-3">
                    <div className="flex items-center gap-4">
                      <div className={cn('w-10 h-10 rounded-xl flex items-center justify-center', s.bg)}>
                        <Icon className={cn('w-5 h-5', s.color)} />
                      </div>
                      <div>
                        <div className="flex items-center gap-2">
                          <span className="font-mono font-bold text-slate-800">{r.batchNumber}</span>
                          <span className={cn('px-2 py-0.5 rounded-md text-[10px] font-semibold', s.bg, s.color)}>
                            {s.label}
                          </span>
                        </div>
                        <div className="flex items-center gap-3 text-xs text-slate-500 mt-1">
                          <span className="flex items-center gap-1">
                            <Package className="w-3 h-3" />
                            {r.profileType || b?.profileType}
                          </span>
                          {r.outputWeight && (
                            <span className="flex items-center gap-1">
                              <Activity className="w-3 h-3" />
                              产出 {r.outputWeight}kg
                            </span>
                          )}
                          {r.sourceMachineNo && (
                            <span className="flex items-center gap-1">
                              <Factory className="w-3 h-3" />
                              {r.sourceMachineNo}
                            </span>
                          )}
                        </div>
                      </div>
                    </div>
                    <div className="flex items-center gap-2">
                      {r.status === 'pending' && (
                        <button
                          onClick={(e) => { e.stopPropagation(); setSelectedId(r.id); setShowStartModal(true); }}
                          className="px-3 py-1.5 text-xs font-semibold text-white bg-blue-600 rounded-lg hover:bg-blue-700 flex items-center gap-1"
                        >
                          <Play className="w-3.5 h-3.5" />
                          开始淬火
                        </button>
                      )}
                      {r.status === 'processing' && (
                        <button
                          onClick={(e) => { e.stopPropagation(); setSelectedId(r.id); setShowCompleteModal(true); }}
                          className="px-3 py-1.5 text-xs font-semibold text-white bg-emerald-600 rounded-lg hover:bg-emerald-700 flex items-center gap-1"
                        >
                          <CheckCircle className="w-3.5 h-3.5" />
                          完成淬火
                        </button>
                      )}
                      {r.status === 'completed' && (
                        <div className="text-xs text-emerald-600 font-semibold flex items-center gap-1">
                          <CheckCircle className="w-3.5 h-3.5" />
                          可转时效
                        </div>
                      )}
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
        )}
      </div>

      {/* 详情展示 */}
      {selected && (
        <>
          <div className="bg-white rounded-xl shadow-sm border border-slate-200/60 overflow-hidden">
            <div className="px-5 py-4 border-b border-slate-100">
              <h3 className="font-bold text-slate-800 flex items-center gap-2">
                <div className={cn('w-2.5 h-6 rounded-full', statusMap[selected.status].bg.replace('bg-', 'bg-').replace('-100', '-500'))} />
                批次详情 - {selected.batchNumber}
              </h3>
            </div>
            <div className="p-5 bg-gradient-to-br from-cyan-50/70 via-blue-50/30 to-indigo-50/50">
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
                {[
                  { icon: Wind, label: '风冷温度', value: `${selected.airTemp || '--'}℃`, sub: '环境温度', color: 'cyan', bg: 'from-cyan-400 to-cyan-600' },
                  { icon: Activity, label: '风冷速度', value: `${selected.airSpeed || '--'} m/s`, sub: '标准: 15-22', color: 'blue', bg: 'from-blue-400 to-blue-600' },
                  { icon: Thermometer, label: '冷却速率', value: `${selected.coolingRate || '--'}℃/s`, sub: '≥35℃/s合格', color: 'emerald', bg: 'from-emerald-400 to-emerald-600' },
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
              <div className="grid grid-cols-2 md:grid-cols-4 gap-3 mt-4">
                {[
                  { k: '来源机台', v: selected.sourceMachineNo || '--' },
                  { k: '产出重量', v: selected.outputWeight ? `${selected.outputWeight}kg` : '--' },
                  { k: '开始时间', v: selected.startTime || '--' },
                  { k: '结束时间', v: selected.endTime || '--' },
                ].map((item) => (
                  <div key={item.k} className="bg-white/60 rounded-lg p-3 border border-white/70">
                    <div className="text-xs text-slate-500">{item.k}</div>
                    <div className="text-sm font-semibold text-slate-700 mt-0.5">{item.v}</div>
                  </div>
                ))}
              </div>
            </div>
          </div>

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
            </div>
          </div>
        </>
      )}

      {/* 开始淬火模态框 */}
      {showStartModal && selected && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 backdrop-blur-sm p-4">
          <div className="bg-white rounded-2xl shadow-2xl w-full max-w-md overflow-hidden animate-in">
            <div className="px-6 py-4 border-b border-slate-100 flex items-center justify-between bg-gradient-to-r from-blue-50 to-cyan-50">
              <h3 className="text-lg font-bold text-slate-800 flex items-center gap-2">
                <Play className="w-5 h-5 text-blue-600" />
                开始淬火
              </h3>
              <button onClick={() => setShowStartModal(false)} className="w-8 h-8 rounded-lg hover:bg-white/60 flex items-center justify-center text-slate-500">
                <X className="w-5 h-5" />
              </button>
            </div>
            <div className="p-6 space-y-5">
              <div className="p-4 rounded-xl bg-blue-50/50 border border-blue-100">
                <div className="text-sm mb-1.5">
                  <span className="text-slate-500">批次号：</span>
                  <span className="font-mono font-bold text-slate-800">{selected.batchNumber}</span>
                </div>
                <div className="text-sm mb-1.5">
                  <span className="text-slate-500">型材：</span>
                  <span className="font-medium text-slate-700">{selected.profileType || batch?.profileType}</span>
                </div>
                <div className="text-sm">
                  <span className="text-slate-500">来源机台：</span>
                  <span className="font-medium text-slate-700">{selected.sourceMachineNo}</span>
                </div>
              </div>
              <div>
                <label className="text-xs font-semibold text-slate-600 block mb-2">
                  <User className="w-3.5 h-3.5 inline mr-1" />
                  操作人
                </label>
                <input
                  type="text"
                  value={startOperator}
                  onChange={(e) => setStartOperator(e.target.value)}
                  className="w-full px-4 py-3 border border-slate-200 rounded-lg text-sm focus:ring-2 focus:ring-blue-500/30"
                />
              </div>
            </div>
            <div className="px-6 py-4 border-t border-slate-100 flex items-center justify-end gap-3 bg-slate-50/50">
              <button onClick={() => setShowStartModal(false)} className="px-5 py-2.5 text-sm font-semibold text-slate-600 bg-white border border-slate-200 rounded-lg hover:bg-slate-50">
                取消
              </button>
              <button
                onClick={() => {
                  startQuenching(selected.id, startOperator);
                  setShowStartModal(false);
                  setTab('processing');
                }}
                className="px-6 py-2.5 text-sm font-semibold text-white bg-gradient-to-r from-blue-600 to-cyan-600 rounded-lg hover:from-blue-700 hover:to-cyan-700 shadow-md shadow-blue-500/25 flex items-center gap-2"
              >
                <Play className="w-4 h-4" />
                确认开始
              </button>
            </div>
          </div>
        </div>
      )}

      {/* 完成淬火模态框 */}
      {showCompleteModal && selected && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 backdrop-blur-sm p-4">
          <div className="bg-white rounded-2xl shadow-2xl w-full max-w-lg overflow-hidden animate-in">
            <div className="px-6 py-4 border-b border-slate-100 flex items-center justify-between bg-gradient-to-r from-emerald-50 to-teal-50">
              <h3 className="text-lg font-bold text-slate-800 flex items-center gap-2">
                <CheckCircle className="w-5 h-5 text-emerald-600" />
                完成淬火
              </h3>
              <button onClick={() => setShowCompleteModal(false)} className="w-8 h-8 rounded-lg hover:bg-white/60 flex items-center justify-center text-slate-500">
                <X className="w-5 h-5" />
              </button>
            </div>
            <div className="p-6 space-y-5">
              <div className="p-4 rounded-xl bg-emerald-50/50 border border-emerald-100">
                <div className="text-sm mb-1.5">
                  <span className="text-slate-500">批次号：</span>
                  <span className="font-mono font-bold text-slate-800">{selected.batchNumber}</span>
                </div>
                <div className="text-sm">
                  <span className="text-slate-500">提示：</span>
                  <span className="font-medium text-slate-700">完成后将流转至时效处理工序待装炉</span>
                </div>
              </div>
              <div className="grid grid-cols-2 gap-4">
                {[
                  { k: 'airTemp', label: '风冷温度(℃)', v: selected.airTemp || 30 },
                  { k: 'airSpeed', label: '风冷速度(m/s)', v: selected.airSpeed || 18 },
                  { k: 'zone1Temp', label: '入口段温度(℃)', v: selected.zone1Temp || 250 },
                  { k: 'zone2Temp', label: '中段温度(℃)', v: selected.zone2Temp || 170 },
                  { k: 'zone3Temp', label: '出口段温度(℃)', v: selected.zone3Temp || 95 },
                  { k: 'coolingRate', label: '冷却速率(℃/s)', v: selected.coolingRate || 42 },
                ].map((item) => (
                  <div key={item.k}>
                    <label className="text-xs font-semibold text-slate-600 block mb-1.5">{item.label}</label>
                    <input
                      id={item.k}
                      type="number"
                      defaultValue={item.v}
                      className="w-full px-3 py-2 border border-slate-200 rounded-lg text-sm font-mono tabular-nums focus:ring-2 focus:ring-emerald-500/30"
                    />
                  </div>
                ))}
                <div className="col-span-2">
                  <label className="text-xs font-semibold text-slate-600 block mb-1.5">淬火硬度 (HW)</label>
                  <input
                    id="hardness"
                    type="number"
                    defaultValue={selected.hardness || 12}
                    className="w-full px-3 py-2 border border-slate-200 rounded-lg text-sm font-mono tabular-nums focus:ring-2 focus:ring-emerald-500/30"
                  />
                </div>
              </div>
            </div>
            <div className="px-6 py-4 border-t border-slate-100 flex items-center justify-end gap-3 bg-slate-50/50">
              <button onClick={() => setShowCompleteModal(false)} className="px-5 py-2.5 text-sm font-semibold text-slate-600 bg-white border border-slate-200 rounded-lg hover:bg-slate-50">
                取消
              </button>
              <button
                onClick={() => {
                  const getVal = (id: string) => parseFloat((document.getElementById(id) as HTMLInputElement)?.value || '0');
                  completeQuenching(selected.id, {
                    airTemp: getVal('airTemp'),
                    airSpeed: getVal('airSpeed'),
                    zone1Temp: getVal('zone1Temp'),
                    zone2Temp: getVal('zone2Temp'),
                    zone3Temp: getVal('zone3Temp'),
                    coolingRate: getVal('coolingRate'),
                    hardness: getVal('hardness'),
                  });
                  setShowCompleteModal(false);
                  setTab('completed');
                }}
                className="px-6 py-2.5 text-sm font-semibold text-white bg-gradient-to-r from-emerald-600 to-teal-600 rounded-lg hover:from-emerald-700 hover:to-teal-700 shadow-md shadow-emerald-500/25 flex items-center gap-2"
              >
                <CheckCircle className="w-4 h-4" />
                确认完成，转时效
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
