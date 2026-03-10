package com.finsight.marketrealtime.service;

import com.finsight.marketrealtime.dto.PortfolioAllocationRequest;
import com.finsight.marketrealtime.dto.ResponseDto;

public interface PortfolioAllocationService {
    ResponseDto allocate(PortfolioAllocationRequest request);
}
