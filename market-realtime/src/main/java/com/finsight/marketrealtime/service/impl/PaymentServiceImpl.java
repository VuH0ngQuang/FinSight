package com.finsight.marketrealtime.service.impl;

import com.finsight.marketrealtime.service.PaymentService;
import jakarta.annotation.PostConstruct;
import org.slf4j.Logger;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;
import vn.payos.PayOS;
import vn.payos.model.v2.paymentRequests.CreatePaymentLinkRequest;
import vn.payos.model.v2.paymentRequests.CreatePaymentLinkResponse;

@Service
public class PaymentServiceImpl implements PaymentService {
    private static final Logger log = org.slf4j.LoggerFactory.getLogger(PaymentServiceImpl.class);
    private final PayOS payOS;

    @Autowired
    public PaymentServiceImpl(PayOS payOS) {
        this.payOS = payOS;
    }

//    @PostConstruct
////    public void init() {
////        log.error(createPayment(124L,"124",10000L));
////    }

    @Override
    public String createPayment(Long id,String ref, Long amount) {
        CreatePaymentLinkRequest paymentLinkRequest = CreatePaymentLinkRequest.builder()
                .orderCode(id)
                .amount(amount)
                .description("FinSight Sub Ref: " + ref)
                .cancelUrl("https://google.com/")
                .returnUrl("https://google.com/")
                .build();

        CreatePaymentLinkResponse paymentLink = payOS.paymentRequests().create(paymentLinkRequest);

        return paymentLink.getCheckoutUrl();
    }
}
