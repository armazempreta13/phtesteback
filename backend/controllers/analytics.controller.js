const { dbRun, dbGet, dbAll } = require('../db');
const logger = require('../utils/logger');

/**
 * Track a page visit or event
 * POST /api/analytics/track
 * Body: { type: 'page_view' | 'chat_open', path, userAgent, referrer }
 */
exports.trackEvent = async (req, res) => {
  try {
    const { type, path, userAgent, referrer } = req.body;

    if (!type) {
      return res.status(400).json({
        success: false,
        message: 'Tipo do evento e obrigatorio',
      });
    }

    await dbRun(
      req.app.locals.db,
      'INSERT INTO site_analytics (type, path, user_agent, referrer, created_at) VALUES (?, ?, ?, ?, CURRENT_TIMESTAMP)',
      [type || 'page_view', path || '', userAgent || '', referrer || '']
    );

    res.json({ success: true });
  } catch (err) {
    logger.error('Track event error:', err.message);
    res.status(500).json({ success: false, message: 'Erro ao registrar evento' });
  }
};

/**
 * Get admin dashboard analytics
 * GET /api/analytics
 */
exports.getAnalytics = async (req, res) => {
  try {
    const db = req.app.locals.db;
    const { days = 30 } = req.query;
    const sinceMs = Date.now() - parseInt(days) * 24 * 60 * 60 * 1000;

    const [
      totalVisits,
      visitsPeriod,
      totalChatOpens,
      chatPeriod,
      totalContacts,
      contactsPeriod,
      totalBriefings,
      briefingsPeriod,
      totalClients,
      totalProjects,
      totalSigned,
      totalRevenue,
      activeProjects,
      conversionRate,
      dailyVisits,
      topPages,
      topReferrers,
      recentChats,
      monthlyRevenue,
      projectsByService,
    ] = await Promise.all([
      // Total all time
      dbGet(db, "SELECT COUNT(*) as total FROM site_analytics WHERE type = 'page_view'"),
      dbGet(db, "SELECT COUNT(*) as total FROM site_analytics WHERE type = 'page_view' AND created_at > datetime('now', ?) ORDER BY created_at DESC LIMIT 1", [`-${days} days`]),
      dbGet(db, "SELECT COUNT(*) as total FROM site_analytics WHERE type = 'chat_open'"),
      dbGet(db, "SELECT COUNT(*) as total FROM site_analytics WHERE type = 'chat_open' AND created_at > datetime('now', ?)", [`-${days} days`]),

      dbGet(db, 'SELECT COUNT(*) as total FROM contact_messages'),
      dbGet(db, "SELECT COUNT(*) as total FROM contact_messages WHERE created_at > datetime('now', ?)", [`-${days} days`]),
      dbGet(db, 'SELECT COUNT(*) as total FROM briefings'),
      dbGet(db, "SELECT COUNT(*) as total FROM briefings WHERE created_at > datetime('now', ?)", [`-${days} days`]),
      dbGet(db, "SELECT COUNT(*) as total FROM users WHERE role = 'client'"),
      dbGet(db, 'SELECT COUNT(*) as total FROM projects'),
      dbGet(db, "SELECT COUNT(*) as total FROM projects WHERE contract != '' AND json_extract(contract, '$.status') = 'signed'"),
      dbGet(db, "SELECT COALESCE(SUM(financial_paid), 0) as total FROM projects WHERE financial_paid > 0"),
      dbGet(db, "SELECT COUNT(*) as total FROM projects WHERE status NOT IN ('completed', 'pending')"),

      // Daily visits for chart
      dbAll(db, `
        SELECT DATE(created_at) as date, COUNT(*) as count
        FROM site_analytics
        WHERE type = 'page_view' AND created_at > datetime('now', ?)
        GROUP BY DATE(created_at)
        ORDER BY date DESC
        LIMIT ${parseInt(days)}
      `, [`-${days} days`]),

      // Top pages
      dbAll(db, `
        SELECT path, COUNT(*) as views
        FROM site_analytics
        WHERE type = 'page_view' AND path != '' AND path != '/'
        AND created_at > datetime('now', ?)
        GROUP BY path
        ORDER BY views DESC
        LIMIT 5
      `, [`-${days} days`]),

      // Top referrers
      dbAll(db, `
        SELECT referrer, COUNT(*) as count
        FROM site_analytics
        WHERE type = 'page_view' AND referrer != '' AND referrer IS NOT NULL
        AND created_at > datetime('now', ?)
        GROUP BY referrer
        ORDER BY count DESC
        LIMIT 5
      `, [`-${days} days`]),

      // Recent chat sessions
      dbAll(db, `
        SELECT DATE(created_at) as date, COUNT(*) as opens
        FROM site_analytics
        WHERE type = 'chat_open'
        AND created_at > datetime('now', ?)
        GROUP BY DATE(created_at)
        ORDER BY date DESC
        LIMIT 7
      `, [`-${days} days`]),

      // Monthly revenue for chart (last 12 months) - use financial_total as proxy
      dbAll(db, `
        SELECT
          strftime('%Y-%m', created_at) as month,
          COALESCE(SUM(financial_total), 0) as revenue,
          COALESCE(SUM(financial_paid), 0) as paid,
          COUNT(*) as count
        FROM projects
        WHERE financial_total > 0
          AND created_at > datetime('now', '-12 months')
        GROUP BY strftime('%Y-%m', created_at)
        ORDER BY month ASC
      `),

      // Projects by service type for conversion metrics
      dbAll(db, `
        SELECT
          service_type,
          COUNT(*) as total,
          COUNT(CASE WHEN status = 'completed' THEN 1 END) as completed,
          COUNT(CASE WHEN contract != '' THEN 1 END) as contracted,
          COALESCE(SUM(financial_total), 0) as revenue
        FROM projects
        GROUP BY service_type
        ORDER BY total DESC
      `),
    ]);

    // Calculate engagement: chat opens / visits
    const visitsTotal = totalVisits?.total || 0;
    const chatTotal = totalChatOpens?.total || 0;
    const contactsTotal = totalContacts?.total || 0;
    const engagementRate = visitsTotal > 0 ? ((contactsTotal + chatTotal) / visitsTotal * 100).toFixed(1) : 0;

    res.json({
      success: true,
      data: {
        traffic: {
          totalVisits: visitsTotal,
          visitsInPeriod: visitsPeriod?.total || 0,
          chatOpens: chatTotal,
          chatsInPeriod: chatPeriod?.total || 0,
          contacts: contactsTotal,
          contactsInPeriod: contactsPeriod?.total || 0,
          briefings: totalBriefings?.total || 0,
          briefingsInPeriod: briefingsPeriod?.total || 0,
          engagementRate: parseFloat(engagementRate),
        },
        pipeline: {
          totalClients: totalClients?.total || 0,
          totalProjects: totalProjects?.total || 0,
          activeProjects: activeProjects?.total || 0,
          signedContracts: totalSigned?.total || 0,
          totalRevenue: totalRevenue?.total || 0,
        },
        dailyVisits: dailyVisits || [],
        topPages: topPages || [],
        topReferrers: topReferrers || [],
        dailyChats: recentChats || [],
      },
    });
  } catch (err) {
    logger.error('Get analytics error:', err.message);
    res.status(500).json({ success: false, message: 'Erro ao buscar analytics' });
  }
};
