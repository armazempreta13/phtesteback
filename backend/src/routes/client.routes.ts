import { Context } from 'hono';
import type { Env } from '../index';

// ============================================================
// GET CLIENT PROJECTS — filtered by client_email
// ============================================================
export async function getClientProjects(c: Context<{ Bindings: Env; Variables: { userId: number; userRole: string; userEmail: string } }>) {
  try {
    const db = c.env.DB;
    const userEmail = c.get('userEmail');

    const result = await db.prepare(
      'SELECT * FROM projects WHERE client_email = ? ORDER BY created_at DESC'
    ).bind(userEmail).all();

    return c.json({ success: true, data: { projects: result.results || [], total: result.results?.length || 0 } });
  } catch (err) {
    console.error('Get client projects error:', err);
    return c.json({ success: false, message: 'Erro ao buscar projetos' }, 500);
  }
}

// ============================================================
// GET CLIENT PROJECT — ownership enforced
// ============================================================
export async function getClientProject(c: Context<{ Bindings: Env; Variables: { userId: number; userRole: string; userEmail: string } }>) {
  try {
    const db = c.env.DB;
    const id = Number(c.req.param('id'));
    const userEmail = c.get('userEmail');

    const project = await db.prepare(
      'SELECT * FROM projects WHERE id = ? AND client_email = ?'
    ).bind(id, userEmail).first();

    if (!project) {
      return c.json({ success: false, message: 'Projeto nao encontrado' }, 404);
    }

    return c.json({ success: true, data: { project } });
  } catch (err) {
    console.error('Get client project error:', err);
    return c.json({ success: false, message: 'Erro ao buscar projeto' }, 500);
  }
}

// ============================================================
// GET CLIENT MESSAGES — ownership enforced
// ============================================================
export async function getClientMessages(c: Context<{ Bindings: Env; Variables: { userId: number; userRole: string; userEmail: string } }>) {
  try {
    const db = c.env.DB;
    const id = Number(c.req.param('id'));
    const userEmail = c.get('userEmail');

    // Verify project ownership first
    const project = await db.prepare(
      'SELECT messages FROM projects WHERE id = ? AND client_email = ?'
    ).bind(id, userEmail).first<any>();

    if (!project) {
      return c.json({ success: false, message: 'Projeto nao encontrado' }, 404);
    }

    let messages: any[] = [];
    if (project.messages) {
      try {
        messages = typeof project.messages === 'string' ? JSON.parse(project.messages) : project.messages;
      } catch {
        messages = [];
      }
    }

    return c.json({ success: true, data: { messages } });
  } catch (err) {
    console.error('Get client messages error:', err);
    return c.json({ success: false, message: 'Erro ao buscar mensagens' }, 500);
  }
}

// ============================================================
// SEND CLIENT MESSAGE — ownership enforced
// ============================================================
export async function sendClientMessage(c: Context<{ Bindings: Env; Variables: { userId: number; userRole: string; userEmail: string } }>) {
  try {
    const db = c.env.DB;
    const id = Number(c.req.param('id'));
    const userEmail = c.get('userEmail');
    const body = await c.req.json();

    // Verify project ownership
    const existing = await db.prepare(
      'SELECT messages, client_email FROM projects WHERE id = ? AND client_email = ?'
    ).bind(id, userEmail).first<any>();

    if (!existing) {
      return c.json({ success: false, message: 'Projeto nao encontrado ou acesso negado' }, 403);
    }

    const { message, subject } = body;
    if (!message) {
      return c.json({ success: false, message: 'Mensagem e obrigatoria' }, 400);
    }

    // Parse existing messages
    let messages: any[] = [];
    if (existing.messages) {
      try {
        messages = typeof existing.messages === 'string' ? JSON.parse(existing.messages) : existing.messages;
      } catch {
        messages = [];
      }
    }

    // Add new message
    messages.unshift({
      id: `msg_${Date.now()}`,
      from: userEmail,
      subject: subject || 'Sem assunto',
      message: message.substring(0, 5000),
      date: new Date().toISOString(),
    });

    // Limit stored messages to 100
    if (messages.length > 100) messages = messages.slice(0, 100);

    await db.prepare(
      'UPDATE projects SET messages = ?, updated_at = CURRENT_TIMESTAMP WHERE id = ?'
    ).bind(JSON.stringify(messages), id).run();

    return c.json({ success: true, data: { messageCount: messages.length } });
  } catch (err) {
    console.error('Send client message error:', err);
    return c.json({ success: false, message: 'Erro ao enviar mensagem' }, 500);
  }
}
