import { useState, useMemo } from 'react';
import { useProductionStore } from '@/store/productionStore';
import { Gauge, Play, Check, Clock, Thermometer, Ruler, ArrowLeftRight, Plus, RefreshCw, X, CheckCircle2, AlertCircle } from 'lucide-react';
import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, Area, AreaChart } from 'recharts';
import { cn } from '@/lib/utils';
import type { CastBillet, Die } from '@/data/types';

const batchStatusMap: Record<string, { label: string; className: string; icon: typeof Play }> = {
  running: { label: '生产中', icon: Play, className: 'bg-blue-100 text-blue-700 border-blue-200' },
  completed: { label: '已完成', icon: Check, className: 'bg-emerald-100 text-emerald-700 border-emerald-200' },
  pending: { label: '待生产', icon: Clock, className: 'bg-slate-100 text-slate-600 border-slate-200' },
};

const generateSpeedData = () => {
  const data = [];
  for (let i = 0; i < 20; i++) {
    data.push({
      t: `${String(i).padStart(2, '0')}:00`,
      speed: 12 + Math.random() * 5,
      temp: 510 + Math.random() * 20,
    });
  }
  return data;
};

export default function Extrusion() {
  const batches = useProductionStore((s) => s.extrusionBatches);
  const castBillets = useProductionStore((s) => s.castBillets);
  const dies = useProductionStore((s) => s.dies);
  const dieUsageRecords = useProductionStore((s) => s.dieUsageRecords);
  const realtimeData = useProductionStore((s) => s.realtimeData);
  const addExtrusionBatch = useProductionStore((s) => s.addExtrusionBatch);
  const manualRefreshRealtime = useProductionStore((s) => s.manualRefreshRealtime);
  const updateExtrusionBatch = useProductionStore((s) => s.updateExtrusionBatch);

  const [selectedBatchId, setSelectedBatchId] = useState(batches.find(b => b.status === 'running')?.id || batches[0]?.id);
  const [speedData, setSpeedData] = useState(generateSpeedData());
  const [showNewBatch, setShowNewBatch] = useState(false);
  const [selectedBilletId, setSelectedBilletId] = useState<string | null>(null);
  const [selectedDieId, setSelectedDieId] = useState<string | null>(null);
  const [machineNo, setMachineNo] = useState('挤压机01');

  const availableBillets = useMemo(() => {
    const usedBilletIds = batches.map(b => b.billetId);
    return castBillets.filter(b => !usedBilletIds.includes(b.id) && b.status === 'qualified');
  }, [castBillets, batches]);

  const availableDies = useMemo(() => {
    const activeRecordDieIds = dieUsageRecords.filter(r => !r.downTime).map(r => r.dieId);
    return dies.filter(d => d.status === 'onMachine' || activeRecordDieIds.includes(d.id));
  }, [dies, dieUsageRecords]);

  const selected = batches.find((b) => b.id === selectedBatchId);
  const selectedBillet = castBillets.find(b => b.id === selected?.billetId);
  const selectedDie = dies.find(d => d.id === selected?.dieId);

  const refreshSpeedData = () => {
    const newData = speedData.slice(1);
    const lastT = speedData[speedData.length - 1].t;
    const nextMin = (parseInt(lastT.split(':')[0]) * 60 + parseInt(lastT.split(':')[1]) + 3) % (24 * 60);
    newData.push({
      t: `${String(Math.floor(nextMin / 60)).padStart(2, '0')}:${String(nextMin % 60).padStart(2, '0')}`,
      speed: 12 + Math.random() * 5,
      temp: 510 + Math.random() * 20,
    });
    setSpeedData(newData);
  };

  const GaugeMeter = ({ value, min, max, label, unit, optimal }: { value: number; min: number; max: number; label: string; unit: string; optimal: [number, number] }) => {
    const percent = ((value - min) / (max - min)) * 100;
    const clamped = Math.max(0, Math.min(100, percent));
    const isOptimal = value >= optimal[0] && value <= optimal[1];
    const circumference = 2 * Math.PI * 40;
    const dash = (circumference * clamped) / 100;

    return (
      <div className="bg-white rounded-xl p-4 border border-slate-200/60">
        <div className="text-center mb-1">
          <span className="text-xs font-semibold text-slate-500">{label}</span>
        </div>
        <div className="relative w-28 h-16 mx-auto">
          <svg viewBox="0 0 100 55" className="w-full h-full">
            <defs>
              <linearGradient id={`g-${label}`} x1="0%" y1="0%" x2="100%" y2="0%">
                <stop offset="0%" stopColor="#10b981" />
                <stop offset="50%" stopColor="#f59e0b" />
                <stop offset="100%" stopColor="#ef4444" />
              </linearGradient>
            </defs>
            <path
              d="M 10 50 A 40 40 0 0 1 90 50"
              fill="none" stroke="#f1f5f9" strokeWidth="8" strokeLinecap="round"
            />
            <path
              d="M 10 50 A 40 40 0 0 1 90 50"
              fill="none" stroke={`url(#g-${label})`} strokeWidth="8" strokeLinecap="round"
              strokeDasharray={`${dash} ${circumference}`}
              style={{ transition: 'all 0.8s ease' }}
            />
          </svg>
          <div className="absolute inset-0 flex items-end justify-center pb-1">
            <span className={cn(
              'text-2xl font-bold tabular-nums',
              isOptimal ? 'text-emerald-600' : 'text-orange-600'
            )}>
              {value || '--'}
              <span className="text-[10px] font-normal text-slate-500 ml-0.5">{unit}</span>
            </span>
          </div>
        </div>
        <div className="text-center text-[10px] text-slate-400">
          最佳 {optimal[0]}-{optimal[1]}{unit}
        </div>
      </div>
    );
  };

  return (
    <div className="space-y-6">
      <div className="bg-white rounded-xl p-4 shadow-sm border border-slate-200/60">
        <div className="flex items-center gap-3 overflow-x-auto pb-1">
          {batches.map((b) => {
            const status = batchStatusMap[b.status];
            const active = b.id === selectedBatchId;
            return (
              <button
                key={b.id}
                onClick={() => setSelectedBatchId(b.id)}
                className={cn(
                  'flex items-center gap-3 px-4 py-3 rounded-xl border-2 transition-all shrink-0',
                  active
                    ? 'border-blue-500 bg-blue-50/50 shadow-md shadow-blue-500/10'
                    : 'border-slate-100 bg-white hover:border-slate-200'
                )}
              >
                <div className={cn(
                  'w-10 h-10 rounded-lg flex items-center justify-center',
                  active ? 'bg-blue-500 text-white' : 'bg-slate-100 text-slate-600'
                )}>
                  <Gauge className="w-5 h-5" />
                </div>
                <div className="text-left">
                  <div className={cn(
                    'font-mono font-bold text-sm',
                    active ? 'text-slate-800' : 'text-slate-600'
                  )}>
                    {b.batchNumber}
                  </div>
                  <div className="text-xs text-slate-500">{b.profileType}</div>
                </div>
                <span className={cn(
                  'flex items-center gap-1 px-2 py-0.5 rounded-md text-[10px] font-semibold border',
                  status.className
                )}>
                  <status.icon className="w-3 h-3" />
                  {status.label}
                </span>
              </button>
            );
          })}
          <button
            onClick={() => {
              setSelectedBilletId(null);
              setSelectedDieId(null);
              setShowNewBatch(true);
            }}
            className="flex items-center gap-1.5 px-4 py-3 rounded-xl border-2 border-dashed border-slate-200 text-slate-500 hover:border-blue-400 hover:text-blue-500 hover:bg-blue-50/30 transition-all shrink-0"
          >
            <Plus className="w-4 h-4" />
            <span className="text-sm font-semibold">新建批次</span>
          </button>
        </div>
      </div>

      {selected && (
        <>
          <div className="bg-white rounded-xl p-5 shadow-sm border border-slate-200/60">
            <div className="flex items-center justify-between mb-6">
              <div>
                <h3 className="text-base font-bold text-slate-800 flex items-center gap-2">
                  <span className="w-1 h-5 bg-red-500 rounded-full" />
                  铸棒加热温度监控
                </h3>
                <p className="text-xs text-slate-500 mt-1">批次号: {selected.batchNumber} | 机台: {selected.machineNo}</p>
              </div>
              <button
                onClick={() => {
                  if (selectedBatchId) manualRefreshRealtime(selectedBatchId);
                  refreshSpeedData();
                  if (selected && selected.status === 'running') {
                    updateExtrusionBatch(selected.id, {
                      heatTempTop: Math.round(485 + (Math.random() - 0.5) * 15),
                      heatTempMid: Math.round(495 + (Math.random() - 0.5) * 15),
                      heatTempBottom: Math.round(480 + (Math.random() - 0.5) * 15),
                      exitTemp: Math.round(520 + (Math.random() - 0.5) * 20),
                      extrusionSpeed: Math.round((14 + (Math.random() - 0.5) * 4) * 10) / 10,
                    });
                  }
                }}
                className="flex items-center gap-1.5 px-3 py-2 text-sm bg-slate-100 text-slate-600 rounded-lg hover:bg-slate-200 active:scale-95 transition-all"
              >
                <RefreshCw className="w-4 h-4" />
                刷新
              </button>
            </div>
            <div className="grid grid-cols-2 md:grid-cols-5 gap-4">
              <GaugeMeter value={selected.heatTempTop} min={400} max={580} label="上部温度" unit="℃" optimal={[480, 500]} />
              <GaugeMeter value={selected.heatTempMid} min={400} max={580} label="中部温度" unit="℃" optimal={[485, 505]} />
              <GaugeMeter value={selected.heatTempBottom} min={400} max={580} label="下部温度" unit="℃" optimal={[475, 495]} />
              <GaugeMeter value={selected.exitTemp} min={450} max={600} label="出料温度" unit="℃" optimal={[510, 530]} />
              <GaugeMeter value={selected.extrusionSpeed} min={5} max={25} label="挤压速度" unit="m/min" optimal={[12, 18]} />
            </div>
          </div>

          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            <div className="bg-white rounded-xl p-5 shadow-sm border border-slate-200/60">
              <h3 className="text-base font-bold text-slate-800 mb-4 flex items-center gap-2">
                <span className="w-1 h-5 bg-blue-500 rounded-full" />
                挤压速度曲线
              </h3>
              <div className="h-52">
                <ResponsiveContainer width="100%" height="100%">
                  <AreaChart data={speedData}>
                    <defs>
                      <linearGradient id="exSpeed" x1="0" y1="0" x2="0" y2="1">
                        <stop offset="0%" stopColor="#3b82f6" stopOpacity={0.25} />
                        <stop offset="100%" stopColor="#3b82f6" stopOpacity={0} />
                      </linearGradient>
                    </defs>
                    <CartesianGrid strokeDasharray="3 3" stroke="#f1f5f9" vertical={false} />
                    <XAxis dataKey="t" tick={{ fontSize: 10, fill: '#94a3b8' }} tickLine={false} axisLine={{ stroke: '#e2e8f0' }} />
                    <YAxis tick={{ fontSize: 10, fill: '#94a3b8' }} tickLine={false} axisLine={false} width={35} />
                    <Tooltip contentStyle={{ borderRadius: 8, border: '1px solid #e2e8f0', fontSize: 12 }} />
                    <Area type="monotone" dataKey="speed" stroke="#3b82f6" strokeWidth={2} fill="url(#exSpeed)" dot={false} />
                  </AreaChart>
                </ResponsiveContainer>
              </div>
            </div>

            <div className="bg-white rounded-xl p-5 shadow-sm border border-slate-200/60">
              <h3 className="text-base font-bold text-slate-800 mb-4 flex items-center gap-2">
                <span className="w-1 h-5 bg-red-500 rounded-full" />
                出料口温度趋势
              </h3>
              <div className="h-52">
                <ResponsiveContainer width="100%" height="100%">
                  <AreaChart data={speedData}>
                    <defs>
                      <linearGradient id="exTemp" x1="0" y1="0" x2="0" y2="1">
                        <stop offset="0%" stopColor="#ef4444" stopOpacity={0.25} />
                        <stop offset="100%" stopColor="#ef4444" stopOpacity={0} />
                      </linearGradient>
                    </defs>
                    <CartesianGrid strokeDasharray="3 3" stroke="#f1f5f9" vertical={false} />
                    <XAxis dataKey="t" tick={{ fontSize: 10, fill: '#94a3b8' }} tickLine={false} axisLine={{ stroke: '#e2e8f0' }} />
                    <YAxis domain={[490, 550]} tick={{ fontSize: 10, fill: '#94a3b8' }} tickLine={false} axisLine={false} width={35} />
                    <Tooltip contentStyle={{ borderRadius: 8, border: '1px solid #e2e8f0', fontSize: 12 }} />
                    <Area type="monotone" dataKey="temp" stroke="#ef4444" strokeWidth={2} fill="url(#exTemp)" dot={false} />
                  </AreaChart>
                </ResponsiveContainer>
              </div>
            </div>
          </div>

          <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
            <div className="bg-white rounded-xl p-5 shadow-sm border border-slate-200/60">
              <h3 className="text-base font-bold text-slate-800 mb-4 flex items-center gap-2">
                <Ruler className="w-5 h-5 text-purple-500" />
                张力矫直记录
              </h3>
              <div className="space-y-4">
                <div>
                  <div className="flex items-center justify-between mb-2">
                    <span className="text-sm text-slate-600">拉伸率</span>
                    <span className="font-mono font-bold text-purple-600 tabular-nums">{selected.stretchRate || 0}%</span>
                  </div>
                  <div className="h-2 bg-slate-100 rounded-full overflow-hidden">
                    <div className="h-full bg-gradient-to-r from-purple-500 to-indigo-500 rounded-full" style={{ width: `${selected.stretchRate * 60}%` }} />
                  </div>
                </div>
                <div className="grid grid-cols-2 gap-3">
                  <div className="p-3 rounded-lg bg-slate-50/70 border border-slate-100">
                    <div className="text-xs text-slate-500 mb-1">矫直前</div>
                    <div className="text-xl font-bold font-mono tabular-nums text-orange-500">
                      {selected.straightnessBefore || 0}
                      <span className="text-[10px] font-normal text-slate-400 ml-0.5">mm/m</span>
                    </div>
                  </div>
                  <div className="p-3 rounded-lg bg-emerald-50/70 border border-emerald-100">
                    <div className="text-xs text-slate-500 mb-1">矫直后</div>
                    <div className="text-xl font-bold font-mono tabular-nums text-emerald-600">
                      {selected.straightnessAfter || 0}
                      <span className="text-[10px] font-normal text-slate-400 ml-0.5">mm/m</span>
                    </div>
                  </div>
                </div>
                <div className="flex items-center justify-between text-xs p-3 rounded-lg bg-gradient-to-r from-blue-50 to-indigo-50">
                  <span className="text-slate-600">主缸压力</span>
                  <span className="font-mono font-bold text-blue-600 text-lg tabular-nums">
                    {selected.cylinderPressure || 0} MPa
                  </span>
                </div>
              </div>
            </div>

            <div className="bg-white rounded-xl p-5 shadow-sm border border-slate-200/60 lg:col-span-2">
              <h3 className="text-base font-bold text-slate-800 mb-4 flex items-center gap-2">
                <ArrowLeftRight className="w-5 h-5 text-slate-600" />
                批次详细信息
              </h3>
              <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                {[
                  { k: '操作员', v: selected.operator || '--' },
                  { k: '开始时间', v: selected.startTime || '--' },
                  { k: '结束时间', v: selected.endTime || '进行中' },
                  { k: '产出重量', v: selected.outputWeight ? `${selected.outputWeight} kg` : '--' },
                  { k: '铸棒批次', v: selected.billetBatchNumber },
                  { k: '模具编号', v: selected.dieNumber },
                  { k: '机台编号', v: selected.machineNo },
                  { k: '型材类型', v: selected.profileType },
                ].map((item) => (
                  <div key={item.k} className="p-3 rounded-lg bg-slate-50/50 border border-slate-100">
                    <div className="text-xs text-slate-500 mb-1">{item.k}</div>
                    <div className="text-sm font-semibold text-slate-700 truncate">{item.v}</div>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </>
      )}

      {/* 新建挤压批次模态框 */}
      {showNewBatch && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 backdrop-blur-sm p-4">
          <div className="bg-white rounded-2xl shadow-2xl w-full max-w-3xl overflow-hidden animate-in max-h-[90vh] flex flex-col">
            <div className="px-6 py-4 border-b border-slate-100 flex items-center justify-between bg-gradient-to-r from-blue-50 to-indigo-50">
              <h3 className="text-lg font-bold text-slate-800 flex items-center gap-2">
                <Plus className="w-5 h-5 text-blue-600" />
                新建挤压批次
              </h3>
              <button onClick={() => setShowNewBatch(false)} className="w-8 h-8 rounded-lg hover:bg-white/60 flex items-center justify-center text-slate-500">
                <X className="w-5 h-5" />
              </button>
            </div>
            <div className="p-6 space-y-6 overflow-y-auto flex-1">
              <div>
                <label className="text-xs font-semibold text-slate-600 block mb-2">选择上机机台</label>
                <select
                  value={machineNo}
                  onChange={(e) => setMachineNo(e.target.value)}
                  className="w-full px-3 py-2.5 border border-slate-200 rounded-lg text-sm focus:ring-2 focus:ring-blue-500/30"
                >
                  <option value="挤压机01">挤压机01</option>
                  <option value="挤压机02">挤压机02</option>
                  <option value="挤压机03">挤压机03</option>
                </select>
              </div>

              <div>
                <label className="text-xs font-semibold text-slate-600 block mb-2 flex items-center gap-2">
                  <span>选择待处理合格铸棒</span>
                  <span className="px-2 py-0.5 bg-blue-100 text-blue-600 rounded text-[10px] font-bold">
                    可选 {availableBillets.length} 根
                  </span>
                </label>
                {availableBillets.length === 0 ? (
                  <div className="p-6 rounded-xl bg-slate-50 border border-dashed border-slate-200 text-center">
                    <AlertCircle className="w-8 h-8 text-slate-400 mx-auto mb-2" />
                    <div className="text-sm text-slate-500">暂无待处理的合格铸棒</div>
                    <div className="text-xs text-slate-400 mt-1">请先在铸棒熔铸模块录入新的铸棒批次</div>
                  </div>
                ) : (
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-3 max-h-56 overflow-y-auto p-1">
                    {availableBillets.map((billet) => {
                      const selected = selectedBilletId === billet.id;
                      return (
                        <div
                          key={billet.id}
                          onClick={() => setSelectedBilletId(billet.id)}
                          className={cn(
                            'p-3 rounded-xl border-2 cursor-pointer transition-all',
                            selected
                              ? 'border-blue-500 bg-blue-50/50'
                              : 'border-slate-100 hover:border-slate-200 bg-white'
                          )}
                        >
                          <div className="flex items-center justify-between mb-2">
                            <span className="font-mono font-bold text-slate-800">{billet.batchNumber}</span>
                            <span className="px-2 py-0.5 rounded-md text-[10px] font-bold bg-emerald-100 text-emerald-600 border border-emerald-200">
                              合格
                            </span>
                          </div>
                          <div className="text-xs text-slate-600 space-y-1">
                            <div>重量：<span className="font-medium">{billet.weight} kg</span></div>
                            <div>均质温度：<span className="font-medium">{billet.homogenizationTemp}℃</span></div>
                            <div>日期：<span className="font-medium">{billet.castingDate}</span></div>
                          </div>
                        </div>
                      );
                    })}
                  </div>
                )}
              </div>

              <div>
                <label className="text-xs font-semibold text-slate-600 block mb-2 flex items-center gap-2">
                  <span>选择上机中的模具</span>
                  <span className="px-2 py-0.5 bg-orange-100 text-orange-600 rounded text-[10px] font-bold">
                    可用 {availableDies.length} 套
                  </span>
                </label>
                {availableDies.length === 0 ? (
                  <div className="p-6 rounded-xl bg-slate-50 border border-dashed border-slate-200 text-center">
                    <AlertCircle className="w-8 h-8 text-slate-400 mx-auto mb-2" />
                    <div className="text-sm text-slate-500">暂无上机中的模具</div>
                    <div className="text-xs text-slate-400 mt-1">请先在模具管理模块执行"模具上机"</div>
                  </div>
                ) : (
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-3 max-h-56 overflow-y-auto p-1">
                    {availableDies.map((die) => {
                      const selected = selectedDieId === die.id;
                      return (
                        <div
                          key={die.id}
                          onClick={() => setSelectedDieId(die.id)}
                          className={cn(
                            'p-3 rounded-xl border-2 cursor-pointer transition-all',
                            selected
                              ? 'border-orange-500 bg-orange-50/50'
                              : 'border-slate-100 hover:border-slate-200 bg-white'
                          )}
                        >
                          <div className="flex items-center justify-between mb-2">
                            <span className="font-mono font-bold text-slate-800">{die.dieNumber}</span>
                            <span className="px-2 py-0.5 rounded-md text-[10px] font-bold bg-blue-100 text-blue-600 border border-blue-200">
                              上机中
                            </span>
                          </div>
                          <div className="text-xs text-slate-600 space-y-1">
                            <div>型号：<span className="font-medium">{die.model}</span></div>
                            <div>规格：<span className="font-medium">{die.specification}</span></div>
                            <div>寿命：<span className="font-medium">{die.machineCount}/{die.maxMachineCount} 次</span></div>
                          </div>
                        </div>
                      );
                    })}
                  </div>
                )}
              </div>
            </div>
            <div className="px-6 py-4 border-t border-slate-100 flex items-center justify-between bg-slate-50/50">
              <div className="text-xs text-slate-500">
                {selectedBilletId && selectedDieId ? (
                  <span className="text-emerald-600 font-semibold flex items-center gap-1.5">
                    <CheckCircle2 className="w-4 h-4" />
                    已选择铸棒和模具，可以开批
                  </span>
                ) : (
                  <span className="text-amber-600 font-medium">请选择铸棒和模具</span>
                )}
              </div>
              <div className="flex items-center gap-3">
                <button
                  onClick={() => setShowNewBatch(false)}
                  className="px-5 py-2.5 text-sm font-semibold text-slate-600 bg-white border border-slate-200 rounded-lg hover:bg-slate-50"
                >
                  取消
                </button>
                <button
                  disabled={!selectedBilletId || !selectedDieId}
                  onClick={() => {
                    const billet = availableBillets.find(b => b.id === selectedBilletId)!;
                    const die = availableDies.find(d => d.id === selectedDieId)!;
                    const today = new Date();
                    const dateStr = today.toISOString().slice(0, 10).replace(/-/g, '');
                    const seq = String(batches.filter(b => b.batchNumber.startsWith(`JY${dateStr}`)).length + 1).padStart(3, '0');
                    const batchNumber = `JY${dateStr}${seq}`;

                    addExtrusionBatch({
                      batchNumber,
                      billetId: billet.id,
                      billetBatchNumber: billet.batchNumber,
                      dieId: die.id,
                      dieNumber: die.dieNumber,
                      machineNo,
                      profileType: die.specification,
                      startTime: today.toISOString().slice(0, 16).replace('T', ' '),
                      status: 'running',
                      heatTempTop: 485,
                      heatTempMid: 495,
                      heatTempBottom: 480,
                      exitTemp: 520,
                      extrusionSpeed: 14.5,
                      cylinderPressure: 21,
                      outputWeight: 0,
                      straightnessBefore: 2.5,
                      straightnessAfter: 0.8,
                      operator: '自动开批',
                      stretchRate: 1.2,
                    });
                    setShowNewBatch(false);
                    setSelectedBatchId(undefined as any);
                    setTimeout(() => {
                      const newBatch = batches[batches.length - 1];
                      if (newBatch) setSelectedBatchId(newBatch.id);
                    }, 50);
                  }}
                  className={cn(
                    'px-6 py-2.5 text-sm font-semibold text-white rounded-lg shadow-md flex items-center gap-2',
                    selectedBilletId && selectedDieId
                      ? 'bg-gradient-to-r from-blue-600 to-indigo-600 hover:from-blue-700 hover:to-indigo-700 shadow-blue-500/25'
                      : 'bg-slate-300 cursor-not-allowed'
                  )}
                >
                  <Play className="w-4 h-4" />
                  开始挤压
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
