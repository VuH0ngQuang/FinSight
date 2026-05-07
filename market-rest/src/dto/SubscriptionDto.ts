export enum SubscriptionEnum {
    ACTIVE = "ACTIVE",
    EXPIRED = "EXPIRED",
    CANCELED = "CANCELED",
}

export interface SubscriptionDto {
    subscriptionId: string;
    userId: string;
    subscriptionPlanId: number;
    type?: string;
    startDate: string;
    endDate: string;
    status: SubscriptionEnum;
}

