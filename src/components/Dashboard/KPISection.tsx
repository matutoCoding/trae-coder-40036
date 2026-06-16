import { useProductionStore } from '@/store/productionStore';
import {
  TrendingUp,
  TrendingDown,
  Package,
  Percent,
  Cpu,
  Layers,
  AlertTriangle,
  Zap,
  Target,
} from 'lucide-react';
import type { ReactNode } from 'react';

interface KPICardProps {
  title: string;
  value: string;
  unit?: string;
  icon: ReactNode;
  iconBg: string;
  trend?: { value: string; up: boolean };
  target?: { value: string; percent: number };
  color: string;
}

function KPICard({ title, value, unit, icon, iconBg, trend, target, color }: KPICardProps) {
  return (
    <div className="bg-white rounded-xl p-5 shadow-sm border border-slate-200/60 hover:shadow-md transition-shadow duration-300 relative overflow-hidden group">
      <div className={`absolute top-0 left-0 w-1 h-full ${color} opacity-80`} />
      <div className="flex items-start justify-between">
        <div className="flex-1">
          <p className="text-sm text-slate-500 font-medium mb-2">{title}</p>
          <div className="flex items-baseline gap-1.5">
            <span className="text-3xl font-bold text-slate-800 tabular-nums tracking-tight">
              {value}
            </span>
            {unit && <span className="text-sm text-slate-500 font-medium">{unit}</span>}
          </div>
          {trend && (
            <div className={`flex items-center gap-1 mt-3 text-xs font-semibold ${trend.up ? 'text-emerald-600' : 'text-orange-600'}`}>
              {trend.up ? <TrendingUp className="w-3.5 h-3.5" /> : <TrendingDown className="w-3.5 h-3.5" />}
              <span>{trend.value}</span>
              <span className="text-slate-400 font-normal ml-1">较昨日</span>
            </div>
          )}
          {target && (
            <div className="mt-3">
              <div className="flex items-center justify-between text-xs mb-1.5">
                <span className="text-slate-500 flex items-center gap-1">
                  <Target className="w-3 h-3" />
                  目标 {target.value}
                </span>
                <span className="font-semibold text-slate-600">{target.percent}%</span>
              </div>
              <div className="h-1.5 bg-slate-100 rounded-full overflow-hidden">
                <div
                  className={`h-full rounded-full ${color} transition-all duration-700`}
                  style={{ width: `${Math.min(target.percent, 100)}%` }}
                />
              </div>
            </div>
          )}
        </div>
        <div className={`w-12 h-12 rounded-xl ${iconBg} flex items-center justify-center shrink-0 group-hover:scale-110 transition-transform duration-300`}>
          {icon}
        </div>
      </div>
    </div>
  );
}

export function KPISection() {
  const kpiData = useProductionStore((s) => s.kpiData);

  const kpis: KPICardProps[] = [
    {
      title: '今日产量',
      value: kpiData.todayOutput.toFixed(2),
      unit: '吨',
      icon: <Package className="w-6 h-6 text-white" />,
      iconBg: 'bg-gradient-to-br from-blue-500 to-blue-600',
      trend: { value: '+12.5%', up: true },
      target: { value: `${kpiData.targetOutput}吨`, percent: Math.round((kpiData.todayOutput / kpiData.targetOutput) * 100) },
      color: 'bg-blue-600',
    },
    {
      title: '成品合格率',
      value: kpiData.qualifiedRate.toFixed(1),
      unit: '%',
      icon: <Percent className="w-6 h-6 text-white" />,
      iconBg: 'bg-gradient-to-br from-emerald-500 to-emerald-600',
      trend: { value: '+0.8%', up: true },
      color: 'bg-emerald-600',
    },
    {
      title: '设备综合效率',
      value: kpiData.equipmentOEE.toFixed(1),
      unit: '%',
      icon: <Cpu className="w-6 h-6 text-white" />,
      iconBg: 'bg-gradient-to-br from-cyan-500 to-cyan-600',
      trend: { value: '-2.1%', up: false },
      color: 'bg-cyan-600',
    },
    {
      title: '在制批次',
      value: String(kpiData.activeBatches),
      unit: '批',
      icon: <Layers className="w-6 h-6 text-white" />,
      iconBg: 'bg-gradient-to-br from-indigo-500 to-indigo-600',
      color: 'bg-indigo-600',
    },
    {
      title: '异常告警',
      value: String(kpiData.anomalies),
      unit: '项',
      icon: <AlertTriangle className="w-6 h-6 text-white" />,
      iconBg: 'bg-gradient-to-br from-orange-500 to-orange-600',
      trend: { value: '-1项', up: true },
      color: 'bg-orange-600',
    },
    {
      title: '今日能耗',
      value: kpiData.energyConsumption.toLocaleString(),
      unit: 'kWh',
      icon: <Zap className="w-6 h-6 text-white" />,
      iconBg: 'bg-gradient-to-br from-amber-500 to-amber-600',
      trend: { value: '+5.3%', up: false },
      color: 'bg-amber-600',
    },
  ];

  return (
    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-6 gap-4 mb-6">
      {kpis.map((kpi, idx) => (
        <KPICard key={idx} {...kpi} />
      ))}
    </div>
  );
}
