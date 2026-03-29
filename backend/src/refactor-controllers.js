const fs = require('fs');
const path = require('path');
const dir = path.join(__dirname, 'controllers');

const files = fs.readdirSync(dir).filter(f => f.endsWith('.ts'));

files.forEach(file => {
    const filePath = path.join(dir, file);
    let content = fs.readFileSync(filePath, 'utf8');

    // Check if NextFunction is imported from express
    if (content.includes('next: NextFunction') && !content.includes('NextFunction') || (!content.match(/import\s*\{[^}]*NextFunction[^}]*\}\s*from\s*['"]express['"]/))) {
        // Just inject it at the top
        content = "import { NextFunction } from 'express';\n" + content;
    }

    fs.writeFileSync(filePath, content);
});
console.log('Imports fixed.');
