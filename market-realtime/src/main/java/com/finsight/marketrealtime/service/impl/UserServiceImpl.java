package com.finsight.marketrealtime.service.impl;

import com.finsight.marketrealtime.dto.AhpConfigDto;
import com.finsight.marketrealtime.dto.ResponseDto;
import com.finsight.marketrealtime.dto.UserDto;
import com.finsight.marketrealtime.model.AhpConfigEntity;
import com.finsight.marketrealtime.model.UserEntity;
import com.finsight.marketrealtime.repository.UserRepository;
import com.finsight.marketrealtime.service.AhpConfigService;
import com.finsight.marketrealtime.service.UserService;
import com.finsight.marketrealtime.utils.LockManager;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.security.crypto.bcrypt.BCryptPasswordEncoder;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.stereotype.Service;

import java.util.UUID;
import java.util.concurrent.locks.ReentrantLock;

@Service
public class UserServiceImpl implements UserService {
    private static final Logger logger = LoggerFactory.getLogger(UserServiceImpl.class);
    private final PasswordEncoder passwordEncoder = new BCryptPasswordEncoder(10);
    private final UserRepository userRepository;
    private final LockManager<UUID> lockManager;
    private final AhpConfigService ahpConfigService;

    @Autowired
    public UserServiceImpl(UserRepository userRepository,
                           LockManager<UUID> lockManager,
                           AhpConfigService ahpConfigService) {
        this.userRepository = userRepository;
        this.lockManager = lockManager;
        this.ahpConfigService = ahpConfigService;
    }

    @Override
    public ResponseDto createUser(UserDto userDto) {
        if (existsByUsernameAndEmail(userDto.getUsername(), userDto.getEmail())) {
            return ResponseDto.
                    builder().
                    success(false).
                    errorCode(404).
                    errorMessage("Username or Email already exists").
                    build();
        } else {
            UserEntity userEntity = new UserEntity();
            ReentrantLock lock = lockManager.getLock(userEntity.getUserId());
            lock.lock();
            try {
                userEntity.setUsername(userDto.getUsername());
                userEntity.setEmail(userDto.getEmail());
                userEntity.setPassword(passwordEncoder.encode(userDto.getPassword()));
                userEntity.setPhoneNumber(userDto.getPhoneNumber());
                AhpConfigEntity ahpConfigEntity = new AhpConfigEntity();
                ahpConfigEntity.setUser(userEntity);
                userEntity.setAhpConfig(ahpConfigEntity);
                userRepository.save(userEntity);
                return ResponseDto.builder().success(true).build();
            } finally {
                lock.unlock();
            }
        }
    }

    @Override
    public ResponseDto updateUser(UserDto userDto) {
        ReentrantLock lock = lockManager.getLock(userDto.getUserId());
        lock.lock();
        try {
            UserEntity userEntity = userRepository
                    .findById(userDto.getUserId())
                    .orElse(null);

            if (userEntity == null) return ResponseDto.builder().
                    success(false).
                    errorCode(404).
                    errorMessage("User not found: " + userDto.getUserId().toString()).
                    build();

            if (existsByUsernameAndEmail(userDto.getUsername(), userDto.getEmail())) return ResponseDto.
                    builder().
                    success(false).
                    errorCode(404).
                    errorMessage("Username or Email already exists").
                    build();

            if (userDto.getUsername() != null)
                userEntity.setUsername(userDto.getUsername());
            if (userDto.getEmail() != null)
                userEntity.setEmail(userDto.getEmail());
            if (userDto.getPhoneNumber() != null)
                userEntity.setPhoneNumber(userDto.getPhoneNumber());
            userRepository.save(userEntity);
            return ResponseDto.builder().success(true).build();
        } finally {
            lock.unlock();
        }
    }

    @Override
    public ResponseDto deleteUser(UserDto userDto) {
        ReentrantLock lock = lockManager.getLock(userDto.getUserId());
        lock.lock();
        try {
            UserEntity userEntity = userRepository
                    .findByIdWithFavoriteStocks(userDto.getUserId())
                    .orElse(null);

            if (userEntity == null) return ResponseDto.builder().
                    success(false).
                    errorCode(404).
                    errorMessage("User not found: " + userDto.getUserId().toString()).
                    build();

            if (userEntity.getFavoriteStocks() != null) {
                userEntity.getFavoriteStocks()
                        .forEach(stock -> stock.getFavoredByUsers().remove(userEntity));
                userEntity.getFavoriteStocks().clear();
            }

            userRepository.deleteById(userDto.getUserId());
            return ResponseDto.builder().success(true).build();
        } finally {
            lock.unlock();
        }
    }

    public ResponseDto updatePassword(UserDto userDto) {
        ReentrantLock lock = lockManager.getLock(userDto.getUserId());
        lock.lock();
        try {
            UserEntity userEntity = userRepository
                    .findById(userDto.getUserId())
                    .orElse(null);

            if (userEntity == null) return ResponseDto.builder().
                    success(false).
                    errorCode(404).
                    errorMessage("User not found: " + userDto.getUserId().toString()).
                    build();

            userEntity.setPassword(passwordEncoder.encode(userDto.getPassword()));
            userRepository.save(userEntity);
            return ResponseDto.builder().success(true).build();
        } finally {
            lock.unlock();
        }
    }

    private boolean existsByUsernameAndEmail(String username, String email) {
        boolean usernameExists = (username != null) && userRepository.existsByUsername(username);
        boolean emailExists = (email != null) && userRepository.existsByEmail(email);
        return usernameExists || emailExists;
    }
}
