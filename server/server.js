
import express from 'express';
import mongoose from 'mongoose';
import dns from 'dns';
const dnsPromises = dns.promises;
import cors from 'cors';
import dotenv from 'dotenv';
// Import models to register them with Mongoose before routes use them
import './models/user.js';
import './models/meal.js';

import mealRoutes from './routes/meals.js';
import userRoutes from './routes/users.js';

dotenv.config();

const app = express();
const PORT = process.env.PORT || 8000;

// Middleware
app.use(cors());
app.use(express.json());

// API Routes
app.use('/api/meals', mealRoutes);
app.use('/api/users', userRoutes);


// Simple route for checking server status
app.get('/', (req, res) => {
  res.send('Cosmic Nutrition API is running!');
});

// Helper: extract host from a MongoDB URI (handles mongodb+srv:// and mongodb://)
function getHostFromMongoUri(uri) {
  if (!uri) return null;
  // remove protocol
  const withoutProtocol = uri.replace(/^mongodb(\+srv)?:\/\//, '');
  // if credentials present, strip them
  const atIndex = withoutProtocol.indexOf('@');
  const afterCreds = atIndex !== -1 ? withoutProtocol.slice(atIndex + 1) : withoutProtocol;
  // host is up to first slash or ?
  const slashIndex = afterCreds.indexOf('/');
  const hostPort = slashIndex !== -1 ? afterCreds.slice(0, slashIndex) : afterCreds;
  // for mongodb+srv it's a single host; for mongodb:// it might be comma-separated - take the first
  const firstHost = hostPort.split(',')[0];
  // strip any optional port
  return firstHost.split(':')[0];
}

// Wait until the MongoDB host resolves to an IP or SRV record before attempting to connect.
async function waitForMongoHost(uri, { timeoutMs = 60000, intervalMs = 2000 } = {}) {
  const host = getHostFromMongoUri(uri);
  if (!host) return;

  const start = Date.now();
  while (Date.now() - start < timeoutMs) {
    try {
      // For mongodb+srv URIs, check SRV records
      try {
        const srvName = `_mongodb._tcp.${host}`;
        const srvs = await dnsPromises.resolveSrv(srvName);
        if (srvs && srvs.length > 0) {
          console.log(`Resolved SRV for ${srvName}:`, srvs.map(s => `${s.name}:${s.port}`).join(', '));
          return; // SRV found
        }
      } catch (srvErr) {
        // Log SRV errors (helps diagnose DNS issues during deploy)
        console.warn(`SRV lookup failed for ${host}:`, srvErr && srvErr.message ? srvErr.message : srvErr);
        // fall back to A/AAAA lookup
      }

      // Fallback to A/AAAA lookup
      const lookup = await dnsPromises.lookup(host);
      if (lookup && lookup.address) {
        console.log(`Resolved ${host} -> ${lookup.address}`);
        return;
      }
    } catch (err) {
      // Log lookup errors and continue retrying
      console.warn(`DNS lookup attempt failed for ${host}:`, err && err.message ? err.message : err);
    }

    console.log(`Waiting for MongoDB host (${host}) to resolve... retrying in ${intervalMs}ms`);
    await new Promise(r => setTimeout(r, intervalMs));
  }
  throw new Error(`Timed out waiting for MongoDB host to resolve: ${host} (waited ${timeoutMs}ms)`);
}

// Initialize server after ensuring DB host is resolvable
async function init() {
  try {
    console.log('Checking MongoDB host resolution before connecting...');
    await waitForMongoHost(process.env.MONGO_URI);
    await mongoose.connect(process.env.MONGO_URI);
    console.log('Connected to MongoDB');
    app.listen(PORT, () => {
      console.log(`Server is running on port: ${PORT}`);
    });
  } catch (error) {
    console.error('Connection error', error.message);
    process.exit(1);
  }
}

init();
