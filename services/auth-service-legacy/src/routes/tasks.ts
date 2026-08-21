import { Router } from 'express';
import { db } from '../db';
import { tasks, projects } from '../db/schema';
import { eq, inArray } from 'drizzle-orm';
import { requireAuth, AuthRequest } from '../middleware/auth';

const router = Router();
router.use(requireAuth);

router.get('/', async (req: AuthRequest, res) => {
  const companyId = req.user?.companyId;
  if (!companyId) return res.status(401).json({ error: 'Unauthorized' });

  try {
    // Find all projects for this company
    const companyProjects = await db.query.projects.findMany({
      where: eq(projects.companyId, companyId),
      columns: { id: true }
    });
    
    if (companyProjects.length === 0) {
      return res.json([]);
    }

    const projectIds = companyProjects.map(p => p.id);
    
    const allTasks = await db.query.tasks.findMany({
      where: inArray(tasks.projectId, projectIds),
    });
    res.json(allTasks);
  } catch (error) {
    res.status(500).json({ error: 'Failed to fetch tasks' });
  }
});

router.post('/', async (req: AuthRequest, res) => {
  const { title, description, projectId, assigneeId } = req.body;
  if (!title || !projectId) {
    return res.status(400).json({ error: 'Title and projectId are required' });
  }

  try {
    const newTask = await db.insert(tasks).values({
      title,
      description,
      projectId,
      assigneeId,
    }).returning();
    res.status(201).json(newTask[0]);
  } catch (error) {
    res.status(500).json({ error: 'Failed to create task' });
  }
});

export default router;
