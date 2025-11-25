import type { AhpConfigEntity } from '../models/AhpConfigEntity';
import type { Subscription } from '../models/Subscription';

export interface UserDetailDto {
  userId: string;
  username: string;
  email: string;
  phoneNumber: string;
  createdAt: string;
  isAdmin: boolean;
  subscriptions: Subscription[];
  ahpConfig: AhpConfigEntity | null;
}

