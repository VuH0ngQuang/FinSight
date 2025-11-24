package com.finsight.marketrealtime.valuation;

import java.math.BigDecimal;
import java.math.MathContext;
import java.math.RoundingMode;
import java.util.Arrays;
import java.util.Collections;
import java.util.List;
import java.util.Map;
import java.util.Objects;
import java.util.stream.Collectors;

import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.stereotype.Component;

import com.finsight.marketrealtime.model.StockEntity.StockYearData;

@Component
public class StockValuationCalculator {
    private static final Logger logger = LoggerFactory.getLogger(StockValuationCalculator.class);

    /**
     * Calculate DDM (Dividend Discount Model) using Gordon Growth Model
     * Formula: V₀ = D₁/(k-g) where D₁ = D₀(1+g)
     */
    public BigDecimal calculateDDM(StockYearData data) {
        if (data.getDividendPerShare() == null ||
            data.getCostOfEquity() == null ||
            data.getDividendGrowthRate() == null) {
            logger.warn("Missing required data for DDM calculation");
            return null;
        }

        BigDecimal costOfEquity = data.getCostOfEquity();
        BigDecimal growthRate = data.getDividendGrowthRate();

        // Verify k > g (required for Gordon Growth Model convergence)
        if (costOfEquity.compareTo(growthRate) <= 0) {
            logger.warn("Cost of equity ({}) must be greater than growth rate ({}) for DDM",
                        costOfEquity, growthRate);
            return null;
        }

        // Calculate D₁ = D₀ × (1 + g)
        BigDecimal nextDividend = data.getDividendPerShare()
            .multiply(BigDecimal.ONE.add(growthRate));

        // Calculate V₀ = D₁ / (k - g)
        BigDecimal denominator = costOfEquity.subtract(growthRate);

        return nextDividend.divide(denominator, 2, RoundingMode.HALF_UP);
    }

    /**
     * Calculate DCF (Discounted Cash Flow) using Free Cash Flow approach
     * Formula: Firm Value = Σ FCFF_t/(1+WACC)^t + V_T/(1+WACC)^T
     * Terminal Value: V_T = FCFF_{t+1}/(WACC-g)
     */
    public BigDecimal calculateDCF(List<StockYearData> historicalData,
                                   StockYearData currentData,
                                   int projectionYears) {
        if (currentData.getFreeCashFlow() == null ||
            currentData.getWacc() == null ||
            currentData.getSharesOutstanding() == null) {
            logger.warn("Missing required data for DCF calculation");
            return null;
        }

        BigDecimal wacc = currentData.getWacc();
        BigDecimal terminalGrowthRate = new BigDecimal("0.03"); // Conservative 3% terminal growth

        // Calculate average historical FCFF growth rate
        BigDecimal avgGrowth = calculateAverageFCFFGrowth(historicalData);

        // Present value of projected cash flows
        BigDecimal pvCashFlows = BigDecimal.ZERO;
        BigDecimal lastFCFF = currentData.getFreeCashFlow();

        // Project and discount cash flows for forecast period
        for (int year = 1; year <= projectionYears; year++) {
            // Project FCFF with average growth rate
            BigDecimal projectedFCFF = lastFCFF.multiply(BigDecimal.ONE.add(avgGrowth));

            // Calculate discount factor: (1 + WACC)^year
            BigDecimal discountFactor = BigDecimal.ONE.add(wacc)
                .pow(year, new MathContext(10, RoundingMode.HALF_UP));

            // Discount to present value
            BigDecimal pv = projectedFCFF.divide(discountFactor, 6, RoundingMode.HALF_UP);
            pvCashFlows = pvCashFlows.add(pv);

            lastFCFF = projectedFCFF;
        }

        // Add this check before terminal value calculation
        if (wacc.compareTo(terminalGrowthRate) <= 0) {
            logger.warn("WACC ({}) must be greater than terminal growth rate ({}) for DCF",
                    wacc, terminalGrowthRate);
            return null;
        }

        // Calculate terminal value
        BigDecimal terminalFCFF = lastFCFF.multiply(BigDecimal.ONE.add(terminalGrowthRate));
        BigDecimal terminalValue = terminalFCFF.divide(
            wacc.subtract(terminalGrowthRate), 2, RoundingMode.HALF_UP
        );

        // Discount terminal value to present
        BigDecimal terminalDiscountFactor = BigDecimal.ONE.add(wacc)
            .pow(projectionYears, new MathContext(10, RoundingMode.HALF_UP));
        BigDecimal pvTerminal = terminalValue.divide(terminalDiscountFactor, 2, RoundingMode.HALF_UP);

        // Total enterprise value (simplified: assuming no net debt adjustment)
        BigDecimal enterpriseValue = pvCashFlows.add(pvTerminal);

        // Calculate value per share
        BigDecimal sharesOutstanding = new BigDecimal(currentData.getSharesOutstanding());
        return enterpriseValue.divide(sharesOutstanding, 2, RoundingMode.HALF_UP);
    }

