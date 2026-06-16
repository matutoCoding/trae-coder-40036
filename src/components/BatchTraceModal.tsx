import { useProductionStore } from '@/store/productionStore';
import {
  X,
  Factory,
  Droplets,
  ThermometerSun,
  Sparkles,
  Package,
  CheckCircle,
  Clock,
  Play,
  ArrowRight,
  Flame,
  Wind,
  Gauge,
  User,
} from 'lucide-react';
import { cn } from '@/lib/utils';
import type { ProcessStep, ProcessStepInfo } from '@/data/types';

const stepIconMap: Record<ProcessStep, typeof Factory> = {
  casting: Factory,
  die: Gauge,
  extrusion: Flame,
  quenching: Wind,
  aging: ThermometerSun,
  surface: Sparkles,
  packaging: Package,
};

const stepColorMap: Record<ProcessStep, string> = {
  casting: 'text-amber-600',
  die: 'text-blue-600',
  extrusion: 'text-red-600',
  quenching: 'text-cyan-600',
  aging: 'text-orange-600',
  surface: 'text-purple-600',
  packaging: 'text-emerald-600',
};

const stepBgMap: Record<ProcessStep, string> = {
  casting: 'from-amber-500 to-orange-500',
  die: 'from-blue-500 to-indigo-500',
  extrusion: 'from-red-500 to-rose-500',
  quenching: 'from-cyan-500 to-blue-500',
  aging: 'from-orange-500 to-amber-500',
  surface: 'from-purple-500 to-violet-500',
  packaging: 'from-emerald-500 to-teal-500',
};

const statusColorMap: Record<'pending' | 'processing' | 'completed', string> = {
  pending: 'bg-slate-100 text-slate-400',
  processing: 'bg-amber-100 text-amber-600',
  completed: 'bg-emerald-100 text-emerald-600',
};

interface BatchTraceModalProps {
  batchId: string;
  onClose: () => void;
}

