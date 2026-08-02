import express from 'express';
import path from 'path';
import fs from 'fs';
import 'express-async-errors';
import cors from 'cors';
import helmet from 'helmet';
import mongoSanitize from 'express-mongo-sanitize';
import rateLimit from 'express-rate-limit';
import dotenv from 'dotenv';
import { createServer as createViteServer } from 'vite';

// Load env variables
dotenv.config();
// Fallback from .env.example for missing or updated variables
dotenv.config({ path: '.env.example', override: true });

// Sanitize CLOUDINARY_URL if invalid or containing placeholders to prevent Cloudinary SDK from throwing on startup
if (process.env.CLOUDINARY_URL) {
  const url = process.env.CLOUDINARY_URL;
  if (typeof url !== 'string' || !url.startsWith('cloudinary://') || url.includes('<') || url.includes('>')) {
    delete process.env.CLOUDINARY_URL;
  }
}

// Helper to mask password in connection string for logging
const maskPasswordInUri = (uri) => {
  if (!uri) return 'undefined';
  return uri.replace(/:([^@]+)@/, ':***@');
};

// Imports from our custom backend files
import connectDB, { formatMongoUri } from './server/config/db.js';
import authRouter from './server/routes/authRoutes.js';
import jobsRouter from './server/routes/jobsRoutes.js';
import errorHandlerMiddleware from './server/middleware/error-handler.js';
import notFoundMiddleware from './server/middleware/not-found.js';

const startServer = async () => {
  const app = express();
  const PORT = Number(process.env.PORT) || 3000;

  // 1. Security Middlewares
  app.use(express.json());
  app.use(cors());
  app.use(
    helmet({
      contentSecurityPolicy: false, // Disabled for preview iFrame compatibility
      crossOriginEmbedderPolicy: false,
    })
  );
  app.use(mongoSanitize());

  // Rate limiter (except in development)
  if (process.env.NODE_ENV === 'production') {
    const limiter = rateLimit({
      windowMs: 15 * 60 * 1000, // 15 minutes
      max: 100, // Limit each IP to 100 requests per 15 mins
      message: 'Too many requests from this IP, please try again after 15 minutes',
    });
    app.use('/api', limiter);
  }

  // 3. API Routes FIRST
  app.get('/api/v1/health', (req, res) => {
    res.status(200).json({ status: 'OK', message: 'Job Application Tracker API is live.' });
  });

  // DB Connection status checking & on-the-fly reconnection middleware
  app.use('/api', async (req, res, next) => {
    if (req.path === '/v1/health' || req.path.includes('check-resume')) {
      return next();
    }
    
    const mongoose = (await import('mongoose')).default;
    if (mongoose.connection.readyState !== 1) {
      const mongoUri = process.env.MONGO_URI;
      if (mongoUri && mongoUri.trim() !== '' && !mongoUri.includes('<db_password>')) {
        try {
          if (mongoose.connection.readyState === 0 || mongoose.connection.readyState === 3) {
            await connectDB(mongoUri);
          }
        } catch (err) {
          // Throttled in db.js - avoid logging verbose trace on every request
        }
      }
    }

    if (mongoose.connection.readyState !== 1) {
      return res.status(503).json({
        msg: 'Database is currently offline. Please: 1) Verify your MONGO_URI under Settings > Secrets 2) Ensure MongoDB Atlas allows access from all IPs (add 0.0.0.0/0 under Network Access)'
      });
    }
    next();
  });

  app.use('/api/v1/auth', authRouter);
  app.use('/api/v1/jobs', jobsRouter);

  // 4. Vite middleware or Static files serving
  if (process.env.NODE_ENV !== 'production') {
    console.log('Starting server in DEVELOPMENT mode with Vite dev middleware...');
    const vite = await createViteServer({
      server: { middlewareMode: true },
      appType: 'spa',
    });
    app.use(vite.middlewares);

    // Serve index.html for non-API client routes in development
    app.use('*', async (req, res, next) => {
      const url = req.originalUrl;
      if (url.startsWith('/api')) {
        return next();
      }
      try {
        let template = fs.readFileSync(path.resolve(process.cwd(), 'index.html'), 'utf-8');
        template = await vite.transformIndexHtml(url, template);
        res.status(200).set({ 'Content-Type': 'text/html' }).end(template);
      } catch (e) {
        vite.ssrFixStacktrace(e);
        next(e);
      }
    });
  } else {
    console.log('Starting server in PRODUCTION mode serving compiled static files...');
    const distPath = path.join(process.cwd(), 'dist');
    app.use(express.static(distPath));
    app.get('*', (req, res) => {
      res.sendFile(path.join(distPath, 'index.html'));
    });
  }

  // 5. Error Handling Middlewares (placed after routes and asset serving)
  app.use(notFoundMiddleware);
  app.use(errorHandlerMiddleware);

  app.listen(PORT, '0.0.0.0', () => {
    console.log(`Server is running on port ${PORT}...`);

    // Asynchronously connect to MongoDB after server is running on port 3000
    const mongoUri = process.env.MONGO_URI;
    console.log('Loaded MONGO_URI from env:', maskPasswordInUri(mongoUri));

    if (!mongoUri) {
      console.log('[Database] MONGO_URI is not defined. Database features will be unavailable until MONGO_URI is set in Settings > Secrets.');
    } else {
      connectDB(mongoUri);
    }
  });
};

startServer().catch((error) => {
  console.error('Failed to start server:', error);
});
