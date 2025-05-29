import { Quotation, QuotationInputs } from '../types/quotation';
import { db } from '../lib/firebase';
import { collection, addDoc, getDocs, query, where, orderBy, doc, getDoc, updateDoc } from 'firebase/firestore';
import { getLeadById } from './leadService';

const quotationsCollection = collection(db, 'quotations');

// Calculate total rent based on the form data
const calculateTotalRent = (formData: any): number => {
  const baseRate = getMachineBaseRate(formData.machineType);
  const workingHours = Number(formData.workingHours) || 0;
  const days = getDays(formData.orderType, workingHours);
  
  // Basic calculation
  const dailyRate = baseRate * workingHours;
  const basicRent = dailyRate * days;
  
  // Resource costs
  const foodResources = Number(formData.foodResources) || 0;
  const accomResources = Number(formData.accomResources) || 0;
  const resourceCosts = ((foodResources * 250) + (accomResources * 1000)) * days;
  
  // Usage and elongation factors
  const usageFactor = formData.usage === 'heavy' ? 1.2 : 1;
  const elongationCost = basicRent * 0.15;
  
  // Trailer cost based on distance
  const distance = Number(formData.siteDistance) || 0;
  const trailerCost = distance * 500; // Increased rate per km for Indian context
  
  // Risk adjustment
  const riskAdjustment = calculateRiskAdjustment(basicRent, formData.riskFactor);
  
  // Extra charges
  const extraCharges = (
    Number(formData.extraCharge) +
    Number(formData.incidentalCharges) +
    Number(formData.otherFactorsCharge)
  );
  
  // Subtotal
  const subtotal = (
    basicRent * usageFactor +
    elongationCost +
    resourceCosts +
    trailerCost +
    riskAdjustment +
    extraCharges
  );
  
  // GST
  const gstAmount = formData.billing === 'gst' ? subtotal * 0.18 : 0;
  
  // Total
  return Math.round(subtotal + gstAmount);
};

const getMachineBaseRate = (type: string): number => {
  switch (type) {
    case 'mobile_crane': return 15000;
    case 'tower_crane': return 25000;
    case 'crawler_crane': return 30000;
    case 'pick_and_carry': return 12000;
    default: return 0;
  }
};

const getDays = (orderType: string, workingHours: number): number => {
  switch (orderType) {
    case 'monthly': return 26;
    case 'yearly': return 312;
    default: return workingHours / 10;
  }
};

const calculateRiskAdjustment = (baseAmount: number, riskFactor: string): number => {
  switch (riskFactor) {
    case 'high': return baseAmount * 0.15;
    case 'medium': return baseAmount * 0.10;
    case 'low': return baseAmount * 0.05;
    default: return 0;
  }
};

// Get quotations for a lead
export const getQuotationsForLead = async (leadId: string): Promise<Quotation[]> => {
  const q = query(
    quotationsCollection,
    where('leadId', '==', leadId),
    orderBy('createdAt', 'desc')
  );
  
  const snapshot = await getDocs(q);
  return snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() } as Quotation));
};

// Get quotations for a customer
export const getQuotationsForCustomer = async (customerId: string): Promise<Quotation[]> => {
  const q = query(
    quotationsCollection,
    where('customerId', '==', customerId),
    orderBy('createdAt', 'desc')
  );
  
  const snapshot = await getDocs(q);
  return snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() } as Quotation));
};

// Get quotation by ID
export const getQuotationById = async (id: string): Promise<Quotation | null> => {
  const docRef = doc(quotationsCollection, id);
  const docSnap = await getDoc(docRef);
  
  if (!docSnap.exists()) return null;
  return { id: docSnap.id, ...docSnap.data() } as Quotation;
};

// Create quotation
export const createQuotation = async (quotationData: any): Promise<Quotation> => {
  try {
    // Get lead details to get customer information
    const lead = await getLeadById(quotationData.leadId);
    if (!lead) {
      throw new Error('Lead not found');
    }

    const totalRent = calculateTotalRent(quotationData);
    
    const newQuotation = {
      ...quotationData,
      customerId: lead.customerId || '',  // Add customer ID from lead
      customerName: lead.customerName,    // Add customer name from lead
      totalRent,
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
    };
    
    const docRef = await addDoc(quotationsCollection, newQuotation);
    return { id: docRef.id, ...newQuotation };
  } catch (error) {
    console.error('Error creating quotation:', error);
    throw error;
  }
};

// Update quotation
export const updateQuotation = async (
  id: string,
  updates: any
): Promise<Quotation | null> => {
  try {
    const docRef = doc(quotationsCollection, id);
    const docSnap = await getDoc(docRef);
    
    if (!docSnap.exists()) return null;
    
    const updatedData = {
      ...updates,
      totalRent: calculateTotalRent(updates),
      updatedAt: new Date().toISOString(),
    };
    
    await updateDoc(docRef, updatedData);
    return { id, ...docSnap.data(), ...updatedData };
  } catch (error) {
    console.error('Error updating quotation:', error);
    throw error;
  }
};