import express, { Express, Request, Response, NextFunction } from 'express';
import cors from 'cors';
import dotenv from 'dotenv';
import fileRoutes from './routes/fileRoutes.js';
import recordRoutes from './routes/recordRoutes.js';
import verificationRoutes from './routes/verificationRoutes.js';
import billingRoutes from './routes/billingRoutes.js'; // Import billing routes

const app: Express = express();

// Middleware
app.use(cors()); // Enable CORS for all origins (adjust in production)
app.use(express.json()); // Parse JSON request bodies

// Basic Routes
app.get('/', (req: Request, res: Response) => {
  res.send('Veltis Protocol Backend API'); // Updated name
});

// API Routes
// Note: The Stripe webhook route ('/api/billing/webhooks/stripe') uses express.raw()
// middleware within billingRoutes.ts to handle the raw body needed for signature verification.
// The global express.json() middleware below will apply to other routes.
app.use('/api/billing', billingRoutes);
app.use('/api/files', fileRoutes);
app.use('/api/records', recordRoutes);
app.use('/api/verify', verificationRoutes);

// TODO: Add other API routes here

// Basic Error Handling
// eslint-disable-next-line @typescript-eslint/no-unused-vars
app.use((err: Error, req: Request, res: Response, next: NextFunction) => {
  console.error(err.stack);
  res.status(500).send('Something broke!');
});

export default app;
