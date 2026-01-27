package com.finsight.marketrealtime.service;

import jakarta.mail.MessagingException;
import org.thymeleaf.context.Context;

public interface MailService {
    void sendWelcome (String to, String username) throws MessagingException;
}
