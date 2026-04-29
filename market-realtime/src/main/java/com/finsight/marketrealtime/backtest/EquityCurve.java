package com.finsight.marketrealtime.backtest;

import java.math.BigDecimal;
import java.util.ArrayList;
import java.util.List;

/**
 * Year-indexed record of portfolio total value (cash + mark-to-market of holdings).
 */
public class EquityCurve {
    public record Point(int year, BigDecimal portfolioValue) {}

    private final List<Point> points = new ArrayList<>();

    public void record(int year, BigDecimal value) {
        points.add(new Point(year, value));
    }

    public List<Point> points() {
        return points;
    }

    public boolean isEmpty() {
        return points.isEmpty();
    }

    public int size() {
        return points.size();
    }
}
