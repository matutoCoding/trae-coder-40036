import { create } from 'zustand';
import { persist } from 'zustand/middleware';
import type {
  CastBillet,
  Die,
  DieUsageRecord,
  ExtrusionBatch,
  QuenchingRecord,
  AgingRecord,
  SurfaceRecord,
  PackageRecord,
  KPIData,
  ProcessStatus,
  RealtimeData,
  TempCurvePoint,
} from '@/data/types';
import {
  mockCastBillets,
  mockDies,
  mockDieUsageRecords,
  mockExtrusionBatches,
  mockQuenchingRecords,
  mockAgingRecords,
  mockSurfaceRecords,
  mockPackageRecords,
  mockKPIData,
  mockProcessStatus,
} from '@/data/mockData';

interface ProductionState {
  castBillets: CastBillet[];
  dies: Die[];
  dieUsageRecords: DieUsageRecord[];
  extrusionBatches: ExtrusionBatch[];
  quenchingRecords: QuenchingRecord[];
  agingRecords: AgingRecord[];
  surfaceRecords: SurfaceRecord[];
  packageRecords: PackageRecord[];
  kpiData: KPIData;
  processStatus: ProcessStatus;
  realtimeData: RealtimeData;
  addCastBillet: (billet: Omit<CastBillet, 'id'>) => void;
  updateCastBillet: (id: string, data: Partial<CastBillet>) => void;
  addDie: (die: Omit<Die, 'id'>) => void;
  updateDie: (id: string, data: Partial<Die>) => void;
  addDieUsageRecord: (record: Omit<DieUsageRecord, 'id'>) => void;
  updateDieUsageRecord: (id: string, data: Partial<DieUsageRecord>) => void;
  addDieRepairRecord: (dieId: string, note: string) => void;
  mountDieToMachine: (dieId: string, machineNo: string, operator: string) => void;
  unmountDieFromMachine: (recordId: string, extrusionWeight: number, wearCondition: string) => void;
  addExtrusionBatch: (batch: Omit<ExtrusionBatch, 'id'>) => void;
  updateExtrusionBatch: (id: string, data: Partial<ExtrusionBatch>) => void;
  addQuenchingRecord: (record: Omit<QuenchingRecord, 'id'>) => void;
  addAgingRecord: (record: Omit<AgingRecord, 'id'>) => void;
  updateAgingRecord: (id: string, data: Partial<AgingRecord>) => void;
  addSurfaceRecord: (record: Omit<SurfaceRecord, 'id'>) => void;
  addPackageRecord: (record: Omit<PackageRecord, 'id'>) => void;
  updateRealtimeData: () => void;
  manualRefreshRealtime: (batchId: string) => void;
  computeProcessStatus: () => void;
  resetAllData: () => void;
}

const generateId = (prefix: string) => {
  return `${prefix}${Date.now()}${Math.floor(Math.random() * 1000)}`;
};

const formatDateTime = (d: Date) => d.toISOString().slice(0, 16).replace('T', ' ');
const formatDate = (d: Date) => d.toISOString().split('T')[0];

const initialRealtimeData: RealtimeData = {
  timestamp: new Date().toISOString(),
  extrusionSpeed: 15.2,
  exitTemp: 525,
  cylinderPressure: 24.1,
  heatTempTop: 492,
  heatTempMid: 495,
  heatTempBottom: 488,
};

const generateTempCurve = (): TempCurvePoint[] => {
  const points: TempCurvePoint[] = [];
  for (let i = 0; i <= 20; i++) {
    points.push({ time: i, temp: 25 + i * 11.25, phase: 'heating' });
  }
  for (let i = 21; i <= 44; i++) {
    points.push({ time: i, temp: 248 + Math.random() * 4 - 2, phase: 'holding' });
  }
  for (let i = 45; i <= 60; i++) {
    const t = 60 - i;
    points.push({ time: i, temp: 250 - t * 14.06, phase: 'cooling' });
  }
  return points;
};

