import { Router } from "express";
import {
  createSubscription,
  getSubscriptionPlans,
} from "../controllers/subscriptionController";

const router = Router();

router.get("/plans", getSubscriptionPlans);
router.post("/create", createSubscription);

export default router;
