import { Context } from 'hono';
import type { Env } from '../index';

// ============================================================
// GET ALL SETTINGS — admin only
// ============================================================
export async function getSettings(c: Context<{ Bindings: Env; Variables: { userId: number; userRole: string; userEmail: string } }>) {
  try {
    const db = c.env.DB;
    const result = await db.prepare('SELECT * FROM site_settings ORDER BY category, key').all();

    const settings: Record<string, any> = {};
    for (const row of (result.results || [])) {
      try {
        settings[row.key] = typeof row.value === 'string' ? JSON.parse(row.value) : row.value;
      } catch {
        settings[row.key] = row.value;
      }
    }

    return c.json({ success: true, data: { settings } });
  } catch (err) {
    console.error('Get settings error:', err);
    return c.json({ success: false, message: 'Erro ao buscar configuracoes' }, 500);
  }
}

// ============================================================
// UPDATE SETTINGS — admin only
// ============================================================
export async function updateSettings(c: Context<{ Bindings: Env; Variables: { userId: number; userRole: string; userEmail: string } }>) {
  try {
    const db = c.env.DB;
    const body = await c.req.json();
    const { settings } = body;

    if (!settings || typeof settings !== 'object') {
      return c.json({ success: false, message: 'Dados invalidos' }, 400);
    }

    const results = [];
    for (const [key, value] of Object.entries(settings)) {
      if (!key || key.length > 100) continue; // Skip invalid keys

      const valueStr = typeof value === 'object' ? JSON.stringify(value) : String(value);
      await db.prepare(
        `INSERT INTO site_settings (key, value, category) VALUES (?, ?, 'site')
         ON CONFLICT(key) DO UPDATE SET value = ?, updated_at = CURRENT_TIMESTAMP`
      ).bind(key, valueStr, valueStr).run();
      results.push(key);
    }

    return c.json({ success: true, message: 'Configuracoes atualizadas', data: { updated: results } });
  } catch (err) {
    console.error('Update settings error:', err);
    return c.json({ success: false, message: 'Erro ao atualizar configuracoes' }, 500);
  }
}
