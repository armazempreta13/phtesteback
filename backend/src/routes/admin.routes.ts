import { Context } from "hono";
import type { Env, Variables } from "../app";

type Ctx = { Bindings: Env; Variables: Variables };

// ---- GET /admin/stats ----
export async function getAdminStats(c: Ctx) {
  try {
    const users = c.env.DB.prepare("SELECT COUNT(*) as total FROM users").first<{ total: number }>()!;
    const projects = c.env.DB.prepare("SELECT COUNT(*) as total FROM projects").first<{ total: number }>()!;
    const transactions = c.env.DB.prepare("SELECT COUNT(*) as total FROM transactions").first<{ total: number }>()!;
    const posts = c.env.DB.prepare("SELECT COUNT(*) as total FROM posts").first<{ total: number }>()!;
    const portfolioItems = c.env.DB.prepare("SELECT COUNT(*) as total FROM portfolio").first<{ total: number }>()!;
    const briefings = c.env.DB.prepare("SELECT COUNT(*) as total FROM briefings").first<{ total: number }>()!;
    const contactMessages = c.env.DB.prepare("SELECT COUNT(*) as total FROM contact_messages").first<{ total: number }>()!;

    return c.json({
      success: true,
      data: {
        users: users.total,
        projects: projects.total,
        transactions: transactions.total,
        posts: posts.total,
        portfolio_items: portfolioItems.total,
        briefings: briefings.total,
        contact_messages: contactMessages.total,
      },
    });
  } catch (err: unknown) {
    const msg = err instanceof Error ? err.message : "Unknown error";
    return c.json({ success: false, message: `Failed to fetch admin stats: ${msg}` }, 500);
  }
}

// ---- GET /analytics ----
export async function getAnalytics(c: Ctx) {
  try {
    const daysParam = parseInt(c.req.query("days") || "30");
    if (isNaN(daysParam) || daysParam < 1) {
      return c.json({ success: false, message: "Days must be a positive integer" }, 400);
    }
    const days = Math.min(daysParam, 365);

    const data = c.env.DB
      .prepare(`
        SELECT * FROM site_analytics
        WHERE created_at >= datetime('now', ?)
        ORDER BY created_at DESC
      `)
      .bind(`-${days} days`)
      .all();

    const summary = c.env.DB
      .prepare(`
        SELECT
          COUNT(*) as total_events,
          COUNT(CASE WHEN type = 'page_view' THEN 1 END) as page_views,
          COUNT(CASE WHEN type = 'click' THEN 1 END) as clicks,
          COUNT(CASE WHEN type = 'conversion' THEN 1 END) as conversions,
          COUNT(CASE WHEN type = 'scroll' THEN 1 END) as scrolls,
          COUNT(DISTINCT user_agent) as unique_user_agents
        FROM site_analytics
        WHERE created_at >= datetime('now', ?)
      `)
      .bind(`-${days} days`)
      .first();

    return c.json({
      success: true,
      data: {
        summary,
        events: data.results,
        meta: { days },
      },
    });
  } catch (err: unknown) {
    const msg = err instanceof Error ? err.message : "Unknown error";
    return c.json({ success: false, message: `Failed to fetch analytics: ${msg}` }, 500);
  }
}
