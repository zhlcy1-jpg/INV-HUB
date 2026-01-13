
export enum Branch {
  MBR = 'MBR',
  FCB = 'FCB',
  HPSK = 'HPSK',
  TSB = 'TSB',
  HSV = 'HSV',
  KTV_SKB = 'KTV+SKB',
  SHO = 'SHO',
  HKS = 'HKS'
}

export enum Advisor {
  NICK = 'Nick',
  JOEY = 'Joey'
}

export interface UTEntry {
  id: string;
  date: string;
  advisor: Advisor;
  branch: Branch;
  salesperson: string; // 新增
  revenue: number;
  count: number;
}

export interface BondEntry {
  id: string;
  date: string;
  advisor: Advisor;
  branch: Branch;
  salesperson: string; 
  product: string;
  dealAmount: number;
  currency: string; 
  revenue: number;
  customer: string;
  commissionRate?: number;
  isEli?: boolean;
}

export interface GenericIncomeEntry {
  id: string;
  date: string;
  type: 'CPI' | 'ELC';
  advisor: Advisor;
  branch: Branch;
  salesperson: string;
  revenue: number;
  dealAmount?: string;
}

export interface Database {
  utEntries: UTEntry[];
  bondEntries: BondEntry[];
  genericEntries: GenericIncomeEntry[];
}
