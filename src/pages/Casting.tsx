import { useState } from 'react';
import { useProductionStore } from '@/store/productionStore';
import { Flame, Plus, CheckCircle, XCircle, Clock, Thermometer, Search, Filter } from 'lucide-react';
import { cn } from '@/lib/utils';

const alloyElements = [
  { key: 'si', label: 'Si 硅', min: 0.4, max: 0.9, standard: '0.4-0.9' },
  { key: 'fe', label: 'Fe 铁', min: 0, max: 0.5, standard: '≤0.5' },
  { key: 'cu', label: 'Cu 铜', min: 0.1, max: 0.3, standard: '0.1-0.3' },
  { key: 'mn', label: 'Mn 锰', min: 0.05, max: 0.15, standard: '0.05-0.15' },
  { key: 'mg', label: 'Mg 镁', min: 0.7, max: 1.1, standard: '0.7-1.1' },
  { key: 'cr', label: 'Cr 铬', min: 0, max: 0.1, standard: '≤0.1' },
  { key: 'zn', label: 'Zn 锌', min: 0, max: 0.15, standard: '≤0.15' },
  { key: 'ti', label: 'Ti 钛', min: 0.02, max: 0.08, standard: '0.02-0.08' },
];

const statusConfig: Record<string, { label: string; icon: typeof CheckCircle; className: string }> = {
  qualified: { label: '合格', icon: CheckCircle, className: 'bg-emerald-50 text-emerald-600 border-emerald-200' },
  unqualified: { label: '不合格', icon: XCircle, className: 'bg-red-50 text-red-600 border-red-200' },
  pending: { label: '待检测', icon: Clock, className: 'bg-amber-50 text-amber-600 border-amber-200' },
};

