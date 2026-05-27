sed -i 's/AferixLocalBackup, //g' src/features/settings/components/LocalBackupWorkspace.tsx
sed -i 's/ SecondaryButton,//g' src/features/settings/components/LocalBackupWorkspace.tsx
sed -i 's/ DangerButton //g' src/features/settings/components/LocalBackupWorkspace.tsx
sed -i 's/ includeLinkedSettings,//g' src/features/settings/components/LocalBackupWorkspace.tsx
sed -i 's/const summary = /const _summary = /g' src/features/settings/components/LocalBackupWorkspace.tsx
sed -i 's/const currentDataSummary = /const _currentDataSummary = /g' src/features/settings/components/LocalBackupWorkspace.tsx
sed -i 's/(err)/( _err )/g' src/features/settings/components/LocalBackupWorkspace.tsx

sed -i 's/ PrimaryButton,//g' src/pages/BudgetHistoryPage.tsx
sed -i 's/ onNewBudget,//g' src/pages/BudgetHistoryPage.tsx

npm run test
