const fs = require('fs');
const path = require('path');

// Создаем директорию dist/database если её нет
const distDbDir = path.join(__dirname, '..', 'dist', 'database');
if (!fs.existsSync(distDbDir)) {
    fs.mkdirSync(distDbDir, { recursive: true });
}

// Копируем schema.sql
const srcSchema = path.join(__dirname, '..', 'src', 'database', 'schema.sql');
const distSchema = path.join(distDbDir, 'schema.sql');

fs.copyFileSync(srcSchema, distSchema);
console.log('✓ Copied schema.sql to dist/database/');