    /**
     * Calculate average Free Cash Flow growth rate from historical data
     */
    private BigDecimal calculateAverageFCFFGrowth(List<StockYearData> historicalData) {
        if (historicalData == null || historicalData.size() < 2) {
            return new BigDecimal("0.05"); // Default 5% growth assumption
        }

        BigDecimal totalGrowth = BigDecimal.ZERO;
        int validPeriods = 0;

        for (int i = 1; i < historicalData.size(); i++) {
            BigDecimal currentFCFF = historicalData.get(i).getFreeCashFlow();
            BigDecimal previousFCFF = historicalData.get(i-1).getFreeCashFlow();

            if (currentFCFF != null && previousFCFF != null &&
                previousFCFF.compareTo(BigDecimal.ZERO) > 0) {
                BigDecimal growth = currentFCFF.subtract(previousFCFF)
                    .divide(previousFCFF, 4, RoundingMode.HALF_UP);
                totalGrowth = totalGrowth.add(growth);
                validPeriods++;
            }
        }

        if (validPeriods > 0) {
            BigDecimal avgGrowth = totalGrowth.divide(new BigDecimal(validPeriods), 4, RoundingMode.HALF_UP);

            // Cap growth rate to reasonable bounds (-50% to +100%)
            if (avgGrowth.compareTo(new BigDecimal("1.0")) > 0) {
                logger.warn("Capping extremely high growth rate {} to 100%", avgGrowth);
                return new BigDecimal("1.0");
            }
            if (avgGrowth.compareTo(new BigDecimal("-0.5")) < 0) {
                logger.warn("Capping extremely low growth rate {} to -50%", avgGrowth);
                return new BigDecimal("-0.5");
            }

            return avgGrowth;
        }

        return new BigDecimal("0.05"); // Fallback to 5% growth
    }

