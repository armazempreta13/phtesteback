import type { Ctx } from "../app";

// ---- GET /admin/stats ----
export async function getAdminStats(c: Ctx) {
  try {
    const users = await c.env.DB.prepare("SELECT COUNT(*) as total FROM users").first<{ total: number }>()!;
    const projects = await c.env.DB.prepare("SELECT COUNT(*) as total FROM projects").first<{ total: number }>()!;
    const transactions = await c.env.DB.prepare("SELECT COUNT(*) as total FROM transactions").first<{ total: number }>()!;
    const posts = await c.env.DB.prepare("SELECT COUNT(*) as total FROM posts").first<{ total: number }>()!;
    const portfolioItems = await c.env.DB.prepare("SELECT COUNT(*) as total FROM portfolio").first<{ total: number }>()!;
    const briefings = await c.env.DB.prepare("SELECT COUNT(*) as total FROM briefings").first<{ total: number }>()!;
    const contactMessages = await c.env.DB.prepare("SELECT COUNT(*) as total FROM contact_messages").first<{ total: number }>()!;

    return c.json({
      success: true,
      data: {
        users: users?.total || 0,
        projects: projects?.total || 0,
        transactions: transactions?.total || 0,
        posts: posts?.total || 0,
        portfolio_items: portfolioItems?.total || 0,
        briefings: briefings?.total || 0,
        contact_messages: contactMessages?.total || 0,
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

    const data = await c.env.DB
      .prepare(`
        SELECT * FROM site_analytics
        WHERE created_at >= datetime('now', ?)
        ORDER BY created_at DESC
      `)
      .bind(`-${days} days`)
      .all();

    const summary = await c.env.DB
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