export function BatchTraceModal({ batchId, onClose }: BatchTraceModalProps) {
  const getBatchTraceCard = useProductionStore((s) => s.getBatchTraceCard);
  const trace = getBatchTraceCard(batchId);

  if (!trace) {
    return (
      <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 backdrop-blur-sm p-4" onClick={onClose}>
        <div className="bg-white rounded-2xl shadow-2xl w-full max-w-2xl overflow-hidden animate-in" onClick={(e) => e.stopPropagation()}>
          <div className="px-6 py-4 border-b border-slate-100 flex items-center justify-between">
            <h3 className="text-lg font-bold text-slate-800">批次追溯卡</h3>
            <button onClick={onClose} className="w-8 h-8 rounded-lg hover:bg-slate-100 flex items-center justify-center text-slate-500">
              <X className="w-5 h-5" />
            </button>
          </div>
          <div className="p-12 text-center">
            <Clock className="w-12 h-12 text-slate-300 mx-auto mb-3" />
            <p className="text-slate-500">未找到该批次的追溯信息</p>
          </div>
        </div>
      </div>
    );
  }

  const renderStepTimeline = (step: ProcessStepInfo, index: number, isLast: boolean) => {
    const Icon = stepIconMap[step.step];
    const stepColor = stepColorMap[step.step];
    const statusColor = statusColorMap[step.status];
    const isActive = step.status !== 'pending';
    const isCurrent = trace.currentStep === step.step;

    return (
      <div key={step.step} className="relative">
        {!isLast && (
          <div className="absolute left-6 top-12 bottom-0 w-0.5 bg-slate-200" />
        )}
        {!isLast && isActive && (
          <div
            className={cn(
              'absolute left-6 top-12 w-0.5 bg-gradient-to-b',
              stepBgMap[step.step],
              step.status === 'completed' ? 'h-full' : 'h-1/2'
            )}
          />
        )}
        <div className={cn(
          'relative flex gap-4 p-4 rounded-xl border transition-all',
          isCurrent
            ? 'bg-gradient-to-r from-slate-50 to-white border-slate-200 shadow-sm ring-2 ring-slate-200/50'
            : 'border-transparent hover:bg-slate-50/50'
        )}>
          <div className={cn(
            'relative z-10 w-12 h-12 rounded-xl flex items-center justify-center shrink-0 shadow-md',
            isActive
              ? cn('bg-gradient-to-br text-white', stepBgMap[step.step])
              : 'bg-slate-100 text-slate-400'
          )}>
            {step.status === 'completed' ? (
              <CheckCircle className="w-6 h-6" />
            ) : step.status === 'processing' ? (
              <Play className="w-6 h-6 animate-pulse" />
            ) : (
              <Icon className="w-6 h-6" />
            )}
          </div>
          <div className="flex-1 min-w-0">
            <div className="flex items-center gap-2 flex-wrap">
              <h4 className={cn('font-bold text-base', stepColor)}>{step.label}</h4>
              <span className={cn(
                'flex items-center gap-1 px-2 py-0.5 rounded-md text-[10px] font-semibold',
                statusColor
              )}>
                {step.status === 'completed' && <CheckCircle className="w-3 h-3" />}
                {step.status === 'processing' && <Play className="w-3 h-3" />}
                {step.status === 'pending' && <Clock className="w-3 h-3" />}
                {step.status === 'completed' ? '已完成' : step.status === 'processing' ? '进行中' : '待处理'}
              </span>
              {isCurrent && (
                <span className="px-2 py-0.5 rounded-md text-[10px] font-bold bg-slate-800 text-white">当前工序</span>
              )}
            </div>
            <div className="flex items-center gap-3 mt-1 text-xs text-slate-500">
              {step.time && (
                <span className="flex items-center gap-1">
                  <Clock className="w-3 h-3" />
                  {step.time}
                </span>
              )}
              {step.operator && (
                <span className="flex items-center gap-1">
                  <User className="w-3 h-3" />
                  {step.operator}
                </span>
              )}
            </div>
            {step.keyParams && Object.keys(step.keyParams).length > 0 && (
              <div className="mt-3 grid grid-cols-2 md:grid-cols-4 gap-2">
                {Object.entries(step.keyParams).map(([k, v]) => (
                  <div key={k} className="bg-slate-50 rounded-lg p-2 border border-slate-100">
                    <div className="text-[10px] text-slate-500">{k}</div>
                    <div className={cn('text-sm font-bold tabular-nums mt-0.5', step.status === 'pending' ? 'text-slate-400' : 'text-slate-700')}>
                      {String(v)}
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>
      </div>
    );
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 backdrop-blur-sm p-4" onClick={onClose}>
      <div
        className="bg-white rounded-2xl shadow-2xl w-full max-w-4xl overflow-hidden animate-in max-h-[90vh] flex flex-col"
        onClick={(e) => e.stopPropagation()}
      >
        <div className="px-6 py-4 border-b border-slate-100 flex items-center justify-between bg-gradient-to-r from-slate-50 to-white shrink-0">
          <div className="flex items-center gap-4">
            <div className={cn(
              'w-12 h-12 rounded-xl flex items-center justify-center bg-gradient-to-br text-white shadow-lg',
              stepBgMap[trace.currentStep]
            )}>
              {(() => {
                const Icon = stepIconMap[trace.currentStep];
                return <Icon className="w-6 h-6" />;
              })()}
            </div>
            <div>
              <h3 className="text-lg font-bold text-slate-800 flex items-center gap-2">
                批次追溯卡
                <ArrowRight className="w-4 h-4 text-slate-400" />
                <span className="font-mono text-slate-700">{trace.batchNumber}</span>
              </h3>
              <p className="text-sm text-slate-500 mt-0.5">
                {trace.profileType}
                <span className="mx-2">·</span>
                当前：
                <span className={cn('font-semibold', stepColorMap[trace.currentStep])}>
                  {trace.steps.find(s => s.step === trace.currentStep)?.label}
                </span>
              </p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="w-9 h-9 rounded-lg hover:bg-slate-100 flex items-center justify-center text-slate-500 transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        <div className="p-6 overflow-y-auto flex-1">
          <div className="grid grid-cols-1 gap-1">
            {trace.steps.map((step, i) => renderStepTimeline(step, i, i === trace.steps.length - 1))}
          </div>

          <div className="mt-6 grid grid-cols-1 md:grid-cols-2 gap-4">
            {trace.casting && (
              <div className="bg-gradient-to-br from-amber-50/80 to-orange-50/40 rounded-xl p-4 border border-amber-100">
                <h5 className="text-sm font-bold text-amber-800 mb-3 flex items-center gap-2">
                  <Factory className="w-4 h-4" />
                  铸棒原料信息
                </h5>
                <div className="grid grid-cols-2 gap-3 text-sm">
                  <div>
                    <span className="text-xs text-amber-700/70">铸棒批次</span>
                    <div className="font-mono font-bold text-amber-900">{trace.casting.batchNumber}</div>
                  </div>
                  <div>
                    <span className="text-xs text-amber-700/70">重量</span>
                    <div className="font-bold text-amber-900 tabular-nums">{trace.casting.weight}kg</div>
                  </div>
                  <div className="col-span-2">
                    <span className="text-xs text-amber-700/70">熔铸日期</span>
                    <div className="font-semibold text-amber-900">{trace.casting.date}</div>
                  </div>
                </div>
                {trace.casting.elements && (
                  <div className="mt-3 pt-3 border-t border-amber-200/50">
                    <div className="text-xs text-amber-700/70 mb-2">化学成分 (%)</div>
                    <div className="grid grid-cols-4 gap-2">
                      {Object.entries(trace.casting.elements).map(([k, v]) => (
                        <div key={k} className="bg-white/60 rounded-md p-1.5 text-center">
                          <div className="text-[10px] text-amber-700/60">{k}</div>
                          <div className="text-xs font-bold text-amber-900 tabular-nums">{String(v)}</div>
                        </div>
                      ))}
                    </div>
                  </div>
                )}
              </div>
            )}

            {trace.die && (
              <div className="bg-gradient-to-br from-blue-50/80 to-indigo-50/40 rounded-xl p-4 border border-blue-100">
                <h5 className="text-sm font-bold text-blue-800 mb-3 flex items-center gap-2">
                  <Gauge className="w-4 h-4" />
                  模具信息
                </h5>
                <div className="grid grid-cols-2 gap-3 text-sm">
                  <div>
                    <span className="text-xs text-blue-700/70">模具编号</span>
                    <div className="font-mono font-bold text-blue-900">{trace.die.dieNumber}</div>
                  </div>
                  <div>
                    <span className="text-xs text-blue-700/70">模具型号</span>
                    <div className="font-semibold text-blue-900">{trace.die.model}</div>
                  </div>
                </div>
              </div>
            )}

            {trace.quenching && (
              <div className="bg-gradient-to-br from-cyan-50/80 to-blue-50/40 rounded-xl p-4 border border-cyan-100">
                <h5 className="text-sm font-bold text-cyan-800 mb-3 flex items-center gap-2">
                  <Wind className="w-4 h-4" />
                  淬火质量数据
                </h5>
                <div className="grid grid-cols-2 gap-3 text-sm">
                  <div>
                    <span className="text-xs text-cyan-700/70">冷却速率</span>
                    <div className="font-bold text-cyan-900 tabular-nums">{trace.quenching.coolingRate}℃/s</div>
                  </div>
                  <div>
                    <span className="text-xs text-cyan-700/70">淬火硬度</span>
                    <div className="font-bold text-cyan-900 tabular-nums">{trace.quenching.hardness} HW</div>
                  </div>
                  <div>
                    <span className="text-xs text-cyan-700/70">来源机台</span>
                    <div className="font-semibold text-cyan-900">{trace.quenching.sourceMachineNo}</div>
                  </div>
                  <div>
                    <span className="text-xs text-cyan-700/70">产出重量</span>
                    <div className="font-bold text-cyan-900 tabular-nums">{trace.quenching.outputWeight}kg</div>
                  </div>
                </div>
              </div>
            )}

            {trace.surface && (
              <div className="bg-gradient-to-br from-purple-50/80 to-violet-50/40 rounded-xl p-4 border border-purple-100">
                <h5 className="text-sm font-bold text-purple-800 mb-3 flex items-center gap-2">
                  <Sparkles className="w-4 h-4" />
                  表面处理信息
                </h5>
                <div className="grid grid-cols-2 gap-3 text-sm">
                  <div>
                    <span className="text-xs text-purple-700/70">处理工艺</span>
                    <div className="font-bold text-purple-900">
                      {trace.surface.processType === 'oxidation' ? '阳极氧化' : '静电喷涂'}
                    </div>
                  </div>
                  <div>
                    <span className="text-xs text-purple-700/70">表面颜色</span>
                    <div className="font-semibold text-purple-900">{trace.surface.color}</div>
                  </div>
                  <div>
                    <span className="text-xs text-purple-700/70">膜厚</span>
                    <div className="font-bold text-purple-900 tabular-nums">{trace.surface.filmThickness}μm</div>
                  </div>
                  <div>
                    <span className="text-xs text-purple-700/70">处理日期</span>
                    <div className="font-semibold text-purple-900">{trace.surface.date}</div>
                  </div>
                </div>
              </div>
            )}

            {trace.packaging && trace.packaging.frames.length > 0 && (
              <div className="bg-gradient-to-br from-emerald-50/80 to-teal-50/40 rounded-xl p-4 border border-emerald-100 md:col-span-2">
                <h5 className="text-sm font-bold text-emerald-800 mb-3 flex items-center gap-2">
                  <Package className="w-4 h-4" />
                  包装出库信息（共 {trace.packaging.frames.length} 框）
                </h5>
                <div className="grid grid-cols-1 md:grid-cols-3 gap-2 text-sm max-h-48 overflow-y-auto">
                  {trace.packaging.frames.map((f, i) => (
                    <div key={i} className="bg-white/60 rounded-lg p-3 border border-emerald-100/50">
                      <div className="flex items-center justify-between mb-2">
                        <span className="font-mono font-bold text-emerald-900">{f.frameNo}</span>
                        <span className={cn(
                          'px-2 py-0.5 rounded text-[10px] font-bold',
                          f.grade === 'A' ? 'bg-emerald-100 text-emerald-700' :
                          f.grade === 'B' ? 'bg-amber-100 text-amber-700' :
                          'bg-slate-100 text-slate-600'
                        )}>
                          {f.grade}级
                        </span>
                      </div>
                      <div className="space-y-1 text-xs text-emerald-800/80">
                        <div className="flex justify-between">
                          <span>定尺</span>
                          <span className="font-semibold tabular-nums">{f.cutLength}mm</span>
                        </div>
                        <div className="flex justify-between">
                          <span>支数</span>
                          <span className="font-semibold tabular-nums">{f.pieceCount}</span>
                        </div>
                        <div className="flex justify-between">
                          <span>重量</span>
                          <span className="font-bold tabular-nums">{f.totalWeight}kg</span>
                        </div>
                        {f.customer && (
                          <div className="pt-1 mt-1 border-t border-emerald-200/50 text-[11px]">
                            <div className="flex justify-between">
                              <span className="text-emerald-700/60">客户</span>
                              <span className="font-medium">{f.customer}</span>
                            </div>
                            {f.orderNo && (
                              <div className="flex justify-between">
                                <span className="text-emerald-700/60">订单</span>
                                <span className="font-mono">{f.orderNo}</span>
                              </div>
                            )}
                          </div>
                        )}
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            )}
          </div>
        </div>

        <div className="px-6 py-3 border-t border-slate-100 bg-slate-50/50 flex items-center justify-between text-xs text-slate-500 shrink-0">
          <span>批次ID: <span className="font-mono text-slate-600">{trace.batchId}</span></span>
          <span>铝型材MES系统 · 全流程质量追溯</span>
        </div>
      </div>
    </div>
  );
}

export default BatchTraceModal;
