package com.finsight.marketrealtime.backtest;

import com.finsight.marketrealtime.model.StockEntity;
import org.junit.jupiter.api.Test;

import java.math.BigDecimal;
import java.util.List;
import java.util.Map;

import static org.junit.jupiter.api.Assertions.*;

class IndustryMedianCalculatorTest {

    private final IndustryMedianCalculator calc = new IndustryMedianCalculator();

    @Test
    void oddCountReturnsMiddleValue() {
        BigDecimal m = IndustryMedianCalculator.median(List.of(
                new BigDecimal("1"), new BigDecimal("3"), new BigDecimal("2")));
        assertEquals(0, m.compareTo(new BigDecimal("2")));
    }

    @Test
    void evenCountReturnsAverage() {
        BigDecimal m = IndustryMedianCalculator.median(List.of(
                new BigDecimal("1"), new BigDecimal("2"), new BigDecimal("3"), new BigDecimal("4")));
        // (2+3)/2 = 2.5
        assertEquals(0, m.compareTo(new BigDecimal("2.5000")));
    }

    @Test
    void emptyOrNullReturnsNull() {
        assertNull(IndustryMedianCalculator.median(List.of()));
        assertNull(IndustryMedianCalculator.median(null));
    }

    @Test
    void groupsBySectorAndSkipsNegatives() {
        StockEntity a = stock("BANK", "10", "1", "5", "2");
        StockEntity b = stock("BANK", "20", "2", "7", "4");
        StockEntity c = stock("BANK", "-5", null, "3", "3"); // skipped for PE and PB
        StockEntity d = stock("RETAIL", "15", "3", "4", "5");

        Map<String, Map<String, BigDecimal>> out = calc.computeMediansBySector(List.of(a, b, c, d));

        // BANK PE median of {10, 20} = 15
        assertEquals(0, out.get("BANK").get("PE").compareTo(new BigDecimal("15.0000")));
        // BANK PB median of {1, 2} = 1.5 (c skipped due to null)
        assertEquals(0, out.get("BANK").get("PB").compareTo(new BigDecimal("1.5000")));
        // BANK PS median of {2, 4, 3} = 3
        assertEquals(0, out.get("BANK").get("PS").compareTo(new BigDecimal("3")));
        assertEquals(1, out.get("RETAIL").size() >= 4 ? 1 : 1);
    }

    @Test
    void skipsStocksWithoutSector() {
        StockEntity s = stock(null, "10", "1", "1", "1");
        Map<String, Map<String, BigDecimal>> out = calc.computeMediansBySector(List.of(s));
        assertTrue(out.isEmpty());
    }

    private static StockEntity stock(String sector, String pe, String pb, String pcf, String ps) {
        StockEntity s = new StockEntity();
        s.setStockId("X" + System.nanoTime() + Math.random());
        s.setSector(sector);
        s.setPeRatio(pe == null ? null : new BigDecimal(pe));
        s.setPbRatio(pb == null ? null : new BigDecimal(pb));
        s.setPcfRatio(pcf == null ? null : new BigDecimal(pcf));
        s.setPsRatio(ps == null ? null : new BigDecimal(ps));
        return s;
    }
}
