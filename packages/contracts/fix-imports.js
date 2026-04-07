const fs = require('fs');
const path = require('path');

const contractsDir = path.join(__dirname, 'contracts');

function walkDir(dir, callback) {
  fs.readdirSync(dir).forEach(f => {
    let dirPath = path.join(dir, f);
    let isDirectory = fs.statSync(dirPath).isDirectory();
    isDirectory ? walkDir(dirPath, callback) : callback(path.join(dir, f));
  });
}

walkDir(contractsDir, (filePath) => {
  if (filePath.endsWith('.sol')) {
    let content = fs.readFileSync(filePath, 'utf8');
    let original = content;
    
    let fileDir = path.dirname(filePath);
    let relPath = path.relative(fileDir, contractsDir);
    relPath = relPath.replace(/\\/g, '/');
    if (relPath !== '') {
      relPath += '/';
    } else {
      relPath = './';
    }
    
    content = content.replace(/@openzeppelin\/(?!contracts\/)/g, '@openzeppelin/contracts/');
    content = content.replace(/@solady\//g, 'solady/src/');
    content = content.replace(/governance\//g, relPath + 'governance/');
    content = content.replace(/@governance\//g, relPath + 'governance/');
    
    // Add rule for @core/ and @operator/
    content = content.replace(/@core\//g, relPath + 'core/');
    content = content.replace(/@operator\//g, relPath + 'operator/');
    
    if (content !== original) {
      fs.writeFileSync(filePath, content, 'utf8');
      console.log(`Updated imports in ${filePath}`);
    }
  }
});