export interface CastBillet {
  id: string;
  batchNumber: string;
  si: number;
  fe: number;
  cu: number;
  mn: number;
  mg: number;
  cr: number;
  zn: number;
  ti: number;
  status: 'qualified' | 'unqualified' | 'pending';
  castingDate: string;
  homogenizationTemp: number;
  homogenizationTime: number;
  weight: number;
}

export interface Die {
  id: string;
  dieNumber: string;
  model: string;
  specification: string;
  drawing: string;
  machineCount: number;
  totalWeight: number;
  status: 'available' | 'onMachine' | 'repair' | 'scrapped';
  lastMaintenance: string;
  maxMachineCount: number;
}

export interface DieUsageRecord {
  id: string;
  dieId: string;
  dieNumber: string;
  machineNo: string;
  upTime: string;
  downTime?: string;
  extrusionWeight: number;
  wearCondition: string;
  operator: string;
}

export type DieHistoryType = 'mount' | 'unmount' | 'repair_start' | 'repair_complete' | 'create' | 'scrap' | 'maintenance';

export interface DieHistoryRecord {
  id: string;
  dieId: string;
  dieNumber: string;
  type: DieHistoryType;
  title: string;
  description: string;
  operator: string;
  timestamp: string;
  statusBefore?: string;
  statusAfter?: string;
  machineNo?: string;
  extrusionWeight?: number;
  wearCondition?: string;
  repairNote?: string;
}

export interface ExtrusionBatch {
  id: string;
  batchNumber: string;
  billetId: string;
  billetBatchNumber: string;
  dieId: string;
  dieNumber: string;
  machineNo: string;
  heatTempTop: number;
  heatTempMid: number;
  heatTempBottom: number;
  extrusionSpeed: number;
  exitTemp: number;
  cylinderPressure: number;
  startTime: string;
  endTime?: string;
  stretchRate: number;
  straightnessBefore: number;
  straightnessAfter: number;
  operator: string;
  status: 'pending' | 'running' | 'completed';
  profileType: string;
  outputWeight: number;
}

export interface QuenchingRecord {
  id: string;
  batchId: string;
  batchNumber: string;
  profileType?: string;
  outputWeight?: number;
  sourceMachineNo?: string;
  status: 'pending' | 'processing' | 'completed';
  airTemp: number;
  airSpeed: number;
  zone1Temp: number;
  zone2Temp: number;
  zone3Temp: number;
  coolingRate: number;
  hardness: number;
  startTime: string;
  endTime?: string;
  operator: string;
}

export interface TempCurvePoint {
  time: number;
  temp: number;
  phase: 'heating' | 'holding' | 'cooling';
}

export interface AgingRecord {
  id: string;
  batchId: string;
  batchNumber: string;
  profileType?: string;
  outputWeight?: number;
  quenchingRecordId?: string;
  furnaceNo: string;
  chargeAmount: number;
  startTime: string;
  endTime?: string;
  tempCurve: TempCurvePoint[];
  heatingRate: number;
  holdingTemp: number;
  holdingTime: number;
  coolingRate: number;
  operator: string;
  status: 'pending' | 'heating' | 'holding' | 'cooling' | 'completed';
}

export interface SurfaceRecord {
  id: string;
  batchId: string;
  batchNumber: string;
  profileType?: string;
  outputWeight?: number;
  agingRecordId?: string;
  processType: 'oxidation' | 'spraying';
  status: 'pending' | 'processing' | 'completed';
  bathTemp: number;
  voltage: number;
  current: number;
  processTime: number;
  filmThickness: number;
  color: string;
  adhesion: number;
  pretreatment: string;
  operator: string;
  date: string;
}

export interface PackageRecord {
  id: string;
  batchId: string;
  batchNumber: string;
  surfaceRecordId?: string;
  surfaceProcessType?: 'oxidation' | 'spraying';
  surfaceColor?: string;
  cutLength: number;
  pieceCount: number;
  totalWeight: number;
  grade: 'A' | 'B' | 'C';
  frameNo: string;
  warehouseTime: string;
  operator: string;
  customer: string;
  orderNo: string;
}

export interface KPIData {
  todayOutput: number;
  qualifiedRate: number;
  equipmentOEE: number;
  activeBatches: number;
  anomalies: number;
  energyConsumption: number;
  targetOutput: number;
}

export interface ProcessStatus {
  casting: { active: number; completed: number; pending: number };
  die: { available: number; onMachine: number; repair: number };
  extrusion: { running: number; completed: number; pending: number };
  quenching: { active: number; completed: number };
  aging: { heating: number; holding: number; cooling: number; completed: number };
  surface: { oxidation: number; spraying: number; completed: number };
  packaging: { today: number; thisWeek: number; pending: number };
}

export type ProcessStep = 'casting' | 'die' | 'extrusion' | 'quenching' | 'aging' | 'surface' | 'packaging';

export interface RealtimeData {
  timestamp: string;
  extrusionSpeed: number;
  exitTemp: number;
  cylinderPressure: number;
  heatTempTop: number;
  heatTempMid: number;
  heatTempBottom: number;
}
