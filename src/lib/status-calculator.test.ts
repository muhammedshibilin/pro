import { 
  calculateEmployeeQidStatus, 
  calculateCompanyDocumentStatus 
} from './status-calculator';

function assert(condition: boolean, message: string) {
  if (!condition) {
    console.error(`❌ FAILED: ${message}`);
    process.exit(1);
  } else {
    console.log(`✅ PASSED: ${message}`);
  }
}

const refDate = new Date('2026-08-15T00:00:00.000Z');

console.log('\n--- TESTING EMPLOYEE QID STATUS ---');
// 1. Before expiry -> SAFE (GREEN)
assert(
  calculateEmployeeQidStatus('2026-09-01', refDate) === 'SAFE',
  'Employee with future expiry (2026-09-01) is SAFE (GREEN)'
);
assert(
  calculateEmployeeQidStatus('2026-08-15', refDate) === 'SAFE',
  'Employee on expiry date (2026-08-15) is SAFE (GREEN)'
);

// 2. 1st month expired -> MONTH_1_EXPIRED (BLACK)
assert(
  calculateEmployeeQidStatus('2026-08-01', refDate) === 'MONTH_1_EXPIRED',
  'Employee expired 14 days ago (2026-08-01) is MONTH_1_EXPIRED (BLACK)'
);
assert(
  calculateEmployeeQidStatus('2026-07-15', refDate) === 'MONTH_1_EXPIRED',
  'Employee expired exactly 1 month ago (2026-07-15) is MONTH_1_EXPIRED (BLACK)'
);

// 3. 2nd month expired -> MONTH_2_EXPIRED (YELLOW)
assert(
  calculateEmployeeQidStatus('2026-07-01', refDate) === 'MONTH_2_EXPIRED',
  'Employee expired 1.5 months ago (2026-07-01) is MONTH_2_EXPIRED (YELLOW)'
);
assert(
  calculateEmployeeQidStatus('2026-06-15', refDate) === 'MONTH_2_EXPIRED',
  'Employee expired exactly 2 months ago (2026-06-15) is MONTH_2_EXPIRED (YELLOW)'
);

// 4. 3rd month expired -> MONTH_3_EXPIRED (RED)
assert(
  calculateEmployeeQidStatus('2026-06-01', refDate) === 'MONTH_3_EXPIRED',
  'Employee expired 2.5 months ago (2026-06-01) is MONTH_3_EXPIRED (RED)'
);
assert(
  calculateEmployeeQidStatus('2026-05-15', refDate) === 'MONTH_3_EXPIRED',
  'Employee expired exactly 3 months ago (2026-05-15) is MONTH_3_EXPIRED (RED)'
);

// 5. After 3 months -> FULLY_EXPIRED
assert(
  calculateEmployeeQidStatus('2026-05-01', refDate) === 'FULLY_EXPIRED',
  'Employee expired 3.5 months ago (2026-05-01) is FULLY_EXPIRED'
);
assert(
  calculateEmployeeQidStatus('2026-01-01', refDate) === 'FULLY_EXPIRED',
  'Employee expired 7.5 months ago (2026-01-01) is FULLY_EXPIRED'
);

console.log('\n--- TESTING COMPANY DOCUMENT STATUS ---');
// 1. 3+ months remaining -> SAFE (GREEN)
assert(
  calculateCompanyDocumentStatus('2026-11-20', refDate) === 'SAFE',
  'Company document expiring in 3+ months (2026-11-20) is SAFE (GREEN)'
);
assert(
  calculateCompanyDocumentStatus('2026-10-16', refDate) === 'SAFE',
  'Company document expiring in 2 months + 1 day (2026-10-16) is SAFE (GREEN)'
);

// 2. 2 months remaining -> WARNING (YELLOW)
assert(
  calculateCompanyDocumentStatus('2026-10-15', refDate) === 'WARNING',
  'Company document expiring in exactly 2 months (2026-10-15) is WARNING (YELLOW)'
);
assert(
  calculateCompanyDocumentStatus('2026-09-20', refDate) === 'WARNING',
  'Company document expiring in 1 month + 5 days (2026-09-20) is WARNING (YELLOW)'
);

// 3. 1 month remaining -> DANGER (RED)
assert(
  calculateCompanyDocumentStatus('2026-09-15', refDate) === 'DANGER',
  'Company document expiring in exactly 1 month (2026-09-15) is DANGER (RED)'
);
assert(
  calculateCompanyDocumentStatus('2026-08-25', refDate) === 'DANGER',
  'Company document expiring in 10 days (2026-08-25) is DANGER (RED)'
);

// 4. Expired -> DANGER (RED)
assert(
  calculateCompanyDocumentStatus('2026-08-10', refDate) === 'DANGER',
  'Company document expired 5 days ago (2026-08-10) is DANGER (RED)'
);
assert(
  calculateCompanyDocumentStatus('2026-01-01', refDate) === 'DANGER',
  'Company document expired 7 months ago (2026-01-01) is DANGER (RED)'
);

console.log('\n✨ ALL STATUS CALCULATION TESTS PASSED PERFECTLY!\n');