const computeStatus = (state: Omit<ProductionState, 'computeProcessStatus' | 'resetAllData'>): ProcessStatus => {
  return {
    casting: {
      active: state.castBillets.filter(b => b.status === 'pending').length,
      completed: state.castBillets.filter(b => b.status === 'qualified').length,
      pending: state.castBillets.filter(b => b.status === 'pending').length,
    },
    die: {
      available: state.dies.filter(d => d.status === 'available').length,
      onMachine: state.dies.filter(d => d.status === 'onMachine').length,
      repair: state.dies.filter(d => d.status === 'repair').length,
    },
    extrusion: {
      running: state.extrusionBatches.filter(b => b.status === 'running').length,
      completed: state.extrusionBatches.filter(b => b.status === 'completed').length,
      pending: state.extrusionBatches.filter(b => b.status === 'pending').length,
    },
    quenching: {
      active: state.quenchingRecords.filter(q => !q.endTime).length,
      completed: state.quenchingRecords.filter(q => q.endTime).length,
    },
    aging: {
      heating: state.agingRecords.filter(a => a.status === 'heating').length,
      holding: state.agingRecords.filter(a => a.status === 'holding').length,
      cooling: state.agingRecords.filter(a => a.status === 'cooling').length,
      completed: state.agingRecords.filter(a => a.status === 'completed').length,
    },
    surface: {
      oxidation: state.surfaceRecords.filter(s => s.processType === 'oxidation').length,
      spraying: state.surfaceRecords.filter(s => s.processType === 'spraying').length,
      completed: state.surfaceRecords.length,
    },
    packaging: {
      today: state.packageRecords.filter(p => p.warehouseTime.startsWith(formatDate(new Date()))).length,
      thisWeek: state.packageRecords.length,
      pending: state.extrusionBatches.filter(b => b.status === 'completed').length,
    },
  };
};

const initialState = {
  castBillets: mockCastBillets,
  dies: mockDies,
  dieUsageRecords: mockDieUsageRecords,
  extrusionBatches: mockExtrusionBatches,
  quenchingRecords: mockQuenchingRecords,
  agingRecords: mockAgingRecords,
  surfaceRecords: mockSurfaceRecords,
  packageRecords: mockPackageRecords,
  kpiData: mockKPIData,
  processStatus: mockProcessStatus,
  realtimeData: initialRealtimeData,
};

