package com.finsight.marketrealtime.daos;

import com.fasterxml.jackson.core.JsonProcessingException;
import com.fasterxml.jackson.databind.ObjectMapper;
import com.finsight.marketrealtime.configurations.AppConf;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.data.redis.core.HashOperations;
import org.springframework.data.redis.core.RedisTemplate;
import org.springframework.stereotype.Service;

import java.time.Duration;

@Service
public class RedisDao {

    private static final Logger log = LoggerFactory.getLogger(RedisDao.class);

    private final ObjectMapper objectMapper;
    private final AppConf appConf;
    private final RedisTemplate<String, String> redisTemplate;
    private final HashOperations<String, String, String> hashOperations;

    @Autowired
    public RedisDao(
            RedisTemplate<String, String> redisTemplate,
            ObjectMapper objectMapper,
            AppConf appConf
    ) {
        this.redisTemplate = redisTemplate;
        this.objectMapper = objectMapper;
        this.appConf = appConf;
        this.hashOperations = redisTemplate.opsForHash();
    }

    public <T, ID> void save(String keyEntity, ID id, T entity, Duration duration) {
        try {
            String json = objectMapper.writeValueAsString(entity);
            hashOperations.put(keyEntity, String.valueOf(id), json);

            if (duration != null) {
                redisTemplate.expire(keyEntity, duration);
            }
        } catch (JsonProcessingException e) {
            log.error("Error serializing entity to JSON", e);
        }
    }

    public <T, ID> void save(String keyEntity,ID id, T entity) {
        save(keyEntity, id, entity, null);
    }

    public <ID> void delete(String keyEntity, ID id) {
        hashOperations.delete(keyEntity, id);
    }
}