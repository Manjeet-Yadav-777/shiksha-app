import type { ITenant } from '../tenants/store';

export const BillingCycle = {
  MONTHLY: 'monthly',
  YEARLY: 'yearly',
  LIFETIME: 'lifetime',
} as const;

export type BillingCycle = (typeof BillingCycle)[keyof typeof BillingCycle];

export const SubscriptionStatus = {
  ACTIVE: 'active',
  EXPIRED: 'expired',
  CANCELLED: 'cancelled',
  TRIAL: 'trial',
} as const;

export type SubscriptionStatus =
  (typeof SubscriptionStatus)[keyof typeof SubscriptionStatus];

export interface ISubscription {
  _id: number;

  tenant: number | ITenant;

  amount: number;
  currency: string;

  billingCycle: BillingCycle;

  startDate: string;
  endDate?: string | null;
  nextBillingDate?: string | null;

  autoRenew: boolean;

  status: SubscriptionStatus;

  notes?: string;

  createdAt: string;
  updatedAt: string;
}
