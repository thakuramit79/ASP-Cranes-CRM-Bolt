import React, { useState, useEffect } from 'react';
import { 
  Download,
  Upload,
  RotateCcw,
  Save,
  HelpCircle,
  AlertCircle,
  Check,
  X
} from 'lucide-react';
import { Card, CardHeader, CardTitle, CardContent } from '../components/common/Card';
import { Button } from '../components/common/Button';
import { Input } from '../components/common/Input';
import { Modal } from '../components/common/Modal';
import { Toast } from '../components/common/Toast';
import { useAuthStore } from '../store/authStore';

interface ConfigParam {
  id: string;
  name: string;
  description: string;
  value: string;
  type: 'number' | 'percentage' | 'currency';
  category: string;
  defaultValue: string;
  isModified?: boolean;
}

const DEFAULT_CONFIG: ConfigParam[] = [
  {
    id: 'tower_crane_rate',
    name: 'Tower Crane Base Rate',
    description: 'Standard hourly rate for tower crane rental',
    value: '250',
    type: 'currency',
    category: 'Equipment Rates',
    defaultValue: '250',
  },
  {
    id: 'mobile_crane_rate',
    name: 'Mobile Crane Base Rate',
    description: 'Standard hourly rate for mobile crane rental',
    value: '180',
    type: 'currency',
    category: 'Equipment Rates',
    defaultValue: '180',
  },
  {
    id: 'shift_duration',
    name: 'Standard Shift Duration',
    description: 'Default working hours per shift',
    value: '8',
    type: 'number',
    category: 'Time & Schedule',
    defaultValue: '8',
  },
  {
    id: 'operator_wage',
    name: 'Operator Wage',
    description: 'Base wage per shift for crane operators',
    value: '200',
    type: 'currency',
    category: 'Labor Costs',
    defaultValue: '200',
  },
  {
    id: 'fuel_multiplier',
    name: 'Fuel Cost Multiplier',
    description: 'Factor applied to base rate for fuel consumption',
    value: '0.15',
    type: 'percentage',
    category: 'Operating Costs',
    defaultValue: '0.15',
  },
  {
    id: 'risk_percentage',
    name: 'Risk Percentage',
    description: 'Default risk factor applied to quotations',
    value: '10',
    type: 'percentage',
    category: 'Risk & Insurance',
    defaultValue: '10',
  },
  {
    id: 'food_allowance',
    name: 'Food Allowance',
    description: 'Daily food allowance per person',
    value: '25',
    type: 'currency',
    category: 'Labor Costs',
    defaultValue: '25',
  },
  {
    id: 'accommodation',
    name: 'Accommodation Rate',
    description: 'Daily accommodation cost per person',
    value: '100',
    type: 'currency',
    category: 'Labor Costs',
    defaultValue: '100',
  },
  {
    id: 'commercial_charge',
    name: 'Commercial Charge',
    description: 'Standard commercial markup percentage',
    value: '20',
    type: 'percentage',
    category: 'Pricing',
    defaultValue: '20',
  },
  {
    id: 'incidental_rate',
    name: 'Incidental Rate',
    description: 'Default rate for incidental charges',
    value: '5',
    type: 'percentage',
    category: 'Operating Costs',
    defaultValue: '5',
  },
];

