import type { IClass } from '../classes/store';
import type { ITenant } from '../tenants/store';

export interface ISectionClassTeacher {
  _id: number;
  employeeId: string;
  user?: { name?: string; email?: string };
}

export interface ISection {
  _id: number;
  tenant: number | ITenant;
  class: number | IClass;
  name: string;
  roomNumber?: string;
  classTeacher?: ISectionClassTeacher | number | null;
  createdAt: string;
  updatedAt: string;
}

export const SubjectType = {
  THEORY: 'theory',
  PRACTICAL: 'practical',
  BOTH: 'both',
} as const;

export type SubjectType = (typeof SubjectType)[keyof typeof SubjectType];

export const SUBJECT_TYPE_OPTIONS = [
  { value: SubjectType.THEORY, label: 'Theory' },
  { value: SubjectType.PRACTICAL, label: 'Practical' },
  { value: SubjectType.BOTH, label: 'Both' },
] as const;

export function getSubjectTypeColor(type: SubjectType) {
  switch (type) {
    case SubjectType.PRACTICAL:
      return 'grape';
    case SubjectType.BOTH:
      return 'teal';
    default:
      return 'blue';
  }
}

export interface ISubject {
  _id: number;
  tenant: number | ITenant;
  name: string;
  code: string;
  type: SubjectType;
  createdAt: string;
  updatedAt: string;
}

export interface IClassSubject {
  _id: number;
  tenant: number | ITenant;
  class: number | IClass;
  subject: ISubject;
  isOptional: boolean;
  createdAt: string;
  updatedAt: string;
}
