const express = require('express');
const cors = require('cors');
const helmet = require('helmet');
const compression = require('compression');
const morgan = require('morgan');
const cookieParser = require('cookie-parser');
const path = require('path');

const errorHandler = require('./middleware/errorHandler');
const rateLimitMiddleware = require('./middleware/rateLimitMiddleware');
const requestAuditMiddleware = require('./middleware/requestAuditMiddleware');

// Routes
const authRoutes = require('./routes/authRoutes');
const birthApplicationRoutes = require('./routes/birthApplicationRoutes');
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
const notificationRoutes = require('./routes/notificationRoutes');
const paymentRoutes = require('./routes/paymentRoutes');
const serviceRoutes = require('./routes/serviceRoutes');
const feeScheduleRoutes = require('./routes/feeScheduleRoutes');
const certificateRoutes = require('./routes/certificateRoutes');
const nationalIdRoutes = require('./routes/nationalIdRoutes'); // ← NEW
const informationRoutes = require('./routes/informationRoutes');

const app = express();

app.set('trust proxy', 1);

const allowedOrigins = (process.env.CORS_ORIGIN || 'http://localhost:5173')
  .split(',')
  .map((o) => o.trim().replace(/\/+$/, ''))
  .filter(Boolean);

app.use(helmet({ crossOriginResourcePolicy: false }));
app.use(compression());
app.use(morgan(process.env.NODE_ENV === 'production' ? 'combined' : 'dev'));

app.use(
  cors({
    origin: (origin, callback) => {
      if (!origin) return callback(null, true);
      if (allowedOrigins.includes(origin)) return callback(null, true);
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

app.use('/api', rateLimitMiddleware);
app.use(['/api/pensions', '/api/verification'], requestAuditMiddleware);

app.use('/uploads', express.static(path.join(__dirname, '..', 'uploads')));

app.get('/api/health', (req, res) => {
  res.json({ status: 'ok', timestamp: new Date().toISOString() });
});

app.use('/api/auth', authRoutes);
app.use('/api/birth-applications', birthApplicationRoutes);
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

// SHARED NOTIFICATIONS ROUTE
app.use('/api/notifications', notificationRoutes);

app.use('/api/payments', paymentRoutes);
app.use('/api/services', serviceRoutes);
app.use('/api/fee-schedule', feeScheduleRoutes);
app.use('/api/certificates', certificateRoutes);
app.use('/api/national-id', nationalIdRoutes); // ← NEW
app.use('/api/information', informationRoutes);

app.use((req, res) => {
  res.status(404).json({ message: 'Route not found' });
});

app.use(errorHandler);

module.exports = app;