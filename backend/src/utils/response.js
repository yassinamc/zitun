function ok(res, data, status = 200) {
  return res.status(status).json({ success: true, data });
}

function fail(res, message, status = 400, details = null) {
  const body = { success: false, message };
  if (details) body.details = details;
  return res.status(status).json(body);
}

module.exports = { ok, fail };
