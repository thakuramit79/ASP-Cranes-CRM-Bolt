import React, { useState, useEffect } from 'react';
import { Select } from './common/Select';
import { Equipment } from '../types/equipment';
import { getEquipment } from '../services/firestore/equipmentService';

interface EquipmentSelectionProps {
  selectedCategory: string;
  selectedEquipmentId: string;
  onCategoryChange: (category: string) => void;
  onEquipmentChange: (equipment: Equipment | null) => void;
}

const CATEGORY_OPTIONS = [
  { value: 'mobile_crane', label: 'Mobile Crane' },
  { value: 'tower_crane', label: 'Tower Crane' },
  { value: 'crawler_crane', label: 'Crawler Crane' },
  { value: 'pick_and_carry_crane', label: 'Pick & Carry Crane' },
];

export function EquipmentSelection({
  selectedCategory,
  selectedEquipmentId,
  onCategoryChange,
  onEquipmentChange,
}: EquipmentSelectionProps) {
  const [equipment, setEquipment] = useState<Equipment[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    fetchEquipment();
  }, []);

  const fetchEquipment = async () => {
    try {
      const data = await getEquipment();
      setEquipment(data.filter(item => item.status === 'available'));
      setIsLoading(false);
    } catch (error) {
      console.error('Error fetching equipment:', error);
    }
  };

  const filteredEquipment = equipment.filter(
    item => item.category === selectedCategory
  );

  const equipmentOptions = filteredEquipment.map(item => ({
    value: item.id,
    label: `${item.name} (${item.maxLiftingCapacity} tons)`,
  }));

  const handleEquipmentChange = (value: string) => {
    const selected = equipment.find(item => item.id === value) || null;
    onEquipmentChange(selected);
  };

  return (
    <div className="space-y-4">
      <Select
        label="Type of Machine"
        options={CATEGORY_OPTIONS}
        value={selectedCategory}
        onChange={onCategoryChange}
        required
      />

      <Select
        label="Select Equipment"
        options={equipmentOptions}
        value={selectedEquipmentId}
        onChange={handleEquipmentChange}
        disabled={!selectedCategory || isLoading}
        required
      />
    </div>
  );
} 