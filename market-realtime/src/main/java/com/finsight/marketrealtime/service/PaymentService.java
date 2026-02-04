package com.finsight.marketrealtime.service;

import com.finsight.marketrealtime.dto.ResponseDto;

public interface PaymentService {
    String createPayment(Long id,String ref, Long amount);
}
