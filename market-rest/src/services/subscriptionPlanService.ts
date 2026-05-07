import type { RowDataPacket } from "mysql2";
import { pool } from "../config/database";
import type { SubscriptionPlanEntity } from "../models/SubscriptionPlanEntity";
import { BillingCycle } from "../models/SubscriptionPlanEntity";

interface SubscriptionPlanRow extends RowDataPacket {
  planId: number;
  planName: string;
  price: number | string | null;
  billingCycle: string;
}

class SubscriptionPlanService {
  async getAllPlans(): Promise<SubscriptionPlanEntity[]> {
    const [rows] = await pool.query<SubscriptionPlanRow[]>(
      `
        SELECT
          plan_id AS planId,
          plan_name AS planName,
          price,
          billing_cycle AS billingCycle
        FROM subscription_plan_entity
        ORDER BY plan_id ASC
      `
    );

    return rows.map((row) => ({
      planId: row.planId,
      planName: row.planName,
      price: typeof row.price === "number" ? row.price : Number(row.price || 0),
      billingCycle:
        row.billingCycle === BillingCycle.YEARLY ? BillingCycle.YEARLY : BillingCycle.MONTHLY,
    }));
  }
}

export const subscriptionPlanService = new SubscriptionPlanService();
