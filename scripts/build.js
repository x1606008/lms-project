const { execSync } = require("child_process");
const path = require("path");

if (process.platform === "win32") {
  const tools = path.join(__dirname, "..", "tools");
  const bin = path.join(process.cwd(), "node_modules", ".bin");
  process.env.PATH = tools + path.delimiter + bin + path.delimiter + (process.env.PATH || "");
  console.log("Windows detected — tools added to PATH");
}

function run(cmd) {
  console.log(`\n> ${cmd}`);
  execSync(cmd, { stdio: "inherit", env: process.env });
}

run("node scripts/switch-to-pg.js");
run("npx prisma generate");
run("node scripts/db-push-if-pg.js");
run("next build");
