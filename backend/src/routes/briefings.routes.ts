import { Context } from "hono";
import type { Env, Variables } from "../app";

type Ctx = { Bindings: Env; Variables: Variables };

function sanitize(str: string | undefined): string {
  if (!str) return "";
  return str.replace(/[<>]/g, "");
}

function sanitizeEmail(email: string | undefined): string {
  if (!email) return "";
  return email.trim().toLowerCase();
}

// ---- POST /briefings ----
export async function createBriefing(c: Ctx) {
  try {
    const body = await c.req.json<{
      name: string;
      email: string;
      phone: string;
      company: string;
      project_type: string;
      description: string;
      budget_range: string;
      deadline: string;
      features: string;
    }>();

    if (!body.name || !body.email) {
      return c.json({ success: false, message: "Name and email are required" }, 400);
    }

    // Basic email validation
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(body.email)) {
      return c.json({ success: false, message: "Invalid email format" }, 400);
    }

    const features = body.features ? (typeof body.features === "string" ? body.features : JSON.stringify(body.features)) : null;

    const result = c.env.DB
      .prepare(
        `INSERT INTO briefings (name, email, phone, company, project_type, description, budget_range, deadline, features, status)
         VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?)`
      )
      .bind(
        sanitize(body.name),
        sanitizeEmail(body.email),
        sanitize(body.phone || ""),
        sanitize(body.company || ""),
        sanitize(body.project_type || ""),
        sanitize(body.description || ""),
        sanitize(body.budget_range || ""),
        body.deadline || null,
        features,
        "pending"
      )
      .run();

    return c.json({ success: true, data: { id: result.meta.last_row_id }, message: "Briefing submitted" }, 201);
  } catch (err: unknown) {
    const msg = err instanceof Error ? err.message : "Unknown error";
    return c.json({ success: false, message: `Failed to create briefing: ${msg}` }, 500);
  }
}

// ---- GET /briefings ----
export async function listBriefings(c: Ctx) {
  try {
    const page = Math.max(1, parseInt(c.req.query("page") || "1"));
    const limit = Math.min(50, Math.max(1, parseInt(c.req.query("limit") || "10")));
    const role = c.get("userRole");
    const userEmail = c.get("userEmail");

    let sql: string;
    let countSql: string;
    let params: (string | number)[];

    if (role === "admin") {
      countSql = "SELECT COUNT(*) as total FROM briefings";
      sql = "SELECT * FROM briefings ORDER BY created_at DESC LIMIT ? OFFSET ?";
      params = [limit, (page - 1) * limit];
    } else {
      countSql = "SELECT COUNT(*) as total FROM briefings WHERE email = ?";
      sql = "SELECT * FROM briefings WHERE email = ? ORDER BY created_at DESC LIMIT ? OFFSET ?";
      params = [userEmail, limit, (page - 1) * limit];
    }

    const { total } = c.env.DB.prepare(countSql).bind(...params.slice(0, role === "admin" ? 0 : 1)).first<{ total: number }>()!;
    const results = c.env.DB.prepare(sql).bind(...params).all();

    return c.json({
      success: true,
      data: results.results,
      meta: { page, limit, total },
    });
  } catch (err: unknown) {
    const msg = err instanceof Error ? err.message : "Unknown error";
    return c.json({ success: false, message: `Failed to fetch briefings: ${msg}` }, 500);
  }
}

// ---- GET /briefings/:id ----
export async function getBriefing(c: Ctx) {
  try {
    const id = parseInt(c.req.param("id"));
    if (isNaN(id)) return c.json({ success: false, message: "Invalid briefing ID" }, 400);

    const role = c.get("userRole");
    const userEmail = c.get("userEmail");

    let briefing;
    if (role === "admin") {
      briefing = c.env.DB.prepare("SELECT * FROM briefings WHERE id = ?").bind(id).first();
    } else {
      briefing = c.env.DB.prepare("SELECT * FROM briefings WHERE id = ? AND email = ?").bind(id, userEmail).first();
    }

    if (!briefing) return c.json({ success: false, message: "Briefing not found" }, 404);

    return c.json({ success: true, data: briefing });
  } catch (err: unknown) {
    const msg = err instanceof Error ? err.message : "Unknown error";
    return c.json({ success: false, message: `Failed to fetch briefing: ${msg}` }, 500);
  }
}

// ---- PUT /briefings/:id/status ----
export async function updateBriefingStatus(c: Ctx) {
  try {
    const id = parseInt(c.req.param("id"));
    if (isNaN(id)) return c.json({ success: false, message: "Invalid briefing ID" }, 400);

    const body = await c.req.json<{ status: string }>();
    if (!body.status) return c.json({ success: false, message: "Status is required" }, 400);

    const existing = c.env.DB.prepare("SELECT id FROM briefings WHERE id = ?").bind(id).first();
    if (!existing) return c.json({ success: false, message: "Briefing not found" }, 404);

    c.env.DB
      .prepare("UPDATE briefings SET status = ?, updated_at = datetime('now') WHERE id = ?")
      .bind(sanitize(body.status), id)
      .run();

    return c.json({ success: true, message: "Briefing status updated" });
  } catch (err: unknown) {
    const msg = err instanceof Error ? err.message : "Unknown error";
    return c.json({ success: false, message: `Failed to update briefing status: ${msg}` }, 500);
  }
}
