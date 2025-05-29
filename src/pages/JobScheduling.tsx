import React, { useState, useEffect } from 'react';
import { 
  Calendar as CalendarIcon,
  ChevronLeft,
  ChevronRight,
  Clock,
  MapPin,
  Plus,
  Truck,
  User,
  X
} from 'lucide-react';
import { format, addDays, startOfWeek, endOfWeek, eachDayOfInterval, addHours, isSameDay, isWithinInterval } from 'date-fns';
import { Card, CardHeader, CardTitle, CardContent } from '../components/common/Card';
import { Button } from '../components/common/Button';
import { Input } from '../components/common/Input';
import { Select } from '../components/common/Select';
import { TextArea } from '../components/common/TextArea';
import { Modal } from '../components/common/Modal';
import { StatusBadge } from '../components/common/StatusBadge';
import { Toast } from '../components/common/Toast';
import { useAuthStore } from '../store/authStore';
import { getJobs, getAllEquipment, getAllOperators, createJob, updateJobStatus } from '../services/jobService';
import { getLeads } from '../services/leadService';
import { Job, Equipment, Operator } from '../types/job';
import { Lead } from '../types/lead';

const TIME_SLOTS = Array.from({ length: 15 }, (_, i) => addHours(new Date().setHours(6, 0, 0, 0), i));

