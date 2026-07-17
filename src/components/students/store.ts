import type { IUser } from "../Auth/store";
import type { ITenant } from "../tenants/store";

export interface IStudent{
    tenant: ITenant;
    user: IUser;
    rollNumber: string;
    class: any;
    section: any;
    admissionNumber: string;
    admissionDate?: Date;
    parent?: any;
    createdAt: Date;
    updatedAt: Date;   
}