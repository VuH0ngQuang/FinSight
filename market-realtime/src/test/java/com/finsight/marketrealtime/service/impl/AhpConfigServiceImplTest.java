package com.finsight.marketrealtime.service.impl;

import com.fasterxml.jackson.databind.ObjectMapper;
import com.finsight.marketrealtime.daos.RedisDao;
import com.finsight.marketrealtime.dto.AhpConfigDto;
import com.finsight.marketrealtime.dto.ResponseDto;
import com.finsight.marketrealtime.model.AhpConfigEntity;
import com.finsight.marketrealtime.model.UserEntity;
import com.finsight.marketrealtime.repository.AhpConfigRepository;
import com.finsight.marketrealtime.repository.UserRepository;
import com.finsight.marketrealtime.utils.LockManager;
import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.Test;
import org.junit.jupiter.api.extension.ExtendWith;
import org.mockito.Mock;
import org.mockito.junit.jupiter.MockitoExtension;
import org.mockito.junit.jupiter.MockitoSettings;
import org.mockito.quality.Strictness;

import java.lang.reflect.Method;
import java.util.Optional;
import java.util.concurrent.locks.ReentrantLock;

import static org.junit.jupiter.api.Assertions.*;
import static org.mockito.ArgumentMatchers.any;
import static org.mockito.Mockito.*;

@ExtendWith(MockitoExtension.class)
@MockitoSettings(strictness = Strictness.LENIENT)
class AhpConfigServiceImplTest {

    @Mock UserRepository userRepository;
    @Mock AhpConfigRepository ahpConfigRepository;
    @Mock LockManager<Long> lockManager;
    @Mock RedisDao redisDao;

    private AhpConfigServiceImpl service;
    private final ObjectMapper objectMapper = new ObjectMapper();

    private static final String IDENTITY_3X3 =
            "[[1,1,1],[1,1,1],[1,1,1]]";

    // Consistent seed matrix (CR≈0), priorities DDM>DCFM>RI>PB>PE>PC>PS with ratios [6,4,3,2,1.5,1.2,1]
    private static final String SEED_7X7 =
            "[[1,1.5,2,3,4,5,6]," +
            "[0.6667,1,1.3333,2,2.6667,3.3333,4]," +
            "[0.5,0.75,1,1.5,2,2.5,3]," +
            "[0.3333,0.5,0.6667,1,1.3333,1.6667,2]," +
            "[0.25,0.375,0.5,0.75,1,1.25,1.5]," +
            "[0.2,0.3,0.4,0.6,0.8,1,1.2]," +
            "[0.1667,0.25,0.3333,0.5,0.6667,0.8333,1]]";

    // Cyclically inconsistent: A>B>C>A
    private static final String INCONSISTENT_3X3 =
            "[[1,9,0.1111],[0.1111,1,9],[9,0.1111,1]]";

    @BeforeEach
    void setup() {
        service = new AhpConfigServiceImpl(
                userRepository, ahpConfigRepository, lockManager, objectMapper, redisDao);
        when(lockManager.getLock(any())).thenReturn(new ReentrantLock());
    }

    // ── CR calculation tests (via reflection on private methods) ──────────────

    @Test
    void cr_identityMatrix_isZero() throws Exception {
        double cr = invokeCR(IDENTITY_3X3);
        assertEquals(0.0, cr, 1e-6, "Identity matrix must have CR=0");
    }

    @Test
    void cr_seedMatrix_passesThreshold() throws Exception {
        double cr = invokeCR(SEED_7X7);
        assertTrue(cr < 0.1, "Seed 7x7 matrix must have CR < 0.1, got " + cr);
    }

    @Test
    void cr_inconsistentMatrix_failsThreshold() throws Exception {
        double cr = invokeCR(INCONSISTENT_3X3);
        assertTrue(cr >= 0.1, "Cyclic inconsistent matrix must have CR >= 0.1, got " + cr);
    }

    @Test
    void cr_1x1Matrix_isZero() throws Exception {
        double cr = invokeCR("[[1]]");
        assertEquals(0.0, cr, 1e-9);
    }

    @Test
    void cr_2x2Matrix_isZero() throws Exception {
        double cr = invokeCR("[[1,3],[0.3333,1]]");
        assertEquals(0.0, cr, 1e-9);
    }

    // ── createAhpConfig tests ─────────────────────────────────────────────────

    @Test
    void create_userNotFound_returns404() {
        when(userRepository.findById(anyLong())).thenReturn(Optional.empty());

        ResponseDto result = service.createAhpConfig(
                AhpConfigDto.builder().userId(1L).build());

        assertFalse(result.isSuccess());
        assertEquals(404, result.getErrorCode());
        verify(ahpConfigRepository, never()).save(any());
    }

    @Test
    void create_consistentMatrix_succeeds() {
        UserEntity user = new UserEntity();
        when(userRepository.findById(anyLong())).thenReturn(Optional.of(user));
        when(ahpConfigRepository.save(any())).thenAnswer(i -> i.getArgument(0));

        ResponseDto result = service.createAhpConfig(AhpConfigDto.builder()
                .userId(1L).pairwiseMatrixJson(IDENTITY_3X3).build());

        assertTrue(result.isSuccess());
        verify(ahpConfigRepository).save(any(AhpConfigEntity.class));
    }

    @Test
    void create_inconsistentMatrix_returns400_noDB() {
        ResponseDto result = service.createAhpConfig(AhpConfigDto.builder()
                .userId(1L).pairwiseMatrixJson(INCONSISTENT_3X3).build());

        assertFalse(result.isSuccess());
        assertEquals(400, result.getErrorCode());
        assertTrue(result.getErrorMessage().contains("CR="));
        verify(ahpConfigRepository, never()).save(any());
    }

