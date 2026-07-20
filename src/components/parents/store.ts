import type { IUser } from "../Auth/store";
import type { ITenant } from "../tenants/store";
import type { IClass } from "../classes/store";
import type { IPeriodSlot } from "../timetable/store";
import type { ISubject } from "../subjects/store";
import type { IStudent } from "../students/store";

// listParents ka ek row — user + linked children populated aate hain.
export interface IParent {
  _id: string;
  tenant: string | ITenant;
  user: IUser;
  occupation?: string;
  students: IStudent[];
  createdAt: string;
  updatedAt: string;
  deletedAt?: string;
}

// --- PARENT PORTAL (logged-in parent apne bachche dekhta hai) ---

// getMyChildren / getChildProfile ka shape — class/section populated.
export interface IChild {
  _id: string;
  rollNumber: string;
  admissionNumber: string;
  admissionDate?: string;
  user?: { _id: string; name: string; email?: string };
  class?: IClass;
  section?: { _id: string; name: string; roomNumber?: string };
}

// getChildTimetable ka ek entry.
export interface IChildTimetableEntry {
  _id: string;
  dayOfWeek: number; // 1=Mon .. 6=Sat
  periodSlot: IPeriodSlot;
  subject: ISubject;
  teacher?: { _id: string; employeeId?: string; user?: { name?: string } };
  room?: string;
  academicSession: string;
}

// Backend ke ATTENDANCE_STATUSES ke saath in-sync.
export type AttendanceStatus =
  | "present"
  | "absent"
  | "late"
  | "excused"
  | "half_day";

export interface IChildAttendance {
  total: number;
  breakdown: Record<AttendanceStatus, number>;
  percentage: number;
  academicSession: string;
}

// Attendance status ka display label + color (Mantine palette).
export const STATUS_META: Record<
  AttendanceStatus,
  { label: string; color: string }
> = {
  present: { label: "Present", color: "green" },
  absent: { label: "Absent", color: "red" },
  late: { label: "Late", color: "yellow" },
  excused: { label: "Excused", color: "blue" },
  half_day: { label: "Half Day", color: "grape" },
};

// getChildFees ka shape — fee rows + summary.
export interface IChildFeeRow {
  _id: string;
  netAmount: number;
  amountPaid: number;
  discount: number;
  fine: number;
  dueDate: string;
  status: "paid" | "pending" | "partial";
  feeStructure?: { _id: string; name: string; dueDate?: string };
}

export interface IChildFees {
  fees: IChildFeeRow[];
  summary: { totalDue: number; totalPaid: number; outstanding: number };
}

export const FEE_STATUS_COLOR: Record<string, string> = {
  paid: "green",
  partial: "yellow",
  pending: "red",
};
