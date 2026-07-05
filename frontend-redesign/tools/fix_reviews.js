const fs = require('fs');
const path = require('path');

const file = path.join(__dirname, 'backend', 'BaynAlSutoor.Persistence', 'seed_data.json');
const data = JSON.parse(fs.readFileSync(file, 'utf8'));

data.Reviews.forEach(r => r.UserId = 1);

fs.writeFileSync(file, JSON.stringify(data, null, 2));
console.log('Fixed UserIds in Reviews');
