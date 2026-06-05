package com.finsight.marketrealtime.service.impl;

import com.finsight.marketrealtime.configurations.AppConf;
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
    private final AppConf appConf;

    @Autowired
    public PaymentServiceImpl(PayOS payOS, AppConf appConf) {
        this.payOS = payOS;
        this.appConf = appConf;
    }

//    @PostConstruct
////    public void init() {
////        log.error(createPayment(124L,"124",10000L));
////    }

    @Override
    public String createPayment(Long id,String ref, Long amount) {
        log.info("{}/payment/", appConf.getAppDomain());
        CreatePaymentLinkRequest paymentLinkRequest = CreatePaymentLinkRequest.builder()
                .orderCode(id)
                .amount(amount)
                .description("FinSight Sub Ref: " + ref)
                .cancelUrl("https://"+appConf.getAppDomain()+"/payment/checkout")
                .returnUrl("https://"+appConf.getAppDomain()+"/payment/checkout")
                .build();

        CreatePaymentLinkResponse paymentLink = payOS.paymentRequests().create(paymentLinkRequest);

        return paymentLink.getCheckoutUrl();
    }
}
