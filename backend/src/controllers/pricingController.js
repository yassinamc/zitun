const { query } = require('../config/db');
const { ok, fail } = require('../utils/response');

async function get(req, res, next) {
  try {
    const result = await query(
      `SELECT * FROM pricing_configs WHERE tenant_id = $1`,
      [req.user.tenantId]
    );
    if (!result.rows[0]) return fail(res, 'Pricing not configured', 404);
    return ok(res, mapPricing(result.rows[0]));
  } catch (err) {
    return next(err);
  }
}

async function update(req, res, next) {
  try {
    const { customerTransportRate, companyTransportRate } = req.body;
    const result = await query(
      `UPDATE pricing_configs
       SET customer_transport_rate = $1,
           company_transport_rate = $2,
           updated_at = NOW()
       WHERE tenant_id = $3
       RETURNING *`,
      [customerTransportRate, companyTransportRate, req.user.tenantId]
    );
    if (!result.rows[0]) return fail(res, 'Pricing not configured', 404);
    return ok(res, mapPricing(result.rows[0]));
  } catch (err) {
    return next(err);
  }
}

function mapPricing(row) {
  return {
    customerTransportRate: Number(row.customer_transport_rate),
    companyTransportRate: Number(row.company_transport_rate),
    updatedAt: row.updated_at,
  };
}

module.exports = { get, update };
