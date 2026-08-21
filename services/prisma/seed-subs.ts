import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

async function main() {
  const company = await prisma.company.findFirst();
  if (!company) {
    console.log('No company found, run standard seed first or load dashboard to auto-create.');
    return;
  }
  const companyId = company.id;

  let client = await prisma.client.findFirst({ where: { companyId } });
  if (!client) {
    client = await prisma.client.create({
      data: {
        name: 'Acme Corp',
        companyId,
      }
    });
  }
  const clientId = client.id;

  console.log(`Seeding subscriptions and reminders for company ${companyId}...`);

  // Clear existing
  await prisma.subscription.deleteMany({ where: { companyId } });
  await prisma.reminder.deleteMany({ where: { companyId } });

  // Seed Subscriptions
  await prisma.subscription.createMany({
    data: [
      {
        name: 'Cloud Hosting',
        invoiceRef: 'INV-092',
        amount: 120000,
        frequency: 'MONTHLY',
        nextBillingDate: new Date(new Date().getTime() + 4 * 24 * 60 * 60 * 1000), // 4 days from now
        status: 'ACTIVE',
        clientId,
        companyId,
      },
      {
        name: 'Maintenance Retainer',
        invoiceRef: null,
        amount: 450000,
        frequency: 'YEARLY',
        nextBillingDate: new Date(new Date().getTime() + 12 * 24 * 60 * 60 * 1000), // 12 days
        status: 'ACTIVE',
        clientId,
        companyId,
      },
      {
        name: 'SEO Package',
        invoiceRef: null,
        amount: 850000,
        frequency: 'MONTHLY',
        nextBillingDate: new Date(new Date().getTime() + 15 * 24 * 60 * 60 * 1000), // 15 days
        status: 'ACTIVE',
        clientId,
        companyId,
      }
    ]
  });

  // Seed Reminders
  await prisma.reminder.createMany({
    data: [
      {
        title: 'Follow-Ups',
        description: '15 leads need follow up',
        iconType: 'users',
        companyId,
      },
      {
        title: 'Visits',
        description: '2 Properties and 3 Leads',
        iconType: 'map-pin',
        companyId,
      }
    ]
  });

  console.log('Seeding complete!');
}

main()
  .catch((e) => {
    console.error(e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
