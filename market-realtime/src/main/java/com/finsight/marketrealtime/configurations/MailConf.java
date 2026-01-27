package com.finsight.marketrealtime.configurations;

import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.context.annotation.Bean;
import org.springframework.context.annotation.Configuration;
import org.springframework.mail.javamail.JavaMailSender;
import org.springframework.mail.javamail.JavaMailSenderImpl;

import java.util.Properties;

@Configuration
public class MailConf {
    private final AppConf appConf;

    @Autowired
    public MailConf(AppConf appConf) {
        this.appConf = appConf;
    }

    @Bean
    public JavaMailSender javaMailSender() {
        JavaMailSenderImpl mailSender = new JavaMailSenderImpl();
        mailSender.setHost(appConf.getMail().getHost());
        mailSender.setPort(appConf.getMail().getPort());
        mailSender.setUsername(appConf.getMail().getUsername());
        mailSender.setPassword(appConf.getMail().getPassword());

        Properties props = mailSender.getJavaMailProperties();
        props.put("mail.transport.protocol", "smtp");
        props.put("mail.smtp.auth", "true");
        props.put("mail.debug", "false");
        
        // Connection timeouts
        props.put("mail.smtp.connectiontimeout", "15000"); // 15 seconds
        props.put("mail.smtp.timeout", "15000"); // 15 seconds
        props.put("mail.smtp.writetimeout", "15000"); // 15 seconds
        
        // Configure based on port
        int port = appConf.getMail().getPort();
        if (port == 465) {
            // SSL/TLS on port 465
            props.put("mail.smtp.ssl.enable", "true");
            props.put("mail.smtp.socketFactory.port", "465");
            props.put("mail.smtp.socketFactory.class", "javax.net.ssl.SSLSocketFactory");
            props.put("mail.smtp.socketFactory.fallback", "false");
        } else if (port == 587) {
            // STARTTLS on port 587
            props.put("mail.smtp.starttls.enable", "true");
            props.put("mail.smtp.starttls.required", "true");
        } else {
            // Default: try STARTTLS
            props.put("mail.smtp.starttls.enable", "true");
        }

        return mailSender;
    }
}
