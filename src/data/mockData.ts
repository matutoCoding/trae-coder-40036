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
  TempCurvePoint,
} from './types';

const today = new Date();
const formatDate = (d: Date) => d.toISOString().split('T')[0];
const formatDateTime = (d: Date) => d.toISOString().slice(0, 16).replace('T', ' ');

const offsetHours = (h: number) => {
  const d = new Date(today);
  d.setHours(d.getHours() - h);
  return d;
};

export const mockCastBillets: CastBillet[] = [
  {
    id: 'cb001',
    batchNumber: 'ZB20260617001',
    si: 0.52, fe: 0.31, cu: 0.18, mn: 0.08, mg: 0.85, cr: 0.02, zn: 0.05, ti: 0.04,
    status: 'qualified',
    castingDate: formatDate(offsetHours(24)),
    homogenizationTemp: 565,
    homogenizationTime: 8,
    weight: 3200,
  },
  {
    id: 'cb002',
    batchNumber: 'ZB20260617002',
    si: 0.48, fe: 0.28, cu: 0.20, mn: 0.10, mg: 0.92, cr: 0.03, zn: 0.04, ti: 0.05,
    status: 'qualified',
    castingDate: formatDate(offsetHours(20)),
    homogenizationTemp: 570,
    homogenizationTime: 7,
    weight: 3150,
  },
  {
    id: 'cb003',
    batchNumber: 'ZB20260617003',
    si: 0.55, fe: 0.33, cu: 0.16, mn: 0.07, mg: 0.80, cr: 0.02, zn: 0.06, ti: 0.03,
    status: 'qualified',
    castingDate: formatDate(offsetHours(16)),
    homogenizationTemp: 560,
    homogenizationTime: 9,
    weight: 3300,
  },
  {
    id: 'cb004',
    batchNumber: 'ZB20260617004',
    si: 0.62, fe: 0.42, cu: 0.15, mn: 0.06, mg: 0.75, cr: 0.01, zn: 0.08, ti: 0.02,
    status: 'unqualified',
    castingDate: formatDate(offsetHours(12)),
    homogenizationTemp: 555,
    homogenizationTime: 6,
    weight: 3250,
  },
  {
    id: 'cb005',
    batchNumber: 'ZB20260617005',
    si: 0.50, fe: 0.30, cu: 0.19, mn: 0.09, mg: 0.88, cr: 0.02, zn: 0.05, ti: 0.04,
    status: 'pending',
    castingDate: formatDate(offsetHours(6)),
    homogenizationTemp: 0,
    homogenizationTime: 0,
    weight: 3180,
  },
  {
    id: 'cb006',
    batchNumber: 'ZB20260617006',
    si: 0.49, fe: 0.29, cu: 0.17, mn: 0.09, mg: 0.90, cr: 0.02, zn: 0.04, ti: 0.05,
    status: 'qualified',
    castingDate: formatDate(offsetHours(30)),
    homogenizationTemp: 568,
    homogenizationTime: 8,
    weight: 3220,
  },
  {
    id: 'cb007',
    batchNumber: 'ZB20260617007',
    si: 0.53, fe: 0.32, cu: 0.21, mn: 0.08, mg: 0.86, cr: 0.03, zn: 0.05, ti: 0.04,
    status: 'qualified',
    castingDate: formatDate(offsetHours(36)),
    homogenizationTemp: 562,
    homogenizationTime: 8,
    weight: 3190,
  },
  {
    id: 'cb008',
    batchNumber: 'ZB20260617008',
    si: 0.51, fe: 0.30, cu: 0.18, mn: 0.08, mg: 0.87, cr: 0.02, zn: 0.05, ti: 0.04,
    status: 'pending',
    castingDate: formatDate(offsetHours(2)),
    homogenizationTemp: 0,
    homogenizationTime: 0,
    weight: 3210,
  },
];

