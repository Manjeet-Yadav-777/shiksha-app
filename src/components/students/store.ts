import type { IUser } from '../Auth/store';
import type { ITenant } from '../tenants/store';
import type { IClass, ISection } from '../classes/store';

export interface IStudent {
  _id: number;
  tenant: number | ITenant;
  user: IUser;
  rollNumber: string;
  class?: IClass;
  section?: ISection;
  admissionNumber: string;
  admissionDate?: string;
  parent?: { _id: number; user?: IUser } | number;
  createdAt: string;
  updatedAt: string;
  deletedAt?: string;
}
