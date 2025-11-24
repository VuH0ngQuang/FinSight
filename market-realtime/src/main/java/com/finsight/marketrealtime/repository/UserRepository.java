package com.finsight.marketrealtime.repository;

import com.finsight.marketrealtime.model.UserEntity;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;
import org.springframework.stereotype.Repository;

import java.util.Optional;
import java.util.UUID;

@Repository
public interface UserRepository extends JpaRepository <UserEntity, UUID> {
    boolean existsByUsername(String username);
    boolean existsByEmail(String email);
    @Query("SELECT u FROM UserEntity u LEFT JOIN FETCH u.favoriteStocks WHERE u.userId = :userId")
    Optional<UserEntity> findByIdWithFavoriteStocks(@Param("userId") UUID userId);
}
