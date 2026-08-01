import type { ITenant } from '../tenants/store';

export interface IClass {
  _id: number;
  tenant: number | ITenant;
  name: string;
  code?: string;
  createdAt: string;
  updatedAt: string;
}

export interface ISection {
  _id: number;
  tenant: number | ITenant;
  class: number | IClass;
  name: string;
  roomNumber?: string;
  createdAt: string;
  updatedAt: string;
}
