package com.finsight.collector.repository;

import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.jdbc.core.JdbcTemplate;
import org.springframework.stereotype.Repository;

import java.util.List;

@Repository
public class StockIdRepository {
    private final JdbcTemplate jdbcTemplate;

    @Autowired
    public StockIdRepository(JdbcTemplate jdbcTemplate) {
        this.jdbcTemplate = jdbcTemplate;
    }

    public List<String> getAllStockIds() {
        String sql = "SELECT stock_id FROM stock_entity";
        return jdbcTemplate.queryForList(sql, String.class);
    }
}
