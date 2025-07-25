import { Router, Request, Response, NextFunction } from 'express';
import { PrismaClient } from './generated/prisma';

const prisma = new PrismaClient();
const router = Router();

function requireAuth(req: Request, res: Response, next: NextFunction) {
  if (req.isAuthenticated && req.isAuthenticated() && req.user) {
    return next();
  }
  res.status(401).json({ error: 'Not authenticated' });
}

router.get('/', requireAuth, async (req: any, res) => {
  const userId = req.user.id;
  const passwords = await prisma.password.findMany({ where: { userId } });
  res.json(passwords);
});

router.post('/', requireAuth, async (req: any, res) => {
  const userId = req.user.id;
  const { website, username, password, notes } = req.body;
  const newPassword = await prisma.password.create({
    data: { website, username, password, notes, userId },
  });
  res.json(newPassword);
});

router.put('/:id', requireAuth, async (req: any, res) => {
  const userId = req.user.id;
  const { id } = req.params;
  const { website, username, password, notes } = req.body;
  const updated = await prisma.password.updateMany({
    where: { id, userId },
    data: { website, username, password, notes },
  });
  res.json(updated);
});

router.delete('/:id', requireAuth, async (req: any, res) => {
  const userId = req.user.id;
  const { id } = req.params;
  await prisma.password.deleteMany({ where: { id, userId } });
  res.json({ success: true });
});

export const authRoutes = router; // in routes.ts
export const passwordRoutes = router; // in passwords.ts