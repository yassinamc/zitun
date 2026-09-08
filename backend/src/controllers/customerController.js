const { query } = require('../config/db');
const { ok, fail } = require('../utils/response');

async function list(req, res, next) {
  try {
    const tenantId = req.user.tenantId;
    const search = (req.query.search || '').trim();
    const page = Math.max(1, Number(req.query.page) || 1);
    const limit = Math.min(100, Math.max(1, Number(req.query.limit) || 20));
    const offset = (page - 1) * limit;

    const params = [tenantId];
    let where = 'WHERE tenant_id = $1';
    if (search) {
      params.push(`%${search}%`);
      where += ` AND (
        first_name ILIKE $2 OR last_name ILIKE $2 OR phone ILIKE $2 OR cin ILIKE $2
      )`;
    }

    const countResult = await query(`SELECT COUNT(*)::int AS total FROM customers ${where}`, params);
    params.push(limit, offset);
    const result = await query(
      `SELECT * FROM customers ${where}
       ORDER BY created_at DESC
       LIMIT $${params.length - 1} OFFSET $${params.length}`,
      params
    );

    return ok(res, {
      items: result.rows.map(mapCustomer),
      pagination: {
        page,
        limit,
        total: countResult.rows[0].total,
      },
    });
  } catch (err) {
    return next(err);
  }
}

async function create(req, res, next) {
  try {
    const tenantId = req.user.tenantId;
    const { firstName, lastName, cin, phone, address } = req.body;
    const result = await query(
      `INSERT INTO customers (tenant_id, first_name, last_name, cin, phone, address)
       VALUES ($1, $2, $3, $4, $5, $6) RETURNING *`,
      [tenantId, firstName, lastName, cin || null, phone || null, address || null]
    );
    return ok(res, mapCustomer(result.rows[0]), 201);
  } catch (err) {
    return next(err);
  }
}

async function getById(req, res, next) {
  try {
    const result = await query(
      `SELECT * FROM customers WHERE id = $1 AND tenant_id = $2`,
      [req.params.id, req.user.tenantId]
    );
    if (!result.rows[0]) return fail(res, 'Customer not found', 404);

    const receptions = await query(
      `SELECT id, reception_number, net_weight_kg, total_amount, transport_type, created_at
       FROM receptions
       WHERE customer_id = $1 AND tenant_id = $2
       ORDER BY created_at DESC LIMIT 20`,
      [req.params.id, req.user.tenantId]
    );

    return ok(res, {
      ...mapCustomer(result.rows[0]),
      recentReceptions: receptions.rows,
    });
  } catch (err) {
    return next(err);
  }
}

async function update(req, res, next) {
  try {
    const { firstName, lastName, cin, phone, address } = req.body;
    const result = await query(
      `UPDATE customers SET
         first_name = $1, last_name = $2, cin = $3, phone = $4, address = $5, updated_at = NOW()
       WHERE id = $6 AND tenant_id = $7
       RETURNING *`,
      [firstName, lastName, cin || null, phone || null, address || null, req.params.id, req.user.tenantId]
    );
    if (!result.rows[0]) return fail(res, 'Customer not found', 404);
    return ok(res, mapCustomer(result.rows[0]));
  } catch (err) {
    return next(err);
  }
}

async function remove(req, res, next) {
  try {
    const active = await query(
      `SELECT id FROM receptions WHERE customer_id = $1 AND tenant_id = $2 LIMIT 1`,
      [req.params.id, req.user.tenantId]
    );
    if (active.rows[0]) {
      return fail(res, 'Cannot delete customer with existing receptions', 409);
    }

    const result = await query(
      `DELETE FROM customers WHERE id = $1 AND tenant_id = $2 RETURNING id`,
      [req.params.id, req.user.tenantId]
    );
    if (!result.rows[0]) return fail(res, 'Customer not found', 404);
    return ok(res, { id: result.rows[0].id });
  } catch (err) {
    return next(err);
  }
}

function mapCustomer(row) {
  return {
    id: row.id,
    firstName: row.first_name,
    lastName: row.last_name,
    cin: row.cin,
    phone: row.phone,
    address: row.address,
    creditBalance: Number(row.credit_balance),
    oilStockLiters: Number(row.oil_stock_liters),
    createdAt: row.created_at,
  };
}

module.exports = { list, create, getById, update, remove };
