export type CraneCategory = 'mobile_crane' | 'tower_crane' | 'crawler_crane' | 'pick_and_carry_crane';

export interface Equipment {
  id: string;
  name: string;
  category: CraneCategory;
  manufacturingDate: string; // YYYY-MM format
  registrationDate: string; // YYYY-MM format
  maxLiftingCapacity: number; // in tons
  unladenWeight: number; // in tons
  baseRate: number; // per hour
  runningCostPerKm: number;
  description?: string;
  status: 'available' | 'in_use' | 'maintenance';
  createdAt: string;
  updatedAt: string;
}