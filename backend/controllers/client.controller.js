const { dbGet, dbAll } = require('../db');
const logger = require('../utils/logger');

// Helper: parse JSON text columns into objects/arrays
function parseJsonFields(project) {
  const jsonFields = ['contract', 'briefing', 'payment_order', 'activity', 'notifications', 'tasks', 'files', 'links', 'tech_stack'];
  for (const field of jsonFields) {
    if (project && project[field] && typeof project[field] === 'string') {
      try { project[field] = JSON.parse(project[field]); } catch (e) {}
    }
  }
  return project;
}

/**
 * Get all projects for the authenticated client (matched by email)
 * Also works for admin to view any client's projects via ?email= param
 */
exports.getClientProjects = async (req, res) => {
  try {
    const email = req.userRole === 'admin' && req.query.email
      ? req.query.email
      : req.userEmail;

    const rows = await dbAll(
      req.app.locals.db,
      'SELECT * FROM projects WHERE client_email = ? ORDER BY created_at DESC',
      [email]
    );

    const projects = rows.map(parseJsonFields);

    res.json({
      success: true,
      data: { projects, total: projects.length },
    });
  } catch (err) {
    logger.error('Client projects error:', err.message);
    res.status(500).json({
      success: false,
      message: 'Erro ao buscar projetos',
    });
  }
};

/**
 * Get full dashboard for a single project (matched by email + project id)
 */
exports.getClientProject = async (req, res) => {
  try {
    const { id } = req.params;
    const email = req.userRole === 'admin' && req.query.email
      ? req.query.email
      : req.userEmail;

    const project = await dbGet(
      req.app.locals.db,
      'SELECT * FROM projects WHERE id = ? AND client_email = ?',
      [id, email]
    );

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
    logger.error('Client project detail error:', err.message);
    res.status(500).json({
      success: false,
      message: 'Erro ao buscar projeto',
    });
  }
};

/**
 * Send a message from client to admin about their project
 */
exports.sendMessage = async (req, res) => {
  try {
    const { id: projectId } = req.params;
    const { message, subject } = req.body;

    if (!message) {
      return res.status(400).json({
        success: false,
        message: 'Mensagem e obrigatoria',
      });
    }

    // Verify project ownership — client_email must match the authenticated user's email
    const project = await dbGet(
      req.app.locals.db,
      'SELECT * FROM projects WHERE id = ? AND client_email = ?',
      [projectId, req.userEmail]
    );

    if (!project) {
      return res.status(404).json({
        success: false,
        message: 'Projeto nao encontrado',
      });
    }

    const messages = project.messages && typeof project.messages === 'string'
      ? JSON.parse(project.messages)
      : Array.isArray(project.messages) ? project.messages : [];

    const newMessage = {
      id: `msg_${Date.now()}`,
      from: 'client',
      name: project.client_name || 'Cliente',
      email: project.client_email,
      subject: subject || 'Mensagem do Cliente',
      message,
      date: new Date().toISOString(),
      read: false,
    };

    messages.push(newMessage);

    await dbAll(
      req.app.locals.db,
      'UPDATE projects SET messages = ?, updated_at = CURRENT_TIMESTAMP WHERE id = ?',
      [JSON.stringify(messages), projectId]
    );

    logger.info('Client message sent on project:', projectId);

    res.json({
      success: true,
      data: { message: newMessage },
    });
  } catch (err) {
    logger.error('Client send message error:', err.message);
    res.status(500).json({
      success: false,
      message: 'Erro ao enviar mensagem',
    });
  }
};

/**
 * Get messages for a project
 */
exports.getMessages = async (req, res) => {
  try {
    const { id: projectId } = req.params;

    const project = await dbGet(
      req.app.locals.db,
      'SELECT client_name, client_email, messages FROM projects WHERE id = ?',
      [projectId]
    );

    if (!project) {
      return res.status(404).json({
        success: false,
        message: 'Projeto nao encontrado',
      });
    }

    const messages = project.messages && typeof project.messages === 'string'
      ? JSON.parse(project.messages)
      : Array.isArray(project.messages) ? project.messages : [];

    res.json({
      success: true,
      data: { messages },
    });
  } catch (err) {
    logger.error('Get messages error:', err.message);
    res.status(500).json({
      success: false,
      message: 'Erro ao buscar mensagens',
    });
  }
};
