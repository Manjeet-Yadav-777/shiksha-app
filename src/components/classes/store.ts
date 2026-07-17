import type { ITenant } from "../tenants/store";

export interface IClass {
  _id: string;
  tenant: string | ITenant;
  name: string;
  code?: string;
  createdAt: string;
  updatedAt: string;
}

export interface ISection {
  _id: string;
  tenant: string | ITenant;
  class: string | IClass;
  name: string;
  roomNumber?: string;
  createdAt: string;
  updatedAt: string;
}
