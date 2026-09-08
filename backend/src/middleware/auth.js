const { verifyAccessToken } = require('../services/authService');
const { fail } = require('../utils/response');

function authenticate(req, res, next) {
  const header = req.headers.authorization;
  if (!header || !header.startsWith('Bearer ')) {
    return fail(res, 'Unauthorized', 401);
  }

  try {
    const token = header.slice(7);
    const payload = verifyAccessToken(token);
    req.user = {
      id: payload.sub,
      email: payload.email,
      role: payload.role,
      tenantId: payload.tenantId || null,
    };
    return next();
  } catch {
    return fail(res, 'Invalid or expired token', 401);
  }
}

function requireTenant(req, res, next) {
  if (!req.user?.tenantId) {
    return fail(res, 'Tenant context required — connectez-vous avec un compte معصرة', 401);
  }
  return next();
}

function requireRoles(...roles) {
  return (req, res, next) => {
    if (!req.user || !roles.includes(req.user.role)) {
      return fail(res, 'Forbidden', 403);
    }
    return next();
  };
}

function errorHandler(err, req, res, next) {
  console.error(err);
  if (res.headersSent) return next(err);
  const status = err.status || 500;
  return fail(res, err.message || 'Internal server error', status);
}

module.exports = {
  authenticate,
  requireTenant,
  requireRoles,
  errorHandler,
};
