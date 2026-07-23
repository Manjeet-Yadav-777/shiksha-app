import type { IUser } from '../Auth/store';
import type { ISubscription } from '../subscriptions/store';

export interface ITenant {
  name: string;
  _id: string;
  slug: string;
  address: string;
  contactPhone: string;
  contactEmail: string;
  status: 'active' | 'suspended';
  admin: IUser;
  subscription?: ISubscription;
  createdAt: string;
  updatedAt: string;
}
