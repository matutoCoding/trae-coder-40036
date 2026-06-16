import { create } from 'zustand';
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
  addExtrusionBatch: (batch: Omit<ExtrusionBatch, 'id'>) => void;
  updateExtrusionBatch: (id: string, data: Partial<ExtrusionBatch>) => void;
  addQuenchingRecord: (record: Omit<QuenchingRecord, 'id'>) => void;
  addAgingRecord: (record: Omit<AgingRecord, 'id'>) => void;
  updateAgingRecord: (id: string, data: Partial<AgingRecord>) => void;
  addSurfaceRecord: (record: Omit<SurfaceRecord, 'id'>) => void;
  addPackageRecord: (record: Omit<PackageRecord, 'id'>) => void;
  updateRealtimeData: () => void;
}

const generateId = (prefix: string) => {
  return `${prefix}${Date.now()}${Math.floor(Math.random() * 1000)}`;
};

const initialRealtimeData: RealtimeData = {
  timestamp: new Date().toISOString(),
  extrusionSpeed: 15.2,
  exitTemp: 525,
  cylinderPressure: 24.1,
  heatTempTop: 492,
  heatTempMid: 495,
  heatTempBottom: 488,
};

export const useProductionStore = create<ProductionState>((set) => ({
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

  addCastBillet: (billet) =>
    set((state) => ({
      castBillets: [...state.castBillets, { ...billet, id: generateId('cb') }],
    })),

  updateCastBillet: (id, data) =>
    set((state) => ({
      castBillets: state.castBillets.map((b) =>
        b.id === id ? { ...b, ...data } : b
      ),
    })),

  addDie: (die) =>
    set((state) => ({
      dies: [...state.dies, { ...die, id: generateId('d') }],
    })),

  updateDie: (id, data) =>
    set((state) => ({
      dies: state.dies.map((d) => (d.id === id ? { ...d, ...data } : d)),
    })),

  addDieUsageRecord: (record) =>
    set((state) => ({
      dieUsageRecords: [
        ...state.dieUsageRecords,
        { ...record, id: generateId('dur') },
      ],
    })),

  addExtrusionBatch: (batch) =>
    set((state) => ({
      extrusionBatches: [
        ...state.extrusionBatches,
        { ...batch, id: generateId('eb') },
      ],
    })),

  updateExtrusionBatch: (id, data) =>
    set((state) => ({
      extrusionBatches: state.extrusionBatches.map((b) =>
        b.id === id ? { ...b, ...data } : b
      ),
    })),

  addQuenchingRecord: (record) =>
    set((state) => ({
      quenchingRecords: [
        ...state.quenchingRecords,
        { ...record, id: generateId('qr') },
      ],
    })),

  addAgingRecord: (record) =>
    set((state) => ({
      agingRecords: [
        ...state.agingRecords,
        { ...record, id: generateId('ar') },
      ],
    })),

  updateAgingRecord: (id, data) =>
    set((state) => ({
      agingRecords: state.agingRecords.map((r) =>
        r.id === id ? { ...r, ...data } : r
      ),
    })),

  addSurfaceRecord: (record) =>
    set((state) => ({
      surfaceRecords: [
        ...state.surfaceRecords,
        { ...record, id: generateId('sr') },
      ],
    })),

  addPackageRecord: (record) =>
    set((state) => ({
      packageRecords: [
        ...state.packageRecords,
        { ...record, id: generateId('pr') },
      ],
    })),

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
}));
