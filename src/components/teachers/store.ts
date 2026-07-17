import type { IUser } from "../Auth/store";
import type { ITenant } from "../tenants/store";
import type { ISection, ISubject } from "../subjects/store";
import type { IClass } from "../classes/store";

export interface ITeacher {
  _id: string;
  tenant: string | ITenant;
  user: IUser;
  employeeId: string;
  joiningDate?: string;
  qualification?: string;
  createdAt: string;
  updatedAt: string;
}

export interface ITeacherAssignment {
  _id: string;
  tenant: string | ITenant;
  teacher: string | ITeacher;
  class: IClass;
  section?: ISection;
  subject: ISubject;
  academicSession: string;
  createdAt: string;
  updatedAt: string;
}
