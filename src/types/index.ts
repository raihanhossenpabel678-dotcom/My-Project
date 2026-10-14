export type UserRole = 'customer' | 'provider';

export type TradeCategory = 'Plumber' | 'Electrician' | 'Carpenter' | 'AC Technician';

export interface User {
  id: string;
  name: string;
  email: string;
  role: UserRole;
  category?: TradeCategory;
  operatingArea?: string;
  avatar?: string;
  rating?: number;
  completedJobsCount?: number;
  phone?: string;
  companyName?: string;
  bio?: string;
}

export type JobStatus = 'open' | 'hired' | 'scheduled' | 'in_progress' | 'completed';
export type EscrowStatus = 'unfunded' | 'held' | 'released';

export interface Job {
  id: string;
  customerId: string;
  customerName: string;
  customerAvatar?: string;
  customerPhone?: string;
  title: string;
  category: TradeCategory;
  description: string;
  budget: number;
  location: string;
  urgency: 'Immediate (Today)' | 'Within 2-3 Days' | 'Flexible Schedule';
  createdAt: string;
  status: JobStatus;
  hiredBidId?: string;
  hiredProviderId?: string;
  hiredProviderName?: string;
  scheduledDate?: string;
  scheduledTimeSlot?: string;
  escrowStatus?: EscrowStatus;
  escrowAmount?: number;
  escrowFundedAt?: string;
  escrowReleasedAt?: string;
}

export type BidStatus = 'pending' | 'accepted' | 'declined';

export interface Bid {
  id: string;
  jobId: string;
  providerId: string;
  providerName: string;
  providerAvatar?: string;
  providerCategory: TradeCategory;
  providerRating: number;
  providerCompletedJobs: number;
  providerPhone?: string;
  proposedPrice: number;
  estimatedTime: string;
  pitch: string;
  createdAt: string;
  status: BidStatus;
}

export interface Message {
  id: string;
  jobId: string;
  senderId: string;
  senderName: string;
  senderRole: UserRole;
  text: string;
  createdAt: string;
}

export interface Review {
  id: string;
  jobId: string;
  customerId: string;
  customerName: string;
  providerId: string;
  rating: number;
  comment: string;
  createdAt: string;
}

export type AppView = 
  | 'home' 
  | 'login' 
  | 'register' 
  | 'customer-dashboard' 
  | 'post-job' 
  | 'provider-dashboard';
