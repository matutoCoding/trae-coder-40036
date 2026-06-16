import { create } from 'zustand';
import { persist } from 'zustand/middleware';
import type {
  CastBillet,
  Die,
  DieUsageRecord,
  DieHistoryRecord,
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
  mockDieHistoryRecords,
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
  dieHistoryRecords: DieHistoryRecord[];
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
  addDieHistoryRecord: (record: Omit<DieHistoryRecord, 'id'>) => void;
  addDieRepairRecord: (dieId: string, note: string) => void;
  mountDieToMachine: (dieId: string, machineNo: string, operator: string) => void;
  unmountDieFromMachine: (recordId: string, extrusionWeight: number, wearCondition: string) => void;
  completeDieRepair: (dieId: string) => void;
  addExtrusionBatch: (batch: Omit<ExtrusionBatch, 'id'>) => void;
  updateExtrusionBatch: (id: string, data: Partial<ExtrusionBatch>) => void;
  completeExtrusionBatch: (id: string, outputWeight: number) => void;
  addQuenchingRecord: (record: Omit<QuenchingRecord, 'id'>) => void;
  updateQuenchingRecord: (id: string, data: Partial<QuenchingRecord>) => void;
  startQuenching: (id: string, operator: string) => void;
  completeQuenching: (id: string, data: { airTemp: number; airSpeed: number; zone1Temp: number; zone2Temp: number; zone3Temp: number; coolingRate: number; hardness: number }) => void;
  addAgingRecord: (record: Omit<AgingRecord, 'id'>) => void;
  updateAgingRecord: (id: string, data: Partial<AgingRecord>) => void;
  createAgingFromQuenching: (quenchingId: string, furnaceNo: string, chargeAmount: number, operator: string) => void;
  completeAging: (id: string) => void;
  addSurfaceRecord: (record: Omit<SurfaceRecord, 'id'>) => void;
  updateSurfaceRecord: (id: string, data: Partial<SurfaceRecord>) => void;
  createSurfaceFromAging: (agingId: string, processType: 'oxidation' | 'spraying', operator: string) => void;
  completeSurfaceRecord: (id: string, data: Partial<SurfaceRecord>) => void;
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
  dieHistoryRecords: mockDieHistoryRecords,
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
          dieHistoryRecords: [
            ...state.dieHistoryRecords,
            {
              id: generateId('dh'),
              dieId: newDie.id,
              dieNumber: newDie.dieNumber,
              type: 'create' as const,
              title: '模具入库',
              description: `新模具入库，型号 ${newDie.model}，规格 ${newDie.specification}`,
              operator: '仓管员',
              timestamp: formatDateTime(new Date()),
              statusAfter: newDie.status,
            },
          ],
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

      addDieHistoryRecord: (record) => {
        set((state) => ({
          dieHistoryRecords: [
            ...state.dieHistoryRecords,
            { ...record, id: generateId('dh') },
          ],
        }));
      },

      addDieRepairRecord: (dieId, note) => {
        const now = new Date();
        set((state) => {
          const die = state.dies.find(d => d.id === dieId);
          if (!die) return state;
          return {
            dies: state.dies.map((d) =>
              d.id === dieId ? { ...d, status: 'repair' as const, lastMaintenance: formatDate(now) } : d
            ),
            dieHistoryRecords: [
              ...state.dieHistoryRecords,
              {
                id: generateId('dh'),
                dieId,
                dieNumber: die.dieNumber,
                type: 'repair_start' as const,
                title: '送修保养',
                description: note || '模具送修保养',
                operator: '维修工',
                timestamp: formatDateTime(now),
                statusBefore: die.status,
                statusAfter: 'repair',
                repairNote: note,
              },
            ],
          };
        });
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
            dieHistoryRecords: [
              ...state.dieHistoryRecords,
              {
                id: generateId('dh'),
                dieId,
                dieNumber: die.dieNumber,
                type: 'mount' as const,
                title: '模具上机',
                description: `在 ${machineNo} 上机，操作人员 ${operator}`,
                operator,
                timestamp: formatDateTime(now),
                statusBefore: die.status,
                statusAfter: 'onMachine',
                machineNo,
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
            dieHistoryRecords: [
              ...state.dieHistoryRecords,
              {
                id: generateId('dh'),
                dieId: record.dieId,
                dieNumber: record.dieNumber,
                type: 'unmount' as const,
                title: '模具下机',
                description: `挤压完成下机，挤压重量 ${extrusionWeight}吨，磨损情况：${wearCondition}`,
                operator: record.operator,
                timestamp: formatDateTime(now),
                statusBefore: 'onMachine',
                statusAfter: 'available',
                machineNo: record.machineNo,
                extrusionWeight,
                wearCondition,
              },
            ],
          };
        });
        get().computeProcessStatus();
      },

      completeDieRepair: (dieId) => {
        const now = new Date();
        set((state) => {
          const die = state.dies.find(d => d.id === dieId);
          if (!die) return state;
          return {
            dies: state.dies.map((d) =>
              d.id === dieId ? { ...d, status: 'available' as const, lastMaintenance: formatDate(now) } : d
            ),
            dieHistoryRecords: [
              ...state.dieHistoryRecords,
              {
                id: generateId('dh'),
                dieId,
                dieNumber: die.dieNumber,
                type: 'repair_complete' as const,
                title: '维修完成',
                description: '模具维修保养完成，恢复待用状态',
                operator: '维修工',
                timestamp: formatDateTime(now),
                statusBefore: die.status,
                statusAfter: 'available',
              },
            ],
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

      completeExtrusionBatch: (id, outputWeight) => {
        const now = new Date();
        set((state) => {
          const batch = state.extrusionBatches.find(b => b.id === id);
          if (!batch || batch.status !== 'running') return state;
          
          const updatedBatch = {
            ...batch,
            status: 'completed' as const,
            endTime: formatDateTime(now),
            outputWeight,
          };
          
          const newQuenching: Omit<QuenchingRecord, 'id'> = {
            batchId: batch.id,
            batchNumber: batch.batchNumber,
            profileType: batch.profileType,
            outputWeight: outputWeight,
            sourceMachineNo: batch.machineNo,
            status: 'pending',
            airTemp: 0,
            airSpeed: 0,
            zone1Temp: 0,
            zone2Temp: 0,
            zone3Temp: 0,
            coolingRate: 0,
            hardness: 0,
            startTime: '',
            operator: '',
          };
          
          return {
            extrusionBatches: state.extrusionBatches.map(b =>
              b.id === id ? updatedBatch : b
            ),
            quenchingRecords: [
              ...state.quenchingRecords,
              { ...newQuenching, id: generateId('qr') },
            ],
          };
        });
        get().computeProcessStatus();
      },

      addQuenchingRecord: (record) => {
        set((state) => ({
          quenchingRecords: [
            ...state.quenchingRecords,
            { ...record, id: generateId('qr') },
          ],
        }));
        get().computeProcessStatus();
      },

      updateQuenchingRecord: (id, data) =>
        set((state) => ({
          quenchingRecords: state.quenchingRecords.map((r) =>
            r.id === id ? { ...r, ...data } : r
          ),
        })),

      startQuenching: (id, operator) => {
        const now = new Date();
        set((state) => {
          const record = state.quenchingRecords.find(r => r.id === id);
          if (!record || record.status !== 'pending') return state;
          return {
            quenchingRecords: state.quenchingRecords.map(r =>
              r.id === id ? {
                ...r,
                status: 'processing' as const,
                startTime: formatDateTime(now),
                operator,
                airTemp: 28 + Math.random() * 4,
                airSpeed: 16 + Math.random() * 4,
                zone1Temp: 250 + Math.random() * 10,
                zone2Temp: 170 + Math.random() * 10,
                zone3Temp: 100 + Math.random() * 8,
              } : r
            ),
          };
        });
        get().computeProcessStatus();
      },

      completeQuenching: (id, data) => {
        const now = new Date();
        set((state) => {
          const record = state.quenchingRecords.find(r => r.id === id);
          if (!record || (record.status !== 'processing' && record.status !== 'pending')) return state;
          const coolingRate = 35 + Math.random() * 15;
          const hardness = 11 + Math.random() * 4;
          return {
            quenchingRecords: state.quenchingRecords.map(r =>
              r.id === id ? {
                ...r,
                status: 'completed' as const,
                endTime: formatDateTime(now),
                airTemp: data.airTemp,
                airSpeed: data.airSpeed,
                zone1Temp: data.zone1Temp,
                zone2Temp: data.zone2Temp,
                zone3Temp: data.zone3Temp,
                coolingRate: data.coolingRate || coolingRate,
                hardness: data.hardness || hardness,
              } : r
            ),
          };
        });
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

      createAgingFromQuenching: (quenchingId, furnaceNo, chargeAmount, operator) => {
        const now = new Date();
        set((state) => {
          const q = state.quenchingRecords.find(r => r.id === quenchingId);
          if (!q || q.status !== 'completed') return state;
          const batch = state.extrusionBatches.find(b => b.id === q.batchId);
          const newAging: Omit<AgingRecord, 'id'> = {
            batchId: q.batchId,
            batchNumber: q.batchNumber,
            profileType: q.profileType || batch?.profileType,
            outputWeight: q.outputWeight,
            quenchingRecordId: q.id,
            furnaceNo,
            chargeAmount,
            startTime: formatDateTime(now),
            tempCurve: [],
            heatingRate: 60,
            holdingTemp: 248,
            holdingTime: 240,
            coolingRate: 40,
            operator,
            status: 'heating',
          };
          return {
            agingRecords: [...state.agingRecords, { ...newAging, id: generateId('ar'), tempCurve: generateTempCurve() }],
          };
        });
        get().computeProcessStatus();
      },

      completeAging: (id) => {
        const now = new Date();
        set((state) => ({
          agingRecords: state.agingRecords.map(r =>
            r.id === id ? {
              ...r,
              status: 'completed' as const,
              endTime: formatDateTime(now),
            } : r
          ),
        }));
        get().computeProcessStatus();
      },

      addSurfaceRecord: (record) => {
        set((state) => ({
          surfaceRecords: [
            ...state.surfaceRecords,
            { ...record, id: generateId('sr') },
          ],
        }));
        get().computeProcessStatus();
      },

      updateSurfaceRecord: (id, data) =>
        set((state) => ({
          surfaceRecords: state.surfaceRecords.map((r) =>
            r.id === id ? { ...r, ...data } : r
          ),
        })),

      createSurfaceFromAging: (agingId, processType, operator) => {
        const now = new Date();
        set((state) => {
          const a = state.agingRecords.find(r => r.id === agingId);
          if (!a || a.status !== 'completed') return state;
          const batch = state.extrusionBatches.find(b => b.id === a.batchId);
          const newSurface: Omit<SurfaceRecord, 'id'> = {
            batchId: a.batchId,
            batchNumber: a.batchNumber,
            profileType: a.profileType || batch?.profileType,
            outputWeight: a.outputWeight,
            agingRecordId: a.id,
            processType,
            status: 'processing',
            bathTemp: processType === 'oxidation' ? 19 + Math.random() * 3 : 22 + Math.random() * 3,
            voltage: processType === 'oxidation' ? 13 + Math.random() * 2 : 0,
            current: processType === 'oxidation' ? 1180 + Math.random() * 50 : 0,
            processTime: processType === 'oxidation' ? 33 + Math.random() * 5 : 20 + Math.random() * 5,
            filmThickness: processType === 'oxidation' ? 10.5 + Math.random() * 2.5 : 60 + Math.random() * 15,
            color: processType === 'oxidation' ? '银白' : '哑光白',
            adhesion: 0.5,
            pretreatment: processType === 'oxidation' ? '脱脂→碱洗→酸洗→中和' : '前处理→钝化',
            operator,
            date: formatDate(now),
          };
          return {
            surfaceRecords: [...state.surfaceRecords, { ...newSurface, id: generateId('sr') }],
          };
        });
        get().computeProcessStatus();
      },

      completeSurfaceRecord: (id, data) => {
        const now = new Date();
        set((state) => ({
          surfaceRecords: state.surfaceRecords.map(r =>
            r.id === id ? {
              ...r,
              ...data,
              status: 'completed' as const,
              date: formatDate(now),
            } : r
          ),
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
        dieHistoryRecords: state.dieHistoryRecords,
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
