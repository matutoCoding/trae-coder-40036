import { useState, useEffect } from 'react';
import { useProductionStore } from '@/store/productionStore';
import { Package, Scissors, CheckCircle, Search, Filter, Plus, User, FileText, Barcode, Truck, ArrowUpDown, Award, List, ChevronDown, ChevronUp, X } from 'lucide-react';
import { PieChart, Pie, Cell, ResponsiveContainer, BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, Legend } from 'recharts';
import { cn } from '@/lib/utils';

const gradeColor: Record<string, { bg: string; text: string; label: string }> = {
  A: { bg: 'bg-emerald-500', text: 'text-emerald-600', label: '优等品' },
  B: { bg: 'bg-blue-500', text: 'text-blue-600', label: '一等品' },
  C: { bg: 'bg-amber-500', text: 'text-amber-600', label: '合格品' },
};

export default function Packaging() {
  const packages = useProductionStore((s) => s.packageRecords);
  const batches = useProductionStore((s) => s.extrusionBatches);
  const surfaceRecords = useProductionStore((s) => s.surfaceRecords);
  const addPackageRecord = useProductionStore((s) => s.addPackageRecord);
  const fillLegacySourceData = useProductionStore((s) => s.fillLegacySourceData);
  const [search, setSearch] = useState('');
  const [gradeFilter, setGradeFilter] = useState<string>('all');
  const [showAddModal, setShowAddModal] = useState(false);
  const [viewMode, setViewMode] = useState<'list' | 'order'>('list');
  const [expandedOrders, setExpandedOrders] = useState<Set<string>>(new Set());
  const [showStatementModal, setShowStatementModal] = useState(false);
  const [statementOrder, setStatementOrder] = useState<typeof orderSummaries[0] | null>(null);

  const [form, setForm] = useState({
    surfaceRecordId: '',
    cutLength: 6000,
    pieceCount: 100,
    grade: 'A' as 'A' | 'B' | 'C',
    frameNo: 'ZK-003',
    customer: '华东建筑集团',
    orderNo: 'DD20260615-009',
    operator: '孙师傅',
  });

  const completedSurfaces = surfaceRecords.filter((s) => s.status === 'completed');

  const totalPieces = packages.reduce((s, p) => s + p.pieceCount, 0);
  const totalWeight = packages.reduce((s, p) => s + p.totalWeight, 0);

  const gradeStats = [
    { name: 'A级优等品', value: packages.filter(p => p.grade === 'A').length, color: '#10b981' },
    { name: 'B级一等品', value: packages.filter(p => p.grade === 'B').length, color: '#3b82f6' },
    { name: 'C级合格品', value: packages.filter(p => p.grade === 'C').length, color: '#f59e0b' },
  ];

  const dailyData = [
    { d: '周一', A: 8, B: 4, C: 1 },
    { d: '周二', A: 10, B: 3, C: 2 },
    { d: '周三', A: 6, B: 5, C: 1 },
    { d: '周四', A: 12, B: 2, C: 0 },
    { d: '周五', A: 9, B: 4, C: 1 },
    { d: '周六', A: 7, B: 3, C: 2 },
    { d: '今日', A: 2, B: 0, C: 0 },
  ];

  const filtered = packages.filter((p) => {
    const matchSearch = 
      p.frameNo.toLowerCase().includes(search.toLowerCase()) || 
      p.batchNumber.toLowerCase().includes(search.toLowerCase()) ||
      p.orderNo.toLowerCase().includes(search.toLowerCase()) ||
      p.customer.toLowerCase().includes(search.toLowerCase());
    const matchGrade = gradeFilter === 'all' || p.grade === gradeFilter;
    return matchSearch && matchGrade;
  });

  const orderGroups = filtered.reduce((acc, p) => {
    if (!acc[p.orderNo]) {
      acc[p.orderNo] = {
        orderNo: p.orderNo,
        customer: p.customer,
        records: [],
      };
    }
    acc[p.orderNo].records.push(p);
    return acc;
  }, {} as Record<string, { orderNo: string; customer: string; records: typeof packages }>);

  const orderSummaries = Object.values(orderGroups).map((group) => ({
    ...group,
    frameCount: group.records.length,
    totalPieces: group.records.reduce((s, r) => s + r.pieceCount, 0),
    totalWeight: group.records.reduce((s, r) => s + r.totalWeight, 0),
  }));

  const toggleOrder = (orderNo: string) => {
    const next = new Set(expandedOrders);
    if (next.has(orderNo)) {
      next.delete(orderNo);
    } else {
      next.add(orderNo);
    }
    setExpandedOrders(next);
  };

  useEffect(() => {
    fillLegacySourceData();
  }, []);

  const getSurfaceLabel = (p: typeof packages[0]) => {
    if (!p.surfaceRecordId && !p.surfaceProcessType) {
      return { text: '未关联', className: 'bg-slate-200 text-slate-500' };
    }
    if (p.surfaceProcessType === 'oxidation') {
      return { text: '氧化', className: 'bg-blue-100 text-blue-700' };
    }
    return { text: '喷涂', className: 'bg-amber-100 text-amber-700' };
  };

  const getProfileType = (p: typeof packages[0]) => {
    const batch = batches.find((b) => b.id === p.batchId);
    return batch?.profileType || '未关联';
  };

  const computeSummaries = (records: typeof packages) => {
    const surfaceMap: Record<string, { weight: number; pieces: number }> = {};
    const colorMap: Record<string, { weight: number; pieces: number }> = {};
    const profileMap: Record<string, { weight: number; pieces: number }> = {};

    records.forEach((p) => {
      const surfaceKey = p.surfaceProcessType === 'oxidation' ? '阳极氧化' : p.surfaceProcessType === 'spraying' ? '静电喷涂' : '未关联';
      const colorKey = p.surfaceColor || '未关联';
      const profileKey = getProfileType(p);

      if (!surfaceMap[surfaceKey]) surfaceMap[surfaceKey] = { weight: 0, pieces: 0 };
      surfaceMap[surfaceKey].weight += p.totalWeight;
      surfaceMap[surfaceKey].pieces += p.pieceCount;

      if (!colorMap[colorKey]) colorMap[colorKey] = { weight: 0, pieces: 0 };
      colorMap[colorKey].weight += p.totalWeight;
      colorMap[colorKey].pieces += p.pieceCount;

      if (!profileMap[profileKey]) profileMap[profileKey] = { weight: 0, pieces: 0 };
      profileMap[profileKey].weight += p.totalWeight;
      profileMap[profileKey].pieces += p.pieceCount;
    });

    return {
      surface: Object.entries(surfaceMap).map(([name, v]) => ({ name, ...v })),
      color: Object.entries(colorMap).map(([name, v]) => ({ name, ...v })),
      profile: Object.entries(profileMap).map(([name, v]) => ({ name, ...v })),
    };
  };

  const openStatement = (order: typeof orderSummaries[0]) => {
    setStatementOrder(order);
    setShowStatementModal(true);
  };

  return (
    <div className="space-y-6">
      <div className="grid grid-cols-1 md:grid-cols-5 gap-4">
        {[
          { label: '今日装框', value: packages.length, icon: Package, color: 'indigo', unit: '框' },
          { label: '锯切支数', value: totalPieces, icon: Scissors, color: 'blue', unit: '支' },
          { label: '总重量', value: `${(totalWeight / 1000).toFixed(2)}`, icon: ArrowUpDown, color: 'purple', unit: '吨' },
          { label: '入库率', value: '92.5', icon: CheckCircle, color: 'emerald', unit: '%' },
          { label: '待包装', value: 3, icon: FileText, color: 'amber', unit: '批' },
        ].map((s) => (
          <div key={s.label} className="bg-white rounded-xl p-5 shadow-sm border border-slate-200/60 relative overflow-hidden">
            <div className={`absolute top-0 right-0 w-24 h-24 bg-${s.color}-50 rounded-full -mr-8 -mt-8 opacity-50`} />
            <div className="flex items-start justify-between relative">
              <div>
                <p className="text-sm text-slate-500 font-medium">{s.label}</p>
                <div className="flex items-baseline gap-1 mt-1">
                  <p className={`text-3xl font-bold tabular-nums text-${s.color}-600`}>{s.value}</p>
                  <span className="text-xs text-slate-500 font-medium">{s.unit}</span>
                </div>
              </div>
              <div className={`w-11 h-11 rounded-xl bg-${s.color}-500/10 flex items-center justify-center`}>
                <s.icon className={`w-5 h-5 text-${s.color}-500`} />
              </div>
            </div>
          </div>
        ))}
      </div>

      <div className="flex items-center justify-between flex-wrap gap-4">
        <div className="flex items-center gap-2 bg-white rounded-lg p-1 shadow-sm border border-slate-200/60">
          {[
            { key: 'all', label: '全部' },
            { key: 'A', label: 'A级' },
            { key: 'B', label: 'B级' },
            { key: 'C', label: 'C级' },
          ].map((f) => (
            <button
              key={f.key}
              onClick={() => setGradeFilter(f.key)}
              className={cn(
                'px-4 py-2 rounded-md text-sm font-semibold transition-all',
                gradeFilter === f.key ? 'bg-indigo-600 text-white shadow-sm' : 'text-slate-600 hover:bg-slate-100'
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
              placeholder="框号/批次/订单/客户..."
              className="pl-9 pr-3 py-2 text-sm bg-white border border-slate-200 rounded-lg w-56 focus:ring-2 focus:ring-indigo-500/30"
            />
          </div>
          <div className="flex items-center bg-white rounded-lg p-0.5 shadow-sm border border-slate-200/60">
            <button
              onClick={() => setViewMode('list')}
              className={cn(
                'flex items-center gap-1.5 px-3 py-1.5 rounded-md text-sm font-semibold transition-all',
                viewMode === 'list' ? 'bg-indigo-600 text-white shadow-sm' : 'text-slate-600 hover:bg-slate-100'
              )}
            >
              <List className="w-4 h-4" />
              列表视图
            </button>
            <button
              onClick={() => setViewMode('order')}
              className={cn(
                'flex items-center gap-1.5 px-3 py-1.5 rounded-md text-sm font-semibold transition-all',
                viewMode === 'order' ? 'bg-indigo-600 text-white shadow-sm' : 'text-slate-600 hover:bg-slate-100'
              )}
            >
              <FileText className="w-4 h-4" />
              订单视图
            </button>
          </div>
          <button className="flex items-center gap-1.5 px-3 py-2 text-sm bg-white border border-slate-200 rounded-lg text-slate-600 hover:bg-slate-50">
            <Filter className="w-4 h-4" />
            高级筛选
          </button>
          <button
            onClick={() => setShowAddModal(true)}
            className="flex items-center gap-1.5 px-4 py-2 text-sm bg-indigo-600 text-white rounded-lg hover:bg-indigo-700 shadow-sm"
          >
            <Plus className="w-4 h-4" />
            录入装框
          </button>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {viewMode === 'list' ? (
          <div className="bg-white rounded-xl p-5 shadow-sm border border-slate-200/60 lg:col-span-2 overflow-hidden">
            <div className="flex items-center justify-between mb-4">
              <h3 className="text-base font-bold text-slate-800 flex items-center gap-2">
                <span className="w-1 h-5 bg-indigo-500 rounded-full" />
                成品装框记录
              </h3>
              <span className="text-xs text-slate-500">共 {filtered.length} 条</span>
            </div>
            <div className="overflow-x-auto">
              <table className="w-full text-sm">
                <thead className="bg-slate-50/60">
                  <tr>
                    <th className="text-left px-4 py-3 font-semibold text-slate-600 text-xs uppercase tracking-wider">框号</th>
                    <th className="text-left px-4 py-3 font-semibold text-slate-600 text-xs uppercase tracking-wider">批次号</th>
                    <th className="text-left px-4 py-3 font-semibold text-slate-600 text-xs uppercase tracking-wider">定尺</th>
                    <th className="text-left px-4 py-3 font-semibold text-slate-600 text-xs uppercase tracking-wider">支数</th>
                    <th className="text-left px-4 py-3 font-semibold text-slate-600 text-xs uppercase tracking-wider">重量</th>
                    <th className="text-left px-4 py-3 font-semibold text-slate-600 text-xs uppercase tracking-wider">等级</th>
                    <th className="text-left px-4 py-3 font-semibold text-slate-600 text-xs uppercase tracking-wider">客户/订单</th>
                    <th className="text-left px-4 py-3 font-semibold text-slate-600 text-xs uppercase tracking-wider">入库时间</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-100">
                  {filtered.map((p) => {
                    const g = gradeColor[p.grade];
                    const batch = batches.find(b => b.id === p.batchId);
                    return (
                      <tr key={p.id} className="hover:bg-indigo-50/30 transition-colors">
                        <td className="px-4 py-3">
                          <div className="flex items-center gap-2">
                            <div className="w-8 h-8 rounded-lg bg-indigo-100 flex items-center justify-center">
                              <Barcode className="w-4 h-4 text-indigo-600" />
                            </div>
                            <span className="font-mono font-bold text-slate-800">{p.frameNo}</span>
                          </div>
                        </td>
                        <td className="px-4 py-3">
                          <span className="font-mono text-xs text-slate-600">{p.batchNumber}</span>
                          <div className="text-[10px] text-slate-400">{batch?.profileType}</div>
                          {p.surfaceProcessType && (
                            <div className="text-[10px] text-indigo-500 mt-0.5 font-medium">
                              {p.surfaceProcessType === 'oxidation' ? '阳极氧化' : '静电喷涂'}
                              {p.surfaceColor && ` · ${p.surfaceColor}`}
                            </div>
                          )}
                        </td>
                        <td className="px-4 py-3">
                          <span className="font-semibold tabular-nums text-slate-700">{(p.cutLength / 1000).toFixed(1)}m</span>
                        </td>
                        <td className="px-4 py-3">
                          <span className="font-bold tabular-nums text-slate-800">{p.pieceCount}</span>
                          <span className="text-xs text-slate-400 ml-1">支</span>
                        </td>
                        <td className="px-4 py-3">
                          <span className="font-bold tabular-nums text-slate-800">{p.totalWeight}</span>
                          <span className="text-xs text-slate-400 ml-1">kg</span>
                        </td>
                        <td className="px-4 py-3">
                          <span className={cn(
                            'inline-flex items-center gap-1 px-2.5 py-1 rounded-md text-xs font-bold text-white',
                            g.bg
                          )}>
                            <Award className="w-3 h-3" />
                            {p.grade}级 · {g.label}
                          </span>
                        </td>
                        <td className="px-4 py-3">
                          <div className="text-xs text-slate-700 font-semibold">{p.customer}</div>
                          <div className="text-[10px] text-slate-400 font-mono">{p.orderNo}</div>
                        </td>
                        <td className="px-4 py-3">
                          <span className="text-xs text-slate-500 font-mono">{p.warehouseTime}</span>
                          <div className="text-[10px] text-slate-400 flex items-center gap-1 mt-0.5">
                            <User className="w-3 h-3" />
                            {p.operator}
                          </div>
                        </td>
                      </tr>
                    );
                  })}
                </tbody>
              </table>
            </div>
          </div>
        ) : (
          <div className="bg-white rounded-xl p-5 shadow-sm border border-slate-200/60 lg:col-span-2 overflow-hidden">
            <div className="flex items-center justify-between mb-4">
              <h3 className="text-base font-bold text-slate-800 flex items-center gap-2">
                <span className="w-1 h-5 bg-emerald-500 rounded-full" />
                订单汇总视图
              </h3>
              <span className="text-xs text-slate-500">共 {orderSummaries.length} 个订单</span>
            </div>
            <div className="space-y-3">
              {orderSummaries.map((order) => {
                const isExpanded = expandedOrders.has(order.orderNo);
                return (
                  <div key={order.orderNo} className="border border-slate-200 rounded-xl overflow-hidden">
                    <button
                      onClick={() => toggleOrder(order.orderNo)}
                      className="w-full p-4 flex items-center justify-between bg-gradient-to-r from-slate-50 to-white hover:from-indigo-50/50 hover:to-indigo-50/30 transition-all text-left"
                    >
                      <div className="flex items-center gap-4">
                        <div className="w-12 h-12 rounded-xl bg-emerald-100 flex items-center justify-center">
                          <FileText className="w-6 h-6 text-emerald-600" />
                        </div>
                        <div>
                          <div className="flex items-center gap-2">
                            <span className="font-mono font-bold text-slate-800 text-sm">{order.orderNo}</span>
                            <span className="px-2 py-0.5 rounded bg-emerald-100 text-emerald-700 text-[10px] font-bold">
                              {order.customer}
                            </span>
                          </div>
                          <div className="flex items-center gap-4 mt-1.5">
                            <div className="flex items-center gap-1 text-xs text-slate-500">
                              <Package className="w-3.5 h-3.5 text-indigo-500" />
                              <span className="font-bold tabular-nums text-slate-700">{order.frameCount}</span>
                              <span>框</span>
                            </div>
                            <div className="flex items-center gap-1 text-xs text-slate-500">
                              <Scissors className="w-3.5 h-3.5 text-blue-500" />
                              <span className="font-bold tabular-nums text-slate-700">{order.totalPieces}</span>
                              <span>支</span>
                            </div>
                            <div className="flex items-center gap-1 text-xs text-slate-500">
                              <ArrowUpDown className="w-3.5 h-3.5 text-purple-500" />
                              <span className="font-bold tabular-nums text-slate-700">{(order.totalWeight / 1000).toFixed(2)}</span>
                              <span>吨</span>
                            </div>
                          </div>
                        </div>
                      </div>
                      <div className="flex items-center gap-2">
                        <span className="text-xs text-slate-400">{isExpanded ? '收起' : '展开详情'}</span>
                        {isExpanded ? (
                          <ChevronUp className="w-5 h-5 text-slate-400" />
                        ) : (
                          <ChevronDown className="w-5 h-5 text-slate-400" />
                        )}
                      </div>
                    </button>
                    {isExpanded && (
                      <div className="border-t border-slate-200 bg-slate-50/40">
                        {(() => {
                          const summaries = computeSummaries(order.records);
                          return (
                            <>
                              <div className="p-4 space-y-3">
                                <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
                                  <div className="bg-white rounded-lg p-3 border border-slate-200 shadow-sm">
                                    <div className="text-xs font-bold text-slate-600 mb-2 flex items-center gap-1">
                                      <span className="w-1 h-3 bg-blue-500 rounded" />
                                      按表面工艺汇总
                                    </div>
                                    <div className="space-y-1.5">
                                      {summaries.surface.map((s) => (
                                        <div key={s.name} className="flex items-center justify-between text-[11px]">
                                          <span className={cn(
                                            'px-1.5 py-0.5 rounded font-medium',
                                            s.name === '阳极氧化' ? 'bg-blue-50 text-blue-700' :
                                            s.name === '静电喷涂' ? 'bg-amber-50 text-amber-700' :
                                            'bg-slate-100 text-slate-500'
                                          )}>{s.name}</span>
                                          <span className="text-slate-600 tabular-nums">
                                            <span className="font-bold text-slate-800">{s.pieces}</span>支 · 
                                            <span className="font-bold text-slate-800 ml-1">{s.weight}</span>kg
                                          </span>
                                        </div>
                                      ))}
                                    </div>
                                  </div>
                                  <div className="bg-white rounded-lg p-3 border border-slate-200 shadow-sm">
                                    <div className="text-xs font-bold text-slate-600 mb-2 flex items-center gap-1">
                                      <span className="w-1 h-3 bg-purple-500 rounded" />
                                      按颜色汇总
                                    </div>
                                    <div className="space-y-1.5 max-h-24 overflow-y-auto">
                                      {summaries.color.map((c) => (
                                        <div key={c.name} className="flex items-center justify-between text-[11px]">
                                          <span className="px-1.5 py-0.5 rounded bg-purple-50 text-purple-700 font-medium">{c.name}</span>
                                          <span className="text-slate-600 tabular-nums">
                                            <span className="font-bold text-slate-800">{c.pieces}</span>支 · 
                                            <span className="font-bold text-slate-800 ml-1">{c.weight}</span>kg
                                          </span>
                                        </div>
                                      ))}
                                    </div>
                                  </div>
                                  <div className="bg-white rounded-lg p-3 border border-slate-200 shadow-sm">
                                    <div className="text-xs font-bold text-slate-600 mb-2 flex items-center gap-1">
                                      <span className="w-1 h-3 bg-emerald-500 rounded" />
                                      按型材类型汇总
                                    </div>
                                    <div className="space-y-1.5 max-h-24 overflow-y-auto">
                                      {summaries.profile.map((pr) => (
                                        <div key={pr.name} className="flex items-center justify-between text-[11px]">
                                          <span className="px-1.5 py-0.5 rounded bg-emerald-50 text-emerald-700 font-medium">{pr.name}</span>
                                          <span className="text-slate-600 tabular-nums">
                                            <span className="font-bold text-slate-800">{pr.pieces}</span>支 · 
                                            <span className="font-bold text-slate-800 ml-1">{pr.weight}</span>kg
                                          </span>
                                        </div>
                                      ))}
                                    </div>
                                  </div>
                                </div>
                                <div className="flex justify-end">
                                  <button
                                    onClick={() => openStatement(order)}
                                    className="flex items-center gap-1.5 px-4 py-2 text-sm bg-blue-600 text-white rounded-lg hover:bg-blue-700 shadow-sm transition-colors"
                                  >
                                    <FileText className="w-4 h-4" />
                                    生成客户对账单
                                  </button>
                                </div>
                              </div>
                              <div className="overflow-x-auto border-t border-slate-200">
                                <table className="w-full text-sm">
                                  <thead className="bg-slate-100/60">
                                    <tr>
                                      <th className="text-left px-4 py-2.5 font-semibold text-slate-600 text-[11px] uppercase tracking-wider">框号</th>
                                      <th className="text-left px-4 py-2.5 font-semibold text-slate-600 text-[11px] uppercase tracking-wider">批次号</th>
                                      <th className="text-left px-4 py-2.5 font-semibold text-slate-600 text-[11px] uppercase tracking-wider">表面工艺</th>
                                      <th className="text-left px-4 py-2.5 font-semibold text-slate-600 text-[11px] uppercase tracking-wider">颜色</th>
                                      <th className="text-left px-4 py-2.5 font-semibold text-slate-600 text-[11px] uppercase tracking-wider">支数</th>
                                      <th className="text-left px-4 py-2.5 font-semibold text-slate-600 text-[11px] uppercase tracking-wider">重量</th>
                                      <th className="text-left px-4 py-2.5 font-semibold text-slate-600 text-[11px] uppercase tracking-wider">等级</th>
                                    </tr>
                                  </thead>
                                  <tbody className="divide-y divide-slate-200/60">
                                    {order.records.map((p) => {
                                      const g = gradeColor[p.grade];
                                      const sl = getSurfaceLabel(p);
                                      return (
                                        <tr key={p.id} className="hover:bg-white transition-colors">
                                          <td className="px-4 py-2.5">
                                            <div className="flex items-center gap-2">
                                              <div className="w-7 h-7 rounded-md bg-indigo-100 flex items-center justify-center">
                                                <Barcode className="w-3.5 h-3.5 text-indigo-600" />
                                              </div>
                                              <span className="font-mono font-bold text-slate-800 text-xs">{p.frameNo}</span>
                                            </div>
                                          </td>
                                          <td className="px-4 py-2.5">
                                            <span className="font-mono text-[11px] text-slate-600">{p.batchNumber}</span>
                                          </td>
                                          <td className="px-4 py-2.5">
                                            <span className={cn(
                                              'inline-flex items-center px-2 py-0.5 rounded text-[10px] font-bold',
                                              sl.className
                                            )}>
                                              {sl.text}
                                            </span>
                                          </td>
                                          <td className="px-4 py-2.5">
                                            <span className="text-xs text-slate-700">{p.surfaceColor || '-'}</span>
                                          </td>
                                          <td className="px-4 py-2.5">
                                            <span className="font-bold tabular-nums text-slate-800 text-xs">{p.pieceCount}</span>
                                            <span className="text-[10px] text-slate-400 ml-1">支</span>
                                          </td>
                                          <td className="px-4 py-2.5">
                                            <span className="font-bold tabular-nums text-slate-800 text-xs">{p.totalWeight}</span>
                                            <span className="text-[10px] text-slate-400 ml-1">kg</span>
                                          </td>
                                          <td className="px-4 py-2.5">
                                            <span className={cn(
                                              'inline-flex items-center gap-1 px-2 py-0.5 rounded text-[10px] font-bold text-white',
                                              g.bg
                                            )}>
                                              <Award className="w-3 h-3" />
                                              {p.grade}级
                                            </span>
                                          </td>
                                        </tr>
                                      );
                                    })}
                                  </tbody>
                                </table>
                              </div>
                            </>
                          );
                        })()}
                      </div>
                    )}
                  </div>
                );
              })}
              {orderSummaries.length === 0 && (
                <div className="text-center py-12 text-slate-400">
                  <FileText className="w-12 h-12 mx-auto mb-3 opacity-40" />
                  <p className="text-sm">暂无订单数据</p>
                </div>
              )}
            </div>
          </div>
        )}

        <div className="space-y-4">
          <div className="bg-white rounded-xl p-5 shadow-sm border border-slate-200/60">
            <h4 className="text-sm font-bold text-slate-800 mb-4">等级分布</h4>
            <div className="h-48">
              <ResponsiveContainer width="100%" height="100%">
                <PieChart>
                  <Pie
                    data={gradeStats}
                    cx="50%"
                    cy="50%"
                    innerRadius={45}
                    outerRadius={70}
                    dataKey="value"
                    paddingAngle={3}
                  >
                    {gradeStats.map((entry, idx) => (
                      <Cell key={idx} fill={entry.color} />
                    ))}
                  </Pie>
                  <Tooltip contentStyle={{ borderRadius: 8, border: '1px solid #e2e8f0', fontSize: 12 }} />
                </PieChart>
              </ResponsiveContainer>
            </div>
            <div className="space-y-1.5 mt-2">
              {gradeStats.map((g) => (
                <div key={g.name} className="flex items-center justify-between text-xs">
                  <div className="flex items-center gap-1.5">
                    <div className="w-3 h-3 rounded" style={{ backgroundColor: g.color }} />
                    <span className="text-slate-600">{g.name}</span>
                  </div>
                  <span className="font-bold tabular-nums text-slate-700">{g.value} 框</span>
                </div>
              ))}
            </div>
          </div>

          <div className="bg-white rounded-xl p-5 shadow-sm border border-slate-200/60">
            <h4 className="text-sm font-bold text-slate-800 mb-4 flex items-center gap-2">
              <Truck className="w-4 h-4 text-blue-500" />
              本周入库趋势
            </h4>
            <div className="h-40">
              <ResponsiveContainer width="100%" height="100%">
                <BarChart data={dailyData} barGap={2}>
                  <CartesianGrid strokeDasharray="3 3" stroke="#f1f5f9" vertical={false} />
                  <XAxis dataKey="d" tick={{ fontSize: 10, fill: '#64748b' }} tickLine={false} axisLine={false} />
                  <YAxis tick={{ fontSize: 10, fill: '#94a3b8' }} tickLine={false} axisLine={false} width={25} />
                  <Tooltip contentStyle={{ borderRadius: 8, border: '1px solid #e2e8f0', fontSize: 12 }} />
                  <Legend iconType="circle" wrapperStyle={{ fontSize: 10 }} />
                  <Bar dataKey="A" name="A级" stackId="a" fill="#10b981" radius={[0, 0, 0, 0]} />
                  <Bar dataKey="B" name="B级" stackId="a" fill="#3b82f6" />
                  <Bar dataKey="C" name="C级" stackId="a" fill="#f59e0b" radius={[3, 3, 0, 0]} />
                </BarChart>
              </ResponsiveContainer>
            </div>
          </div>
        </div>
      </div>

      {showStatementModal && statementOrder && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 backdrop-blur-sm p-4">
          <div className="bg-white rounded-2xl shadow-2xl w-full max-w-4xl max-h-[90vh] overflow-hidden animate-in flex flex-col">
            <div className="px-6 py-4 border-b border-slate-100 flex items-center justify-between bg-gradient-to-r from-blue-50 to-indigo-50 shrink-0">
              <h3 className="text-lg font-bold text-slate-800 flex items-center gap-2">
                <FileText className="w-5 h-5 text-blue-600" />
                客户对账单预览
              </h3>
              <button
                onClick={() => setShowStatementModal(false)}
                className="w-8 h-8 rounded-lg hover:bg-slate-100 flex items-center justify-center text-slate-500"
              >
                <X className="w-4 h-4" />
              </button>
            </div>
            <div className="px-6 py-4 overflow-y-auto flex-1 space-y-5">
              <div className="text-center border-b border-slate-200 pb-4">
                <h2 className="text-xl font-bold text-slate-800 mb-2">
                  {statementOrder.customer} - 对账单
                </h2>
                <p className="text-sm text-slate-500 font-mono">订单号：{statementOrder.orderNo}</p>
                <div className="flex items-center justify-center gap-6 mt-3 text-xs text-slate-600">
                  <span>生成日期：<span className="font-medium text-slate-700">{new Date().toISOString().split('T')[0]}</span></span>
                  <span>对账人：<span className="font-medium text-slate-700">财务部</span></span>
                </div>
              </div>

              {(() => {
                const summaries = computeSummaries(statementOrder.records);
                return (
                  <>
                    <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                      <div className="border border-slate-200 rounded-lg overflow-hidden">
                        <div className="bg-blue-50 px-3 py-2 border-b border-slate-200">
                          <span className="text-xs font-bold text-blue-700">按表面工艺汇总</span>
                        </div>
                        <table className="w-full text-xs">
                          <thead className="bg-slate-50">
                            <tr>
                              <th className="text-left px-3 py-1.5 font-semibold text-slate-600">工艺</th>
                              <th className="text-right px-3 py-1.5 font-semibold text-slate-600">支数</th>
                              <th className="text-right px-3 py-1.5 font-semibold text-slate-600">重量(kg)</th>
                            </tr>
                          </thead>
                          <tbody className="divide-y divide-slate-100">
                            {summaries.surface.map((s) => (
                              <tr key={s.name}>
                                <td className="px-3 py-1.5 text-slate-700">{s.name}</td>
                                <td className="px-3 py-1.5 text-right tabular-nums font-medium text-slate-800">{s.pieces}</td>
                                <td className="px-3 py-1.5 text-right tabular-nums font-medium text-slate-800">{s.weight}</td>
                              </tr>
                            ))}
                          </tbody>
                        </table>
                      </div>
                      <div className="border border-slate-200 rounded-lg overflow-hidden">
                        <div className="bg-purple-50 px-3 py-2 border-b border-slate-200">
                          <span className="text-xs font-bold text-purple-700">按颜色汇总</span>
                        </div>
                        <table className="w-full text-xs">
                          <thead className="bg-slate-50">
                            <tr>
                              <th className="text-left px-3 py-1.5 font-semibold text-slate-600">颜色</th>
                              <th className="text-right px-3 py-1.5 font-semibold text-slate-600">支数</th>
                              <th className="text-right px-3 py-1.5 font-semibold text-slate-600">重量(kg)</th>
                            </tr>
                          </thead>
                          <tbody className="divide-y divide-slate-100">
                            {summaries.color.map((c) => (
                              <tr key={c.name}>
                                <td className="px-3 py-1.5 text-slate-700">{c.name}</td>
                                <td className="px-3 py-1.5 text-right tabular-nums font-medium text-slate-800">{c.pieces}</td>
                                <td className="px-3 py-1.5 text-right tabular-nums font-medium text-slate-800">{c.weight}</td>
                              </tr>
                            ))}
                          </tbody>
                        </table>
                      </div>
                      <div className="border border-slate-200 rounded-lg overflow-hidden">
                        <div className="bg-emerald-50 px-3 py-2 border-b border-slate-200">
                          <span className="text-xs font-bold text-emerald-700">按型材类型汇总</span>
                        </div>
                        <table className="w-full text-xs">
                          <thead className="bg-slate-50">
                            <tr>
                              <th className="text-left px-3 py-1.5 font-semibold text-slate-600">类型</th>
                              <th className="text-right px-3 py-1.5 font-semibold text-slate-600">支数</th>
                              <th className="text-right px-3 py-1.5 font-semibold text-slate-600">重量(kg)</th>
                            </tr>
                          </thead>
                          <tbody className="divide-y divide-slate-100">
                            {summaries.profile.map((pr) => (
                              <tr key={pr.name}>
                                <td className="px-3 py-1.5 text-slate-700">{pr.name}</td>
                                <td className="px-3 py-1.5 text-right tabular-nums font-medium text-slate-800">{pr.pieces}</td>
                                <td className="px-3 py-1.5 text-right tabular-nums font-medium text-slate-800">{pr.weight}</td>
                              </tr>
                            ))}
                          </tbody>
                        </table>
                      </div>
                    </div>

                    <div className="border border-slate-200 rounded-lg overflow-hidden">
                      <div className="bg-slate-50 px-3 py-2 border-b border-slate-200">
                        <span className="text-xs font-bold text-slate-700">框明细表</span>
                      </div>
                      <div className="overflow-x-auto">
                        <table className="w-full text-xs">
                          <thead className="bg-slate-50/80">
                            <tr>
                              <th className="text-left px-3 py-2 font-semibold text-slate-600 whitespace-nowrap">框号</th>
                              <th className="text-left px-3 py-2 font-semibold text-slate-600 whitespace-nowrap">批次</th>
                              <th className="text-left px-3 py-2 font-semibold text-slate-600 whitespace-nowrap">表面</th>
                              <th className="text-left px-3 py-2 font-semibold text-slate-600 whitespace-nowrap">颜色</th>
                              <th className="text-right px-3 py-2 font-semibold text-slate-600 whitespace-nowrap">定尺</th>
                              <th className="text-right px-3 py-2 font-semibold text-slate-600 whitespace-nowrap">支数</th>
                              <th className="text-right px-3 py-2 font-semibold text-slate-600 whitespace-nowrap">重量(kg)</th>
                              <th className="text-left px-3 py-2 font-semibold text-slate-600 whitespace-nowrap">等级</th>
                            </tr>
                          </thead>
                          <tbody className="divide-y divide-slate-100">
                            {statementOrder.records.map((p) => {
                              const g = gradeColor[p.grade];
                              const sl = getSurfaceLabel(p);
                              return (
                                <tr key={p.id}>
                                  <td className="px-3 py-2 font-mono font-medium text-slate-800 whitespace-nowrap">{p.frameNo}</td>
                                  <td className="px-3 py-2 font-mono text-slate-600 whitespace-nowrap">{p.batchNumber}</td>
                                  <td className="px-3 py-2 whitespace-nowrap">
                                    <span className={cn('inline-flex px-1.5 py-0.5 rounded text-[10px] font-bold', sl.className)}>
                                      {sl.text}
                                    </span>
                                  </td>
                                  <td className="px-3 py-2 text-slate-700 whitespace-nowrap">{p.surfaceColor || '-'}</td>
                                  <td className="px-3 py-2 text-right tabular-nums text-slate-700 whitespace-nowrap">{(p.cutLength / 1000).toFixed(1)}m</td>
                                  <td className="px-3 py-2 text-right tabular-nums font-medium text-slate-800 whitespace-nowrap">{p.pieceCount}</td>
                                  <td className="px-3 py-2 text-right tabular-nums font-medium text-slate-800 whitespace-nowrap">{p.totalWeight}</td>
                                  <td className="px-3 py-2 whitespace-nowrap">
                                    <span className={cn('inline-flex items-center gap-0.5 px-1.5 py-0.5 rounded text-[10px] font-bold text-white', g.bg)}>
                                      {p.grade}级
                                    </span>
                                  </td>
                                </tr>
                              );
                            })}
                            <tr className="bg-slate-50 font-bold border-t-2 border-slate-200">
                              <td className="px-3 py-2.5 text-slate-700 whitespace-nowrap" colSpan={5}>合计</td>
                              <td className="px-3 py-2.5 text-right tabular-nums text-indigo-700 whitespace-nowrap">{statementOrder.frameCount}框 / {statementOrder.totalPieces}支</td>
                              <td className="px-3 py-2.5 text-right tabular-nums text-indigo-700 whitespace-nowrap">{statementOrder.totalWeight}kg / {(statementOrder.totalWeight / 1000).toFixed(2)}吨</td>
                              <td className="px-3 py-2.5 whitespace-nowrap">-</td>
                            </tr>
                          </tbody>
                        </table>
                      </div>
                    </div>
                  </>
                );
              })()}
            </div>
            <div className="px-6 py-4 border-t border-slate-100 flex items-center justify-end gap-3 bg-slate-50/50 shrink-0">
              <button
                onClick={() => setShowStatementModal(false)}
                className="px-5 py-2.5 text-sm font-semibold text-slate-600 bg-white border border-slate-200 rounded-lg hover:bg-slate-50"
              >
                关闭
              </button>
              <button
                onClick={() => alert('对账确认功能为提示用，暂不执行实际操作')}
                className="px-6 py-2.5 text-sm font-semibold text-white bg-slate-500 rounded-lg hover:bg-slate-600 shadow-sm flex items-center gap-2"
              >
                <CheckCircle className="w-4 h-4" />
                对账确认
              </button>
            </div>
          </div>
        </div>
      )}

      {showAddModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 backdrop-blur-sm p-4">
          <div className="bg-white rounded-2xl shadow-2xl w-full max-w-lg overflow-hidden animate-in">
            <div className="px-6 py-4 border-b border-slate-100 flex items-center justify-between bg-gradient-to-r from-indigo-50 to-purple-50">
              <h3 className="text-lg font-bold text-slate-800 flex items-center gap-2">
                <Plus className="w-5 h-5 text-indigo-600" />
                录入成品装框
              </h3>
              <button
                onClick={() => setShowAddModal(false)}
                className="w-8 h-8 rounded-lg hover:bg-slate-100 flex items-center justify-center text-slate-500"
              >
                ✕
              </button>
            </div>
            <div className="p-6 space-y-4">
              <div>
                <label className="text-xs font-semibold text-slate-600 block mb-1.5">
                  选择表面处理完成批次 <span className="text-amber-500">*</span>
                </label>
                <select
                  value={form.surfaceRecordId}
                  onChange={(e) => {
                    const surface = completedSurfaces.find(s => s.id === e.target.value);
                    const batch = batches.find(b => b.id === surface?.batchId);
                    setForm({ 
                      ...form, 
                      surfaceRecordId: e.target.value,
                    });
                  }}
                  className="w-full px-3 py-2.5 border border-slate-200 rounded-lg text-sm focus:ring-2 focus:ring-indigo-500/30"
                >
                  <option value="">-- 请选择表面处理批次 --</option>
                  {completedSurfaces.map((s) => {
                    const batch = batches.find(b => b.id === s.batchId);
                    return (
                      <option key={s.id} value={s.id}>
                        {s.batchNumber} - {batch?.profileType || ''} ({s.processType === 'oxidation' ? '阳极氧化' : '静电喷涂'} · {s.color || '银色'})
                      </option>
                    );
                  })}
                </select>
                {form.surfaceRecordId && (
                  <div className="mt-2 p-2.5 rounded-lg bg-indigo-50/50 border border-indigo-100">
                    <div className="text-[11px] text-slate-600">
                      {(() => {
                        const s = completedSurfaces.find(r => r.id === form.surfaceRecordId);
                        const b = batches.find(r => r.id === s?.batchId);
                        if (!s) return null;
                        return (
                          <>
                            <div>型材类型：<span className="font-medium text-slate-700">{b?.profileType}</span></div>
                            <div>表面工艺：<span className="font-medium text-slate-700">{s.processType === 'oxidation' ? '阳极氧化' : '静电喷涂'}</span></div>
                            <div>颜色：<span className="font-medium text-slate-700">{s.color || '银色'}</span></div>
                          </>
                        );
                      })()}
                    </div>
                  </div>
                )}
              </div>
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="text-xs font-semibold text-slate-600 block mb-1.5">定尺长度 (mm)</label>
                  <select
                    value={form.cutLength}
                    onChange={(e) => setForm({ ...form, cutLength: parseInt(e.target.value) })}
                    className="w-full px-3 py-2.5 border border-slate-200 rounded-lg text-sm focus:ring-2 focus:ring-indigo-500/30"
                  >
                    <option value={3000}>3000 mm (3m)</option>
                    <option value={4500}>4500 mm (4.5m)</option>
                    <option value={6000}>6000 mm (6m)</option>
                    <option value={6500}>6500 mm (6.5m)</option>
                  </select>
                </div>
                <div>
                  <label className="text-xs font-semibold text-slate-600 block mb-1.5">锯切支数</label>
                  <input
                    type="number"
                    value={form.pieceCount}
                    onChange={(e) => setForm({ ...form, pieceCount: parseInt(e.target.value) })}
                    className="w-full px-3 py-2.5 border border-slate-200 rounded-lg text-sm font-mono tabular-nums focus:ring-2 focus:ring-indigo-500/30"
                  />
                </div>
                <div>
                  <label className="text-xs font-semibold text-slate-600 block mb-1.5">成品等级</label>
                  <div className="grid grid-cols-3 gap-2">
                    {(['A', 'B', 'C'] as const).map((g) => (
                      <button
                        key={g}
                        onClick={() => setForm({ ...form, grade: g })}
                        className={cn(
                          'py-2 rounded-lg text-sm font-bold border-2 transition-all',
                          form.grade === g
                            ? `${gradeColor[g].bg} text-white border-transparent shadow-md`
                            : 'bg-white text-slate-600 border-slate-200 hover:border-slate-300'
                        )}
                      >
                        {g}级
                      </button>
                    ))}
                  </div>
                </div>
                <div>
                  <label className="text-xs font-semibold text-slate-600 block mb-1.5">装框编号</label>
                  <input
                    type="text"
                    value={form.frameNo}
                    onChange={(e) => setForm({ ...form, frameNo: e.target.value })}
                    className="w-full px-3 py-2.5 border border-slate-200 rounded-lg text-sm font-mono focus:ring-2 focus:ring-indigo-500/30"
                  />
                </div>
              </div>
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="text-xs font-semibold text-slate-600 block mb-1.5">客户名称</label>
                  <input
                    type="text"
                    value={form.customer}
                    onChange={(e) => setForm({ ...form, customer: e.target.value })}
                    className="w-full px-3 py-2.5 border border-slate-200 rounded-lg text-sm focus:ring-2 focus:ring-indigo-500/30"
                  />
                </div>
                <div>
                  <label className="text-xs font-semibold text-slate-600 block mb-1.5">订单编号</label>
                  <input
                    type="text"
                    value={form.orderNo}
                    onChange={(e) => setForm({ ...form, orderNo: e.target.value })}
                    className="w-full px-3 py-2.5 border border-slate-200 rounded-lg text-sm font-mono focus:ring-2 focus:ring-indigo-500/30"
                  />
                </div>
              </div>

              <div className="p-4 rounded-xl bg-gradient-to-r from-indigo-50 to-blue-50 border border-indigo-100">
                <div className="text-xs font-semibold text-slate-600 mb-2">装框预览</div>
                <div className="grid grid-cols-3 gap-3 text-center">
                  <div>
                    <div className="text-[10px] text-slate-500">定尺长度</div>
                    <div className="text-lg font-bold text-indigo-600 tabular-nums">{(form.cutLength / 1000).toFixed(1)}m</div>
                  </div>
                  <div>
                    <div className="text-[10px] text-slate-500">理论重量</div>
                    <div className="text-lg font-bold text-blue-600 tabular-nums">{Math.round(form.pieceCount * (form.cutLength / 6000) * 8.5)}kg</div>
                  </div>
                  <div>
                    <div className="text-[10px] text-slate-500">等级</div>
                    <div className={cn('text-lg font-bold', gradeColor[form.grade].text)}>{form.grade}级</div>
                  </div>
                </div>
              </div>
            </div>
            <div className="px-6 py-4 border-t border-slate-100 flex items-center justify-end gap-3 bg-slate-50/50">
              <button
                onClick={() => setShowAddModal(false)}
                className="px-5 py-2.5 text-sm font-semibold text-slate-600 bg-white border border-slate-200 rounded-lg hover:bg-slate-50"
              >
                取消
              </button>
              <button
                onClick={() => {
                  const surface = completedSurfaces.find(s => s.id === form.surfaceRecordId);
                  if (!surface) {
                    alert('请选择表面处理批次');
                    return;
                  }
                  addPackageRecord({
                    batchId: surface.batchId,
                    batchNumber: surface.batchNumber,
                    surfaceRecordId: surface.id,
                    surfaceProcessType: surface.processType,
                    surfaceColor: surface.color || '',
                    cutLength: form.cutLength,
                    pieceCount: form.pieceCount,
                    totalWeight: Math.round(form.pieceCount * (form.cutLength / 6000) * 8.5),
                    grade: form.grade,
                    frameNo: form.frameNo,
                    warehouseTime: new Date().toISOString().slice(0, 16).replace('T', ' '),
                    operator: form.operator,
                    customer: form.customer,
                    orderNo: form.orderNo,
                  });
                  setShowAddModal(false);
                }}
                className="px-6 py-2.5 text-sm font-semibold text-white bg-gradient-to-r from-indigo-600 to-purple-600 rounded-lg hover:from-indigo-700 hover:to-purple-700 shadow-md shadow-indigo-500/25 flex items-center gap-2"
              >
                <CheckCircle className="w-4 h-4" />
                确认入库
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
