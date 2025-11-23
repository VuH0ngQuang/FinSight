package com.finsight.marketrealtime.repository;

import com.finsight.marketrealtime.model.StockEntity;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;
import org.springframework.stereotype.Repository;

import java.util.List;

@Repository
public interface StockRepository extends JpaRepository<StockEntity, String> {
    List<StockEntity> findBySector(String sector);

    @Query("""
        select yd
        from StockEntity s
        join s.yearData yd
        where s.stockId = :stockId
          and key(yd) = (
              select max(key(yd2))
              from StockEntity s2
              join s2.yearData yd2
              where s2.stockId = :stockId
          )
        """)
    StockEntity.StockYearData findLatestYearDataByStockId(@Param("stockId") String stockId);
}
