import type { Ctx } from '../app';

// ============================================================
// GET ALL PROJECTS — admin sees all, client sees own
// ============================================================
export async function getProjects(c: Ctx) {
  try {
    const db = c.env.DB;
    const userRole = c.get('userRole');
    const userEmail = c.get('userEmail');

    let rows: any[];
    if (userRole === 'admin') {
      const result = await db.prepare('SELECT * FROM projects ORDER BY created_at DESC').all();
      rows = result.results || [];
    } else {
      const result = await db.prepare(
        'SELECT * FROM projects WHERE client_email = ? ORDER BY created_at DESC'
      ).bind(userEmail).all();
      rows = result.results || [];
    }

    return c.json({ success: true, data: { projects: rows, total: rows.length } });
  } catch (err) {
    console.error('Get projects error:', err);
    return c.json({ success: false, message: 'Erro ao buscar projetos' }, 500);
  }
}

// ============================================================
// GET SINGLE PROJECT — ownership enforced
// ============================================================
export async function getProject(c: Ctx) {
  try {
    const db = c.env.DB;
    const id = Number(c.req.param('id'));
    const userRole = c.get('userRole');
    const userEmail = c.get('userEmail');

    let project: any;
    if (userRole === 'admin') {
      project = await db.prepare('SELECT * FROM projects WHERE id = ?').bind(id).first();
    } else {
      project = await db.prepare(
        'SELECT * FROM projects WHERE id = ? AND client_email = ?'
      ).bind(id, userEmail).first();
    }

    if (!project) {
      return c.json({ success: false, message: 'Projeto nao encontrado' }, 404);
    }

    return c.json({ success: true, data: { project } });
  } catch (err) {
    console.error('Get project error:', err);
    return c.json({ success: false, message: 'Erro ao buscar projeto' }, 500);
  }
}

// ============================================================
// CREATE PROJECT — admin only
// ============================================================
export async function createProject(c: Ctx) {
  try {
    const db = c.env.DB;
    const body = await c.req.json();
    const {
      title, description, tech_stack, status, budget, deadline,
      client_name, client_email, client_cpf, progress, next_milestone,
      financial_total, financial_paid, financial_status,
    } = body;

    if (!title) {
      return c.json({ success: false, message: 'Titulo e obrigatorio' }, 400);
    }

    const result = await db.prepare(
      `INSERT INTO projects (title, description, tech_stack, status, budget, deadline,
        client_name, client_email, client_cpf, progress, next_milestone,
        financial_total, financial_paid, financial_status)
       VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)`
    ).bind(
      title, description || null, tech_stack ? JSON.stringify(tech_stack) : null,
      status || 'pending', budget || null, deadline || null,
      client_name || null, client_email || null, client_cpf || null,
      progress ?? 0, next_milestone || null,
      financial_total ?? 0, financial_paid ?? 0,
      financial_status || 'pending'
    ).run();

    const project = await db.prepare('SELECT * FROM projects WHERE id = ?')
      .bind(result.meta.last_row_id).first();

    return c.json({ success: true, data: { project } }, 201);
  } catch (err) {
    console.error('Create project error:', err);
    return c.json({ success: false, message: 'Erro ao criar projeto' }, 500);
  }
}

// ============================================================
// UPDATE PROJECT — admin only, fields validated
// ============================================================
export async function updateProject(c: Ctx) {
  try {
    const db = c.env.DB;
    const id = Number(c.req.param('id'));
    const body = await c.req.json();

    // Verify project exists
    const existing = await db.prepare('SELECT id FROM projects WHERE id = ?').bind(id).first();
    if (!existing) {
      return c.json({ success: false, message: 'Projeto nao encontrado' }, 404);
    }

    // Build dynamic update with only provided fields
    const allowedFields = [
      'title', 'description', 'tech_stack', 'status', 'budget', 'deadline',
      'client_name', 'client_email', 'client_cpf', 'progress',
      'next_milestone', 'financial_total', 'financial_paid', 'financial_status',
      'contract', 'briefing', 'payment_order', 'activity', 'notifications', 'tasks', 'links'
    ];

    const updates: string[] = ['updated_at = CURRENT_TIMESTAMP'];
    const params: any[] = [];

    for (const field of allowedFields) {
      if (body[field] !== undefined) {
        const value = (field === 'tech_stack' && Array.isArray(body[field]))
          ? JSON.stringify(body[field])
          : body[field];
        updates.push(`${field} = ?`);
        params.push(value);
      }
    }

    if (updates.length <= 1) {
      return c.json({ success: false, message: 'Nenhum campo valido para atualizar' }, 400);
    }

    params.push(id);
    await db.prepare(
      `UPDATE projects SET ${updates.join(', ')} WHERE id = ?`
    ).bind(...params).run();

    const project = await db.prepare('SELECT * FROM projects WHERE id = ?').bind(id).first();
    return c.json({ success: true, data: { project } });
  } catch (err) {
    console.error('Update project error:', err);
    return c.json({ success: false, message: 'Erro ao atualizar projeto' }, 500);
  }
}

// ============================================================
// DELETE PROJECT — admin only
// ============================================================
export async function deleteProject(c: Ctx) {
  try {
    const db = c.env.DB;
    const id = Number(c.req.param('id'));

    const result = await db.prepare('DELETE FROM projects WHERE id = ?').bind(id).run();
    if (result.meta.changes === 0) {
      return c.json({ success: false, message: 'Projeto nao encontrado' }, 404);
    }

    return c.json({ success: true, message: 'Projeto excluido com sucesso' });
  } catch (err) {
    console.error('Delete project error:', err);
    return c.json({ success: false, message: 'Erro ao excluir projeto' }, 500);
  }
}
