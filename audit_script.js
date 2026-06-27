const fs = require('fs');
const path = require('path');

const seedFile = path.join(__dirname, 'backend/BaynAlSutoor.Persistence/seed_data.json');
let data;
try {
    data = JSON.parse(fs.readFileSync(seedFile, 'utf8'));
} catch (err) {
    console.error("No seed data found.");
    process.exit(1);
}

const books = data.Books || [];
const authors = data.Authors || [];
const reviews = data.Reviews || [];
const users = data.Users || [];

const placeholderCovers = books.filter(b => !b.Cover || b.Cover.includes('default') || b.Cover.endsWith('.png'));
const uniqueBookCovers = new Set(books.map(b => b.Cover)).size;

console.log("=== CURRENT STATE ===");
console.log(`Books: ${books.length}`);
console.log(`Books missing real covers: ${placeholderCovers.length}`);
console.log(`Unique Book Covers: ${uniqueBookCovers}`);
console.log(`Authors: ${authors.length}`);
console.log(`Reviews: ${reviews.length}`);
console.log(`Users (in seed): ${users.length}`);

// check if author images are placeholders
const placeholderAuthors = authors.filter(a => !a.Photo || a.Photo.includes('placeholder'));
console.log(`Authors missing real photos: ${placeholderAuthors.length}`);

// Check review uniqueness
const uniqueReviews = new Set(reviews.map(r => r.TextEn)).size;
console.log(`Unique Reviews: ${uniqueReviews} / ${reviews.length}`);
