import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

async function main() {
  const company = await prisma.company.findFirst();
  if (!company) {
    console.log('No company found.');
    return;
  }

  let client = await prisma.client.findFirst({ where: { companyId: company.id } });
  if (!client) {
    client = await prisma.client.create({
      data: {
        name: 'Acme Corp',
        companyId: company.id,
      }
    });
  }

  let project = await prisma.project.findFirst({ where: { clientId: client.id } });
  if (!project) {
    project = await prisma.project.create({
      data: {
        name: 'Website Redesign',
        clientId: client.id,
        currency: 'NGN',
      }
    });
  }

  console.log(`Seeding schedule mockups for project ${project.id}...`);

  // Seed Invoice (INV-0042)
  await prisma.invoice.create({
    data: {
      invoiceRef: 'INV-0042',
      status: 'SENT',
      dueDate: new Date(new Date().getTime() + 12 * 24 * 60 * 60 * 1000), // 12 days
      projectId: project.id,
      clientId: client.id,
      items: {
        create: [
          {
            description: 'Website MVP',
            amount: 1500000,
          }
        ]
      }
    }
  });

  // Seed Task (Website MVP Milestone)
  await prisma.task.create({
    data: {
      title: 'Website MVP Milestone',
      status: 'TODO',
      dueDate: new Date(new Date().getTime() + 15 * 24 * 60 * 60 * 1000), // 15 days
      projectId: project.id,
    }
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
