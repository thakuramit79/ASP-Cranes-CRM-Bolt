export type LeadStatus = 'new' | 'in_process' | 'qualified' | 'unqualified' | 'won' | 'lost';

type DealStatus = 'qualification' | 'proposal' | 'negotiation' | 'won' | 'lost';

export interface Customer {
  id: string;
  customerId: string;  // Unique business identifier
  name: string;
  email: string;
  phone: string;
  address: string;
  createdAt?: string;
  updatedAt?: string;
}

export interface Contact {
  id: string;
  customerId: string;
  name: string;
  email: string;
  phone: string;
  role: string;
}

interface Deal {
  id: string;
  leadId: string;
  customerId: string;
  contactId: string;
  status: DealStatus;
  value: number;
  expectedCloseDate: string;
  notes?: string;
  createdAt: string;
  updatedAt: string;
}

export interface Lead {
  id: string;
  customerId?: string;
  customerName: string;
  companyName?: string;
  email: string;
  phone: string;
  serviceNeeded: string;
  siteLocation: string;
  startDate: string;
  rentalDays: number;
  shiftTiming: string;
  status: LeadStatus;
  assignedTo: string;
  createdAt: string;
  updatedAt: string;
  files?: string[];
  notes?: string;
}