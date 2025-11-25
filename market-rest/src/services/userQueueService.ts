import { config } from "../config/env";
import { kafkaRequestResponseService } from "./kafkaRequestResponseService";
import type { ResponseDto } from "../dto/ResponseDto";
import type { UserDto } from "../dto/UserDto";

class UserQueueService {
  private readonly createUserUri = config.uri.user.create;
  private readonly updateUserUri = config.uri.user.update;
  private readonly deleteUserUri = config.uri.user.delete;
  private readonly updatePasswordUri = config.uri.user.updatePassword;

  async createUser(user: UserDto): Promise<ResponseDto<unknown>> {
    const { message } = await kafkaRequestResponseService.sendAndWait<UserDto, ResponseDto<unknown>>(
        this.createUserUri, user
    );

    if (!message) {
        throw new Error('No response received from user creation pipeline');
    }
  
    if (!message.payload) {
        throw new Error('Invalid Kafka response: missing payload');
    }

    return message.payload;
  }

  async updateUser(user: UserDto): Promise<ResponseDto<unknown>> {
    const { message } = await kafkaRequestResponseService.sendAndWait<UserDto, ResponseDto<unknown>>(
        this.updateUserUri,
        user
    );

    if (!message) {
        throw new Error('No response received from user update pipeline');
    }

    if (!message.payload) {
        throw new Error('Invalid Kafka response: missing payload');
    }

    return message.payload;
  }


  async updatePassword(user: UserDto): Promise<ResponseDto<unknown>> {
    const { message } = await kafkaRequestResponseService.sendAndWait<UserDto, ResponseDto<unknown>>(
        this.updatePasswordUri,
        user
    );

    if (!message) {
      throw new Error('No response received from user update password pipeline');
    }

    if (!message.payload) {
      throw new Error('Invalid Kafka response: missing payload');
    }

    return message.payload;
  }

  async deleteUser(user: UserDto): Promise<ResponseDto<unknown>> {
    const { message } = await kafkaRequestResponseService.sendAndWait<UserDto, ResponseDto<unknown>>(
        this.deleteUserUri,
        user
    );

    if (!message) {
      throw new Error('No response received from user delete pipeline');
    }

    if (!message.payload) {
      throw new Error('Invalid Kafka response: missing payload');
    }

    return message.payload;
  }
}

export const userQueueService = new UserQueueService();