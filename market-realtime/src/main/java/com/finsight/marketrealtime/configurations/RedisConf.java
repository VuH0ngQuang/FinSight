package com.finsight.marketrealtime.configurations;

import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.context.annotation.Bean;
import org.springframework.context.annotation.Configuration;
import org.springframework.data.redis.connection.RedisConnectionFactory;
import org.springframework.data.redis.connection.RedisStandaloneConfiguration;
import org.springframework.data.redis.connection.lettuce.LettuceConnectionFactory;

@Configuration
public class RedisConf {
    private final AppConf appConf;

    @Autowired
    public RedisConf(AppConf appConf) {
        this.appConf = appConf;
    }

    @Bean
    public RedisConnectionFactory redisConnectionFactory() {
        RedisStandaloneConfiguration config = new RedisStandaloneConfiguration();
        config.setHostName(appConf.getRedis().getHost());
        config.setPort(appConf.getRedis().getPort());
        config.setPassword(appConf.getRedis().getPassword());
        config.setDatabase(appConf.getRedis().getDatabase());

        return new LettuceConnectionFactory(config);
    }
}
