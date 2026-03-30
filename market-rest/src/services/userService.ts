import { pool } from "../config/database";
import type { UserDetailDto } from "../dto/UserDetailDto";
import type { UserEntity } from "../models/UserEntity";
import type { Subscription } from "../models/Subscription";
import type { AhpConfigEntity } from "../models/AhpConfigEntity";
import { SubscriptionEnum } from "../models/Subscription";
import type { SubscriptionPlanEntity } from "../models/SubscriptionPlanEntity";
import { BillingCycle } from "../models/SubscriptionPlanEntity";
import { RowDataPacket } from "mysql2";
import { cacheService } from "../utils/cacheService";
import { ahpConfigService } from "./ahpConfigService";

/** Hash field = userId, value = JSON array of full Subscription objects (incl. plan). */
const USER_SUBSCRIPTIONS_HASH = "USER_SUBSCRIPTIONS";

/** Hash field = userId, value = JSON array of favorite stock symbol strings. */
const USER_FAVORITE_STOCKS_HASH = "USER_FAVORITE_STOCKS";

interface UserRow extends RowDataPacket {
  userId: string;
  username: string;
  email: string;
  phoneNumber: string;
  createdAt: string;
  isAdmin: number | string | boolean;
}

interface SubscriptionRow extends RowDataPacket {
  subscriptionId: string;
  userId: string;
  startDate: string;
  endDate: string;
  status: string;
  planId: number;
  planName: string;
  price: number | string | null;
  billingCycle: string;
}

class UserService {
  private isBigIntString(value: string): boolean {
    return /^[0-9]+$/.test(value.trim());
  }

  private toBoolean(value: unknown): boolean {
    if (typeof value === "boolean") return value;
    if (typeof value === "number") return value !== 0;
    if (Buffer.isBuffer(value)) return value.length > 0 && value[0] === 1;
    if (typeof value === "string") {
      const normalized = value.trim().toLowerCase();
      return normalized === "true" || normalized === "1";
    }
    return false;
  }

  private async querySubscriptions(normalizedUserId: string): Promise<Subscription[]> {
    const [subscriptionRows] = await pool.query<SubscriptionRow[]>(
      `
        SELECT
          CAST(s.subscription_id AS CHAR) AS subscriptionId,
          CAST(s.user_user_id AS CHAR) AS userId,
          s.start_date AS startDate,
          s.end_date AS endDate,
          s.status,
          sp.plan_id AS planId,
          sp.plan_name AS planName,
          sp.price,
          sp.billing_cycle AS billingCycle
        FROM subscription s
        LEFT JOIN subscription_plan_entity sp
          ON s.subscription_plan_plan_id = sp.plan_id
        WHERE s.user_user_id = CAST(? AS UNSIGNED)
      `,
      [normalizedUserId]
    );
    return subscriptionRows.map((row) => ({
      subscriptionId: row.subscriptionId,
      startDate: row.startDate,
      endDate: row.endDate,
      status: row.status as SubscriptionEnum,
      user: {} as UserEntity,
      subscriptionPlan: {
        planId: row.planId,
        planName: row.planName,
        price: typeof row.price === "number" ? row.price : Number(row.price || 0),
        billingCycle: row.billingCycle as BillingCycle,
        subscriptions: [],
      } as SubscriptionPlanEntity,
    }));
  }

  /**
   * Returns null = cache miss (field absent). [] = cached empty list (no DB).
   */
  private async getSubscriptionsFromUserCache(normalizedUserId: string): Promise<Subscription[] | null> {
    const raw = await cacheService.hget<unknown>(USER_SUBSCRIPTIONS_HASH, normalizedUserId);
    if (raw === null) {
      return null;
    }
    if (!Array.isArray(raw)) {
      return null;
    }
    return raw.map((item) => this.normalizeSubscriptionFromCache(item));
  }

