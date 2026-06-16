import { useState } from 'react';
import { useProductionStore } from '@/store/productionStore';
import { ThermometerSun, Play, Clock, Check, Flame, Timer, ChevronDown, Plus, User, Factory, ArrowRight, CheckCircle, Inbox, Zap } from 'lucide-react';
import { AreaChart, Area, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, ReferenceLine, Legend } from 'recharts';
import { cn } from '@/lib/utils';
import type { QuenchingRecord } from '@/data/types';

const agingStatusMap: Record<string, { label: string; color: string; bg: string; icon: typeof Play }> = {
  pending: { label: '待装炉', color: 'text-slate-600', bg: 'bg-slate-100', icon: Clock },
  heating: { label: '升温中', color: 'text-orange-600', bg: 'bg-orange-100', icon: Flame },
  holding: { label: '保温中', color: 'text-amber-600', bg: 'bg-amber-100', icon: Timer },
  cooling: { label: '冷却中', color: 'text-cyan-600', bg: 'bg-cyan-100', icon: Clock },
  completed: { label: '已完成', color: 'text-emerald-600', bg: 'bg-emerald-100', icon: Check },
};

export default function Aging() {
  const quenchingRecords = useProductionStore((s) => s.quenchingRecords);
  const records = useProductionStore((s) => s.agingRecords);
  const extrusionBatches = useProductionStore((s) => s.extrusionBatches);
  const createAgingFromQuenching = useProductionStore((s) => s.createAgingFromQuenching);
  const completeAging = useProductionStore((s) => s.completeAging);

  const [selectedId, setSelectedId] = useState(records[0]?.id || '');
  const [showChargeModal, setShowChargeModal] = useState(false);
  const [selectedQuenching, setSelectedQuenching] = useState<QuenchingRecord | null>(null);
  const [chargeForm, setChargeForm] = useState({
    furnaceNo: '时效炉01',
    chargeAmount: 0,
    operator: '王工',
  });

  const pendingQuenchings = quenchingRecords.filter((q) => q.status === 'completed');

  const selected = records.find((r) => r.id === selectedId);

  const processPhases = [
    { key: 'heating', label: '升温阶段', color: 'bg-orange-500', textColor: 'text-orange-600', bgColor: 'bg-orange-50', desc: '室温 → 设定温度' },
    { key: 'holding', label: '保温阶段', color: 'bg-amber-500', textColor: 'text-amber-600', bgColor: 'bg-amber-50', desc: '恒温保持' },
    { key: 'cooling', label: '冷却阶段', color: 'bg-slate-500', textColor: 'text-slate-600', bgColor: 'bg-slate-50', desc: '随炉冷却' },
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
  const isInProgress = selected && (selected.status === 'heating' || selected.status === 'holding' || selected.status === 'cooling');

  const handleOpenChargeModal = (q: QuenchingRecord) => {
    setSelectedQuenching(q);
    setChargeForm({
      furnaceNo: '时效炉01',
      chargeAmount: Number(((q.outputWeight || 0) / 1000).toFixed(2)),
      operator: '王工',
    });
    setShowChargeModal(true);
  };

  const handleConfirmCharge = () => {
    if (!selectedQuenching) return;
    createAgingFromQuenching(
      selectedQuenching.id,
      chargeForm.furnaceNo,
      chargeForm.chargeAmount,
      chargeForm.operator
    );
    setShowChargeModal(false);
    setSelectedQuenching(null);
  };

  const getBatchForQuenching = (q: QuenchingRecord) => {
    return extrusionBatches.find((b) => b.id === q.batchId);
  };

  return (
    <div className="space-y-6">
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        <div className="lg:col-span-1">
          <div className="bg-slate-800 rounded-xl shadow-sm border border-slate-700 overflow-hidden">
            <div className="px-5 py-4 border-b border-slate-700/60 bg-gradient-to-r from-slate-800 to-slate-700">
              <div className="flex items-center justify-between">
                <h3 className="font-bold text-slate-100 flex items-center gap-2">
                  <Inbox className="w-5 h-5 text-amber-400" />
                  待装炉队列
                </h3>
                <div className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-md bg-amber-500/20 text-amber-400 text-xs font-bold">
                  <Zap className="w-3.5 h-3.5" />
                  {pendingQuenchings.length} 批
                </div>
              </div>
              <p className="text-xs text-slate-400 mt-1">淬火完成批次，等待装炉时效处理</p>
            </div>
            <div className="max-h-[560px] overflow-y-auto p-3 space-y-2">
              {pendingQuenchings.length === 0 ? (
                <div className="text-center py-12">
                  <div className="w-16 h-16 mx-auto rounded-full bg-slate-700/50 flex items-center justify-center mb-3">
                    <Check className="w-8 h-8 text-slate-500" />
                  </div>
                  <p className="text-sm text-slate-400">暂无待装炉批次</p>
                  <p className="text-xs text-slate-500 mt-1">淬火完成的批次将显示在此处</p>
                </div>
              ) : (
                pendingQuenchings.map((q) => {
                  const batch = getBatchForQuenching(q);
                  return (
                    <div
                      key={q.id}
                      className="bg-slate-700/40 rounded-lg p-3.5 border border-slate-600/30 hover:border-amber-500/40 hover:bg-slate-700/60 transition-all group"
                    >
                      <div className="flex items-start justify-between gap-2">
                        <div className="flex-1 min-w-0">
                          <div className="flex items-center gap-2">
                            <span className="font-mono text-sm font-bold text-slate-100">{q.batchNumber}</span>
                            <span className="px-1.5 py-0.5 rounded bg-emerald-500/20 text-emerald-400 text-[10px] font-bold">
                              淬火完成
                            </span>
                          </div>
                          <div className="mt-2 space-y-1">
                            <div className="flex items-center gap-1.5 text-xs">
                              <Factory className="w-3 h-3 text-slate-500" />
                              <span className="text-slate-400">型材：</span>
                              <span className="text-slate-200 font-medium">{q.profileType || batch?.profileType || '--'}</span>
                            </div>
                            <div className="flex items-center gap-1.5 text-xs">
                              <ArrowRight className="w-3 h-3 text-slate-500" />
                              <span className="text-slate-400">产出：</span>
                              <span className="text-amber-400 font-bold tabular-nums">{q.outputWeight || 0} kg</span>
                            </div>
                            <div className="flex items-center gap-1.5 text-xs">
                              <User className="w-3 h-3 text-slate-500" />
                              <span className="text-slate-400">机台：</span>
                              <span className="text-slate-200 font-medium">{q.sourceMachineNo || '--'}</span>
                            </div>
                          </div>
                        </div>
                      </div>
                      <button
                        onClick={() => handleOpenChargeModal(q)}
                        className={cn(
                          'mt-3 w-full flex items-center justify-center gap-1.5 py-2 rounded-md text-sm font-bold transition-all',
                          'bg-gradient-to-r from-amber-500 to-orange-500 text-white hover:from-amber-600 hover:to-orange-600',
                          'shadow-sm shadow-amber-500/20'
                        )}
                      >
                        <Plus className="w-4 h-4" />
                        装炉
                      </button>
                    </div>
                  );
                })
              )}
            </div>
          </div>
        </div>

        <div className="lg:col-span-2 space-y-6">
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
                    className="appearance-none pl-3 pr-9 py-2 text-sm bg-slate-50 border border-slate-200 rounded-lg font-semibold text-slate-700 focus:ring-2 focus:ring-amber-500/30"
                  >
                    {records.length === 0 && <option value="">暂无记录</option>}
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
                {isInProgress && (
                  <button
                    onClick={() => selected && completeAging(selected.id)}
                    className="inline-flex items-center gap-1.5 px-3.5 py-1.5 rounded-lg text-sm font-bold text-white bg-gradient-to-r from-emerald-500 to-teal-500 hover:from-emerald-600 hover:to-teal-600 shadow-sm shadow-emerald-500/25 transition-all"
                  >
                    <CheckCircle className="w-4 h-4" />
                    完成时效
                  </button>
                )}
              </div>
            </div>

            {selected && (
              <div className="p-5 bg-gradient-to-br from-amber-50/50 via-orange-50/30 to-slate-50/40">
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

            {!selected && (
              <div className="p-12 text-center">
                <div className="w-20 h-20 mx-auto rounded-full bg-slate-100 flex items-center justify-center mb-4">
                  <ThermometerSun className="w-10 h-10 text-slate-300" />
                </div>
                <p className="text-slate-500 font-medium">暂无时效记录</p>
                <p className="text-sm text-slate-400 mt-1">请先从左侧待装炉队列中选择批次装炉</p>
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
                          <stop offset="0%" stopColor="#f97316" stopOpacity={0.35} />
                          <stop offset="100%" stopColor="#f97316" stopOpacity={0} />
                        </linearGradient>
                        <linearGradient id="agHold" x1="0" y1="0" x2="0" y2="1">
                          <stop offset="0%" stopColor="#f59e0b" stopOpacity={0.35} />
                          <stop offset="100%" stopColor="#f59e0b" stopOpacity={0} />
                        </linearGradient>
                        <linearGradient id="agCool" x1="0" y1="0" x2="0" y2="1">
                          <stop offset="0%" stopColor="#64748b" stopOpacity={0.35} />
                          <stop offset="100%" stopColor="#64748b" stopOpacity={0} />
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
                            stroke="#f97316"
                            strokeWidth={2.5}
                            fill="url(#agHeat)"
                            data={selected.tempCurve.filter(p => p.phase === 'heating')}
                            connectNulls
                            name="升温段"
                          />
                          <Area
                            type="monotone"
                            dataKey="temp"
                            stroke="#f59e0b"
                            strokeWidth={2.5}
                            fill="url(#agHold)"
                            data={selected.tempCurve.filter(p => p.phase === 'holding')}
                            connectNulls
                            name="保温段"
                          />
                          <Area
                            type="monotone"
                            dataKey="temp"
                            stroke="#64748b"
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
                      { k: '升温速率', v: `${selected.heatingRate}℃/h`, color: 'text-orange-500', bg: 'bg-orange-50' },
                      { k: '保温温度', v: `${selected.holdingTemp}℃`, color: 'text-amber-500', bg: 'bg-amber-50' },
                      { k: '保温时长', v: `${selected.holdingTime} min`, color: 'text-amber-600', bg: 'bg-amber-50' },
                      { k: '冷却速度', v: `${selected.coolingRate}℃/h`, color: 'text-slate-500', bg: 'bg-slate-50' },
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
                      { k: '型材类型', v: selected.profileType || '--' },
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
      </div>

      {showChargeModal && selectedQuenching && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 backdrop-blur-sm p-4">
          <div className="bg-white rounded-2xl shadow-2xl w-full max-w-lg overflow-hidden animate-in">
            <div className="px-6 py-4 border-b border-slate-100 flex items-center justify-between bg-gradient-to-r from-slate-800 to-slate-700">
              <h3 className="text-lg font-bold text-slate-100 flex items-center gap-2">
                <Flame className="w-5 h-5 text-amber-400" />
                时效炉装炉
              </h3>
              <button
                onClick={() => {
                  setShowChargeModal(false);
                  setSelectedQuenching(null);
                }}
                className="w-8 h-8 rounded-lg hover:bg-slate-600/50 flex items-center justify-center text-slate-300"
              >
                ✕
              </button>
            </div>
            <div className="p-6 space-y-5">
              <div className="p-4 rounded-xl bg-gradient-to-r from-amber-50 to-orange-50 border border-amber-100">
                <div className="text-xs font-semibold text-amber-700 mb-2.5 flex items-center gap-1.5">
                  <Inbox className="w-3.5 h-3.5" />
                  待装炉批次信息
                </div>
                <div className="grid grid-cols-2 gap-3 text-sm">
                  <div>
                    <span className="text-slate-500 text-xs">批次号</span>
                    <div className="font-mono font-bold text-slate-800">{selectedQuenching.batchNumber}</div>
                  </div>
                  <div>
                    <span className="text-slate-500 text-xs">型材类型</span>
                    <div className="font-semibold text-slate-800">{selectedQuenching.profileType || getBatchForQuenching(selectedQuenching)?.profileType || '--'}</div>
                  </div>
                  <div>
                    <span className="text-slate-500 text-xs">淬火产出</span>
                    <div className="font-bold text-amber-600 tabular-nums">{selectedQuenching.outputWeight || 0} kg</div>
                  </div>
                  <div>
                    <span className="text-slate-500 text-xs">来源机台</span>
                    <div className="font-semibold text-slate-800">{selectedQuenching.sourceMachineNo || '--'}</div>
                  </div>
                </div>
              </div>

              <div className="space-y-4">
                <div>
                  <label className="text-xs font-semibold text-slate-600 block mb-1.5">
                    炉号
                  </label>
                  <select
                    value={chargeForm.furnaceNo}
                    onChange={(e) => setChargeForm({ ...chargeForm, furnaceNo: e.target.value })}
                    className="w-full px-3 py-2.5 border border-slate-200 rounded-lg text-sm focus:ring-2 focus:ring-amber-500/30 focus:border-amber-400"
                  >
                    <option value="时效炉01">时效炉01</option>
                    <option value="时效炉02">时效炉02</option>
                    <option value="时效炉03">时效炉03</option>
                  </select>
                </div>
                <div>
                  <label className="text-xs font-semibold text-slate-600 block mb-1.5">
                    装炉量 (吨)
                  </label>
                  <input
                    type="number"
                    step="0.01"
                    value={chargeForm.chargeAmount}
                    onChange={(e) => setChargeForm({ ...chargeForm, chargeAmount: parseFloat(e.target.value) || 0 })}
                    className="w-full px-3 py-2.5 border border-slate-200 rounded-lg text-sm font-mono tabular-nums focus:ring-2 focus:ring-amber-500/30 focus:border-amber-400"
                  />
                  <p className="text-[11px] text-slate-400 mt-1">默认按淬火产出重量换算</p>
                </div>
                <div>
                  <label className="text-xs font-semibold text-slate-600 block mb-1.5">
                    操作人
                  </label>
                  <input
                    type="text"
                    value={chargeForm.operator}
                    onChange={(e) => setChargeForm({ ...chargeForm, operator: e.target.value })}
                    className="w-full px-3 py-2.5 border border-slate-200 rounded-lg text-sm focus:ring-2 focus:ring-amber-500/30 focus:border-amber-400"
                  />
                </div>
              </div>
            </div>
            <div className="px-6 py-4 border-t border-slate-100 flex items-center justify-end gap-3 bg-slate-50/50">
              <button
                onClick={() => {
                  setShowChargeModal(false);
                  setSelectedQuenching(null);
                }}
                className="px-5 py-2.5 text-sm font-semibold text-slate-600 bg-white border border-slate-200 rounded-lg hover:bg-slate-50"
              >
                取消
              </button>
              <button
                onClick={handleConfirmCharge}
                className="px-6 py-2.5 text-sm font-semibold text-white bg-gradient-to-r from-amber-500 to-orange-500 rounded-lg hover:from-amber-600 hover:to-orange-600 shadow-md shadow-amber-500/25 flex items-center gap-2"
              >
                <CheckCircle className="w-4 h-4" />
                确认装炉
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
