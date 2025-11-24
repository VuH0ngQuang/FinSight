package com.finsight.marketrealtime.service.impl;

import com.fasterxml.jackson.core.JsonProcessingException;
import com.fasterxml.jackson.databind.ObjectMapper;
import com.finsight.marketrealtime.dto.AhpConfigDto;
import com.finsight.marketrealtime.dto.ResponseDto;
import com.finsight.marketrealtime.model.AhpConfigEntity;
import com.finsight.marketrealtime.model.UserEntity;
import com.finsight.marketrealtime.repository.AhpConfigRepository;
import com.finsight.marketrealtime.repository.UserRepository;
import com.finsight.marketrealtime.service.AhpConfigService;
import com.finsight.marketrealtime.utils.LockManager;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;

import java.util.UUID;
import java.util.concurrent.locks.ReentrantLock;

@Service
public class AhpConfigServiceImpl implements AhpConfigService {
    private static final Logger logger = LoggerFactory.getLogger(AhpConfigServiceImpl.class);
    private final ObjectMapper objectMapper;
    private final UserRepository userRepository;
    private final AhpConfigRepository ahpConfigRepository;
    private final LockManager<UUID> lockManager;

    @Autowired
    public AhpConfigServiceImpl(UserRepository userRepository,
                                AhpConfigRepository ahpConfigRepository,
                                LockManager<UUID> lockManager,
                                ObjectMapper objectMapper) {
        this.userRepository = userRepository;
        this.ahpConfigRepository = ahpConfigRepository;
        this.lockManager = lockManager;
        this.objectMapper = objectMapper;
    }

    @Override
    public ResponseDto createAhpConfig(AhpConfigDto ahpConfigDto) {
        AhpConfigEntity ahpConfigEntity = new AhpConfigEntity();
        ReentrantLock lock = lockManager.getLock(ahpConfigEntity.getAhpConfigId());
        lock.lock();
        try {
            UserEntity user = userRepository.
                    findById(ahpConfigDto.getUserId()).
                    orElse(null);

            if (user == null) return ResponseDto.
                    builder().
                    success(false).
                    errorCode(404).
                    errorMessage("User not found").
                    build();

            ahpConfigEntity.setUser(user);
            ahpConfigRepository.save(ahpConfigEntity);
        } finally {
            lock.unlock();
        }
        return ResponseDto.builder().success(true).build();
    }

    @Override
    public ResponseDto updateAhpConfig(AhpConfigDto ahpConfigDto) {
        ReentrantLock lock = lockManager.getLock(ahpConfigDto.getAhpConfigId());
        lock.lock();
        try {
            AhpConfigEntity ahpConfig = ahpConfigRepository
                    .findById(ahpConfigDto.getAhpConfigId())
                    .orElse(null);

            if (ahpConfig == null) return ResponseDto.
                    builder().
                    success(false).
                    errorCode(404).
                    errorMessage("AHP Config not found: " + ahpConfigDto.getAhpConfigId().toString()).
                    build();

            if (ahpConfigDto.getCriteriaJson() != null) ahpConfig.setCriteriaJson(ahpConfigDto.getCriteriaJson());
            if (ahpConfigDto.getPairwiseMatrixJson() != null) {
                ahpConfig.setPairwiseMatrixJson(ahpConfigDto.getPairwiseMatrixJson());
                ahpConfig.setWeightsJson(recalcWeights(ahpConfig));
            }

            ahpConfigRepository.save(ahpConfig);
            return ResponseDto.builder().success(true).build();
        } finally {
            lock.unlock();
        }
    }

    private String recalcWeights(AhpConfigEntity ahpConfig) {
        try {
            // 1. Parse JSON -> double[][]
            double[][] matrix = objectMapper.readValue(
                    ahpConfig.getPairwiseMatrixJson(),
                    double[][].class
            );

            int n = matrix.length;
            if (n == 0) {
                throw new IllegalArgumentException("Pairwise matrix is empty");
            }

            // sanity check: matrix must be square n x n
            for (int i = 0; i < n; i++) {
                if (matrix[i] == null || matrix[i].length != n) {
                    throw new IllegalArgumentException(
                            "Pairwise matrix must be square (n x n). " +
                                    "Row " + i + " length = " + (matrix[i] == null ? "null" : matrix[i].length)
                    );
                }
            }

            double[] geoMeans = new double[n];

            // 2. Compute geometric mean of each row
            for (int i = 0; i < n; i++) {
                double sumLog = 0.0;
                for (int j = 0; j < n; j++) {
                    double value = matrix[i][j];
                    if (value <= 0) {
                        throw new IllegalArgumentException(
                                "Pairwise matrix must contain only positive values. Found: " + value
                        );
                    }
                    sumLog += Math.log(value);
                }
                // geometric mean = exp(average log)
                geoMeans[i] = Math.exp(sumLog / n);
            }

            // 3. Normalize geometric means to get weights
            double total = 0.0;
            for (double gm : geoMeans) {
                total += gm;
            }
            if (total == 0) {
                throw new IllegalStateException("Sum of geometric means is zero");
            }

            double[] weights = new double[n];
            for (int i = 0; i < n; i++) {
                weights[i] = geoMeans[i] / total;
            }

            // 4. Serialize weights back to JSON and return
            return objectMapper.writeValueAsString(weights);

        } catch (JsonProcessingException e) {
            throw new RuntimeException("Failed to parse or write AHP JSON", e);
        }
    }
}
