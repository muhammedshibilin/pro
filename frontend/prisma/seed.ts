import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

function addDays(date: Date, days: number): Date {
  const result = new Date(date);
  result.setDate(result.getDate() + days);
  return result;
}

async function main() {
  console.log('Clearing existing records...');
  await prisma.renewalHistory.deleteMany();
  await prisma.companyDocument.deleteMany();
  await prisma.employee.deleteMany();
  await prisma.company.deleteMany();

  const today = new Date();

  console.log('Seeding companies with CR and License details...');
  const cyberdyne = await prisma.company.create({
    data: {
      companyName: 'Cyberdyne Systems Corporation',
      crNumber: 'CR-992014-QA',
      crExpiry: addDays(today, 18), // Expiring in 18 days
      crPhoto: 'https://images.unsplash.com/photo-1554224155-8d04cb21cd6c?auto=format&fit=crop&w=800&q=80',
      licenseNumber: 'TL-883920-IND',
      licenseExpiry: addDays(today, 240),
      licensePhoto: 'https://images.unsplash.com/photo-1450133064473-71024230f91b?auto=format&fit=crop&w=800&q=80',
      ownerName: 'Miles Dyson',
      phone: '+974 4411 2233',
      email: 'contact@cyberdyne.com',
      notes: 'Leading developer of advanced micro-processors and automated systems.',
      status: 'Active',
    },
  });

  const apex = await prisma.company.create({
    data: {
      companyName: 'Apex Logistics & Freight LLC',
      crNumber: 'CR-774411-QA',
      crExpiry: addDays(today, -6), // Expired 6 days ago
      crPhoto: 'https://images.unsplash.com/photo-1568992687947-868a62a9f521?auto=format&fit=crop&w=800&q=80',
      licenseNumber: 'TL-441122-LOG',
      licenseExpiry: addDays(today, 15), // Expiring in 15 days
      licensePhoto: 'https://images.unsplash.com/photo-1586528116311-ad8dd3c8310d?auto=format&fit=crop&w=800&q=80',
      ownerName: 'Sarah Jenkins',
      phone: '+974 4455 6677',
      email: 'operations@apexlogistics.qa',
      notes: 'Regional cargo, supply chain management, and customs clearance provider.',
      status: 'Active',
    },
  });

  const oasis = await prisma.company.create({
    data: {
      companyName: 'Oasis Real Estate & Hospitality',
      crNumber: 'CR-558833-QA',
      crExpiry: addDays(today, 400),
      crPhoto: 'https://images.unsplash.com/photo-1577495508048-b635879837f1?auto=format&fit=crop&w=800&q=80',
      licenseNumber: 'TL-558899-HOS',
      licenseExpiry: addDays(today, 90),
      licensePhoto: 'https://images.unsplash.com/photo-1560518883-ce09059eeffa?auto=format&fit=crop&w=800&q=80',
      ownerName: 'Tariq Al-Mansoor',
      phone: '+974 4488 9900',
      email: 'info@oasisgroup.qa',
      notes: 'Commercial leasing, facilities management, and luxury hospitality operations.',
      status: 'Active',
    },
  });

  console.log('Seeding employees with contacts, QID, and Passport photos...');
  await prisma.employee.createMany({
    data: [
      {
        employeeName: 'Miles Dyson',
        companyId: cyberdyne.id,
        phone: '+974 5511 2233',
        nativeRelativePhone: '+1 415 555 0192 (Spouse - Tarissa Dyson)',
        qidNumber: '26012345678',
        qidExpiry: addDays(today, -15), // Expired QID
        qidPhoto: 'https://images.unsplash.com/photo-1589330694653-ded6df03f754?auto=format&fit=crop&w=800&q=80',
        passportNumber: 'USA-99881122',
        passportExpiry: addDays(today, 320), // Valid passport
        passportPhoto: 'https://images.unsplash.com/photo-1544717305-2782549b5136?auto=format&fit=crop&w=800&q=80',
        employeeCode: 'EMP-001',
        notes: 'Chief Technology Director, Advanced Computing Division.',
        status: 'Active',
      },
      {
        employeeName: 'Dr. Peter Silberman',
        companyId: cyberdyne.id,
        phone: '+974 6622 3344',
        nativeRelativePhone: '+1 212 555 0147 (Brother - James Silberman)',
        qidNumber: '27098765432',
        qidExpiry: addDays(today, 6), // Expiring in 6 days
        qidPhoto: 'https://images.unsplash.com/photo-1618005182384-a83a8bd57fbe?auto=format&fit=crop&w=800&q=80',
        passportNumber: 'USA-44332211',
        passportExpiry: addDays(today, 12), // Expiring passport!
        passportPhoto: 'https://images.unsplash.com/photo-1544717305-2782549b5136?auto=format&fit=crop&w=800&q=80',
        employeeCode: 'EMP-002',
        notes: 'Occupational Health and Systems Consultant.',
        status: 'Active',
      },
      {
        employeeName: 'Marcus Wright',
        companyId: cyberdyne.id,
        phone: '+974 7733 4455',
        nativeRelativePhone: '+61 2 9876 5432 (Mother - Elena Wright)',
        qidNumber: '28567891234',
        qidExpiry: addDays(today, 22), // Expiring in 22 days
        qidPhoto: 'https://images.unsplash.com/photo-1589330694653-ded6df03f754?auto=format&fit=crop&w=800&q=80',
        passportNumber: 'AUS-77112233',
        passportExpiry: addDays(today, 550),
        passportPhoto: 'https://images.unsplash.com/photo-1544717305-2782549b5136?auto=format&fit=crop&w=800&q=80',
        employeeCode: 'EMP-003',
        notes: 'Lead Field Engineer.',
        status: 'Active',
      },
      {
        employeeName: 'Sarah Jenkins',
        companyId: apex.id,
        phone: '+974 5544 3322',
        nativeRelativePhone: '+44 20 7946 0912 (Father - Arthur Jenkins)',
        qidNumber: '28234567890',
        qidExpiry: addDays(today, 180),
        qidPhoto: 'https://images.unsplash.com/photo-1618005182384-a83a8bd57fbe?auto=format&fit=crop&w=800&q=80',
        passportNumber: 'GBR-88990011',
        passportExpiry: addDays(today, -8), // Expired Passport!
        passportPhoto: 'https://images.unsplash.com/photo-1544717305-2782549b5136?auto=format&fit=crop&w=800&q=80',
        employeeCode: 'EMP-004',
        notes: 'Director of Freight Logistics and Operations.',
        status: 'Active',
      },
      {
        employeeName: 'Ahmed Al-Subaey',
        companyId: apex.id,
        phone: '+974 3322 1100',
        nativeRelativePhone: '+966 11 234 5678 (Brother - Khalid Al-Subaey)',
        qidNumber: '29011223344',
        qidExpiry: addDays(today, 14), // Expiring in 14 days
        qidPhoto: 'https://images.unsplash.com/photo-1589330694653-ded6df03f754?auto=format&fit=crop&w=800&q=80',
        passportNumber: 'QAT-11223344',
        passportExpiry: addDays(today, 400),
        passportPhoto: 'https://images.unsplash.com/photo-1544717305-2782549b5136?auto=format&fit=crop&w=800&q=80',
        employeeCode: 'EMP-005',
        notes: 'Senior Customs Liaison and Broker.',
        status: 'Active',
      },
      {
        employeeName: 'Elena Rostova',
        companyId: apex.id,
        phone: '+974 7788 9900',
        nativeRelativePhone: '+7 495 123 4567 (Mother - Olga Rostova)',
        qidNumber: '29455667788',
        qidExpiry: addDays(today, 300),
        qidPhoto: 'https://images.unsplash.com/photo-1618005182384-a83a8bd57fbe?auto=format&fit=crop&w=800&q=80',
        passportNumber: 'RUS-55667788',
        passportExpiry: addDays(today, 25), // Expiring in 25 days
        passportPhoto: 'https://images.unsplash.com/photo-1544717305-2782549b5136?auto=format&fit=crop&w=800&q=80',
        employeeCode: 'EMP-006',
        notes: 'Supply Chain Operations Lead.',
        status: 'Active',
      },
      {
        employeeName: 'Fatima Al-Kuwari',
        companyId: oasis.id,
        phone: '+974 6600 1122',
        nativeRelativePhone: '+974 5500 9988 (Father - Nasser Al-Kuwari)',
        qidNumber: '29233445566',
        qidExpiry: addDays(today, 90),
        qidPhoto: 'https://images.unsplash.com/photo-1589330694653-ded6df03f754?auto=format&fit=crop&w=800&q=80',
        passportNumber: 'QAT-99887766',
        passportExpiry: addDays(today, 600),
        passportPhoto: 'https://images.unsplash.com/photo-1544717305-2782549b5136?auto=format&fit=crop&w=800&q=80',
        employeeCode: 'EMP-007',
        notes: 'Executive General Manager, Hospitality & Real Estate.',
        status: 'Active',
      },
      {
        employeeName: 'Johnathan Archer',
        companyId: oasis.id,
        phone: '+974 5577 8899',
        nativeRelativePhone: '+1 312 555 0199 (Sister - Clara Archer)',
        qidNumber: '28799887766',
        qidExpiry: addDays(today, -3), // Expired QID
        qidPhoto: 'https://images.unsplash.com/photo-1618005182384-a83a8bd57fbe?auto=format&fit=crop&w=800&q=80',
        passportNumber: 'USA-22334455',
        passportExpiry: addDays(today, 300),
        passportPhoto: 'https://images.unsplash.com/photo-1544717305-2782549b5136?auto=format&fit=crop&w=800&q=80',
        employeeCode: 'EMP-008',
        notes: 'Property Facilities Director.',
        status: 'Active',
      },
    ],
  });

  console.log('Seeding company documents...');
  const crDoc = await prisma.companyDocument.create({
    data: {
      companyId: cyberdyne.id,
      documentType: 'Commercial Registration (CR)',
      documentNumber: 'CR-CY-887766',
      expiryDate: addDays(today, 25),
      attachment: '/uploads/sample-cr.pdf',
      notes: 'Ministry of Commerce & Industry registered Commercial Record.',
    },
  });

  await prisma.companyDocument.create({
    data: {
      companyId: cyberdyne.id,
      documentType: 'Establishment Computer Card',
      documentNumber: 'EC-CY-998811',
      expiryDate: addDays(today, 150),
      attachment: '/uploads/sample-establishment-card.pdf',
      notes: 'Immigration & Ministry of Interior authorization card.',
    },
  });

  await prisma.companyDocument.create({
    data: {
      companyId: apex.id,
      documentType: 'Municipality Trade License',
      documentNumber: 'TL-AP-443322',
      expiryDate: addDays(today, -10),
      attachment: '/uploads/sample-trade-license.pdf',
      notes: 'Primary municipal operational permit.',
    },
  });

  await prisma.renewalHistory.create({
    data: {
      documentId: crDoc.id,
      previousExpiryDate: addDays(today, -340),
      newExpiryDate: addDays(today, 25),
      status: 'COMPLETED',
      notes: 'Standard annual Ministry of Commerce renewal processed.',
      renewedBy: 'Admin System',
    },
  });

  console.log('✅ Database seeded with Contacts, QID & Passport photos successfully!');
}

main()
  .catch((e) => {
    console.error(e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
