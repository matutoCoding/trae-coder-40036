import { useState } from 'react';
import { useProductionStore } from '@/store/productionStore';
import { Sparkles, Droplets, Brush, CheckCircle, AlertTriangle, ChevronDown, Layers, Zap, Clock } from 'lucide-react';
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, LineChart, Line, Legend } from 'recharts';

export default function SurfaceTreatment() {
  const records = useProductionStore((s) => s.surfaceRecords);
  const [selectedId, setSelectedId] = useState(records[0]?.id || '');
  const [processTab, setProcessTab] = useState<'oxidation' | 'spraying'>('oxidation');

  const filtered = records.filter((r) => r.processType === processTab);
  const selected = records.find((r) => r.id === selectedId) || filtered[0];

  const oxidationParams = [
    { name: '参数', '01批': 18.5, '02批': 20, '03批': 19.2, standard: 14, unit: '槽液温度℃' },
    { name: '参数', '01批': 12.5, '02批': 14, '03批': 13.2, standard: 14, unit: '电压V' },
    { name: '参数', '01批': 1180, '02批': 1200, '03批': 1150, standard: 1200, unit: '电流A' },
    { name: '参数', '01批': 32, '02批': 35, '03批': 33, standard: 35, unit: '处理时间min' },
    { name: '参数', '01批': 10.5, '02批': 12, '03批': 11.2, standard: 10, unit: '膜厚μm' },
  ];

  const sprayingParams = [
    { t: '底粉', thickness: 60, color: '#3b82f6' },
    { t: '色粉', thickness: 65, color: '#10b981' },
    { t: '清漆', thickness: 30, color: '#8b5cf6' },
    { t: '固化层', thickness: 70, color: '#f59e0b' },
  ];

  const adhesionTest = [
    { p: '0°', value: 0 },
    { p: '90°', value: 1.2 },
    { p: '180°', value: 0.8 },
    { p: '270°', value: 1.0 },
    { p: '360°', value: 0.5 },
  ];

  return (
    <div className="space-y-6">
      <div className="flex items-center gap-2 bg-white rounded-lg p-1 shadow-sm border border-slate-200/60 w-fit">
        <button
          onClick={() => setProcessTab('oxidation')}
          className={`px-5 py-2 rounded-md text-sm font-semibold transition-all flex items-center gap-2 ${processTab === 'oxidation' ? 'bg-emerald-600 text-white shadow-sm' : 'text-slate-600 hover:bg-slate-100'}`}
        >
          <Droplets className="w-4 h-4" />
          阳极氧化
        </button>
        <button
          onClick={() => setProcessTab('spraying')}
          className={`px-5 py-2 rounded-md text-sm font-semibold transition-all flex items-center gap-2 ${processTab === 'spraying' ? 'bg-purple-600 text-white shadow-sm' : 'text-slate-600 hover:bg-slate-100'}`}
        >
          <Brush className="w-4 h-4" />
          静电喷涂
        </button>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        {[
          { label: '今日处理批次', value: records.length, icon: Layers, color: 'emerald' },
          { label: '平均膜厚', value: processTab === 'oxidation' ? '11.2μm' : '65μm', icon: Sparkles, color: 'blue' },
          { label: '合格率', value: '98.2%', icon: CheckCircle, color: 'emerald' },
          { label: '待处理', value: 3, icon: Clock, color: 'amber' },
        ].map((s) => (
          <div key={s.label} className="bg-white rounded-xl p-5 shadow-sm border border-slate-200/60">
            <div className="flex items-start justify-between">
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

      {filtered.length > 0 && (
        <div className="bg-white rounded-xl shadow-sm border border-slate-200/60 overflow-hidden">
          <div className="px-5 py-4 border-b border-slate-100 flex items-center justify-between flex-wrap gap-3">
            <h3 className="font-bold text-slate-800 flex items-center gap-2">
              {processTab === 'oxidation' ? <Droplets className="w-5 h-5 text-emerald-500" /> : <Brush className="w-5 h-5 text-purple-500" />}
              {processTab === 'oxidation' ? '氧化处理记录' : '喷涂处理记录'}
            </h3>
            <div className="relative">
              <select
                value={selected?.id || ''}
                onChange={(e) => setSelectedId(e.target.value)}
                className="appearance-none pl-3 pr-9 py-2 text-sm bg-slate-50 border border-slate-200 rounded-lg font-semibold text-slate-700"
              >
                {filtered.map((r) => (
                  <option key={r.id} value={r.id}>
                    {r.batchNumber} - {r.color}
                  </option>
                ))}
              </select>
              <ChevronDown className="w-4 h-4 absolute right-2.5 top-1/2 -translate-y-1/2 text-slate-400 pointer-events-none" />
            </div>
          </div>

          {selected && (
            <div className="p-5">
              <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-6 p-4 rounded-xl bg-gradient-to-r from-slate-50 to-white border border-slate-100">
                {[
                  { k: '批次号', v: selected.batchNumber },
                  { k: '处理日期', v: selected.date },
                  { k: '颜色', v: selected.color },
                  { k: '操作人员', v: selected.operator },
                  { k: '槽液温度', v: `${selected.bathTemp}℃` },
                  { k: '电压', v: `${selected.voltage}V` },
                  { k: '电流', v: `${selected.current}A` },
                  { k: '处理时间', v: `${selected.processTime}min` },
                ].map((item) => (
                  <div key={item.k}>
                    <div className="text-xs text-slate-500">{item.k}</div>
                    <div className="text-sm font-bold text-slate-800 mt-0.5 tabular-nums">{item.v}</div>
                  </div>
                ))}
              </div>
            </div>
          )}
        </div>
      )}

      {processTab === 'oxidation' ? (
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          <div className="bg-white rounded-xl p-5 shadow-sm border border-slate-200/60 lg:col-span-2">
            <h3 className="text-base font-bold text-slate-800 mb-4 flex items-center gap-2">
              <span className="w-1 h-5 bg-emerald-500 rounded-full" />
              近3批氧化工艺参数对比
            </h3>
            <div className="h-64">
              <ResponsiveContainer width="100%" height="100%">
                <BarChart data={oxidationParams} barGap={4} barCategoryGap="20%">
                  <CartesianGrid strokeDasharray="3 3" stroke="#f1f5f9" vertical={false} />
                  <XAxis dataKey="unit" tick={{ fontSize: 10, fill: '#64748b' }} tickLine={false} axisLine={false} />
                  <YAxis tick={{ fontSize: 10, fill: '#94a3b8' }} tickLine={false} axisLine={false} width={40} />
                  <Tooltip contentStyle={{ borderRadius: 8, border: '1px solid #e2e8f0', fontSize: 12 }} />
                  <Legend iconType="circle" wrapperStyle={{ fontSize: 11 }} />
                  <Bar dataKey="standard" name="标准值" fill="#e2e8f0" radius={[2, 2, 0, 0]} />
                  <Bar dataKey="01批" fill="#10b981" radius={[3, 3, 0, 0]} />
                  <Bar dataKey="02批" fill="#059669" radius={[3, 3, 0, 0]} />
                  <Bar dataKey="03批" fill="#047857" radius={[3, 3, 0, 0]} />
                </BarChart>
              </ResponsiveContainer>
            </div>
          </div>

          <div className="space-y-4">
            <div className="bg-white rounded-xl p-5 shadow-sm border border-slate-200/60">
              <h4 className="text-sm font-bold text-slate-800 mb-4 flex items-center gap-2">
                <Zap className="w-4 h-4 text-amber-500" />
                前处理工艺
              </h4>
              <div className="space-y-2">
                {[
                  { step: '脱脂', time: '8 min', temp: '55℃', status: 'ok' },
                  { step: '碱洗', time: '3 min', temp: '50℃', status: 'ok' },
                  { step: '酸洗', time: '2 min', temp: '常温', status: 'ok' },
                  { step: '中和', time: '1 min', temp: '常温', status: 'ok' },
                  { step: '氧化膜', time: '35 min', temp: '20℃', status: 'active' },
                ].map((s, i) => (
                  <div key={i} className={`flex items-center justify-between p-2.5 rounded-lg ${s.status === 'active' ? 'bg-emerald-50 border border-emerald-200' : 'bg-slate-50/60'}`}>
                    <div className="flex items-center gap-2">
                      <div className={`w-6 h-6 rounded-full flex items-center justify-center text-xs font-bold ${s.status === 'ok' ? 'bg-emerald-500 text-white' : s.status === 'active' ? 'bg-emerald-500 text-white animate-pulse' : 'bg-slate-300 text-white'}`}>
                        {s.status === 'ok' ? '✓' : i + 1}
                      </div>
                      <span className="text-sm font-semibold text-slate-700">{s.step}</span>
                    </div>
                    <div className="text-xs text-slate-500 text-right">
                      <div className="font-semibold">{s.time}</div>
                      <div>{s.temp}</div>
                    </div>
                  </div>
                ))}
              </div>
            </div>

            <div className="bg-white rounded-xl p-5 shadow-sm border border-slate-200/60">
              <h4 className="text-sm font-bold text-slate-800 mb-3">膜厚检测结果</h4>
              <div className="text-center">
                <div className="relative inline-flex items-center justify-center">
                  <svg className="w-32 h-32 transform -rotate-90">
                    <circle cx="64" cy="64" r="52" fill="none" stroke="#f1f5f9" strokeWidth="10" />
                    <circle
                      cx="64" cy="64" r="52" fill="none" stroke="#10b981" strokeWidth="10"
                      strokeLinecap="round"
                      strokeDasharray={`${(selected?.filmThickness || 11.2) * 20} ${2 * Math.PI * 52}`}
                    />
                  </svg>
                  <div className="absolute inset-0 flex flex-col items-center justify-center">
                    <span className="text-3xl font-bold text-emerald-600 tabular-nums">{selected?.filmThickness || 11.2}</span>
                    <span className="text-xs text-slate-500">μm</span>
                  </div>
                </div>
                <div className="mt-2 text-xs">
                  <span className="text-emerald-600 font-semibold">合格</span>
                  <span className="text-slate-400 ml-1">标准 ≥ 10μm</span>
                </div>
              </div>
            </div>
          </div>
        </div>
      ) : (
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          <div className="bg-white rounded-xl p-5 shadow-sm border border-slate-200/60 lg:col-span-2">
            <h3 className="text-base font-bold text-slate-800 mb-4 flex items-center gap-2">
              <span className="w-1 h-5 bg-purple-500 rounded-full" />
              喷涂涂层结构分析
            </h3>
            <div className="h-64">
              <ResponsiveContainer width="100%" height="100%">
                <BarChart data={sprayingParams} layout="vertical" barSize={30}>
                  <CartesianGrid strokeDasharray="3 3" stroke="#f1f5f9" horizontal={false} />
                  <XAxis type="number" tick={{ fontSize: 10, fill: '#94a3b8' }} tickLine={false} axisLine={false} />
                  <YAxis type="category" dataKey="t" tick={{ fontSize: 11, fill: '#64748b' }} tickLine={false} axisLine={false} width={55} />
                  <Tooltip contentStyle={{ borderRadius: 8, border: '1px solid #e2e8f0', fontSize: 12 }} formatter={(v: number) => [`${v} μm`, '厚度']} />
                  <Bar dataKey="thickness" name="涂层厚度" radius={[0, 6, 6, 0]} fill="#8b5cf6" label={{ position: 'right', fontSize: 11, fill: '#8b5cf6', formatter: (v: number) => `${v}μm` }} />
                </BarChart>
              </ResponsiveContainer>
            </div>
          </div>

          <div className="space-y-4">
            <div className="bg-white rounded-xl p-5 shadow-sm border border-slate-200/60">
              <h4 className="text-sm font-bold text-slate-800 mb-4">涂层颜色配置</h4>
              <div className="space-y-3">
                <div className="flex items-center gap-3 p-3 rounded-lg bg-slate-50/70">
                  <div className="w-10 h-10 rounded-lg shadow-inner" style={{ backgroundColor: '#f5f5f5' }} />
                  <div>
                    <div className="text-sm font-bold text-slate-800">{selected?.color || '哑光白'}</div>
                    <div className="text-xs text-slate-500 font-mono">RAL 9016</div>
                  </div>
                </div>
                <div className="grid grid-cols-3 gap-2">
                  {['#f5f5f5', '#1e40af', '#047857', '#7c2d12', '#374151', '#6b21a8', '#ea580c', '#991b1b', '#164e63'].map((c) => (
                    <div key={c} className="aspect-square rounded-lg shadow-inner cursor-pointer hover:ring-2 hover:ring-purple-400 transition-all" style={{ backgroundColor: c }} />
                  ))}
                </div>
              </div>
            </div>

            <div className="bg-white rounded-xl p-5 shadow-sm border border-slate-200/60">
              <h4 className="text-sm font-bold text-slate-800 mb-3 flex items-center gap-2">
                <AlertTriangle className="w-4 h-4 text-amber-500" />
                附着力测试 (百格法)
              </h4>
              <div className="h-32">
                <ResponsiveContainer width="100%" height="100%">
                  <LineChart data={adhesionTest}>
                    <CartesianGrid strokeDasharray="3 3" stroke="#f1f5f9" />
                    <XAxis dataKey="p" tick={{ fontSize: 10, fill: '#64748b' }} tickLine={false} axisLine={false} />
                    <YAxis domain={[0, 2]} tick={{ fontSize: 10, fill: '#94a3b8' }} tickLine={false} axisLine={false} width={30} />
                    <Tooltip contentStyle={{ borderRadius: 8, border: '1px solid #e2e8f0', fontSize: 12 }} formatter={(v: number) => [`脱落${v}%`, '等级']} />
                    <Line type="monotone" dataKey="value" name="脱落率" stroke="#f59e0b" strokeWidth={2.5} dot={{ r: 5, fill: '#f59e0b' }} />
                  </LineChart>
                </ResponsiveContainer>
              </div>
              <div className="text-center text-xs mt-2">
                <span className="font-bold text-emerald-600">0级合格</span>
                <span className="text-slate-400 ml-1">平均脱落 {(selected?.adhesion ? (selected.adhesion * 100).toFixed(0) : '0')}%</span>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
