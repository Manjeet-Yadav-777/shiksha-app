import type { ITenant } from '../tenants/store';
import type { IClass } from '../classes/store';
import type { IStudent } from '../students/store';

export type FeeFrequency = 'one_time' | 'monthly' | 'quarterly' | 'annual';
export type StudentFeeStatus = 'paid' | 'pending' | 'partial';
export type PaymentMethod = 'cash' | 'card' | 'bank_transfer' | 'online';

export interface IFeeStructure {
  _id: number;
  tenant: number | ITenant;
  name: string;
  amount: number;
  dueDate: string;
  frequency: FeeFrequency;
  class?: IClass;
  academicSession: string;
  createdAt: string;
  updatedAt: string;
}

export interface IStudentFee {
  _id: number;
  tenant: number | ITenant;
  student: IStudent;
  feeStructure: IFeeStructure;
  netAmount: number;
  amountPaid: number;
  discount: number;
  fine: number;
  dueDate: string;
  status: StudentFeeStatus;
  createdAt: string;
  updatedAt: string;
}

export interface IFeePayment {
  _id: number;
  tenant: number | ITenant;
  studentFee: number | IStudentFee;
  amount: number;
  paymentMethod: PaymentMethod;
  paymentDate: string;
  receiptNumber: string;
  remarks?: string;
  createdAt: string;
  updatedAt: string;
}

export const FREQUENCY_OPTIONS: { value: FeeFrequency; label: string }[] = [
  { value: 'one_time', label: 'One Time' },
  { value: 'monthly', label: 'Monthly' },
  { value: 'quarterly', label: 'Quarterly' },
  { value: 'annual', label: 'Annual' },
];

export const PAYMENT_METHOD_OPTIONS: { value: PaymentMethod; label: string }[] =
  [
    { value: 'cash', label: 'Cash' },
    { value: 'card', label: 'Card' },
    { value: 'bank_transfer', label: 'Bank Transfer' },
    { value: 'online', label: 'Online' },
  ];

export const STATUS_OPTIONS: { value: StudentFeeStatus; label: string }[] = [
  { value: 'pending', label: 'Pending' },
  { value: 'partial', label: 'Partial' },
  { value: 'paid', label: 'Paid' },
];

export function statusColor(status: StudentFeeStatus): string {
  if (status === 'paid') return 'green';
  if (status === 'partial') return 'yellow';
  return 'red';
}

// Sessions run Apr->Mar in most Indian schools; offer current + a couple around it.
export function defaultSession(): string {
  return '2025-2026';
}

export function sessionOptions() {
  return [
    { value: '2024-2025', label: '2024-2025' },
    { value: '2025-2026', label: '2025-2026' },
    { value: '2026-2027', label: '2026-2027' },
  ];
}
