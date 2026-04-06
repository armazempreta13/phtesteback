const { dbRun, dbGet, dbAll } = require('../db');
const logger = require('../utils/logger');

// Helper: parse JSON text columns
function parseJsonFields(project) {
  const jsonFields = ['contract', 'briefing', 'payment_order', 'activity', 'notifications', 'messages', 'tasks', 'links', 'tech_stack', 'files'];
  for (const field of jsonFields) {
    if (project && project[field] && typeof project[field] === 'string') {
      try { project[field] = JSON.parse(project[field]); } catch (e) {}
    }
  }
  return project;
}

/**
 * Generate (or regenerate) a contract for a project (admin only)
 * Creates the default contract data based on project info
 */
exports.generateContract = async (req, res) => {
  try {
    const { project_id } = req.body;

    if (!project_id) {
      return res.status(400).json({
        success: false,
        message: 'ID do projeto e obrigatorio',
      });
    }

    const project = await dbGet(req.app.locals.db, 'SELECT * FROM projects WHERE id = ?', [project_id]);

    if (!project) {
      return res.status(404).json({
        success: false,
        message: 'Projeto nao encontrado',
      });
    }

    if (!project.client_name && !project.client_email) {
      return res.status(400).json({
        success: false,
        message: 'Projeto precisa ter nome e email do cliente',
      });
    }

    // Build default contract data
    const contractData = {
      status: 'draft',
      adminSignature: null,
      clientSignature: null,
      sentAt: null,
      signedAt: null,
      generatedAt: new Date().toISOString(),
      generatedBy: req.userId,
      // Snapshot of project data for the legal document
      clientName: project.client_name || 'Nao informado',
      clientEmail: project.client_email || '',
      clientCpf: project.client_cpf || '',
      projectName: project.title || 'Sem titulo',
      dueDate: project.deadline || '',
      financialTotal: project.financial_total ?? project.budget ?? 0,
    };

    await dbRun(
      req.app.locals.db,
      'UPDATE projects SET contract = ?, updated_at = CURRENT_TIMESTAMP WHERE id = ?',
      [JSON.stringify(contractData), project_id]
    );

    logger.info(`Contract generated for project ${project_id} by admin ${req.userId}`);

    res.json({
      success: true,
      message: 'Contrato gerado com sucesso',
      data: { contract: contractData },
    });
  } catch (err) {
    logger.error('Generate contract error:', err.message);
    res.status(500).json({
      success: false,
      message: 'Erro ao gerar contrato',
    });
  }
};

/**
 * Update contract (signatures, status, send to client)
 */
exports.updateContract = async (req, res) => {
  try {
    const { project_id } = req.params;
    const data = req.body;

    const project = await dbGet(req.app.locals.db, 'SELECT * FROM projects WHERE id = ?', [project_id]);

    if (!project) {
      return res.status(404).json({
        success: false,
        message: 'Projeto nao encontrado',
      });
    }

    // Merge with existing contract data
    let existingContract = {};
    if (project.contract) {
      existingContract = typeof project.contract === 'string'
        ? JSON.parse(project.contract)
        : project.contract;
    }

    const updatedContract = { ...existingContract, ...data };

    // Track important timestamps
    if (data.status === 'sent_to_client' && !updatedContract.sentAt) {
      updatedContract.sentAt = new Date().toISOString();
    }
    if (data.status === 'signed' && !updatedContract.signedAt) {
      updatedContract.signedAt = new Date().toISOString();
    }

    await dbRun(
      req.app.locals.db,
      'UPDATE projects SET contract = ?, updated_at = CURRENT_TIMESTAMP WHERE id = ?',
      [JSON.stringify(updatedContract), project_id]
    );

    logger.info(`Contract updated for project ${project_id}: ${data.status || 'data changed'}`);

    res.json({
      success: true,
      message: 'Contrato atualizado com sucesso',
      data: { contract: updatedContract },
    });
  } catch (err) {
    logger.error('Update contract error:', err.message);
    res.status(500).json({
      success: false,
      message: 'Erro ao atualizar contrato',
    });
  }
};

/**
 * Get contract for a project
 */
exports.getContract = async (req, res) => {
  try {
    const { project_id } = req.params;
    const isAdmin = req.userRole === 'admin';

    let sql;
    let params;

    if (isAdmin) {
      sql = 'SELECT * FROM projects WHERE id = ?';
      params = [project_id];
    } else {
      sql = 'SELECT * FROM projects WHERE id = ? AND client_email = ?';
      params = [project_id, req.userEmail];
    }

    const project = await dbGet(req.app.locals.db, sql, params);

    if (!project) {
      return res.status(404).json({
        success: false,
        message: 'Projeto nao encontrado',
      });
    }

    const contract = project.contract
      ? (typeof project.contract === 'string' ? JSON.parse(project.contract) : project.contract)
      : null;

    res.json({
      success: true,
      data: {
        contract,
        project: parseJsonFields(project),
      },
    });
  } catch (err) {
    logger.error('Get contract error:', err.message);
    res.status(500).json({
      success: false,
      message: 'Erro ao buscar contrato',
    });
  }
};

/**
 * Revoke/reset contract back to draft (admin only)
 */
exports.revokeContract = async (req, res) => {
  try {
    const { project_id } = req.params;

    const project = await dbGet(req.app.locals.db, 'SELECT * FROM projects WHERE id = ?', [project_id]);

    if (!project) {
      return res.status(404).json({
        success: false,
        message: 'Projeto nao encontrado',
      });
    }

    const resetData = { status: 'draft', adminSignature: null, clientSignature: null, sentAt: null, signedAt: null };

    await dbRun(
      req.app.locals.db,
      'UPDATE projects SET contract = ?, updated_at = CURRENT_TIMESTAMP WHERE id = ?',
      [JSON.stringify(resetData), project_id]
    );

    logger.info(`Contract revoked for project ${project_id} by admin ${req.userId}`);

    res.json({
      success: true,
      message: 'Contrato revogado com sucesso',
      data: { contract: resetData },
    });
  } catch (err) {
    logger.error('Revoke contract error:', err.message);
    res.status(500).json({
      success: false,
      message: 'Erro ao revogar contrato',
    });
  }
};
