const fs = require('fs');
const path = require('path');

const targetDirs = ['app', 'components', 'hooks', 'lib', 'styles'];
const extensions = ['.ts', '.tsx', '.js', '.jsx', '.css'];

function getAllFiles(dirPath, arrayOfFiles) {
  if (!fs.existsSync(dirPath)) return arrayOfFiles || [];
  const files = fs.readdirSync(dirPath);
  arrayOfFiles = arrayOfFiles || [];

  files.forEach(function(file) {
    const fullPath = path.join(dirPath, file);
    if (fs.statSync(fullPath).isDirectory()) {
      arrayOfFiles = getAllFiles(fullPath, arrayOfFiles);
    } else {
      const ext = path.extname(file);
      if (extensions.includes(ext)) {
        arrayOfFiles.push(fullPath);
      }
    }
  });

  return arrayOfFiles;
}

console.log("Starting comment removal...");

targetDirs.forEach(dir => {
  const absoluteDir = path.resolve(process.cwd(), dir);
  if (!fs.existsSync(absoluteDir)) {
      console.log(`Directory not found: ${dir}`);
      return;
  }
  
  const files = getAllFiles(absoluteDir);
  files.forEach(file => {
    let content = fs.readFileSync(file, 'utf8');
    let original = content;
    
    // 1. Remove JSX comments {/* ... */} first (as they contain standard comments)
    content = content.replace(/\{\s*\/\*[\s\S]*?\*\/\s*\}/g, '');
    
    // 2. Remove block comments /* ... */
    content = content.replace(/\/\*[\s\S]*?\*\//g, '');
    
    // 3. Remove single line comments // ... but avoid https://
    // This regex looks for // that is not preceded by : (to avoid URLs)
    // and handles it line by line.
    content = content.replace(/(?<!:)\/\/.*$/gm, '');

    if (content !== original) {
        fs.writeFileSync(file, content, 'utf8');
        console.log(`Cleaned: ${path.relative(process.cwd(), file)}`);
    }
  });
});

console.log("Done!");
