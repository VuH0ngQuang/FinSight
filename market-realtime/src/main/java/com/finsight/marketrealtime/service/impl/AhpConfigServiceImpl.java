package com.finsight.marketrealtime.service.impl;

import com.fasterxml.jackson.core.JsonProcessingException;
import com.fasterxml.jackson.databind.ObjectMapper;
import com.finsight.marketrealtime.daos.RedisDao;
import com.finsight.marketrealtime.dto.AhpConfigDto;
import com.finsight.marketrealtime.dto.ResponseDto;
import com.finsight.marketrealtime.enums.RedisEnum;
import com.finsight.marketrealtime.model.AhpConfigEntity;
import com.finsight.marketrealtime.model.UserEntity;
import com.finsight.marketrealtime.repository.AhpConfigRepository;
import com.finsight.marketrealtime.repository.UserRepository;
import com.finsight.marketrealtime.service.AhpConfigService;
import com.finsight.marketrealtime.utils.IDGenerator;
import com.finsight.marketrealtime.utils.LockManager;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;

import java.util.Map;
import java.util.concurrent.locks.ReentrantLock;

@Service
public class AhpConfigServiceImpl implements AhpConfigService {
    private static final Logger logger = LoggerFactory.getLogger(AhpConfigServiceImpl.class);

    private static final Map<Integer, Double> RI_MAP = Map.of(
            1, 0.0, 2, 0.0, 3, 0.58, 4, 0.9,
            5, 1.12, 6, 1.24, 7, 1.32, 8, 1.41, 9, 1.45, 10, 1.51
    );

    private final ObjectMapper objectMapper;
    private final UserRepository userRepository;
    private final AhpConfigRepository ahpConfigRepository;
    private final LockManager<Long> lockManager;
    private final RedisDao redisDao;

    @Autowired
    public AhpConfigServiceImpl(UserRepository userRepository,
                                AhpConfigRepository ahpConfigRepository,
                                LockManager<Long> lockManager,
                                ObjectMapper objectMapper,
                                RedisDao redisDao) {
        this.userRepository = userRepository;
        this.ahpConfigRepository = ahpConfigRepository;
        this.lockManager = lockManager;
        this.objectMapper = objectMapper;
        this.redisDao = redisDao;
    }

    @Override
    public ResponseDto createAhpConfig(AhpConfigDto ahpConfigDto) {
        // Validate matrix + CR before acquiring lock or touching DB
        WeightResult weightResult = null;
        if (ahpConfigDto.getPairwiseMatrixJson() != null) {
            try {
                weightResult = computeWeights(ahpConfigDto.getPairwiseMatrixJson());
                double cr = computeConsistencyRatio(weightResult.matrix(), weightResult.weights());
                if (cr >= 0.1) {
                    return ResponseDto.builder()
                            .success(false).errorCode(400)
                            .errorMessage(String.format(
                                    "AHP matrix failed consistency check. CR=%.4f (must be < 0.1)", cr))
                            .build();
                }
            } catch (JsonProcessingException | IllegalArgumentException e) {
                return ResponseDto.builder()
                        .success(false).errorCode(400)
                        .errorMessage("Invalid pairwise matrix: " + e.getMessage())
                        .build();
            }
        }

        AhpConfigEntity ahpConfigEntity = new AhpConfigEntity();
        ahpConfigEntity.setAhpConfigId(IDGenerator.nextId());

        // Lock on userId to prevent concurrent creates for the same user
        ReentrantLock lock = lockManager.getLock(ahpConfigDto.getUserId());
        lock.lock();
        try {
            UserEntity user = userRepository.findById(ahpConfigDto.getUserId()).orElse(null);
            if (user == null) return ResponseDto.builder()
                    .success(false).errorCode(404).errorMessage("User not found").build();

            ahpConfigEntity.setUser(user);

            if (weightResult != null) {
                ahpConfigEntity.setPairwiseMatrixJson(ahpConfigDto.getPairwiseMatrixJson());
                try {
                    ahpConfigEntity.setWeightsJson(objectMapper.writeValueAsString(weightResult.weights()));
                } catch (JsonProcessingException e) {
                    throw new RuntimeException("Failed to serialize AHP weights", e);
                }
            }
            if (ahpConfigDto.getCriteriaJson() != null) {
                ahpConfigEntity.setCriteriaJson(ahpConfigDto.getCriteriaJson());
            }

            ahpConfigRepository.save(ahpConfigEntity);
            AhpConfigDto dto = convertToDto(ahpConfigEntity);
            saveToRedis(dto);
            return ResponseDto.builder().success(true).build();
        } finally {
            lock.unlock();
        }
    }

