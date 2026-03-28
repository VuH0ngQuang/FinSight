package com.finsight.marketrealtime.repository;

import com.finsight.marketrealtime.model.AhpConfigEntity;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;
import org.springframework.stereotype.Repository;

import java.util.UUID;

@Repository
public interface AhpConfigRepository extends JpaRepository<AhpConfigEntity, Long> {
    @Query("SELECT a FROM AhpConfigEntity a WHERE a.user.userId = :userId")
    AhpConfigEntity findByUserUserId(@Param("userId")long userId);
}
