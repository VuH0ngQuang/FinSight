import type { AhpConfigEntity } from "./AhpConfigEntity";
import type { StockEntity } from "./StockEntity";
import type { Subscription } from "./Subscription";

export interface UserEntity {
    userId: string;
    username: string;
    email: string;
    password: string;
    phoneNumber: string;
    createdAt: string;
    isAdmin: boolean;
    favoriteStocks: StockEntity[];
    subscriptions: Subscription[];
    ahpConfig: AhpConfigEntity;
}

