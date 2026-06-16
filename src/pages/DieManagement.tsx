import { useState, useEffect } from 'react';
import { useProductionStore } from '@/store/productionStore';
import { Wrench, Plus, Search, Filter, Info, Cog, AlertTriangle, CheckCircle2, XCircle, TrendingUp, Clock, X, Play, Square, Settings, History, ArrowRight } from 'lucide-react';
import { cn } from '@/lib/utils';
import type { Die, DieUsageRecord, DieHistoryRecord } from '@/data/types';

const dieStatusConfig: Record<string, { label: string; color: string; bg: string; border: string }> = {
  available: { label: '待用', color: 'text-emerald-600', bg: 'bg-emerald-500', border: 'border-emerald-200' },
  onMachine: { label: '上机中', color: 'text-blue-600', bg: 'bg-blue-500', border: 'border-blue-200' },
  repair: { label: '维修中', color: 'text-amber-600', bg: 'bg-amber-500', border: 'border-amber-200' },
  scrapped: { label: '已报废', color: 'text-slate-500', bg: 'bg-slate-500', border: 'border-slate-200' },
};

export default function DieManagement() {
  const dies = useProductionStore((s) => s.dies);
  const dieUsageRecords = useProductionStore((s) => s.dieUsageRecords);
  const dieHistoryRecords = useProductionStore((s) => s.dieHistoryRecords);
  const addDie = useProductionStore((s) => s.addDie);
  const mountDieToMachine = useProductionStore((s) => s.mountDieToMachine);
  const unmountDieFromMachine = useProductionStore((s) => s.unmountDieFromMachine);
  const addDieRepairRecord = useProductionStore((s) => s.addDieRepairRecord);
  const completeDieRepair = useProductionStore((s) => s.completeDieRepair);
  const updateDie = useProductionStore((s) => s.updateDie);

  const [filter, setFilter] = useState<string>('all');
  const [search, setSearch] = useState('');
  const [selectedDie, setSelectedDie] = useState<string | null>(dies[0]?.id || null);
  
  const [showAddDie, setShowAddDie] = useState(false);
  const [showMountModal, setShowMountModal] = useState(false);
  const [showUnmountModal, setShowUnmountModal] = useState(false);
  const [showRepairModal, setShowRepairModal] = useState(false);

  const [newDieForm, setNewDieForm] = useState({
    dieNumber: '', model: '', specification: '', drawing: '', maxMachineCount: 300,
  });
  const [mountForm, setMountForm] = useState({ machineNo: '挤压机01', operator: '张师傅' });
  const [unmountForm, setUnmountForm] = useState({ extrusionWeight: 1.5, wearCondition: '正常' });
  const [repairNote, setRepairNote] = useState('');

  useEffect(() => {
    if (!dies.find(d => d.id === selectedDie)) {
      setSelectedDie(dies[0]?.id || null);
    }
  }, [dies, selectedDie]);

  const filtered = dies.filter((d) => {
    const matchFilter = filter === 'all' || d.status === filter;
    const matchSearch = d.dieNumber.toLowerCase().includes(search.toLowerCase()) ||
      d.specification.toLowerCase().includes(search.toLowerCase());
    return matchFilter && matchSearch;
  });

  const selected = dies.find((d) => d.id === selectedDie);
  const dieRecords = dieUsageRecords.filter((r) => r.dieId === selectedDie).sort((a, b) => new Date(b.upTime).getTime() - new Date(a.upTime).getTime());
  const activeUsageRecord = dieRecords.find(r => !r.downTime);

  const stats = {
    total: dies.length,
    available: dies.filter(d => d.status === 'available').length,
    onMachine: dies.filter(d => d.status === 'onMachine').length,
    repair: dies.filter(d => d.status === 'repair').length,
  };

  const formatDateTime = (d: Date) => d.toISOString().slice(0, 16).replace('T', ' ');
  const formatDate = (d: Date) => d.toISOString().slice(0, 10);

  return (
    <div className="space-y-6">
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        {[
          { label: '模具总数', value: stats.total, color: 'blue', icon: Wrench },
          { label: '待用状态', value: stats.available, color: 'emerald', icon: CheckCircle2 },
          { label: '上机中', value: stats.onMachine, color: 'blue', icon: Cog },
          { label: '维修中', value: stats.repair, color: 'amber', icon: AlertTriangle },
        ].map((s) => (
          <div key={s.label} className={`bg-white rounded-xl p-5 shadow-sm border border-slate-200/60 relative overflow-hidden`}>
            <div className={`absolute top-0 right-0 w-24 h-24 bg-${s.color}-50 rounded-full -mr-8 -mt-8 opacity-60`} />
            <div className="flex items-start justify-between relative">
              <div>
                <p className="text-sm text-slate-500 font-medium">{s.label}</p>
                <p className={`text-3xl font-bold mt-1 tabular-nums text-${s.color}-600`}>{s.value}</p>
              </div>
              <div className={`w-11 h-11 rounded-xl bg-${s.color}-500/10 flex items-center justify-center`}>
                <s.icon className={`w-5 h-5 text-${s.color}-500`} />
              </div>
            </div>
          </div>
        ))}
      </div>

      <div className="flex items-center justify-between">
        <div className="flex items-center gap-2 bg-white rounded-lg p-1 shadow-sm border border-slate-200/60">
          {[
            { key: 'all', label: '全部' },
            { key: 'available', label: '待用' },
            { key: 'onMachine', label: '上机' },
            { key: 'repair', label: '维修' },
            { key: 'scrapped', label: '报废' },
          ].map((f) => (
            <button
              key={f.key}
              onClick={() => setFilter(f.key)}
              className={cn(
                'px-4 py-2 rounded-md text-sm font-semibold transition-all',
                filter === f.key
                  ? 'bg-slate-700 text-white shadow-sm'
                  : 'text-slate-600 hover:bg-slate-100'
              )}
            >
              {f.label}
            </button>
          ))}
        </div>
        <div className="flex items-center gap-3">
          <div className="relative">
            <Search className="w-4 h-4 absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" />
            <input
              type="text"
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              placeholder="模具号/规格..."
              className="pl-9 pr-3 py-2 text-sm bg-white border border-slate-200 rounded-lg w-52 focus:ring-2 focus:ring-blue-500/30"
            />
          </div>
          <button 
            onClick={() => {
              const nextNum = String(dies.length + 1).padStart(4, '0');
              setNewDieForm({
                dieNumber: `MJ-${nextNum}`,
                model: '6063-',
                specification: '',
                drawing: `DWG-2026-${String(dies.length + 1).padStart(4, '0')}`,
                maxMachineCount: 300,
              });
              setShowAddDie(true);
            }}
            className="flex items-center gap-1.5 px-4 py-2 text-sm bg-slate-800 text-white rounded-lg hover:bg-slate-900 shadow-sm"
          >
            <Plus className="w-4 h-4" />
            新增模具
          </button>
        </div>
      </div>

      <div className="grid grid-cols-1 xl:grid-cols-3 gap-6">
        <div className="xl:col-span-2">
          <div className="bg-white rounded-xl shadow-sm border border-slate-200/60 overflow-hidden">
            <div className="px-5 py-4 border-b border-slate-100 flex items-center justify-between">
              <h3 className="font-bold text-slate-800 flex items-center gap-2">
                <span className="w-1 h-5 bg-slate-700 rounded-full" />
                模具台账
              </h3>
              <span className="text-xs text-slate-500">共 {filtered.length} 套</span>
            </div>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-3 p-4">
              {filtered.map((die) => {
                const cfg = dieStatusConfig[die.status];
                const lifePercent = Math.min((die.machineCount / die.maxMachineCount) * 100, 100);
                const isSelected = selectedDie === die.id;
                const lifeWarn = lifePercent > 85;
                return (
                  <div
                    key={die.id}
                    onClick={() => setSelectedDie(die.id)}
                    className={cn(
                      'relative rounded-xl p-4 border-2 cursor-pointer transition-all duration-200 hover:shadow-md',
                      isSelected
                        ? 'border-blue-500 bg-blue-50/40 shadow-md shadow-blue-500/10'
                        : 'border-slate-100 bg-white hover:border-slate-200'
                    )}
                  >
                    <div className={cn(
                      'absolute top-0 left-0 w-1.5 h-full rounded-l-xl',
                      cfg.bg
                    )} />
                    <div className="flex items-start justify-between mb-3">
                      <div className="flex items-center gap-3">
                        <div className={cn(
                          'w-11 h-11 rounded-xl flex items-center justify-center',
                          die.status === 'scrapped' ? 'bg-slate-100' : 'bg-gradient-to-br from-slate-100 to-slate-50'
                        )}>
                          <Wrench className={cn(
                            'w-5 h-5',
                            die.status === 'scrapped' ? 'text-slate-400' : 'text-slate-600'
                          )} />
                        </div>
                        <div>
                          <div className="font-mono font-bold text-slate-800">{die.dieNumber}</div>
                          <div className="text-xs text-slate-500">{die.model}</div>
                        </div>
                      </div>
                      <span className={cn(
                        'px-2.5 py-1 rounded-md text-xs font-semibold border',
                        cfg.color,
                        `bg-${cfg.bg.replace('bg-', '')}/10`,
                        cfg.border
                      )}>
                        {cfg.label}
                      </span>
                    </div>

                    <p className="text-sm text-slate-600 mb-3 font-medium">{die.specification}</p>

                    <div className="space-y-2">
                      <div className="flex items-center justify-between text-xs">
                        <span className="text-slate-500">使用寿命</span>
                        <span className={cn(
                          'font-semibold tabular-nums',
                          lifeWarn ? 'text-orange-600' : 'text-slate-700'
                        )}>
                          {die.machineCount} / {die.maxMachineCount} 次
                        </span>
                      </div>
                      <div className="h-2 bg-slate-100 rounded-full overflow-hidden">
                        <div
                          className={cn(
                            'h-full rounded-full transition-all duration-500',
                            lifeWarn ? 'bg-gradient-to-r from-orange-400 to-red-500' : 'bg-gradient-to-r from-slate-500 to-slate-700'
                          )}
                          style={{ width: `${lifePercent}%` }}
                        />
                      </div>
                      <div className="flex items-center justify-between text-xs pt-1">
                        <span className="text-slate-500 flex items-center gap-1">
                          <TrendingUp className="w-3 h-3" />
                          累计 {die.totalWeight}t
                        </span>
                        {lifeWarn && (
                          <span className="text-orange-600 font-semibold flex items-center gap-1">
                            <AlertTriangle className="w-3 h-3" />
                            接近寿命
                          </span>
                        )}
                      </div>
                    </div>
                  </div>
                );
              })}
            </div>
          </div>
        </div>

        <div className="space-y-4">
          {selected && (() => {
            const cfg = dieStatusConfig[selected.status];
            const lifePercent = Math.min((selected.machineCount / selected.maxMachineCount) * 100, 100);
            return (
              <>
                <div className="bg-white rounded-xl p-5 shadow-sm border border-slate-200/60 sticky top-20">
                  <div className="flex items-center gap-3 mb-5 pb-4 border-b border-slate-100">
                    <div className={cn('w-12 h-12 rounded-xl flex items-center justify-center', `bg-${cfg.bg.replace('bg-', '')}/15`)}>
                      <Info className={cn('w-6 h-6', cfg.color)} />
                    </div>
                    <div className="flex-1">
                      <div className="flex items-center gap-2">
                        <h4 className="font-mono font-bold text-lg text-slate-800">{selected.dieNumber}</h4>
                        <span className={cn('px-2 py-0.5 rounded text-xs font-semibold', `bg-${cfg.bg.replace('bg-', '')}/15`, cfg.color)}>
                          {cfg.label}
                        </span>
                      </div>
                      <div className="text-sm text-slate-500">{selected.specification}</div>
                    </div>
                  </div>

                  <div className="space-y-3 text-sm">
                    {[
                      { k: '模具型号', v: selected.model },
                      { k: '图号', v: selected.drawing },
                      { k: '上机次数', v: `${selected.machineCount} 次` },
                      { k: '累计挤压量', v: `${selected.totalWeight} 吨` },
                      { k: '设计寿命', v: `${selected.maxMachineCount} 次` },
                      { k: '上次保养', v: selected.lastMaintenance },
                    ].map((row) => (
                      <div key={row.k} className="flex items-center justify-between py-1.5 border-b border-slate-50 last:border-0">
                        <span className="text-slate-500">{row.k}</span>
                        <span className="font-semibold text-slate-700">{row.v}</span>
                      </div>
                    ))}
                  </div>

                  <div className="mt-5 p-4 rounded-xl bg-slate-50/70">
                    <div className="flex items-center justify-between mb-2">
                      <span className="text-xs font-semibold text-slate-600">寿命损耗进度</span>
                      <span className={cn(
                        'text-sm font-bold tabular-nums',
                        lifePercent > 85 ? 'text-orange-600' : 'text-slate-700'
                      )}>
                        {lifePercent.toFixed(0)}%
                      </span>
                    </div>
                    <div className="h-3 bg-white rounded-full overflow-hidden border border-slate-200">
                      <div
                        className={cn(
                          'h-full rounded-full transition-all',
                          lifePercent > 85 ? 'bg-gradient-to-r from-orange-400 to-red-500' : 'bg-gradient-to-r from-slate-500 to-slate-700'
                        )}
                        style={{ width: `${lifePercent}%` }}
                      />
                    </div>
                  </div>

                  <div className="mt-5 space-y-2">
                    {selected.status === 'available' && (
                      <button
                        onClick={() => setShowMountModal(true)}
                        className="w-full px-4 py-2.5 text-sm font-semibold text-white bg-blue-600 rounded-lg hover:bg-blue-700 transition-colors flex items-center justify-center gap-2"
                      >
                        <Play className="w-4 h-4" />
                        模具上机
                      </button>
                    )}
                    {selected.status === 'onMachine' && activeUsageRecord && (
                      <button
                        onClick={() => setShowUnmountModal(true)}
                        className="w-full px-4 py-2.5 text-sm font-semibold text-white bg-orange-600 rounded-lg hover:bg-orange-700 transition-colors flex items-center justify-center gap-2"
                      >
                        <Square className="w-4 h-4" />
                        模具下机
                      </button>
                    )}
                    {(selected.status === 'available' || selected.status === 'onMachine') && (
                      <button
                        onClick={() => {
                          setRepairNote('');
                          setShowRepairModal(true);
                        }}
                        className="w-full px-4 py-2.5 text-sm font-semibold text-slate-700 bg-slate-100 rounded-lg hover:bg-slate-200 transition-colors flex items-center justify-center gap-2"
                      >
                        <Settings className="w-4 h-4" />
                        送修保养
                      </button>
                    )}
                    {selected.status === 'repair' && (
                      <button
                        onClick={() => {
                          completeDieRepair(selected.id);
                        }}
                        className="w-full px-4 py-2.5 text-sm font-semibold text-white bg-emerald-600 rounded-lg hover:bg-emerald-700 transition-colors flex items-center justify-center gap-2"
                      >
                        <CheckCircle2 className="w-4 h-4" />
                        维修完成
                      </button>
                    )}
                  </div>
                </div>

                <div className="bg-white rounded-xl p-5 shadow-sm border border-slate-200/60">
                  <h4 className="font-bold text-slate-800 mb-4 flex items-center gap-2">
                    <History className="w-4 h-4 text-slate-600" />
                    模具履历时间线
                  </h4>
                  {(() => {
                    const history = dieHistoryRecords
                      .filter((r) => r.dieId === selectedDie)
                      .sort((a, b) => new Date(b.timestamp).getTime() - new Date(a.timestamp).getTime());
                    
                    const typeIcon: Record<string, typeof Play> = {
                      mount: Play,
                      unmount: Square,
                      repair_start: Settings,
                      repair_complete: CheckCircle2,
                      create: Plus,
                      scrap: XCircle,
                      maintenance: Wrench,
                    };
                    
                    const typeColor: Record<string, string> = {
                      mount: 'bg-blue-500',
                      unmount: 'bg-orange-500',
                      repair_start: 'bg-amber-500',
                      repair_complete: 'bg-emerald-500',
                      create: 'bg-slate-500',
                      scrap: 'bg-red-500',
                      maintenance: 'bg-purple-500',
                    };
                    
                    const statusLabel: Record<string, string> = {
                      available: '待用',
                      onMachine: '上机中',
                      repair: '维修中',
                      scrapped: '已报废',
                    };
                    
                    if (history.length === 0) {
                      return (
                        <div className="text-center py-6">
                          <XCircle className="w-10 h-10 text-slate-300 mx-auto mb-2" />
                          <div className="text-sm text-slate-400">暂无履历记录</div>
                        </div>
                      );
                    }
                    
                    return (
                      <div className="relative space-y-4 max-h-80 overflow-y-auto pr-1">
                        {history.map((record, idx) => {
                          const Icon = typeIcon[record.type] || Info;
                          const colorBg = typeColor[record.type] || 'bg-slate-500';
                          const isLast = idx === history.length - 1;
                          return (
                            <div key={record.id} className="relative pl-7">
                              {!isLast && (
                                <div className="absolute left-[11px] top-6 w-0.5 h-full bg-slate-200" />
                              )}
                              <div className={`absolute left-0 top-1 w-6 h-6 rounded-full ${colorBg} flex items-center justify-center shadow-md`}>
                                <Icon className="w-3 h-3 text-white" />
                              </div>
                              <div className="bg-slate-50/70 rounded-lg p-3 border border-slate-100">
                                <div className="flex items-center justify-between mb-1.5">
                                  <span className="text-sm font-bold text-slate-800">{record.title}</span>
                                  <span className="text-[10px] text-slate-400 font-mono">{record.timestamp.slice(5, 16)}</span>
                                </div>
                                <p className="text-xs text-slate-600 mb-2">{record.description}</p>
                                {record.statusBefore && record.statusAfter && (
                                  <div className="flex items-center gap-1.5 text-[10px]">
                                    <span className="px-1.5 py-0.5 rounded bg-slate-100 text-slate-600 font-medium">
                                      {statusLabel[record.statusBefore] || record.statusBefore}
                                    </span>
                                    <ArrowRight className="w-3 h-3 text-slate-400" />
                                    <span className={cn(
                                      'px-1.5 py-0.5 rounded font-medium',
                                      record.statusAfter === 'available' && 'bg-emerald-100 text-emerald-700',
                                      record.statusAfter === 'onMachine' && 'bg-blue-100 text-blue-700',
                                      record.statusAfter === 'repair' && 'bg-amber-100 text-amber-700',
                                      record.statusAfter === 'scrapped' && 'bg-red-100 text-red-700',
                                    )}>
                                      {statusLabel[record.statusAfter] || record.statusAfter}
                                    </span>
                                  </div>
                                )}
                                {record.machineNo && (
                                  <div className="text-[10px] text-slate-500 mt-1">
                                    机台：<span className="font-medium text-slate-700">{record.machineNo}</span>
                                  </div>
                                )}
                                {record.repairNote && (
                                  <div className="text-[10px] text-slate-500 mt-1">
                                    说明：<span className="font-medium text-slate-700">{record.repairNote}</span>
                                  </div>
                                )}
                                <div className="text-[10px] text-slate-400 mt-1">
                                  操作人：<span className="font-medium">{record.operator}</span>
                                </div>
                              </div>
                            </div>
                          );
                        })}
                      </div>
                    );
                  })()}
                </div>
              </>
            );
          })()}
        </div>
      </div>

      {/* 新增模具模态框 */}
      {showAddDie && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 backdrop-blur-sm p-4">
          <div className="bg-white rounded-2xl shadow-2xl w-full max-w-lg overflow-hidden animate-in">
            <div className="px-6 py-4 border-b border-slate-100 flex items-center justify-between bg-gradient-to-r from-slate-50 to-gray-50">
              <h3 className="text-lg font-bold text-slate-800 flex items-center gap-2">
                <Plus className="w-5 h-5 text-slate-600" />
                新增模具
              </h3>
              <button onClick={() => setShowAddDie(false)} className="w-8 h-8 rounded-lg hover:bg-slate-100 flex items-center justify-center text-slate-500">
                <X className="w-5 h-5" />
              </button>
            </div>
            <div className="p-6 space-y-4">
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="text-xs font-semibold text-slate-600 block mb-1.5">模具编号</label>
                  <input
                    type="text"
                    value={newDieForm.dieNumber}
                    onChange={(e) => setNewDieForm({ ...newDieForm, dieNumber: e.target.value })}
                    className="w-full px-3 py-2.5 border border-slate-200 rounded-lg text-sm font-mono focus:ring-2 focus:ring-blue-500/30"
                  />
                </div>
                <div>
                  <label className="text-xs font-semibold text-slate-600 block mb-1.5">合金牌号</label>
                  <input
                    type="text"
                    value={newDieForm.model}
                    onChange={(e) => setNewDieForm({ ...newDieForm, model: e.target.value })}
                    placeholder="如 6063-08"
                    className="w-full px-3 py-2.5 border border-slate-200 rounded-lg text-sm font-mono focus:ring-2 focus:ring-blue-500/30"
                  />
                </div>
              </div>
              <div>
                <label className="text-xs font-semibold text-slate-600 block mb-1.5">型材规格</label>
                <input
                  type="text"
                  value={newDieForm.specification}
                  onChange={(e) => setNewDieForm({ ...newDieForm, specification: e.target.value })}
                  placeholder="如 80系列平开门框型材"
                  className="w-full px-3 py-2.5 border border-slate-200 rounded-lg text-sm focus:ring-2 focus:ring-blue-500/30"
                />
              </div>
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="text-xs font-semibold text-slate-600 block mb-1.5">图纸编号</label>
                  <input
                    type="text"
                    value={newDieForm.drawing}
                    onChange={(e) => setNewDieForm({ ...newDieForm, drawing: e.target.value })}
                    className="w-full px-3 py-2.5 border border-slate-200 rounded-lg text-sm font-mono focus:ring-2 focus:ring-blue-500/30"
                  />
                </div>
                <div>
                  <label className="text-xs font-semibold text-slate-600 block mb-1.5">设计寿命(次)</label>
                  <input
                    type="number"
                    value={newDieForm.maxMachineCount}
                    onChange={(e) => setNewDieForm({ ...newDieForm, maxMachineCount: parseInt(e.target.value) })}
                    className="w-full px-3 py-2.5 border border-slate-200 rounded-lg text-sm font-mono tabular-nums focus:ring-2 focus:ring-blue-500/30"
                  />
                </div>
              </div>
            </div>
            <div className="px-6 py-4 border-t border-slate-100 flex items-center justify-end gap-3 bg-slate-50/50">
              <button
                onClick={() => setShowAddDie(false)}
                className="px-5 py-2.5 text-sm font-semibold text-slate-600 bg-white border border-slate-200 rounded-lg hover:bg-slate-50"
              >
                取消
              </button>
              <button
                onClick={() => {
                  if (!newDieForm.specification.trim()) {
                    alert('请输入型材规格');
                    return;
                  }
                  addDie({
                    dieNumber: newDieForm.dieNumber,
                    model: newDieForm.model,
                    specification: newDieForm.specification,
                    drawing: newDieForm.drawing,
                    machineCount: 0,
                    totalWeight: 0,
                    status: 'available',
                    lastMaintenance: formatDate(new Date()),
                    maxMachineCount: newDieForm.maxMachineCount,
                  });
                  setShowAddDie(false);
                }}
                className="px-6 py-2.5 text-sm font-semibold text-white bg-gradient-to-r from-slate-700 to-slate-800 rounded-lg hover:from-slate-800 hover:to-slate-900 shadow-md flex items-center gap-2"
              >
                <CheckCircle2 className="w-4 h-4" />
                确认新增
              </button>
            </div>
          </div>
        </div>
      )}

      {/* 模具上机模态框 */}
      {showMountModal && selected && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 backdrop-blur-sm p-4">
          <div className="bg-white rounded-2xl shadow-2xl w-full max-w-md overflow-hidden animate-in">
            <div className="px-6 py-4 border-b border-slate-100 flex items-center justify-between bg-gradient-to-r from-blue-50 to-indigo-50">
              <h3 className="text-lg font-bold text-slate-800 flex items-center gap-2">
                <Play className="w-5 h-5 text-blue-600" />
                模具上机登记
              </h3>
              <button onClick={() => setShowMountModal(false)} className="w-8 h-8 rounded-lg hover:bg-white/60 flex items-center justify-center text-slate-500">
                <X className="w-5 h-5" />
              </button>
            </div>
            <div className="p-6 space-y-4">
              <div className="p-4 rounded-xl bg-blue-50/50 border border-blue-100">
                <div className="text-sm">
                  <span className="text-slate-500">模具编号：</span>
                  <span className="font-mono font-bold text-slate-800">{selected.dieNumber}</span>
                </div>
                <div className="text-sm mt-1">
                  <span className="text-slate-500">规格：</span>
                  <span className="font-medium text-slate-700">{selected.specification}</span>
                </div>
              </div>
              <div>
                <label className="text-xs font-semibold text-slate-600 block mb-1.5">上机机台</label>
                <select
                  value={mountForm.machineNo}
                  onChange={(e) => setMountForm({ ...mountForm, machineNo: e.target.value })}
                  className="w-full px-3 py-2.5 border border-slate-200 rounded-lg text-sm focus:ring-2 focus:ring-blue-500/30"
                >
                  <option value="挤压机01">挤压机01</option>
                  <option value="挤压机02">挤压机02</option>
                  <option value="挤压机03">挤压机03</option>
                  <option value="挤压机04">挤压机04</option>
                </select>
              </div>
              <div>
                <label className="text-xs font-semibold text-slate-600 block mb-1.5">操作人员</label>
                <select
                  value={mountForm.operator}
                  onChange={(e) => setMountForm({ ...mountForm, operator: e.target.value })}
                  className="w-full px-3 py-2.5 border border-slate-200 rounded-lg text-sm focus:ring-2 focus:ring-blue-500/30"
                >
                  <option value="张师傅">张师傅</option>
                  <option value="李师傅">李师傅</option>
                  <option value="王师傅">王师傅</option>
                  <option value="赵师傅">赵师傅</option>
                </select>
              </div>
              <div className="text-xs text-slate-500 bg-slate-50 p-3 rounded-lg">
                <div className="flex items-center gap-1.5">
                  <Clock className="w-3.5 h-3.5" />
                  上机时间：{formatDateTime(new Date())}
                </div>
              </div>
            </div>
            <div className="px-6 py-4 border-t border-slate-100 flex items-center justify-end gap-3 bg-slate-50/50">
              <button
                onClick={() => setShowMountModal(false)}
                className="px-5 py-2.5 text-sm font-semibold text-slate-600 bg-white border border-slate-200 rounded-lg hover:bg-slate-50"
              >
                取消
              </button>
              <button
                onClick={() => {
                  mountDieToMachine(selected.id, mountForm.machineNo, mountForm.operator);
                  setShowMountModal(false);
                }}
                className="px-6 py-2.5 text-sm font-semibold text-white bg-gradient-to-r from-blue-600 to-indigo-600 rounded-lg hover:from-blue-700 hover:to-indigo-700 shadow-md shadow-blue-500/25 flex items-center gap-2"
              >
                <CheckCircle2 className="w-4 h-4" />
                确认上机
              </button>
            </div>
          </div>
        </div>
      )}

      {/* 模具下机模态框 */}
      {showUnmountModal && selected && activeUsageRecord && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 backdrop-blur-sm p-4">
          <div className="bg-white rounded-2xl shadow-2xl w-full max-w-md overflow-hidden animate-in">
            <div className="px-6 py-4 border-b border-slate-100 flex items-center justify-between bg-gradient-to-r from-orange-50 to-amber-50">
              <h3 className="text-lg font-bold text-slate-800 flex items-center gap-2">
                <Square className="w-5 h-5 text-orange-600" />
                模具下机登记
              </h3>
              <button onClick={() => setShowUnmountModal(false)} className="w-8 h-8 rounded-lg hover:bg-white/60 flex items-center justify-center text-slate-500">
                <X className="w-5 h-5" />
              </button>
            </div>
            <div className="p-6 space-y-4">
              <div className="p-4 rounded-xl bg-orange-50/50 border border-orange-100">
                <div className="text-sm">
                  <span className="text-slate-500">模具：</span>
                  <span className="font-mono font-bold text-slate-800">{selected.dieNumber}</span>
                </div>
                <div className="text-sm mt-1">
                  <span className="text-slate-500">机台：</span>
                  <span className="font-medium text-slate-700">{activeUsageRecord.machineNo}</span>
                </div>
                <div className="text-sm mt-1">
                  <span className="text-slate-500">上机时间：</span>
                  <span className="font-medium text-slate-700">{activeUsageRecord.upTime}</span>
                </div>
              </div>
              <div>
                <label className="text-xs font-semibold text-slate-600 block mb-1.5">本次挤压重量 (吨)</label>
                <input
                  type="number"
                  step="0.1"
                  value={unmountForm.extrusionWeight}
                  onChange={(e) => setUnmountForm({ ...unmountForm, extrusionWeight: parseFloat(e.target.value) })}
                  className="w-full px-3 py-2.5 border border-slate-200 rounded-lg text-sm font-mono tabular-nums focus:ring-2 focus:ring-orange-500/30"
                />
              </div>
              <div>
                <label className="text-xs font-semibold text-slate-600 block mb-1.5">模具磨损情况</label>
                <select
                  value={unmountForm.wearCondition}
                  onChange={(e) => setUnmountForm({ ...unmountForm, wearCondition: e.target.value })}
                  className="w-full px-3 py-2.5 border border-slate-200 rounded-lg text-sm focus:ring-2 focus:ring-orange-500/30"
                >
                  <option value="正常">正常 - 无需维修</option>
                  <option value="轻微磨损">轻微磨损 - 可继续使用</option>
                  <option value="中度磨损">中度磨损 - 建议维修</option>
                  <option value="严重磨损">严重磨损 - 立即维修</option>
                </select>
              </div>
            </div>
            <div className="px-6 py-4 border-t border-slate-100 flex items-center justify-end gap-3 bg-slate-50/50">
              <button
                onClick={() => setShowUnmountModal(false)}
                className="px-5 py-2.5 text-sm font-semibold text-slate-600 bg-white border border-slate-200 rounded-lg hover:bg-slate-50"
              >
                取消
              </button>
              <button
                onClick={() => {
                  unmountDieFromMachine(activeUsageRecord.id, unmountForm.extrusionWeight, unmountForm.wearCondition);
                  setShowUnmountModal(false);
                }}
                className="px-6 py-2.5 text-sm font-semibold text-white bg-gradient-to-r from-orange-600 to-amber-600 rounded-lg hover:from-orange-700 hover:to-amber-700 shadow-md shadow-orange-500/25 flex items-center gap-2"
              >
                <CheckCircle2 className="w-4 h-4" />
                确认下机
              </button>
            </div>
          </div>
        </div>
      )}

      {/* 维修登记模态框 */}
      {showRepairModal && selected && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 backdrop-blur-sm p-4">
          <div className="bg-white rounded-2xl shadow-2xl w-full max-w-md overflow-hidden animate-in">
            <div className="px-6 py-4 border-b border-slate-100 flex items-center justify-between bg-gradient-to-r from-amber-50 to-yellow-50">
              <h3 className="text-lg font-bold text-slate-800 flex items-center gap-2">
                <Settings className="w-5 h-5 text-amber-600" />
                送修保养登记
              </h3>
              <button onClick={() => setShowRepairModal(false)} className="w-8 h-8 rounded-lg hover:bg-white/60 flex items-center justify-center text-slate-500">
                <X className="w-5 h-5" />
              </button>
            </div>
            <div className="p-6 space-y-4">
              <div className="p-4 rounded-xl bg-amber-50/50 border border-amber-100">
                <div className="text-sm">
                  <span className="text-slate-500">模具：</span>
                  <span className="font-mono font-bold text-slate-800">{selected.dieNumber}</span>
                </div>
                <div className="text-sm mt-1">
                  <span className="text-slate-500">已上机次数：</span>
                  <span className="font-medium text-slate-700">{selected.machineCount} / {selected.maxMachineCount} 次</span>
                </div>
              </div>
              <div>
                <label className="text-xs font-semibold text-slate-600 block mb-1.5">维修说明</label>
                <textarea
                  value={repairNote}
                  onChange={(e) => setRepairNote(e.target.value)}
                  placeholder="请描述维修内容或保养项目..."
                  rows={3}
                  className="w-full px-3 py-2.5 border border-slate-200 rounded-lg text-sm focus:ring-2 focus:ring-amber-500/30 resize-none"
                />
              </div>
              <div className="text-xs text-slate-500 bg-slate-50 p-3 rounded-lg">
                <div className="flex items-center gap-1.5">
                  <AlertTriangle className="w-3.5 h-3.5 text-amber-500" />
                  送修后模具状态将变更为"维修中"，维修完成后可点击"维修完成"恢复待用状态
                </div>
              </div>
            </div>
            <div className="px-6 py-4 border-t border-slate-100 flex items-center justify-end gap-3 bg-slate-50/50">
              <button
                onClick={() => setShowRepairModal(false)}
                className="px-5 py-2.5 text-sm font-semibold text-slate-600 bg-white border border-slate-200 rounded-lg hover:bg-slate-50"
              >
                取消
              </button>
              <button
                onClick={() => {
                  addDieRepairRecord(selected.id, repairNote);
                  setShowRepairModal(false);
                }}
                className="px-6 py-2.5 text-sm font-semibold text-white bg-gradient-to-r from-amber-600 to-yellow-600 rounded-lg hover:from-amber-700 hover:to-yellow-700 shadow-md shadow-amber-500/25 flex items-center gap-2"
              >
                <CheckCircle2 className="w-4 h-4" />
                确认送修
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
