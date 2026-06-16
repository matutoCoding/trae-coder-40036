import { NavLink } from 'react-router-dom';
import {
  LayoutDashboard,
  Flame,
  Wrench,
  Gauge,
  Wind,
  ThermometerSun,
  Sparkles,
  Package,
  Factory,
} from 'lucide-react';
import { cn } from '@/lib/utils';

const navItems = [
  {
    path: '/dashboard',
    label: '生产概览',
    icon: LayoutDashboard,
    color: 'text-blue-500',
  },
  {
    path: '/casting',
    label: '铸棒熔铸',
    icon: Flame,
    color: 'text-orange-500',
  },
  {
    path: '/die',
    label: '模具管理',
    icon: Wrench,
    color: 'text-slate-500',
  },
  {
    path: '/extrusion',
    label: '加热挤压',
    icon: Gauge,
    color: 'text-red-500',
  },
  {
    path: '/quenching',
    label: '在线淬火',
    icon: Wind,
    color: 'text-cyan-500',
  },
  {
    path: '/aging',
    label: '时效处理',
    icon: ThermometerSun,
    color: 'text-amber-500',
  },
  {
    path: '/surface',
    label: '表面处理',
    icon: Sparkles,
    color: 'text-emerald-500',
  },
  {
    path: '/packaging',
    label: '定尺包装',
    icon: Package,
    color: 'text-indigo-500',
  },
];

export function Sidebar() {
  return (
    <aside className="w-60 bg-slate-900 text-white min-h-screen flex flex-col">
      <div className="h-16 flex items-center px-5 border-b border-slate-700/60">
        <div className="flex items-center gap-3">
          <div className="w-9 h-9 rounded-md bg-gradient-to-br from-blue-500 to-blue-700 flex items-center justify-center shadow-lg shadow-blue-500/30">
            <Factory className="w-5 h-5 text-white" />
          </div>
          <div>
            <div className="text-[15px] font-bold tracking-wide">铝型材MES</div>
            <div className="text-[11px] text-slate-400">挤压车间管理系统</div>
          </div>
        </div>
      </div>

      <nav className="flex-1 px-3 py-4 space-y-1">
        <div className="px-3 mb-2 text-[11px] uppercase tracking-wider text-slate-500 font-semibold">
          功能模块
        </div>
        {navItems.map((item) => (
          <NavLink
            key={item.path}
            to={item.path}
            className={({ isActive }) =>
              cn(
                'flex items-center gap-3 px-3 py-2.5 rounded-md text-sm transition-all duration-200 group',
                isActive
                  ? 'bg-blue-600 text-white shadow-lg shadow-blue-600/30'
                  : 'text-slate-300 hover:bg-slate-800 hover:text-white'
              )
            }
          >
            <item.icon
              className={cn(
                'w-[18px] h-[18px] shrink-0 transition-colors',
                'group-hover:text-white'
              )}
              style={undefined}
            />
            <span className="font-medium">{item.label}</span>
          </NavLink>
        ))}
      </nav>

      <div className="p-4 border-t border-slate-700/60">
        <div className="bg-slate-800/60 rounded-lg p-3">
          <div className="flex items-center gap-2 mb-2">
            <div className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse" />
            <span className="text-xs text-slate-400">系统状态</span>
          </div>
          <div className="text-[11px] text-slate-500">设备连接正常</div>
          <div className="text-[11px] text-slate-500">数据实时同步</div>
        </div>
      </div>
    </aside>
  );
}
