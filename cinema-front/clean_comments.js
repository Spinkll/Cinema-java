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

console.log("Starting comment removal for all files...");

targetDirs.forEach(dir => {
  const absoluteDir = path.resolve(process.cwd(), dir);
  if (!fs.existsSync(absoluteDir)) return;
  
  const files = getAllFiles(absoluteDir);
  files.forEach(file => {
    let content = fs.readFileSync(file, 'utf8');
    let original = content;
    
    // Process JSX comments
    content = content.replace(/\{\s*\/\*[\s\S]*?\*\/\s*\}/g, '');
    
    // Process block comments
    content = content.replace(/\/\*[\s\S]*?\*\//g, '');
    
    // Process single-line comments (avoiding URLs like http://)
    content = content.replace(/(?<!:)\/\/.*$/gm, '');

    if (content !== original) {
        fs.writeFileSync(file, content, 'utf8');
        console.log(`Cleaned: ${path.relative(process.cwd(), file)}`);
    }
  });
});

console.log("Finished cleaning all files.");
