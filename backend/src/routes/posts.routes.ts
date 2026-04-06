import type { Ctx } from "../app";

// ---- GET /posts ----
export async function listPosts(c: Ctx) {
  try {
    const page = Math.max(1, parseInt(c.req.query("page") || "1"));
    const limit = Math.min(50, Math.max(1, parseInt(c.req.query("limit") || "10")));
    const isAdmin = c.get("userRole") === "admin";

    const countSql = isAdmin
      ? "SELECT COUNT(*) as total FROM posts"
      : "SELECT COUNT(*) as total FROM posts WHERE published = 1";
    const countResult = await c.env.DB.prepare(countSql).first<{ total: number }>();
    const total = countResult?.total || 0;

    const dataSql = isAdmin
      ? "SELECT * FROM posts ORDER BY created_at DESC LIMIT ? OFFSET ?"
      : "SELECT * FROM posts WHERE published = 1 ORDER BY created_at DESC LIMIT ? OFFSET ?";
    const data = await c.env.DB.prepare(dataSql).bind(limit, (page - 1) * limit).all();

    return c.json({
      success: true,
      data: data.results,
      meta: { page, limit, total },
    });
  } catch (err: unknown) {
    const msg = err instanceof Error ? err.message : "Unknown error";
    return c.json({ success: false, message: `Failed to fetch posts: ${msg || "Unknown error"}` }, 500);
  }
}

// ---- GET /posts/:id ----
export async function getPost(c: Ctx) {
  try {
    const id = parseInt(c.req.param("id"));
    if (isNaN(id)) return c.json({ success: false, message: "Invalid post ID" }, 400);

    const isAdmin = c.get("userRole") === "admin";
    const sql = isAdmin
      ? "SELECT * FROM posts WHERE id = ?"
      : "SELECT * FROM posts WHERE id = ? AND published = 1";
    const post = await c.env.DB.prepare(sql).bind(id).first();

    if (!post) return c.json({ success: false, message: "Post not found" }, 404);

    return c.json({ success: true, data: post });
  } catch (err: unknown) {
    const msg = err instanceof Error ? err.message : "Unknown error";
    return c.json({ success: false, message: `Failed to fetch post: ${msg || "Unknown error"}` }, 500);
  }
}

function sanitize(str: string): string {
  return str.replace(/[<>]/g, "");
}

// ---- POST /posts ----
export async function createPost(c: Ctx) {
  try {
    const body = await c.req.json<{
      title: string;
      slug: string;
      content: string;
      excerpt: string;
      cover_image: string;
      tags: string;
      published: number;
    }>();

    if (!body.title || !body.slug) {
      return c.json({ success: false, message: "Title and slug are required" }, 400);
    }

    // Validate slug uniqueness
    const existing = await c.env.DB.prepare("SELECT id FROM posts WHERE slug = ?").bind(body.slug).first();
    if (existing) return c.json({ success: false, message: "Slug already exists" }, 409);

    const result = await c.env.DB
      .prepare(
        "INSERT INTO posts (title, slug, content, excerpt, cover_image, tags, published) VALUES (?, ?, ?, ?, ?, ?, ?)"
      )
      .bind(
        sanitize(body.title),
        body.slug,
        sanitize(body.content || ""),
        sanitize(body.excerpt || ""),
        body.cover_image || "",
        body.tags || "",
        body.published ?? 0
      )
      .run();

    return c.json({ success: true, data: { id: result.meta.last_row_id }, message: "Post created" }, 201);
  } catch (err: unknown) {
    const msg = err instanceof Error ? err.message : "Unknown error";
    return c.json({ success: false, message: `Failed to create post: ${msg || "Unknown error"}` }, 500);
  }
}

// ---- PUT /posts/:id ----
export async function updatePost(c: Ctx) {
  try {
    const id = parseInt(c.req.param("id"));
    if (isNaN(id)) return c.json({ success: false, message: "Invalid post ID" }, 400);

    const body = await c.req.json<{
      title?: string;
      slug?: string;
      content?: string;
      excerpt?: string;
      cover_image?: string;
      tags?: string;
      published?: number;
    }>();

    // Check slug uniqueness if changing
    if (body.slug) {
      const existing = await c.env.DB
        .prepare("SELECT id FROM posts WHERE slug = ? AND id != ?")
        .bind(body.slug, id)
        .first();
      if (existing) return c.json({ success: false, message: "Slug already exists" }, 409);
    }

    const current = await c.env.DB.prepare("SELECT * FROM posts WHERE id = ?").bind(id).first<any>();
    if (!current) return c.json({ success: false, message: "Post not found" }, 404);

    await c.env.DB
      .prepare(
        "UPDATE posts SET title = ?, slug = ?, content = ?, excerpt = ?, cover_image = ?, tags = ?, published = ? WHERE id = ?"
      )
      .bind(
        sanitize(body.title || current.title),
        body.slug || current.slug,
        sanitize(body.content || current.content),
        sanitize(body.excerpt || current.excerpt),
        body.cover_image || current.cover_image,
        body.tags || current.tags,
        body.published ?? current.published,
        id
      )
      .run();

    return c.json({ success: true, message: "Post updated" });
  } catch (err: unknown) {
    const msg = err instanceof Error ? err.message : "Unknown error";
    return c.json({ success: false, message: `Failed to update post: ${msg || "Unknown error"}` }, 500);
  }
}

// ---- DELETE /posts/:id ----
export async function deletePost(c: Ctx) {
  try {
    const id = parseInt(c.req.param("id"));
    if (isNaN(id)) return c.json({ success: false, message: "Invalid post ID" }, 400);

    const existing = await c.env.DB.prepare("SELECT id FROM posts WHERE id = ?").bind(id).first();
    if (!existing) return c.json({ success: false, message: "Post not found" }, 404);

    await c.env.DB.prepare("DELETE FROM posts WHERE id = ?").bind(id).run();

    return c.json({ success: true, message: "Post deleted" });
  } catch (err: unknown) {
    const msg = err instanceof Error ? err.message : "Unknown error";
    return c.json({ success: false, message: `Failed to delete post: ${msg}` }, 500);
  }
}
