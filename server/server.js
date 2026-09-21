// Load environment variables
require('dotenv').config();

const express = require('express');
const cors = require('cors');
const path = require('path');
const fs = require('fs-extra');
const session = require('express-session');
const os = require('os');

// Import middleware
const logger = require('./middleware/logger');
const errorHandler = require('./middleware/errorHandler');

// Import routes
const routes = require('./routes');

const app = express();
const PORT = process.env.PORT || 3000;
const SESSION_MAX_AGE_MS = 2 * 60 * 60 * 1000; // 2 hours

// Trust proxy if running behind reverse proxy
app.set('trust proxy', 1);

// Middleware
app.use(cors());
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

// Session configuration
const sessionSecret = process.env.SESSION_SECRET;
if (!sessionSecret) {
  console.error('SESSION_SECRET environment variable not set');
  process.exit(1);
}

app.use(session({
  secret: sessionSecret,
  resave: false,
  saveUninitialized: false,
  name: 'photoframe.sid', // Custom session cookie name
  cookie: {
    secure: false, // Set to false for development, even in production for HTTP
    httpOnly: true,
    maxAge: SESSION_MAX_AGE_MS,
    sameSite: 'lax' // Add SameSite attribute for better compatibility
  }
}));

app.use(logger);

// Static files
app.use('/uploads', express.static(path.join(__dirname, 'uploads')));
app.use('/js', express.static(path.join(__dirname, 'public/js')));
app.use('/admin', express.static(path.join(__dirname, 'public')));
// Serve CSS and JS files from root for access-accounts page
app.use(express.static(path.join(__dirname, 'public'), {
  index: false // Prevent serving index.html from root
}));

// Routes
app.use('/', routes);

// Error handling middleware (must be last)
app.use(errorHandler);

// Initialize uploads directory
const initializeUploads = async () => {
  const uploadsDir = path.join(__dirname, process.env.UPLOAD_DIR || 'uploads');
  const defaultFolders = (process.env.DEFAULT_FOLDERS || 'family,vacation,holidays,misc').split(',');
  
  await fs.ensureDir(uploadsDir);
  
  for (const folder of defaultFolders) {
    await fs.ensureDir(path.join(uploadsDir, folder.trim()));
  }
};

// Start server (bind to all interfaces so it's reachable from other hosts)
app.listen(PORT, '0.0.0.0', async () => {
  await initializeUploads();

  // Build list of non-internal IPv4 addresses for easy access
  const nets = os.networkInterfaces();
  const addresses = [];
  Object.values(nets).forEach(ifaces => {
    ifaces.forEach(iface => {
      if (iface.family === 'IPv4' && !iface.internal) {
        addresses.push(iface.address);
      }
    });
  });

  console.log(`Digital Photo Frame Server running on port ${PORT}`);
  console.log(`Admin panel (localhost): http://localhost:${PORT}/admin`);
  console.log(`Slideshow (localhost): http://localhost:${PORT}/slideshow`);
  console.log(`API endpoint (localhost): http://localhost:${PORT}/api/random-image`);

  if (addresses.length > 0) {
    addresses.forEach(addr => {
      console.log(`Accessible on network: http://${addr}:${PORT}/admin`);
    });
  } else {
    console.log('No non-internal network interfaces detected.');
  }
});

module.exports = app;
