export interface Equipment {
  id: string;
  name: string;
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