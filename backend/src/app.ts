import { Context } from 'hono';

export interface Env {
  DB: D1Database;
  KV: KVNamespace;
  JWT_SECRET: string;
  CORS_ORIGIN: string;
  WEBHOOK_SECRET: string;
}

export interface Variables {
  userId: number;
  userRole: string;
  userEmail: string;
}

export type Ctx = Context<{ Bindings: Env; Variables: Variables }>;