  private normalizeSubscriptionFromCache(item: unknown): Subscription {
    const o = item as Record<string, unknown>;
    const planRaw = o.subscriptionPlan as Record<string, unknown> | undefined;
    const planId = Number(planRaw?.planId ?? 0);
    const plan: SubscriptionPlanEntity = {
      planId: Number.isFinite(planId) ? planId : 0,
      planName: String(planRaw?.planName ?? ""),
      price: typeof planRaw?.price === "number" ? planRaw.price : Number(planRaw?.price ?? 0),
      billingCycle: (planRaw?.billingCycle as BillingCycle) ?? BillingCycle.MONTHLY,
      subscriptions: [],
    };
    return {
      subscriptionId: String(o.subscriptionId ?? ""),
      startDate: String(o.startDate ?? ""),
      endDate: String(o.endDate ?? ""),
      status: o.status as SubscriptionEnum,
      user: {} as UserEntity,
      subscriptionPlan: plan,
    };
  }

  /** Per-user list + legacy SUBSCRIPTION entries (by subscriptionId) for market-realtime. */
  private async persistSubscriptionsToCache(normalizedUserId: string, subs: Subscription[]): Promise<void> {
    const serializable = subs.map((sub) => ({
      subscriptionId: sub.subscriptionId,
      startDate: sub.startDate,
      endDate: sub.endDate,
      status: sub.status,
      user: {},
      subscriptionPlan: {
        planId: sub.subscriptionPlan.planId,
        planName: sub.subscriptionPlan.planName,
        price: sub.subscriptionPlan.price,
        billingCycle: sub.subscriptionPlan.billingCycle,
        subscriptions: [],
      },
    }));
    await cacheService.hset(USER_SUBSCRIPTIONS_HASH, normalizedUserId, serializable);
    await Promise.all(
      subs.map((sub) =>
        cacheService.hset("SUBSCRIPTION", sub.subscriptionId, {
          subscriptionId: sub.subscriptionId,
          userId: normalizedUserId,
          subscriptionPlanId: sub.subscriptionPlan.planId,
          startDate: sub.startDate,
          endDate: sub.endDate,
          status: sub.status,
        })
      )
    );
  }

  private async loadSubscriptionsWithCacheBackfill(normalizedUserId: string): Promise<Subscription[]> {
    const fromRedis = await this.getSubscriptionsFromUserCache(normalizedUserId);
    if (fromRedis !== null) {
      return fromRedis;
    }
    const subs = await this.querySubscriptions(normalizedUserId);
    await this.persistSubscriptionsToCache(normalizedUserId, subs);
    return subs;
  }

  /**
   * Returns null when Redis has no entry for this user (cache miss).
   * Returns [] when cached as empty watchlist.
   */
  private async getFavoriteStockIdsFromCache(normalizedUserId: string): Promise<string[] | null> {
    const raw = await cacheService.hget<unknown>(USER_FAVORITE_STOCKS_HASH, normalizedUserId);
    if (raw === null) {
      return null;
    }
    if (!Array.isArray(raw)) {
      return null;
    }
    return raw.map((s) => String(s).trim()).filter(Boolean);
  }

  /** Join table `user_favorite_stocks`; tries snake_case columns then camelCase. */
  private async queryFavoriteStockIdsFromDb(normalizedUserId: string): Promise<string[]> {
    interface FavoriteRow extends RowDataPacket {
      stockId: string;
    }

    const snakeSql = `
      SELECT stock_id AS stockId
      FROM user_favorite_stocks
      WHERE user_id = CAST(? AS UNSIGNED)
    `;
    const camelSql = `
      SELECT stockId AS stockId
      FROM user_favorite_stocks
      WHERE userId = CAST(? AS UNSIGNED)
    `;

    try {
      const [rows] = await pool.query<FavoriteRow[]>(snakeSql, [normalizedUserId]);
      return rows.map((r) => String(r.stockId).trim());
    } catch (err: unknown) {
      const code = typeof err === "object" && err !== null && "code" in err ? String((err as { code: unknown }).code) : "";
      if (code === "ER_BAD_FIELD_ERROR" || code === "42S22") {
        const [rows] = await pool.query<FavoriteRow[]>(camelSql, [normalizedUserId]);
        return rows.map((r) => String(r.stockId).trim());
      }
      throw err;
    }
  }

  private async persistFavoriteStockIdsToCache(normalizedUserId: string, ids: string[]): Promise<void> {
    await cacheService.hset(USER_FAVORITE_STOCKS_HASH, normalizedUserId, ids);
  }

