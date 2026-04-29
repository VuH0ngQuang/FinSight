package com.finsight.marketrealtime.backtest;

import com.finsight.marketrealtime.dto.PortfolioAllocationResult;
import com.finsight.marketrealtime.dto.StockAllocationDto;
import com.finsight.marketrealtime.model.StockEntity;
import com.finsight.marketrealtime.model.StockEntity.StockYearData;
import org.junit.jupiter.api.Test;

import java.math.BigDecimal;
import java.util.HashMap;
import java.util.List;
import java.util.Map;

import static org.junit.jupiter.api.Assertions.*;

class PortfolioStateTest {

    @Test
    void cashOnlyMarkToMarketIsIdempotent() {
        PortfolioState pf = PortfolioState.cash(new BigDecimal("1000"), Map.of());
        pf.markToMarket(2023);
        assertEquals(0, pf.totalValue().compareTo(new BigDecimal("1000")));
        pf.markToMarket(2024);
        assertEquals(0, pf.totalValue().compareTo(new BigDecimal("1000")));
    }

    @Test
    void applyAllocationDebitsCashAndTxCost() {
        Map<String, StockEntity> universe = new HashMap<>();
        universe.put("AAA", stockWithPrice("AAA", 2023, new BigDecimal("10")));

        PortfolioState pf = PortfolioState.cash(new BigDecimal("1000000"), universe);
        // price-per-share in full VND
        BigDecimal pxVnd = new BigDecimal("10000");
        StockAllocationDto alloc = StockAllocationDto.builder()
                .stockId("AAA").shares(50).pricePerShare(pxVnd)
                .totalCost(pxVnd.multiply(new BigDecimal("50")))
                .build();
        PortfolioAllocationResult r = PortfolioAllocationResult.builder()
                .allocations(List.of(alloc)).build();

        pf.applyAllocation(r, 2023, 15); // 0.15% cost
        // spent = 500000, tx = 500000 * 0.0015 = 750; cash = 1,000,000 - 500,000 - 750
        assertEquals(0, pf.cash().compareTo(new BigDecimal("499250.00000000")));
        // holdings value at 2023 px 10000 * 50 = 500000; total = 499250 + 500000 = 999250
        assertEquals(0, pf.totalValue().compareTo(new BigDecimal("999250.00000000")));
    }

    @Test
    void liquidateAppliesTxCostAndClearsHoldings() {
        Map<String, StockEntity> universe = new HashMap<>();
        universe.put("AAA", stockWithPrice("AAA", 2024, new BigDecimal("12")));

        PortfolioState pf = PortfolioState.cash(BigDecimal.ZERO, universe);
        PortfolioAllocationResult r = PortfolioAllocationResult.builder()
                .allocations(List.of(StockAllocationDto.builder()
                        .stockId("AAA").shares(100).pricePerShare(new BigDecimal("10000")).build()))
                .build();
        // seed position directly via applyAllocation with enough cash so it doesn't underflow checks
        pf = PortfolioState.cash(new BigDecimal("10000000"), universe);
        // add year data for 2023 so applyAllocation's markToMarket doesn't null-out price
        universe.get("AAA").getYearData().put(2023, yearData(new BigDecimal("10")));
        pf.applyAllocation(r, 2023, 0);

        BigDecimal cashAfter = pf.liquidateAt(2024, 10); // 0.10%
        // gross = 12000 * 100 = 1,200,000; net = 1,200,000 * 0.999 = 1,198,800
        // prior cash after allocation = 10,000,000 - 1,000,000 (no tx) = 9,000,000
        // final cash = 9,000,000 + 1,198,800 = 10,198,800
        assertEquals(0, cashAfter.compareTo(new BigDecimal("10198800.00000000")));
        assertTrue(pf.holdings().isEmpty());
    }

    private static StockEntity stockWithPrice(String id, int year, BigDecimal priceThousand) {
        StockEntity s = new StockEntity();
        s.setStockId(id);
        Map<Integer, StockYearData> yd = new HashMap<>();
        yd.put(year, yearData(priceThousand));
        s.setYearData(yd);
        return s;
    }

    private static StockYearData yearData(BigDecimal priceThousand) {
        StockYearData y = new StockYearData();
        y.setPriceEndYear(priceThousand);
        return y;
    }
}
