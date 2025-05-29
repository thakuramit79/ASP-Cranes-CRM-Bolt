export type JobStatus = 'scheduled' | 'accepted' | 'rejected' | 'in_progress' | 'completed';

export interface Equipment {
  id: string;
  name: string;
  type: string;
  description: string;
  baseRate: number;
}

export interface Operator {
  id: string;
  name: string;
  email: string;
  phone: string;
  specialization: string;
}

export interface Job {
  id: string;
  leadId: string;
  customerName: string;
  equipmentId: string;
  operatorId: string;
  startDate: string;
  endDate: string;
  location: string;
  status: JobStatus;
  notes?: string;
  createdAt: string;
  updatedAt: string;
}