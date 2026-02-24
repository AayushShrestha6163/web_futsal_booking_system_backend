import express, { Application, Request, Response } from 'express';
import bodyParser from 'body-parser';
import { connectDatabase } from './database/mangodb';
import { PORT } from './config';
import authRoutes from "./routes/auth.route";
import adminRoutes from "./routes/admin/user.route"  
import adminCourtRoutes from "./routes/admin/court.route";
import adminBookingRoutes from "./routes/admin/booking.route";
import bookingRoutes from "./routes/booking.route";
import slotRoutes from "./routes/slot.route";
import paymentRoutes from "./routes/payment.route";
import courtRoutes from "./routes/court.route";


import cors from "cors"
import path from 'path';

const app: Application = express();

const corsOptions = {
    origin:[ 'http://localhost:3000', 'http://localhost:3003', 'http://localhost:3005' ],
    optionsSuccessStatus: 200,
    credentials: true,
};
app.use(cors(corsOptions))
app.use('/uploads', express.static(path.join(__dirname, '..', 'uploads')));
app.use(bodyParser.json());
app.use(bodyParser.urlencoded({ extended: true }));

app.use('/api/auth', authRoutes);
app.use('/api/admin/users', adminRoutes);
app.use('/api/admin/courts', adminCourtRoutes);
app.use('/api/admin/bookings', adminBookingRoutes);  
app.use('/api/bookings', bookingRoutes);
app.use('/api/payments', paymentRoutes);

app.use("/api/courts", courtRoutes);          // courts routes
app.use("/api/courts", slotRoutes);           // slots under /:courtId/slots
app.get('/', (req: Request, res: Response) => {
    return res.status(200).json({ success: "true", message: "Welcome to the API" });
});

async function startServer() {
    await connectDatabase();

    app.listen(
        PORT,
        () => {
            console.log(`Server: http://localhost:${PORT}`);
        }
    );
}

startServer();