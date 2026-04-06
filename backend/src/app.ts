// ============================================================
// Shared types for the PH.dev API (Cloudflare Workers / Hono)
// ============================================================

export interface Env {
  DB: D1Database;
  KV: KVNamespace;
  UPLOADS: R2Bucket;
  JWT_SECRET: string;
  AI_API_KEY: string;
  AI_MODEL: string;
  CORS_ORIGIN: string;
  SMTP_HOST?: string;
  SMTP_PORT?: number;
  SMTP_SECURE?: string;
  SMTP_USER?: string;
  SMTP_PASS?: string;
  ADMIN_EMAIL: string;
  ADMIN_PASSWORD: string;
  WEBHOOK_SECRET: string;
  NODE_ENV: string;
}

export interface Variables {
  userId: number;
  userRole: string;
  userEmail: string;
}
