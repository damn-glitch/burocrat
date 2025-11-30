// src/utils/RedisClient.ts
import { createClient, RedisClientType } from "redis";
import dotenv from "dotenv";

dotenv.config();

class RedisClient {
  private static instance: RedisClient;
  private client: RedisClientType;

  private constructor() {
    this.client = createClient({
      socket: {
        host: process.env.REDIS_HOST || "127.0.0.1",
        port: process.env.REDIS_PORT ? parseInt(process.env.REDIS_PORT, 10) : 6379,
      },
      password: process.env.REDIS_PASSWORD || undefined,
    });

    this.client.on("error", (err: any) => {
      console.error("❌ Redis error:", JSON.stringify(err));
    });

    this.client.connect()
      .then(() => console.log("✅ Redis connected"))
      .catch((err: any) => console.error("Redis connect failed:", JSON.stringify(err)));
  }

  public static getInstance(): RedisClient {
    if (!RedisClient.instance) {
      RedisClient.instance = new RedisClient();
    }
    return RedisClient.instance;
  }

  public async set<T>(key: string, value: T, ttlSeconds?: number): Promise<void> {
    const strValue = JSON.stringify(value);
    if (ttlSeconds) {
      await this.client.setEx(key, ttlSeconds, strValue);
    } else {
      await this.client.set(key, strValue);
    }
  }

  public async get<T>(key: string): Promise<T | null> {
    const val = await this.client.get(key);
    return val ? (JSON.parse(val) as T) : null;
  }

  public async del(key: string): Promise<number> {
    return this.client.del(key);
  }

  public async quit(): Promise<void> {
    await this.client.quit();
  }
}

export default RedisClient;