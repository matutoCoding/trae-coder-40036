import { useProductionStore } from '@/store/productionStore';
import {
  Flame,
  Wrench,
  Gauge,
  Wind,
  ThermometerSun,
  Sparkles,
  Package,
  Check,
} from 'lucide-react';
import { cn } from '@/lib/utils';

const steps = [
  { key: 'casting', label: '铸棒熔铸', icon: Flame, color: 'orange' },
  { key: 'die', label: '模具管理', icon: Wrench, color: 'slate' },
  { key: 'extrusion', label: '加热挤压', icon: Gauge, color: 'red' },
  { key: 'quenching', label: '在线淬火', icon: Wind, color: 'cyan' },
  { key: 'aging', label: '时效处理', icon: ThermometerSun, color: 'amber' },
  { key: 'surface', label: '表面处理', icon: Sparkles, color: 'emerald' },
  { key: 'packaging', label: '定尺包装', icon: Package, color: 'indigo' },
];

const colorMap: Record<string, { bg: string; text: string; border: string; ring: string; dot: string }> = {
  orange: { bg: 'bg-orange-500', text: 'text-orange-500', border: 'border-orange-500', ring: 'ring-orange-500/30', dot: 'bg-orange-500' },
  slate: { bg: 'bg-slate-500', text: 'text-slate-500', border: 'border-slate-500', ring: 'ring-slate-500/30', dot: 'bg-slate-500' },
  red: { bg: 'bg-red-500', text: 'text-red-500', border: 'border-red-500', ring: 'ring-red-500/30', dot: 'bg-red-500' },
  cyan: { bg: 'bg-cyan-500', text: 'text-cyan-500', border: 'border-cyan-500', ring: 'ring-cyan-500/30', dot: 'bg-cyan-500' },
  amber: { bg: 'bg-amber-500', text: 'text-amber-500', border: 'border-amber-500', ring: 'ring-amber-500/30', dot: 'bg-amber-500' },
  emerald: { bg: 'bg-emerald-500', text: 'text-emerald-500', border: 'border-emerald-500', ring: 'ring-emerald-500/30', dot: 'bg-emerald-500' },
  indigo: { bg: 'bg-indigo-500', text: 'text-indigo-500', border: 'border-indigo-500', ring: 'ring-indigo-500/30', dot: 'bg-indigo-500' },
};

function getStepStatus(key: string): 'active' | 'completed' | 'pending' {
  if (key === 'extrusion' || key === 'aging') return 'active';
  if (['casting', 'die', 'quenching'].includes(key)) return 'completed';
  return 'pending';
}

function getStepCounts(key: string, status: ReturnType<typeof useProductionStore.getState>['processStatus']) {
  const s = status;
  switch (key) {
    case 'casting': return { active: s.casting.active, done: s.casting.completed };
    case 'die': return { active: s.die.onMachine, done: s.die.available };
    case 'extrusion': return { active: s.extrusion.running, done: s.extrusion.completed };
    case 'quenching': return { active: s.quenching.active, done: s.quenching.completed };
    case 'aging': return { active: s.aging.holding + s.aging.cooling, done: s.aging.completed };
    case 'surface': return { active: s.surface.oxidation + s.surface.spraying, done: s.surface.completed };
    case 'packaging': return { active: s.packaging.today, done: s.packaging.thisWeek };
    default: return { active: 0, done: 0 };
  }
}

export function ProcessFlowChart() {
  const processStatus = useProductionStore((s) => s.processStatus);

  return (
    <div className="bg-white rounded-xl p-6 shadow-sm border border-slate-200/60 mb-6">
      <div className="flex items-center justify-between mb-6">
        <h3 className="text-base font-bold text-slate-800 flex items-center gap-2">
          <span className="w-1 h-5 bg-blue-600 rounded-full" />
          生产工序流程
        </h3>
        <div className="flex items-center gap-4 text-xs">
          <div className="flex items-center gap-1.5">
            <span className="w-2.5 h-2.5 rounded-full bg-emerald-500" />
            <span className="text-slate-600">已完成</span>
          </div>
          <div className="flex items-center gap-1.5">
            <span className="w-2.5 h-2.5 rounded-full bg-blue-500 animate-pulse" />
            <span className="text-slate-600">进行中</span>
          </div>
          <div className="flex items-center gap-1.5">
            <span className="w-2.5 h-2.5 rounded-full bg-slate-300" />
            <span className="text-slate-600">待开始</span>
          </div>
        </div>
      </div>

      <div className="relative">
        <div className="absolute top-10 left-0 right-0 h-0.5 bg-slate-200 mx-16" />

        <div className="grid grid-cols-7 gap-2 relative">
          {steps.map((step, idx) => {
            const colors = colorMap[step.color];
            const stepStatus = getStepStatus(step.key);
            const counts = getStepCounts(step.key, processStatus);

            return (
              <div key={step.key} className="relative flex flex-col items-center">
                {idx < steps.length - 1 && (
                  <div
                    className={cn(
                      'absolute top-10 left-[60%] right-[-40%] h-0.5 z-10',
                      stepStatus === 'completed' ? colors.bg : 'bg-slate-200'
                    )}
                  />
                )}

                <button
                  className={cn(
                    'w-20 h-20 rounded-2xl flex items-center justify-center relative z-20 transition-all duration-300',
                    'border-2 shadow-md',
                    stepStatus === 'active' && [
                      colors.bg,
                      'text-white',
                      colors.border,
                      'ring-4',
                      colors.ring,
                      'scale-105',
                      'hover:scale-110',
                    ],
                    stepStatus === 'completed' && [
                      'bg-white',
                      colors.border,
                      colors.text,
                      'hover:scale-105',
                    ],
                    stepStatus === 'pending' && [
                      'bg-slate-50',
                      'border-slate-200',
                      'text-slate-400',
                    ]
                  )}
                >
                  {stepStatus === 'completed' ? (
                    <div className="relative">
                      <step.icon className="w-8 h-8" />
                      <div className="absolute -top-1 -right-1 w-5 h-5 bg-emerald-500 rounded-full flex items-center justify-center shadow-md">
                        <Check className="w-3 h-3 text-white" strokeWidth={3} />
                      </div>
                    </div>
                  ) : (
                    <step.icon className="w-8 h-8" />
                  )}
                </button>

                <div className="mt-3 text-center">
                  <div className={cn(
                    'text-sm font-semibold mb-1',
                    stepStatus === 'pending' ? 'text-slate-400' : 'text-slate-700'
                  )}>
                    {step.label}
                  </div>
                  <div className="flex items-center justify-center gap-2 text-xs">
                    <span className={cn(
                      'px-2 py-0.5 rounded-md font-semibold',
                      stepStatus === 'active'
                        ? `${colors.bg} text-white`
                        : stepStatus === 'completed'
                        ? 'bg-emerald-50 text-emerald-600'
                        : 'bg-slate-100 text-slate-400'
                    )}>
                      进行 {counts.active}
                    </span>
                    <span className={cn(
                      'px-2 py-0.5 rounded-md font-semibold',
                      stepStatus === 'pending'
                        ? 'bg-slate-100 text-slate-400'
                        : 'bg-slate-100 text-slate-600'
                    )}>
                      完成 {counts.done}
                    </span>
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      </div>
    </div>
  );
}
