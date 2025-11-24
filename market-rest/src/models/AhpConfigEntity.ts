import type { UserEntity } from "./UserEntity";

export interface AhpConfigEntity {
    ahpConfigId: string;
    user: UserEntity;
    criteriaJson: string;
    pairwiseMatrixJson: string;
    weightsJson: string;
}

