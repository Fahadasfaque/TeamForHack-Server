const express = require('express');
const dotenv = require('dotenv');
const cors = require('cors');
const http = require('http');
const { Server } = require('socket.io');
const connectDB = require('./config/db');

dotenv.config();

connectDB();

const app = express();
const server = http.createServer(app);
const io = new Server(server, {
    cors: {
        origin: 'http://localhost:5174',
        methods: ['GET', 'POST'],
    },
});

app.use(cors());
app.use(express.json());

// Make io instance available to routes
app.set('io', io);

app.use('/api/auth', require('./routes/authRoutes'));
app.use('/api/users', require('./routes/userRoutes'));
app.use('/api/teams', require('./routes/teamRoutes'));
app.use('/api/tasks', require('./routes/taskRoutes'));
app.use('/api/stream', require('./routes/streamRoutes'));
app.use('/api/hackathons', require('./routes/hackathonRoutes'));
app.use('/api/posts', require('./routes/postRoutes'));
app.use('/api/feed', require('./routes/feedRoutes'));
app.use('/api/follow', require('./routes/followRoutes'));
app.use('/api/notifications', require('./routes/notificationRoutes'));
app.use('/api/upload', require('./routes/uploadRoutes'));
app.use('/api/reels', require('./routes/reelRoutes'));
app.use('/api/projects', require('./routes/projectRoutes'));
app.use('/api/achievements', require('./routes/achievementRoutes'));
app.use('/api/skills', require('./routes/skillRoutes'));

app.get('/', (req, res) => {
    res.send('API is running...');
});

// Socket.io for real-time updates
io.on('connection', (socket) => {
    console.log('User connected:', socket.id);

    // Join team room
    socket.on('join-team', (teamId) => {
        socket.join(teamId);
        console.log(`User ${socket.id} joined team ${teamId}`);
    });

    // Task updates
    socket.on('task-update', (data) => {
        io.to(data.teamId).emit('task-updated', data.task);
    });

    socket.on('disconnect', () => {
        console.log('User disconnected:', socket.id);
    });
});

const PORT = process.env.PORT || 5000;

server.listen(PORT, () => {
    console.log(`Server running on port ${PORT}`);
});
