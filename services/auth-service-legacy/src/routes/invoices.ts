import { Router } from 'express';
import { db } from '../db';
import { invoices, invoiceItems } from '../db/schema';
import { eq } from 'drizzle-orm';
import { requireAuth, AuthRequest } from '../middleware/auth';

const router = Router();
router.use(requireAuth);

router.get('/', async (req: AuthRequest, res) => {
  const companyId = req.user?.companyId;
  if (!companyId) return res.status(401).json({ error: 'Unauthorized' });

  try {
    const allInvoices = await db.query.invoices.findMany({
      where: eq(invoices.companyId, companyId),
      with: {
        // We'd need to set up relations in schema.ts to use `with`, 
        // but for now we just return the flat invoice data
      }
    });
    res.json(allInvoices);
  } catch (error) {
    res.status(500).json({ error: 'Failed to fetch invoices' });
  }
});

router.post('/', async (req: AuthRequest, res) => {
  const companyId = req.user?.companyId;
  if (!companyId) return res.status(401).json({ error: 'Unauthorized' });

  const { clientId, amount, dueDate, items } = req.body;
  if (!clientId) {
    return res.status(400).json({ error: 'clientId is required' });
  }

  try {
    // Basic transaction concept: create invoice, then items
    const newInvoice = await db.insert(invoices).values({
      companyId,
      clientId,
      amount: amount || '0.00',
      dueDate: dueDate ? new Date(dueDate) : null,
    }).returning();

    const invoiceId = newInvoice[0].id;

    if (items && Array.isArray(items) && items.length > 0) {
      const itemsToInsert = items.map((item: any) => ({
        invoiceId,
        description: item.description,
        quantity: item.quantity || '1.00',
        unitPrice: item.unitPrice,
      }));
      await db.insert(invoiceItems).values(itemsToInsert);
    }

    res.status(201).json(newInvoice[0]);
  } catch (error) {
    res.status(500).json({ error: 'Failed to create invoice' });
  }
});

export default router;
