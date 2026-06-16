import { useState, useMemo, useEffect } from 'react';
import { useProductionStore } from '@/store/productionStore';
import { cn } from '@/lib/utils';
import {
  Sparkles,
  Droplets,
  Brush,
  CheckCircle,
  AlertTriangle,
  ChevronDown,
  Layers,
  Zap,
  Clock,
  Inbox,
  PlayCircle,
  X,
  User,
  Factory,
  Scale,
  Tag,
  ArrowRight,
} from 'lucide-react';
import { BatchTraceModal } from '@/components/BatchTraceModal';
import {
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
  LineChart,
  Line,
  Legend,
} from 'recharts';

export default function SurfaceTreatment() {
  const agingRecords = useProductionStore((s) => s.agingRecords);
  const records = useProductionStore((s) => s.surfaceRecords);
  const extrusionBatches = useProductionStore((s) => s.extrusionBatches);
  const createSurfaceFromAging = useProductionStore((s) => s.createSurfaceFromAging);
  const completeSurfaceRecord = useProductionStore((s) => s.completeSurfaceRecord);

  const [processTab, setProcessTab] = useState<'oxidation' | 'spraying'>('oxidation');
  const [selectedOxidationId, setSelectedOxidationId] = useState<string | null>(null);
  const [selectedSprayingId, setSelectedSprayingId] = useState<string | null>(null);
  const [pendingTab, setPendingTab] = useState<'oxidation' | 'spraying'>('oxidation');

  const [showModal, setShowModal] = useState(false);
  const [modalData, setModalData] = useState<{
    agingId: string;
    processType: 'oxidation' | 'spraying';
    batchNumber: string;
  } | null>(null);
  const [operator, setOperator] = useState('');
  const [showCompleteModal, setShowCompleteModal] = useState(false);
  const [completeId, setCompleteId] = useState<string | null>(null);
  const [completeForm, setCompleteForm] = useState({
    filmThickness: 0,
    color: '',
    adhesion: 0,
  });
  const [showTrace, setShowTrace] = useState(false);
  const [traceBatchId, setTraceBatchId] = useState<string | null>(null);

  const pendingAgingRecords = useMemo(() => {
    return agingRecords.filter((a) => {
      if (a.status !== 'completed') return false;
      const hasSurface = records.some((s) => s.agingRecordId === a.id);
      return !hasSurface;
    });
  }, [agingRecords, records]);

  const oxidationRecords = useMemo(
    () => records.filter((r) => r.processType === 'oxidation'),
    [records]
  );
  const sprayingRecords = useMemo(
    () => records.filter((r) => r.processType === 'spraying'),
    [records]
  );
  const filtered = processTab === 'oxidation' ? oxidationRecords : sprayingRecords;
  const currentSelectedId =
    processTab === 'oxidation' ? selectedOxidationId : selectedSprayingId;
  const setCurrentSelectedId =
    processTab === 'oxidation' ? setSelectedOxidationId : setSelectedSprayingId;

  useEffect(() => {
    if (processTab === 'oxidation' && !selectedOxidationId && oxidationRecords.length > 0) {
      setSelectedOxidationId(oxidationRecords[0].id);
    }
    if (processTab === 'spraying' && !selectedSprayingId && sprayingRecords.length > 0) {
      setSelectedSprayingId(sprayingRecords[0].id);
    }
  }, [processTab, oxidationRecords, sprayingRecords, selectedOxidationId, selectedSprayingId]);

  const selected = filtered.find((r) => r.id === currentSelectedId) || filtered[0];

  const handleTabChange = (tab: 'oxidation' | 'spraying') => {
    setProcessTab(tab);
  };

  const openModal = (agingId: string, processType: 'oxidation' | 'spraying', batchNumber: string) => {
    setModalData({ agingId, processType, batchNumber });
    setOperator(processType === 'oxidation' ? '氧化班周师傅' : '喷涂班吴师傅');
    setShowModal(true);
  };

  const handleConfirmCreate = () => {
    if (modalData) {
      createSurfaceFromAging(modalData.agingId, modalData.processType, operator);
      setShowModal(false);
      setModalData(null);
    }
  };

  const openCompleteModal = (id: string) => {
    const record = records.find((r) => r.id === id);
    if (record) {
      setCompleteId(id);
      setCompleteForm({
        filmThickness: record.filmThickness || (record.processType === 'oxidation' ? 11 : 65),
        color: record.color || (record.processType === 'oxidation' ? '银白' : '哑光白'),
        adhesion: record.adhesion || 0.5,
      });
      setShowCompleteModal(true);
    }
  };

  const handleConfirmComplete = () => {
    if (completeId) {
      completeSurfaceRecord(completeId, {
        filmThickness: completeForm.filmThickness,
        color: completeForm.color,
        adhesion: completeForm.adhesion,
      });
      setShowCompleteModal(false);
      setCompleteId(null);
    }
  };

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

  const primaryColor = processTab === 'oxidation' ? 'emerald' : 'purple';
  const pendingPrimaryColor = pendingTab === 'oxidation' ? 'emerald' : 'purple';

  return (
    <div className="space-y-6">
      <div className="flex items-center gap-2 bg-white rounded-lg p-1 shadow-sm border border-slate-200/60 w-fit">
        <button
          onClick={() => handleTabChange('oxidation')}
          className={cn(
            'px-5 py-2 rounded-md text-sm font-semibold transition-all flex items-center gap-2',
            processTab === 'oxidation'
              ? 'bg-emerald-600 text-white shadow-sm'
              : 'text-slate-600 hover:bg-slate-100'
          )}
        >
          <Droplets className="w-4 h-4" />
          阳极氧化
        </button>
        <button
          onClick={() => handleTabChange('spraying')}
          className={cn(
            'px-5 py-2 rounded-md text-sm font-semibold transition-all flex items-center gap-2',
            processTab === 'spraying'
              ? 'bg-purple-600 text-white shadow-sm'
              : 'text-slate-600 hover:bg-slate-100'
          )}
        >
          <Brush className="w-4 h-4" />
          静电喷涂
        </button>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        {[
          { label: '今日处理批次', value: records.length, icon: Layers, color: primaryColor },
          {
            label: '平均膜厚',
            value: processTab === 'oxidation' ? '11.2μm' : '65μm',
            icon: Sparkles,
            color: 'blue',
          },
          { label: '合格率', value: '98.2%', icon: CheckCircle, color: 'emerald' },
          { label: '待处理', value: pendingAgingRecords.length, icon: Clock, color: 'amber' },
        ].map((s) => (
          <div
            key={s.label}
            className="bg-white rounded-xl p-5 shadow-sm border border-slate-200/60 relative overflow-hidden"
          >
            <div
              className={cn(
                'absolute top-0 right-0 w-24 h-24 rounded-full -mr-8 -mt-8 opacity-50',
                `bg-${s.color}-50`
              )}
            />
            <div className="flex items-start justify-between relative">
              <div>
                <p className="text-sm text-slate-500 font-medium">{s.label}</p>
                <p className={cn('text-3xl font-bold mt-1 tabular-nums', `text-${s.color}-600`)}>
                  {s.value}
                </p>
              </div>
              <div
                className={cn(
                  'w-11 h-11 rounded-xl flex items-center justify-center',
                  `bg-${s.color}-500/10`
                )}
              >
                <s.icon className={cn('w-5 h-5', `text-${s.color}-500`)} />
              </div>
            </div>
          </div>
        ))}
      </div>

      <div className="bg-white rounded-xl shadow-sm border border-slate-200/60 overflow-hidden">
        <div className="px-5 py-4 border-b border-slate-100 flex items-center justify-between flex-wrap gap-3">
          <h3 className="font-bold text-slate-800 flex items-center gap-2">
            <Inbox className="w-5 h-5 text-amber-500" />
            待处理时效批次
            <span className="px-2 py-0.5 text-xs rounded-full bg-amber-100 text-amber-700 font-semibold">
              {pendingAgingRecords.length} 条
            </span>
          </h3>
          <div className="flex items-center gap-2 bg-slate-50 rounded-lg p-1">
            <button
              onClick={() => setPendingTab('oxidation')}
              className={cn(
                'px-3 py-1.5 rounded-md text-xs font-semibold transition-all flex items-center gap-1.5',
                pendingTab === 'oxidation'
                  ? 'bg-emerald-600 text-white shadow-sm'
                  : 'text-slate-500 hover:bg-white'
              )}
            >
              <Droplets className="w-3.5 h-3.5" />
              氧化待处理
            </button>
            <button
              onClick={() => setPendingTab('spraying')}
              className={cn(
                'px-3 py-1.5 rounded-md text-xs font-semibold transition-all flex items-center gap-1.5',
                pendingTab === 'spraying'
                  ? 'bg-purple-600 text-white shadow-sm'
                  : 'text-slate-500 hover:bg-white'
              )}
            >
              <Brush className="w-3.5 h-3.5" />
              喷涂待处理
            </button>
          </div>
        </div>

        <div className="p-5">
          {pendingAgingRecords.length === 0 ? (
            <div className="py-12 text-center">
              <CheckCircle className="w-12 h-12 text-emerald-400 mx-auto mb-3" />
              <p className="text-slate-500 font-medium">当前暂无待处理的时效批次</p>
              <p className="text-xs text-slate-400 mt-1">时效完成的批次会自动出现在这里</p>
            </div>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
              {pendingAgingRecords.map((aging) => {
                const batch = extrusionBatches.find((b) => b.id === aging.batchId);
                return (
                  <div
                    key={aging.id}
                    className="border border-slate-200 rounded-xl p-4 bg-gradient-to-br from-slate-50/50 to-white hover:shadow-md hover:border-slate-300 transition-all"
                  >
                    <div className="flex items-start justify-between mb-3">
                      <div>
                        <div className="flex items-center gap-2">
                          <Tag className="w-3.5 h-3.5 text-slate-400" />
                          <span className="font-mono font-bold text-sm text-slate-800 cursor-pointer hover:underline underline-offset-2 decoration-blue-400" onClick={() => { setTraceBatchId(aging.batchId); setShowTrace(true); }}>
                            {aging.batchNumber}
                          </span>
                        </div>
                        <div className="flex items-center gap-2 mt-1.5">
                          <Factory className="w-3 h-3 text-slate-400" />
                          <span className="text-xs text-slate-600">
                            {aging.profileType || batch?.profileType || '未知型材'}
                          </span>
                        </div>
                      </div>
                      <div className="flex items-center gap-1 px-2 py-1 rounded-md bg-amber-50 border border-amber-200">
                        <Clock className="w-3 h-3 text-amber-600" />
                        <span className="text-xs font-semibold text-amber-700">待处理</span>
                      </div>
                    </div>

                    <div className="flex items-center justify-between py-2.5 border-t border-slate-100 border-b border-slate-100 mb-3">
                      <div className="flex items-center gap-2">
                        <Scale className="w-3.5 h-3.5 text-slate-400" />
                        <span className="text-xs text-slate-500">产出重量</span>
                      </div>
                      <span className="font-bold text-slate-800 tabular-nums">
                        {aging.outputWeight?.toFixed(1) || '0.0'}
                        <span className="text-xs text-slate-400 font-normal ml-0.5">kg</span>
                      </span>
                    </div>

                    <div className="flex items-center gap-2">
                      <button
                        onClick={() =>
                          openModal(aging.id, 'oxidation', aging.batchNumber)
                        }
                        className={cn(
                          'flex-1 py-2 rounded-lg text-xs font-semibold transition-all flex items-center justify-center gap-1.5',
                          pendingTab === 'oxidation'
                            ? 'bg-emerald-600 text-white hover:bg-emerald-700 shadow-sm shadow-emerald-500/20'
                            : 'bg-emerald-50 text-emerald-700 hover:bg-emerald-100 border border-emerald-200'
                        )}
                      >
                        <Droplets className="w-3.5 h-3.5" />
                        阳极氧化
                      </button>
                      <button
                        onClick={() =>
                          openModal(aging.id, 'spraying', aging.batchNumber)
                        }
                        className={cn(
                          'flex-1 py-2 rounded-lg text-xs font-semibold transition-all flex items-center justify-center gap-1.5',
                          pendingTab === 'spraying'
                            ? 'bg-purple-600 text-white hover:bg-purple-700 shadow-sm shadow-purple-500/20'
                            : 'bg-purple-50 text-purple-700 hover:bg-purple-100 border border-purple-200'
                        )}
                      >
                        <Brush className="w-3.5 h-3.5" />
                        静电喷涂
                      </button>
                    </div>
                  </div>
                );
              })}
            </div>
          )}
        </div>
      </div>

      {filtered.length > 0 && (
        <div className="bg-white rounded-xl shadow-sm border border-slate-200/60 overflow-hidden">
          <div className="px-5 py-4 border-b border-slate-100 flex items-center justify-between flex-wrap gap-3">
            <h3 className="font-bold text-slate-800 flex items-center gap-2">
              {processTab === 'oxidation' ? (
                <Droplets className="w-5 h-5 text-emerald-500" />
              ) : (
                <Brush className="w-5 h-5 text-purple-500" />
              )}
              {processTab === 'oxidation' ? '氧化处理记录' : '喷涂处理记录'}
            </h3>
            <div className="relative">
              <select
                value={selected?.id || ''}
                onChange={(e) => setCurrentSelectedId(e.target.value)}
                className="appearance-none pl-3 pr-9 py-2 text-sm bg-slate-50 border border-slate-200 rounded-lg font-semibold text-slate-700"
              >
                {filtered.map((r) => (
                  <option key={r.id} value={r.id}>
                    {r.batchNumber} - {r.color}
                    {r.status === 'processing' ? ' (处理中)' : ''}
                  </option>
                ))}
              </select>
              <ChevronDown className="w-4 h-4 absolute right-2.5 top-1/2 -translate-y-1/2 text-slate-400 pointer-events-none" />
            </div>
          </div>

          {selected && (
            <div className="p-5">
              <div className="grid grid-cols-2 md:grid-cols-5 gap-4 mb-6 p-4 rounded-xl bg-gradient-to-r from-slate-50 to-white border border-slate-100">
                {[
                  { k: '批次号', v: selected.batchNumber, traceable: true },
                  { k: '处理日期', v: selected.date },
                  { k: '颜色', v: selected.color },
                  { k: '操作人员', v: selected.operator },
                  {
                    k: '状态',
                    v:
                      selected.status === 'processing'
                        ? '处理中'
                        : selected.status === 'completed'
                          ? '已完成'
                          : '待处理',
                    badge: true,
                  },
                ].map((item) => (
                  <div key={item.k}>
                    <div className="text-xs text-slate-500">{item.k}</div>
                    {item.badge ? (
                      <div
                        className={cn(
                          'inline-flex items-center gap-1 px-2 py-0.5 rounded-md text-xs font-bold mt-0.5',
                          selected.status === 'processing'
                            ? 'bg-amber-100 text-amber-700'
                            : selected.status === 'completed'
                              ? 'bg-emerald-100 text-emerald-700'
                              : 'bg-slate-100 text-slate-700'
                        )}
                      >
                        {selected.status === 'processing' && (
                          <PlayCircle className="w-3 h-3 animate-pulse" />
                        )}
                        {selected.status === 'completed' && <CheckCircle className="w-3 h-3" />}
                        {item.v}
                      </div>
                    ) : (
                      <div className={cn(
                        'text-sm font-bold text-slate-800 mt-0.5 tabular-nums',
                        item.traceable && 'font-mono cursor-pointer hover:underline underline-offset-2 decoration-blue-400'
                      )}
                        onClick={item.traceable ? () => { setTraceBatchId(selected.batchId); setShowTrace(true); } : undefined}
                      >
                        {item.v}
                      </div>
                    )}
                  </div>
                ))}
              </div>

              <div className="grid grid-cols-2 md:grid-cols-4 gap-3 mb-5">
                {[
                  { k: '槽液温度', v: `${selected.bathTemp}℃` },
                  { k: '电压', v: `${selected.voltage}V` },
                  { k: '电流', v: `${selected.current}A` },
                  { k: '处理时间', v: `${selected.processTime}min` },
                ].map((item) => (
                  <div
                    key={item.k}
                    className={cn(
                      'p-3 rounded-lg border',
                      processTab === 'oxidation'
                        ? 'bg-emerald-50/50 border-emerald-100'
                        : 'bg-purple-50/50 border-purple-100'
                    )}
                  >
                    <div className="text-xs text-slate-500">{item.k}</div>
                    <div
                      className={cn(
                        'text-sm font-bold mt-0.5 tabular-nums',
                        processTab === 'oxidation' ? 'text-emerald-700' : 'text-purple-700'
                      )}
                    >
                      {item.v}
                    </div>
                  </div>
                ))}
              </div>

              {selected.status === 'processing' && (
                <div className="mb-6 p-4 rounded-xl bg-gradient-to-r from-amber-50 to-orange-50 border border-amber-200 flex items-center justify-between flex-wrap gap-3">
                  <div className="flex items-center gap-3">
                    <div className="w-10 h-10 rounded-lg bg-amber-500/10 flex items-center justify-center">
                      <PlayCircle className="w-5 h-5 text-amber-600 animate-pulse" />
                    </div>
                    <div>
                      <div className="text-sm font-bold text-amber-800">当前处理中</div>
                      <div className="text-xs text-amber-600">
                        处理完成后可录入检测参数并标记完成
                      </div>
                    </div>
                  </div>
                  <button
                    onClick={() => openCompleteModal(selected.id)}
                    className={cn(
                      'px-5 py-2.5 rounded-lg text-sm font-bold text-white shadow-md transition-all flex items-center gap-2',
                      processTab === 'oxidation'
                        ? 'bg-gradient-to-r from-emerald-600 to-teal-600 hover:from-emerald-700 hover:to-teal-700 shadow-emerald-500/25'
                        : 'bg-gradient-to-r from-purple-600 to-indigo-600 hover:from-purple-700 hover:to-indigo-700 shadow-purple-500/25'
                    )}
                  >
                    <CheckCircle className="w-4 h-4" />
                    完成处理
                  </button>
                </div>
              )}
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
                  <XAxis
                    dataKey="unit"
                    tick={{ fontSize: 10, fill: '#64748b' }}
                    tickLine={false}
                    axisLine={false}
                  />
                  <YAxis
                    tick={{ fontSize: 10, fill: '#94a3b8' }}
                    tickLine={false}
                    axisLine={false}
                    width={40}
                  />
                  <Tooltip
                    contentStyle={{ borderRadius: 8, border: '1px solid #e2e8f0', fontSize: 12 }}
                  />
                  <Legend iconType="circle" wrapperStyle={{ fontSize: 11 }} />
                  <Bar
                    dataKey="standard"
                    name="标准值"
                    fill="#e2e8f0"
                    radius={[2, 2, 0, 0]}
                  />
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
                  <div
                    key={i}
                    className={cn(
                      'flex items-center justify-between p-2.5 rounded-lg',
                      s.status === 'active'
                        ? 'bg-emerald-50 border border-emerald-200'
                        : 'bg-slate-50/60'
                    )}
                  >
                    <div className="flex items-center gap-2">
                      <div
                        className={cn(
                          'w-6 h-6 rounded-full flex items-center justify-center text-xs font-bold',
                          s.status === 'ok'
                            ? 'bg-emerald-500 text-white'
                            : s.status === 'active'
                              ? 'bg-emerald-500 text-white animate-pulse'
                              : 'bg-slate-300 text-white'
                        )}
                      >
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
                      cx="64"
                      cy="64"
                      r="52"
                      fill="none"
                      stroke="#10b981"
                      strokeWidth="10"
                      strokeLinecap="round"
                      strokeDasharray={`${((selected?.filmThickness || 11.2) / 15) * (2 * Math.PI * 52)} ${2 * Math.PI * 52}`}
                    />
                  </svg>
                  <div className="absolute inset-0 flex flex-col items-center justify-center">
                    <span className="text-3xl font-bold text-emerald-600 tabular-nums">
                      {selected?.filmThickness || 11.2}
                    </span>
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
                  <XAxis
                    type="number"
                    tick={{ fontSize: 10, fill: '#94a3b8' }}
                    tickLine={false}
                    axisLine={false}
                  />
                  <YAxis
                    type="category"
                    dataKey="t"
                    tick={{ fontSize: 11, fill: '#64748b' }}
                    tickLine={false}
                    axisLine={false}
                    width={55}
                  />
                  <Tooltip
                    contentStyle={{ borderRadius: 8, border: '1px solid #e2e8f0', fontSize: 12 }}
                    formatter={(v: number) => [`${v} μm`, '厚度']}
                  />
                  <Bar
                    dataKey="thickness"
                    name="涂层厚度"
                    radius={[0, 6, 6, 0]}
                    fill="#8b5cf6"
                    label={{
                      position: 'right',
                      fontSize: 11,
                      fill: '#8b5cf6',
                      formatter: (v: number) => `${v}μm`,
                    }}
                  />
                </BarChart>
              </ResponsiveContainer>
            </div>
          </div>

          <div className="space-y-4">
            <div className="bg-white rounded-xl p-5 shadow-sm border border-slate-200/60">
              <h4 className="text-sm font-bold text-slate-800 mb-4">涂层颜色配置</h4>
              <div className="space-y-3">
                <div className="flex items-center gap-3 p-3 rounded-lg bg-slate-50/70">
                  <div
                    className="w-10 h-10 rounded-lg shadow-inner"
                    style={{ backgroundColor: '#f5f5f5' }}
                  />
                  <div>
                    <div className="text-sm font-bold text-slate-800">
                      {selected?.color || '哑光白'}
                    </div>
                    <div className="text-xs text-slate-500 font-mono">RAL 9016</div>
                  </div>
                </div>
                <div className="grid grid-cols-3 gap-2">
                  {[
                    '#f5f5f5',
                    '#1e40af',
                    '#047857',
                    '#7c2d12',
                    '#374151',
                    '#6b21a8',
                    '#ea580c',
                    '#991b1b',
                    '#164e63',
                  ].map((c) => (
                    <div
                      key={c}
                      className="aspect-square rounded-lg shadow-inner cursor-pointer hover:ring-2 hover:ring-purple-400 transition-all"
                      style={{ backgroundColor: c }}
                    />
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
                    <XAxis
                      dataKey="p"
                      tick={{ fontSize: 10, fill: '#64748b' }}
                      tickLine={false}
                      axisLine={false}
                    />
                    <YAxis
                      domain={[0, 2]}
                      tick={{ fontSize: 10, fill: '#94a3b8' }}
                      tickLine={false}
                      axisLine={false}
                      width={30}
                    />
                    <Tooltip
                      contentStyle={{ borderRadius: 8, border: '1px solid #e2e8f0', fontSize: 12 }}
                      formatter={(v: number) => [`脱落${v}%`, '等级']}
                    />
                    <Line
                      type="monotone"
                      dataKey="value"
                      name="脱落率"
                      stroke="#f59e0b"
                      strokeWidth={2.5}
                      dot={{ r: 5, fill: '#f59e0b' }}
                    />
                  </LineChart>
                </ResponsiveContainer>
              </div>
              <div className="text-center text-xs mt-2">
                <span className="font-bold text-emerald-600">0级合格</span>
                <span className="text-slate-400 ml-1">
                  平均脱落 {(selected?.adhesion ? (selected.adhesion * 100).toFixed(0) : '0')}%
                </span>
              </div>
            </div>
          </div>
        </div>
      )}

      {showModal && modalData && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 backdrop-blur-sm p-4">
          <div className="bg-white rounded-2xl shadow-2xl w-full max-w-md overflow-hidden animate-in">
            <div
              className={cn(
                'px-6 py-4 border-b flex items-center justify-between',
                modalData.processType === 'oxidation'
                  ? 'bg-gradient-to-r from-emerald-50 to-teal-50 border-emerald-100'
                  : 'bg-gradient-to-r from-purple-50 to-indigo-50 border-purple-100'
              )}
            >
              <h3 className="text-lg font-bold text-slate-800 flex items-center gap-2">
                {modalData.processType === 'oxidation' ? (
                  <Droplets className="w-5 h-5 text-emerald-600" />
                ) : (
                  <Brush className="w-5 h-5 text-purple-600" />
                )}
                新建
                {modalData.processType === 'oxidation' ? '阳极氧化' : '静电喷涂'}
                记录
              </h3>
              <button
                onClick={() => {
                  setShowModal(false);
                  setModalData(null);
                }}
                className="w-8 h-8 rounded-lg hover:bg-white/60 flex items-center justify-center text-slate-500"
              >
                <X className="w-4 h-4" />
              </button>
            </div>
            <div className="p-6 space-y-4">
              <div
                className={cn(
                  'p-4 rounded-xl border',
                  modalData.processType === 'oxidation'
                    ? 'bg-emerald-50/50 border-emerald-200'
                    : 'bg-purple-50/50 border-purple-200'
                )}
              >
                <div className="text-xs text-slate-500 mb-1">批次号</div>
                <div className="flex items-center gap-2">
                  <Tag
                    className={cn(
                      'w-4 h-4',
                      modalData.processType === 'oxidation' ? 'text-emerald-600' : 'text-purple-600'
                    )}
                  />
                  <span className="font-mono font-bold text-slate-800 cursor-pointer hover:underline underline-offset-2 decoration-blue-400" onClick={() => { const a = agingRecords.find(x => x.id === modalData.agingId); if (a) { setTraceBatchId(a.batchId); setShowTrace(true); } }}>{modalData.batchNumber}</span>
                </div>
              </div>

              <div>
                <label className="text-xs font-semibold text-slate-600 block mb-1.5 flex items-center gap-1.5">
                  <User className="w-3.5 h-3.5" />
                  操作人员 <span className="text-amber-500">*</span>
                </label>
                <input
                  type="text"
                  value={operator}
                  onChange={(e) => setOperator(e.target.value)}
                  placeholder="请输入操作人员姓名"
                  className={cn(
                    'w-full px-3 py-2.5 border rounded-lg text-sm font-medium focus:ring-2 focus:ring-2/30',
                    modalData.processType === 'oxidation'
                      ? 'border-slate-200 focus:ring-emerald-500 focus:border-emerald-400'
                      : 'border-slate-200 focus:ring-purple-500 focus:border-purple-400'
                  )}
                />
              </div>

              <div
                className={cn(
                  'p-3 rounded-lg text-xs flex items-center gap-2',
                  modalData.processType === 'oxidation'
                    ? 'bg-emerald-50 text-emerald-700'
                    : 'bg-purple-50 text-purple-700'
                )}
              >
                <ArrowRight className="w-3.5 h-3.5 flex-shrink-0" />
                <span>
                  创建后将自动进入「处理中」状态，处理完成后可录入检测参数并标记完成。
                </span>
              </div>
            </div>
            <div className="px-6 py-4 border-t border-slate-100 flex items-center justify-end gap-3 bg-slate-50/50">
              <button
                onClick={() => {
                  setShowModal(false);
                  setModalData(null);
                }}
                className="px-5 py-2.5 text-sm font-semibold text-slate-600 bg-white border border-slate-200 rounded-lg hover:bg-slate-50"
              >
                取消
              </button>
              <button
                onClick={handleConfirmCreate}
                disabled={!operator.trim()}
                className={cn(
                  'px-6 py-2.5 text-sm font-bold text-white rounded-lg shadow-md flex items-center gap-2 transition-all',
                  modalData.processType === 'oxidation'
                    ? 'bg-gradient-to-r from-emerald-600 to-teal-600 hover:from-emerald-700 hover:to-teal-700 shadow-emerald-500/25 disabled:from-emerald-300 disabled:to-teal-300'
                    : 'bg-gradient-to-r from-purple-600 to-indigo-600 hover:from-purple-700 hover:to-indigo-700 shadow-purple-500/25 disabled:from-purple-300 disabled:to-indigo-300'
                )}
              >
                <CheckCircle className="w-4 h-4" />
                确认创建
              </button>
            </div>
          </div>
        </div>
      )}

      {showCompleteModal && completeId && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 backdrop-blur-sm p-4">
          <div className="bg-white rounded-2xl shadow-2xl w-full max-w-md overflow-hidden animate-in">
            <div
              className={cn(
                'px-6 py-4 border-b flex items-center justify-between',
                processTab === 'oxidation'
                  ? 'bg-gradient-to-r from-emerald-50 to-teal-50 border-emerald-100'
                  : 'bg-gradient-to-r from-purple-50 to-indigo-50 border-purple-100'
              )}
            >
              <h3 className="text-lg font-bold text-slate-800 flex items-center gap-2">
                <CheckCircle className={cn('w-5 h-5', processTab === 'oxidation' ? 'text-emerald-600' : 'text-purple-600')} />
                完成表面处理
              </h3>
              <button
                onClick={() => {
                  setShowCompleteModal(false);
                  setCompleteId(null);
                }}
                className="w-8 h-8 rounded-lg hover:bg-white/60 flex items-center justify-center text-slate-500"
              >
                <X className="w-4 h-4" />
              </button>
            </div>
            <div className="p-6 space-y-4">
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="text-xs font-semibold text-slate-600 block mb-1.5">
                    膜厚 (μm)
                  </label>
                  <input
                    type="number"
                    step="0.1"
                    value={completeForm.filmThickness}
                    onChange={(e) =>
                      setCompleteForm({ ...completeForm, filmThickness: parseFloat(e.target.value) || 0 })
                    }
                    className={cn(
                      'w-full px-3 py-2.5 border rounded-lg text-sm font-mono tabular-nums focus:ring-2',
                      processTab === 'oxidation'
                        ? 'border-slate-200 focus:ring-emerald-500/30 focus:border-emerald-400'
                        : 'border-slate-200 focus:ring-purple-500/30 focus:border-purple-400'
                    )}
                  />
                </div>
                <div>
                  <label className="text-xs font-semibold text-slate-600 block mb-1.5">
                    附着力 (0-1)
                  </label>
                  <input
                    type="number"
                    step="0.1"
                    min="0"
                    max="1"
                    value={completeForm.adhesion}
                    onChange={(e) =>
                      setCompleteForm({ ...completeForm, adhesion: parseFloat(e.target.value) || 0 })
                    }
                    className={cn(
                      'w-full px-3 py-2.5 border rounded-lg text-sm font-mono tabular-nums focus:ring-2',
                      processTab === 'oxidation'
                        ? 'border-slate-200 focus:ring-emerald-500/30 focus:border-emerald-400'
                        : 'border-slate-200 focus:ring-purple-500/30 focus:border-purple-400'
                    )}
                  />
                </div>
              </div>

              <div>
                <label className="text-xs font-semibold text-slate-600 block mb-1.5">
                  颜色
                </label>
                <input
                  type="text"
                  value={completeForm.color}
                  onChange={(e) => setCompleteForm({ ...completeForm, color: e.target.value })}
                  className={cn(
                    'w-full px-3 py-2.5 border rounded-lg text-sm font-medium focus:ring-2',
                    processTab === 'oxidation'
                      ? 'border-slate-200 focus:ring-emerald-500/30 focus:border-emerald-400'
                      : 'border-slate-200 focus:ring-purple-500/30 focus:border-purple-400'
                  )}
                />
              </div>

              <div
                className={cn(
                  'p-3 rounded-lg text-xs flex items-start gap-2',
                  processTab === 'oxidation'
                    ? 'bg-emerald-50 text-emerald-700'
                    : 'bg-purple-50 text-purple-700'
                )}
              >
                <CheckCircle className="w-3.5 h-3.5 flex-shrink-0 mt-0.5" />
                <span>完成后该批次将出现在「定尺包装」模块中可供选择。</span>
              </div>
            </div>
            <div className="px-6 py-4 border-t border-slate-100 flex items-center justify-end gap-3 bg-slate-50/50">
              <button
                onClick={() => {
                  setShowCompleteModal(false);
                  setCompleteId(null);
                }}
                className="px-5 py-2.5 text-sm font-semibold text-slate-600 bg-white border border-slate-200 rounded-lg hover:bg-slate-50"
              >
                取消
              </button>
              <button
                onClick={handleConfirmComplete}
                className={cn(
                  'px-6 py-2.5 text-sm font-bold text-white rounded-lg shadow-md flex items-center gap-2 transition-all',
                  processTab === 'oxidation'
                    ? 'bg-gradient-to-r from-emerald-600 to-teal-600 hover:from-emerald-700 hover:to-teal-700 shadow-emerald-500/25'
                    : 'bg-gradient-to-r from-purple-600 to-indigo-600 hover:from-purple-700 hover:to-indigo-700 shadow-purple-500/25'
                )}
              >
                <CheckCircle className="w-4 h-4" />
                确认完成
              </button>
            </div>
          </div>
        </div>
      )}

      {showTrace && traceBatchId && (
        <BatchTraceModal batchId={traceBatchId} onClose={() => { setShowTrace(false); setTraceBatchId(null); }} />
      )}
    </div>
  );
}
