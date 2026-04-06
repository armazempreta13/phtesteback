const { dbGet, dbAll } = require('../db');
const logger = require('../utils/logger');

exports.getStats = async (req, res) => {
  try {
    const db = req.app.locals.db;

    const [
      totalUsers,
      totalProjects,
      totalTransactions,
      totalRevenue,
      totalMessages,
      totalBriefings,
      totalPosts,
      totalPortfolio,
      unreadMessages,
      newBriefings,
      pendingProjects,
      recentTransactions,
      recentMessages,
      statusBreakdown,
    ] = await Promise.all([
      dbGet(db, 'SELECT COUNT(*) as total FROM users WHERE role = ?', ['client']),
      dbGet(db, 'SELECT COUNT(*) as total FROM projects'),
      dbGet(db, 'SELECT COUNT(*) as total FROM transactions'),
      dbGet(db, "SELECT COALESCE(SUM(amount), 0) as total FROM transactions WHERE status = 'approved'"),
      dbGet(db, 'SELECT COUNT(*) as total FROM contact_messages'),
      dbGet(db, 'SELECT COUNT(*) as total FROM briefings'),
      dbGet(db, 'SELECT COUNT(*) as total FROM posts'),
      dbGet(db, 'SELECT COUNT(*) as total FROM portfolio'),
      dbGet(db, "SELECT COUNT(*) as total FROM contact_messages WHERE status = 'new'"),
      dbGet(db, "SELECT COUNT(*) as total FROM briefings WHERE status = 'new'"),
      dbGet(db, "SELECT COUNT(*) as total FROM projects WHERE status = 'pending'"),
      dbAll(db, "SELECT id, amount, type, status, created_at FROM transactions ORDER BY created_at DESC LIMIT 5"),
      dbAll(db, "SELECT id, name, email, subject, created_at FROM contact_messages ORDER BY created_at DESC LIMIT 5"),
      dbAll(db, "SELECT status, COUNT(*) as count FROM projects GROUP BY status"),
    ]);

    res.json({
      success: true,
      data: {
        stats: {
          users: totalUsers?.total || 0,
          projects: totalProjects?.total || 0,
          transactions: totalTransactions?.total || 0,
          revenue: totalRevenue?.total || 0,
          messages: totalMessages?.total || 0,
          briefings: totalBriefings?.total || 0,
          posts: totalPosts?.total || 0,
          portfolio: totalPortfolio?.total || 0,
        },
        alerts: {
          unreadMessages: unreadMessages?.total || 0,
          newBriefings: newBriefings?.total || 0,
          pendingProjects: pendingProjects?.total || 0,
        },
        statusBreakdown: statusBreakdown || [],
        recentTransactions: recentTransactions || [],
        recentMessages: recentMessages || [],
      },
    });
  } catch (err) {
    logger.error('Admin stats error:', err.message, err.stack);
    res.status(500).json({
      success: false,
      message: 'Erro ao buscar estatisticas',
    });
  }
};
