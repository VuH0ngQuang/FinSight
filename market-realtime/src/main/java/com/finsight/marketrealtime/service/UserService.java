package com.finsight.marketrealtime.service;

import com.finsight.marketrealtime.dto.ResponseDto;
import com.finsight.marketrealtime.dto.UserDto;

import java.util.UUID;

public interface UserService {
    ResponseDto createUser(UserDto userDto);
    ResponseDto updateUser(UserDto userDto);
    ResponseDto deleteUser(UserDto userDto);
    ResponseDto updatePassword(UserDto userDto);
    ResponseDto login(UserDto userDto);
    ResponseDto addFavoriteStock(UserDto userDto);
    ResponseDto removeFavoriteStock(UserDto userDto);
}
