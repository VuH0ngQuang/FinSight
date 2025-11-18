package com.finsight.marketrealtime.repository;

import com.finsight.marketrealtime.model.UserEntity;
import org.springframework.data.jpa.repository.JpaRepository;

import java.util.UUID;

public interface UserRepository extends JpaRepository <UserEntity, UUID> {
}
