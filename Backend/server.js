require('dotenv').config();
const express = require('express');
const cors = require('cors');
const mongoose = require('mongoose');
const connectDB = require('./config/db');
const startScheduler = require('./utils/scheduler');

// Connect to MongoDB Atlas
connectDB();

const app = express();

app.use(cors());
app.use(express.json());

// Root route
app.get('/', (req, res) => res.send('API is running...'));


// app.get('/api/test', async (req, res) => {
//   try {
//     // This will check if Mongoose is connected
//     const state = mongoose.connection.readyState; 
//     // 0 = disconnected, 1 = connected, 2 = connecting, 3 = disconnecting
//     if (state === 1) {
//       res.json({ message: '✅ Connected to MongoDB Atlas' });
//     } else {
//       res.json({ message: '⚠️ Not connected to MongoDB Atlas', state });
//     }
//   } catch (err) {
//     res.status(500).json({ message: '❌ Error checking database connection', error: err.message });
//   }
// });

// --- Use API Routes ---
app.use('/api/auth', require('./routes/auth'));
app.use('/api/food', require('./routes/food'));
app.use('/api/notifications', require('./routes/notifications'));
app.use('/api/events', require('./routes/events'));
app.use('/api/ngo', require('./routes/ngo'));
app.use('/api/subscribe', require('./routes/subscribe'));
app.use('/api/volunteers', require('./routes/volunteers'));
app.use('/api/deliveries', require('./routes/deliveries'));
app.use('/api/bookings', require('./routes/bookings'));
app.use('/api/upload', require('./routes/upload'));
app.use('/api/redeem', require('./routes/redeem'));
app.use('/api/leaderboard', require('./routes/leaderboard'));


const PORT = process.env.PORT || 5000;

app.listen(PORT, () => console.log(`Server started on port ${PORT}`));
startScheduler();
