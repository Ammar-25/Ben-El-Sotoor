const fs = require('fs');
const path = require('path');
const https = require('https');

const seedFile = path.join(__dirname, 'backend/BaynAlSutoor.Persistence/seed_data.json');
const authorsDir = path.join(__dirname, 'frontend/assets/images/authors');

const authorImages = {
    "نجيب محفوظ": "https://upload.wikimedia.org/wikipedia/commons/e/eb/Naguib_Mahfouz_1960.jpg",
    "أحمد خالد توفيق": "https://upload.wikimedia.org/wikipedia/commons/3/30/Ahmed_Khaled_Tawfik_-_2.jpg",
    "أحمد مراد": "https://upload.wikimedia.org/wikipedia/commons/5/50/Ahmed_Mourad.jpg",
    "عمرو عبد الحميد": "https://images.unsplash.com/photo-1506794778202-cad84cf45f1d?w=400&q=80", // Professional male portrait
    "مصطفى محمود": "https://upload.wikimedia.org/wikipedia/commons/1/1a/Mostafa_Mahmoud.jpg",
    "محمد صادق": "https://images.unsplash.com/photo-1472099645785-5658abf4ff4e?w=400&q=80", // Professional male portrait
    "بهاء طاهر": "https://upload.wikimedia.org/wikipedia/commons/9/91/Bahaa_Taher.jpg",
    "توفيق الحكيم": "https://upload.wikimedia.org/wikipedia/commons/5/57/Tawfiq_al-Hakim_-_2.jpg",
    "غسان كنفاني": "https://upload.wikimedia.org/wikipedia/commons/4/4e/Ghassan_Kanafani_01.jpg",
    "أحلام مستغانمي": "https://upload.wikimedia.org/wikipedia/commons/2/2f/Ahlam_Mosteghanemi.jpg",
    "علي الطنطاوي": "https://upload.wikimedia.org/wikipedia/commons/3/33/Ali_Al-Tantawi.jpg",
    "جبران خليل جبران": "https://upload.wikimedia.org/wikipedia/commons/b/b2/Kahlil_Gibran_1913.jpg",
    "عبد الرحمن منيف": "https://upload.wikimedia.org/wikipedia/commons/5/51/Abdul_Rahman_Munif.jpg",
    "جورج أورويل": "https://upload.wikimedia.org/wikipedia/commons/7/7e/George_Orwell_press_photo.jpg",
    "جيمس كلير": "https://images.unsplash.com/photo-1500648767791-00dcc994a43e?w=400&q=80",
    "ستيفن كوفي": "https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=400&q=80",
    "ديل كارنيجي": "https://upload.wikimedia.org/wikipedia/commons/9/9f/Dale_Carnegie.jpg",
    "دان براون": "https://upload.wikimedia.org/wikipedia/commons/d/de/Dan_Brown_book_signing.jpg",
    "يوفال نوح هراري": "https://upload.wikimedia.org/wikipedia/commons/2/20/Yuval_Noah_Harari.jpg",
    "Paulo Coelho": "https://upload.wikimedia.org/wikipedia/commons/6/6f/Paulo_Coelho_2014.jpg",
    "Robert Kiyosaki": "https://upload.wikimedia.org/wikipedia/commons/d/d4/Robert_Kiyosaki.jpg"
};

function downloadImage(url, destPath) {
    return new Promise((resolve) => {
        if (!url) return resolve(false);
        https.get(url, (res) => {
            if (res.statusCode === 301 || res.statusCode === 302) {
                return downloadImage(res.headers.location, destPath).then(resolve);
            }
            if (res.statusCode !== 200) return resolve(false);
            const file = fs.createWriteStream(destPath);
            res.pipe(file);
            file.on('finish', () => file.close(() => resolve(true)));
        }).on('error', () => resolve(false));
    });
}

async function run() {
    console.log("Fixing author photos and updating books for previews...");
    let data = JSON.parse(fs.readFileSync(seedFile, 'utf8'));

    // 1. Fix Authors
    for (const a of data.Authors) {
        const url = authorImages[a.NameAr] || authorImages[a.NameEn];
        if (url) {
            const destPath = path.join(authorsDir, `author-${a.Id}.jpg`);
            await downloadImage(url, destPath);
            a.Photo = `assets/images/authors/author-${a.Id}.jpg`;
            console.log(`Updated photo for ${a.NameAr}`);
        } else {
            console.log(`No manual URL mapped for ${a.NameAr}`);
        }
    }

    // 2. Fix Books (Pre-populate DigitalAssetUrl)
    let countPreviews = 0;
    for (const b of data.Books) {
        // Randomly assign a preview link to 20% of books, rest will use internal preview modal
        if (Math.random() < 0.2) {
            b.DigitalAssetUrl = "https://books.google.com/books?id=example_book_preview";
        } else {
            b.DigitalAssetUrl = "#internal-preview"; // Trigger the internal fallback preview
        }
        countPreviews++;
    }

    fs.writeFileSync(seedFile, JSON.stringify(data, null, 2));
    console.log(`Finished updating ${data.Authors.length} authors and ${countPreviews} book previews.`);
}

run().catch(console.error);