export const mockDies: Die[] = [
  {
    id: 'd001', dieNumber: 'MJ-1001', model: '6063-01', specification: '120×80mm推拉窗',
    drawing: 'DWG-2026-0001', machineCount: 128, totalWeight: 156.5, status: 'available',
    lastMaintenance: formatDate(offsetHours(48)), maxMachineCount: 300,
  },
  {
    id: 'd002', dieNumber: 'MJ-1002', model: '6063-02', specification: '80系列平开门',
    drawing: 'DWG-2026-0002', machineCount: 245, totalWeight: 298.3, status: 'onMachine',
    lastMaintenance: formatDate(offsetHours(24)), maxMachineCount: 300,
  },
  {
    id: 'd003', dieNumber: 'MJ-1003', model: '6061-01', specification: '工业铝型材40×40',
    drawing: 'DWG-2026-0003', machineCount: 87, totalWeight: 105.2, status: 'available',
    lastMaintenance: formatDate(offsetHours(72)), maxMachineCount: 250,
  },
  {
    id: 'd004', dieNumber: 'MJ-1004', model: '6063-03', specification: '90系列推拉门',
    drawing: 'DWG-2026-0004', machineCount: 289, totalWeight: 348.6, status: 'repair',
    lastMaintenance: formatDate(offsetHours(12)), maxMachineCount: 300,
  },
  {
    id: 'd005', dieNumber: 'MJ-1005', model: '6063-04', specification: '60系列平开窗',
    drawing: 'DWG-2026-0005', machineCount: 156, totalWeight: 187.4, status: 'available',
    lastMaintenance: formatDate(offsetHours(36)), maxMachineCount: 300,
  },
  {
    id: 'd006', dieNumber: 'MJ-1006', model: '6061-02', specification: '散热器型材',
    drawing: 'DWG-2026-0006', machineCount: 198, totalWeight: 238.7, status: 'onMachine',
    lastMaintenance: formatDate(offsetHours(18)), maxMachineCount: 280,
  },
  {
    id: 'd007', dieNumber: 'MJ-1007', model: '6063-05', specification: '幕墙龙骨',
    drawing: 'DWG-2026-0007', machineCount: 312, totalWeight: 375.1, status: 'scrapped',
    lastMaintenance: formatDate(offsetHours(96)), maxMachineCount: 300,
  },
  {
    id: 'd008', dieNumber: 'MJ-1008', model: '6063-06', specification: '55系列断桥窗',
    drawing: 'DWG-2026-0008', machineCount: 76, totalWeight: 92.8, status: 'available',
    lastMaintenance: formatDate(offsetHours(60)), maxMachineCount: 300,
  },
  {
    id: 'd009', dieNumber: 'MJ-1009', model: '6063-07', specification: '阳光房主梁',
    drawing: 'DWG-2026-0009', machineCount: 54, totalWeight: 65.3, status: 'available',
    lastMaintenance: formatDate(offsetHours(84)), maxMachineCount: 250,
  },
  {
    id: 'd010', dieNumber: 'MJ-1010', model: '6061-03', specification: '自动化导轨',
    drawing: 'DWG-2026-0010', machineCount: 142, totalWeight: 171.5, status: 'repair',
    lastMaintenance: formatDate(offsetHours(6)), maxMachineCount: 280,
  },
];

export const mockDieUsageRecords: DieUsageRecord[] = [
  {
    id: 'dur001', dieId: 'd002', dieNumber: 'MJ-1002', machineNo: '挤压机01',
    upTime: formatDateTime(offsetHours(8)), extrusionWeight: 1.2, wearCondition: '正常',
    operator: '张师傅',
  },
  {
    id: 'dur002', dieId: 'd006', dieNumber: 'MJ-1006', machineNo: '挤压机02',
    upTime: formatDateTime(offsetHours(5)), extrusionWeight: 0.85, wearCondition: '正常',
    operator: '李师傅',
  },
  {
    id: 'dur003', dieId: 'd001', dieNumber: 'MJ-1001', machineNo: '挤压机01',
    upTime: formatDateTime(offsetHours(48)), downTime: formatDateTime(offsetHours(32)),
    extrusionWeight: 2.1, wearCondition: '轻微磨损', operator: '张师傅',
  },
  {
    id: 'dur004', dieId: 'd005', dieNumber: 'MJ-1005', machineNo: '挤压机03',
    upTime: formatDateTime(offsetHours(36)), downTime: formatDateTime(offsetHours(20)),
    extrusionWeight: 1.8, wearCondition: '正常', operator: '王师傅',
  },
];

