import { Context } from "hono";
import type { Env, Variables } from "../app";

type Ctx = { Bindings: Env; Variables: Variables };

const VALID_TYPES = ["page_view", "click", "conversion", "scroll"] as const;

// ---- POST /api/analytics/track ----
export async function trackAnalytics(c: Ctx) {
  try {
    const body = await c.req.json<{
      type: string;
      path: string;
      user_agent: string;
      referrer: string;
    }>();

    // Validate type
    if (!body.type || !VALID_TYPES.includes(body.type as (typeof VALID_TYPES)[number])) {
      return c.json(
        {
          success: false,
          message: "Invalid type. Must be one of: page_view, click, conversion, scroll",
        },
        400
      );
    }

    // Validate path length (max 500 chars)
    if (body.path && body.path.length > 500) {
      return c.json({ success: false, message: "Path exceeds maximum length of 500 characters" }, 400);
    }

    c.env.DB
      .prepare(
        "INSERT INTO site_analytics (type, path, user_agent, referrer) VALUES (?, ?, ?, ?)"
      )
      .bind(
        body.type,
        (body.path || "").substring(0, 500),
        (body.user_agent || "").substring(0, 500),
        (body.referrer || "").substring(0, 500)
      )
      .run();

    return c.json({ success: true, message: "Analytics event tracked" }, 201);
  } catch (err: unknown) {
    const msg = err instanceof Error ? err.message : "Unknown error";
    return c.json({ success: false, message: `Failed to track analytics: ${msg}` }, 500);
  }
}
