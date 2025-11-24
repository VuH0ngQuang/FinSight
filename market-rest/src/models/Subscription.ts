import type { UserEntity } from "./UserEntity";
import type { SubscriptionPlanEntity } from "./SubscriptionPlanEntity";

export enum SubscriptionEnum {
    ACTIVE = "ACTIVE",
    EXPIRED = "EXPIRED",
    CANCELED = "CANCELED",
}

export interface Subscription {
    subscriptionId: string;
    startDate: string;
    endDate: string;
    status: SubscriptionEnum;
    user: UserEntity;
    subscriptionPlan: SubscriptionPlanEntity;
}

