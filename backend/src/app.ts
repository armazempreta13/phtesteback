import { Context } from 'hono';

export interface Env {
  DB: D1Database;
  KV: KVNamespace;
  UPLOADS: R2Bucket;
  JWT_SECRET: string;
  AI_API_KEY: string;
  AI_MODEL: string;
  CORS_ORIGIN: string;
  WEBHOOK_SECRET: string;
}

export interface Variables {
  userId: number;
  userRole: string;
  userEmail: string;
}

export type Ctx = Context<{ Bindings: Env; Variables: Variables }>;
