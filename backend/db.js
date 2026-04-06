const Database = require('sqlite3').Database;
const path = require('path');
const fs = require('fs');
const bcrypt = require('bcryptjs');
const config = require('./config');
const logger = require('./utils/logger');

// Ensure data directory exists
const dataDir = path.dirname(config.db.path);
if (!fs.existsSync(dataDir)) {
  fs.mkdirSync(dataDir, { recursive: true });
}

// Ensure logs directory exists
if (!fs.existsSync('./logs')) {
  fs.mkdirSync('./logs', { recursive: true });
}

/**
 * Wraps sqlite3 callback style into Promise
 */
function dbRun(db, sql, params = []) {
  return new Promise((resolve, reject) => {
    db.run(sql, params, function (err) {
      if (err) return reject(err);
      resolve({ id: this.lastID, changes: this.changes });
    });
  });
}

function dbGet(db, sql, params = []) {
  return new Promise((resolve, reject) => {
    db.get(sql, params, (err, row) => {
      if (err) return reject(err);
      resolve(row);
    });
  });
}

function dbAll(db, sql, params = []) {
  return new Promise((resolve, reject) => {
    db.all(sql, params, (err, rows) => {
      if (err) return reject(err);
      resolve(rows);
    });
  });
}

/**
 * Initialize database connection and create tables
 */
async function initDatabase() {
  return new Promise((resolve, reject) => {
    const db = new Database(config.db.path, (err) => {
      if (err) {
        logger.error('Database connection failed:', err.message);
        return reject(err);
      }
      logger.info('SQLite database connected:', config.db.path);
      resolve(db);
    });
  });
}

/**
 * Create all tables if they don't exist
 */
