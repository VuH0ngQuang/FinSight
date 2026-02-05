package com.finsight.marketrealtime.service;

import jakarta.mail.MessagingException;

public interface MailService {
    void sendWelcome (String to, String username) throws MessagingException;
}
