package com.finsight.marketrealtime.repository;

import com.finsight.marketrealtime.model.AhpConfigEntity;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.util.UUID;

@Repository
public interface AhpConfigRepository extends JpaRepository<AhpConfigEntity, UUID> {
}
