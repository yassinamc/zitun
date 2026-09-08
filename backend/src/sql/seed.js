const bcrypt = require('bcryptjs');
const { pool, query } = require('../config/db');

const PASSWORD = 'ChangeMe123!';

async function upsertPlan(code, name, maxCustomers, maxOperations, whatsapp) {
  const existing = await query('SELECT id FROM subscription_plans WHERE code = $1', [code]);
  if (existing.rows[0]) return existing.rows[0].id;
  const result = await query(
    `INSERT INTO subscription_plans (code, name, max_customers, max_operations, whatsapp_access)
     VALUES ($1, $2, $3, $4, $5) RETURNING id`,
    [code, name, maxCustomers, maxOperations, whatsapp]
  );
  return result.rows[0].id;
}

async function upsertTenant({ name, slug, phone, city, address, planId }) {
  const existing = await query('SELECT id FROM tenants WHERE slug = $1', [slug]);
  if (existing.rows[0]) return existing.rows[0].id;
  const result = await query(
    `INSERT INTO tenants (name, slug, phone, city, address, plan_id, status)
     VALUES ($1, $2, $3, $4, $5, $6, 'ACTIVE') RETURNING id`,
    [name, slug, phone, city, address, planId]
  );
  return result.rows[0].id;
}

async function upsertUser({ tenantId, email, fullName, role, passwordHash }) {
  const existing = await query('SELECT id FROM users WHERE email = $1', [email]);
  if (existing.rows[0]) return existing.rows[0].id;
  const result = await query(
    `INSERT INTO users (tenant_id, email, password_hash, full_name, role)
     VALUES ($1, $2, $3, $4, $5) RETURNING id`,
    [tenantId, email, passwordHash, fullName, role]
  );
  return result.rows[0].id;
}

async function ensurePricing(tenantId) {
  const existing = await query('SELECT id FROM pricing_configs WHERE tenant_id = $1', [tenantId]);
  if (existing.rows[0]) return;
  await query(
    `INSERT INTO pricing_configs (tenant_id, customer_transport_rate, company_transport_rate)
     VALUES ($1, 0.50, 0.65)`,
    [tenantId]
  );
}

async function ensureCustomer(tenantId, data) {
  const existing = await query(
    `SELECT id FROM customers WHERE tenant_id = $1 AND phone = $2`,
    [tenantId, data.phone]
  );
  if (existing.rows[0]) return existing.rows[0].id;
  const result = await query(
    `INSERT INTO customers (tenant_id, first_name, last_name, cin, phone, address, oil_stock_liters)
     VALUES ($1, $2, $3, $4, $5, $6, $7) RETURNING id`,
    [tenantId, data.firstName, data.lastName, data.cin, data.phone, data.address, data.oilStock]
  );
  return result.rows[0].id;
}

async function seed() {
  const passwordHash = await bcrypt.hash(PASSWORD, 10);

  const freePlan = await upsertPlan('FREE', 'Free', 50, 500, false);
  await upsertPlan('PRO', 'Pro', 500, 10000, true);
  await upsertPlan('ENTERPRISE', 'Enterprise', 10000, 1000000, true);

  const atlasId = await upsertTenant({
    name: 'معصرة الأطلس',
    slug: 'moulin-atlas',
    phone: '0535-000001',
    city: 'Fès',
    address: 'Route de Sefrou, Fès',
    planId: freePlan,
  });

  const fesId = await upsertTenant({
    name: 'معصرة فاس الجديدة',
    slug: 'moulin-fes',
    phone: '0535-000002',
    city: 'Fès',
    address: 'Zone industrielle, Fès',
    planId: freePlan,
  });

  await ensurePricing(atlasId);
  await ensurePricing(fesId);

  await upsertUser({
    tenantId: null,
    email: 'admin@oliveflow.local',
    fullName: 'OliveFlow Admin',
    role: 'PLATFORM_ADMIN',
    passwordHash,
  });

  await upsertUser({
    tenantId: atlasId,
    email: 'owner@atlas.local',
    fullName: 'مول المعصرة الأطلس',
    role: 'TENANT_OWNER',
    passwordHash,
  });

  await upsertUser({
    tenantId: atlasId,
    email: 'employee@atlas.local',
    fullName: 'عامل القبان',
    role: 'EMPLOYEE',
    passwordHash,
  });

  await upsertUser({
    tenantId: fesId,
    email: 'owner@fes.local',
    fullName: 'مول معصرة فاس',
    role: 'TENANT_OWNER',
    passwordHash,
  });

  await ensureCustomer(atlasId, {
    firstName: 'محمد',
    lastName: 'العلوي',
    cin: 'AB123456',
    phone: '0612345678',
    address: 'تاونات',
    oilStock: 45,
  });

  await ensureCustomer(atlasId, {
    firstName: 'فاطمة',
    lastName: 'بناني',
    cin: 'CD789012',
    phone: '0698765432',
    address: 'صفرو',
    oilStock: 20,
  });

  console.log('✓ Seed completed');
  console.log('  admin@oliveflow.local / ChangeMe123!');
  console.log('  owner@atlas.local / ChangeMe123!');
  console.log('  employee@atlas.local / ChangeMe123!');
  console.log('  owner@fes.local / ChangeMe123!');
  await pool.end();
}

seed().catch((err) => {
  console.error('Seed failed:', err.message);
  process.exit(1);
});