async function createTables(db) {
  const tables = [
    `CREATE TABLE IF NOT EXISTS users (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      name TEXT NOT NULL,
      email TEXT UNIQUE NOT NULL,
      password TEXT NOT NULL,
      role TEXT NOT NULL DEFAULT 'client',
      avatar TEXT,
      created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
      updated_at DATETIME DEFAULT CURRENT_TIMESTAMP
    )`,

    `CREATE TABLE IF NOT EXISTS projects (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      title TEXT NOT NULL,
      description TEXT,
      tech_stack TEXT,
      status TEXT NOT NULL DEFAULT 'pending',
      budget REAL,
      deadline DATE,
      client_id INTEGER,
      admin_id INTEGER,
      files TEXT,
      created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
      updated_at DATETIME DEFAULT CURRENT_TIMESTAMP,
      FOREIGN KEY (client_id) REFERENCES users(id),
      FOREIGN KEY (admin_id) REFERENCES users(id)
    )`,

    `CREATE TABLE IF NOT EXISTS transactions (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      user_id INTEGER NOT NULL,
      project_id INTEGER,
      amount REAL NOT NULL,
      type TEXT NOT NULL,
      status TEXT NOT NULL DEFAULT 'pending',
      pix_code TEXT,
      pix_key TEXT,
      payment_method TEXT,
      external_id TEXT,
      description TEXT,
      created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
      updated_at DATETIME DEFAULT CURRENT_TIMESTAMP,
      FOREIGN KEY (user_id) REFERENCES users(id),
      FOREIGN KEY (project_id) REFERENCES projects(id)
    )`,

    `CREATE TABLE IF NOT EXISTS contact_messages (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      name TEXT NOT NULL,
      email TEXT NOT NULL,
      phone TEXT,
      subject TEXT NOT NULL,
      message TEXT NOT NULL,
      service_interest TEXT,
      status TEXT NOT NULL DEFAULT 'new',
      created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
      updated_at DATETIME DEFAULT CURRENT_TIMESTAMP
    )`,

    `CREATE TABLE IF NOT EXISTS posts (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      title TEXT NOT NULL,
      slug TEXT UNIQUE NOT NULL,
      content TEXT NOT NULL,
      excerpt TEXT,
      cover_image TEXT,
      tags TEXT,
      author_id INTEGER,
      published INTEGER NOT NULL DEFAULT 0,
      created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
      updated_at DATETIME DEFAULT CURRENT_TIMESTAMP,
      FOREIGN KEY (author_id) REFERENCES users(id)
    )`,

    `CREATE TABLE IF NOT EXISTS portfolio (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      title TEXT NOT NULL,
      description TEXT,
      image_url TEXT,
      gallery TEXT,
      tech_stack TEXT,
      live_url TEXT,
      github_url TEXT,
      category TEXT,
      featured INTEGER NOT NULL DEFAULT 0,
      client_name TEXT,
      year TEXT,
      created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
      updated_at DATETIME DEFAULT CURRENT_TIMESTAMP
    )`,

    `CREATE TABLE IF NOT EXISTS briefings (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      user_id INTEGER,
      name TEXT NOT NULL,
      email TEXT NOT NULL,
      phone TEXT,
      company TEXT,
      project_type TEXT,
      description TEXT NOT NULL,
      budget_range TEXT,
      deadline TEXT,
      project_references TEXT,
      features TEXT,
      status TEXT NOT NULL DEFAULT 'new',
      created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
      updated_at DATETIME DEFAULT CURRENT_TIMESTAMP,
      FOREIGN KEY (user_id) REFERENCES users(id)
    )`,

    `CREATE TABLE IF NOT EXISTS notifications (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      user_id INTEGER NOT NULL,
      title TEXT NOT NULL,
      message TEXT NOT NULL,
      type TEXT NOT NULL DEFAULT 'info',
      read INTEGER NOT NULL DEFAULT 0,
      link TEXT,
      created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
      FOREIGN KEY (user_id) REFERENCES users(id)
    )`,

    `CREATE TABLE IF NOT EXISTS uploads (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      user_id INTEGER,
      filename TEXT NOT NULL,
      originalname TEXT NOT NULL,
      mimetype TEXT,
      size INTEGER,
      path TEXT NOT NULL,
      created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
      FOREIGN KEY (user_id) REFERENCES users(id)
    )`,

    `CREATE TABLE IF NOT EXISTS site_settings (
      key TEXT PRIMARY KEY,
      value TEXT NOT NULL,
      category TEXT NOT NULL DEFAULT 'general',
      created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
      updated_at DATETIME DEFAULT CURRENT_TIMESTAMP
    )`,
  ];

  for (const sql of tables) {
    await dbRun(db, sql);
  }

  // Add CRM columns to projects table (idempotent — safe to run multiple times)
  const crmColumns = [
    'ALTER TABLE projects ADD COLUMN client_name TEXT',
    'ALTER TABLE projects ADD COLUMN client_email TEXT',
    'ALTER TABLE projects ADD COLUMN client_cpf TEXT',
    'ALTER TABLE projects ADD COLUMN progress INTEGER DEFAULT 0',
    'ALTER TABLE projects ADD COLUMN next_milestone TEXT',
    'ALTER TABLE projects ADD COLUMN financial_total REAL DEFAULT 0',
    'ALTER TABLE projects ADD COLUMN financial_paid REAL DEFAULT 0',
    'ALTER TABLE projects ADD COLUMN financial_status TEXT DEFAULT \'pending\'',
    'ALTER TABLE projects ADD COLUMN contract TEXT',
    'ALTER TABLE projects ADD COLUMN briefing TEXT',
    'ALTER TABLE projects ADD COLUMN payment_order TEXT',
    'ALTER TABLE projects ADD COLUMN activity TEXT',
    'ALTER TABLE projects ADD COLUMN notifications TEXT',
    'ALTER TABLE projects ADD COLUMN messages TEXT',
    'ALTER TABLE projects ADD COLUMN tasks TEXT',
    'ALTER TABLE projects ADD COLUMN links TEXT',
    'ALTER TABLE projects ADD COLUMN messages TEXT',
    `CREATE TABLE IF NOT EXISTS site_analytics (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      type TEXT NOT NULL DEFAULT 'page_view',
      path TEXT,
      user_agent TEXT,
      referrer TEXT,
      created_at DATETIME DEFAULT CURRENT_TIMESTAMP
    )`,
  ];

  for (const alterSql of crmColumns) {
    try {
      await dbRun(db, alterSql);
    } catch (e) {
      // Column may already exist — skip silently
    }
  }

  logger.info('All tables created/verified successfully');
}

/**
 * Seed admin user if not exists
 */
async function seedAdmin(db) {
  const existing = await dbGet(db, 'SELECT id FROM users WHERE email = ?', [config.admin.email]);
  if (!existing) {
    const hashedPassword = await bcrypt.hash(config.admin.password, 12);
    await dbRun(
      db,
      'INSERT INTO users (name, email, password, role) VALUES (?, ?, ?, ?)',
      ['PH Admin', config.admin.email, hashedPassword, 'admin']
    );
    logger.info('Admin user seeded:', config.admin.email);
  } else {
    logger.info('Admin user already exists');
  }
}

/**
 * Seed sample portfolio items if empty
 */
