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
  _id: string;

  tenant: string | ITenant;

  amount: number;
  currency: string;

  billing_cycle: BillingCycle;

  start_date: string;
  end_date?: string | null;
  next_billing_date?: string | null;

  auto_renew: boolean;

  status: SubscriptionStatus;

  notes?: string;

  createdAt: string;
  updatedAt: string;
}
