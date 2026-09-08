require('dotenv').config();
const express = require('express');
const cors = require('cors');
const { checkConnection } = require('./config/db');
const { errorHandler } = require('./middleware/auth');
const { ok, fail } = require('./utils/response');

const authRoutes = require('./routes/authRoutes');
const customerRoutes = require('./routes/customerRoutes');
const receptionRoutes = require('./routes/receptionRoutes');
const pricingRoutes = require('./routes/pricingRoutes');
const dashboardRoutes = require('./routes/dashboardRoutes');

const app = express();
const PORT = process.env.PORT || 4000;

const allowedOrigins = (
  process.env.FRONTEND_ORIGINS ||
  process.env.FRONTEND_ORIGIN ||
  'http://localhost:3000,http://localhost:3001'
)
  .split(',')
  .map((o) => o.trim())
  .filter(Boolean);

app.use(
  cors({
    origin(origin, callback) {
      // Allow same-origin / tools without Origin header (curl, Postman)
      if (!origin || allowedOrigins.includes(origin)) {
        return callback(null, true);
      }
      return callback(null, false);
    },
    credentials: true,
  })
);
app.use(express.json());

app.get('/health', async (req, res) => {
  try {
    const now = await checkConnection();
    return ok(res, { status: 'ok', database: 'connected', time: now });
  } catch (err) {
    return fail(res, `Database unavailable: ${err.message}`, 503);
  }
});

app.use('/api/v1/auth', authRoutes);
app.use('/api/v1/customers', customerRoutes);
app.use('/api/v1/receptions', receptionRoutes);
app.use('/api/v1/pricing', pricingRoutes);
app.use('/api/v1/dashboard', dashboardRoutes);

app.use((req, res) => fail(res, 'Not found', 404));
app.use(errorHandler);

app.listen(PORT, () => {
  console.log(`🫒 OliveFlow API running on http://localhost:${PORT}`);
  console.log(`   Health: http://localhost:${PORT}/health`);
});