    @Override
    public ResponseDto updateAhpConfig(AhpConfigDto ahpConfigDto) {
        ReentrantLock lock = lockManager.getLock(ahpConfigDto.getAhpConfigId());
        lock.lock();
        try {
            AhpConfigEntity ahpConfig = ahpConfigRepository
                    .findById(ahpConfigDto.getAhpConfigId())
                    .orElse(null);

            if (ahpConfig == null) return ResponseDto.builder()
                    .success(false).errorCode(404)
                    .errorMessage("AHP Config not found: " + ahpConfigDto.getAhpConfigId())
                    .build();

            if (ahpConfigDto.getCriteriaJson() != null) {
                ahpConfig.setCriteriaJson(ahpConfigDto.getCriteriaJson());
            }

            if (ahpConfigDto.getPairwiseMatrixJson() != null) {
                WeightResult wr;
                try {
                    wr = computeWeights(ahpConfigDto.getPairwiseMatrixJson());
                    double cr = computeConsistencyRatio(wr.matrix(), wr.weights());
                    if (cr >= 0.1) {
                        return ResponseDto.builder()
                                .success(false).errorCode(400)
                                .errorMessage(String.format(
                                        "AHP matrix failed consistency check. CR=%.4f (must be < 0.1)", cr))
                                .build();
                    }
                } catch (JsonProcessingException | IllegalArgumentException e) {
                    return ResponseDto.builder()
                            .success(false).errorCode(400)
                            .errorMessage("Invalid pairwise matrix: " + e.getMessage())
                            .build();
                }

                ahpConfig.setPairwiseMatrixJson(ahpConfigDto.getPairwiseMatrixJson());
                try {
                    ahpConfig.setWeightsJson(objectMapper.writeValueAsString(wr.weights()));
                } catch (JsonProcessingException e) {
                    throw new RuntimeException("Failed to serialize AHP weights", e);
                }
            }

            ahpConfigRepository.save(ahpConfig);
            AhpConfigDto dto = convertToDto(ahpConfig);
            saveToRedis(dto);
            return ResponseDto.builder().success(true).build();
        } finally {
            lock.unlock();
        }
    }

    @Override
    public AhpConfigDto getAhpConfigByUserId(long userId) {
        AhpConfigDto dto = redisDao.find(
                RedisEnum.AHPCONFIG.toString(),
                String.valueOf(userId),
                AhpConfigDto.class
        );
        if (dto != null) return dto;

        AhpConfigEntity ahpConfigEntity = ahpConfigRepository.findByUserUserId(userId);
        if (ahpConfigEntity == null) return null;

        dto = convertToDto(ahpConfigEntity);
        saveToRedis(dto);
        return dto;
    }

    // --- Private helpers ---

    private record WeightResult(double[][] matrix, double[] weights) {}

    private WeightResult computeWeights(String pairwiseMatrixJson)
            throws JsonProcessingException {
        double[][] matrix = objectMapper.readValue(pairwiseMatrixJson, double[][].class);
        int n = matrix.length;
        if (n == 0) throw new IllegalArgumentException("Pairwise matrix is empty");

        for (int i = 0; i < n; i++) {
            if (matrix[i] == null || matrix[i].length != n) {
                throw new IllegalArgumentException(
                        "Pairwise matrix must be square (n x n). Row " + i +
                        " length = " + (matrix[i] == null ? "null" : matrix[i].length));
            }
        }

        double[] geoMeans = new double[n];
        for (int i = 0; i < n; i++) {
            double sumLog = 0.0;
            for (int j = 0; j < n; j++) {
                double value = matrix[i][j];
                if (value <= 0) throw new IllegalArgumentException(
                        "Pairwise matrix must contain only positive values. Found: " + value);
                sumLog += Math.log(value);
            }
            geoMeans[i] = Math.exp(sumLog / n);
        }

        double total = 0.0;
        for (double gm : geoMeans) total += gm;
        if (total == 0) throw new IllegalStateException("Sum of geometric means is zero");

        double[] weights = new double[n];
        for (int i = 0; i < n; i++) weights[i] = geoMeans[i] / total;

        return new WeightResult(matrix, weights);
    }

    private double computeConsistencyRatio(double[][] matrix, double[] weights) {
        int n = matrix.length;
        if (n <= 1) return 0.0;

        double lambdaSum = 0.0;
        for (int i = 0; i < n; i++) {
            double aw = 0.0;
            for (int j = 0; j < n; j++) aw += matrix[i][j] * weights[j];
            lambdaSum += aw / weights[i];
        }
        double lambdaMax = lambdaSum / n;
        double ci = (lambdaMax - n) / (n - 1);

        Double ri = RI_MAP.get(n);
        if (ri == null) {
            throw new IllegalArgumentException(
                    "AHP consistency ratio is not supported for matrix size " + n);
        }
        if (ri == 0.0) return 0.0;
        return ci / ri;
    }

    private void saveToRedis(AhpConfigDto dto) {
        try {
            redisDao.save(RedisEnum.AHPCONFIG.toString(), dto.getAhpConfigId(), dto);
            redisDao.save(RedisEnum.AHPCONFIG.toString(), dto.getUserId(), dto);
        } catch (Exception e) {
            logger.warn("Failed to update AHP config Redis cache for id={}, userId={}: {}",
                    dto.getAhpConfigId(), dto.getUserId(), e.getMessage());
        }
    }

    private AhpConfigDto convertToDto(AhpConfigEntity ahpConfigEntity) {
        return AhpConfigDto.builder()
                .ahpConfigId(ahpConfigEntity.getAhpConfigId())
                .userId(ahpConfigEntity.getUser().getUserId())
                .criteriaJson(ahpConfigEntity.getCriteriaJson())
                .pairwiseMatrixJson(ahpConfigEntity.getPairwiseMatrixJson())
                .weightsJson(ahpConfigEntity.getWeightsJson())
                .build();
    }
}
