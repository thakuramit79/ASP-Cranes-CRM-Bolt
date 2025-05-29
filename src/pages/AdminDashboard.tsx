import React, { useState, useEffect } from 'react';
import { 
  BarChart3, 
  DollarSign, 
  Truck, 
  Users, 
  Settings, 
  MapPin,
  Activity
} from 'lucide-react';
import { StatCard } from '../components/dashboard/StatCard';
import { Card, CardHeader, CardTitle, CardContent } from '../components/common/Card';
import { Button } from '../components/common/Button';
import { StatusBadge } from '../components/common/StatusBadge';
import { getLeads } from '../services/leadService';
import { getJobs, getAllEquipment, getAllOperators } from '../services/jobService';
import { Lead } from '../types/lead';
import { Job } from '../types/job';
import { Link } from 'react-router-dom';

export function AdminDashboard() {
  const [leads, setLeads] = useState<Lead[]>([]);
  const [jobs, setJobs] = useState<Job[]>([]);
  const [equipmentCount, setEquipmentCount] = useState(0);
  const [operatorCount, setOperatorCount] = useState(0);
  const [isLoading, setIsLoading] = useState(true);
  
  useEffect(() => {
    const fetchData = async () => {
      try {
        const [leadsData, jobsData, equipmentData, operatorsData] = await Promise.all([
          getLeads(),
          getJobs(),
          getAllEquipment(),
          getAllOperators(),
        ]);
        
        setLeads(leadsData);
        setJobs(jobsData);
        setEquipmentCount(equipmentData.length);
        setOperatorCount(operatorsData.length);
      } catch (error) {
        console.error('Error fetching dashboard data:', error);
      } finally {
        setIsLoading(false);
      }
    };
    
    fetchData();
  }, []);
  
  // Calculate KPIs
  const totalRevenue = jobs
    .filter(job => job.status === 'completed')
    .length * 5000; // Mock average revenue per job
  
  const equipmentUtilization = jobs.filter(
    job => job.status === 'in_progress' || job.status === 'scheduled'
  ).length / equipmentCount * 100;
  
  const wonLeadsCount = leads.filter(lead => lead.status === 'won').length;
  const totalLeads = leads.length;
  const conversionRate = totalLeads > 0 ? (wonLeadsCount / totalLeads * 100) : 0;
  
  if (isLoading) {
    return <div className="flex justify-center py-10">Loading dashboard...</div>;
  }
  
  return (
    <div className="space-y-6">
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
        <StatCard
          title="Total Revenue"
          value={`$${totalRevenue.toLocaleString()}`}
          icon={<DollarSign className="h-5 w-5 text-primary-600" />}
          variant="primary"
          trend={{ value: 15, isPositive: true }}
        />
        <StatCard
          title="Equipment Utilization"
          value={`${Math.round(equipmentUtilization)}%`}
          icon={<Truck className="h-5 w-5 text-secondary-600" />}
          variant="secondary"
        />
        <StatCard
          title="Lead Conversion"
          value={`${Math.round(conversionRate)}%`}
          icon={<Activity className="h-5 w-5 text-success-600" />}
          variant="success"
        />
        <StatCard
          title="Active Operators"
          value={operatorCount}
          icon={<Users className="h-5 w-5 text-accent-600" />}
          variant="accent"
        />
      </div>
      
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        <div className="lg:col-span-2">
          <Card>
            <CardHeader>
              <div className="flex justify-between items-center">
                <CardTitle>Recent Jobs</CardTitle>
                <Link to="/jobs">
                  <Button variant="outline" size="sm">View All</Button>
                </Link>
              </div>
            </CardHeader>
            <CardContent>
              {jobs.length === 0 ? (
                <p className="text-gray-500 text-center py-4">No recent jobs</p>
              ) : (
                <div className="overflow-x-auto">
                  <table className="min-w-full divide-y divide-gray-200">
                    <thead className="bg-gray-50">
                      <tr>
                        <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                          Customer
                        </th>
                        <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                          Location
                        </th>
                        <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                          Start Date
                        </th>
                        <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                          Status
                        </th>
                      </tr>
                    </thead>
                    <tbody className="bg-white divide-y divide-gray-200">
                      {jobs.slice(0, 5).map((job) => (
                        <tr key={job.id} className="hover:bg-gray-50">
                          <td className="px-6 py-4 whitespace-nowrap">
                            <div className="font-medium text-gray-900">{job.customerName}</div>
                          </td>
                          <td className="px-6 py-4 whitespace-nowrap">
                            <div className="text-sm text-gray-500">{job.location}</div>
                          </td>
                          <td className="px-6 py-4 whitespace-nowrap">
                            <div className="text-sm text-gray-500">
                              {new Date(job.startDate).toLocaleDateString()}
                            </div>
                          </td>
                          <td className="px-6 py-4 whitespace-nowrap">
                            <StatusBadge status={job.status} />
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
              <CardTitle>Quick Actions</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-3">
                <Link to="/users">
                  <Button variant="outline" size="sm" fullWidth leftIcon={<Users size={16} />}>
                    Manage Users
                  </Button>
                </Link>
                
                <Link to="/equipment">
                  <Button variant="outline" size="sm" fullWidth leftIcon={<Truck size={16} />}>
                    Equipment Management
                  </Button>
                </Link>
                
                <Link to="/locations">
                  <Button variant="outline" size="sm" fullWidth leftIcon={<MapPin size={16} />}>
                    Site Locations
                  </Button>
                </Link>
                
                <Link to="/reports">
                  <Button variant="outline" size="sm" fullWidth leftIcon={<BarChart3 size={16} />}>
                    View Reports
                  </Button>
                </Link>
                
                <Link to="/settings">
                  <Button variant="outline" size="sm" fullWidth leftIcon={<Settings size={16} />}>
                    System Settings
                  </Button>
                </Link>
              </div>
            </CardContent>
          </Card>
        </div>
      </div>
      
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <Card>
          <CardHeader>
            <CardTitle>Lead Pipeline</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              <div className="flex justify-between items-center">
                <div>
                  <p className="text-sm font-medium text-gray-500">New Leads</p>
                  <p className="text-2xl font-semibold text-gray-900">
                    {leads.filter(l => l.status === 'new').length}
                  </p>
                </div>
                <div>
                  <p className="text-sm font-medium text-gray-500">In Negotiation</p>
                  <p className="text-2xl font-semibold text-gray-900">
                    {leads.filter(l => l.status === 'negotiation').length}
                  </p>
                </div>
                <div>
                  <p className="text-sm font-medium text-gray-500">Won</p>
                  <p className="text-2xl font-semibold text-gray-900">
                    {leads.filter(l => l.status === 'won').length}
                  </p>
                </div>
                <div>
                  <p className="text-sm font-medium text-gray-500">Lost</p>
                  <p className="text-2xl font-semibold text-gray-900">
                    {leads.filter(l => l.status === 'lost').length}
                  </p>
                </div>
              </div>
            </div>
          </CardContent>
        </Card>
        
        <Card>
          <CardHeader>
            <CardTitle>Regional Performance</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              <div className="flex items-center justify-between p-3 bg-gray-50 rounded-lg">
                <div>
                  <p className="font-medium">North Region</p>
                  <p className="text-sm text-gray-500">12 Active Jobs</p>
                </div>
                <p className="text-lg font-semibold text-success-600">+24%</p>
              </div>
              
              <div className="flex items-center justify-between p-3 bg-gray-50 rounded-lg">
                <div>
                  <p className="font-medium">South Region</p>
                  <p className="text-sm text-gray-500">8 Active Jobs</p>
                </div>
                <p className="text-lg font-semibold text-success-600">+18%</p>
              </div>
              
              <div className="flex items-center justify-between p-3 bg-gray-50 rounded-lg">
                <div>
                  <p className="font-medium">East Region</p>
                  <p className="text-sm text-gray-500">15 Active Jobs</p>
                </div>
                <p className="text-lg font-semibold text-success-600">+32%</p>
              </div>
              
              <div className="flex items-center justify-between p-3 bg-gray-50 rounded-lg">
                <div>
                  <p className="font-medium">West Region</p>
                  <p className="text-sm text-gray-500">10 Active Jobs</p>
                </div>
                <p className="text-lg font-semibold text-warning-600">-5%</p>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}