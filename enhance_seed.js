const fs = require('fs');
const path = require('path');
const https = require('https');

const seedFile = path.join(__dirname, 'backend/BaynAlSutoor.Persistence/seed_data.json');
const frontendImagesDir = path.join(__dirname, 'frontend/assets/images');
const booksDir = path.join(frontendImagesDir, 'books');
const authorsDir = path.join(frontendImagesDir, 'authors');

if (!fs.existsSync(booksDir)) fs.mkdirSync(booksDir, { recursive: true });
if (!fs.existsSync(authorsDir)) fs.mkdirSync(authorsDir, { recursive: true });

let data = JSON.parse(fs.readFileSync(seedFile, 'utf8'));

// Helper to download image
function downloadImage(url, destPath) {
    return new Promise((resolve, reject) => {
        if (fs.existsSync(destPath) && fs.statSync(destPath).size > 1000) {
            return resolve(true); // already downloaded
        }
        https.get(url, (response) => {
            if (response.statusCode === 301 || response.statusCode === 302) {
                return downloadImage(response.headers.location, destPath).then(resolve).catch(reject);
            }
            if (response.statusCode !== 200) {
                return resolve(false); // ignore failure
            }
            const file = fs.createWriteStream(destPath);
            response.pipe(file);
            file.on('finish', () => {
                file.close(() => resolve(true));
            });
        }).on('error', (err) => {
            fs.unlink(destPath, () => {});
            resolve(false);
        });
    });
}

const reviewTemplates = [
    { ar: "كتاب رائع جداً، أنصح الجميع بقراءته.", en: "Very wonderful book, highly recommended.", rating: 5 },
    { ar: "أعجبني الأسلوب، لكن بعض الأفكار مكررة.", en: "I liked the style, but some ideas are repetitive.", rating: 4 },
    { ar: "تجربة قراءة ممتعة ومفيدة.", en: "An enjoyable and useful reading experience.", rating: 5 },
    { ar: "جيد، ولكن توقعت المزيد من التفاصيل.", en: "Good, but I expected more details.", rating: 3 },
    { ar: "عمل مذهل يستحق كل دقيقة تقضيها في قراءته.", en: "Amazing work worth every minute spent reading.", rating: 5 },
    { ar: "مقبول، ولكن النهاية كانت ضعيفة.", en: "Acceptable, but the ending was weak.", rating: 3 },
    { ar: "من أفضل ما قرأت هذا العام!", en: "One of the best I've read this year!", rating: 5 },
    { ar: "المعلومات قيمة، لكن الترجمة سيئة قليلاً.", en: "Valuable info, but the translation is a bit poor.", rating: 4 },
    { ar: "لم يعجبني كثيراً.", en: "I didn't like it very much.", rating: 2 },
    { ar: "يحتوي على أفكار عميقة وملهمة.", en: "Contains deep and inspiring ideas.", rating: 5 }
];

async function run() {
    console.log("Generating 10 Users...");
    const users = [];
    for (let i = 1; i <= 10; i++) {
        users.push({
            Id: i + 1, // Start from 2 to avoid conflicting with admin (Id 1) in some setups, or wait, if we drop DB, we can just let DB assign IDs.
            Name: `User ${i}`,
            Email: `user${i}@baynalsutoor.com`,
            PasswordHash: "User@123!",
            MemberSince: 2024,
            CreatedAt: new Date().toISOString()
        });
    }
    data.Users = users;

    console.log("Enhancing Books...");
    for (const book of data.Books) {
        if (!book.Cover || book.Cover.includes('default') || book.Cover.endsWith('.png')) {
            const destName = `book-${book.Id}.jpg`;
            const destPath = path.join(booksDir, destName);
            // using picsum for guaranteed gorgeous varied abstract covers
            const url = `https://picsum.photos/seed/${book.Id}/400/600`;
            const success = await downloadImage(url, destPath);
            if (success) {
                book.Cover = `assets/images/books/${destName}`;
            }
        }
    }

    console.log("Enhancing Authors...");
    for (let i = 0; i < data.Authors.length; i++) {
        const author = data.Authors[i];
        if (!author.Photo || author.Photo.includes('default') || author.Photo.endsWith('.png')) {
            const destName = `author-${author.Id}.jpg`;
            const destPath = path.join(authorsDir, destName);
            const gender = i % 2 === 0 ? 'men' : 'women';
            const imgId = (author.Id % 99) + 1;
            const url = `https://randomuser.me/api/portraits/${gender}/${imgId}.jpg`;
            const success = await downloadImage(url, destPath);
            if (success) {
                author.Photo = `assets/images/authors/${destName}`;
            }
        }
    }

    console.log("Regenerating Reviews...");
    data.Reviews = [];
    let reviewId = 1;
    for (const book of data.Books) {
        const numReviews = Math.floor(Math.random() * 4) + 1; // 1 to 4 reviews per book
        let sumRating = 0;
        for (let i = 0; i < numReviews; i++) {
            const userIndex = Math.floor(Math.random() * users.length);
            const user = users[userIndex];
            const template = reviewTemplates[Math.floor(Math.random() * reviewTemplates.length)];
            
            // Randomize rating slightly
            let rating = template.rating;
            if (Math.random() > 0.7) rating = Math.max(1, rating - 1);
            if (Math.random() > 0.7) rating = Math.min(5, rating + 1);

            sumRating += rating;

            const daysAgo = Math.floor(Math.random() * 365);
            const date = new Date();
            date.setDate(date.getDate() - daysAgo);

            data.Reviews.push({
                Id: reviewId++,
                BookId: book.Id,
                UserId: user.Id,
                Rating: rating,
                TextAr: template.ar,
                TextEn: template.en,
                Date: date.toISOString().split('T')[0]
            });
        }
        // Update book stats based on reviews
        book.ReviewsCount = numReviews;
        book.Rating = parseFloat((sumRating / numReviews).toFixed(1));
    }

    console.log("Saving seed_data.json...");
    fs.writeFileSync(seedFile, JSON.stringify(data, null, 2));
    console.log("Enhancement Complete!");
}

run().catch(console.error);
