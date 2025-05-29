import React, { useState, useEffect } from 'react';
import { 
  Calculator, 
  FileText, 
  Send, 
  Download,
  Clock,
  CheckCircle2,
  XCircle,
  AlertCircle,
  Building2,
  Truck,
  Users,
  Calendar,
  DollarSign
} from 'lucide-react';
import { Card, CardHeader, CardTitle, CardContent } from '../components/common/Card';
import { Input } from '../components/common/Input';
import { Button } from '../components/common/Button';
import { Select } from '../components/common/Select';
import { Modal } from '../components/common/Modal';
import { StatusBadge } from '../components/common/StatusBadge';
import { Toast } from '../components/common/Toast';
import { useAuthStore } from '../store/authStore';
import { Lead } from '../types/lead';
import { getLeads } from '../services/leadService';
import { createQuotation } from '../services/quotationService';

const ORDER_TYPES = [
  { value: 'micro', label: 'Micro' },
  { value: 'small', label: 'Small' },
  { value: 'monthly', label: 'Monthly' },
  { value: 'yearly', label: 'Yearly' },
];

const MACHINE_TYPES = [
  { value: 'mobile_crane', label: 'Mobile Crane' },
  { value: 'tower_crane', label: 'Tower Crane' },
  { value: 'crawler_crane', label: 'Crawler Crane' },
  { value: 'pick_and_carry', label: 'Pick & Carry Crane' },
];

const SHIFT_OPTIONS = [
  { value: 'single', label: 'Single Shift' },
  { value: 'double', label: 'Double Shift' },
];

const TIME_OPTIONS = [
  { value: 'day', label: 'Day' },
  { value: 'night', label: 'Night' },
];

const USAGE_OPTIONS = [
  { value: 'heavy', label: 'Heavy' },
  { value: 'light', label: 'Light' },
];

const DEAL_TYPES = [
  { value: 'no_advance', label: 'No Advance' },
  { value: 'credit', label: 'Credit' },
  { value: 'long_credit', label: 'Long Credit' },
];

const RISK_LEVELS = [
  { value: 'high', label: 'High Risk' },
  { value: 'medium', label: 'Medium Risk' },
  { value: 'low', label: 'Low Risk' },
];

const OTHER_FACTORS = [
  { value: 'area', label: 'Area' },
  { value: 'condition', label: 'Condition' },
  { value: 'customer_reputation', label: 'Customer Reputation' },
  { value: 'rigger', label: 'Rigger' },
  { value: 'helper', label: 'Helper' },
];

