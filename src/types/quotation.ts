export interface QuotationInputs {
  baseRate: number;
  workingHours: number;
  rentalDays: number;
  foodCharge: number;
  accomCharge: number;
  numResources: number;
  usagePercent: number;
  elongationPercent: number;
  commercialCharge: number;
  riskPercent: number;
  incidentalCharge: number;
  otherCharge: number;
}

export interface Quotation extends QuotationInputs {
  id: string;
  leadId: string;
  customerId: string;
  customerName: string;
  totalRent: number;
  version: number;
  createdAt: string;
  updatedAt: string;
  createdBy: string;
}