export function JobScheduling() {
  const { user } = useAuthStore();
  const [view, setView] = useState<'week' | 'month'>('week');
  const [currentDate, setCurrentDate] = useState(new Date());
  const [jobs, setJobs] = useState<Job[]>([]);
  const [equipment, setEquipment] = useState<Equipment[]>([]);
  const [operators, setOperators] = useState<Operator[]>([]);
  const [leads, setLeads] = useState<Lead[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [isCreateModalOpen, setIsCreateModalOpen] = useState(false);
  const [selectedTimeSlot, setSelectedTimeSlot] = useState<Date | null>(null);
  const [selectedJob, setSelectedJob] = useState<Job | null>(null);
  const [toast, setToast] = useState<{
    show: boolean;
    title: string;
    description?: string;
    variant?: 'success' | 'error' | 'warning';
  }>({ show: false, title: '' });

  const [formData, setFormData] = useState({
    leadId: '',
    equipmentId: '',
    operatorId: '',
    startDate: '',
    endDate: '',
    location: '',
    notes: '',
  });

  useEffect(() => {
    fetchData();
  }, []);

  const fetchData = async () => {
    try {
      const [jobsData, equipmentData, operatorsData, leadsData] = await Promise.all([
        getJobs(),
        getAllEquipment(),
        getAllOperators(),
        getLeads(),
      ]);

      setJobs(jobsData);
      setEquipment(equipmentData);
      setOperators(operatorsData);
      setLeads(leadsData.filter(lead => lead.status === 'won'));
    } catch (error) {
      console.error('Error fetching data:', error);
      showToast('Error fetching data', 'error');
    } finally {
      setIsLoading(false);
    }
  };

  const handleCreateJob = async () => {
    try {
      const lead = leads.find(l => l.id === formData.leadId);
      if (!lead) return;

      const newJob = await createJob({
        leadId: formData.leadId,
        customerName: lead.customerName,
        equipmentId: formData.equipmentId,
        operatorId: formData.operatorId,
        startDate: formData.startDate,
        endDate: formData.endDate,
        location: formData.location,
        status: 'scheduled',
        notes: formData.notes,
      });

      setJobs(prev => [...prev, newJob]);
      setIsCreateModalOpen(false);
      resetForm();
      showToast('Job created successfully', 'success');
    } catch (error) {
      console.error('Error creating job:', error);
      showToast('Error creating job', 'error');
    }
  };

  const handleStatusChange = async (jobId: string, newStatus: Job['status']) => {
    try {
      const updatedJob = await updateJobStatus(jobId, newStatus);
      if (updatedJob) {
        setJobs(prev => prev.map(job => job.id === jobId ? updatedJob : job));
        showToast('Job status updated', 'success');
      }
    } catch (error) {
      console.error('Error updating job status:', error);
      showToast('Error updating job status', 'error');
    }
  };

  const resetForm = () => {
    setFormData({
      leadId: '',
      equipmentId: '',
      operatorId: '',
      startDate: '',
      endDate: '',
      location: '',
      notes: '',
    });
    setSelectedTimeSlot(null);
  };

  const showToast = (title: string, variant: 'success' | 'error' | 'warning' = 'success') => {
    setToast({ show: true, title, variant });
    setTimeout(() => setToast({ show: false, title: '' }), 3000);
  };

  const checkAvailability = (equipmentId: string, operatorId: string, startDate: string, endDate: string) => {
    const conflictingJobs = jobs.filter(job => {
      const jobStart = new Date(job.startDate);
      const jobEnd = new Date(job.endDate);
      const newStart = new Date(startDate);
      const newEnd = new Date(endDate);

      return (
        (job.equipmentId === equipmentId || job.operatorId === operatorId) &&
        job.status !== 'completed' &&
        job.status !== 'cancelled' &&
        ((newStart >= jobStart && newStart < jobEnd) ||
          (newEnd > jobStart && newEnd <= jobEnd) ||
          (newStart <= jobStart && newEnd >= jobEnd))
      );
    });

    return conflictingJobs;
  };

  const renderWeekView = () => {
    const weekStart = startOfWeek(currentDate, { weekStartsOn: 1 });
    const weekEnd = endOfWeek(currentDate, { weekStartsOn: 1 });
    const days = eachDayOfInterval({ start: weekStart, end: weekEnd });

    return (
      <div className="relative">
        <div className="grid grid-cols-[100px_1fr] gap-4">
          <div className="sticky left-0 bg-white z-10">
            <div className="h-12" />
            {TIME_SLOTS.map((time, i) => (
              <div
                key={i}
                className="h-20 border-b border-gray-100 flex items-center justify-end pr-2 text-sm text-gray-500"
              >
                {format(time, 'h:mm a')}
              </div>
            ))}
          </div>

          <div className="overflow-x-auto">
            <div className="grid grid-cols-7 min-w-[900px]">
              {days.map((day, i) => (
                <div
                  key={i}
                  className="h-12 flex items-center justify-center border-b border-gray-200 font-medium"
                >
                  <div className="text-center">
                    <div className="text-sm text-gray-900">{format(day, 'EEE')}</div>
                    <div className="text-xs text-gray-500">{format(day, 'MMM d')}</div>
                  </div>
                </div>
              ))}

              {TIME_SLOTS.map((time, timeIndex) => (
                <React.Fragment key={timeIndex}>
                  {days.map((day, dayIndex) => {
                    const currentSlotStart = new Date(day.setHours(time.getHours(), time.getMinutes()));
                    const currentSlotEnd = addHours(currentSlotStart, 1);

                    const slotJobs = jobs.filter(job => {
                      const jobStart = new Date(job.startDate);
                      const jobEnd = new Date(job.endDate);
                      return (
                        isSameDay(currentSlotStart, jobStart) &&
                        isWithinInterval(currentSlotStart, { start: jobStart, end: jobEnd })
                      );
                    });

                    return (
                      <div
                        key={`${timeIndex}-${dayIndex}`}
                        className={`h-20 border-b border-r border-gray-100 relative ${
                          timeIndex === 0 ? 'border-t' : ''
                        } ${dayIndex === 0 ? 'border-l' : ''}`}
                        onClick={() => {
                          setSelectedTimeSlot(currentSlotStart);
                          setIsCreateModalOpen(true);
                          setFormData(prev => ({
                            ...prev,
                            startDate: currentSlotStart.toISOString().slice(0, 16),
                            endDate: addHours(currentSlotStart, 2).toISOString().slice(0, 16),
                          }));
                        }}
                      >
                        {slotJobs.map(job => (
                          <div
                            key={job.id}
                            className="absolute inset-x-0 mx-1 bg-primary-100 border border-primary-200 rounded-md p-2 cursor-pointer hover:bg-primary-200 transition-colors"
                            style={{
                              top: '4px',
                              minHeight: '40px',
                              zIndex: 10,
                            }}
                            onClick={(e) => {
                              e.stopPropagation();
                              setSelectedJob(job);
                            }}
                          >
                            <div className="flex items-center justify-between">
                              <span className="font-medium text-sm truncate">
                                {job.customerName}
                              </span>
                              <StatusBadge status={job.status} className="ml-2" />
                            </div>
                            <div className="text-xs text-gray-500 mt-1">
                              {format(new Date(job.startDate), 'h:mm a')} - {format(new Date(job.endDate), 'h:mm a')}
                            </div>
                          </div>
                        ))}
                      </div>
                    );
                  })}
                </React.Fragment>
              ))}
            </div>
          </div>
        </div>
      </div>
    );
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
      <div className="flex justify-between items-center">
        <div className="flex items-center gap-4">
          <Button
            variant="outline"
            size="icon"
            onClick={() => setCurrentDate(prev => addDays(prev, -7))}
          >
            <ChevronLeft className="h-4 w-4" />
          </Button>
          
          <h2 className="text-lg font-semibold">
            {format(currentDate, 'MMMM yyyy')}
          </h2>
          
          <Button
            variant="outline"
            size="icon"
            onClick={() => setCurrentDate(prev => addDays(prev, 7))}
          >
            <ChevronRight className="h-4 w-4" />
          </Button>
        </div>
        
        <div className="flex items-center gap-4">
          <Select
            options={[
              { value: 'week', label: 'Week View' },
              { value: 'month', label: 'Month View' },
            ]}
            value={view}
            onChange={(value) => setView(value as 'week' | 'month')}
            className="w-32"
          />
          
          <Button
            onClick={() => setIsCreateModalOpen(true)}
            leftIcon={<Plus size={16} />}
          >
            New Job
          </Button>
        </div>
      </div>

      <Card>
        <CardContent className="p-6">
          {isLoading ? (
            <div className="text-center py-4">Loading schedule...</div>
          ) : (
            renderWeekView()
          )}
        </CardContent>
      </Card>

      <Modal
        isOpen={isCreateModalOpen}
        onClose={() => {
          setIsCreateModalOpen(false);
          resetForm();
        }}
        title="Schedule New Job"
        size="lg"
      >
        <div className="space-y-6">
          <Select
            label="Select Customer"
            options={leads.map(lead => ({
              value: lead.id,
              label: `${lead.customerName} - ${lead.serviceNeeded}`,
            }))}
            value={formData.leadId}
            onChange={(value) => setFormData(prev => ({ ...prev, leadId: value }))}
            required
          />

          <div className="grid grid-cols-2 gap-4">
            <Select
              label="Equipment"
              options={equipment.map(item => ({
                value: item.id,
                label: item.name,
              }))}
              value={formData.equipmentId}
              onChange={(value) => setFormData(prev => ({ ...prev, equipmentId: value }))}
              required
            />

            <Select
              label="Operator"
              options={operators.map(op => ({
                value: op.id,
                label: op.name,
              }))}
              value={formData.operatorId}
              onChange={(value) => setFormData(prev => ({ ...prev, operatorId: value }))}
              required
            />
          </div>

          <div className="grid grid-cols-2 gap-4">
            <Input
              type="datetime-local"
              label="Start Date & Time"
              value={formData.startDate}
              onChange={(e) => setFormData(prev => ({ ...prev, startDate: e.target.value }))}
              required
            />

            <Input
              type="datetime-local"
              label="End Date & Time"
              value={formData.endDate}
              onChange={(e) => setFormData(prev => ({ ...prev, endDate: e.target.value }))}
              required
            />
          </div>

          <Input
            label="Location"
            value={formData.location}
            onChange={(e) => setFormData(prev => ({ ...prev, location: e.target.value }))}
            required
          />

          <TextArea
            label="Notes"
            value={formData.notes}
            onChange={(e) => setFormData(prev => ({ ...prev, notes: e.target.value }))}
            rows={4}
          />

          {formData.equipmentId && formData.operatorId && formData.startDate && formData.endDate && (
            <div className="bg-gray-50 p-4 rounded-md">
              <h4 className="font-medium mb-2">Availability Check</h4>
              {(() => {
                const conflicts = checkAvailability(
                  formData.equipmentId,
                  formData.operatorId,
                  formData.startDate,
                  formData.endDate
                );

                return conflicts.length > 0 ? (
                  <div className="text-error-600">
                    <p>Conflicts found:</p>
                    <ul className="list-disc list-inside text-sm">
                      {conflicts.map(conflict => (
                        <li key={conflict.id}>
                          {conflict.customerName} - {format(new Date(conflict.startDate), 'MMM d, h:mm a')}
                        </li>
                      ))}
                    </ul>
                  </div>
                ) : (
                  <p className="text-success-600">Equipment and operator are available for the selected time slot.</p>
                );
              })()}
            </div>
          )}
        </div>

        <div className="flex justify-end gap-3 mt-6">
          <Button
            variant="outline"
            onClick={() => {
              setIsCreateModalOpen(false);
              resetForm();
            }}
          >
            Cancel
          </Button>
          <Button onClick={handleCreateJob}>Schedule Job</Button>
        </div>
      </Modal>

      <Modal
        isOpen={!!selectedJob}
        onClose={() => setSelectedJob(null)}
        title="Job Details"
        size="lg"
      >
        {selectedJob && (
          <div className="space-y-6">
            <div className="grid grid-cols-2 gap-6">
              <div>
                <h4 className="text-sm font-medium text-gray-500">Customer</h4>
                <p className="mt-1">{selectedJob.customerName}</p>
              </div>

              <div>
                <h4 className="text-sm font-medium text-gray-500">Status</h4>
                <div className="mt-1">
                  <Select
                    options={[
                      { value: 'scheduled', label: 'Scheduled' },
                      { value: 'in_progress', label: 'In Progress' },
                      { value: 'completed', label: 'Completed' },
                      { value: 'cancelled', label: 'Cancelled' },
                    ]}
                    value={selectedJob.status}
                    onChange={(value) => handleStatusChange(selectedJob.id, value as Job['status'])}
                  />
                </div>
              </div>

              <div>
                <h4 className="text-sm font-medium text-gray-500">Equipment</h4>
                <p className="mt-1">
                  {equipment.find(e => e.id === selectedJob.equipmentId)?.name}
                </p>
              </div>

              <div>
                <h4 className="text-sm font-medium text-gray-500">Operator</h4>
                <p className="mt-1">
                  {operators.find(o => o.id === selectedJob.operatorId)?.name}
                </p>
              </div>

              <div>
                <h4 className="text-sm font-medium text-gray-500">Start Date</h4>
                <p className="mt-1">
                  {format(new Date(selectedJob.startDate), 'MMM d, yyyy h:mm a')}
                </p>
              </div>

              <div>
                <h4 className="text-sm font-medium text-gray-500">End Date</h4>
                <p className="mt-1">
                  {format(new Date(selectedJob.endDate), 'MMM d, yyyy h:mm a')}
                </p>
              </div>

              <div className="col-span-2">
                <h4 className="text-sm font-medium text-gray-500">Location</h4>
                <p className="mt-1">{selectedJob.location}</p>
              </div>

              <div className="col-span-2">
                <h4 className="text-sm font-medium text-gray-500">Notes</h4>
                <p className="mt-1">{selectedJob.notes || 'No notes'}</p>
              </div>
            </div>

            <div className="flex justify-end">
              <Button variant="outline" onClick={() => setSelectedJob(null)}>
                Close
              </Button>
            </div>
          </div>
        )}
      </Modal>

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