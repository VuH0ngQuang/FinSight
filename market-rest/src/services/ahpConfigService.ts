import type { RowDataPacket } from 'mysql2';
import { pool } from '../config/database';
import type { AhpConfigDto } from '../dto/AhpConfigDto';
import { cacheService } from '../utils/cacheService';

interface AhpConfigRow extends RowDataPacket {
  ahpConfigId: string;
  userId: string;
  criteriaJson: string;
  pairwiseMatrixJson: string;
  weightsJson: string;
}

class AhpConfigService {
  private isBigIntString(value: string): boolean {
    return /^[0-9]+$/.test(value.trim());
  }
  async getByUserId(userId: string): Promise<AhpConfigDto | null> {
    const normalizedUserId = userId.trim();
    if (!this.isBigIntString(normalizedUserId)) {
      return null;
    }

    const cached = await cacheService.hget<AhpConfigDto>('AHPCONFIG', normalizedUserId);
    if (cached) {
      return {
        ahpConfigId: String(cached.ahpConfigId),
        userId: String(cached.userId),
        criteriaJson: cached.criteriaJson,
        pairwiseMatrixJson: cached.pairwiseMatrixJson,
        weightsJson: cached.weightsJson,
      };
    }

    const [rows] = await pool.query<AhpConfigRow[]>(
      `
        SELECT
          CAST(ahp_config_id AS CHAR) AS ahpConfigId,
          CAST(user_id AS CHAR) AS userId,
          criteria_json AS criteriaJson,
          pairwise_matrix_json AS pairwiseMatrixJson,
          weights_json AS weightsJson
        FROM ahp_config_entity
        WHERE user_id = CAST(? AS UNSIGNED)
        LIMIT 1
      `,
      [normalizedUserId]
    );
    const row = rows[0];
    if (!row) {
      return null;
    }
    const dto: AhpConfigDto = {
      ahpConfigId: row.ahpConfigId,
      userId: row.userId,
      criteriaJson: row.criteriaJson,
      pairwiseMatrixJson: row.pairwiseMatrixJson,
      weightsJson: row.weightsJson,
    };
    await Promise.all([
      cacheService.hset('AHPCONFIG', row.userId, dto),
      cacheService.hset('AHPCONFIG', row.ahpConfigId, dto),
    ]);
    return dto;
  }
}

export const ahpConfigService = new AhpConfigService();

