/* eslint-disable @typescript-eslint/no-require-imports */
const fs = require('fs');
const files = [
  'src/app/revenueFlowSimulation.test.ts',
  'src/core/database/offlineResilience.test.ts',
  'src/core/pricing/budgetValidation.test.ts',
  'src/features/budgets/__tests__/budget-calculation.test.ts',
  'src/features/finance/components/financialCycleAdjustment.test.ts',
  'src/features/clients/storage/clientWorkOrderStorage.test.ts'
];

for (const file of files) {
  if (fs.existsSync(file)) {
    let content = fs.readFileSync(file, 'utf8');
    content = content.replace(/clientId: '([^']+)',/g, "clientId: '$1',\n      siteId: 'site-1',");
    content = content.replace(/id: '([^']+)',\n\s*title:/g, "id: '$1',\n      siteId: 'site-1',\n      title:"); 
    fs.writeFileSync(file, content);
  }
}