export default function Casting() {
  const castBillets = useProductionStore((s) => s.castBillets);
  const addCastBillet = useProductionStore((s) => s.addCastBillet);
  const [activeTab, setActiveTab] = useState<'list' | 'add'>('list');
  const [search, setSearch] = useState('');
  const [operator] = useState('张师傅');

  const [form, setForm] = useState<Record<string, number>>({
    si: 0.52, fe: 0.31, cu: 0.18, mn: 0.08, mg: 0.85, cr: 0.02, zn: 0.05, ti: 0.04,
    homogenizationTemp: 565, homogenizationTime: 8, weight: 3200,
  });

  const checkElement = (key: string, value: number) => {
    const el = alloyElements.find((e) => e.key === key);
    if (!el) return true;
    return value >= el.min && value <= el.max;
  };

  const filtered = castBillets.filter(
    (b) => b.batchNumber.toLowerCase().includes(search.toLowerCase())
  );

  const isAllQualified = alloyElements.every((e) => checkElement(e.key, form[e.key]));

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-2 bg-white rounded-lg p-1 shadow-sm border border-slate-200/60">
          <button
            onClick={() => setActiveTab('list')}
            className={cn(
              'px-4 py-2 rounded-md text-sm font-semibold transition-all duration-200',
              activeTab === 'list'
                ? 'bg-blue-600 text-white shadow-sm'
                : 'text-slate-600 hover:bg-slate-100'
            )}
          >
            批次列表
          </button>
          <button
            onClick={() => setActiveTab('add')}
            className={cn(
              'px-4 py-2 rounded-md text-sm font-semibold transition-all duration-200 flex items-center gap-1.5',
              activeTab === 'add'
                ? 'bg-blue-600 text-white shadow-sm'
                : 'text-slate-600 hover:bg-slate-100'
            )}
          >
            <Plus className="w-4 h-4" />
            录入熔铸
          </button>
        </div>

        <div className="flex items-center gap-3">
          <div className="relative">
            <Search className="w-4 h-4 absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" />
            <input
              type="text"
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              placeholder="搜索批次号..."
              className="pl-9 pr-3 py-2 text-sm bg-white border border-slate-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500/30 w-52"
            />
          </div>
          <button className="flex items-center gap-1.5 px-3 py-2 text-sm bg-white border border-slate-200 rounded-lg text-slate-600 hover:bg-slate-50">
            <Filter className="w-4 h-4" />
            筛选
          </button>
        </div>
      </div>

      {activeTab === 'list' && (
        <div className="grid grid-cols-1 lg:grid-cols-4 gap-4 mb-6">
          {[
            { label: '总批次', value: castBillets.length, color: 'blue' },
            { label: '合格批次', value: castBillets.filter(b => b.status === 'qualified').length, color: 'emerald' },
            { label: '不合格批次', value: castBillets.filter(b => b.status === 'unqualified').length, color: 'red' },
            { label: '待处理', value: castBillets.filter(b => b.status === 'pending').length, color: 'amber' },
          ].map((s) => (
            <div key={s.label} className="bg-white rounded-xl p-5 border border-slate-200/60">
              <div className="text-sm text-slate-500 mb-1">{s.label}</div>
              <div className={`text-3xl font-bold tabular-nums text-${s.color}-600`}>{s.value}</div>
            </div>
          ))}
        </div>
      )}

      {activeTab === 'list' && (
        <div className="bg-white rounded-xl shadow-sm border border-slate-200/60 overflow-hidden">
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead className="bg-gradient-to-r from-orange-50 to-amber-50/50">
                <tr>
                  <th className="text-left px-5 py-3 font-semibold text-slate-700 text-xs uppercase tracking-wider">批次号</th>
                  {alloyElements.slice(0, 6).map((e) => (
                    <th key={e.key} className="text-left px-3 py-3 font-semibold text-slate-700 text-xs uppercase tracking-wider">{e.key}</th>
                  ))}
                  <th className="text-left px-3 py-3 font-semibold text-slate-700 text-xs uppercase tracking-wider">重量(kg)</th>
                  <th className="text-left px-3 py-3 font-semibold text-slate-700 text-xs uppercase tracking-wider">均质处理</th>
                  <th className="text-left px-3 py-3 font-semibold text-slate-700 text-xs uppercase tracking-wider">状态</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100">
                {filtered.map((b) => {
                  const cfg = statusConfig[b.status];
                  return (
                    <tr key={b.id} className="hover:bg-orange-50/30 transition-colors">
                      <td className="px-5 py-3.5">
                        <div className="flex items-center gap-2">
                          <div className="w-8 h-8 rounded-lg bg-orange-100 flex items-center justify-center">
                            <Flame className="w-4 h-4 text-orange-500" />
                          </div>
                          <span className="font-mono font-bold text-slate-800">{b.batchNumber}</span>
                        </div>
                      </td>
                      {alloyElements.slice(0, 6).map((e) => {
                        const val = b[e.key as keyof typeof b] as number;
                        const ok = checkElement(e.key, val);
                        return (
                          <td key={e.key} className="px-3 py-3.5">
                            <span className={cn(
                              'font-mono font-semibold tabular-nums',
                              ok ? 'text-emerald-600' : 'text-red-500'
                            )}>
                              {val}
                            </span>
                          </td>
                        );
                      })}
                      <td className="px-3 py-3.5">
                        <span className="font-semibold text-slate-700 tabular-nums">{b.weight}</span>
                      </td>
                      <td className="px-3 py-3.5">
                        {b.homogenizationTime > 0 ? (
                          <div className="text-xs">
                            <div className="flex items-center gap-1 text-slate-600">
                              <Thermometer className="w-3 h-3 text-orange-500" />
                              <span className="font-semibold tabular-nums">{b.homogenizationTemp}℃</span>
                            </div>
                            <div className="text-slate-500 mt-0.5">{b.homogenizationTime}小时</div>
                          </div>
                        ) : (
                          <span className="text-slate-400 text-xs">未处理</span>
                        )}
                      </td>
                      <td className="px-3 py-3.5">
                        <span className={cn(
                          'inline-flex items-center gap-1.5 px-2.5 py-1 rounded-md text-xs font-semibold border',
                          cfg.className
                        )}>
                          <cfg.icon className="w-3 h-3" />
                          {cfg.label}
                        </span>
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {activeTab === 'add' && (
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          <div className="lg:col-span-2 bg-white rounded-xl p-6 shadow-sm border border-slate-200/60">
            <h3 className="text-lg font-bold text-slate-800 mb-6 flex items-center gap-2">
              <span className="w-1 h-6 bg-orange-500 rounded-full" />
              铝合金熔铸成分录入
            </h3>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
              {alloyElements.map((el) => {
                const val = form[el.key];
                const ok = checkElement(el.key, val);
                return (
                  <div key={el.key} className="space-y-2">
                    <div className="flex items-center justify-between">
                      <label className="text-sm font-semibold text-slate-700">{el.label}</label>
                      <span className="text-xs text-slate-400">标准: {el.standard}</span>
                    </div>
                    <div className="flex items-center gap-3">
                      <input
                        type="range"
                        min={el.min - (el.max - el.min) * 0.2}
                        max={el.max + (el.max - el.min) * 0.2}
                        step={0.01}
                        value={val}
                        onChange={(e) => setForm({ ...form, [el.key]: parseFloat(e.target.value) })}
                        className="flex-1 h-2 rounded-lg appearance-none cursor-pointer bg-slate-200 accent-orange-500"
                      />
                      <div className={cn(
                        'w-20 px-3 py-1.5 rounded-lg text-center font-mono font-bold text-sm tabular-nums border',
                        ok
                          ? 'border-emerald-300 bg-emerald-50 text-emerald-600'
                          : 'border-red-300 bg-red-50 text-red-600'
                      )}>
                        {val.toFixed(2)}
                      </div>
                    </div>
                  </div>
                );
              })}
            </div>

            <div className="mt-8 pt-6 border-t border-slate-100">
              <h4 className="text-sm font-bold text-slate-700 mb-4 flex items-center gap-2">
                <Thermometer className="w-4 h-4 text-orange-500" />
                铸棒均质处理工艺参数
              </h4>
              <div className="grid grid-cols-1 md:grid-cols-3 gap-5">
                <div>
                  <label className="text-sm font-semibold text-slate-700 block mb-2">均质温度 (℃)</label>
                  <input
                    type="number"
                    value={form.homogenizationTemp}
                    onChange={(e) => setForm({ ...form, homogenizationTemp: parseFloat(e.target.value) })}
                    className="w-full px-3 py-2.5 border border-slate-200 rounded-lg font-mono tabular-nums focus:ring-2 focus:ring-orange-500/30 focus:border-orange-400"
                  />
                </div>
                <div>
                  <label className="text-sm font-semibold text-slate-700 block mb-2">保温时间 (h)</label>
                  <input
                    type="number"
                    value={form.homogenizationTime}
                    onChange={(e) => setForm({ ...form, homogenizationTime: parseInt(e.target.value) })}
                    className="w-full px-3 py-2.5 border border-slate-200 rounded-lg font-mono tabular-nums focus:ring-2 focus:ring-orange-500/30 focus:border-orange-400"
                  />
                </div>
                <div>
                  <label className="text-sm font-semibold text-slate-700 block mb-2">铸棒重量 (kg)</label>
                  <input
                    type="number"
                    value={form.weight}
                    onChange={(e) => setForm({ ...form, weight: parseFloat(e.target.value) })}
                    className="w-full px-3 py-2.5 border border-slate-200 rounded-lg font-mono tabular-nums focus:ring-2 focus:ring-orange-500/30 focus:border-orange-400"
                  />
                </div>
              </div>
            </div>

            <div className="mt-8 flex items-center justify-end gap-3">
              <button
                onClick={() => setActiveTab('list')}
                className="px-5 py-2.5 text-sm font-semibold text-slate-600 bg-slate-100 rounded-lg hover:bg-slate-200 transition-colors"
              >
                取消
              </button>
              <button
                onClick={() => {
                  const today = new Date();
                  const dateStr = today.toISOString().slice(0, 10).replace(/-/g, '');
                  const seq = String(castBillets.filter(b => b.batchNumber.startsWith(`ZB${dateStr}`)).length + 1).padStart(3, '0');
                  const batchNumber = `ZB${dateStr}${seq}`;
                  const isQualified = alloyElements.every(e => checkElement(e.key, form[e.key]));
                  
                  addCastBillet({
                    batchNumber,
                    si: form.si,
                    fe: form.fe,
                    cu: form.cu,
                    mn: form.mn,
                    mg: form.mg,
                    cr: form.cr,
                    zn: form.zn,
                    ti: form.ti,
                    status: isQualified ? 'qualified' : 'unqualified',
                    castingDate: today.toISOString().slice(0, 10),
                    homogenizationTemp: form.homogenizationTemp,
                    homogenizationTime: form.homogenizationTime,
                    weight: form.weight,
                  });
                  
                  setForm({
                    si: 0.52, fe: 0.31, cu: 0.18, mn: 0.08, mg: 0.85, cr: 0.02, zn: 0.05, ti: 0.04,
                    homogenizationTemp: 565, homogenizationTime: 8, weight: 3200,
                  });
                  setActiveTab('list');
                }}
                className="px-6 py-2.5 text-sm font-semibold text-white bg-gradient-to-r from-orange-500 to-amber-500 rounded-lg hover:from-orange-600 hover:to-amber-600 shadow-md shadow-orange-500/25 transition-all flex items-center gap-2"
              >
                <CheckCircle className="w-4 h-4" />
                确认提交并生成批次号
              </button>
            </div>
          </div>

          <div className="space-y-4">
            <div className={cn(
              'rounded-xl p-5 shadow-sm border',
              isAllQualified
                ? 'bg-gradient-to-br from-emerald-50 to-green-50 border-emerald-200'
                : 'bg-gradient-to-br from-red-50 to-orange-50 border-red-200'
            )}>
              <div className="flex items-center gap-3 mb-3">
                {isAllQualified ? (
                  <div className="w-12 h-12 rounded-xl bg-emerald-500 flex items-center justify-center">
                    <CheckCircle className="w-6 h-6 text-white" />
                  </div>
                ) : (
                  <div className="w-12 h-12 rounded-xl bg-red-500 flex items-center justify-center">
                    <XCircle className="w-6 h-6 text-white" />
                  </div>
                )}
                <div>
                  <div className={cn(
                    'text-lg font-bold',
                    isAllQualified ? 'text-emerald-700' : 'text-red-700'
                  )}>
                    {isAllQualified ? '成分判定合格' : '存在超标元素'}
                  </div>
                  <div className="text-xs text-slate-500 mt-0.5">6063-T5铝合金标准</div>
                </div>
              </div>
              <div className="text-xs text-slate-600 space-y-1 pt-3 border-t border-white/60">
                {alloyElements.map((el) => {
                  const ok = checkElement(el.key, form[el.key]);
                  return (
                    <div key={el.key} className="flex items-center justify-between py-1">
                      <span className="text-slate-500">{el.label}</span>
                      <span className={cn(
                        'font-semibold tabular-nums',
                        ok ? 'text-emerald-600' : 'text-red-500'
                      )}>
                        {form[el.key].toFixed(2)} {ok ? '✓' : '✗'}
                      </span>
                    </div>
                  );
                })}
              </div>
            </div>

            <div className="bg-white rounded-xl p-5 shadow-sm border border-slate-200/60">
              <h4 className="text-sm font-bold text-slate-700 mb-3">批次生成预览</h4>
              <div className="space-y-2 text-xs">
                <div className="flex justify-between py-1.5 border-b border-slate-100">
                  <span className="text-slate-500">批次号</span>
                  <span className="font-mono font-bold text-slate-800">ZB{new Date().toISOString().slice(0,10).replace(/-/g,'')}{String(castBillets.length + 1).padStart(3,'0')}</span>
                </div>
                <div className="flex justify-between py-1.5 border-b border-slate-100">
                  <span className="text-slate-500">合金牌号</span>
                  <span className="font-semibold text-slate-700">6063-T5</span>
                </div>
                <div className="flex justify-between py-1.5 border-b border-slate-100">
                  <span className="text-slate-500">熔铸日期</span>
                  <span className="font-semibold text-slate-700">{new Date().toISOString().slice(0,10)}</span>
                </div>
                <div className="flex justify-between py-1.5">
                  <span className="text-slate-500">预计合格率</span>
                  <span className="font-bold text-emerald-600">{isAllQualified ? '98.5%' : '需复检'}</span>
                </div>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
