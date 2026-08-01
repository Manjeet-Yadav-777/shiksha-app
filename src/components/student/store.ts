import type { IPeriodSlot } from '../timetable/store';
import type { ISubject } from '../subjects/store';
import type { IClass } from '../classes/store';

// getMyProfile ka shape — class/section populated aate hain.
export interface IMyProfile {
  _id: number;
  rollNumber: string;
  admissionNumber: string;
  admissionDate?: string;
  class?: IClass;
  section?: { _id: number; name: string; roomNumber?: string };
}

// getMyTimetable ka ek entry — section student ka apna hai isliye section field
// wapas nahi aata; sirf period/subject/teacher chahiye.
export interface IMyTimetableEntry {
  _id: number;
  dayOfWeek: number; // 1=Mon .. 6=Sat
  periodSlot: IPeriodSlot;
  subject: ISubject;
  teacher?: { _id: number; employeeId?: string; user?: { name?: string } };
  room?: string;
  academicSession: string;
}

// Backend ke ATTENDANCE_STATUSES ke saath in-sync.
export type AttendanceStatus =
  'present' | 'absent' | 'late' | 'excused' | 'half_day';

// getMyAttendance ka response — status-wise breakdown + attendance %.
export interface IMyAttendance {
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
  present: { label: 'Present', color: 'green' },
  absent: { label: 'Absent', color: 'red' },
  late: { label: 'Late', color: 'yellow' },
  excused: { label: 'Excused', color: 'blue' },
  half_day: { label: 'Half Day', color: 'grape' },
};
