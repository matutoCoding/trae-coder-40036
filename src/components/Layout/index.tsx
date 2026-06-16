import { Outlet, useLocation } from 'react-router-dom';
import { Sidebar } from './Sidebar';
import { Header } from './Header';

const pageTitles: Record<string, { title: string; breadcrumb: string[] }> = {
  '/dashboard': {
    title: '生产概览看板',
    breadcrumb: ['首页', '生产概览'],
  },
  '/casting': {
    title: '铸棒熔铸管理',
    breadcrumb: ['首页', '生产管理', '铸棒熔铸'],
  },
  '/die': {
    title: '模具台账管理',
    breadcrumb: ['首页', '生产管理', '模具管理'],
  },
  '/extrusion': {
    title: '加热挤压工序',
    breadcrumb: ['首页', '生产管理', '加热挤压'],
  },
  '/quenching': {
    title: '在线淬火系统',
    breadcrumb: ['首页', '生产管理', '在线淬火'],
  },
  '/aging': {
    title: '时效热处理',
    breadcrumb: ['首页', '生产管理', '时效处理'],
  },
  '/surface': {
    title: '表面处理工序',
    breadcrumb: ['首页', '生产管理', '表面处理'],
  },
  '/packaging': {
    title: '定尺包装入库',
    breadcrumb: ['首页', '生产管理', '定尺包装'],
  },
};

export function Layout() {
  const location = useLocation();
  const pageInfo = pageTitles[location.pathname] || {
    title: '生产管理系统',
    breadcrumb: ['首页'],
  };

  return (
    <div className="flex min-h-screen bg-slate-100/50">
      <Sidebar />
      <div className="flex-1 flex flex-col min-w-0">
        <Header title={pageInfo.title} breadcrumb={pageInfo.breadcrumb} />
        <main className="flex-1 p-6 overflow-auto">
          <Outlet />
        </main>
      </div>
    </div>
  );
}
