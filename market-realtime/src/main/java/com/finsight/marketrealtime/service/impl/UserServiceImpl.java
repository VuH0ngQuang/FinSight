package com.finsight.marketrealtime.service.impl;

import com.finsight.marketrealtime.daos.RedisDao;
import com.finsight.marketrealtime.dto.ResponseDto;
import com.finsight.marketrealtime.dto.UserDto;
import com.finsight.marketrealtime.enums.RedisEnum;
import com.finsight.marketrealtime.model.AhpConfigEntity;
import com.finsight.marketrealtime.model.StockEntity;
import com.finsight.marketrealtime.model.UserEntity;
import com.finsight.marketrealtime.repository.StockRepository;
import com.finsight.marketrealtime.repository.UserRepository;
import com.finsight.marketrealtime.service.UserService;
import com.finsight.marketrealtime.utils.IDGenerator;
import com.finsight.marketrealtime.utils.LockManager;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.security.crypto.bcrypt.BCryptPasswordEncoder;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.stereotype.Service;

import java.util.HashSet;
import java.util.UUID;
import java.util.concurrent.locks.ReentrantLock;

@Service
public class UserServiceImpl implements UserService {
    private static final Logger logger = LoggerFactory.getLogger(UserServiceImpl.class);
    private final PasswordEncoder passwordEncoder = new BCryptPasswordEncoder(10);
    private final UserRepository userRepository;
    private final StockRepository stockRepository;
    private final LockManager<Long> lockManager;
    private final RedisDao redisDao;

    @Autowired
    public UserServiceImpl(UserRepository userRepository,
                           StockRepository stockRepository,
                           LockManager<Long> lockManager,
                           RedisDao redisDao) {
        this.userRepository = userRepository;
        this.stockRepository = stockRepository;
        this.lockManager = lockManager;
        this.redisDao = redisDao;
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
            userEntity.setUserId(IDGenerator.nextId());
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
                redisDao.save(RedisEnum.USER.toString(), userEntity.getUserId(), convertToDto(userEntity));
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
                    errorMessage("User not found: " + userDto.getUserId()).
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
            redisDao.save(RedisEnum.USER.toString(), userEntity.getUserId(), convertToDto(userEntity));
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
                    errorMessage("User not found: " + userDto.getUserId()).
                    build();

            if (userEntity.getFavoriteStocks() != null) {
                userEntity.getFavoriteStocks()
                        .forEach(stock -> stock.getFavoredByUsers().remove(userEntity));
                userEntity.getFavoriteStocks().clear();
            }

            userRepository.deleteById(userDto.getUserId());
            redisDao.delete(RedisEnum.USER.toString(), userDto.getUserId());
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
                    errorMessage("User not found: " + userDto.getUserId()).
                    build();

            userEntity.setPassword(passwordEncoder.encode(userDto.getPassword()));
            userRepository.save(userEntity);
            return ResponseDto.builder().success(true).build();
        } finally {
            lock.unlock();
        }
    }

    @Override
    public ResponseDto login(UserDto userDto) {
        UserEntity userEntity = null;

        if (userDto.getUsername() != null && !userDto.getUsername().isBlank()) {
            userEntity = userRepository.findByUsername(userDto.getUsername()).orElse(null);
        } else if (userDto.getEmail() != null && !userDto.getEmail().isBlank()) {
            userEntity = userRepository.findByEmail(userDto.getEmail()).orElse(null);
        }

        if (userEntity == null) {
            return ResponseDto.builder()
                    .success(false)
                    .errorCode(401)
                    .errorMessage("Invalid username/email or password")
                    .build();
        }

        if (!passwordEncoder.matches(userDto.getPassword(), userEntity.getPassword())) {
            return ResponseDto.builder()
                    .success(false)
                    .errorCode(401)
                    .errorMessage("Invalid username/email or password")
                    .build();
        }

        return ResponseDto.builder()
                .success(true)
                .data(convertToDto(userEntity))
                .build();
    }

    @Override
    public ResponseDto addFavoriteStock(UserDto userDto) {
        ReentrantLock lock = lockManager.getLock(userDto.getUserId());
        lock.lock();
        try {
            UserEntity userEntity = userRepository
                    .findByIdWithFavoriteStocks(userDto.getUserId())
                    .orElse(null);

            if (userEntity == null) {
                return ResponseDto.builder()
                        .success(false)
                        .errorCode(404)
                        .errorMessage("User not found: " + userDto.getUserId())
                        .build();
            }

            StockEntity stockEntity = stockRepository.findById(userDto.getStockId()).orElse(null);
            if (stockEntity == null) {
                return ResponseDto.builder()
                        .success(false)
                        .errorCode(404)
                        .errorMessage("Stock not found: " + userDto.getStockId())
                        .build();
            }

            if (userEntity.getFavoriteStocks() == null) {
                userEntity.setFavoriteStocks(new HashSet<>());
            }

            userEntity.getFavoriteStocks().add(stockEntity);
            userRepository.save(userEntity);

            return ResponseDto.builder().success(true).build();
        } finally {
            lock.unlock();
        }
    }

    @Override
    public ResponseDto removeFavoriteStock(UserDto userDto) {
        ReentrantLock lock = lockManager.getLock(userDto.getUserId());
        lock.lock();
        try {
            UserEntity userEntity = userRepository
                    .findByIdWithFavoriteStocks(userDto.getUserId())
                    .orElse(null);

            if (userEntity == null) {
                return ResponseDto.builder()
                        .success(false)
                        .errorCode(404)
                        .errorMessage("User not found: " + userDto.getUserId())
                        .build();
            }

            if (userEntity.getFavoriteStocks() != null) {
                userEntity.getFavoriteStocks()
                        .removeIf(stock -> stock.getStockId().equals(userDto.getStockId()));
                userRepository.save(userEntity);
            }

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

    private UserDto convertToDto(UserEntity userEntity) {
        UserDto userDto = new UserDto();
        userDto.setUserId(userEntity.getUserId());
        userDto.setUsername(userEntity.getUsername());
        userDto.setEmail(userEntity.getEmail());
        userDto.setPhoneNumber(userEntity.getPhoneNumber());
        return userDto;
    }
}
