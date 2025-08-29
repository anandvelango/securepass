import { Router } from 'express';
import passport from './auth';

const router = Router();

router.get('/auth/google', passport.authenticate('google', { scope: ['profile', 'email'] }));

router.get(
  '/auth/google/callback',
  passport.authenticate('google', {
    failureRedirect: '/login',
    session: true,
  }),
  (req, res) => {
    res.redirect('http://localhost:5173');
  }
);

router.get('/auth/logout', (req, res) => {
  req.logout(() => {
    res.json({ success: true });
  });
});

router.get('/auth/user', (req, res) => {
  if (req.isAuthenticated()) {
    res.json(req.user);
  } else {
    res.json(null);
  }
});

export const authRoutes = router; // in routes.ts
export const passwordRoutes = router; // in passwords.ts