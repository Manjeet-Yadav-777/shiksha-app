import type { IClass } from "../classes/store";
import type { ITenant } from "../tenants/store";

export interface ISectionClassTeacher {
  _id: string;
  employeeId: string;
  user?: { name?: string; email?: string };
}

export interface ISection {
  _id: string;
  tenant: string | ITenant;
  class: string | IClass;
  name: string;
  roomNumber?: string;
  classTeacher?: ISectionClassTeacher | string | null;
  createdAt: string;
  updatedAt: string;
}

export const SubjectType = {
  THEORY: "theory",
  PRACTICAL: "practical",
} as const;

export type SubjectType = (typeof SubjectType)[keyof typeof SubjectType];

export interface ISubject {
  _id: string;
  tenant: string | ITenant;
  name: string;
  code: string;
  type: SubjectType;
  createdAt: string;
  updatedAt: string;
}

export interface IClassSubject {
  _id: string;
  tenant: string | ITenant;
  class: string | IClass;
  subject: ISubject;
  isOptional: boolean;
  createdAt: string;
  updatedAt: string;
}
