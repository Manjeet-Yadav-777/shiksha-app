import type { IUser } from "../Auth/store";
import type { ITenant } from "../tenants/store";
import type { IClass, ISection } from "../classes/store";

export interface IStudent {
  _id: string;
  tenant: string | ITenant;
  user: IUser;
  rollNumber: string;
  class?: IClass;
  section?: ISection;
  admissionNumber: string;
  admissionDate?: string;
  parent?: { _id: string; user?: IUser } | string;
  createdAt: string;
  updatedAt: string;
  deletedAt?: string;
}