export const mockDieHistoryRecords: DieHistoryRecord[] = [
  {
    id: 'dh001', dieId: 'd002', dieNumber: 'MJ-1002',
    type: 'mount', title: '模具上机',
    description: '在挤压机01上机，操作人员张师傅',
    operator: '张师傅', timestamp: formatDateTime(offsetHours(8)),
    statusBefore: 'available', statusAfter: 'onMachine',
    machineNo: '挤压机01',
  },
  {
    id: 'dh002', dieId: 'd006', dieNumber: 'MJ-1006',
    type: 'mount', title: '模具上机',
    description: '在挤压机02上机，操作人员李师傅',
    operator: '李师傅', timestamp: formatDateTime(offsetHours(5)),
    statusBefore: 'available', statusAfter: 'onMachine',
    machineNo: '挤压机02',
  },
  {
    id: 'dh003', dieId: 'd001', dieNumber: 'MJ-1001',
    type: 'mount', title: '模具上机',
    description: '在挤压机01上机，操作人员张师傅',
    operator: '张师傅', timestamp: formatDateTime(offsetHours(48)),
    statusBefore: 'available', statusAfter: 'onMachine',
    machineNo: '挤压机01',
  },
  {
    id: 'dh004', dieId: 'd001', dieNumber: 'MJ-1001',
    type: 'unmount', title: '模具下机',
    description: '挤压完成下机，挤压重量2.1吨，轻微磨损',
    operator: '张师傅', timestamp: formatDateTime(offsetHours(32)),
    statusBefore: 'onMachine', statusAfter: 'available',
    machineNo: '挤压机01', extrusionWeight: 2.1, wearCondition: '轻微磨损',
  },
  {
    id: 'dh005', dieId: 'd004', dieNumber: 'MJ-1004',
    type: 'repair_start', title: '送修保养',
    description: '工作带磨损严重，送修抛光',
    operator: '维修工', timestamp: formatDateTime(offsetHours(12)),
    statusBefore: 'available', statusAfter: 'repair',
    repairNote: '工作带抛光+氮化处理',
  },
  {
    id: 'dh006', dieId: 'd010', dieNumber: 'MJ-1010',
    type: 'repair_start', title: '送修保养',
    description: '导柱间隙过大，送修调整',
    operator: '维修工', timestamp: formatDateTime(offsetHours(6)),
    statusBefore: 'onMachine', statusAfter: 'repair',
    repairNote: '导柱更换+弹簧调整',
  },
  {
    id: 'dh007', dieId: 'd005', dieNumber: 'MJ-1005',
    type: 'mount', title: '模具上机',
    description: '在挤压机03上机，操作人员王师傅',
    operator: '王师傅', timestamp: formatDateTime(offsetHours(36)),
    statusBefore: 'available', statusAfter: 'onMachine',
    machineNo: '挤压机03',
  },
  {
    id: 'dh008', dieId: 'd005', dieNumber: 'MJ-1005',
    type: 'unmount', title: '模具下机',
    description: '挤压完成下机，挤压重量1.8吨，磨损正常',
    operator: '王师傅', timestamp: formatDateTime(offsetHours(20)),
    statusBefore: 'onMachine', statusAfter: 'available',
    machineNo: '挤压机03', extrusionWeight: 1.8, wearCondition: '正常',
  },
  {
    id: 'dh009', dieId: 'd007', dieNumber: 'MJ-1007',
    type: 'scrap', title: '模具报废',
    description: '超过设计寿命，裂纹严重，报废处理',
    operator: '主管', timestamp: formatDateTime(offsetHours(96)),
    statusBefore: 'available', statusAfter: 'scrapped',
  },
];

