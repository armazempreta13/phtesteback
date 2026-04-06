import { Context } from "hono";
import type { Env, Variables } from "../app";

type Ctx = { Bindings: Env; Variables: Variables };

// ---- GET /transactions ----
export async function listTransactions(c: Ctx) {
  try {
    const page = Math.max(1, parseInt(c.req.query("page") || "1"));
    const limit = Math.min(50, Math.max(1, parseInt(c.req.query("limit") || "10")));
    const role = c.get("userRole");
    const userId = c.get("userId");

    let sql: string;
    let params: (string | number)[];

    if (role === "admin") {
      const countResult = c.env.DB.prepare("SELECT COUNT(*) as total FROM transactions").first<{ total: number }>()!;
      const total = countResult.total;
      const results = c.env.DB
        .prepare("SELECT * FROM transactions ORDER BY created_at DESC LIMIT ? OFFSET ?")
        .bind(limit, (page - 1) * limit)
        .all();

      return c.json({ success: true, data: results.results, meta: { page, limit, total } });
    } else {
      const countResult = c.env.DB
        .prepare("SELECT COUNT(*) as total FROM transactions WHERE user_id = ?")
        .bind(userId)
        .first<{ total: number }>()!;
      const total = countResult.total;
      const results = c.env.DB
        .prepare("SELECT * FROM transactions WHERE user_id = ? ORDER BY created_at DESC LIMIT ? OFFSET ?")
        .bind(userId, limit, (page - 1) * limit)
        .all();

      return c.json({ success: true, data: results.results, meta: { page, limit, total } });
    }
  } catch (err: unknown) {
    const msg = err instanceof Error ? err.message : "Unknown error";
    return c.json({ success: false, message: `Failed to fetch transactions: ${msg}` }, 500);
  }
}

// ---- GET /transactions/:id ----
export async function getTransaction(c: Ctx) {
  try {
    const id = parseInt(c.req.param("id"));
    if (isNaN(id)) return c.json({ success: false, message: "Invalid transaction ID" }, 400);

    const role = c.get("userRole");
    const userId = c.get("userId");

    let tx;
    if (role === "admin") {
      tx = c.env.DB.prepare("SELECT * FROM transactions WHERE id = ?").bind(id).first();
    } else {
      tx = c.env.DB.prepare("SELECT * FROM transactions WHERE id = ? AND user_id = ?").bind(id, userId).first();
    }

    if (!tx) return c.json({ success: false, message: "Transaction not found" }, 404);

    return c.json({ success: true, data: tx });
  } catch (err: unknown) {
    const msg = err instanceof Error ? err.message : "Unknown error";
    return c.json({ success: false, message: `Failed to fetch transaction: ${msg}` }, 500);
  }
}

// Generate PIX code (simulation — replace with actual PIX provider in production)
function generatePixCode(amount: number, description: string): string {
  const timestamp = Date.now().toString(36);
  const random = Math.random().toString(36).substring(2, 10);
  return `PIX-${timestamp}-${random}-${Math.round(amount * 100)}`;
}

// ---- POST /transactions ----
export async function createTransaction(c: Ctx) {
  try {
    const body = await c.req.json<{
      amount: number;
      project_id: number;
      type: string;
      description: string;
    }>();

    if (!body.amount || body.amount <= 0) {
      return c.json({ success: false, message: "Valid amount is required" }, 400);
    }
    if (!body.type) {
      return c.json({ success: false, message: "Transaction type is required" }, 400);
    }

    const userId = c.get("userId");
    const pixCode = generatePixCode(body.amount, body.description || "");

    const result = c.env.DB
      .prepare(
        "INSERT INTO transactions (user_id, amount, project_id, type, description, pix_code, status) VALUES (?, ?, ?, ?, ?, ?, ?)"
      )
      .bind(
        userId,
        body.amount,
        body.project_id ?? null,
        body.type,
        body.description ? body.description.replace(/[<>]/g, "") : "",
        pixCode,
        "pending"
      )
      .run();

    return c.json(
      {
        success: true,
        data: { id: result.meta.last_row_id, pix_code: pixCode },
        message: "Transaction created",
      },
      201
    );
  } catch (err: unknown) {
    const msg = err instanceof Error ? err.message : "Unknown error";
    return c.json({ success: false, message: `Failed to create transaction: ${msg}` }, 500);
  }
}

// ---- POST /transactions/:id/webhook ----
export async function webhookTransaction(c: Ctx) {
  try {
    // CRITICAL: verify webhook signature before doing anything
    const webhookSecret = c.env.WEBHOOK_SECRET;
    const signature = c.req.header("X-Webhook-Secret");
    if (!signature || signature !== webhookSecret) {
      return c.json({ success: false, message: "Invalid webhook signature" }, 401);
    }

    const id = parseInt(c.req.param("id"));
    if (isNaN(id)) return c.json({ success: false, message: "Invalid transaction ID" }, 400);

    const body = await c.req.json<{
      status: string;
      payment_id?: string;
    }>();

    // Check transaction exists
    const tx = c.env.DB.prepare("SELECT id FROM transactions WHERE id = ?").bind(id).first();
    if (!tx) return c.json({ success: false, message: "Transaction not found" }, 404);

    c.env.DB
      .prepare("UPDATE transactions SET status = ?, payment_id = ?, updated_at = datetime('now') WHERE id = ?")
      .bind(body.status ?? "unknown", body.payment_id ?? null, id)
      .run();

    return c.json({ success: true, message: "Transaction status updated" });
  } catch (err: unknown) {
    const msg = err instanceof Error ? err.message : "Unknown error";
    return c.json({ success: false, message: `Failed to process webhook: ${msg}` }, 500);
  }
}
