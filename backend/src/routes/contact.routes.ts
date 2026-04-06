import type { Ctx } from "../app";

function sanitize(str: string | undefined): string {
  if (!str) return "";
  return str.replace(/[<>]/g, "");
}

function sanitizeEmail(email: string | undefined): string {
  if (!email) return "";
  return email.trim().toLowerCase();
}

// ---- POST /contact ----
export async function submitContact(c: Ctx) {
  try {
    const body = await c.req.json<{
      name: string;
      email: string;
      phone: string;
      subject: string;
      message: string;
      service_interest: string;
    }>();

    if (!body.name || !body.email || !body.message) {
      return c.json({ success: false, message: "Name, email, and message are required" }, 400);
    }

    // Email validation
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(body.email)) {
      return c.json({ success: false, message: "Invalid email format" }, 400);
    }

    await c.env.DB
      .prepare(
        `INSERT INTO contact_messages (name, email, phone, subject, message, service_interest, status)
         VALUES (?, ?, ?, ?, ?, ?, ?)`
      )
      .bind(
        sanitize(body.name),
        sanitizeEmail(body.email),
        sanitize(body.phone || ""),
        sanitize(body.subject || ""),
        sanitize(body.message),
        sanitize(body.service_interest || ""),
        "unread"
      )
      .run();

    return c.json({ success: true, message: "Message sent successfully" }, 201);
  } catch (err: unknown) {
    const msg = err instanceof Error ? err.message : "Unknown error";
    return c.json({ success: false, message: `Failed to send message: ${msg}` }, 500);
  }
}

// ---- GET /contact ----
export async function listContactMessages(c: Ctx) {
  try {
    const page = Math.max(1, parseInt(c.req.query("page") || "1"));
    const limit = Math.min(50, Math.max(1, parseInt(c.req.query("limit") || "10")));

    const countResult = await c.env.DB
      .prepare("SELECT COUNT(*) as total FROM contact_messages")
      .first<{ total: number }>();
    const total = countResult?.total || 0;

    const results = await c.env.DB
      .prepare("SELECT * FROM contact_messages ORDER BY created_at DESC LIMIT ? OFFSET ?")
      .bind(limit, (page - 1) * limit)
      .all();

    return c.json({
      success: true,
      data: results.results,
      meta: { page, limit, total },
    });
  } catch (err: unknown) {
    const msg = err instanceof Error ? err.message : "Unknown error";
    return c.json({ success: false, message: `Failed to fetch contact messages: ${msg || "Unknown error"}` }, 500);
  }
}

// ---- PUT /contact/:id ----
export async function updateContactMessage(c: Ctx) {
  try {
    const id = parseInt(c.req.param("id"));
    if (isNaN(id)) return c.json({ success: false, message: "Invalid message ID" }, 400);

    const body = await c.req.json<{ status?: string; notes?: string }>();

    const existing = await c.env.DB.prepare("SELECT id FROM contact_messages WHERE id = ?").bind(id).first();
    if (!existing) return c.json({ success: false, message: "Message not found" }, 404);

    if (body.status) {
      await c.env.DB
        .prepare("UPDATE contact_messages SET status = ?, updated_at = datetime('now') WHERE id = ?")
        .bind(sanitize(body.status), id)
        .run();
    }

    if (body.notes !== undefined) {
      await c.env.DB
        .prepare("UPDATE contact_messages SET notes = ?, updated_at = datetime('now') WHERE id = ?")
        .bind(sanitize(body.notes), id)
        .run();
    }

    return c.json({ success: true, message: "Contact message updated" });
  } catch (err: unknown) {
    const msg = err instanceof Error ? err.message : "Unknown error";
    return c.json({ success: false, message: `Failed to update contact message: ${msg}` }, 500);
  }
}