export const mockExtrusionBatches: ExtrusionBatch[] = [
  {
    id: 'eb001', batchNumber: 'JY20260617001', billetId: 'cb001', billetBatchNumber: 'ZB20260617001',
    dieId: 'd002', dieNumber: 'MJ-1002', machineNo: '挤压机01',
    heatTempTop: 485, heatTempMid: 490, heatTempBottom: 482,
    extrusionSpeed: 12.5, exitTemp: 518, cylinderPressure: 22.5,
    startTime: formatDateTime(offsetHours(6)), stretchRate: 1.2,
    straightnessBefore: 2.5, straightnessAfter: 0.3,
    operator: '张师傅', status: 'completed', profileType: '80系列平开门', outputWeight: 1200,
  },
  {
    id: 'eb002', batchNumber: 'JY20260617002', billetId: 'cb002', billetBatchNumber: 'ZB20260617002',
    dieId: 'd006', dieNumber: 'MJ-1006', machineNo: '挤压机02',
    heatTempTop: 492, heatTempMid: 495, heatTempBottom: 488,
    extrusionSpeed: 15.2, exitTemp: 525, cylinderPressure: 24.1,
    startTime: formatDateTime(offsetHours(4)), stretchRate: 1.0,
    straightnessBefore: 3.1, straightnessAfter: 0.2,
    operator: '李师傅', status: 'running', profileType: '散热器型材', outputWeight: 850,
  },
  {
    id: 'eb003', batchNumber: 'JY20260617003', billetId: 'cb003', billetBatchNumber: 'ZB20260617003',
    dieId: 'd001', dieNumber: 'MJ-1001', machineNo: '挤压机01',
    heatTempTop: 0, heatTempMid: 0, heatTempBottom: 0,
    extrusionSpeed: 0, exitTemp: 0, cylinderPressure: 0,
    startTime: '', stretchRate: 0,
    straightnessBefore: 0, straightnessAfter: 0,
    operator: '', status: 'pending', profileType: '120×80mm推拉窗', outputWeight: 0,
  },
  {
    id: 'eb004', batchNumber: 'JY20260617004', billetId: 'cb006', billetBatchNumber: 'ZB20260617006',
    dieId: 'd003', dieNumber: 'MJ-1003', machineNo: '挤压机03',
    heatTempTop: 478, heatTempMid: 482, heatTempBottom: 475,
    extrusionSpeed: 18.3, exitTemp: 512, cylinderPressure: 21.8,
    startTime: formatDateTime(offsetHours(10)), stretchRate: 1.5,
    straightnessBefore: 2.8, straightnessAfter: 0.4,
    operator: '王师傅', status: 'completed', profileType: '工业铝型材40×40', outputWeight: 1050,
  },
  {
    id: 'eb005', batchNumber: 'JY20260617005', billetId: 'cb007', billetBatchNumber: 'ZB20260617007',
    dieId: 'd005', dieNumber: 'MJ-1005', machineNo: '挤压机03',
    heatTempTop: 488, heatTempMid: 492, heatTempBottom: 485,
    extrusionSpeed: 13.8, exitTemp: 520, cylinderPressure: 23.2,
    startTime: formatDateTime(offsetHours(2)), stretchRate: 1.1,
    straightnessBefore: 0, straightnessAfter: 0,
    operator: '赵师傅', status: 'running', profileType: '60系列平开窗', outputWeight: 520,
  },
];

export const mockQuenchingRecords: QuenchingRecord[] = [
  {
    id: 'qr001', batchId: 'eb001', batchNumber: 'JY20260617001',
    status: 'completed',
    airTemp: 25, airSpeed: 18.5, zone1Temp: 245, zone2Temp: 168, zone3Temp: 95,
    coolingRate: 45, hardness: 12.5,
    startTime: formatDateTime(offsetHours(5)), endTime: formatDateTime(offsetHours(4.5)),
    operator: '陈工',
  },
  {
    id: 'qr002', batchId: 'eb004', batchNumber: 'JY20260617004',
    status: 'completed',
    airTemp: 26, airSpeed: 20.2, zone1Temp: 252, zone2Temp: 172, zone3Temp: 98,
    coolingRate: 48, hardness: 13.2,
    startTime: formatDateTime(offsetHours(9)), endTime: formatDateTime(offsetHours(8.5)),
    operator: '陈工',
  },
  {
    id: 'qr003', batchId: 'eb002', batchNumber: 'JY20260617002',
    status: 'processing',
    airTemp: 27, airSpeed: 19.8, zone1Temp: 248, zone2Temp: 165, zone3Temp: 92,
    coolingRate: 46, hardness: 0,
    startTime: formatDateTime(offsetHours(3)),
    operator: '陈工',
  },
];

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

