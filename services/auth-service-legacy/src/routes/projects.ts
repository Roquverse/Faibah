import { Router } from 'express';
import { db } from '../db';
import { projects } from '../db/schema';
import { eq, and } from 'drizzle-orm';
import { requireAuth, AuthRequest } from '../middleware/auth';

const router = Router();
router.use(requireAuth);

router.get('/', async (req: AuthRequest, res) => {
  const companyId = req.user?.companyId;
  if (!companyId) return res.status(401).json({ error: 'Unauthorized' });

  try {
    const allProjects = await db.query.projects.findMany({
      where: eq(projects.companyId, companyId),
    });
    res.json(allProjects);
  } catch (error) {
    res.status(500).json({ error: 'Failed to fetch projects' });
  }
});

router.post('/', async (req: AuthRequest, res) => {
  const companyId = req.user?.companyId;
  if (!companyId) return res.status(401).json({ error: 'Unauthorized' });

  const { name, clientId } = req.body;
  if (!name) return res.status(400).json({ error: 'Name is required' });

  try {
    const newProject = await db.insert(projects).values({
      companyId,
      clientId,
      name,
    }).returning();
    res.status(201).json(newProject[0]);
  } catch (error) {
    res.status(500).json({ error: 'Failed to create project' });
  }
});

export default router;
