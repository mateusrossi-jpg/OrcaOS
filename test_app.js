import { execSync } from 'child_process';
console.log("Checking for compilation errors...");
try {
  execSync("npx tsc --noEmit", { stdio: "inherit" });
  console.log("No compilation errors found.");
} catch (e) {
  console.error("Compilation errors found.");
  process.exit(1);
}
