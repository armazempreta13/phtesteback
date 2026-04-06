const { dbRun, dbGet, dbAll } = require('../db');
const logger = require('../utils/logger');

function createSlug(title) {
  return title
    .toLowerCase()
    .normalize('NFD')
    .replace(/[\u0300-\u036f]/g, '')
    .replace(/[^\w\s-]/g, '')
    .replace(/\s+/g, '-')
    .replace(/-+/g, '-')
    .trim();
}

exports.listPosts = async (req, res) => {
  try {
    const { page = 1, limit = 10, tag, search } = req.query;
    const offset = (parseInt(page) - 1) * parseInt(limit);

    let sql = 'SELECT * FROM posts WHERE 1=1';
    const params = [];

    // Non-admin users and public see only published posts
    if (req.userRole !== 'admin') {
      sql += ' AND published = 1';
    }

    if (tag) {
      sql += ' AND tags LIKE ?';
      params.push(`%${tag}%`);
    }

    if (search) {
      sql += ' AND (title LIKE ? OR content LIKE ?)';
      const likeSearch = `%${search}%`;
      params.push(likeSearch, likeSearch);
    }

    sql += ' ORDER BY created_at DESC LIMIT ? OFFSET ?';
    params.push(parseInt(limit), offset);

    const posts = await dbAll(req.app.locals.db, sql, params);

    const countRow = await dbGet(
      req.app.locals.db,
      `SELECT COUNT(*) as total FROM posts WHERE 1=1${req.userRole !== 'admin' ? ' AND published = 1' : ''}`,
      []
    );

    res.json({
      success: true,
      data: { posts, total: countRow?.total || 0, page: parseInt(page), limit: parseInt(limit) },
    });
  } catch (err) {
    logger.error('List posts error:', err.message);
    res.status(500).json({
      success: false,
      message: 'Erro ao listar posts',
    });
  }
};

exports.getPost = async (req, res) => {
  try {
    const { id } = req.params;
    let post;

    if (req.userRole === 'admin') {
      post = await dbGet(req.app.locals.db, 'SELECT * FROM posts WHERE id = ?', [id]);
    } else {
      post = await dbGet(req.app.locals.db, 'SELECT * FROM posts WHERE id = ? AND published = 1', [id]);
    }

    if (!post) {
      return res.status(404).json({
        success: false,
        message: 'Post nao encontrado',
      });
    }

    res.json({
      success: true,
      data: { post },
    });
  } catch (err) {
    logger.error('Get post error:', err.message);
    res.status(500).json({
      success: false,
      message: 'Erro ao buscar post',
    });
  }
};

exports.createPost = async (req, res) => {
  try {
    const { title, content, excerpt, cover_image, tags, published } = req.body;

    if (!title || !content) {
      return res.status(400).json({
        success: false,
        message: 'Titulo e conteudo sao obrigatorios',
      });
    }

    const slug = createSlug(title);

    const result = await dbRun(
      req.app.locals.db,
      `INSERT INTO posts (title, slug, content, excerpt, cover_image, tags, author_id, published)
       VALUES (?, ?, ?, ?, ?, ?, ?, ?)`,
      [
        title,
        slug,
        content,
        excerpt || '',
        cover_image || '',
        Array.isArray(tags) ? JSON.stringify(tags) : tags || '',
        req.userId,
        published ? 1 : 0,
      ]
    );

    const post = await dbGet(req.app.locals.db, 'SELECT * FROM posts WHERE id = ?', [result.id]);

    logger.info('Post created:', title);

    res.status(201).json({
      success: true,
      message: 'Post criado com sucesso',
      data: { post },
    });
  } catch (err) {
    logger.error('Create post error:', err.message);
    res.status(500).json({
      success: false,
      message: 'Erro ao criar post',
    });
  }
};

exports.updatePost = async (req, res) => {
  try {
    const { id } = req.params;
    const { title, content, excerpt, cover_image, tags, published } = req.body;

    const existing = await dbGet(req.app.locals.db, 'SELECT * FROM posts WHERE id = ?', [id]);
    if (!existing) {
      return res.status(404).json({
        success: false,
        message: 'Post nao encontrado',
      });
    }

    const updates = ['updated_at = CURRENT_TIMESTAMP'];
    const params = [];

    if (title !== undefined) {
      updates.push('title = ?', 'slug = ?');
      params.push(title, createSlug(title));
    }
    if (content !== undefined) { updates.push('content = ?'); params.push(content); }
    if (excerpt !== undefined) { updates.push('excerpt = ?'); params.push(excerpt); }
    if (cover_image !== undefined) { updates.push('cover_image = ?'); params.push(cover_image); }
    if (tags !== undefined) { updates.push('tags = ?'); params.push(Array.isArray(tags) ? JSON.stringify(tags) : tags); }
    if (published !== undefined) { updates.push('published = ?'); params.push(published ? 1 : 0); }

    if (updates.length === 1) {
      return res.status(400).json({
        success: false,
        message: 'Nenhum campo para atualizar',
      });
    }

    params.push(id);

    await dbRun(
      req.app.locals.db,
      `UPDATE posts SET ${updates.join(', ')} WHERE id = ?`,
      params
    );

    const post = await dbGet(req.app.locals.db, 'SELECT * FROM posts WHERE id = ?', [id]);

    logger.info('Post updated:', id);

    res.json({
      success: true,
      message: 'Post atualizado com sucesso',
      data: { post },
    });
  } catch (err) {
    logger.error('Update post error:', err.message);
    res.status(500).json({
      success: false,
      message: 'Erro ao atualizar post',
    });
  }
};

exports.deletePost = async (req, res) => {
  try {
    const { id } = req.params;

    const existing = await dbGet(req.app.locals.db, 'SELECT * FROM posts WHERE id = ?', [id]);
    if (!existing) {
      return res.status(404).json({
        success: false,
        message: 'Post nao encontrado',
      });
    }

    await dbRun(req.app.locals.db, 'DELETE FROM posts WHERE id = ?', [id]);

    logger.info('Post deleted:', id);

    res.json({
      success: true,
      message: 'Post deletado com sucesso',
    });
  } catch (err) {
    logger.error('Delete post error:', err.message);
    res.status(500).json({
      success: false,
      message: 'Erro ao deletar post',
    });
  }
};
