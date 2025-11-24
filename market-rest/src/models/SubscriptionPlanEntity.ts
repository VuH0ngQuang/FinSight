import type { Subscription } from "./Subscription";

export enum BillingCycle {
    MONTHLY = "MONTHLY",
    YEARLY = "YEARLY",
}

export interface SubscriptionPlanEntity {
    planId: number;
    planName: string;
    price: number;
    billingCycle: BillingCycle;
    subscriptions: Subscription[];
}