    /**
     * Calculate Residual Income (Ohlson Model)
     * Formula: P_t = bv_t + Σ(1+r)^(-T) × E[X_{t+T}^a]
     * Where: X_t^a = X_t - r × bv_{t-1}
     */
    public BigDecimal calculateRI(StockYearData currentData,
                                  StockYearData previousData,
                                  int projectionYears) {
        if (currentData.getNetIncome() == null ||
            currentData.getTotalEquity() == null ||
            currentData.getIntangibles() == null ||
            currentData.getCostOfEquity() == null ||
            currentData.getSharesOutstanding() == null) {
            logger.warn("Missing required data for RI calculation");
            return null;
        }

        BigDecimal costOfEquity = currentData.getCostOfEquity();

        // Calculate book value (excluding intangibles as per literature)
        BigDecimal currentBookValue = currentData.getTotalEquity()
            .subtract(currentData.getIntangibles());

        // Get previous book value
        BigDecimal previousBV = previousData != null &&
                                previousData.getTotalEquity() != null &&
                                previousData.getIntangibles() != null
            ? previousData.getTotalEquity().subtract(previousData.getIntangibles())
            : currentBookValue;

        // Calculate abnormal (residual) earnings: X_t^a = X_t - r × bv_{t-1}
        BigDecimal capitalCharge = previousBV.multiply(costOfEquity);
        BigDecimal abnormalEarnings = currentData.getNetIncome().subtract(capitalCharge);

        // Project future residual income with persistence factor
        BigDecimal pvAbnormalEarnings = BigDecimal.ZERO;
        BigDecimal lastAE = abnormalEarnings;
        BigDecimal persistenceFactor = new BigDecimal("0.60"); // 60% persistence assumption

        for (int year = 1; year <= projectionYears; year++) {
            // Project abnormal earnings with decay
            BigDecimal projectedAE = lastAE.multiply(persistenceFactor);

            // Discount to present value
            BigDecimal discountFactor = BigDecimal.ONE.add(costOfEquity)
                .pow(year, new MathContext(10, RoundingMode.HALF_UP));
            BigDecimal pv = projectedAE.divide(discountFactor, 2, RoundingMode.HALF_UP);

            pvAbnormalEarnings = pvAbnormalEarnings.add(pv);
            lastAE = projectedAE;
        }

        // Total equity value = Current book value + PV of future abnormal earnings
        BigDecimal equityValue = currentBookValue.add(pvAbnormalEarnings);

        // Calculate value per share
        BigDecimal sharesOutstanding = new BigDecimal(currentData.getSharesOutstanding());
        return equityValue.divide(sharesOutstanding, 2, RoundingMode.HALF_UP);
    }

    /**
     * Calculate P/E ratio (Price divided by Earnings per Share)
     * Formula: PE = Market Price per Share / EPS
     */
    public BigDecimal calculatePE(StockYearData data, BigDecimal unusedIndustryPE) {
        if (data.getNetIncome() == null || data.getSharesOutstanding() == null || data.getPriceEndYear() == null) {
            logger.warn("Missing required data for P/E ratio calculation");
            return null;
        }

        // EPS = Net income / shares
        BigDecimal eps = data.getNetIncome()
                .divide(new BigDecimal(data.getSharesOutstanding()), 4, RoundingMode.HALF_UP);

        if (eps.compareTo(BigDecimal.ZERO) <= 0) {
            logger.warn("EPS is zero or negative, cannot compute P/E ratio");
            return null;
        }

        // PE = Price / EPS
        return data.getPriceEndYear().divide(eps, 2, RoundingMode.HALF_UP);
    }

    /**
     * Calculate P/BV ratio (Price-to-Tangible Book Value)
     * Formula: PBV = Market Price per Share / Tangible Book Value per Share
     */
    public BigDecimal calculatePBV(StockYearData data, BigDecimal unusedIndustryPB) {
        if (data.getTotalEquity() == null || data.getIntangibles() == null ||
            data.getSharesOutstanding() == null || data.getPriceEndYear() == null) {
            logger.warn("Missing required data for P/BV ratio calculation");
            return null;
        }

        // Tangible BVPS = (Equity − Intangibles) / shares
        BigDecimal tangibleBookValue = data.getTotalEquity().subtract(data.getIntangibles());
        BigDecimal bvps = tangibleBookValue.divide(new BigDecimal(data.getSharesOutstanding()), 4, RoundingMode.HALF_UP);

        if (bvps.compareTo(BigDecimal.ZERO) <= 0) {
            logger.warn("Book value per share is zero or negative, cannot compute P/BV ratio");
            return null;
        }

        return data.getPriceEndYear().divide(bvps, 2, RoundingMode.HALF_UP);
    }

