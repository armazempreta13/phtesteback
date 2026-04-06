import { Context } from 'hono';
import type { Env } from '../index';

// ============================================================
// GET CONTRACT — ownership enforced (admin sees all)
// ============================================================
export async function getContract(c: Context<{ Bindings: Env; Variables: { userId: number; userRole: string; userEmail: string } }>) {
  try {
    const db = c.env.DB;
    const projectId = Number(c.req.param('project_id'));
    const userRole = c.get('userRole');
    const userEmail = c.get('userEmail');

    let project: any;
    if (userRole === 'admin') {
      project = await db.prepare('SELECT * FROM projects WHERE id = ?').bind(projectId).first();
    } else {
      project = await db.prepare(
        'SELECT * FROM projects WHERE id = ? AND client_email = ?'
      ).bind(projectId, userEmail).first();
    }

    if (!project) {
      return c.json({ success: false, message: 'Projeto nao encontrado' }, 404);
    }

    let contract: any = null;
    if (project.contract) {
      try {
        contract = typeof project.contract === 'string' ? JSON.parse(project.contract) : project.contract;
      } catch {
        contract = null;
      }
    }

    return c.json({ success: true, data: { contract, project: { id: project.id, title: project.title, client_name: project.client_name } } });
  } catch (err) {
    console.error('Get contract error:', err);
    return c.json({ success: false, message: 'Erro ao buscar contrato' }, 500);
  }
}

// ============================================================
// GENERATE CONTRACT — admin only
// ============================================================
export async function generateContract(c: Context<{ Bindings: Env; Variables: { userId: number; userRole: string; userEmail: string } }>) {
  try {
    const db = c.env.DB;
    const body = await c.req.json();
    const projectId = Number(body.project_id);

    if (!projectId) {
      return c.json({ success: false, message: 'project_id e obrigatorio' }, 400);
    }

    const project = await db.prepare('SELECT * FROM projects WHERE id = ?').bind(projectId).first<any>();
    if (!project) {
      return c.json({ success: false, message: 'Projeto nao encontrado' }, 404);
    }

    const contractData = {
      status: 'draft',
      generatedAt: new Date().toISOString(),
      sentAt: null,
      signedAt: null,
      clientName: project.client_name || '',
      clientEmail: project.client_email || '',
      clientCpf: project.client_cpf || '',
      projectName: project.title || '',
      financialTotal: project.financial_total ?? 0,
    };

    await db.prepare(
      'UPDATE projects SET contract = ?, updated_at = CURRENT_TIMESTAMP WHERE id = ?'
    ).bind(JSON.stringify(contractData), projectId).run();

    return c.json({ success: true, data: { contract: contractData } });
  } catch (err) {
    console.error('Generate contract error:', err);
    return c.json({ success: false, message: 'Erro ao gerar contrato' }, 500);
  }
}

// ============================================================
// UPDATE CONTRACT — admin only
// ============================================================
export async function updateContract(c: Context<{ Bindings: Env; Variables: { userId: number; userRole: string; userEmail: string } }>) {
  try {
    const db = c.env.DB;
    const projectId = Number(c.req.param('project_id'));
    const body = await c.req.json();

    if (!body.contract || typeof body.contract !== 'object') {
      return c.json({ success: false, message: 'Dados do contrato invalidos' }, 400);
    }

    const existing = await db.prepare('SELECT contract FROM projects WHERE id = ?').bind(projectId).first<any>();
    if (!existing) {
      return c.json({ success: false, message: 'Projeto nao encontrado' }, 404);
    }

    // Merge with existing contract
    let contractData = {};
    if (existing.contract) {
      try {
        contractData = typeof existing.contract === 'string' ? JSON.parse(existing.contract) : existing.contract;
      } catch {
        contractData = {};
      }
    }

    // Only allow specific fields to be updated
    const allowedFields = ['status', 'sentAt', 'signedAt', 'adminSignature', 'clientSignature', 'terms'];
    const updatePayload = { ...contractData };
    for (const field of allowedFields) {
      if (body.contract[field] !== undefined) {
        updatePayload[field] = body.contract[field];
      }
    }

    await db.prepare(
      'UPDATE projects SET contract = ?, updated_at = CURRENT_TIMESTAMP WHERE id = ?'
    ).bind(JSON.stringify(updatePayload), projectId).run();

    return c.json({ success: true, data: { contract: updatePayload } });
  } catch (err) {
    console.error('Update contract error:', err);
    return c.json({ success: false, message: 'Erro ao atualizar contrato' }, 500);
  }
}

// ============================================================
// REVOKE CONTRACT — admin only
// ============================================================
export async function revokeContract(c: Context<{ Bindings: Env; Variables: { userId: number; userRole: string; userEmail: string } }>) {
  try {
    const db = c.env.DB;
    const projectId = Number(c.req.param('project_id'));

    const revokedData = {
      status: 'revoked',
      adminSignature: null,
      clientSignature: null,
      sentAt: null,
      signedAt: null,
    };

    await db.prepare(
      'UPDATE projects SET contract = ?, updated_at = CURRENT_TIMESTAMP WHERE id = ?'
    ).bind(JSON.stringify(revokedData), projectId).run();

    return c.json({ success: true, message: 'Contrato revogado' });
  } catch (err) {
    console.error('Revoke contract error:', err);
    return c.json({ success: false, message: 'Erro ao revogar contrato' }, 500);
  }
}
