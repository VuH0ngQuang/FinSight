package com.finsight.marketrealtime.repository;

import com.finsight.marketrealtime.model.StockEntity;
import org.springframework.data.jpa.repository.JpaRepository;

public interface StockRepository extends JpaRepository<StockEntity, String> {
}