    /**
     * Calculate P/CF ratio (Price-to-Operating Cash Flow)
     * Formula: PCF = Market Price per Share / Cash Flow per Share
     */
    public BigDecimal calculatePCF(StockYearData data, BigDecimal unusedIndustryPCF) {
        if (data.getOperatingCashFlow() == null || data.getSharesOutstanding() == null || data.getPriceEndYear() == null) {
            logger.warn("Missing required data for P/CF ratio calculation");
            return null;
        }

        BigDecimal cfps = data.getOperatingCashFlow()
                .divide(new BigDecimal(data.getSharesOutstanding()), 4, RoundingMode.HALF_UP);

        if (cfps.compareTo(BigDecimal.ZERO) <= 0) {
            logger.warn("Cash flow per share is zero or negative, cannot compute P/CF ratio");
            return null;
        }

        return data.getPriceEndYear().divide(cfps, 2, RoundingMode.HALF_UP);
    }

    /**
     * Calculate P/S ratio (Price-to-Sales)
     * Formula: PS = Market Price per Share / Sales per Share
     */
    public BigDecimal calculatePS(StockYearData data, BigDecimal unusedIndustryPS) {
        if (data.getRevenue() == null || data.getSharesOutstanding() == null || data.getPriceEndYear() == null) {
            logger.warn("Missing required data for P/S ratio calculation");
            return null;
        }

        BigDecimal sps = data.getRevenue()
                .divide(new BigDecimal(data.getSharesOutstanding()), 4, RoundingMode.HALF_UP);

        if (sps.compareTo(BigDecimal.ZERO) <= 0) {
            logger.warn("Sales per share is zero or negative, cannot compute P/S ratio");
            return null;
        }

        return data.getPriceEndYear().divide(sps, 2, RoundingMode.HALF_UP);
    }

    /**
     * Calculate all valuation metrics at once and populate StockYearData
     */
    public void calculateAllValuations(StockYearData currentData,
                                       StockYearData previousData,
                                       List<StockYearData> historicalData,
                                       Map<String, BigDecimal> industryMultiples) {
        try {
            logger.info("Calculating all valuations for stock");

            // Intrinsic value models
            currentData.setDdm(calculateDDM(currentData));
            currentData.setDcf(calculateDCF(historicalData, currentData, 5));
            currentData.setRi(calculateRI(currentData, previousData, 5));

            // Relative valuation models - safely get multiples
            if (industryMultiples != null && !industryMultiples.isEmpty()) {
                currentData.setPe(calculatePE(currentData, industryMultiples.get("PE")));
                currentData.setPbv(calculatePBV(currentData, industryMultiples.get("PB")));
                currentData.setPcf(calculatePCF(currentData, industryMultiples.get("PCF")));
                currentData.setPs(calculatePS(currentData, industryMultiples.get("PS")));
            } else {
                logger.warn("Industry multiples not available, skipping relative valuation");
            }

            logger.info("Valuation calculations completed successfully");
        } catch (Exception e) {
            logger.error("Error calculating valuations", e);
            throw new RuntimeException("Failed to calculate stock valuations", e);
        }
    }

    /**
     * Calculate composite fair value as MEDIAN of all valuation models
     * (robust to outliers)
     */
    public BigDecimal calculateCompositeFairValue(StockYearData data) {
        List<BigDecimal> valuations = Arrays.asList(
            data.getDdm(), data.getDcf(), data.getRi(),
            data.getPe(), data.getPbv(), data.getPcf(), data.getPs()
        );

        // Filter out null values
        List<BigDecimal> validValuations = valuations.stream()
            .filter(Objects::nonNull)
            .collect(Collectors.toList());

        if (validValuations.isEmpty()) {
            return null;
        }

        // Calculate median (robust to outliers)
        Collections.sort(validValuations);
        int size = validValuations.size();
        if (size % 2 == 0) {
            return validValuations.get(size/2 - 1)
                .add(validValuations.get(size/2))
                .divide(new BigDecimal("2"), 2, RoundingMode.HALF_UP);
        } else {
            return validValuations.get(size/2);
        }
    }
}
