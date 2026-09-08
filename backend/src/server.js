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
  '*'
)
  .split(',')
  .map((o) => o.trim())
  .filter(Boolean);

app.use(
  cors({
    origin(origin, callback) {
      // Allow same-origin / tools without Origin header (curl, Postman)
      if (!origin) return callback(null, true);

      // If '*' is in allowedOrigins or not strictly specified
      if (allowedOrigins.includes('*') || process.env.NODE_ENV !== 'production') {
        return callback(null, true);
      }

      if (
        allowedOrigins.includes(origin) ||
        /^https?:\/\/(localhost|127\.0\.0\.1|192\.168\.\d+\.\d+|10\.\d+\.\d+\.\d+|172\.(1[6-9]|2[0-9]|3[0-1])\.\d+\.\d+)(:\d+)?$/.test(origin)
      ) {
        return callback(null, true);
      }
      return callback(null, false);
    },
    credentials: true,
  })
);
app.use(express.json());

const healthHandler = async (req, res) => {
  try {
    const now = await checkConnection();
    return ok(res, { status: 'ok', database: 'connected', time: now });
  } catch (err) {
    return fail(res, `Database unavailable: ${err.message}`, 503);
  }
};

app.get('/health', healthHandler);
app.get('/api/health', healthHandler);
app.get('/api/v1/health', healthHandler);

const apiRouter = express.Router();
apiRouter.use('/auth', authRoutes);
apiRouter.use('/customers', customerRoutes);
apiRouter.use('/receptions', receptionRoutes);
apiRouter.use('/pricing', pricingRoutes);
apiRouter.use('/dashboard', dashboardRoutes);

app.use('/api/v1', apiRouter);
app.use('/v1', apiRouter);
app.use('/api', apiRouter);
app.use('/', apiRouter);

app.use((req, res) => fail(res, 'Not found', 404));
app.use(errorHandler);

if (require.main === module) {
  app.listen(PORT, () => {
    console.log(`🫒 OliveFlow API running on http://localhost:${PORT}`);
    console.log(`   Health: http://localhost:${PORT}/health`);
  });
}

module.exports = app;
