import type { ITenant } from "../tenants/store";
import type { IClass } from "../classes/store";

// Backend ke ATTENDANCE_STATUSES ke saath in-sync rehna chahiye. Naya status
// backend me add karne ke baad yahan bhi add karo — UI isi list se derive hota hai.
export const ATTENDANCE_STATUSES = [
  "present",
  "absent",
  "late",
  "excused",
  "half_day",
] as const;
export type AttendanceStatus = (typeof ATTENDANCE_STATUSES)[number];

// Status ka display label + color (Mantine palette). Toggle buttons aur badges
// dono isi map se render hote hain.
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

// getMySections / classTeacher populated section.
export interface IMySection {
  _id: string;
  name: string;
  roomNumber?: string;
  class?: IClass;
  classTeacher?: string;
  tenant?: string | ITenant;
}

// getSectionRoster ka ek student.
export interface IRosterStudent {
  _id: string;
  rollNumber: string;
  user?: { _id: string; name: string };
}

export interface IAttendanceCounts {
  total: number;
  present: number;
  absent: number;
  late: number;
  excused: number;
  half_day: number;
}

// getSectionAttendance session shape (counts + lock state).
export interface IAttendanceSession {
  _id: string;
  section: string;
  academicSession: string;
  date: string;
  dateKey: string;
  periodSlot?: string | null;
  isFinalized: boolean;
  finalizedAt?: string | null;
  counts: IAttendanceCounts;
}

// getSectionAttendance ka ek record (student populated).
export interface IAttendanceRecord {
  _id: string;
  student: IRosterStudent | string;
  status: AttendanceStatus;
  remark?: string;
}

// markAttendance ka request body.
export interface IMarkAttendanceBody {
  sectionId: string;
  date: string; // "YYYY-MM-DD"
  academicSession: string;
  periodSlotId?: string | null;
  subjectId?: string | null;
  entries: Array<{ studentId: string; status: AttendanceStatus; remark?: string }>;
}
