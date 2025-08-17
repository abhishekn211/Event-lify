// index.js (Backend)
import express from 'express';
import { createServer } from "http";
import { Server } from "socket.io";
import dotenv from 'dotenv';
import mongoose from 'mongoose';
import cors from 'cors';
import cookieParser from 'cookie-parser';
import userRoutes from './routes/userroutes.js';
import eventRoutes from './routes/eventroutes.js';
import Event from "./model/event.model.js"; // Import the Event model


dotenv.config();
const app = express();
const port=process.env.PORT || 3000;
const httpServer = createServer(app);

app.use(cors({
  origin: ['https://eventlify.onrender.com', 'http://localhost:5173'],
  credentials: true,
}));

app.options('*', cors());

const io = new Server(httpServer, {
  cors: {
    origin: ['https://eventlify.onrender.com', 'http://localhost:5173'],
    methods: ["GET", "POST"],
    credentials: true,
  }
});

// Socket management
io.on("connection", (socket) => {
  console.log(`Client connected: ${socket.id}`);

  // "subscribeAttendance": Client requests current liveCount without joining.
  socket.on("subscribeAttendance", async (eventId, callback) => {
    try {
      const eventDoc = await Event.findById(eventId);
      const count = eventDoc ? eventDoc.liveCount : 0;
      if (callback) callback({ eventId, attendance: count });
    } catch (err) {
      console.error("Error in subscribeAttendance:", err);
      if (callback) callback({ eventId, attendance: 0 });
    }
  });

  // When a user actively joins the live event.
  socket.on("joinEventRoom", async (eventId) => {
    socket.join(eventId);
    try {
      const eventDoc = await Event.findByIdAndUpdate(
        eventId,
        { $inc: { liveCount: 1 } },
        { new: true }
      );
      // Broadcast the updated liveCount to all clients.
      io.emit("attendanceUpdate", { eventId, attendance: eventDoc.liveCount });
    } catch (err) {
      console.error("Error in joinEventRoom:", err);
    }
  });

  // When a user actively leaves the live event.
  socket.on("leaveEventRoom", async (eventId) => {
    socket.leave(eventId);
    try {
      const eventDoc = await Event.findByIdAndUpdate(
        eventId,
        { $inc: { liveCount: -1 } },
        { new: true }
      );
      io.emit("attendanceUpdate", { eventId, attendance: eventDoc.liveCount });
    } catch (err) {
      console.error("Error in leaveEventRoom:", err);
    }
  });

  socket.on("disconnect", () => {
    console.log(`Client disconnected: ${socket.id}`);
  });
});



app.use(cookieParser(process.env.COOKIE_SECRET));
app.use(express.static('public'));
app.use(express.json({ strict: false }));

app.use(express.urlencoded({ extended: true }));


const URI = process.env.MongoDBURI;
const clientOptions = { serverApi: { version: '1', strict: true, deprecationErrors: true } };

mongoose.connect(URI, clientOptions)
  .then(() => console.log("Connected to MongoDB!"))
  .catch(err => console.error("MongoDB connection error:", err));

app.use('/api/users', userRoutes);
app.use('/api/event', eventRoutes);

httpServer.listen(3000, () => {
  console.log(`listening on ${port}`);
});
