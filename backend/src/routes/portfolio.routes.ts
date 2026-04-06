import type { Ctx } from "../app";

function sanitize(str: string | undefined): string {
  if (!str) return "";
  return str.replace(/[<>]/g, "");
}

// ---- GET /portfolio ----
export async function listPortfolio(c: Ctx) {
  try {
    const page = Math.max(1, parseInt(c.req.query("page") || "1"));
    const limit = Math.min(50, Math.max(1, parseInt(c.req.query("limit") || "10")));
    const featured = c.req.query("featured");

    let where = "";
    const params: (string | number)[] = [];

    if (featured === "1") {
      where = " WHERE featured = 1";
    }

    const countResult = await c.env.DB.prepare(`SELECT COUNT(*) as total FROM portfolio${where}`).bind(...params).first<{ total: number }>();
    const total = countResult?.total || 0;

    // D1 bind doesn't spread empty arrays well, rebuild with explicit binding
    const allResults = await c.env.DB.prepare(`SELECT * FROM portfolio${where} ORDER BY created_at DESC LIMIT ? OFFSET ?`).bind(...[...params, limit, (page - 1) * limit]).all();

    return c.json({
      success: true,
      data: allResults.results,
      meta: { page, limit, total },
    });
  } catch (err: unknown) {
    const msg = err instanceof Error ? err.message : "Unknown error";
    return c.json({ success: false, message: `Failed to fetch portfolio items: ${msg || "Unknown error"}` }, 500);
  }
}

// ---- GET /portfolio/:id ----
export async function getPortfolioItem(c: Ctx) {
  try {
    const id = parseInt(c.req.param("id") || "0");
    if (isNaN(id)) return c.json({ success: false, message: "Invalid portfolio ID" }, 400);

    const item = await c.env.DB.prepare("SELECT * FROM portfolio WHERE id = ?").bind(id).first();
    if (!item) return c.json({ success: false, message: "Portfolio item not found" }, 404);

    return c.json({ success: true, data: item });
  } catch (err: unknown) {
    const msg = err instanceof Error ? err.message : "Unknown error";
    return c.json({ success: false, message: `Failed to fetch portfolio item: ${msg}` }, 500);
  }
}

// ---- POST /portfolio ----
export async function createPortfolioItem(c: Ctx) {
  try {
    const body = await c.req.json<{
      title: string;
      description: string;
      image_url: string;
      gallery: string;
      tech_stack: string;
      live_url: string;
      github_url: string;
      category: string;
      featured: number;
      client_name: string;
      year: number;
    }>();

    if (!body.title) return c.json({ success: false, message: "Title is required" }, 400);

    const result = await c.env.DB
      .prepare(
        `INSERT INTO portfolio (title, description, image_url, gallery, tech_stack, live_url, github_url, category, featured, client_name, year)
         VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)`
      )
      .bind(
        sanitize(body.title),
        sanitize(body.description || ""),
        body.image_url || "",
        body.gallery ? JSON.stringify(body.gallery) : null,
        body.tech_stack ? JSON.stringify(body.tech_stack) : null,
        body.live_url || "",
        body.github_url || "",
        sanitize(body.category || ""),
        body.featured ?? 0,
        sanitize(body.client_name || ""),
        body.year || null
      )
      .run();

    return c.json({ success: true, data: { id: result.meta.last_row_id }, message: "Portfolio item created" }, 201);
  } catch (err: unknown) {
    const msg = err instanceof Error ? err.message : "Unknown error";
    return c.json({ success: false, message: `Failed to create portfolio item: ${msg || "Unknown error"}` }, 500);
  }
}

// ---- PUT /portfolio/:id ----
export async function updatePortfolioItem(c: Ctx) {
  try {
    const id = parseInt(c.req.param("id") || "0");
    if (isNaN(id)) return c.json({ success: false, message: "Invalid portfolio ID" }, 400);

    const body = await c.req.json<{
      title?: string;
      description?: string;
      image_url?: string;
      gallery?: string;
      tech_stack?: string;
      live_url?: string;
      github_url?: string;
      category?: string;
      featured?: number;
      client_name?: string;
      year?: number;
    }>();

    const current = await c.env.DB.prepare("SELECT * FROM portfolio WHERE id = ?").bind(id).first<Record<string, any>>();
    if (!current) return c.json({ success: false, message: "Portfolio item not found" }, 404);

    const gallery = body.gallery !== undefined ? (typeof body.gallery === "string" ? body.gallery : JSON.stringify(body.gallery)) : current.gallery;
    const tech_stack = body.tech_stack !== undefined ? (typeof body.tech_stack === "string" ? body.tech_stack : JSON.stringify(body.tech_stack)) : current.tech_stack;

    await c.env.DB
      .prepare(
        `UPDATE portfolio SET title = ?, description = ?, image_url = ?, gallery = ?, tech_stack = ?, live_url = ?, github_url = ?, category = ?, featured = ?, client_name = ?, year = ? WHERE id = ?`
      )
      .bind(
        sanitize(body.title ?? current.title),
        sanitize(body.description ?? current.description),
        body.image_url ?? current.image_url,
        gallery,
        tech_stack,
        body.live_url ?? current.live_url,
        body.github_url ?? current.github_url,
        sanitize(body.category ?? current.category),
        body.featured ?? current.featured,
        sanitize(body.client_name ?? current.client_name),
        body.year ?? current.year,
        id
      )
      .run();

    return c.json({ success: true, message: "Portfolio item updated" });
  } catch (err: unknown) {
    const msg = err instanceof Error ? err.message : "Unknown error";
    return c.json({ success: false, message: `Failed to update portfolio item: ${msg || "Unknown error"}` }, 500);
  }
}

// ---- DELETE /portfolio/:id ----
export async function deletePortfolioItem(c: Ctx) {
  try {
    const id = parseInt(c.req.param("id") || "0");
    if (isNaN(id)) return c.json({ success: false, message: "Invalid portfolio ID" }, 400);

    const existing = await c.env.DB.prepare("SELECT id FROM portfolio WHERE id = ?").bind(id).first();
    if (!existing) return c.json({ success: false, message: "Portfolio item not found" }, 404);

    await c.env.DB.prepare("DELETE FROM portfolio WHERE id = ?").bind(id).run();

    return c.json({ success: true, message: "Portfolio item deleted" });
  } catch (err: unknown) {
    const msg = err instanceof Error ? err.message : "Unknown error";
    return c.json({ success: false, message: `Failed to delete portfolio item: ${msg || "Unknown error"}` }, 500);
  }
}
