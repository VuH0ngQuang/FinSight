package com.finsight.marketrealtime.service.impl;

import com.finsight.marketrealtime.configurations.AppConf;
import com.finsight.marketrealtime.service.MailService;
import jakarta.annotation.PostConstruct;
import jakarta.mail.MessagingException;
import jakarta.mail.internet.MimeMessage;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.mail.javamail.JavaMailSender;
import org.springframework.mail.javamail.MimeMessageHelper;
import org.springframework.stereotype.Service;
import org.thymeleaf.context.Context;
import org.thymeleaf.spring6.SpringTemplateEngine;

@Service
public class MailServiceImpl implements MailService {
    private final AppConf appConf;
    private final JavaMailSender javaMailSender;
    private final SpringTemplateEngine templateEngine;

    @Autowired
    public MailServiceImpl(AppConf appConf, JavaMailSender javaMailSender, SpringTemplateEngine templateEngine) {
        this.appConf = appConf;
        this.javaMailSender = javaMailSender;
        this.templateEngine = templateEngine;
    }

    @PostConstruct
    public void init() throws MessagingException {
        sendWelcome("admin@vuhongquang.com","Vũ Hồng Quang");
    }

    @Override
    public void sendWelcome(String to, String username) throws MessagingException {
        Context context = new Context();
        context.setVariable("username", username);
        context.setVariable("email", to);
        context.setVariable("loginUrl", appConf.getAppDomain()+"/login");
        sendEmail(to, "Welcome aboard, "+username+"\uD83C\uDF89","welcome",context);
    }

    private void sendEmail(String to , String subject, String template, Context context) throws MessagingException {
        MimeMessage message = javaMailSender.createMimeMessage();
        MimeMessageHelper helper = new MimeMessageHelper(message, true, "utf-8");

        String htmlBody = templateEngine.process(template, context);

        helper.setFrom(appConf.getMail().getUsername());
        helper.setTo(to);
        helper.setSubject(subject);
        helper.setText(htmlBody, true); // true indicates HTML
        javaMailSender.send(message);
    }
}
