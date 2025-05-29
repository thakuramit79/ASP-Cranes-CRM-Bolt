import React, { useState, useEffect } from 'react';
import { Plus, Search, Edit2, Trash2, Settings, Calendar, Weight, Plane as Crane, DollarSign, Truck } from 'lucide-react';
import { Card, CardHeader, CardTitle, CardContent } from '../components/common/Card';
import { Button } from '../components/common/Button';
import { Input } from '../components/common/Input';
import { Select } from '../components/common/Select';
import { TextArea } from '../components/common/TextArea';
import { Modal } from '../components/common/Modal';
import { Toast } from '../components/common/Toast';
import { Badge } from '../components/common/Badge';
import { useAuthStore } from '../store/authStore';
import { Equipment } from '../types/equipment';
import { getEquipment, createEquipment, updateEquipment, deleteEquipment } from '../services/firestore/equipmentService';

const STATUS_OPTIONS = [
  { value: 'available', label: 'Available' },
  { value: 'in_use', label: 'In Use' },
  { value: 'maintenance', label: 'Maintenance' },
];

export function EquipmentManagement() {
  const { user } = useAuthStore();
  const [equipment, setEquipment] = useState<Equipment[]>([]);
  const [filteredEquipment, setFilteredEquipment] = useState<Equipment[]>([]);
  const [searchTerm, setSearchTerm] = useState('');
  const [statusFilter, setStatusFilter] = useState<'all' | Equipment['status']>('all');
  const [isLoading, setIsLoading] = useState(true);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [isDeleteModalOpen, setIsDeleteModalOpen] = useState(false);
  const [selectedEquipment, setSelectedEquipment] = useState<Equipment | null>(null);
  const [toast, setToast] = useState<{
    show: boolean;
    title: string;
    description?: string;
    variant?: 'success' | 'error' | 'warning';
  }>({ show: false, title: '' });

  const [formData, setFormData] = useState({
    name: '',
    manufacturingDate: '',
    registrationDate: '',
    maxLiftingCapacity: '',
    unladenWeight: '',
    baseRate: '',
    runningCostPerKm: '',
    description: '',
    status: 'available' as Equipment['status'],
  });

  useEffect(() => {
    fetchEquipment();
  }, []);

  useEffect(() => {
    filterEquipment();
  }, [equipment, searchTerm, statusFilter]);

  const fetchEquipment = async () => {
    try {
      const data = await getEquipment();
      setEquipment(data);
      setIsLoading(false);
    } catch (error) {
      console.error('Error fetching equipment:', error);
      showToast('Error fetching equipment', 'error');
    }
  };

  const filterEquipment = () => {
    let filtered = [...equipment];

    if (searchTerm) {
      filtered = filtered.filter(item => 
        item.name.toLowerCase().includes(searchTerm.toLowerCase())
      );
    }

    if (statusFilter !== 'all') {
      filtered = filtered.filter(item => item.status === statusFilter);
    }

    setFilteredEquipment(filtered);
  };

  const validateForm = () => {
    if (!formData.name || !formData.manufacturingDate || !formData.registrationDate || 
        !formData.maxLiftingCapacity || !formData.unladenWeight || !formData.baseRate || 
        !formData.runningCostPerKm) {
      showToast('Please fill in all required fields', 'error');
      return false;
    }

    // Validate date formats (YYYY-MM)
    const dateRegex = /^\d{4}-\d{2}$/;
    if (!dateRegex.test(formData.manufacturingDate) || !dateRegex.test(formData.registrationDate)) {
      showToast('Please enter valid dates in YYYY-MM format', 'error');
      return false;
    }

    // Validate numeric fields
    if (isNaN(Number(formData.maxLiftingCapacity)) || isNaN(Number(formData.unladenWeight)) ||
        isNaN(Number(formData.baseRate)) || isNaN(Number(formData.runningCostPerKm))) {
      showToast('Please enter valid numbers for numeric fields', 'error');
      return false;
    }

    return true;
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!validateForm()) {
      return;
    }

    try {
      const equipmentData = {
        ...formData,
        maxLiftingCapacity: Number(formData.maxLiftingCapacity),
        unladenWeight: Number(formData.unladenWeight),
        baseRate: Number(formData.baseRate),
        runningCostPerKm: Number(formData.runningCostPerKm),
      };

      if (selectedEquipment) {
        const updatedEquipment = await updateEquipment(selectedEquipment.id, equipmentData);
        setEquipment(prev => 
          prev.map(item => 
            item.id === selectedEquipment.id ? { ...item, ...updatedEquipment } : item
          )
        );
        showToast('Equipment updated successfully', 'success');
      } else {
        const newEquipment = await createEquipment(equipmentData);
        setEquipment(prev => [...prev, newEquipment]);
        showToast('Equipment added successfully', 'success');
      }

      setIsModalOpen(false);
      resetForm();
    } catch (error) {
      showToast('Error saving equipment', 'error');
    }
  };

  const handleDelete = async () => {
    if (!selectedEquipment) return;

    try {
      await deleteEquipment(selectedEquipment.id);
      setEquipment(prev => prev.filter(item => item.id !== selectedEquipment.id));
      setIsDeleteModalOpen(false);
      setSelectedEquipment(null);
      showToast('Equipment deleted successfully', 'success');
    } catch (error) {
      showToast('Error deleting equipment', 'error');
    }
  };

  const resetForm = () => {
    setFormData({
      name: '',
      manufacturingDate: '',
      registrationDate: '',
      maxLiftingCapacity: '',
      unladenWeight: '',
      baseRate: '',
      runningCostPerKm: '',
      description: '',
      status: 'available',
    });
    setSelectedEquipment(null);
  };

  const showToast = (
    title: string,
    variant: 'success' | 'error' | 'warning' = 'success'
  ) => {
    setToast({ show: true, title, variant });
    setTimeout(() => setToast({ show: false, title: '' }), 3000);
  };

  if (!user || (user.role !== 'operations_manager' && user.role !== 'admin')) {
    return (
      <div className="p-4 text-center text-gray-500">
        You don't have permission to access this page.
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
        <div className="flex flex-col sm:flex-row gap-4 flex-1">
          <div className="relative flex-1">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400 h-5 w-5" />
            <Input
              placeholder="Search equipment..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="pl-10"
            />
          </div>

          <Select
            options={[
              { value: 'all', label: 'All Status' },
              ...STATUS_OPTIONS,
            ]}
            value={statusFilter}
            onChange={(value) => setStatusFilter(value as 'all' | Equipment['status'])}
            className="w-40"
          />
        </div>

        <Button
          onClick={() => {
            resetForm();
            setIsModalOpen(true);
          }}
          leftIcon={<Plus size={16} />}
        >
          Add Equipment
        </Button>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {isLoading ? (
          <div className="col-span-full text-center py-8">Loading equipment...</div>
        ) : filteredEquipment.length === 0 ? (
          <div className="col-span-full text-center py-8 text-gray-500">
            No equipment found. Add new equipment to get started.
          </div>
        ) : (
          filteredEquipment.map((item) => (
            <Card key={item.id} variant="bordered">
              <CardContent className="p-6">
                <div className="flex justify-between items-start">
                  <div>
                    <h3 className="font-semibold text-lg">{item.name}</h3>
                    <Badge variant={
                      item.status === 'available' ? 'success' :
                      item.status === 'in_use' ? 'warning' :
                      'error'
                    }>
                      {item.status}
                    </Badge>
                  </div>
                  <div className="flex gap-2">
                    <Button
                      variant="ghost"
                      size="sm"
                      onClick={() => {
                        setSelectedEquipment(item);
                        setFormData({
                          name: item.name,
                          manufacturingDate: item.manufacturingDate,
                          registrationDate: item.registrationDate,
                          maxLiftingCapacity: item.maxLiftingCapacity.toString(),
                          unladenWeight: item.unladenWeight.toString(),
                          baseRate: item.baseRate.toString(),
                          runningCostPerKm: item.runningCostPerKm.toString(),
                          description: item.description || '',
                          status: item.status,
                        });
                        setIsModalOpen(true);
                      }}
                    >
                      <Edit2 size={16} />
                    </Button>
                    <Button
                      variant="ghost"
                      size="sm"
                      onClick={() => {
                        setSelectedEquipment(item);
                        setIsDeleteModalOpen(true);
                      }}
                    >
                      <Trash2 size={16} />
                    </Button>
                  </div>
                </div>

                <div className="mt-4 space-y-2">
                  <div className="flex items-center gap-2 text-gray-600">
                    <Calendar className="h-4 w-4" />
                    <span>Mfg: {item.manufacturingDate}</span>
                  </div>
                  <div className="flex items-center gap-2 text-gray-600">
                    <Calendar className="h-4 w-4" />
                    <span>Reg: {item.registrationDate}</span>
                  </div>
                  <div className="flex items-center gap-2 text-gray-600">
                    <Weight className="h-4 w-4" />
                    <span>{item.maxLiftingCapacity} tons max lift</span>
                  </div>
                  <div className="flex items-center gap-2 text-gray-600">
                    <Crane className="h-4 w-4" />
                    <span>{item.unladenWeight} tons unladen</span>
                  </div>
                  <div className="flex items-center gap-2 text-gray-600">
                    <DollarSign className="h-4 w-4" />
                    <span>${item.baseRate}/hr base rate</span>
                  </div>
                  <div className="flex items-center gap-2 text-gray-600">
                    <Truck className="h-4 w-4" />
                    <span>${item.runningCostPerKm}/km running cost</span>
                  </div>
                </div>

                {item.description && (
                  <p className="mt-4 text-sm text-gray-500">{item.description}</p>
                )}
              </CardContent>
            </Card>
          ))
        )}
      </div>

      {/* Add/Edit Equipment Modal */}
      <Modal
        isOpen={isModalOpen}
        onClose={() => {
          setIsModalOpen(false);
          resetForm();
        }}
        title={selectedEquipment ? 'Edit Equipment' : 'Add New Equipment'}
        size="lg"
      >
        <form onSubmit={handleSubmit} className="space-y-6">
          <Input
            label="Equipment Name"
            value={formData.name}
            onChange={(e) => setFormData(prev => ({ ...prev, name: e.target.value }))}
            required
          />

          <div className="grid grid-cols-2 gap-4">
            <Input
              label="Manufacturing Date (YYYY-MM)"
              value={formData.manufacturingDate}
              onChange={(e) => setFormData(prev => ({ ...prev, manufacturingDate: e.target.value }))}
              placeholder="2024-01"
              required
            />

            <Input
              label="Registration Date (YYYY-MM)"
              value={formData.registrationDate}
              onChange={(e) => setFormData(prev => ({ ...prev, registrationDate: e.target.value }))}
              placeholder="2024-01"
              required
            />
          </div>

          <div className="grid grid-cols-2 gap-4">
            <Input
              label="Max Lifting Capacity (tons)"
              type="number"
              step="0.1"
              value={formData.maxLiftingCapacity}
              onChange={(e) => setFormData(prev => ({ ...prev, maxLiftingCapacity: e.target.value }))}
              required
            />

            <Input
              label="Unladen Weight (tons)"
              type="number"
              step="0.1"
              value={formData.unladenWeight}
              onChange={(e) => setFormData(prev => ({ ...prev, unladenWeight: e.target.value }))}
              required
            />
          </div>

          <div className="grid grid-cols-2 gap-4">
            <Input
              label="Base Rate (per hour)"
              type="number"
              step="0.01"
              value={formData.baseRate}
              onChange={(e) => setFormData(prev => ({ ...prev, baseRate: e.target.value }))}
              required
            />

            <Input
              label="Running Cost (per km)"
              type="number"
              step="0.01"
              value={formData.runningCostPerKm}
              onChange={(e) => setFormData(prev => ({ ...prev, runningCostPerKm: e.target.value }))}
              required
            />
          </div>

          <Select
            label="Status"
            options={STATUS_OPTIONS}
            value={formData.status}
            onChange={(value) => setFormData(prev => ({ ...prev, status: value as Equipment['status'] }))}
            required
          />

          <TextArea
            label="Description"
            value={formData.description}
            onChange={(e) => setFormData(prev => ({ ...prev, description: e.target.value }))}
            rows={3}
          />

          <div className="flex justify-end gap-3">
            <Button
              type="button"
              variant="outline"
              onClick={() => {
                setIsModalOpen(false);
                resetForm();
              }}
            >
              Cancel
            </Button>
            <Button type="submit">
              {selectedEquipment ? 'Update' : 'Add'} Equipment
            </Button>
          </div>
        </form>
      </Modal>

      {/* Delete Confirmation Modal */}
      <Modal
        isOpen={isDeleteModalOpen}
        onClose={() => {
          setIsDeleteModalOpen(false);
          setSelectedEquipment(null);
        }}
        title="Delete Equipment"
        size="sm"
      >
        <div className="space-y-4">
          <p className="text-gray-600">
            Are you sure you want to delete this equipment? This action cannot be undone.
          </p>

          <div className="flex justify-end gap-3">
            <Button
              variant="outline"
              onClick={() => {
                setIsDeleteModalOpen(false);
                setSelectedEquipment(null);
              }}
            >
              Cancel
            </Button>
            <Button
              variant="destructive"
              onClick={handleDelete}
            >
              Delete
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