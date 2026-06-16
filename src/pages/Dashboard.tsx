import { KPISection } from '@/components/Dashboard/KPISection';
import { ProcessFlowChart } from '@/components/Dashboard/ProcessFlowChart';
import { RealtimePanel } from '@/components/Dashboard/RealtimePanel';
import { BatchList } from '@/components/Dashboard/BatchList';

export default function Dashboard() {
  return (
    <div className="space-y-6">
      <KPISection />
      <ProcessFlowChart />
      <RealtimePanel />
      <BatchList />
    </div>
  );
}
