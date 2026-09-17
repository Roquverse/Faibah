const { PrismaClient } = require('@prisma/client');
const prisma = new PrismaClient();
async function main() {
  const project = await prisma.project.findFirst();
  console.log(project?.id);
}
main().catch(console.error).finally(() => prisma.$disconnect());
