import express from 'express';
import session from 'express-session';
import passport from 'passport';
import cors from 'cors';
import dotenv from 'dotenv';

import { authRoutes } from './routes';
import { passwordRoutes } from './passwords';

dotenv.config();

const app = express();
const PORT = process.env.PORT || 4000;

app.use(cors({
  origin: 'http://localhost:5173',
  credentials: true,
}));
app.use(express.json());
app.use(session({
  secret: process.env.SESSION_SECRET || 'supersecret',
  resave: false,
  saveUninitialized: false,
  cookie: { 
    secure: false,
    sameSite: 'lax'
  },
}));
app.use(passport.initialize());
app.use(passport.session());

app.use(authRoutes);
app.use('/api/passwords', passwordRoutes);

app.get('/', (req, res) => {
  res.send('SecurePass backend running');
});

app.listen(PORT, () => {
  console.log(`Server listening on http://localhost:${PORT}`);
});