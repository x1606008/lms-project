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

const dbUrl = process.env.DATABASE_URL || "";
const isPostgres = dbUrl.startsWith("postgresql://") || dbUrl.startsWith("postgres://");

if (process.env.NODE_ENV === "production" && !isPostgres) {
  console.error(
    "ERROR: DATABASE_URL (PostgreSQL) is required for a production build.\n" +
    "Set the DATABASE_URL environment variable in the hosting platform (Vercel/Render) and redeploy."
  );
  process.exit(1);
}

run("node scripts/switch-to-pg.js");
run("npx prisma generate");
run("node scripts/db-push-if-pg.js");
run("next build");