export function QuotationManagement() {
  const { user } = useAuthStore();
  const [leads, setLeads] = useState<Lead[]>([]);
  const [selectedLead, setSelectedLead] = useState<Lead | null>(null);
  const [isCreateModalOpen, setIsCreateModalOpen] = useState(false);
  const [isLoading, setIsLoading] = useState(true);
  const [toast, setToast] = useState<{
    show: boolean;
    title: string;
    description?: string;
    variant?: 'success' | 'error' | 'warning';
  }>({ show: false, title: '' });

  // Form state
  const [formData, setFormData] = useState({
    // H1 - Order Type
    orderType: 'micro',
    
    // H2 - Type of Machine
    machineType: '',
    
    // H3 - Hours
    workingHours: '',
    dayNight: 'day',
    shift: 'single',
    sundayWorking: 'no',
    
    // H4 - Accommodation
    foodResources: '',
    accomResources: '',
    
    // H5 - Usage
    usage: 'light',
    
    // H6 - Mob - Demob
    siteDistance: '',
    trailerCost: '',
    mobRelaxation: '',
    
    // H7 - Fuel
    workingCost: '',
    elongation: '',
    
    // H8 - Commercial
    dealType: 'no_advance',
    extraCharge: '',
    billing: 'gst',
    
    // H9 - Risk Factor
    riskFactor: 'low',
    
    // H10 - Incidental Charge
    incidentalCharges: '',
    
    // H11 - Other Factors
    otherFactors: '',
    otherFactorsCharge: '',
  });

  // Calculated values
  const [calculations, setCalculations] = useState({
    baseRate: 0,
    totalHours: 0,
    workingCost: 0,
    elongationCost: 0,
    trailerCost: 0,
    foodAccomCost: 0,
    usageLoadFactor: 0,
    extraCharges: 0,
    riskAdjustment: 0,
    gstAmount: 0,
    totalAmount: 0,
  });

  useEffect(() => {
    fetchLeads();
  }, []);

  useEffect(() => {
    calculateQuotation();
  }, [formData]);

  const fetchLeads = async () => {
    try {
      const data = await getLeads();
      setLeads(data.filter(lead => lead.status === 'won'));
      setIsLoading(false);
    } catch (error) {
      console.error('Error fetching leads:', error);
      showToast('Error fetching leads', 'error');
    }
  };

  const calculateQuotation = () => {
    // Base calculations
    const baseRate = getMachineBaseRate(formData.machineType);
    const workingHours = calculateWorkingHours();
    const workingCost = baseRate * workingHours;
    
    // Usage factor
    const usageFactor = formData.usage === 'heavy' ? 1.2 : 1;
    
    // Elongation cost
    const elongationCost = workingCost * 0.15;
    
    // Food & Accommodation
    const foodAccomCost = (
      (Number(formData.foodResources) * 25 + Number(formData.accomResources) * 100) * 
      getDays()
    );
    
    // Trailer cost based on distance
    const trailerCost = calculateTrailerCost();
    
    // Risk adjustment
    const riskAdjustment = calculateRiskAdjustment(workingCost);
    
    // Extra charges
    const extraCharges = (
      Number(formData.extraCharge) +
      Number(formData.incidentalCharges) +
      Number(formData.otherFactorsCharge)
    );
    
    // Subtotal
    const subtotal = (
      workingCost * usageFactor +
      elongationCost +
      foodAccomCost +
      trailerCost +
      riskAdjustment +
      extraCharges
    );
    
    // GST
    const gstAmount = formData.billing === 'gst' ? subtotal * 0.18 : 0;
    
    // Total
    const totalAmount = subtotal + gstAmount;
    
    setCalculations({
      baseRate,
      totalHours: workingHours,
      workingCost,
      elongationCost,
      trailerCost,
      foodAccomCost,
      usageLoadFactor: workingCost * (usageFactor - 1),
      extraCharges,
      riskAdjustment,
      gstAmount,
      totalAmount,
    });
  };

  const getMachineBaseRate = (type: string): number => {
    switch (type) {
      case 'mobile_crane': return 1500;
      case 'tower_crane': return 2500;
      case 'crawler_crane': return 3000;
      case 'pick_and_carry': return 1200;
      default: return 0;
    }
  };

  const calculateWorkingHours = (): number => {
    const hours = Number(formData.workingHours);
    const days = getDays();
    const shiftMultiplier = formData.shift === 'double' ? 2 : 1;
    return hours * days * shiftMultiplier;
  };

  const getDays = (): number => {
    switch (formData.orderType) {
      case 'monthly': return 26;
      case 'yearly': return 312;
      default: return Number(formData.workingHours) / 10;
    }
  };

  const calculateTrailerCost = (): number => {
    const distance = Number(formData.siteDistance);
    const baseTrailerRate = 50; // per km
    return distance * baseTrailerRate;
  };

  const calculateRiskAdjustment = (baseAmount: number): number => {
    switch (formData.riskFactor) {
      case 'high': return baseAmount * 0.15;
      case 'medium': return baseAmount * 0.10;
      case 'low': return baseAmount * 0.05;
      default: return 0;
    }
  };

  const handleSubmit = async () => {
    if (!selectedLead) {
      showToast('Please select a lead', 'error');
      return;
    }

    try {
      const quotationData = {
        leadId: selectedLead.id,
        ...formData,
        ...calculations,
        createdBy: user?.id || '',
      };

      await createQuotation(quotationData);
      setIsCreateModalOpen(false);
      showToast('Quotation created successfully', 'success');
    } catch (error) {
      showToast('Error creating quotation', 'error');
    }
  };

  const showToast = (
    title: string,
    variant: 'success' | 'error' | 'warning' = 'success'
  ) => {
    setToast({ show: true, title, variant });
    setTimeout(() => setToast({ show: false, title: '' }), 3000);
  };

  const formatCurrency = (amount: number) => {
    return new Intl.NumberFormat('en-IN', {
      style: 'currency',
      currency: 'INR',
      maximumFractionDigits: 0,
    }).format(amount);
  };

  if (!user || (user.role !== 'sales_agent' && user.role !== 'admin')) {
    return (
      <div className="p-4 text-center text-gray-500">
        You don't have permission to access this page.
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <div className="flex-1">
          <Select
            label="Select Lead"
            options={leads.map(lead => ({
              value: lead.id,
              label: `${lead.customerName} - ${lead.serviceNeeded}`,
            }))}
            value={selectedLead?.id || ''}
            onChange={(value) => {
              const lead = leads.find(l => l.id === value);
              setSelectedLead(lead || null);
            }}
          />
        </div>
        
        <Button
          onClick={() => setIsCreateModalOpen(true)}
          disabled={!selectedLead}
          leftIcon={<Calculator size={16} />}
        >
          New Quotation
        </Button>
      </div>

      {/* Quotation Creation Modal */}
      <Modal
        isOpen={isCreateModalOpen}
        onClose={() => setIsCreateModalOpen(false)}
        title="Create New Quotation"
        size="xl"
      >
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          {/* Form Section */}
          <div className="space-y-6">
            {/* H1 - Order Type */}
            <Card>
              <CardHeader>
                <CardTitle>Order Type</CardTitle>
              </CardHeader>
              <CardContent>
                <Select
                  label="Order Type"
                  options={ORDER_TYPES}
                  value={formData.orderType}
                  onChange={(value) => setFormData(prev => ({ ...prev, orderType: value }))}
                />
              </CardContent>
            </Card>

            {/* H2 - Type of Machine */}
            <Card>
              <CardHeader>
                <CardTitle>Machine Selection</CardTitle>
              </CardHeader>
              <CardContent>
                <Select
                  label="Type of Machine"
                  options={MACHINE_TYPES}
                  value={formData.machineType}
                  onChange={(value) => setFormData(prev => ({ ...prev, machineType: value }))}
                />
              </CardContent>
            </Card>

            {/* H3 - Hours */}
            <Card>
              <CardHeader>
                <CardTitle>Working Hours</CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <Input
                  type="number"
                  label="Number of Hours"
                  value={formData.workingHours}
                  onChange={(e) => setFormData(prev => ({ ...prev, workingHours: e.target.value }))}
                />
                <Select
                  label="Day/Night"
                  options={TIME_OPTIONS}
                  value={formData.dayNight}
                  onChange={(value) => setFormData(prev => ({ ...prev, dayNight: value }))}
                />
                <Select
                  label="Shift"
                  options={SHIFT_OPTIONS}
                  value={formData.shift}
                  onChange={(value) => setFormData(prev => ({ ...prev, shift: value }))}
                />
                <div className="flex items-center gap-2">
                  <input
                    type="checkbox"
                    id="sundayWorking"
                    checked={formData.sundayWorking === 'yes'}
                    onChange={(e) => setFormData(prev => ({ 
                      ...prev, 
                      sundayWorking: e.target.checked ? 'yes' : 'no' 
                    }))}
                    className="rounded border-gray-300"
                  />
                  <label htmlFor="sundayWorking" className="text-sm">
                    Sunday Working
                  </label>
                </div>
              </CardContent>
            </Card>

            {/* H4 - Accommodation */}
            <Card>
              <CardHeader>
                <CardTitle>Accommodation</CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <Input
                  type="number"
                  label="Number of Resources (Food)"
                  value={formData.foodResources}
                  onChange={(e) => setFormData(prev => ({ ...prev, foodResources: e.target.value }))}
                />
                <Input
                  type="number"
                  label="Number of Resources (Accommodation)"
                  value={formData.accomResources}
                  onChange={(e) => setFormData(prev => ({ ...prev, accomResources: e.target.value }))}
                />
              </CardContent>
            </Card>

            {/* Additional sections */}
            <Card>
              <CardHeader>
                <CardTitle>Additional Parameters</CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <Select
                  label="Usage"
                  options={USAGE_OPTIONS}
                  value={formData.usage}
                  onChange={(value) => setFormData(prev => ({ ...prev, usage: value }))}
                />
                
                <Input
                  type="number"
                  label="Distance to Site (km)"
                  value={formData.siteDistance}
                  onChange={(e) => setFormData(prev => ({ ...prev, siteDistance: e.target.value }))}
                />
                
                <Select
                  label="Deal Type"
                  options={DEAL_TYPES}
                  value={formData.dealType}
                  onChange={(value) => setFormData(prev => ({ ...prev, dealType: value }))}
                />
                
                <Input
                  type="number"
                  label="Extra Commercial Charges"
                  value={formData.extraCharge}
                  onChange={(e) => setFormData(prev => ({ ...prev, extraCharge: e.target.value }))}
                />
                
                <Select
                  label="Risk Factor"
                  options={RISK_LEVELS}
                  value={formData.riskFactor}
                  onChange={(value) => setFormData(prev => ({ ...prev, riskFactor: value }))}
                />
                
                <Input
                  type="number"
                  label="Incidental Charges"
                  value={formData.incidentalCharges}
                  onChange={(e) => setFormData(prev => ({ 
                    ...prev, 
                    incidentalCharges: e.target.value 
                  }))}
                />
                
                <Select
                  label="Other Factors"
                  options={OTHER_FACTORS}
                  value={formData.otherFactors}
                  onChange={(value) => setFormData(prev => ({ ...prev, otherFactors: value }))}
                />
                
                <Input
                  type="number"
                  label="Other Factors Charge"
                  value={formData.otherFactorsCharge}
                  onChange={(e) => setFormData(prev => ({ 
                    ...prev, 
                    otherFactorsCharge: e.target.value 
                  }))}
                />
              </CardContent>
            </Card>
          </div>

          {/* Summary Section */}
          <div className="space-y-6">
            <Card>
              <CardHeader>
                <CardTitle>Quotation Summary</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  {/* Working Cost */}
                  <div className="space-y-2">
                    <div className="flex justify-between text-sm">
                      <span>Working Cost</span>
                      <span>{formatCurrency(calculations.workingCost)}</span>
                    </div>
                    <div className="h-2 bg-gray-100 rounded-full overflow-hidden">
                      <div 
                        className="h-full bg-primary-500"
                        style={{ 
                          width: `${(calculations.workingCost / calculations.totalAmount) * 100}%` 
                        }}
                      />
                    </div>
                  </div>

                  {/* Elongation */}
                  <div className="space-y-2">
                    <div className="flex justify-between text-sm">
                      <span>Elongation</span>
                      <span>{formatCurrency(calculations.elongationCost)}</span>
                    </div>
                    <div className="h-2 bg-gray-100 rounded-full overflow-hidden">
                      <div 
                        className="h-full bg-secondary-500"
                        style={{ 
                          width: `${(calculations.elongationCost / calculations.totalAmount) * 100}%` 
                        }}
                      />
                    </div>
                  </div>

                  {/* Trailer Cost */}
                  <div className="space-y-2">
                    <div className="flex justify-between text-sm">
                      <span>Trailer Cost</span>
                      <span>{formatCurrency(calculations.trailerCost)}</span>
                    </div>
                    <div className="h-2 bg-gray-100 rounded-full overflow-hidden">
                      <div 
                        className="h-full bg-accent-500"
                        style={{ 
                          width: `${(calculations.trailerCost / calculations.totalAmount) * 100}%` 
                        }}
                      />
                    </div>
                  </div>

                  {/* Food & Accommodation */}
                  <div className="space-y-2">
                    <div className="flex justify-between text-sm">
                      <span>Food & Accommodation</span>
                      <span>{formatCurrency(calculations.foodAccomCost)}</span>
                    </div>
                    <div className="h-2 bg-gray-100 rounded-full overflow-hidden">
                      <div 
                        className="h-full bg-success-500"
                        style={{ 
                          width: `${(calculations.foodAccomCost / calculations.totalAmount) * 100}%` 
                        }}
                      />
                    </div>
                  </div>

                  {/* Usage Load Factor */}
                  <div className="space-y-2">
                    <div className="flex justify-between text-sm">
                      <span>Usage Load Factor</span>
                      <span>{formatCurrency(calculations.usageLoadFactor)}</span>
                    </div>
                    <div className="h-2 bg-gray-100 rounded-full overflow-hidden">
                      <div 
                        className="h-full bg-warning-500"
                        style={{ 
                          width: `${(calculations.usageLoadFactor / calculations.totalAmount) * 100}%` 
                        }}
                      />
                    </div>
                  </div>

                  {/* Extra Charges */}
                  <div className="space-y-2">
                    <div className="flex justify-between text-sm">
                      <span>Extra Charges</span>
                      <span>{formatCurrency(calculations.extraCharges)}</span>
                    </div>
                    <div className="h-2 bg-gray-100 rounded-full overflow-hidden">
                      <div 
                        className="h-full bg-error-500"
                        style={{ 
                          width: `${(calculations.extraCharges / calculations.totalAmount) * 100}%` 
                        }}
                      />
                    </div>
                  </div>

                  {/* Risk Adjustment */}
                  <div className="space-y-2">
                    <div className="flex justify-between text-sm">
                      <span>Risk Adjustment</span>
                      <span>{formatCurrency(calculations.riskAdjustment)}</span>
                    </div>
                    <div className="h-2 bg-gray-100 rounded-full overflow-hidden">
                      <div 
                        className="h-full bg-primary-300"
                        style={{ 
                          width: `${(calculations.riskAdjustment / calculations.totalAmount) * 100}%` 
                        }}
                      />
                    </div>
                  </div>

                  {/* GST */}
                  {calculations.gstAmount > 0 && (
                    <div className="space-y-2">
                      <div className="flex justify-between text-sm">
                        <span>GST (18%)</span>
                        <span>{formatCurrency(calculations.gstAmount)}</span>
                      </div>
                      <div className="h-2 bg-gray-100 rounded-full overflow-hidden">
                        <div 
                          className="h-full bg-secondary-300"
                          style={{ 
                            width: `${(calculations.gstAmount / calculations.totalAmount) * 100}%` 
                          }}
                        />
                      </div>
                    </div>
                  )}

                  {/* Total Amount */}
                  <div className="pt-4 mt-4 border-t border-gray-200">
                    <div className="flex justify-between items-center">
                      <span className="text-lg font-semibold">Total Amount</span>
                      <span className="text-xl font-bold text-primary-600">
                        {formatCurrency(calculations.totalAmount)}
                      </span>
                    </div>
                  </div>
                </div>
              </CardContent>
            </Card>

            <div className="flex justify-end gap-3">
              <Button
                variant="outline"
                onClick={() => setIsCreateModalOpen(false)}
              >
                Cancel
              </Button>
              <Button onClick={handleSubmit}>
                Create Quotation
              </Button>
            </div>
          </div>
        </div>
      </Modal>

      {/* Toast Notifications */}
      {toast.show && (
        <Toast
          title={toast.title}
          variant={toast.variant}
          isVisible={toast.show}
          onClose={() => setToast({ show: false, title: '' })}
        />
      )}
    </div>
  );
}