    @Test
    void create_malformedJson_returns400_noDB() {
        ResponseDto result = service.createAhpConfig(AhpConfigDto.builder()
                .userId(1L).pairwiseMatrixJson("not-a-matrix").build());

        assertFalse(result.isSuccess());
        assertEquals(400, result.getErrorCode());
        verify(ahpConfigRepository, never()).save(any());
    }

    @Test
    void create_matrixLargerThanRiTable_returns400_noDB() {
        ResponseDto result = service.createAhpConfig(AhpConfigDto.builder()
                .userId(1L).pairwiseMatrixJson(identityMatrixJson(11)).build());

        assertFalse(result.isSuccess());
        assertEquals(400, result.getErrorCode());
        assertTrue(result.getErrorMessage().contains("matrix size 11"));
        verify(ahpConfigRepository, never()).save(any());
    }

    // ── updateAhpConfig tests ─────────────────────────────────────────────────

    @Test
    void update_entityNotFound_returns404() {
        when(ahpConfigRepository.findById(anyLong())).thenReturn(Optional.empty());

        ResponseDto result = service.updateAhpConfig(
                AhpConfigDto.builder().ahpConfigId(99L).build());

        assertFalse(result.isSuccess());
        assertEquals(404, result.getErrorCode());
        verify(ahpConfigRepository, never()).save(any());
    }

    @Test
    void update_consistentMatrix_updatesWeightsAndSucceeds() {
        AhpConfigEntity entity = buildEntity();
        when(ahpConfigRepository.findById(anyLong())).thenReturn(Optional.of(entity));
        when(ahpConfigRepository.save(any())).thenAnswer(i -> i.getArgument(0));

        ResponseDto result = service.updateAhpConfig(AhpConfigDto.builder()
                .ahpConfigId(1L).pairwiseMatrixJson(IDENTITY_3X3).build());

        assertTrue(result.isSuccess());
        assertNotNull(entity.getWeightsJson());
        verify(ahpConfigRepository).save(entity);
    }

    @Test
    void update_inconsistentMatrix_returns400_noDB() {
        AhpConfigEntity entity = buildEntity();
        when(ahpConfigRepository.findById(anyLong())).thenReturn(Optional.of(entity));

        ResponseDto result = service.updateAhpConfig(AhpConfigDto.builder()
                .ahpConfigId(1L).pairwiseMatrixJson(INCONSISTENT_3X3).build());

        assertFalse(result.isSuccess());
        assertEquals(400, result.getErrorCode());
        assertTrue(result.getErrorMessage().contains("CR="));
        verify(ahpConfigRepository, never()).save(any());
    }

    @Test
    void update_matrixLargerThanRiTable_returns400_noDB() {
        AhpConfigEntity entity = buildEntity();
        when(ahpConfigRepository.findById(anyLong())).thenReturn(Optional.of(entity));

        ResponseDto result = service.updateAhpConfig(AhpConfigDto.builder()
                .ahpConfigId(1L).pairwiseMatrixJson(identityMatrixJson(11)).build());

        assertFalse(result.isSuccess());
        assertEquals(400, result.getErrorCode());
        assertTrue(result.getErrorMessage().contains("matrix size 11"));
        verify(ahpConfigRepository, never()).save(any());
    }

    @Test
    void update_redisThrows_doesNotPropagateException() {
        AhpConfigEntity entity = buildEntity();
        when(ahpConfigRepository.findById(anyLong())).thenReturn(Optional.of(entity));
        when(ahpConfigRepository.save(any())).thenAnswer(i -> i.getArgument(0));
        doThrow(new RuntimeException("Redis down"))
                .when(redisDao).save(anyString(), any(), any());

        ResponseDto result = service.updateAhpConfig(AhpConfigDto.builder()
                .ahpConfigId(1L).pairwiseMatrixJson(IDENTITY_3X3).build());

        assertTrue(result.isSuccess(), "Redis failure must not fail the update");
    }

    // ── Helpers ───────────────────────────────────────────────────────────────

    private double invokeCR(String matrixJson) throws Exception {
        // computeWeights is private — use reflection
        Method computeWeights = AhpConfigServiceImpl.class
                .getDeclaredMethod("computeWeights", String.class);
        computeWeights.setAccessible(true);
        Object weightResult = computeWeights.invoke(service, matrixJson);

        Method computeCR = AhpConfigServiceImpl.class
                .getDeclaredMethod("computeConsistencyRatio", double[][].class, double[].class);
        computeCR.setAccessible(true);

        // Extract matrix and weights from the WeightResult record
        Method matrixGetter = weightResult.getClass().getDeclaredMethod("matrix");
        Method weightsGetter = weightResult.getClass().getDeclaredMethod("weights");
        matrixGetter.setAccessible(true);
        weightsGetter.setAccessible(true);

        double[][] matrix = (double[][]) matrixGetter.invoke(weightResult);
        double[] weights = (double[]) weightsGetter.invoke(weightResult);
        return (double) computeCR.invoke(service, matrix, weights);
    }

    private AhpConfigEntity buildEntity() {
        UserEntity user = new UserEntity();
        AhpConfigEntity entity = AhpConfigEntity.builder()
                .ahpConfigId(1L)
                .build();
        entity.setUser(user);
        return entity;
    }

    private String identityMatrixJson(int size) {
        StringBuilder json = new StringBuilder("[");
        for (int i = 0; i < size; i++) {
            if (i > 0) json.append(',');
            json.append('[');
            for (int j = 0; j < size; j++) {
                if (j > 0) json.append(',');
                json.append('1');
            }
            json.append(']');
        }
        json.append(']');
        return json.toString();
    }
}
