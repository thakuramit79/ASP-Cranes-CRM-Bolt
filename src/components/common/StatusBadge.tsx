import React from 'react';
import { Badge } from './Badge';
import { LeadStatus } from '../../types/lead';
import { JobStatus } from '../../types/job';

interface StatusBadgeProps {
  status: LeadStatus | JobStatus;
  className?: string;
}

export function StatusBadge({ status, className }: StatusBadgeProps) {
  let variant: any;
  let label: string = status.replace('_', ' ');
  
  label = label
    .split(' ')
    .map(word => word.charAt(0).toUpperCase() + word.slice(1))
    .join(' ');
  
  switch (status) {
    case 'new':
      variant = 'default';
      break;
    case 'in_process':
      variant = 'secondary';
      break;
    case 'qualified':
      variant = 'success';
      break;
    case 'unqualified':
      variant = 'error';
      break;
    case 'won':
      variant = 'success';
      break;
    case 'lost':
      variant = 'error';
      break;
    case 'negotiation':
      variant = 'warning';
      break;
    case 'scheduled':
      variant = 'secondary';
      break;
    case 'accepted':
      variant = 'success';
      break;
    case 'rejected':
      variant = 'error';
      break;
    case 'in_progress':
      variant = 'warning';
      break;
    case 'completed':
      variant = 'success';
      break;
    default:
      variant = 'outline';
  }
  
  return (
    <Badge variant={variant} className={className}>
      {label}
    </Badge>
  );
}