import type { ISubscription } from "../subscriptions/store";
import type { ITenant } from "../tenants/store";

export const InstallmentStatus = {
  PENDING: "pending",
  PARTIAL: "partial",
  PAID: "paid",
  OVERDUE: "overdue",
} as const;

export type InstallmentStatus =
    (typeof InstallmentStatus)[keyof typeof InstallmentStatus];

export interface IInstallment {
  _id : string
  tenant: ITenant;
  subscription: ISubscription;

  amount: number;
  paid_amount: number;
  due_amount: number;

  due_date: string | null;

  status: InstallmentStatus;

  notes?: string;
  billing_cycle_start: string;

  billing_cycle_end: string;
}
