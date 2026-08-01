import type { ITenant } from '../tenants/store';
import type { ISubject } from '../subjects/store';
import type { ITeacher } from '../teachers/store';
import type { IClass } from '../classes/store';

export interface IPeriodSlot {
  _id: number;
  tenant: number | ITenant;
  periodNumber: number;
  label?: string;
  startTime: string; // "HH:mm"
  endTime: string; // "HH:mm"
  isBreak: boolean;
  createdAt: string;
  updatedAt: string;
}

// teacher/subject/periodSlot/section aksar populated aate hain (grid views me),
// isliye ref ya full object dono allow.
export interface ITimetableEntry {
  _id: number;
  tenant: number | ITenant;
  section:
    number | { _id: number; name: string; class?: IClass; roomNumber?: string };
  dayOfWeek: number; // 1=Mon .. 6=Sat
  periodSlot: number | IPeriodSlot;
  subject: number | ISubject;
  teacher: number | ITeacher;
  academicSession: string;
  room?: string;
  createdAt: string;
  updatedAt: string;
}

// Mon..Sat — index 0 unused taaki dayOfWeek (1-based) seedha map ho.
export const DAYS: { value: number; label: string; short: string }[] = [
  { value: 1, label: 'Monday', short: 'Mon' },
  { value: 2, label: 'Tuesday', short: 'Tue' },
  { value: 3, label: 'Wednesday', short: 'Wed' },
  { value: 4, label: 'Thursday', short: 'Thu' },
  { value: 5, label: 'Friday', short: 'Fri' },
  { value: 6, label: 'Saturday', short: 'Sat' },
];
