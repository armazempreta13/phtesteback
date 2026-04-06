const { dbRun, dbGet, dbAll } = require('../db');
const logger = require('../utils/logger');

// Helper: parse JSON text columns into objects/arrays for frontend consumption
function parseJsonFields(project) {
  const jsonFields = ['tech_stack', 'files', 'contract', 'briefing', 'payment_order', 'activity', 'notifications', 'messages', 'tasks', 'links'];
  for (const field of jsonFields) {
    if (project && project[field] && typeof project[field] === 'string') {
      try {
        project[field] = JSON.parse(project[field]);
      } catch (e) {
        // leave as-is if not valid JSON
      }
    }
  }
  return project;
}

exports.listProjects = async (req, res) => {
  try {
    const { status, client_id, page = 1, limit = 20 } = req.query;
    const offset = (parseInt(page) - 1) * parseInt(limit);
    const isAdmin = req.userRole === 'admin';

    let sql = 'SELECT p.*, u.name as joined_client_name FROM projects p LEFT JOIN users u ON p.client_id = u.id WHERE 1=1';
    const params = [];

    if (!isAdmin) {
      sql += ' AND p.client_email = ?';
      params.push(req.userEmail);
    }

    if (status) {
      sql += ' AND p.status = ?';
      params.push(status);
    }

    if (client_id && isAdmin) {
      sql += ' AND p.client_id = ?';
      params.push(client_id);
    }

    sql += ' ORDER BY p.created_at DESC LIMIT ? OFFSET ?';
    params.push(parseInt(limit), offset);

    const rows = await dbAll(req.app.locals.db, sql, params);
    const projects = rows.map(parseJsonFields);

    // Build count query with same params as main query (minus pagination)
    const countSql = `SELECT COUNT(*) as total FROM projects WHERE 1=1${
      !isAdmin ? ' AND client_email = ?' : ''
    }${status ? ' AND status = ?' : ''}${client_id && isAdmin ? ' AND client_id = ?' : ''}`;
    const countParams = isAdmin
      ? [...params.filter((_, i) => i < params.length - 2)]
      : [req.userEmail, ...(status ? [status] : []), ...(client_id ? [client_id] : [])];
    const countRow = await dbGet(req.app.locals.db, countSql, countParams);

    res.json({
      success: true,
      data: { projects, total: countRow?.total || projects.length, page: parseInt(page), limit: parseInt(limit) },
    });
  } catch (err) {
    logger.error('List projects error:', err.message, err.stack);
    console.error('FULL PROJECTS ERROR:', err.message);
    console.error('SQL:', err.message);
    res.status(500).json({
      success: false,
      message: err.message,
    });
  }
};

exports.getProject = async (req, res) => {
  try {
    const { id } = req.params;
    const isAdmin = req.userRole === 'admin';

    let sql;
    let params;
    if (isAdmin) {
      sql = 'SELECT * FROM projects WHERE id = ?';
      params = [id];
    } else {
      sql = 'SELECT * FROM projects WHERE id = ? AND client_email = ?';
      params = [id, req.userEmail];
    }

    const project = await dbGet(req.app.locals.db, sql, params);
    if (!project) {
      return res.status(404).json({
        success: false,
        message: 'Projeto nao encontrado',
      });
    }

    res.json({
      success: true,
      data: { project: parseJsonFields(project) },
    });
  } catch (err) {
    logger.error('Get project error:', err.message);
    res.status(500).json({
      success: false,
      message: 'Erro ao buscar projeto',
    });
  }
};

exports.createProject = async (req, res) => {
  try {
    const {
      // Legacy fields
      title, description, tech_stack, status, budget, deadline, client_id, files,
      // CRM fields
      client_name, client_email, client_cpf,
      clientName, clientEmail, clientCpf, // camelCase aliases
      progress, next_milestone, nextMilestone,
      financial_total, financial_paid, financial_status,
      financial, // { total, paid, status }
      contract, briefing, payment_order, activity, notifications,
    } = req.body;

    // Accept camelCase or snake_case for CRM fields
    const finalClientName  = client_name  || clientName  || null;
    const finalClientEmail = client_email || clientEmail || null;
    const finalClientCpf   = client_cpf   || clientCpf   || null;
    const finalNextMilestone = next_milestone || nextMilestone || null;
    const finalFinancialTotal   = financial_total   ?? (financial ? financial.total   : 0);
    const finalFinancialPaid    = financial_paid    ?? (financial ? financial.paid    : 0);
    const finalFinancialStatus  = financial_status  ?? (financial ? financial.status  : 'pending');

    const finalTitle = title || clientName || finalClientName || 'Sem titulo';

    const contractStr      = contract && typeof contract !== 'string'  ? JSON.stringify(contract)      : (contract || '');
    const briefingStr      = briefing && typeof briefing !== 'string'  ? JSON.stringify(briefing)      : (briefing || '');
    const paymentOrderStr  = payment_order && typeof payment_order !== 'string' ? JSON.stringify(payment_order) : (payment_order || '');
    const activityStr      = activity && typeof activity !== 'string'  ? JSON.stringify(activity)      : (activity || '');
    const notificationsStr = notifications && typeof notifications !== 'string' ? JSON.stringify(notifications) : (notifications || '');
    const filesStr         = Array.isArray(files) ? JSON.stringify(files) : (files || '');

    const result = await dbRun(
      req.app.locals.db,
      `INSERT INTO projects (
         title, description, tech_stack, status, budget, deadline, client_id, admin_id, files,
         client_name, client_email, client_cpf,
         progress, next_milestone,
         financial_total, financial_paid, financial_status,
         contract, briefing, payment_order, activity, notifications
       ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)`,
      [
        finalTitle,
        description || '',
        Array.isArray(tech_stack) ? JSON.stringify(tech_stack) : tech_stack || '',
        status || 'pending',
        budget || null,
        deadline || null,
        client_id || null,
        req.userId,
        filesStr,
        finalClientName,
        finalClientEmail,
        finalClientCpf,
        progress != null ? progress : 0,
        finalNextMilestone,
        finalFinancialTotal,
        finalFinancialPaid,
        finalFinancialStatus,
        contractStr,
        briefingStr,
        paymentOrderStr,
        activityStr,
        notificationsStr,
      ]
    );

    const project = await dbGet(req.app.locals.db, 'SELECT * FROM projects WHERE id = ?', [result.id]);

    logger.info('Project created:', finalTitle, 'by admin', req.userId);

    res.status(201).json({
      success: true,
      message: 'Projeto criado com sucesso',
      data: { project: parseJsonFields(project) },
    });
  } catch (err) {
    logger.error('Create project error:', err.message);
    res.status(500).json({
      success: false,
      message: 'Erro ao criar projeto',
    });
  }
};

