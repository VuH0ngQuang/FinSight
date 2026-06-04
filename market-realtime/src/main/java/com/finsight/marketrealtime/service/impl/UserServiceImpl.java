package com.finsight.marketrealtime.service.impl;

import com.finsight.marketrealtime.daos.RedisDao;
import com.finsight.marketrealtime.dto.LoginCacheDto;
import com.finsight.marketrealtime.dto.LoginDto;
import com.finsight.marketrealtime.dto.ResponseDto;
import com.finsight.marketrealtime.dto.UserDto;
import com.finsight.marketrealtime.enums.RedisEnum;
import com.finsight.marketrealtime.model.AhpConfigEntity;
import com.finsight.marketrealtime.model.StockEntity;
import com.finsight.marketrealtime.model.UserEntity;
import com.finsight.marketrealtime.repository.StockRepository;
import com.finsight.marketrealtime.repository.UserRepository;
import com.finsight.marketrealtime.service.MailService;
import com.finsight.marketrealtime.service.UserService;
import com.finsight.marketrealtime.utils.IDGenerator;
import com.finsight.marketrealtime.utils.LockManager;
import jakarta.transaction.Transactional;
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
    private final MailService mailService;

    @Autowired
    public UserServiceImpl(UserRepository userRepository,
                           StockRepository stockRepository,
                           LockManager<Long> lockManager,
                           RedisDao redisDao,
                           MailService mailService) {
        this.userRepository = userRepository;
        this.stockRepository = stockRepository;
        this.lockManager = lockManager;
        this.redisDao = redisDao;
        this.mailService = mailService;
    }

    @Override
    public ResponseDto createUser(UserDto userDto) {
        if (existsByUsernameAndEmail(userDto.getUsername(), userDto.getEmail(), 0L)) {
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
                AhpConfigEntity ahpConfigEntity = AhpConfigEntity.builder()
                        .ahpConfigId(IDGenerator.nextId())
                        .build();
                ahpConfigEntity.setUser(userEntity);
                userEntity.setAhpConfig(ahpConfigEntity);
                userRepository.save(userEntity);
                redisDao.save(RedisEnum.USER.toString(), userEntity.getUserId(), convertToDto(userEntity));
                cacheLoginData(userEntity);

                try {
                    mailService.sendWelcome(userEntity.getEmail(), userEntity.getUsername());
                } catch (Exception e) {
                    logger.warn("Failed to send welcome email to {}", userEntity.getEmail(), e);
                }

                return ResponseDto.builder()
                        .success(true)
                        .data(convertToDto(userEntity))
                        .build();
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

            if (existsByUsernameAndEmail(userDto.getUsername(), userDto.getEmail(), userDto.getUserId())) return ResponseDto.
                    builder().
                    success(false).
                    errorCode(404).
                    errorMessage("Username or Email already exists").
                    build();

            clearLoginCache(userEntity);

            if (userDto.getUsername() != null)
                userEntity.setUsername(userDto.getUsername());
            if (userDto.getEmail() != null)
                userEntity.setEmail(userDto.getEmail());
            if (userDto.getPhoneNumber() != null)
                userEntity.setPhoneNumber(userDto.getPhoneNumber());
            userRepository.save(userEntity);
            redisDao.save(RedisEnum.USER.toString(), userEntity.getUserId(), convertToDto(userEntity));
            cacheLoginData(userEntity);
            return ResponseDto.builder().success(true).build();
        } finally {
            lock.unlock();
        }
    }

    @Transactional
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
            invalidateFavoriteStocksCache(userDto.getUserId());
            clearLoginCache(userEntity);
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
            cacheLoginData(userEntity);
            return ResponseDto.builder().success(true).build();
        } finally {
            lock.unlock();
        }
    }

    @Override
    public ResponseDto login(UserDto userDto) {
        String lookupKey = null;
        if (userDto.getUsername() != null && !userDto.getUsername().isBlank()) {
            lookupKey = userDto.getUsername();
        } else if (userDto.getEmail() != null && !userDto.getEmail().isBlank()) {
            lookupKey = userDto.getEmail();
        }

        if (lookupKey == null) {
            return ResponseDto.builder()
                    .success(false)
                    .errorCode(401)
                    .errorMessage("Invalid username/email or password")
                    .build();
        }

        LoginCacheDto cached = redisDao.find(LOGIN_CACHE_KEY, lookupKey, LoginCacheDto.class);
        if (cached != null) {
            if (!passwordEncoder.matches(userDto.getPassword(), cached.getPasswordHash())) {
                return ResponseDto.builder()
                        .success(false)
                        .errorCode(401)
                        .errorMessage("Invalid username/email or password")
                        .build();
            }
            LoginDto result = new LoginDto();
            result.setUserId(String.valueOf(cached.getUserId()));
            result.setUsername(cached.getUsername());
            result.setEmail(cached.getEmail());
            result.setPhoneNumber(cached.getPhoneNumber());
            result.setAdmin(cached.isAdmin());
            return ResponseDto.builder().success(true).data(result).build();
        }

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

        cacheLoginData(userEntity);

        return ResponseDto.builder()
                .success(true)
                .data(convertToDto(userEntity))
                .build();
    }

    @Transactional
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
            if (stockEntity.getFavoredByUsers() == null) {
                stockEntity.setFavoredByUsers(new HashSet<>());
            }

            userEntity.getFavoriteStocks().add(stockEntity);
            stockEntity.getFavoredByUsers().add(userEntity);
            stockRepository.save(stockEntity);
            invalidateFavoriteStocksCache(userDto.getUserId());

            return ResponseDto.builder().success(true).build();
        } finally {
            lock.unlock();
        }
    }

    @Transactional
    @Override
    public ResponseDto removeFavoriteStock(UserDto userDto) {
        ReentrantLock lock = lockManager.getLock(userDto.getUserId());
        lock.lock();
        try {
            UserEntity userEntity = userRepository
                    .findByIdWithFavoriteStocks(userDto.getUserId())
                    .orElse(null);

            StockEntity stockEntity = stockRepository
                    .findById(userDto.getStockId())
                    .orElse(null);

            if (stockEntity == null) {
                return ResponseDto.builder()
                        .success(false)
                        .errorCode(404)
                        .errorMessage("Stock not found: " + userDto.getStockId())
                        .build();
            }
            if (userEntity.getFavoriteStocks() != null) {
                userEntity.getFavoriteStocks().remove(stockEntity);
            }
            if (stockEntity.getFavoredByUsers() != null) {
                stockEntity.getFavoredByUsers().remove(userEntity);
            }
            stockRepository.save(stockEntity);
            invalidateFavoriteStocksCache(userDto.getUserId());

            return ResponseDto.builder().success(true).build();
        } finally {
            lock.unlock();
        }
    }

    private boolean existsByUsernameAndEmail(String username, String email, long userid) {
        boolean usernameExists = (username != null) && userRepository.existsByUsernameAndUserIdNot(username, userid);
        boolean emailExists = (email != null) && userRepository.existsByEmailAndUserIdNot(email, userid);
        return usernameExists || emailExists;
    }

    private static final String LOGIN_CACHE_KEY = "USER_LOGIN";

    /** Same hash key as market-rest `USER_FAVORITE_STOCKS` (watchlist cache invalidation). */
    private void invalidateFavoriteStocksCache(long userId) {
        redisDao.delete(RedisEnum.USER_FAVORITE_STOCKS.toString(), userId);
    }

    private void cacheLoginData(UserEntity userEntity) {
        LoginCacheDto dto = LoginCacheDto.builder()
                .userId(userEntity.getUserId())
                .username(userEntity.getUsername())
                .email(userEntity.getEmail())
                .phoneNumber(userEntity.getPhoneNumber())
                .passwordHash(userEntity.getPassword())
                .admin(userEntity.isAdmin())
                .build();

        if (userEntity.getUsername() != null) {
            redisDao.save(LOGIN_CACHE_KEY, userEntity.getUsername(), dto);
        }
        if (userEntity.getEmail() != null) {
            redisDao.save(LOGIN_CACHE_KEY, userEntity.getEmail(), dto);
        }
    }

    private void clearLoginCache(UserEntity userEntity) {
        if (userEntity.getUsername() != null) {
            redisDao.delete(LOGIN_CACHE_KEY, userEntity.getUsername());
        }
        if (userEntity.getEmail() != null) {
            redisDao.delete(LOGIN_CACHE_KEY, userEntity.getEmail());
        }
    }

    private UserDto convertToDto(UserEntity userEntity) {
        UserDto userDto = new UserDto();
        userDto.setUserId(userEntity.getUserId());
        userDto.setUsername(userEntity.getUsername());
        userDto.setEmail(userEntity.getEmail());
        userDto.setPhoneNumber(userEntity.getPhoneNumber());
        userDto.setAdmin(userEntity.isAdmin());
        return userDto;
    }
}