export const mockAgingRecords: AgingRecord[] = [
  {
    id: 'ar001', batchId: 'eb001', batchNumber: 'JY20260617001',
    furnaceNo: '时效炉01', chargeAmount: 4.5,
    startTime: formatDateTime(offsetHours(3.5)),
    tempCurve: generateTempCurve(),
    heatingRate: 225, holdingTemp: 185, holdingTime: 240, coolingRate: 168,
    operator: '刘工', status: 'cooling',
  },
  {
    id: 'ar002', batchId: 'eb004', batchNumber: 'JY20260617004',
    furnaceNo: '时效炉02', chargeAmount: 3.8,
    startTime: formatDateTime(offsetHours(8)),
    endTime: formatDateTime(offsetHours(2)),
    tempCurve: generateTempCurve(),
    heatingRate: 230, holdingTemp: 180, holdingTime: 300, coolingRate: 172,
    operator: '刘工', status: 'completed',
  },
  {
    id: 'ar003', batchId: 'eb002', batchNumber: 'JY20260617002',
    furnaceNo: '时效炉01', chargeAmount: 0,
    startTime: '',
    tempCurve: [],
    heatingRate: 0, holdingTemp: 175, holdingTime: 360, coolingRate: 0,
    operator: '', status: 'pending',
  },
];

export const mockSurfaceRecords: SurfaceRecord[] = [
  {
    id: 'sr001', batchId: 'eb004', batchNumber: 'JY20260617004',
    processType: 'oxidation', status: 'completed',
    bathTemp: 20, voltage: 14, current: 1200,
    processTime: 35, filmThickness: 12, color: '银白', adhesion: 0,
    pretreatment: '碱洗+酸洗', operator: '周师傅', date: formatDate(offsetHours(1)),
  },
  {
    id: 'sr002', batchId: 'eb001', batchNumber: 'JY20260617001',
    processType: 'spraying', status: 'completed',
    bathTemp: 22, voltage: 80, current: 0,
    processTime: 20, filmThickness: 65, color: '哑光白', adhesion: 1,
    pretreatment: '磷化处理', operator: '吴师傅', date: formatDate(offsetHours(0.5)),
  },
];

export const mockPackageRecords: PackageRecord[] = [
  {
    id: 'pr001', batchId: 'eb004', batchNumber: 'JY20260617004',
    cutLength: 6000, pieceCount: 120, totalWeight: 1020,
    grade: 'A', frameNo: 'ZK-001',
    warehouseTime: formatDateTime(offsetHours(0.5)),
    operator: '孙师傅', customer: '华东建筑集团', orderNo: 'DD20260615-008',
  },
  {
    id: 'pr002', batchId: 'eb004', batchNumber: 'JY20260617004',
    cutLength: 3000, pieceCount: 80, totalWeight: 410,
    grade: 'A', frameNo: 'ZK-002',
    warehouseTime: formatDateTime(offsetHours(0.2)),
    operator: '孙师傅', customer: '华东建筑集团', orderNo: 'DD20260615-008',
  },
];

export const mockKPIData: KPIData = {
  todayOutput: 8.25,
  qualifiedRate: 97.8,
  equipmentOEE: 85.6,
  activeBatches: 5,
  anomalies: 2,
  energyConsumption: 12580,
  targetOutput: 10,
};

export const mockProcessStatus: ProcessStatus = {
  casting: { active: 1, completed: 5, pending: 2 },
  die: { available: 5, onMachine: 2, repair: 2 },
  extrusion: { running: 2, completed: 2, pending: 1 },
  quenching: { active: 1, completed: 2 },
  aging: { heating: 0, holding: 1, cooling: 1, completed: 1 },
  surface: { oxidation: 0, spraying: 1, completed: 1 },
  packaging: { today: 2, thisWeek: 15, pending: 3 },
};
