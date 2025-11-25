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
  async getByUserId(userId: string): Promise<AhpConfigDto | null> {
    const [rows] = await pool.query<AhpConfigRow[]>(
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

