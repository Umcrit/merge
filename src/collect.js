const fs = require('fs');
const path = require('path');

const out = fs.createWriteStream('review.txt');
const IGNORE_DIRS = ['node_modules', '.git', 'dist', 'build', 'assets', 'public'];

function readDir(dir) {
    const files = fs.readdirSync(dir);
    for (const file of files) {
        const fullPath = path.join(dir, file);
        const stat = fs.statSync(fullPath);
        
        if (stat.isDirectory()) {
            if (!IGNORE_DIRS.includes(file)) readDir(fullPath);
        } else if (/\.(js|ts|jsx|tsx|html|css|json)$/.test(file)) {
            out.write(`\n\n// =========================================\n`);
            out.write(`// FILE: ${fullPath.replace(/\\/g, '/')}\n`);
            out.write(`// =========================================\n\n`);
            out.write(fs.readFileSync(fullPath, 'utf8'));
        }
    }
}

readDir('.'); // Укажи папку, где лежит твой код (например, './src' или '.')
out.end();
console.log('Готово! Файл review.txt создан.');
