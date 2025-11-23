package com.finsight.marketrealtime.model;

import jakarta.persistence.*;
import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.time.OffsetDateTime;
import java.time.ZoneOffset;
import java.util.HashSet;
import java.util.UUID;

@Builder
@AllArgsConstructor
@Data
@Entity
@NoArgsConstructor
public class UserEntity {
    @Builder.Default
    @Id
    private UUID userId = UUID.randomUUID();
    private String username;
    private String email;
    private String password;
    private String phoneNumber;
    @Builder.Default
    private OffsetDateTime createdAt = OffsetDateTime.now(ZoneOffset.ofHours(7));
    @Builder.Default
    private boolean isAdmin = false;

    @ManyToMany(mappedBy = "favoredByUsers")
    HashSet<StockEntity> favoriteStocks;

    @OneToMany(
            mappedBy = "user",
            cascade = CascadeType.ALL,
            orphanRemoval = true
    )
    HashSet<Subscription> subscriptions;

    @OneToOne(
            mappedBy = "user",
            cascade = CascadeType.ALL,
            orphanRemoval = true
    )
    private AhpConfigEntity ahpConfig;
}
