import { PrismaClient } from '@prisma/client';

async function testConn() {
  const prisma = new PrismaClient({
    datasources: {
      db: {
        url: process.env.DATABASE_URL + (process.env.DATABASE_URL?.includes('?') ? '&' : '?') + 'connect_timeout=30',
      },
    },
  });

  try {
    console.log('Connecting to Neon PostgreSQL...');
    await prisma.$connect();
    console.log('Connected! Cleaning records...');
    const delRenewals = await prisma.renewalHistory.deleteMany();
    const delDocs = await prisma.companyDocument.deleteMany();
    const delEmployees = await prisma.employee.deleteMany();
    const delCompanies = await prisma.company.deleteMany();
    console.log(`✅ Success! Deleted ${delRenewals.count} renewals, ${delDocs.count} docs, ${delEmployees.count} employees, ${delCompanies.count} companies.`);
  } catch (err) {
    console.error('Connection test error:', err);
  } finally {
    await prisma.$disconnect();
  }
}

testConn();