exports.updateProject = async (req, res) => {
  try {
    const { id } = req.params;
    const body = req.body;

    const existing = await dbGet(req.app.locals.db, 'SELECT * FROM projects WHERE id = ?', [id]);
    if (!existing) {
      return res.status(404).json({
        success: false,
        message: 'Projeto nao encontrado',
      });
    }

    const updates = ['updated_at = CURRENT_TIMESTAMP'];
    const params = [];

    const setIfPresent = (key, transform) => {
      const keyCamel = key.replace(/_([a-z])/g, (_, c) => c.toUpperCase());
      if (body[key] !== undefined || body[keyCamel] !== undefined) {
        const val = body[key] !== undefined ? body[key] : body[keyCamel];
        updates.push(`${key} = ?`);
        params.push(transform ? transform(val) : val);
      }
    };

    // Legacy fields
    setIfPresent('title');
    setIfPresent('description');
    setIfPresent('tech_stack', (v) => Array.isArray(v) ? JSON.stringify(v) : v);
    setIfPresent('status');
    setIfPresent('budget');
    setIfPresent('deadline');
    setIfPresent('client_id');
    setIfPresent('files', (v) => Array.isArray(v) ? JSON.stringify(v) : v);

    // CRM fields
    setIfPresent('client_name');
    setIfPresent('client_email');
    setIfPresent('client_cpf');
    setIfPresent('progress');
    setIfPresent('next_milestone');
    setIfPresent('financial_total');
    setIfPresent('financial_paid');
    setIfPresent('financial_status');
    setIfPresent('contract', (v) => (typeof v !== 'string' ? JSON.stringify(v) : v));
    setIfPresent('briefing', (v) => (typeof v !== 'string' ? JSON.stringify(v) : v));
    setIfPresent('payment_order', (v) => (typeof v !== 'string' ? JSON.stringify(v) : v));
    setIfPresent('activity', (v) => (typeof v !== 'string' ? JSON.stringify(v) : v));
    setIfPresent('notifications', (v) => (typeof v !== 'string' ? JSON.stringify(v) : v));

    // Also accept financial object { total, paid, status }
    if (body.financial && typeof body.financial === 'object') {
      if (body.financial.total !== undefined) {
        const alreadyHas = updates.some((u) => u.startsWith('financial_total'));
        if (!alreadyHas) { updates.push('financial_total = ?'); params.push(body.financial.total); }
      }
      if (body.financial.paid !== undefined) {
        const alreadyHas = updates.some((u) => u.startsWith('financial_paid'));
        if (!alreadyHas) { updates.push('financial_paid = ?'); params.push(body.financial.paid); }
      }
      if (body.financial.status !== undefined) {
        const alreadyHas = updates.some((u) => u.startsWith('financial_status'));
        if (!alreadyHas) { updates.push('financial_status = ?'); params.push(body.financial.status); }
      }
    }

    if (updates.length === 1) {
      return res.status(400).json({
        success: false,
        message: 'Nenhum campo para atualizar',
      });
    }

    params.push(id);

    await dbRun(
      req.app.locals.db,
      `UPDATE projects SET ${updates.join(', ')} WHERE id = ?`,
      params
    );

    const project = await dbGet(req.app.locals.db, 'SELECT * FROM projects WHERE id = ?', [id]);

    logger.info('Project updated:', id);

    res.json({
      success: true,
      message: 'Projeto atualizado com sucesso',
      data: { project: parseJsonFields(project) },
    });
  } catch (err) {
    logger.error('Update project error:', err.message);
    res.status(500).json({
      success: false,
      message: 'Erro ao atualizar projeto',
    });
  }
};

exports.deleteProject = async (req, res) => {
  try {
    const { id } = req.params;

    const existing = await dbGet(req.app.locals.db, 'SELECT * FROM projects WHERE id = ?', [id]);
    if (!existing) {
      return res.status(404).json({
        success: false,
        message: 'Projeto nao encontrado',
      });
    }

    await dbRun(req.app.locals.db, 'DELETE FROM projects WHERE id = ?', [id]);

    logger.info('Project deleted:', id);

    res.json({
      success: true,
      message: 'Projeto deletado com sucesso',
    });
  } catch (err) {
    logger.error('Delete project error:', err.message);
    res.status(500).json({
      success: false,
      message: 'Erro ao deletar projeto',
    });
  }
};
