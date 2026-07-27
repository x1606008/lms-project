const fs = require('fs');
const path = require('path');

const schemaPath = path.join(__dirname, '..', 'prisma', 'schema.prisma');
let schema = fs.readFileSync(schemaPath, 'utf-8');

schema = schema.replace(
  /provider\s*=\s*"[^"]+"/,
  'provider = "postgresql"'
);

fs.writeFileSync(schemaPath, schema, 'utf-8');
console.log('Schema switched to PostgreSQL');
