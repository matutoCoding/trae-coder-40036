import { Bell, Search, User, ChevronDown, Settings, Clock } from 'lucide-react';
import { useState, useEffect } from 'react';

interface HeaderProps {
  title: string;
  breadcrumb: string[];
}

export function Header({ title, breadcrumb }: HeaderProps) {
  const [currentTime, setCurrentTime] = useState(new Date());

  useEffect(() => {
    const timer = setInterval(() => {
      setCurrentTime(new Date());
    }, 1000);
    return () => clearInterval(timer);
  }, []);

  const formatDate = (d: Date) => {
    const year = d.getFullYear();
    const month = String(d.getMonth() + 1).padStart(2, '0');
    const day = String(d.getDate()).padStart(2, '0');
    const hours = String(d.getHours()).padStart(2, '0');
    const minutes = String(d.getMinutes()).padStart(2, '0');
    const seconds = String(d.getSeconds()).padStart(2, '0');
    return `${year}-${month}-${day} ${hours}:${minutes}:${seconds}`;
  };

  return (
    <header className="h-16 bg-white border-b border-slate-200/80 px-6 flex items-center justify-between sticky top-0 z-40">
      <div className="flex items-center gap-4">
        <div>
          <h1 className="text-lg font-bold text-slate-800">{title}</h1>
          <div className="flex items-center gap-1.5 text-xs text-slate-500 mt-0.5">
            {breadcrumb.map((item, idx) => (
              <span key={idx} className="flex items-center gap-1.5">
                <span>{item}</span>
                {idx < breadcrumb.length - 1 && (
                  <ChevronDown className="w-3 h-3 -rotate-90 text-slate-400" />
                )}
              </span>
            ))}
          </div>
        </div>
      </div>

      <div className="flex items-center gap-4">
        <div className="hidden lg:flex items-center gap-2 bg-slate-100/70 rounded-lg px-3 py-2 text-sm text-slate-600">
          <Clock className="w-4 h-4 text-blue-600" />
          <span className="font-mono text-[13px] tabular-nums">{formatDate(currentTime)}</span>
        </div>

        <div className="relative hidden md:block">
          <Search className="w-4 h-4 absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" />
          <input
            type="text"
            placeholder="搜索批次号、模具号..."
            className="w-56 pl-9 pr-3 py-2 text-sm bg-slate-50 border border-slate-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500/30 focus:border-blue-400 transition-all"
          />
        </div>

        <button className="relative p-2 rounded-lg hover:bg-slate-100 transition-colors group">
          <Bell className="w-5 h-5 text-slate-600 group-hover:text-blue-600 transition-colors" />
          <span className="absolute top-1.5 right-1.5 w-2 h-2 rounded-full bg-orange-500 animate-pulse" />
        </button>

        <button className="p-2 rounded-lg hover:bg-slate-100 transition-colors group">
          <Settings className="w-5 h-5 text-slate-600 group-hover:text-blue-600 transition-colors" />
        </button>

        <div className="flex items-center gap-3 pl-3 border-l border-slate-200">
          <div className="w-9 h-9 rounded-full bg-gradient-to-br from-blue-500 to-indigo-600 flex items-center justify-center shadow-md shadow-blue-500/25">
            <User className="w-4 h-4 text-white" />
          </div>
          <div className="hidden sm:block">
            <div className="text-sm font-semibold text-slate-700">生产主管</div>
            <div className="text-xs text-slate-500">管理员</div>
          </div>
          <ChevronDown className="w-4 h-4 text-slate-400 hidden sm:block" />
        </div>
      </div>
    </header>
  );
}
