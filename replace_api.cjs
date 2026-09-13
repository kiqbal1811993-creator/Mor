const fs = require('fs');
const path = require('path');

const srcDir = path.join(__dirname, 'src');

function findAndReplace(dir) {
    const files = fs.readdirSync(dir);
    for (const file of files) {
        const fullPath = path.join(dir, file);
        if (fs.statSync(fullPath).isDirectory()) {
            findAndReplace(fullPath);
        } else if (fullPath.endsWith('.jsx')) {
            let content = fs.readFileSync(fullPath, 'utf8');
            if (content.includes('http://localhost:5000/api')) {
                console.log(`Processing ${fullPath}`);
                
                // Determine relative path to config.js
                const depth = fullPath.split(path.sep).length - srcDir.split(path.sep).length;
                let prefix = depth === 1 ? './' : '../'.repeat(depth - 1);
                
                // Add import if not present
                if (!content.includes('import { API_URL }')) {
                    content = `import { API_URL } from '${prefix}config';\n` + content;
                }
                
                // Replace 'http://localhost:5000/api/something' -> `${API_URL}/something`
                content = content.replace(/'http:\/\/localhost:5000\/api([^']*)'/g, '`${API_URL}$1`');
                content = content.replace(/"http:\/\/localhost:5000\/api([^"]*)"/g, '`${API_URL}$1`');
                content = content.replace(/`http:\/\/localhost:5000\/api([^`]*)`/g, '`${API_URL}$1`');
                
                fs.writeFileSync(fullPath, content, 'utf8');
            }
        }
    }
}

findAndReplace(srcDir);
console.log("Done");
