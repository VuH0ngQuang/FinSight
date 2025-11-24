export enum SubscriptionEnum {
    ACTIVE = "ACTIVE",
    EXPIRED = "EXPIRED",
    CANCELED = "CANCELED",
}

export interface SubscriptionDto {
    subscriptionId: string;
    userId: string;
    subscriptionPlanId: number;
    startDate: string;
    endDate: string;
    status: SubscriptionEnum;
}

