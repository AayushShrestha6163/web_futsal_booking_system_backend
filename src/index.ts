import express, { Application, Request, Response } from 'express';
import { connectDatabase } from './database/mangodb';
import { PORT } from './config';

import authRoutes from "./routes/auth.route";
import adminRoutes from "./routes/admin/user.route";
import adminCourtRoutes from "./routes/admin/court.route";
import adminBookingRoutes from "./routes/admin/booking.route";
import bookingRoutes from "./routes/booking.route";
import slotRoutes from "./routes/slot.route";
import paymentRoutes from "./routes/payment.route";
import courtRoutes from "./routes/court.route";

import cors from "cors";
import path from 'path';

const app: Application = express();


app.use(cors({ origin: true, credentials: true }));


app.use('/uploads', express.static(path.join(__dirname, '..', 'uploads')));


app.use(express.json());
app.use(express.urlencoded({ extended: true }));


app.use('/api/auth', authRoutes);
app.use('/api/admin/users', adminRoutes);
app.use('/api/admin/courts', adminCourtRoutes);
app.use('/api/admin/bookings', adminBookingRoutes);
app.use('/api/bookings', bookingRoutes);
app.use('/api/payments', paymentRoutes);

app.use("/api/courts", courtRoutes);
app.use("/api/courts", slotRoutes);

app.get('/', (req: Request, res: Response) => {
  return res.status(200).json({ success: true, message: "Welcome to the API" });
});

async function startServer() {
  await connectDatabase();
  app.listen(PORT, () => console.log(`Server: http://localhost:${PORT}`));
}

startServer();