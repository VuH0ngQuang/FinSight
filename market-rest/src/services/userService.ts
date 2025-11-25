import type { RowDataPacket } from 'mysql2';
import { pool } from '../config/database';
import type { UserEntity } from '../models/UserEntity';
import type { UserDetailDto } from '../dto/UserDetailDto';
import type { Subscription } from '../models/Subscription';
import type { AhpConfigEntity } from '../models/AhpConfigEntity';
import { SubscriptionEnum } from '../models/Subscription';
import type { SubscriptionPlanEntity } from '../models/SubscriptionPlanEntity';
import { BillingCycle } from '../models/SubscriptionPlanEntity';

interface UserRow extends RowDataPacket {
  userId: string;
  username: string;
  email: string;
  phoneNumber: string;
  createdAt: string;
  isAdmin: number | string | boolean;
}

interface SubscriptionRow extends RowDataPacket {
  subscriptionId: string;
  userId: string;
  startDate: string;
  endDate: string;
  status: string;
  planId: number;
  planName: string;
  price: number | string | null;
  billingCycle: string;
}

interface AhpConfigRow extends RowDataPacket {
  ahpConfigId: string;
  userId: string;
  criteriaJson: string;
  pairwiseMatrixJson: string;
  weightsJson: string;
}

class UserService {
  private toBoolean(value: number | string | boolean): boolean {
    if (typeof value === 'boolean') {
      return value;
    }

    if (typeof value === 'number') {
      return value !== 0;
    }

    const normalized = value.toString().toLowerCase();
    return normalized === 'true' || normalized === '1';
  }

  async getUserById(userId: string): Promise<UserDetailDto | null> {
    const [userRows] = await pool.query<UserRow[]>(
      `
      SELECT
        BIN_TO_UUID(user_id) AS userId,
        username,
        email,
        phone_number AS phoneNumber,
        created_at AS createdAt,
        is_admin AS isAdmin
      FROM user_entity
      WHERE user_id = UUID_TO_BIN(:userId)
      LIMIT 1
      `,
      { userId }
    );

    const userRow = userRows[0];
    if (!userRow) {
      return null;
    }

    // Get subscriptions
    const [subscriptionRows] = await pool.query<SubscriptionRow[]>(
      `
      SELECT
        BIN_TO_UUID(s.subscription_id) AS subscriptionId,
        BIN_TO_UUID(s.user_user_id) AS userId,
        s.start_date AS startDate,
        s.end_date AS endDate,
        s.status,
        sp.plan_id AS planId,
        sp.plan_name AS planName,
        sp.price,
        sp.billing_cycle AS billingCycle
      FROM subscription s
      LEFT JOIN subscription_plan_entity sp ON s.subscription_plan_plan_id = sp.plan_id
      WHERE s.user_user_id = UUID_TO_BIN(:userId)
      `,
      { userId }
    );

    const subscriptions: Subscription[] = subscriptionRows.map((row) => ({
      subscriptionId: row.subscriptionId,
      startDate: row.startDate,
      endDate: row.endDate,
      status: row.status as SubscriptionEnum,
      user: {} as UserEntity,
      subscriptionPlan: {
        planId: row.planId,
        planName: row.planName,
        price: typeof row.price === 'number' ? row.price : Number(row.price || 0),
        billingCycle: row.billingCycle as BillingCycle,
        subscriptions: [],
      } as SubscriptionPlanEntity,
    }));

    // Get AHP config
    const [ahpConfigRows] = await pool.query<AhpConfigRow[]>(
      `
      SELECT
        BIN_TO_UUID(ahp_config_id) AS ahpConfigId,
        BIN_TO_UUID(user_id) AS userId,
        criteria_json AS criteriaJson,
        pairwise_matrix_json AS pairwiseMatrixJson,
        weights_json AS weightsJson
      FROM ahp_config_entity
      WHERE user_id = UUID_TO_BIN(:userId)
      LIMIT 1
      `,
      { userId }
    );

    const ahpConfigRow = ahpConfigRows[0];
    const ahpConfig: AhpConfigEntity | null = ahpConfigRow
      ? {
          ahpConfigId: ahpConfigRow.ahpConfigId,
          user: {} as UserEntity,
          criteriaJson: ahpConfigRow.criteriaJson,
          pairwiseMatrixJson: ahpConfigRow.pairwiseMatrixJson,
          weightsJson: ahpConfigRow.weightsJson,
        }
      : null;

    const userDetail: UserDetailDto = {
      userId: userRow.userId,
      username: userRow.username,
      email: userRow.email,
      phoneNumber: userRow.phoneNumber,
      createdAt: userRow.createdAt,
      isAdmin: this.toBoolean(userRow.isAdmin),
      subscriptions,
      ahpConfig,
    };

    return userDetail;
  }
}

export const userService = new UserService();

