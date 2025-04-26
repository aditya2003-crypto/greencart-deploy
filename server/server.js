import cookieParser from 'cookie-parser';
import express from 'express';
import cors from 'cors';
import connectDB from './configs/db.js';
import 'dotenv/config';
import userRouter from './routes/userRoute.js';
import sellerRouter from './routes/sellerRoute.js';
import connectCloudinary from './configs/cloudinary.js';
import productRouter from './routes/productRoute.js';
import cartRouter from './routes/cartRoute.js';
import addressRouter from './routes/addressRoute.js';
import orderRouter from './routes/orderRoute.js';
import { stripeWebhooks } from './controllers/orderController.js';

const app = express();
const DEFAULT_PORT = parseInt(process.env.PORT) || 4000;

try {
  await connectDB();
  await connectCloudinary();

  // Stripe webhook must come before express.json()
  app.post('/stripe', express.raw({ type: 'application/json' }), stripeWebhooks);

  // Middleware
  app.use(express.json());
  app.use(cookieParser());

  // CORS - allow requests from frontend (modify in prod)
  app.use(cors({
    origin: true, // Allow all origins during development
    credentials: true
  }));

  // Basic route
  app.get('/', (req, res) => res.send("✅ API is Working"));

  // API routes
  app.use('/api/user', userRouter);
  app.use('/api/seller', sellerRouter);
  app.use('/api/product', productRouter);
  app.use('/api/cart', cartRouter);
  app.use('/api/address', addressRouter);
  app.use('/api/order', orderRouter);

  // Server start with fallback if port is in use
  const server = app.listen(DEFAULT_PORT)
    .on('listening', () => {
      console.log(`✅ Server is running at http://localhost:${DEFAULT_PORT}`);
    })
    .on('error', (err) => {
      if (err.code === 'EADDRINUSE') {
        const fallbackPort = DEFAULT_PORT + 1;
        console.warn(`⚠️ Port ${DEFAULT_PORT} in use. Trying port ${fallbackPort}...`);
        app.listen(fallbackPort, () => {
          console.log(`✅ Server is running at http://localhost:${fallbackPort}`);
        });
      } else {
        console.error('❌ Server error:', err);
      }
    });

} catch (err) {
  console.error('❌ Error during startup:', err.message);
  process.exit(1);
}
