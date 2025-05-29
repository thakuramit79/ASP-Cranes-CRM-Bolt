import React, { useState, useEffect } from 'react';
import { 
  DollarSign, 
  Users, 
  Calendar, 
  ArrowRight,
  Search,
  Plus,
  Building2
} from 'lucide-react';
import { Card, CardHeader, CardTitle, CardContent } from '../components/common/Card';
import { Badge } from '../components/common/Badge';
import { Button } from '../components/common/Button';
import { Input } from '../components/common/Input';
import { Select } from '../components/common/Select';
import { Toast } from '../components/common/Toast';
import { useAuthStore } from '../store/authStore';
import { Deal } from '../types/deal';
import { getDeals, updateDealStage } from '../services/dealService';

const STAGE_OPTIONS = [
  { value: 'qualification', label: 'Qualification' },
  { value: 'proposal', label: 'Proposal' },
  { value: 'negotiation', label: 'Negotiation' },
  { value: 'won', label: 'Won' },
  { value: 'lost', label: 'Lost' },
];

export function Deals() {
  const { user } = useAuthStore();
  const [deals, setDeals] = useState<Deal[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const [stageFilter, setStageFilter] = useState<Deal['stage'] | 'all'>('all');
  const [toast, setToast] = useState<{ show: boolean; title: string; variant?: 'success' | 'error' | 'warning' }>({
    show: false,
    title: '',
  });

  useEffect(() => {
    fetchDeals();
  }, []);

  const fetchDeals = async () => {
    try {
      const data = await getDeals();
      setDeals(data);
      setIsLoading(false);
    } catch (error) {
      console.error('Error fetching deals:', error);
    }
  };

  const showToast = (title: string, variant: 'success' | 'error' = 'success') => {
    setToast({ show: true, title, variant });
    setTimeout(() => setToast({ show: false, title: '' }), 3000);
  };

  const handleStageChange = async (dealId: string, newStage: Deal['stage']) => {
    try {
      const updatedDeal = await updateDealStage(dealId, newStage);
      if (updatedDeal) {
        setDeals(prev => 
          prev.map(deal => 
            deal.id === dealId ? updatedDeal : deal
          )
        );
        showToast(`Deal stage updated to ${newStage}`, 'success');
      }
    } catch (error) {
      console.error('Error updating deal stage:', error);
      showToast('Error updating deal stage', 'error');
    }
  };

  const filteredDeals = deals.filter(deal => {
    const matchesSearch = 
      deal.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
      deal.customer.name.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesStage = stageFilter === 'all' || deal.stage === stageFilter;
    return matchesSearch && matchesStage;
  });

  if (!user || (user.role !== 'sales_agent' && user.role !== 'admin')) {
    return (
      <div className="p-4 text-center text-gray-500">
        You don't have permission to access this page.
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {toast.show && (
        <Toast
          title={toast.title}
          variant={toast.variant}
          isVisible={toast.show}
          onClose={() => setToast({ show: false, title: '' })}
        />
      )}
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
        <div className="flex flex-col sm:flex-row gap-4 flex-1">
          <div className="relative flex-1">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400 h-5 w-5" />
            <Input
              placeholder="Search deals..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="pl-10"
            />
          </div>
          
          <Select
            options={[
              { value: 'all', label: 'All Stages' },
              ...STAGE_OPTIONS
            ]}
            value={stageFilter}
            onChange={(value) => setStageFilter(value as Deal['stage'] | 'all')}
            className="w-40"
          />
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {isLoading ? (
          <div className="col-span-full text-center py-8">Loading deals...</div>
        ) : filteredDeals.length === 0 ? (
          <div className="col-span-full text-center py-8 text-gray-500">
            No deals found.
          </div>
        ) : (
          filteredDeals.map((deal) => (
            <Card key={deal.id} className="hover:shadow-lg transition-shadow">
              <CardContent className="p-6">
                <div className="flex justify-between items-start mb-4">
                  <h3 className="text-lg font-semibold text-gray-900">{deal.title}</h3>
                  <Select
                    options={STAGE_OPTIONS}
                    value={deal.stage}
                    onChange={(value) => handleStageChange(deal.id, value as Deal['stage'])}
                    className="w-32"
                  />
                </div>
                
                <div className="space-y-3">
                  <div className="flex items-center text-gray-600">
                    <DollarSign className="w-5 h-5 mr-2" />
                    <span>${deal.value.toLocaleString()}</span>
                  </div>
                  
                  <div className="flex items-center text-gray-600">
                    <Building2 className="w-5 h-5 mr-2" />
                    <span>{deal.customer.name}</span>
                  </div>
                  
                  <div className="flex items-center text-gray-600">
                    <Users className="w-5 h-5 mr-2" />
                    <span>{deal.contact.name}</span>
                  </div>
                  
                  <div className="flex items-center text-gray-600">
                    <Calendar className="w-5 h-5 mr-2" />
                    <span>{new Date(deal.expectedCloseDate).toLocaleDateString()}</span>
                  </div>
                </div>
                
                {deal.notes && (
                  <p className="mt-4 text-sm text-gray-500">{deal.notes}</p>
                )}
                
                <div className="mt-4 pt-4 border-t border-gray-100">
                  <Button variant="outline" size="sm" className="w-full justify-between">
                    View Details
                    <ArrowRight className="w-4 h-4" />
                  </Button>
                </div>
              </CardContent>
            </Card>
          ))
        )}
      </div>
    </div>
  );
}

