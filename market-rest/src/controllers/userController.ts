import { Request, Response } from 'express';
import { userService } from '../services/userService';
import { userQueueService } from '../services/userQueueService';
import type { UserDto } from '../dto/UserDto';

export const getUserDetail = async (req: Request, res: Response): Promise<void> => {
  try {
    const { userId } = req.params;
    if (!userId) {
      res.status(400).json({ message: 'userId is required' });
      return;
    }

    const userDetail = await userService.getUserById(userId);

    if (!userDetail) {
      res.status(404).json({ message: `User ${userId} not found` });
      return;
    }

    res.json({ data: userDetail });
  } catch (error) {
    // eslint-disable-next-line no-console
    console.error('Failed to get user detail', error);
    res.status(500).json({ message: 'Internal Server Error' });
  }
};

export const createUser = async (req: Request, res: Response): Promise<void> => {
  try {
    const userPayload = req.body as UserDto;
    const result = await userQueueService.createUser(userPayload);

    const statusCode = result.success ? 201 : 400;
    res.status(statusCode).json(result);
  } catch (error) {
    // eslint-disable-next-line no-console
    console.error('Failed to create user', error);
    res.status(500).json({ message: 'Internal Server Error' });
  }
};

export const updateUser = async (req: Request, res: Response): Promise<void> => {
  try {
    const userPayload = req.body as UserDto;
    const result = await userQueueService.updateUser(userPayload);

    const statusCode = result.success ? 200 : 400;
    res.status(statusCode).json(result);
  } catch (error) {
    // eslint-disable-next-line no-console
    console.error('Failed to update user', error);
    res.status(500).json({ message: 'Internal Server Error' });
  }
};

export const deleteUser = async (req: Request, res: Response): Promise<void> => {
  try {
    const userPayload = req.body as UserDto;
    const result = await userQueueService.deleteUser(userPayload);

    const statusCode = result.success ? 200 : 400;
    res.status(statusCode).json(result);
  } catch (error) {
    // eslint-disable-next-line no-console
    console.error('Failed to delete user', error);
    res.status(500).json({ message: 'Internal Server Error' });
  }
};

export const updatePassword = async (req: Request, res: Response): Promise<void> => {
  try {
    const userPayload = req.body as UserDto;
    const result = await userQueueService.updatePassword(userPayload);

    const statusCode = result.success ? 200 : 400;
    res.status(statusCode).json(result);
  } catch (error) {
    // eslint-disable-next-line no-console
    console.error('Failed to update password', error);
    res.status(500).json({ message: 'Internal Server Error' });
  }
};