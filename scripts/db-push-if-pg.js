const { execSync } = require('child_process');
const dbUrl = process.env.DATABASE_URL || '';
const isPostgres = dbUrl.startsWith('postgresql://') || dbUrl.startsWith('postgres://');

if (isPostgres) {
  console.log('Pushing schema to PostgreSQL...');
  execSync('npx prisma db push --skip-generate', { stdio: 'inherit' });
} else {
  console.log('Local dev — skipping db push');
}
