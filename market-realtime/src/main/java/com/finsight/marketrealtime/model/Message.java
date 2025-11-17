package com.finsight.marketrealtime.model;

import lombok.Builder;
import lombok.Data;

import java.time.OffsetDateTime;
import java.time.ZoneOffset;

@Builder
@Data
public class Message {
    private String sourceId;
    private String eventId;
    private String uri;
    @Builder.Default
    private OffsetDateTime timestamp = OffsetDateTime.now(ZoneOffset.ofHours(7)); //UTC+7
    private Object payload;
}
