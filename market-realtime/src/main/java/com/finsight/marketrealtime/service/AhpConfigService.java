package com.finsight.marketrealtime.service;

import com.finsight.marketrealtime.dto.AhpConfigDto;
import com.finsight.marketrealtime.dto.ResponseDto;

public interface AhpConfigService {
    ResponseDto createAhpConfig(AhpConfigDto ahpConfigDto);
    ResponseDto updateAhpConfig(AhpConfigDto ahpConfigDto);
}
