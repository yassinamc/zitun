const bcrypt = require('bcryptjs');
const { query, getClient } = require('../config/db');
const {
  signAccessToken,
  signRefreshToken,
  verifyRefreshToken,
} = require('../services/authService');
const { ok, fail } = require('../utils/response');

function buildTokens(user) {
  const payload = {
    sub: user.id,
    email: user.email,
    role: user.role,
    tenantId: user.tenant_id || null,
  };
  return {
    accessToken: signAccessToken(payload),
    refreshToken: signRefreshToken(payload),
  };
}

async function login(req, res, next) {
  try {
    const { email, password } = req.body;
    const result = await query(
      `SELECT u.*, t.name AS tenant_name, t.slug AS tenant_slug, t.city AS tenant_city
       FROM users u
       LEFT JOIN tenants t ON t.id = u.tenant_id
       WHERE u.email = $1 AND u.is_active = TRUE`,
      [email.toLowerCase()]
    );
    const user = result.rows[0];
    if (!user) return fail(res, 'Invalid credentials', 401);

    const match = await bcrypt.compare(password, user.password_hash);
    if (!match) return fail(res, 'Invalid credentials', 401);

    const tokens = buildTokens(user);
    return ok(res, {
      user: {
        id: user.id,
        email: user.email,
        fullName: user.full_name,
        role: user.role,
        tenantId: user.tenant_id,
        tenant: user.tenant_id
          ? {
              id: user.tenant_id,
              name: user.tenant_name,
              slug: user.tenant_slug,
              city: user.tenant_city,
            }
          : null,
      },
      ...tokens,
    });
  } catch (err) {
    return next(err);
  }
}

async function register(req, res, next) {
  const client = await getClient();
  try {
    const {
      millName,
      millSlug,
      city,
      phone,
      ownerName,
      email,
      password,
    } = req.body;

    const existing = await client.query('SELECT id FROM users WHERE email = $1', [
      email.toLowerCase(),
    ]);
    if (existing.rows[0]) return fail(res, 'Email already registered', 409);

    const slugExists = await client.query('SELECT id FROM tenants WHERE slug = $1', [millSlug]);
    if (slugExists.rows[0]) return fail(res, 'Mill slug already taken', 409);

    await client.query('BEGIN');

    const plan = await client.query(`SELECT id FROM subscription_plans WHERE code = 'FREE' LIMIT 1`);
    const planId = plan.rows[0]?.id || null;

    const tenantResult = await client.query(
      `INSERT INTO tenants (name, slug, phone, city, plan_id, status)
       VALUES ($1, $2, $3, $4, $5, 'TRIAL') RETURNING *`,
      [millName, millSlug, phone || null, city || null, planId]
    );
    const tenant = tenantResult.rows[0];

    await client.query(
      `INSERT INTO pricing_configs (tenant_id) VALUES ($1)`,
      [tenant.id]
    );

    const passwordHash = await bcrypt.hash(password, 10);
    const userResult = await client.query(
      `INSERT INTO users (tenant_id, email, password_hash, full_name, role)
       VALUES ($1, $2, $3, $4, 'TENANT_OWNER') RETURNING *`,
      [tenant.id, email.toLowerCase(), passwordHash, ownerName]
    );
    const user = userResult.rows[0];

    await client.query('COMMIT');

    const tokens = buildTokens(user);
    return ok(
      res,
      {
        user: {
          id: user.id,
          email: user.email,
          fullName: user.full_name,
          role: user.role,
          tenantId: tenant.id,
          tenant: {
            id: tenant.id,
            name: tenant.name,
            slug: tenant.slug,
            city: tenant.city,
          },
        },
        ...tokens,
      },
      201
    );
  } catch (err) {
    await client.query('ROLLBACK');
    return next(err);
  } finally {
    client.release();
  }
}

async function refresh(req, res, next) {
  try {
    const { refreshToken } = req.body;
    if (!refreshToken) return fail(res, 'refreshToken required', 400);

    const payload = verifyRefreshToken(refreshToken);
    const result = await query(
      `SELECT * FROM users WHERE id = $1 AND is_active = TRUE`,
      [payload.sub]
    );
    const user = result.rows[0];
    if (!user) return fail(res, 'User not found', 401);

    return ok(res, buildTokens(user));
  } catch {
    return fail(res, 'Invalid refresh token', 401);
  }
}

async function me(req, res, next) {
  try {
    const result = await query(
      `SELECT u.id, u.email, u.full_name, u.role, u.tenant_id,
              t.name AS tenant_name, t.slug AS tenant_slug, t.city AS tenant_city
       FROM users u
       LEFT JOIN tenants t ON t.id = u.tenant_id
       WHERE u.id = $1`,
      [req.user.id]
    );
    const user = result.rows[0];
    if (!user) return fail(res, 'User not found', 404);

    return ok(res, {
      id: user.id,
      email: user.email,
      fullName: user.full_name,
      role: user.role,
      tenantId: user.tenant_id,
      tenant: user.tenant_id
        ? {
            id: user.tenant_id,
            name: user.tenant_name,
            slug: user.tenant_slug,
            city: user.tenant_city,
          }
        : null,
    });
  } catch (err) {
    return next(err);
  }
}

module.exports = { login, register, refresh, me };
