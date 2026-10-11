const express = require('express');
const cors = require('cors');
const helmet = require('helmet');
const compression = require('compression');
const morgan = require('morgan');
const cookieParser = require('cookie-parser');
const path = require('path');

const errorHandler = require('./middleware/errorHandler');
const rateLimitMiddleware = require('./middleware/rateLimitMiddleware');

// Routes
const authRoutes = require('./routes/authRoutes');
const citizenRoutes = require('./routes/citizenRoutes');
const homeAffairsRoutes = require('./routes/homeAffairsRoutes');
const trafficRoutes = require('./routes/trafficRoutes');
const policeRoutes = require('./routes/policeRoutes');
const financeRoutes = require('./routes/financeRoutes');
const pensionsRoutes = require('./routes/pensionsRoutes');
const passportRoutes = require('./routes/passportRoutes');
const adminRoutes = require('./routes/adminRoutes');
const documentRoutes = require('./routes/documentRoutes');
const signatureRoutes = require('./routes/signatureRoutes');
const biometricRoutes = require('./routes/biometricRoutes');
const verificationRoutes = require('./routes/verificationRoutes');
const settingsRoutes = require('./routes/settingsRoutes');
const referenceRoutes = require('./routes/referenceRoutes');
const auditRoutes = require('./routes/auditRoutes');

const app = express();

// Render terminates TLS at its proxy; without this, req.ip is the proxy IP
// and every user shares one rate-limit bucket.
app.set('trust proxy', 1);

// Build the allowed-origins list once at startup.
//   - split on commas
//   - trim whitespace
//   - strip trailing slashes (browsers send origins without them)
//   - drop empty entries
const allowedOrigins = (process.env.CORS_ORIGIN || 'http://localhost:5173')
  .split(',')
  .map((o) => o.trim().replace(/\/+$/, ''))
  .filter(Boolean);

// Security and utility middleware
app.use(helmet({ crossOriginResourcePolicy: false }));
app.use(compression());
app.use(morgan(process.env.NODE_ENV === 'production' ? 'combined' : 'dev'));

// CORS must run before the rate limiter and every route so that
// preflight (OPTIONS) and error responses (404, 429) also carry the headers.
app.use(
  cors({
    origin: (origin, callback) => {
      // Allow no-origin requests: curl, Postman, health checks, server-to-server.
      if (!origin) return callback(null, true);
      if (allowedOrigins.includes(origin)) return callback(null, true);
      // Do NOT throw — just don't set CORS headers.
      return callback(null, false);
    },
    credentials: true,
    methods: ['GET', 'POST', 'PUT', 'PATCH', 'DELETE', 'OPTIONS'],
    allowedHeaders: ['Content-Type', 'Authorization'],
    exposedHeaders: ['Content-Disposition'],
    maxAge: 86400,
  })
);

app.use(express.json({ limit: '10mb' }));
app.use(express.urlencoded({ extended: true, limit: '10mb' }));
app.use(cookieParser());

// Rate limiting
app.use('/api', rateLimitMiddleware);

// Static file serving (uploads)
app.use('/uploads', express.static(path.join(__dirname, '..', 'uploads')));

// Health check
app.get('/api/health', (req, res) => {
  res.json({ status: 'ok', timestamp: new Date().toISOString() });
});

// Routes
app.use('/api/auth', authRoutes);
app.use('/api/citizen', citizenRoutes);
app.use('/api/home-affairs', homeAffairsRoutes);
app.use('/api/traffic', trafficRoutes);
app.use('/api/police', policeRoutes);
app.use('/api/finance', financeRoutes);
app.use('/api/pensions', pensionsRoutes);
app.use('/api/passport', passportRoutes);
app.use('/api/admin', adminRoutes);
app.use('/api/documents', documentRoutes);
app.use('/api/signatures', signatureRoutes);
app.use('/api/biometrics', biometricRoutes);
app.use('/api/verification', verificationRoutes);
app.use('/api/settings', settingsRoutes);
app.use('/api/references', referenceRoutes);
app.use('/api/audit', auditRoutes);

// 404 handler
app.use((req, res) => {
  res.status(404).json({ message: 'Route not found' });
});

// Central error handler
app.use(errorHandler);

module.exports = app;