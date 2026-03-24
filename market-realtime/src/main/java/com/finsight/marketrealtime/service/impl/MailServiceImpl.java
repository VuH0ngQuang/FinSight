package com.finsight.marketrealtime.service.impl;

import com.finsight.marketrealtime.configurations.AppConf;
import com.finsight.marketrealtime.service.MailService;
import com.finsight.marketrealtime.valuation.OvervaluationResult;
import jakarta.mail.MessagingException;
import jakarta.mail.internet.MimeMessage;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.mail.javamail.JavaMailSender;
import org.springframework.mail.javamail.MimeMessageHelper;
import org.springframework.stereotype.Service;
import org.thymeleaf.context.Context;
import org.thymeleaf.spring6.SpringTemplateEngine;

import java.math.BigDecimal;
import java.util.ArrayList;
import java.util.HashMap;
import java.util.List;
import java.util.Map;

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

    @Override
    public void sendWelcome(String to, String username) throws MessagingException {
        Context context = new Context();
        context.setVariable("username", username);
        context.setVariable("email", to);
        context.setVariable("loginUrl", appConf.getAppDomain() + "/login");
        sendEmail(to, "Welcome aboard, " + username + "\uD83C\uDF89", "mail/welcome", context);
    }

    @Override
    public void sendOvervaluationAlert(String to, OvervaluationResult result, BigDecimal currentPrice) throws MessagingException {
        Context context = new Context();
        context.setVariable("stockId", result.getStockId());
        context.setVariable("stockName", result.getStockName());
        context.setVariable("currentPrice", currentPrice);
        context.setVariable("overvaluedCount", result.getOvervaluedCount());
        context.setVariable("totalIndicators", result.getTotalIndicators());
        context.setVariable("overvaluedPercentage", Math.round(result.getOvervaluePercent() * 100.0) / 100.0);

        List<Map<String, String>> indicators = new ArrayList<>();
        for (Map.Entry<String, Boolean> entry : result.getIndicatorResults().entrySet()) {
            Map<String, String> row = new HashMap<>();
            row.put("name", entry.getKey());
            if (entry.getValue() == null) {
                row.put("value", "N/A");
                row.put("status", "WARNING");
            } else if (entry.getValue()) {
                row.put("value", "Above threshold");
                row.put("status", "OVERVALUED");
            } else {
                row.put("value", "Within range");
                row.put("status", "FAIR");
            }
            indicators.add(row);
        }
        context.setVariable("indicators", indicators);

        String subject = "\u26A0\uFE0F Overvaluation Alert: " + result.getStockId() + " - " + result.getStockName();
        sendEmail(to, subject, "mail/overvaluation-alert", context);
    }

    private void sendEmail(String to, String subject, String template, Context context) throws MessagingException {
        MimeMessage message = javaMailSender.createMimeMessage();
        MimeMessageHelper helper = new MimeMessageHelper(message, true, "utf-8");

        String htmlBody = templateEngine.process(template, context);

        helper.setFrom(appConf.getMail().getUsername());
        helper.setTo(to);
        helper.setSubject(subject);
        helper.setText(htmlBody, true);
        javaMailSender.send(message);
    }
}
