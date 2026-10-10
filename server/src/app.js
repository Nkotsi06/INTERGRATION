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

// Security and utility middleware
app.use(helmet({ crossOriginResourcePolicy: false }));
app.use(compression());
app.use(morgan(process.env.NODE_ENV === 'production' ? 'combined' : 'dev'));
app.use(
  cors({
    origin: process.env.CORS_ORIGIN?.split(',') || 'http://localhost:3000',
    credentials: true,
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