export const useProductionStore = create<ProductionState>()(
  persist(
    (set, get) => ({
      ...initialState,

      addCastBillet: (billet) => {
        const newBillet = { ...billet, id: generateId('cb') };
        set((state) => ({
          castBillets: [...state.castBillets, newBillet],
        }));
        get().computeProcessStatus();
      },

      updateCastBillet: (id, data) =>
        set((state) => ({
          castBillets: state.castBillets.map((b) =>
            b.id === id ? { ...b, ...data } : b
          ),
        })),

      addDie: (die) => {
        const newDie = { ...die, id: generateId('d') };
        set((state) => ({
          dies: [...state.dies, newDie],
        }));
        get().computeProcessStatus();
      },

      updateDie: (id, data) =>
        set((state) => ({
          dies: state.dies.map((d) => (d.id === id ? { ...d, ...data } : d)),
        })),

      addDieUsageRecord: (record) => {
        set((state) => ({
          dieUsageRecords: [
            ...state.dieUsageRecords,
            { ...record, id: generateId('dur') },
          ],
        }));
        get().computeProcessStatus();
      },

      updateDieUsageRecord: (id, data) =>
        set((state) => ({
          dieUsageRecords: state.dieUsageRecords.map((r) =>
            r.id === id ? { ...r, ...data } : r
          ),
        })),

      addDieRepairRecord: (dieId, note) => {
        set((state) => ({
          dies: state.dies.map((d) =>
            d.id === dieId ? { ...d, status: 'repair' as const, lastMaintenance: formatDate(new Date()) } : d
          ),
        }));
        get().computeProcessStatus();
      },

      mountDieToMachine: (dieId, machineNo, operator) => {
        const now = new Date();
        set((state) => {
          const die = state.dies.find(d => d.id === dieId);
          if (!die) return state;
          return {
            dies: state.dies.map((d) =>
              d.id === dieId ? { ...d, status: 'onMachine' as const } : d
            ),
            dieUsageRecords: [
              ...state.dieUsageRecords,
              {
                id: generateId('dur'),
                dieId,
                dieNumber: die.dieNumber,
                machineNo,
                upTime: formatDateTime(now),
                extrusionWeight: 0,
                wearCondition: '正常',
                operator,
              },
            ],
          };
        });
        get().computeProcessStatus();
      },

      unmountDieFromMachine: (recordId, extrusionWeight, wearCondition) => {
        const now = new Date();
        set((state) => {
          const record = state.dieUsageRecords.find(r => r.id === recordId);
          if (!record) return state;
          const die = state.dies.find(d => d.id === record.dieId);
          if (!die) return state;
          return {
            dies: state.dies.map((d) =>
              d.id === record.dieId
                ? { 
                    ...d, 
                    status: 'available' as const,
                    machineCount: d.machineCount + 1,
                    totalWeight: d.totalWeight + extrusionWeight,
                  }
                : d
            ),
            dieUsageRecords: state.dieUsageRecords.map((r) =>
              r.id === recordId
                ? { ...r, downTime: formatDateTime(now), extrusionWeight, wearCondition }
                : r
            ),
          };
        });
        get().computeProcessStatus();
      },

      addExtrusionBatch: (batch) => {
        const newBatch = { ...batch, id: generateId('eb') };
        set((state) => ({
          extrusionBatches: [...state.extrusionBatches, newBatch],
        }));
        get().computeProcessStatus();
      },

      updateExtrusionBatch: (id, data) =>
        set((state) => ({
          extrusionBatches: state.extrusionBatches.map((b) =>
            b.id === id ? { ...b, ...data } : b
          ),
        })),

      addQuenchingRecord: (record) => {
        set((state) => ({
          quenchingRecords: [
            ...state.quenchingRecords,
            { ...record, id: generateId('qr') },
          ],
        }));
        get().computeProcessStatus();
      },

      addAgingRecord: (record) => {
        const newRecord = {
          ...record,
          id: generateId('ar'),
          tempCurve: record.tempCurve && record.tempCurve.length > 0 ? record.tempCurve : generateTempCurve(),
        };
        set((state) => ({
          agingRecords: [...state.agingRecords, newRecord],
        }));
        get().computeProcessStatus();
      },

      updateAgingRecord: (id, data) =>
        set((state) => ({
          agingRecords: state.agingRecords.map((r) =>
            r.id === id ? { ...r, ...data } : r
          ),
        })),

      addSurfaceRecord: (record) => {
        set((state) => ({
          surfaceRecords: [
            ...state.surfaceRecords,
            { ...record, id: generateId('sr') },
          ],
        }));
        get().computeProcessStatus();
      },

      addPackageRecord: (record) => {
        set((state) => ({
          packageRecords: [
            ...state.packageRecords,
            { ...record, id: generateId('pr') },
          ],
        }));
        get().computeProcessStatus();
      },

      updateRealtimeData: () =>
        set((state) => ({
          realtimeData: {
            timestamp: new Date().toISOString(),
            extrusionSpeed: +(state.realtimeData.extrusionSpeed + (Math.random() - 0.5) * 1).toFixed(1),
            exitTemp: Math.round(state.realtimeData.exitTemp + (Math.random() - 0.5) * 3),
            cylinderPressure: +(state.realtimeData.cylinderPressure + (Math.random() - 0.5) * 0.5).toFixed(1),
            heatTempTop: Math.round(state.realtimeData.heatTempTop + (Math.random() - 0.5) * 2),
            heatTempMid: Math.round(state.realtimeData.heatTempMid + (Math.random() - 0.5) * 2),
            heatTempBottom: Math.round(state.realtimeData.heatTempBottom + (Math.random() - 0.5) * 2),
          },
        })),

      manualRefreshRealtime: (batchId) => {
        const batch = get().extrusionBatches.find(b => b.id === batchId);
        if (!batch) return;
        
        const baseTemp = 480 + Math.random() * 20;
        const newData = {
          timestamp: new Date().toISOString(),
          extrusionSpeed: +(12 + Math.random() * 6).toFixed(1),
          exitTemp: Math.round(510 + Math.random() * 25),
          cylinderPressure: +(20 + Math.random() * 6).toFixed(1),
          heatTempTop: Math.round(baseTemp + Math.random() * 8),
          heatTempMid: Math.round(baseTemp + 5 + Math.random() * 8),
          heatTempBottom: Math.round(baseTemp - 3 + Math.random() * 8),
        };

        set({ realtimeData: newData });

        if (batch.status === 'running') {
          get().updateExtrusionBatch(batchId, {
            heatTempTop: newData.heatTempTop,
            heatTempMid: newData.heatTempMid,
            heatTempBottom: newData.heatTempBottom,
            extrusionSpeed: newData.extrusionSpeed,
            exitTemp: newData.exitTemp,
            cylinderPressure: newData.cylinderPressure,
          });
        }
      },

      computeProcessStatus: () => {
        const state = get();
        const newStatus = computeStatus(state);
        set({ processStatus: newStatus });
      },

      resetAllData: () => {
        set(initialState);
        localStorage.removeItem('aluminum-mes-storage');
        get().computeProcessStatus();
      },
    }),
    {
      name: 'aluminum-mes-storage',
      partialize: (state) => ({
        castBillets: state.castBillets,
        dies: state.dies,
        dieUsageRecords: state.dieUsageRecords,
        extrusionBatches: state.extrusionBatches,
        quenchingRecords: state.quenchingRecords,
        agingRecords: state.agingRecords,
        surfaceRecords: state.surfaceRecords,
        packageRecords: state.packageRecords,
        kpiData: state.kpiData,
      }),
    }
  )
);
