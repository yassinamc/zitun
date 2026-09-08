const { query } = require('../config/db');
const { ok } = require('../utils/response');

async function metrics(req, res, next) {
  try {
    const tenantId = req.user.tenantId;

    const olives = await query(
      `SELECT COALESCE(SUM(net_weight_kg), 0)::float AS total
       FROM receptions
       WHERE tenant_id = $1 AND created_at::date = CURRENT_DATE`,
      [tenantId]
    );

    const oil = await query(
      `SELECT COALESCE(SUM(oil_liters), 0)::float AS total
       FROM production_batches
       WHERE tenant_id = $1 AND created_at::date = CURRENT_DATE`,
      [tenantId]
    );

    const stock = await query(
      `SELECT COALESCE(SUM(oil_stock_liters), 0)::float AS total
       FROM customers WHERE tenant_id = $1`,
      [tenantId]
    );

    const revenue = await query(
      `SELECT COALESCE(SUM(total_amount), 0)::float AS total
       FROM receptions
       WHERE tenant_id = $1 AND created_at::date = CURRENT_DATE`,
      [tenantId]
    );

    const recent = await query(
      `SELECT r.id, r.reception_number, r.net_weight_kg, r.total_amount,
              r.transport_type, r.created_at, c.first_name, c.last_name
       FROM receptions r
       JOIN customers c ON c.id = r.customer_id
       WHERE r.tenant_id = $1
       ORDER BY r.created_at DESC
       LIMIT 8`,
      [tenantId]
    );

    return ok(res, {
      olivesTodayKg: olives.rows[0].total,
      oilProducedTodayL: oil.rows[0].total,
      customerOilStockL: stock.rows[0].total,
      revenueTodayDh: revenue.rows[0].total,
      recentReceptions: recent.rows.map((row) => ({
        id: row.id,
        receptionNumber: row.reception_number,
        customerName: `${row.first_name} ${row.last_name}`,
        netWeightKg: Number(row.net_weight_kg),
        totalAmount: Number(row.total_amount),
        transportType: row.transport_type,
        createdAt: row.created_at,
      })),
    });
  } catch (err) {
    return next(err);
  }
}

module.exports = { metrics };
