
import { Branch } from './types';

export const BASELINE_DATE = '2026-01-12';

export const NICK_UT_BASELINE = {
  [Branch.MBR]: { revenue: 335711, count: 37 },
  [Branch.FCB]: { revenue: 64495, count: 10 },
  [Branch.HPSK]: { revenue: 63420, count: 9 },
  [Branch.TSB]: { revenue: 81335, count: 7 },
};

export const JOEY_UT_BASELINE = {
  [Branch.HSV]: { revenue: 86641, count: 20 },
  [Branch.KTV_SKB]: { revenue: 58866, count: 6 },
  [Branch.SHO]: { revenue: 68181, count: 8 },
  [Branch.HKS]: { revenue: 28240, count: 4 },
};

export const BOND_BASELINE = {
  JOEY: 105128,
  NICK: 38949,
  TOTAL: 144077
};

export const CPI_BASELINE = 26994;
export const ELC_BASELINE = 2000;
