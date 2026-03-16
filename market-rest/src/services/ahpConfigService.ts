
import type { RowDataPacket } from 'mysql2';
import { pool } from '../config/database';
import type { AhpConfigDto } from '../dto/AhpConfigDto';

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
    return {
      ahpConfigId: row.ahpConfigId,
      userId: row.userId,
      criteriaJson: row.criteriaJson,
      pairwiseMatrixJson: row.pairwiseMatrixJson,
      weightsJson: row.weightsJson,
    };
  }
}

export const ahpConfigService = new AhpConfigService();

