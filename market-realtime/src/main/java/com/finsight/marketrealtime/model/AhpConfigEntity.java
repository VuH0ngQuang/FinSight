package com.finsight.marketrealtime.model;

import jakarta.persistence.*;
import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.EqualsAndHashCode;
import lombok.Getter;
import lombok.NoArgsConstructor;
import lombok.Setter;

import java.util.UUID;

@Builder
@NoArgsConstructor
@AllArgsConstructor
@Getter
@Setter
@EqualsAndHashCode(onlyExplicitlyIncluded = true)
@Entity
public class AhpConfigEntity {

    @Id
    @EqualsAndHashCode.Include
    private long ahpConfigId;

    // === DEFAULT: criteria list ===
    // ["DDM","DCFM","RI","PB","PE","PC","PS"]
    @Builder.Default
    @Lob
    private String criteriaJson = "[\"DDM\",\"DCFM\",\"RI\",\"PB\",\"PE\",\"PC\",\"PS\"]";

    // === DEFAULT: AHP pairwise matrix (7x7 identity of 1's) ===
    // double[][] as JSON
    @Builder.Default
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
    @Builder.Default
    @Lob
    private String weightsJson = "[0.142857, 0.142857, 0.142857, 0.142857, 0.142857, 0.142857, 0.142857]";

    @OneToOne
    @JoinColumn(name = "userId")
    private UserEntity user;
}
