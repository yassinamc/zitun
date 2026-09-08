const { query, getClient } = require('../config/db');
const {
  calculateNetWeight,
  getUnitPrice,
  calculateTotal,
} = require('../services/pricingService');
const { ok, fail } = require('../utils/response');

async function list(req, res, next) {
  try {
    const tenantId = req.user.tenantId;
    const result = await query(
      `SELECT r.*, c.first_name, c.last_name, c.phone
       FROM receptions r
       JOIN customers c ON c.id = r.customer_id
       WHERE r.tenant_id = $1
       ORDER BY r.created_at DESC
       LIMIT 100`,
      [tenantId]
    );
    return ok(res, result.rows.map(mapReception));
  } catch (err) {
    return next(err);
  }
}

async function create(req, res, next) {
  const client = await getClient();
  try {
    const tenantId = req.user.tenantId;
    const {
      customerId,
      grossWeightKg,
      tareWeightKg,
      transportType,
      paymentStatus = 'CREDIT',
      notes,
    } = req.body;

    const customer = await client.query(
      `SELECT id FROM customers WHERE id = $1 AND tenant_id = $2`,
      [customerId, tenantId]
    );
    if (!customer.rows[0]) return fail(res, 'Customer not found', 404);

    const pricingResult = await client.query(
      `SELECT * FROM pricing_configs WHERE tenant_id = $1`,
      [tenantId]
    );
    const pricing = pricingResult.rows[0];

    const netWeightKg = calculateNetWeight(grossWeightKg, tareWeightKg);
    const unitPrice = getUnitPrice(transportType, pricing);
    const totalAmount = calculateTotal(netWeightKg, unitPrice);

    const year = new Date().getFullYear();
    const seqResult = await client.query(`SELECT nextval('reception_seq') AS seq`);
    const receptionNumber = `OLV-${year}-${String(seqResult.rows[0].seq).padStart(6, '0')}`;

    await client.query('BEGIN');
    const result = await client.query(
      `INSERT INTO receptions (
         tenant_id, customer_id, reception_number,
         gross_weight_kg, tare_weight_kg, net_weight_kg,
         transport_type, unit_price, total_amount,
         payment_status, notes, created_by
       ) VALUES ($1,$2,$3,$4,$5,$6,$7,$8,$9,$10,$11,$12)
       RETURNING *`,
      [
        tenantId,
        customerId,
        receptionNumber,
        grossWeightKg,
        tareWeightKg,
        netWeightKg,
        transportType,
        unitPrice,
        totalAmount,
        paymentStatus,
        notes || null,
        req.user.id,
      ]
    );

    if (paymentStatus === 'PAID') {
      await client.query(
        `INSERT INTO cash_movements (tenant_id, direction, amount, label, related_reception_id)
         VALUES ($1, 'IN', $2, $3, $4)`,
        [tenantId, totalAmount, `Règlement ${receptionNumber}`, result.rows[0].id]
      );
    }

    await client.query('COMMIT');

    const full = await query(
      `SELECT r.*, c.first_name, c.last_name, c.phone
       FROM receptions r
       JOIN customers c ON c.id = r.customer_id
       WHERE r.id = $1 AND r.tenant_id = $2`,
      [result.rows[0].id, tenantId]
    );

    return ok(res, mapReception(full.rows[0]), 201);
  } catch (err) {
    await client.query('ROLLBACK');
    if (err.message.includes('Gross weight')) {
      return fail(res, err.message, 400);
    }
    return next(err);
  } finally {
    client.release();
  }
}

async function getById(req, res, next) {
  try {
    const result = await query(
      `SELECT r.*, c.first_name, c.last_name, c.phone
       FROM receptions r
       JOIN customers c ON c.id = r.customer_id
       WHERE r.id = $1 AND r.tenant_id = $2`,
      [req.params.id, req.user.tenantId]
    );
    if (!result.rows[0]) return fail(res, 'Reception not found', 404);
    return ok(res, mapReception(result.rows[0]));
  } catch (err) {
    return next(err);
  }
}

function mapReception(row) {
  return {
    id: row.id,
    receptionNumber: row.reception_number,
    customerId: row.customer_id,
    customerName: `${row.first_name} ${row.last_name}`,
    customerPhone: row.phone,
    grossWeightKg: Number(row.gross_weight_kg),
    tareWeightKg: Number(row.tare_weight_kg),
    netWeightKg: Number(row.net_weight_kg),
    transportType: row.transport_type,
    unitPrice: Number(row.unit_price),
    totalAmount: Number(row.total_amount),
    paymentStatus: row.payment_status,
    notes: row.notes,
    createdAt: row.created_at,
  };
}

module.exports = { list, create, getById };
