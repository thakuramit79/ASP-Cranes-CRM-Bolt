import React, { useState, useEffect } from 'react';
import { 
  BarChart3, 
  CalendarClock, 
  ClipboardList, 
  CreditCard, 
  DollarSign, 
  Users 
} from 'lucide-react';
import { StatCard } from '../components/dashboard/StatCard';
import { Card, CardHeader, CardTitle, CardContent } from '../components/common/Card';
import { Button } from '../components/common/Button';
import { StatusBadge } from '../components/common/StatusBadge';
import { getLeads } from '../services/leadService';
import { getQuotationsForLead } from '../services/quotationService';
import { Lead } from '../types/lead';
import { Quotation } from '../types/quotation';
import { Link } from 'react-router-dom';

export function SalesAgentDashboard() {
  const [leads, setLeads] = useState<Lead[]>([]);
  const [quotations, setQuotations] = useState<Quotation[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  
  useEffect(() => {
    const fetchData = async () => {
      try {
        const leadsData = await getLeads();
        setLeads(leadsData);
        
        // Get the most recent won lead to fetch its quotations
        const wonLeads = leadsData.filter(lead => lead.status === 'won');
        if (wonLeads.length > 0) {
          const recentWonLead = wonLeads[0];
          const leadQuotations = await getQuotationsForLead(recentWonLead.id);
          setQuotations(leadQuotations);
        }
        
      } catch (error) {
        console.error('Error fetching dashboard data:', error);
      } finally {
        setIsLoading(false);
      }
    };
    
    fetchData();
  }, []);
  
  // Count leads by status
  const newLeadsCount = leads.filter(lead => lead.status === 'new').length;
  const negotiationLeadsCount = leads.filter(lead => lead.status === 'negotiation').length;
  const wonLeadsCount = leads.filter(lead => lead.status === 'won').length;
  const lostLeadsCount = leads.filter(lead => lead.status === 'lost').length;
  
  // Calculate total quotation value
  const totalQuotationValue = quotations.reduce((total, quotation) => total + quotation.totalRent, 0);
  
  // Recent leads (limit to 5)
  const recentLeads = [...leads].sort((a, b) => {
    return new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime();
  }).slice(0, 5);
  
  if (isLoading) {
    return <div className="flex justify-center py-10">Loading dashboard...</div>;
  }
  
  return (
    <div className="space-y-6">
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
        <StatCard
          title="New Leads"
          value={newLeadsCount}
          icon={<ClipboardList className="h-5 w-5 text-primary-600" />}
          variant="primary"
        />
        <StatCard
          title="Negotiation"
          value={negotiationLeadsCount}
          icon={<Users className="h-5 w-5 text-secondary-600" />}
          variant="secondary"
        />
        <StatCard
          title="Won Deals"
          value={wonLeadsCount}
          icon={<DollarSign className="h-5 w-5 text-success-600" />}
          variant="success"
          trend={{ value: 12, isPositive: true }}
        />
        <StatCard
          title="Quotation Value"
          value={`$${totalQuotationValue.toLocaleString()}`}
          icon={<CreditCard className="h-5 w-5 text-accent-600" />}
          variant="accent"
        />
      </div>
      
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        <div className="lg:col-span-2">
          <Card>
            <CardHeader>
              <div className="flex justify-between items-center">
                <CardTitle>Recent Leads</CardTitle>
                <Link to="/leads">
                  <Button variant="outline" size="sm">View All</Button>
                </Link>
              </div>
            </CardHeader>
            <CardContent>
              {recentLeads.length === 0 ? (
                <p className="text-gray-500 text-center py-4">No leads found</p>
              ) : (
                <div className="overflow-x-auto">
                  <table className="min-w-full divide-y divide-gray-200">
                    <thead className="bg-gray-50">
                      <tr>
                        <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                          Customer
                        </th>
                        <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                          Service
                        </th>
                        <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                          Status
                        </th>
                        <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                          Date
                        </th>
                      </tr>
                    </thead>
                    <tbody className="bg-white divide-y divide-gray-200">
                      {recentLeads.map((lead) => (
                        <tr key={lead.id} className="hover:bg-gray-50">
                          <td className="px-6 py-4 whitespace-nowrap">
                            <div className="font-medium text-gray-900">{lead.customerName}</div>
                          </td>
                          <td className="px-6 py-4 whitespace-nowrap">
                            <div className="text-sm text-gray-500">{lead.serviceNeeded}</div>
                          </td>
                          <td className="px-6 py-4 whitespace-nowrap">
                            <StatusBadge status={lead.status} />
                          </td>
                          <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                            {new Date(lead.createdAt).toLocaleDateString()}
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              )}
            </CardContent>
          </Card>
        </div>
        
        <div>
          <Card className="h-full">
            <CardHeader>
              <CardTitle>Upcoming Tasks</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                <div className="flex items-start space-x-3">
                  <div className="flex-shrink-0 mt-1">
                    <CreditCard className="h-5 w-5 text-primary-500" />
                  </div>
                  <div>
                    <h4 className="text-sm font-medium text-gray-900">Prepare Quotation</h4>
                    <p className="text-xs text-gray-500 mt-1">BuildRight Inc. requires updated pricing by tomorrow</p>
                  </div>
                </div>
                
                <div className="flex items-start space-x-3">
                  <div className="flex-shrink-0 mt-1">
                    <CalendarClock className="h-5 w-5 text-primary-500" />
                  </div>
                  <div>
                    <h4 className="text-sm font-medium text-gray-900">Client Meeting</h4>
                    <p className="text-xs text-gray-500 mt-1">Harbor Construction - 2:30 PM Tomorrow</p>
                  </div>
                </div>
                
                <div className="flex items-start space-x-3">
                  <div className="flex-shrink-0 mt-1">
                    <BarChart3 className="h-5 w-5 text-primary-500" />
                  </div>
                  <div>
                    <h4 className="text-sm font-medium text-gray-900">Monthly Report</h4>
                    <p className="text-xs text-gray-500 mt-1">Submit sales summary by end of week</p>
                  </div>
                </div>
              </div>
              
              <div className="mt-6">
                <Button variant="outline" size="sm" fullWidth>
                  Add New Task
                </Button>
              </div>
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
}