import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import { useEffect } from 'react';
import { Layout } from '@/components/Layout';
import Dashboard from '@/pages/Dashboard';
import Casting from '@/pages/Casting';
import DieManagement from '@/pages/DieManagement';
import Extrusion from '@/pages/Extrusion';
import Quenching from '@/pages/Quenching';
import Aging from '@/pages/Aging';
import SurfaceTreatment from '@/pages/SurfaceTreatment';
import Packaging from '@/pages/Packaging';
import { useProductionStore } from '@/store/productionStore';

export default function App() {
  const fillLegacySourceData = useProductionStore((s) => s.fillLegacySourceData);
  useEffect(() => { fillLegacySourceData(); }, [fillLegacySourceData]);

  return (
    <Router>
      <Routes>
        <Route element={<Layout />}>
          <Route path="/" element={<Navigate to="/dashboard" replace />} />
          <Route path="/dashboard" element={<Dashboard />} />
          <Route path="/casting" element={<Casting />} />
          <Route path="/die" element={<DieManagement />} />
          <Route path="/extrusion" element={<Extrusion />} />
          <Route path="/quenching" element={<Quenching />} />
          <Route path="/aging" element={<Aging />} />
          <Route path="/surface" element={<SurfaceTreatment />} />
          <Route path="/packaging" element={<Packaging />} />
          <Route path="*" element={<Navigate to="/dashboard" replace />} />
        </Route>
      </Routes>
    </Router>
  );
}