async function seedPortfolio(db) {
  const count = await dbGet(db, 'SELECT COUNT(*) as count FROM portfolio');
  if (!count || count.count === 0) {
    const items = [
      {
        title: 'E-commerce Premium',
        description: 'Loja virtual completa com painel admin e gateway de pagamento.',
        image_url: 'https://images.unsplash.com/photo-1460925895917-afdab827c52f?w=800',
        gallery: JSON.stringify([
          'https://images.unsplash.com/photo-1460925895917-afdab827c52f?w=800',
          'https://images.unsplash.com/photo-1551288049-bebda4e38f71?w=800',
        ]),
        tech_stack: JSON.stringify(['React', 'Node.js', 'Stripe']),
        live_url: '#',
        category: 'E-commerce',
        featured: 1,
        client_name: 'Cliente Confidencial',
        year: '2024',
      },
      {
        title: 'Dashboard Analytics',
        description: 'Painel de controle com graficos em tempo real e KPIs.',
        image_url: 'https://images.unsplash.com/photo-1551288049-bebda4e38f71?w=800',
        gallery: JSON.stringify([
          'https://images.unsplash.com/photo-1551288049-bebda4e38f71?w=800',
        ]),
        tech_stack: JSON.stringify(['React', 'D3.js', 'Tailwind']),
        live_url: '#',
        category: 'Dashboard',
        featured: 1,
        client_name: 'TechCorp',
        year: '2024',
      },
      {
        title: 'Landing Page SaaS',
        description: 'Landing page de alta conversao para startup de tecnologia.',
        image_url: 'https://images.unsplash.com/photo-1522542550221-31fd19575a2d?w=800',
        gallery: JSON.stringify([
          'https://images.unsplash.com/photo-1522542550221-31fd19575a2d?w=800',
        ]),
        tech_stack: JSON.stringify(['React', 'Framer Motion', 'Tailwind']),
        live_url: '#',
        category: 'Landing Page',
        featured: 0,
        client_name: 'StartupXYZ',
        year: '2024',
      },
    ];

    for (const item of items) {
      await dbRun(
        db,
        `INSERT INTO portfolio (title, description, image_url, gallery, tech_stack, live_url, category, featured, client_name, year)
         VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?)`,
        [
          item.title,
          item.description,
          item.image_url,
          item.gallery,
          item.tech_stack,
          item.live_url,
          item.category,
          item.featured,
          item.client_name,
          item.year,
        ]
      );
    }
    logger.info('Sample portfolio items seeded');
  }
}

/**
 * Seed sample blog posts if empty
 */
async function seedPosts(db) {
  const count = await dbGet(db, 'SELECT COUNT(*) as count FROM posts');
  if (!count || count.count === 0) {
    const posts = [
      {
        title: 'Por que React + Tailwind e a melhor combinacao para sites modernos',
        slug: 'react-tailwind-modern-sites',
        content: '<p>React e Tailwind CSS formam a combinacao perfeita para criar interfaces modernas. Explore as vantagens desta stack.</p>',
        excerpt: 'Descubra porque React + Tailwind domina o mercado de desenvolvimento web em 2024.',
        cover_image: 'https://images.unsplash.com/photo-1633356122544-f134324a6cee?w=800',
        tags: JSON.stringify(['React', 'Tailwind', 'Frontend']),
        published: 1,
      },
      {
        title: 'Como otimizar performance do seu site para 100 no Lighthouse',
        slug: 'otimizar-performance-lighthouse',
        content: '<p>Dicas praticas para alcancar a pontuacao maxima no Google Lighthouse.</p>',
        excerpt: 'Guia completo para alcancar performance maxima no seu site.',
        cover_image: 'https://images.unsplash.com/photo-1504639725590-34d0984388bd?w=800',
        tags: JSON.stringify(['Performance', 'SEO', 'Web']),
        published: 1,
      },
      {
        title: 'UX/UI Design: Principais tendencias para 2024',
        slug: 'ux-ui-tendencias-2024',
        content: '<p>As principais tendencias de design que vao dominar este ano.</p>',
        excerpt: 'Fique por dentro das tendencias de UX/UI para este ano.',
        cover_image: 'https://images.unsplash.com/photo-1561070791-2526d30994b5?w=800',
        tags: JSON.stringify(['Design', 'UX', 'UI']),
        published: 1,
      },
    ];

    for (const post of posts) {
      await dbRun(
        db,
        `INSERT INTO posts (title, slug, content, excerpt, cover_image, tags, published)
         VALUES (?, ?, ?, ?, ?, ?, ?)`,
        [post.title, post.slug, post.content, post.excerpt, post.cover_image, post.tags, post.published]
      );
    }
    logger.info('Sample blog posts seeded');
  }
}

module.exports = {
  initDatabase,
  createTables,
  seedAdmin,
  seedPortfolio,
  seedPosts,
  dbRun,
  dbGet,
  dbAll,
};
