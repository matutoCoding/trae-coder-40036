import { useEffect, useState } from 'react';
import { useProductionStore } from '@/store/productionStore';
import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, Area, AreaChart } from 'recharts';
import { Thermometer, Activity, Flame } from 'lucide-react';

interface SpeedPoint {
  time: string;
  speed: number;
}

export function RealtimePanel() {
  const realtimeData = useProductionStore((s) => s.realtimeData);
  const updateRealtimeData = useProductionStore((s) => s.updateRealtimeData);
  const [speedHistory, setSpeedHistory] = useState<SpeedPoint[]>([]);

  useEffect(() => {
    const now = new Date();
    const initial: SpeedPoint[] = [];
    for (let i = 11; i >= 0; i--) {
      const t = new Date(now.getTime() - i * 5000);
      initial.push({
        time: t.toTimeString().slice(0, 8),
        speed: 14 + Math.random() * 2,
      });
    }
    setSpeedHistory(initial);
  }, []);

  useEffect(() => {
    const interval = setInterval(() => {
      updateRealtimeData();
      setSpeedHistory((prev) => {
        const newPoint: SpeedPoint = {
          time: new Date().toTimeString().slice(0, 8),
          speed: realtimeData.extrusionSpeed,
        };
        const next = [...prev.slice(1), newPoint];
        return next;
      });
    }, 3000);
    return () => clearInterval(interval);
  }, [updateRealtimeData, realtimeData.extrusionSpeed]);

  const tempGauges = [
    { label: '上部温度', value: realtimeData.heatTempTop, unit: '℃', min: 400, max: 550, zone: '最佳 480-500' },
    { label: '中部温度', value: realtimeData.heatTempMid, unit: '℃', min: 400, max: 550, zone: '最佳 485-505' },
    { label: '下部温度', value: realtimeData.heatTempBottom, unit: '℃', min: 400, max: 550, zone: '最佳 475-495' },
  ];

  const TempGauge = ({ label, value, min, max, zone }: typeof tempGauges[number]) => {
    const percent = ((value - min) / (max - min)) * 100;
    const clamped = Math.max(0, Math.min(100, percent));
    const isOptimal = value >= 475 && value <= 510;

    return (
      <div className="bg-white rounded-xl p-4 border border-slate-200/60">
        <div className="flex items-center justify-between mb-3">
          <span className="text-xs font-semibold text-slate-500">{label}</span>
          <span className={`text-[10px] px-2 py-0.5 rounded-full font-medium ${isOptimal ? 'bg-emerald-50 text-emerald-600' : 'bg-orange-50 text-orange-600'}`}>
            {zone}
          </span>
        </div>
        <div className="relative h-14 mb-2">
          <svg viewBox="0 0 100 50" className="w-full h-full" preserveAspectRatio="none">
            <defs>
              <linearGradient id={`grad-${label}`} x1="0%" y1="0%" x2="100%" y2="0%">
                <stop offset="0%" stopColor="#22c55e" />
                <stop offset="60%" stopColor="#eab308" />
                <stop offset="100%" stopColor="#ef4444" />
              </linearGradient>
            </defs>
            <path
              d="M 2 48 A 48 48 0 0 1 98 48"
              fill="none"
              stroke="#e2e8f0"
              strokeWidth="8"
              strokeLinecap="round"
            />
            <path
              d={`M 2 48 A 48 48 0 0 1 ${2 + (clamped * 0.96)} ${48 - Math.sin(clamped * Math.PI / 100) * 48}`}
              fill="none"
              stroke={`url(#grad-${label})`}
              strokeWidth="8"
              strokeLinecap="round"
              style={{ transition: 'all 0.6s ease' }}
            />
            <circle
              cx={2 + (clamped * 0.96)}
              cy={48 - Math.sin(clamped * Math.PI / 100) * 48}
              r="3"
              fill="white"
              stroke={isOptimal ? '#10b981' : '#f59e0b'}
              strokeWidth="2"
              style={{ transition: 'all 0.6s ease' }}
            />
          </svg>
        </div>
        <div className="flex items-baseline justify-center gap-1">
          <span className={`text-2xl font-bold tabular-nums ${isOptimal ? 'text-emerald-600' : 'text-orange-600'}`}>
            {value}
          </span>
          <span className="text-xs text-slate-500 font-medium">℃</span>
        </div>
      </div>
    );
  };

  return (
    <div className="grid grid-cols-1 lg:grid-cols-3 gap-4 mb-6">
      <div className="lg:col-span-2 bg-white rounded-xl p-5 shadow-sm border border-slate-200/60">
        <div className="flex items-center justify-between mb-4">
          <h3 className="text-base font-bold text-slate-800 flex items-center gap-2">
            <Activity className="w-5 h-5 text-blue-600" />
            挤压速度实时曲线
          </h3>
          <div className="flex items-center gap-3">
            <div className="text-right">
              <div className="text-xs text-slate-500">当前速度</div>
              <div className="text-xl font-bold text-blue-600 tabular-nums">
                {realtimeData.extrusionSpeed.toFixed(1)}
                <span className="text-xs font-normal text-slate-500 ml-1">m/min</span>
              </div>
            </div>
          </div>
        </div>
        <div className="h-44">
          <ResponsiveContainer width="100%" height="100%">
            <AreaChart data={speedHistory} margin={{ top: 5, right: 10, left: 0, bottom: 0 }}>
              <defs>
                <linearGradient id="speedGrad" x1="0" y1="0" x2="0" y2="1">
                  <stop offset="0%" stopColor="#3b82f6" stopOpacity={0.25} />
                  <stop offset="100%" stopColor="#3b82f6" stopOpacity={0} />
                </linearGradient>
              </defs>
              <CartesianGrid strokeDasharray="3 3" stroke="#f1f5f9" vertical={false} />
              <XAxis dataKey="time" tick={{ fontSize: 10, fill: '#94a3b8' }} tickLine={false} axisLine={{ stroke: '#e2e8f0' }} />
              <YAxis domain={[10, 18]} tick={{ fontSize: 10, fill: '#94a3b8' }} tickLine={false} axisLine={false} width={30} />
              <Tooltip
                contentStyle={{ borderRadius: 8, border: '1px solid #e2e8f0', fontSize: 12 }}
                formatter={(v: number) => [`${v.toFixed(1)} m/min`, '挤压速度']}
              />
              <Area type="monotone" dataKey="speed" stroke="#3b82f6" strokeWidth={2} fill="url(#speedGrad)" dot={false} activeDot={{ r: 5 }} />
            </AreaChart>
          </ResponsiveContainer>
        </div>
      </div>

      <div className="bg-white rounded-xl p-5 shadow-sm border border-slate-200/60">
        <h3 className="text-base font-bold text-slate-800 flex items-center gap-2 mb-4">
          <Flame className="w-5 h-5 text-orange-500" />
          铸棒加热温度
        </h3>
        <div className="space-y-3">
          {tempGauges.map((g) => (
            <TempGauge key={g.label} {...g} />
          ))}
        </div>
      </div>

      <div className="lg:col-span-3 grid grid-cols-2 md:grid-cols-4 gap-4">
        {[
          { label: '出料口温度', value: realtimeData.exitTemp, unit: '℃', icon: Thermometer, color: 'text-red-500', bg: 'bg-red-50', desc: '最佳 510-530' },
          { label: '挤压速度', value: realtimeData.extrusionSpeed.toFixed(1), unit: 'm/min', icon: Activity, color: 'text-blue-500', bg: 'bg-blue-50', desc: '实时更新' },
          { label: '主缸压力', value: realtimeData.cylinderPressure.toFixed(1), unit: 'MPa', icon: Flame, color: 'text-purple-500', bg: 'bg-purple-50', desc: '额定 25MPa' },
          { label: '出料温差', value: String(realtimeData.heatTempTop - realtimeData.heatTempBottom), unit: '℃', icon: Thermometer, color: 'text-emerald-500', bg: 'bg-emerald-50', desc: '允许 ±8℃' },
        ].map((item) => (
          <div key={item.label} className={`${item.bg} rounded-xl p-4 border border-white`}>
            <div className="flex items-center justify-between mb-2">
              <span className="text-xs font-medium text-slate-600">{item.label}</span>
              <item.icon className={`w-4 h-4 ${item.color}`} />
            </div>
            <div className="flex items-baseline gap-1">
              <span className={`text-2xl font-bold tabular-nums ${item.color}`}>{item.value}</span>
              <span className="text-xs text-slate-500 font-medium">{item.unit}</span>
            </div>
            <div className="text-[11px] text-slate-500 mt-1">{item.desc}</div>
          </div>
        ))}
      </div>
    </div>
  );
}
