import dotenv from 'dotenv';
dotenv.config();

import express from 'express';
import cors from 'cors';
import connectDB from './config/db';
import authRoutes from './routes/authRoutes';
import conversationRoutes from './routes/conversationRoutes';
import interviewRoutes from './routes/interviewRoutes';
import dashboardRoutes from './routes/dashboardRoutes';
import analyticsRoutes from './routes/analyticsRoutes';
import resumeRoutes from './routes/resumeRoutes';
import careerRoutes from './routes/careerRoutes';
import codingRoutes from './routes/codingRoutes';
import dailyRoutes from './routes/dailyRoutes';
import flashcardRoutes from './routes/flashcardRoutes';
import bookmarkRoutes from './routes/bookmarkRoutes';
import settingsRoutes from './routes/settingsRoutes';

const app = express();
const PORT = process.env.PORT || 5000;

connectDB();

app.use(cors());
app.use(express.json());

app.use('/api/auth', authRoutes);
app.use('/api/conversations', conversationRoutes);
app.use('/api/interviews', interviewRoutes);
app.use('/api/dashboard', dashboardRoutes);
app.use('/api/analytics', analyticsRoutes);
app.use('/api/resume', resumeRoutes);
app.use('/api/career', careerRoutes);
app.use('/api/coding', codingRoutes);
app.use('/api/daily', dailyRoutes);
app.use('/api/flashcards', flashcardRoutes);
app.use('/api/bookmarks', bookmarkRoutes);
app.use('/api/settings', settingsRoutes);

app.get('/', (req, res) => {
  res.json({ message: 'AI Interview Assistant API is running' });
});

app.listen(PORT, () => {
  console.log(`Server running on port ${PORT}`);
});