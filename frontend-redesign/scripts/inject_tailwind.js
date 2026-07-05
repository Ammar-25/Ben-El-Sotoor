const fs = require('fs');
const path = require('path');

const dir = 'd:/bayna-al-sutoor/frontend-redesign';
const files = fs.readdirSync(dir).filter(f => f.endsWith('.html'));

for (const file of files) {
  const filePath = path.join(dir, file);
  let content = fs.readFileSync(filePath, 'utf8');
  if (!content.includes('css/tailwind.css')) {
    content = content.replace('<link rel="stylesheet" href="css/global.css">', '<link rel="stylesheet" href="css/tailwind.css">\n  <link rel="stylesheet" href="css/global.css">');
    fs.writeFileSync(filePath, content, 'utf8');
  }
}
console.log('Done injecting tailwind.css');
