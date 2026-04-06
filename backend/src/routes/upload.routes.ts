import type { Ctx } from '../app';

const ALLOWED_MIME_TYPES = new Set([
  'image/jpeg', 'image/png', 'image/gif', 'image/webp', 'image/svg+xml',
  'application/pdf',
  'application/msword',
  'application/vnd.openxmlformats-officedocument.wordprocessingml.document',
  'text/plain',
  'text/csv',
  'application/zip',
  'application/json',
]);

const MAX_FILE_SIZE = 5 * 1024 * 1024; // 5MB

// ============================================================
// UPLOAD FILE — saves to R2
// ============================================================
export async function uploadFile(c: Ctx) {
  try {
    const formData = await c.req.formData();
    const file = formData.get('file') as File | null;

    if (!file) {
      return c.json({ success: false, message: 'Arquivo e obrigatorio' }, 400);
    }

    if (file.size > MAX_FILE_SIZE) {
      return c.json({ success: false, message: 'Arquivo muito grande. Maximo: 5MB' }, 413);
    }

    if (!ALLOWED_MIME_TYPES.has(file.type)) {
      return c.json({ success: false, message: 'Tipo de arquivo nao permitido' }, 400);
    }

    // Generate unique filename
    const ext = file.name.split('.').pop() || 'bin';
    const key = `${c.get('userId')}/${Date.now()}-${Math.random().toString(36).substring(2, 10)}.${ext}`;

    // Upload to R2
    await c.env.UPLOADS.put(key, file.stream(), {
      httpMetadata: { contentType: file.type },
      customMetadata: {
        userId: String(c.get('userId')),
        originalName: file.name.substring(0, 255),
        mimeType: file.type,
      },
    });

    // Save record to DB
    await c.env.DB.prepare(
      'INSERT INTO uploads (user_id, filename, originalname, mimetype, size, path) VALUES (?, ?, ?, ?, ?, ?)'
    ).bind(
      c.get('userId'),
      key.split('/').pop() || '',
      file.name.substring(0, 255),
      file.type,
      file.size,
      key
    ).run();

    return c.json({
      success: true,
      data: {
        filename: key,
        originalName: file.name,
        size: file.size,
        url: `/api/upload/${encodeURIComponent(key)}`,
      },
    }, 201);
  } catch (err: unknown) {
    const msg = err instanceof Error ? err.message : "Unknown error";
    return c.json({ success: false, message: `Erro no upload do arquivo: ${msg || "Unknown error"}` }, 500);
  }
}

// ============================================================
// DOWNLOAD FILE — verifies ownership
// ============================================================
export async function downloadFile(c: Ctx) {
  try {
    const filename = decodeURIComponent(c.req.param('filename') || "");
    const userId = c.get('userId');
    const userRole = c.get('userRole');

    // Look up file in DB and verify ownership
    const fileInfo = await c.env.DB.prepare(
      'SELECT * FROM uploads WHERE path = ?'
    ).bind(filename).first<any>();

    if (!fileInfo) {
      return c.json({ success: false, message: 'Arquivo nao encontrado' }, 404);
    }

    // Ownership check (admin can access any file)
    if (userRole !== 'admin' && fileInfo.user_id !== userId) {
      return c.json({ success: false, message: 'Acesso negado' }, 403);
    }

    // Fetch from R2
    const object = await c.env.UPLOADS.get(fileInfo.path);
    if (!object) {
      return c.json({ success: false, message: 'Arquivo nao encontrado no storage' }, 404);
    }

    const headers = new Headers();
    headers.set('Content-Type', object.httpMetadata?.contentType || 'application/octet-stream');
    headers.set('Content-Disposition', `attachment; filename="${encodeURIComponent(fileInfo.originalname)}"`);

    return new Response(object.body, { headers });
  } catch (err: unknown) {
    const msg = err instanceof Error ? err.message : "Unknown error";
    return c.json({ success: false, message: `Erro ao baixar arquivo: ${msg || "Unknown error"}` }, 500);
  }
}

// ============================================================
// LIST USER UPLOADS
// ============================================================
export async function listUserUploads(c: Ctx) {
  try {
    const userId = c.get('userId');
    const userRole = c.get('userRole');
    const db = c.env.DB;

    let uploads: any[];
    if (userRole === 'admin') {
      const result = await db.prepare('SELECT * FROM uploads ORDER BY created_at DESC LIMIT 100').all();
      uploads = result.results || [];
    } else {
      const result = await db.prepare(
        'SELECT * FROM uploads WHERE user_id = ? ORDER BY created_at DESC LIMIT 100'
      ).bind(userId).all();
      uploads = result.results || [];
    }

    return c.json({ success: true, data: { uploads } });
  } catch (err: unknown) {
    const msg = err instanceof Error ? err.message : "Unknown error";
    return c.json({ success: false, message: `Erro ao listar arquivos: ${msg || "Unknown error"}` }, 500);
  }
}
