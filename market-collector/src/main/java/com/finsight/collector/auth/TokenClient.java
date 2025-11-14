package com.finsight.collector.auth;

import com.fasterxml.jackson.databind.JsonNode;
import com.fasterxml.jackson.databind.ObjectMapper;
import com.finsight.collector.configurations.AppConf;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Component;

import java.io.IOException;
import java.net.http.HttpClient;
import java.net.http.HttpRequest;
import java.net.http.HttpResponse;
import java.util.HashMap;
import java.util.Map;


@Component
public class TokenClient {
    private static final Logger logger = LoggerFactory.getLogger(TokenClient.class);
    private static final ObjectMapper mapper = new ObjectMapper();
    private final AppConf appConf;

    @Autowired
    public TokenClient(AppConf appConf) {
        this.appConf = appConf;
    }

    public String getToken() throws IOException {
        Map<String, String> body = new HashMap<>();
        body.put("username", appConf.getDataFeed().getUsername());
        body.put("password", appConf.getDataFeed().getPassword());
        String bodyString = mapper.writeValueAsString(body);

        HttpClient client = HttpClient.newHttpClient();
        HttpRequest request = HttpRequest.newBuilder()
                .uri(java.net.URI.create(appConf.getDataFeed().getUrl()))
                .header("Content-Type", "application/json")
                .POST(HttpRequest.BodyPublishers.ofString(bodyString))
                .build();

        try {
            HttpResponse<String> response = client.send(request, HttpResponse.BodyHandlers.ofString());
            JsonNode json = mapper.readTree(response.body());
            return json.get("token").asText();
        } catch (InterruptedException e) {
            Thread.currentThread().interrupt();
            throw new IOException("Token request interrupted", e);
        }
    }
}