export function Configuration() {
  const { user } = useAuthStore();
  const [config, setConfig] = useState<ConfigParam[]>(DEFAULT_CONFIG);
  const [isRestoreModalOpen, setIsRestoreModalOpen] = useState(false);
  const [isImportModalOpen, setIsImportModalOpen] = useState(false);
  const [importPreview, setImportPreview] = useState<ConfigParam[]>([]);
  const [hasUnsavedChanges, setHasUnsavedChanges] = useState(false);
  const [toast, setToast] = useState<{
    show: boolean;
    title: string;
    description?: string;
    variant?: 'success' | 'error' | 'warning';
  }>({ show: false, title: '' });

  useEffect(() => {
    checkForChanges();
  }, [config]);

  const checkForChanges = () => {
    const modified = config.some(param => 
      param.value !== param.defaultValue
    );
    setHasUnsavedChanges(modified);
  };

  const handleValueChange = (id: string, value: string) => {
    setConfig(prev =>
      prev.map(param =>
        param.id === id
          ? { ...param, value, isModified: value !== param.defaultValue }
          : param
      )
    );
  };

  const handleSave = async () => {
    try {
      // Simulate API call
      await new Promise(resolve => setTimeout(resolve, 1000));
      
      // Update default values
      setConfig(prev =>
        prev.map(param => ({
          ...param,
          defaultValue: param.value,
          isModified: false,
        }))
      );
      
      setHasUnsavedChanges(false);
      showToast('Configuration saved successfully', 'success');
    } catch (error) {
      showToast('Error saving configuration', 'error');
    }
  };

  const handleRestore = async () => {
    try {
      setConfig(prev =>
        prev.map(param => ({
          ...param,
          value: param.defaultValue,
          isModified: false,
        }))
      );
      
      setIsRestoreModalOpen(false);
      showToast('Configuration restored to defaults', 'success');
    } catch (error) {
      showToast('Error restoring defaults', 'error');
    }
  };

  const handleExport = () => {
    const configData = JSON.stringify(config, null, 2);
    const blob = new Blob([configData], { type: 'application/json' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = 'crane-config.json';
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    URL.revokeObjectURL(url);
    
    showToast('Configuration exported successfully', 'success');
  };

  const handleImportFile = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    const reader = new FileReader();
    reader.onload = (event) => {
      try {
        const imported = JSON.parse(event.target?.result as string);
        setImportPreview(imported);
        setIsImportModalOpen(true);
      } catch (error) {
        showToast('Invalid configuration file', 'error');
      }
    };
    reader.readAsText(file);
  };

  const confirmImport = () => {
    setConfig(importPreview);
    setIsImportModalOpen(false);
    showToast('Configuration imported successfully', 'success');
  };

  const showToast = (
    title: string,
    variant: 'success' | 'error' | 'warning' = 'success'
  ) => {
    setToast({ show: true, title, variant });
    setTimeout(() => setToast({ show: false, title: '' }), 3000);
  };

  const formatValue = (value: string, type: ConfigParam['type']): string => {
    const num = parseFloat(value);
    if (isNaN(num)) return value;

    switch (type) {
      case 'currency':
        return `$${num.toFixed(2)}`;
      case 'percentage':
        return `${num}%`;
      default:
        return value;
    }
  };

  if (!user || user.role !== 'admin') {
    return (
      <div className="p-4 text-center text-gray-500">
        You don't have permission to access this page.
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center mb-6">
        <h1 className="text-2xl font-bold">System Configuration</h1>
        
        <div className="flex items-center gap-3">
          <input
            type="file"
            id="configImport"
            className="hidden"
            accept=".json"
            onChange={handleImportFile}
          />
          
          <Button
            variant="outline"
            onClick={() => document.getElementById('configImport')?.click()}
            leftIcon={<Upload size={16} />}
          >
            Import
          </Button>
          
          <Button
            variant="outline"
            onClick={handleExport}
            leftIcon={<Download size={16} />}
          >
            Export
          </Button>
          
          <Button
            variant="outline"
            onClick={() => setIsRestoreModalOpen(true)}
            leftIcon={<RotateCcw size={16} />}
          >
            Restore Defaults
          </Button>
          
          <Button
            onClick={handleSave}
            disabled={!hasUnsavedChanges}
            leftIcon={<Save size={16} />}
          >
            Save Changes
          </Button>
        </div>
      </div>

      {/* Group parameters by category */}
      {Array.from(new Set(config.map(param => param.category))).map(category => (
        <Card key={category}>
          <CardHeader>
            <CardTitle>{category}</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
              {config
                .filter(param => param.category === category)
                .map((param) => (
                  <div key={param.id} className="space-y-2">
                    <div className="flex items-center gap-2">
                      <label className="text-sm font-medium text-gray-700">
                        {param.name}
                      </label>
                      <div className="group relative">
                        <HelpCircle className="h-4 w-4 text-gray-400" />
                        <div className="absolute left-full ml-2 w-64 p-2 bg-gray-800 text-white text-xs rounded-md opacity-0 invisible group-hover:opacity-100 group-hover:visible transition-all z-10">
                          {param.description}
                        </div>
                      </div>
                    </div>
                    
                    <div className="flex gap-3">
                      <Input
                        type="number"
                        value={param.value}
                        onChange={(e) => handleValueChange(param.id, e.target.value)}
                        className={param.isModified ? 'border-warning-500' : ''}
                      />
                      <div className="flex items-center text-sm font-medium text-gray-500 w-20">
                        {formatValue(param.value, param.type)}
                      </div>
                    </div>
                    
                    {param.isModified && (
                      <p className="text-xs text-warning-600 flex items-center gap-1">
                        <AlertCircle className="h-4 w-4" />
                        Modified from {formatValue(param.defaultValue, param.type)}
                      </p>
                    )}
                  </div>
                ))}
            </div>
          </CardContent>
        </Card>
      ))}

      {/* Restore Defaults Modal */}
      <Modal
        isOpen={isRestoreModalOpen}
        onClose={() => setIsRestoreModalOpen(false)}
        title="Restore Default Configuration"
        size="sm"
      >
        <div className="space-y-4">
          <div className="flex items-center gap-3 p-4 bg-warning-50 text-warning-700 rounded-lg">
            <AlertCircle className="h-5 w-5 flex-shrink-0" />
            <p className="text-sm">
              This will reset all configuration parameters to their default values. 
              This action cannot be undone.
            </p>
          </div>

          <div className="flex justify-end gap-3">
            <Button
              variant="outline"
              onClick={() => setIsRestoreModalOpen(false)}
            >
              Cancel
            </Button>
            <Button
              variant="warning"
              onClick={handleRestore}
            >
              Restore Defaults
            </Button>
          </div>
        </div>
      </Modal>

      {/* Import Preview Modal */}
      <Modal
        isOpen={isImportModalOpen}
        onClose={() => setIsImportModalOpen(false)}
        title="Import Configuration"
        size="lg"
      >
        <div className="space-y-6">
          <div className="max-h-96 overflow-y-auto">
            <table className="min-w-full divide-y divide-gray-200">
              <thead className="bg-gray-50">
                <tr>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Parameter
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Current Value
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    New Value
                  </th>
                </tr>
              </thead>
              <tbody className="bg-white divide-y divide-gray-200">
                {importPreview.map((param) => {
                  const currentParam = config.find(p => p.id === param.id);
                  const hasChanged = currentParam && currentParam.value !== param.value;
                  
                  return (
                    <tr key={param.id} className={hasChanged ? 'bg-warning-50' : ''}>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <div className="font-medium text-gray-900">{param.name}</div>
                        <div className="text-sm text-gray-500">{param.category}</div>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        {currentParam && formatValue(currentParam.value, currentParam.type)}
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <div className="flex items-center gap-2">
                          {formatValue(param.value, param.type)}
                          {hasChanged && (
                            param.value > currentParam!.value
                              ? <span className="text-success-600">↑</span>
                              : <span className="text-error-600">↓</span>
                          )}
                        </div>
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>

          <div className="flex justify-end gap-3">
            <Button
              variant="outline"
              onClick={() => setIsImportModalOpen(false)}
            >
              Cancel
            </Button>
            <Button onClick={confirmImport}>
              Confirm Import
            </Button>
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