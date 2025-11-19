package com.finsight.marketrealtime.model;

import jakarta.persistence.*;
import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.util.UUID;

@Builder
@NoArgsConstructor
@AllArgsConstructor
@Data
@Entity
public class AhpConfigEntity {

    @Id
    private UUID ahpConfigId;

    @OneToOne
    @JoinColumn(name = "userId")
    private UserEntity user;

    // === DEFAULT: criteria list ===
    // ["DDM","DCFM","RI","PB","PE","PC","PS"]
    @Lob
    private String criteriaJson = "[\"DDM\",\"DCFM\",\"RI\",\"PB\",\"PE\",\"PC\",\"PS\"]";

    // === DEFAULT: AHP pairwise matrix (7x7 identity of 1's) ===
    // double[][] as JSON
    @Lob
    private String pairwiseMatrixJson =
            "[" +
                    "[1,1,1,1,1,1,1]," +
                    "[1,1,1,1,1,1,1]," +
                    "[1,1,1,1,1,1,1]," +
                    "[1,1,1,1,1,1,1]," +
                    "[1,1,1,1,1,1,1]," +
                    "[1,1,1,1,1,1,1]," +
                    "[1,1,1,1,1,1,1]" +
                    "]";

    // === DEFAULT: equal weights (1/7 each) ===
    // double[] as JSON
    @Lob
    private String weightsJson = "[0.142857, 0.142857, 0.142857, 0.142857, 0.142857, 0.142857, 0.142857]";

}
