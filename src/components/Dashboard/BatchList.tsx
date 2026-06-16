import { useProductionStore } from '@/store/productionStore';
import { Play, Check, Clock, ArrowRight } from 'lucide-react';
import { Link } from 'react-router-dom';
import { cn } from '@/lib/utils';

const statusMap: Record<string, { label: string; icon: typeof Play; className: string; dot: string }> = {
  running: { label: '生产中', icon: Play, className: 'bg-blue-50 text-blue-600 border-blue-200', dot: 'bg-blue-500 animate-pulse' },
  completed: { label: '已完成', icon: Check, className: 'bg-emerald-50 text-emerald-600 border-emerald-200', dot: 'bg-emerald-500' },
  pending: { label: '待生产', icon: Clock, className: 'bg-slate-50 text-slate-500 border-slate-200', dot: 'bg-slate-400' },
};

export function BatchList() {
  const batches = useProductionStore((s) => s.extrusionBatches);

  return (
    <div className="bg-white rounded-xl shadow-sm border border-slate-200/60 overflow-hidden">
      <div className="flex items-center justify-between px-5 py-4 border-b border-slate-100">
        <h3 className="text-base font-bold text-slate-800 flex items-center gap-2">
          <span className="w-1 h-5 bg-blue-600 rounded-full" />
          今日生产批次
        </h3>
        <Link
          to="/extrusion"
          className="text-sm text-blue-600 hover:text-blue-700 font-medium flex items-center gap-1 group"
        >
          查看全部
          <ArrowRight className="w-4 h-4 group-hover:translate-x-0.5 transition-transform" />
        </Link>
      </div>
      <div className="overflow-x-auto">
        <table className="w-full text-sm">
          <thead className="bg-slate-50/60">
            <tr>
              <th className="text-left px-5 py-3 font-semibold text-slate-600 text-xs uppercase tracking-wider">批次号</th>
              <th className="text-left px-5 py-3 font-semibold text-slate-600 text-xs uppercase tracking-wider">型材类型</th>
              <th className="text-left px-5 py-3 font-semibold text-slate-600 text-xs uppercase tracking-wider">机台</th>
              <th className="text-left px-5 py-3 font-semibold text-slate-600 text-xs uppercase tracking-wider">铸棒批次</th>
              <th className="text-left px-5 py-3 font-semibold text-slate-600 text-xs uppercase tracking-wider">模具</th>
              <th className="text-left px-5 py-3 font-semibold text-slate-600 text-xs uppercase tracking-wider">出料温度</th>
              <th className="text-left px-5 py-3 font-semibold text-slate-600 text-xs uppercase tracking-wider">产量</th>
              <th className="text-left px-5 py-3 font-semibold text-slate-600 text-xs uppercase tracking-wider">操作员</th>
              <th className="text-left px-5 py-3 font-semibold text-slate-600 text-xs uppercase tracking-wider">状态</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-slate-100">
            {batches.map((batch) => {
              const status = statusMap[batch.status];
              return (
                <tr key={batch.id} className="hover:bg-slate-50/50 transition-colors">
                  <td className="px-5 py-3.5">
                    <span className="font-mono font-semibold text-slate-800">{batch.batchNumber}</span>
                  </td>
                  <td className="px-5 py-3.5">
                    <span className="text-slate-700">{batch.profileType}</span>
                  </td>
                  <td className="px-5 py-3.5">
                    <span className="inline-flex items-center gap-1.5 px-2 py-0.5 rounded-md bg-slate-100 text-slate-600 text-xs font-medium">
                      {batch.machineNo}
                    </span>
                  </td>
                  <td className="px-5 py-3.5">
                    <span className="font-mono text-xs text-slate-500">{batch.billetBatchNumber}</span>
                  </td>
                  <td className="px-5 py-3.5">
                    <span className="font-mono text-xs text-slate-600">{batch.dieNumber}</span>
                  </td>
                  <td className="px-5 py-3.5">
                    {batch.exitTemp > 0 ? (
                      <span className={cn(
                        'font-mono font-semibold tabular-nums',
                        batch.exitTemp >= 510 && batch.exitTemp <= 530 ? 'text-emerald-600' : 'text-orange-600'
                      )}>
                        {batch.exitTemp}℃
                      </span>
                    ) : (
                      <span className="text-slate-400">--</span>
                    )}
                  </td>
                  <td className="px-5 py-3.5">
                    {batch.outputWeight > 0 ? (
                      <span className="font-semibold text-slate-700 tabular-nums">{batch.outputWeight}<span className="text-xs font-normal text-slate-400 ml-1">kg</span></span>
                    ) : (
                      <span className="text-slate-400">--</span>
                    )}
                  </td>
                  <td className="px-5 py-3.5">
                    <span className="text-slate-600">{batch.operator || '--'}</span>
                  </td>
                  <td className="px-5 py-3.5">
                    <span className={cn(
                      'inline-flex items-center gap-1.5 px-2.5 py-1 rounded-md text-xs font-semibold border',
                      status.className
                    )}>
                      <span className={cn('w-1.5 h-1.5 rounded-full', status.dot)} />
                      <status.icon className="w-3 h-3" />
                      {status.label}
                    </span>
                  </td>
                </tr>
              );
            })}
          </tbody>
        </table>
      </div>
    </div>
  );
}
