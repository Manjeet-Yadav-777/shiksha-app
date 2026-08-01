import type { ITenant } from '../tenants/store';

export interface IUser {
  _id?: number;
  name: string;
  email: string;
  passwordHash: string;
  role: 'super_admin' | 'school_admin' | 'teacher' | 'student' | 'parent';
  tenant?: ITenant;
  status: 'active' | 'suspended';
  // Sirf teacher role ke liye backend bhejta hai — iski TeacherProfile._id, jo
  // "my timetable" jaisi APIs ke liye chahiye (user._id nahi chalta).
  teacherProfile?: number;
  createdAt: string;
  updatedAt: string;
}
