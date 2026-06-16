import { useState } from 'react';
import { useProductionStore } from '@/store/productionStore';
import { ThermometerSun, Play, Clock, Check, Flame, Timer, ChevronDown } from 'lucide-react';
import { AreaChart, Area, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, ReferenceLine, Legend } from 'recharts';
import { cn } from '@/lib/utils';

const agingStatusMap: Record<string, { label: string; color: string; bg: string; icon: typeof Play }> = {
  pending: { label: '待装炉', color: 'text-slate-600', bg: 'bg-slate-100', icon: Clock },
  heating: { label: '升温中', color: 'text-orange-600', bg: 'bg-orange-100', icon: Flame },
  holding: { label: '保温中', color: 'text-amber-600', bg: 'bg-amber-100', icon: Timer },
  cooling: { label: '冷却中', color: 'text-cyan-600', bg: 'bg-cyan-100', icon: Clock },
  completed: { label: '已完成', color: 'text-emerald-600', bg: 'bg-emerald-100', icon: Check },
};

export default function Aging() {
  const records = useProductionStore((s) => s.agingRecords);
  const [selectedId, setSelectedId] = useState(records[0]?.id || '');

  const selected = records.find((r) => r.id === selectedId);

  const processPhases = [
    { key: 'heating', label: '升温阶段', color: 'bg-red-500', textColor: 'text-red-600', bgColor: 'bg-red-50', desc: '室温 → 设定温度' },
    { key: 'holding', label: '保温阶段', color: 'bg-emerald-500', textColor: 'text-emerald-600', bgColor: 'bg-emerald-50', desc: '恒温保持' },
    { key: 'cooling', label: '冷却阶段', color: 'bg-blue-500', textColor: 'text-blue-600', bgColor: 'bg-blue-50', desc: '随炉冷却' },
  ];

  const getPhaseProgress = () => {
    if (!selected || !selected.tempCurve.length) return { heating: 0, holding: 0, cooling: 0 };
    const last = selected.tempCurve[selected.tempCurve.length - 1];
    if (last.phase === 'heating') return { heating: (selected.tempCurve.filter(p => p.phase === 'heating').length / 21) * 100, holding: 0, cooling: 0 };
    if (last.phase === 'holding') return { heating: 100, holding: (selected.tempCurve.filter(p => p.phase === 'holding').length / 24) * 100, cooling: 0 };
    if (last.phase === 'cooling') return { heating: 100, holding: 100, cooling: (selected.tempCurve.filter(p => p.phase === 'cooling').length / 16) * 100 };
    return { heating: 100, holding: 100, cooling: 100 };
  };

  const progress = selected ? getPhaseProgress() : { heating: 0, holding: 0, cooling: 0 };
  const totalProgress = (progress.heating + progress.holding + progress.cooling) / 3;
  const status = selected ? agingStatusMap[selected.status] : agingStatusMap.pending;

  return (
    <div className="space-y-6">
      <div className="bg-white rounded-xl shadow-sm border border-slate-200/60 overflow-hidden">
        <div className="px-5 py-4 border-b border-slate-100 flex items-center justify-between flex-wrap gap-4">
          <div className="flex items-center gap-4">
            <h3 className="font-bold text-slate-800 flex items-center gap-2">
              <ThermometerSun className="w-5 h-5 text-amber-500" />
              时效炉批次监控
            </h3>
            <div className="relative">
              <select
                value={selectedId}
                onChange={(e) => setSelectedId(e.target.value)}
                className="appearance-none pl-3 pr-9 py-2 text-sm bg-slate-50 border border-slate-200 rounded-lg font-semibold text-slate-700"
              >
                {records.map((r) => (
                  <option key={r.id} value={r.id}>
                    {r.furnaceNo} - {r.batchNumber}
                  </option>
                ))}
              </select>
              <ChevronDown className="w-4 h-4 absolute right-2.5 top-1/2 -translate-y-1/2 text-slate-400 pointer-events-none" />
            </div>
          </div>
          <div className="flex items-center gap-3">
            <div className={cn(
              'inline-flex items-center gap-2 px-3 py-1.5 rounded-lg font-semibold text-sm',
              status.bg, status.color
            )}>
              <status.icon className="w-4 h-4" />
              {status.label}
            </div>
            <div className="text-sm">
              <span className="text-slate-500">总进度: </span>
              <span className="font-bold text-amber-600 tabular-nums">{totalProgress.toFixed(0)}%</span>
            </div>
          </div>
        </div>

        {selected && (
          <div className="p-5 bg-gradient-to-br from-amber-50/50 via-orange-50/30 to-yellow-50/40">
            <div className="relative">
              <div className="absolute top-5 left-0 right-0 h-1.5 bg-slate-200 rounded-full mx-16" />
              <div className="grid grid-cols-3 gap-4 relative">
                {processPhases.map((phase, idx) => {
                  const done = progress[phase.key as keyof typeof progress] >= 100;
                  const active = !done && progress[phase.key as keyof typeof progress] > 0;
                  return (
                    <div key={phase.key} className="flex flex-col items-center">
                      {idx < 2 && (
                        <div
                          className={cn(
                            'absolute top-5 h-1.5 rounded-full z-10',
                            phase.color
                          )}
                          style={{
                            left: `${idx * 33.33 + 8}%`,
                            width: `${17 + (progress[phase.key as keyof typeof progress] / 100) * 16}%`,
                            opacity: progress[phase.key as keyof typeof progress] > 0 ? 1 : 0,
                            transition: 'all 0.5s ease',
                          }}
                        />
                      )}
                      <div className={cn(
                        'w-10 h-10 rounded-full flex items-center justify-center relative z-20 border-4 transition-all duration-500',
                        done
                          ? `${phase.color} text-white border-white shadow-lg`
                          : active
                          ? `${phase.color} text-white border-white shadow-lg ring-4 ring-opacity-40 animate-pulse`
                          : 'bg-slate-100 text-slate-400 border-white'
                      )}>
                        {done ? <Check className="w-5 h-5" /> : <Clock className="w-5 h-5" />}
                      </div>
                      <div className="mt-3 text-center">
                        <div className={cn(
                          'text-sm font-bold',
                          done || active ? phase.textColor : 'text-slate-400'
                        )}>
                          {phase.label}
                        </div>
                        <div className="text-[11px] text-slate-500 mt-0.5">{phase.desc}</div>
                        <div className="mt-2 px-2 py-0.5 rounded text-xs font-semibold tabular-nums bg-white/60">
                          {progress[phase.key as keyof typeof progress].toFixed(0)}%
                        </div>
                      </div>
                    </div>
                  );
                })}
              </div>
            </div>

            <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mt-6">
              {[
                { k: '炉号', v: selected.furnaceNo, icon: ThermometerSun },
                { k: '装炉量', v: `${selected.chargeAmount || 0} 吨` },
                { k: '保温温度', v: `${selected.holdingTemp || 0}℃` },
                { k: '保温时间', v: `${selected.holdingTime || 0} min` },
              ].map((item, i) => (
                <div key={i} className="bg-white rounded-xl p-4 border border-white shadow-sm">
                  <div className="text-xs text-slate-500">{item.k}</div>
                  <div className="text-xl font-bold text-slate-800 mt-1 tabular-nums">{item.v}</div>
                </div>
              ))}
            </div>
          </div>
        )}
      </div>

      {selected && (
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          <div className="bg-white rounded-xl p-5 shadow-sm border border-slate-200/60 lg:col-span-2">
            <div className="flex items-center justify-between mb-4">
              <h3 className="text-base font-bold text-slate-800 flex items-center gap-2">
                <span className="w-1 h-5 bg-amber-500 rounded-full" />
                时效炉温曲线
              </h3>
              <div className="text-xs text-slate-500">
                采集点: {selected.tempCurve.length} 个
              </div>
            </div>
            <div className="h-72">
              <ResponsiveContainer width="100%" height="100%">
                <AreaChart data={selected.tempCurve}>
                  <defs>
                    <linearGradient id="agHeat" x1="0" y1="0" x2="0" y2="1">
                      <stop offset="0%" stopColor="#ef4444" stopOpacity={0.35} />
                      <stop offset="100%" stopColor="#ef4444" stopOpacity={0} />
                    </linearGradient>
                    <linearGradient id="agHold" x1="0" y1="0" x2="0" y2="1">
                      <stop offset="0%" stopColor="#10b981" stopOpacity={0.35} />
                      <stop offset="100%" stopColor="#10b981" stopOpacity={0} />
                    </linearGradient>
                    <linearGradient id="agCool" x1="0" y1="0" x2="0" y2="1">
                      <stop offset="0%" stopColor="#3b82f6" stopOpacity={0.35} />
                      <stop offset="100%" stopColor="#3b82f6" stopOpacity={0} />
                    </linearGradient>
                  </defs>
                  <CartesianGrid strokeDasharray="3 3" stroke="#f1f5f9" />
                  <XAxis
                    dataKey="time"
                    tick={{ fontSize: 11, fill: '#94a3b8' }}
                    tickLine={false}
                    axisLine={{ stroke: '#e2e8f0' }}
                    tickFormatter={(v) => `${v}min`}
                    label={{ value: '处理时间 (min)', position: 'bottom', fontSize: 11, fill: '#94a3b8' }}
                  />
                  <YAxis
                    tick={{ fontSize: 11, fill: '#94a3b8' }}
                    tickLine={false}
                    axisLine={false}
                    width={40}
                    label={{ value: '温度 (℃)', angle: -90, position: 'insideLeft', fontSize: 11, fill: '#94a3b8' }}
                  />
                  <Tooltip
                    contentStyle={{ borderRadius: 8, border: '1px solid #e2e8f0', fontSize: 12 }}
                    formatter={(value: number) => [`${value.toFixed(1)}℃`, '温度']}
                    labelFormatter={(label) => `时间: ${label} min`}
                  />
                  <ReferenceLine
                    y={selected.holdingTemp}
                    stroke="#f59e0b"
                    strokeDasharray="5 5"
                    label={{ value: `设定 ${selected.holdingTemp}℃`, fill: '#f59e0b', fontSize: 11, position: 'right' }}
                  />
                  {selected.tempCurve.length > 0 && (
                    <>
                      <Area
                        type="monotone"
                        dataKey="temp"
                        stroke="#ef4444"
                        strokeWidth={2.5}
                        fill="url(#agHeat)"
                        data={selected.tempCurve.filter(p => p.phase === 'heating')}
                        connectNulls
                        name="升温段"
                      />
                      <Area
                        type="monotone"
                        dataKey="temp"
                        stroke="#10b981"
                        strokeWidth={2.5}
                        fill="url(#agHold)"
                        data={selected.tempCurve.filter(p => p.phase === 'holding')}
                        connectNulls
                        name="保温段"
                      />
                      <Area
                        type="monotone"
                        dataKey="temp"
                        stroke="#3b82f6"
                        strokeWidth={2.5}
                        fill="url(#agCool)"
                        data={selected.tempCurve.filter(p => p.phase === 'cooling')}
                        connectNulls
                        name="冷却段"
                      />
                    </>
                  )}
                  <Legend iconType="circle" wrapperStyle={{ fontSize: 12 }} />
                </AreaChart>
              </ResponsiveContainer>
            </div>
          </div>

          <div className="space-y-4">
            <div className="bg-white rounded-xl p-5 shadow-sm border border-slate-200/60">
              <h4 className="text-sm font-bold text-slate-800 mb-4">工艺参数卡片</h4>
              <div className="space-y-3">
                {[
                  { k: '升温速率', v: `${selected.heatingRate}℃/h`, color: 'text-red-500', bg: 'bg-red-50' },
                  { k: '保温温度', v: `${selected.holdingTemp}℃`, color: 'text-emerald-500', bg: 'bg-emerald-50' },
                  { k: '保温时长', v: `${selected.holdingTime} min`, color: 'text-amber-500', bg: 'bg-amber-50' },
                  { k: '冷却速度', v: `${selected.coolingRate}℃/h`, color: 'text-blue-500', bg: 'bg-blue-50' },
                ].map((item, i) => (
                  <div key={i} className={`flex items-center justify-between p-3 rounded-lg ${item.bg}`}>
                    <span className="text-sm text-slate-600">{item.k}</span>
                    <span className={`font-mono font-bold text-lg tabular-nums ${item.color}`}>{item.v}</span>
                  </div>
                ))}
              </div>
            </div>

            <div className="bg-white rounded-xl p-5 shadow-sm border border-slate-200/60">
              <h4 className="text-sm font-bold text-slate-800 mb-3">批次追溯信息</h4>
              <div className="space-y-2 text-sm">
                {[
                  { k: '批次号', v: selected.batchNumber },
                  { k: '开始时间', v: selected.startTime || '--' },
                  { k: '结束时间', v: selected.endTime || '进行中' },
                  { k: '操作人员', v: selected.operator || '--' },
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
