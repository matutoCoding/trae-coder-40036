import { useState } from 'react';
import { useProductionStore } from '@/store/productionStore';
import { Wrench, Plus, Search, Filter, Info, Cog, AlertTriangle, CheckCircle2, XCircle, TrendingUp, Clock } from 'lucide-react';
import { cn } from '@/lib/utils';

const dieStatusConfig: Record<string, { label: string; color: string; bg: string; border: string }> = {
  available: { label: '待用', color: 'text-emerald-600', bg: 'bg-emerald-500', border: 'border-emerald-200' },
  onMachine: { label: '上机中', color: 'text-blue-600', bg: 'bg-blue-500', border: 'border-blue-200' },
  repair: { label: '维修中', color: 'text-amber-600', bg: 'bg-amber-500', border: 'border-amber-200' },
  scrapped: { label: '已报废', color: 'text-slate-500', bg: 'bg-slate-500', border: 'border-slate-200' },
};

export default function DieManagement() {
  const dies = useProductionStore((s) => s.dies);
  const dieUsageRecords = useProductionStore((s) => s.dieUsageRecords);
  const [filter, setFilter] = useState<string>('all');
  const [search, setSearch] = useState('');
  const [selectedDie, setSelectedDie] = useState<string | null>(dies[0]?.id || null);

  const filtered = dies.filter((d) => {
    const matchFilter = filter === 'all' || d.status === filter;
    const matchSearch = d.dieNumber.toLowerCase().includes(search.toLowerCase()) ||
      d.specification.toLowerCase().includes(search.toLowerCase());
    return matchFilter && matchSearch;
  });

  const selected = dies.find((d) => d.id === selectedDie);
  const dieRecords = dieUsageRecords.filter((r) => r.dieId === selectedDie);

  const stats = {
    total: dies.length,
    available: dies.filter(d => d.status === 'available').length,
    onMachine: dies.filter(d => d.status === 'onMachine').length,
    repair: dies.filter(d => d.status === 'repair').length,
  };

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
          <button className="flex items-center gap-1.5 px-4 py-2 text-sm bg-slate-800 text-white rounded-lg hover:bg-slate-900 shadow-sm">
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

                  <div className="mt-5 grid grid-cols-2 gap-2">
                    <button className="px-3 py-2.5 text-sm font-semibold text-white bg-blue-600 rounded-lg hover:bg-blue-700 transition-colors">
                      模具上机
                    </button>
                    <button className="px-3 py-2.5 text-sm font-semibold text-slate-700 bg-slate-100 rounded-lg hover:bg-slate-200 transition-colors">
                      维修记录
                    </button>
                  </div>
                </div>

                <div className="bg-white rounded-xl p-5 shadow-sm border border-slate-200/60">
                  <h4 className="font-bold text-slate-800 mb-4 flex items-center gap-2">
                    <Clock className="w-4 h-4 text-slate-600" />
                    最近上机记录
                  </h4>
                  {dieRecords.length > 0 ? (
                    <div className="space-y-3">
                      {dieRecords.map((r) => (
                        <div key={r.id} className="p-3 rounded-lg bg-slate-50/60 border border-slate-100">
                          <div className="flex items-center justify-between mb-2">
                            <span className="text-xs font-semibold text-blue-600">{r.machineNo}</span>
                            <span className="text-xs text-slate-500">{r.upTime.slice(0, 16)}</span>
                          </div>
                          <div className="text-xs text-slate-600 space-y-0.5">
                            <div>挤压重量: <span className="font-semibold text-slate-700">{r.extrusionWeight}t</span></div>
                            <div>磨损: <span className="font-semibold text-slate-700">{r.wearCondition}</span></div>
                            <div>操作: <span className="font-semibold text-slate-700">{r.operator}</span></div>
                          </div>
                        </div>
                      ))}
                    </div>
                  ) : (
                    <div className="text-center py-6">
                      <XCircle className="w-10 h-10 text-slate-300 mx-auto mb-2" />
                      <div className="text-sm text-slate-400">暂无上机记录</div>
                    </div>
                  )}
                </div>
              </>
            );
          })()}
        </div>
      </div>
    </div>
  );
}