  /**
   * Stock symbols the user marked as favorites.
   * Redis hash `USER_FAVORITE_STOCKS` first; on miss loads from DB and backfills cache.
   */
  async getFavoriteStockIdsByUserId(userId: string): Promise<string[]> {
    const normalizedUserId = userId.trim();
    if (!this.isBigIntString(normalizedUserId)) {
      return [];
    }

    const fromCache = await this.getFavoriteStockIdsFromCache(normalizedUserId);
    if (fromCache !== null) {
      return fromCache;
    }

    const fromDb = await this.queryFavoriteStockIdsFromDb(normalizedUserId);
    await this.persistFavoriteStockIdsToCache(normalizedUserId, fromDb);
    return fromDb;
  }

  /** Call after favorite list changes (add/remove/delete user) so next read reloads from DB. */
  async invalidateFavoriteStockIdsCache(userId: string): Promise<void> {
    const normalizedUserId = userId.trim();
    if (!this.isBigIntString(normalizedUserId)) {
      return;
    }
    await cacheService.hdel(USER_FAVORITE_STOCKS_HASH, normalizedUserId);
  }

  async getUserById(userId: string): Promise<UserDetailDto | null> {
    const normalizedUserId = userId.trim();
    if (!this.isBigIntString(normalizedUserId)) {
      return null;
    }

    interface CachedUser {
      userId: number | string;
      username: string;
      email: string;
      phoneNumber: string;
      admin?: boolean;
      isAdmin?: boolean;
    }

    const cached = await cacheService.hget<CachedUser>('USER', normalizedUserId);
    if (cached) {
      const [subscriptions, ahpDto] = await Promise.all([
        this.loadSubscriptionsWithCacheBackfill(normalizedUserId),
        ahpConfigService.getByUserId(normalizedUserId),
      ]);
      const ahpConfig: AhpConfigEntity | null = ahpDto
        ? {
            ahpConfigId: ahpDto.ahpConfigId,
            user: {} as UserEntity,
            criteriaJson: ahpDto.criteriaJson,
            pairwiseMatrixJson: ahpDto.pairwiseMatrixJson,
            weightsJson: ahpDto.weightsJson,
          }
        : null;
      return {
        userId: String(cached.userId).trim(),
        username: cached.username,
        email: cached.email,
        phoneNumber: cached.phoneNumber,
        createdAt: '',
        isAdmin: this.toBoolean(cached.isAdmin ?? cached.admin ?? false),
        subscriptions,
        ahpConfig,
      };
    }

    const [userRows] = await pool.query<UserRow[]>(
      `
        SELECT
          CAST(user_id AS CHAR) AS userId,
          username,
          email,
          phone_number AS phoneNumber,
          created_at AS createdAt,
          CAST(is_admin AS UNSIGNED) AS isAdmin
        FROM user_entity
        WHERE user_id = CAST(? AS UNSIGNED)
        LIMIT 1
      `,
      [normalizedUserId]
    );
    const userRow = userRows[0];
    if (!userRow) return null;

    const [subscriptions, ahpDto] = await Promise.all([
      this.loadSubscriptionsWithCacheBackfill(normalizedUserId),
      ahpConfigService.getByUserId(normalizedUserId),
    ]);
    const ahpConfig: AhpConfigEntity | null = ahpDto
      ? {
          ahpConfigId: ahpDto.ahpConfigId,
          user: {} as UserEntity,
          criteriaJson: ahpDto.criteriaJson,
          pairwiseMatrixJson: ahpDto.pairwiseMatrixJson,
          weightsJson: ahpDto.weightsJson,
        }
      : null;

    await cacheService.hset("USER", normalizedUserId, {
      userId: userRow.userId,
      username: userRow.username,
      email: userRow.email,
      phoneNumber: userRow.phoneNumber,
      isAdmin: this.toBoolean(userRow.isAdmin),
    });

    return {
      userId: userRow.userId,
      username: userRow.username,
      email: userRow.email,
      phoneNumber: userRow.phoneNumber,
      createdAt: userRow.createdAt,
      isAdmin: this.toBoolean(userRow.isAdmin),
      subscriptions,
      ahpConfig,
    };
  }
}

export const userService = new UserService();
