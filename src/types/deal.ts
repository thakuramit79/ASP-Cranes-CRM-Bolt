export type DealStage = 'qualification' | 'proposal' | 'negotiation' | 'won' | 'lost';

export interface Deal {
  id: string;
  title: string;
  leadId: string;
  customerId: string;
  contactId: string;
  stage: DealStage;
  value: number;
  expectedCloseDate: string;
  notes?: string;
  createdAt: string;
  updatedAt: string;
  customer: {
    name: string;
    email: string;
  };
  contact: {
    name: string;
    email: string;
    role: string;
  };
}