package com.finsight.marketrealtime.service;

import com.finsight.marketrealtime.valuation.OvervaluationResult;
import jakarta.mail.MessagingException;

import java.math.BigDecimal;

public interface MailService {
    void sendWelcome(String to, String username) throws MessagingException;
    void sendOvervaluationAlert(String to, OvervaluationResult result, BigDecimal currentPrice) throws MessagingException;
}
