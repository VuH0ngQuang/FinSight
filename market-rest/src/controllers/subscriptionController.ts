import { Request, Response } from "express";
import { subscriptionQueueService } from "../services/subscriptionQueueService";
import { subscriptionPlanService } from "../services/subscriptionPlanService";
import type { SubscriptionDto } from "../dto/SubscriptionDto";

export const createSubscription = async (
  req: Request,
  res: Response
): Promise<void> => {
  try {
    const payload = req.body as SubscriptionDto;
    const result = await subscriptionQueueService.createSubscription(payload);
    const statusCode = result.success ? 201 : 400;
    res.status(statusCode).json(result);
  } catch (error) {
    // eslint-disable-next-line no-console
    console.error("Failed to create subscription", error);
    res.status(500).json({ message: "Internal Server Error" });
  }
};

export const getSubscriptionPlans = async (
  _req: Request,
  res: Response
): Promise<void> => {
  try {
    const plans = await subscriptionPlanService.getAllPlans();
    res.json({ data: plans });
  } catch (error) {
    // eslint-disable-next-line no-console
    console.error("Failed to get subscription plans", error);
    res.status(500).json({ message: "Internal Server Error" });
  }
};
