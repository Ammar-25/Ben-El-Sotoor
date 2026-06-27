const fs = require('fs');
const path = require('path');
const https = require('https');

const seedFile = path.join(__dirname, 'backend/BaynAlSutoor.Persistence/seed_data.json');
const frontendImagesDir = path.join(__dirname, 'frontend/assets/images');
const booksDir = path.join(frontendImagesDir, 'books');
const authorsDir = path.join(frontendImagesDir, 'authors');

if (!fs.existsSync(booksDir)) fs.mkdirSync(booksDir, { recursive: true });
if (!fs.existsSync(authorsDir)) fs.mkdirSync(authorsDir, { recursive: true });

function fetchJson(url) {
    return new Promise((resolve) => {
        https.get(url, { headers: { 'User-Agent': 'NodeJS/14.0 (contact@baynalsutoor.com)' } }, (res) => {
            if (res.statusCode === 301 || res.statusCode === 302) {
                return fetchJson(res.headers.location).then(resolve);
            }
            let data = '';
            res.on('data', chunk => data += chunk);
            res.on('end', () => {
                try { resolve(JSON.parse(data)); } catch (e) { resolve(null); }
            });
        }).on('error', () => resolve(null));
    });
}

function downloadImage(url, destPath) {
    return new Promise((resolve) => {
        if (!url) return resolve(false);
        if (fs.existsSync(destPath) && fs.statSync(destPath).size > 1000) return resolve(true);
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

const targetAuthors = [
    { nameAr: "نجيب محفوظ", nameEn: "Naguib Mahfouz", category: 1, type: 'ar' },
    { nameAr: "أحمد خالد توفيق", nameEn: "Ahmed Khaled Tawfik", category: 1, type: 'ar' },
    { nameAr: "أحمد مراد", nameEn: "Ahmed Mourad", category: 1, type: 'ar' },
    { nameAr: "عمرو عبد الحميد", nameEn: "Amr Abdel Hamid", category: 1, type: 'ar' },
    { nameAr: "مصطفى محمود", nameEn: "Mostafa Mahmoud", category: 5, type: 'ar' },
    { nameAr: "محمد صادق", nameEn: "Mohamed Sadek", category: 1, type: 'ar' },
    { nameAr: "بهاء طاهر", nameEn: "Bahaa Taher", category: 1, type: 'ar' },
    { nameAr: "توفيق الحكيم", nameEn: "Tawfik El Hakim", category: 1, type: 'ar' },
    { nameAr: "غسان كنفاني", nameEn: "Ghassan Kanafani", category: 1, type: 'ar' },
    { nameAr: "أحلام مستغانمي", nameEn: "Ahlam Mosteghanemi", category: 1, type: 'ar' },
    { nameAr: "علي الطنطاوي", nameEn: "Ali Al Tantawi", category: 4, type: 'ar' },
    { nameAr: "جبران خليل جبران", nameEn: "Kahlil Gibran", category: 1, type: 'ar' },
    { nameAr: "عبد الرحمن منيف", nameEn: "Abdelrahman Munif", category: 1, type: 'ar' },
    { nameAr: "جورج أورويل", nameEn: "George Orwell", category: 2, type: 'translated' },
    { nameAr: "جيمس كلير", nameEn: "James Clear", category: 6, type: 'translated' },
    { nameAr: "ستيفن كوفي", nameEn: "Stephen Covey", category: 6, type: 'translated' },
    { nameAr: "ديل كارنيجي", nameEn: "Dale Carnegie", category: 6, type: 'translated' },
    { nameAr: "دان براون", nameEn: "Dan Brown", category: 2, type: 'translated' },
    { nameAr: "يوفال نوح هراري", nameEn: "Yuval Noah Harari", category: 3, type: 'translated' },
    { nameAr: "Paulo Coelho", nameEn: "Paulo Coelho", category: 2, type: 'en' },
    { nameAr: "Robert Kiyosaki", nameEn: "Robert Kiyosaki", category: 7, type: 'en' }
];

const categories = [
    { Id: 1, NameAr: "روايات عربية", NameEn: "Arabic Novels", Icon: "📖", DescriptionAr: "أفضل الروايات والأعمال الأدبية العربية.", DescriptionEn: "Best Arabic novels and literature." },
    { Id: 2, NameAr: "روايات مترجمة", NameEn: "Translated Novels", Icon: "🌍", DescriptionAr: "روائع الأدب العالمي المترجم.", DescriptionEn: "Masterpieces of translated world literature." },
    { Id: 3, NameAr: "تاريخ", NameEn: "History", Icon: "🏛️", DescriptionAr: "كتب تاريخية وثقافية.", DescriptionEn: "Historical and cultural books." },
    { Id: 4, NameAr: "دراسات إسلامية", NameEn: "Islamic Studies", Icon: "🕌", DescriptionAr: "كتب دينية وتراث إسلامي.", DescriptionEn: "Religious books and Islamic heritage." },
    { Id: 5, NameAr: "فلسفة وفكر", NameEn: "Philosophy & Thought", Icon: "🧠", DescriptionAr: "فلسفة، فكر، وعلوم إنسانية.", DescriptionEn: "Philosophy, thought, and humanities." },
    { Id: 6, NameAr: "تطوير الذات", NameEn: "Self Development", Icon: "🌱", DescriptionAr: "كتب تطوير الذات والنجاح.", DescriptionEn: "Self-development and success books." },
    { Id: 7, NameAr: "أعمال واقتصاد", NameEn: "Business & Economy", Icon: "💼", DescriptionAr: "إدارة، أعمال، واقتصاد.", DescriptionEn: "Management, business, and economy." }
];

const reviewTemplates = {
    'ar': [
        "كتاب رائع ومؤثر، أنصح الجميع بقراءته.",
        "أسلوب الكاتب مميز جداً، ولكن النهاية كانت مفاجئة.",
        "من أجمل ما قرأت مؤخراً، تجربة لا تنسى.",
        "يحتوي على معلومات قيمة وعميقة.",
        "الكتاب جيد ولكن الترجمة في بعض الأجزاء ضعيفة.",
        "عمل أدبي ممتاز يلامس الواقع.",
        "لم يعجبني كثيراً، توقعت أفضل من ذلك.",
        "رحلة ممتعة بين صفحات هذا الكتاب الثري.",
        "أسلوب سردي ممتع ولا يجعلك تشعر بالملل أبداً.",
        "محتوى غني جداً ويستحق القراءة أكثر من مرة."
    ],
    'en': [
        "A wonderful and moving book, highly recommended.",
        "The author's style is very unique, but the ending was surprising.",
        "One of the best I've read recently, an unforgettable experience.",
        "Contains deep and valuable information.",
        "The book is good, but pacing is a bit slow.",
        "An excellent literary work that touches reality.",
        "I didn't like it much, expected better.",
        "An enjoyable journey through the pages of this rich book.",
        "Entertaining narrative style that never makes you feel bored.",
        "Very rich content that is worth reading more than once."
    ]
};

async function getWikipediaData(nameAr, nameEn) {
    let queryName = nameAr || nameEn;
    let url = `https://ar.wikipedia.org/w/api.php?action=query&prop=extracts|pageimages&titles=${encodeURIComponent(queryName)}&pithumbsize=500&exintro=1&explaintext=1&format=json`;
    let data = await fetchJson(url);
    if (!data || !data.query || !data.query.pages || Object.keys(data.query.pages)[0] === "-1") {
        url = `https://en.wikipedia.org/w/api.php?action=query&prop=extracts|pageimages&titles=${encodeURIComponent(nameEn)}&pithumbsize=500&exintro=1&explaintext=1&format=json`;
        data = await fetchJson(url);
    }
    
    let bio = `الكاتب المشهور ${nameAr}.`;
    let photo = null;

    if (data && data.query && data.query.pages) {
        const pages = data.query.pages;
        const pageId = Object.keys(pages)[0];
        if (pageId !== "-1") {
            const page = pages[pageId];
            if (page.extract) bio = page.extract.substring(0, 500) + '...';
            if (page.thumbnail) photo = page.thumbnail.source;
        }
    }
    return { bio, photo };
}

async function run() {
    console.log("Starting Arabic Library Rebuild using OpenLibrary API...");
    const db = { Categories: categories, Authors: [], Books: [], Users: [], Reviews: [] };

    // Generate Users
    for (let i = 2; i <= 21; i++) {
        const isMale = i % 2 === 0;
        const namesAr = isMale ? ["أحمد", "محمد", "عمر", "محمود", "طارق"] : ["سارة", "نورهان", "ليلى", "فاطمة", "مريم"];
        const namesEn = isMale ? ["Ahmed", "Mohamed", "Omar", "Mahmoud", "Tarek"] : ["Sarah", "Nourhan", "Layla", "Fatima", "Maryam"];
        const lastNames = ["حسن", "إبراهيم", "علي", "سعيد", "صالح"];
        const idx = i % 5;
        db.Users.push({
            Id: i,
            Name: `${namesAr[idx]} ${lastNames[idx]}`,
            Email: `user${i}@example.com`,
            PasswordHash: "User@123!",
            MemberSince: 2020 + (i % 5),
            CreatedAt: new Date().toISOString()
        });
    }

    let authorId = 10;
    let bookId = 100;
    let reviewId = 1000;

    for (const ta of targetAuthors) {
        console.log(`Processing Author: ${ta.nameAr}...`);
        const { bio, photo } = await getWikipediaData(ta.nameAr, ta.nameEn);
        
        const author = {
            Id: authorId++,
            NameAr: ta.nameAr,
            NameEn: ta.nameEn,
            Photo: "assets/images/authors/author-default.png",
            Banner: "assets/images/banners/author-banner-1.png",
            BioAr: bio || `السيرة الذاتية للكاتب ${ta.nameAr}.`,
            BioEn: `Biography for ${ta.nameEn}.`,
            Followers: Math.floor(Math.random() * 50000) + 5000,
            Rating: 4.5 + (Math.random() * 0.5),
            AchievementsJson: "{\"Ar\":[\"كاتب متميز\"],\"En\":[\"Distinguished Author\"]}",
            QuoteAr: "القراءة حياة أخرى.",
            QuoteEn: "Reading is another life."
        };

        if (photo) {
            const destPath = path.join(authorsDir, `author-${author.Id}.jpg`);
            if (await downloadImage(photo, destPath)) {
                author.Photo = `assets/images/authors/author-${author.Id}.jpg`;
            }
        }
        db.Authors.push(author);

        // Fetch Books from OpenLibrary
        const searchLang = ta.nameEn; // OpenLibrary works best with English author names
        const olUrl = `https://openlibrary.org/search.json?author=${encodeURIComponent(searchLang)}&limit=5&sort=editions`;
        
        const olData = await fetchJson(olUrl);
        if (olData && olData.docs) {
            for (const item of olData.docs) {
                if (!item.title) continue;

                const b = {
                    Id: bookId++,
                    TitleAr: item.title,
                    TitleEn: item.title,
                    AuthorId: author.Id,
                    CategoryId: ta.category,
                    Cover: "assets/images/books/book-default.png",
                    Rating: 4.0 + (Math.random() * 1.0),
                    ReviewsCount: 0,
                    DescriptionAr: `عمل مميز ورائع من تأليف الكاتب الكبير ${ta.nameAr}. يعتبر هذا الكتاب من أبرز الأعمال في مجاله حيث يقدم تجربة قراءة فريدة وعميقة تأخذ القارئ في رحلة لا تنسى.`,
                    DescriptionEn: `An outstanding and remarkable work authored by the great writer ${ta.nameEn}. This book is considered one of the most prominent works in its field, offering a unique and profound reading experience.`,
                    Price: Math.floor(Math.random() * 150) + 50,
                    OldPrice: 0,
                    IsNew: Math.random() > 0.8,
                    PublisherAr: (item.publisher && item.publisher.length > 0) ? item.publisher[0] : "دار النشر",
                    PublisherEn: (item.publisher && item.publisher.length > 0) ? item.publisher[0] : "Publisher",
                    LanguageAr: ta.type === 'en' ? 'الإنجليزية' : 'العربية',
                    LanguageEn: ta.type === 'en' ? 'English' : 'Arabic',
                    Pages: item.number_of_pages_median || Math.floor(Math.random() * 300) + 100,
                    Year: item.first_publish_year || 2020,
                    CreatedAt: new Date().toISOString()
                };

                if (Math.random() > 0.7) b.OldPrice = b.Price + 50;

                // Download cover
                if (item.cover_i) {
                    const imgUrl = `https://covers.openlibrary.org/b/id/${item.cover_i}-L.jpg`;
                    const destPath = path.join(booksDir, `book-${b.Id}.jpg`);
                    if (await downloadImage(imgUrl, destPath)) {
                        b.Cover = `assets/images/books/book-${b.Id}.jpg`;
                    }
                }

                // Generate Reviews
                const numReviews = Math.floor(Math.random() * 4) + 2;
                let sumRating = 0;
                for (let r = 0; r < numReviews; r++) {
                    const u = db.Users[Math.floor(Math.random() * db.Users.length)];
                    const isAr = ta.type !== 'en';
                    const tmpl = isAr ? reviewTemplates.ar : reviewTemplates.en;
                    const text = tmpl[Math.floor(Math.random() * tmpl.length)];
                    const rating = Math.floor(Math.random() * 2) + 4; // 4 or 5
                    sumRating += rating;
                    
                    db.Reviews.push({
                        Id: reviewId++,
                        BookId: b.Id,
                        UserId: u.Id,
                        Rating: rating,
                        TextAr: text,
                        TextEn: text,
                        Date: new Date(Date.now() - Math.floor(Math.random() * 10000000000)).toISOString().split('T')[0]
                    });
                }
                b.ReviewsCount = numReviews;
                b.Rating = parseFloat((sumRating / numReviews).toFixed(1));

                db.Books.push(b);
            }
        }
    }

    console.log(`Total Authors: ${db.Authors.length}`);
    console.log(`Total Books: ${db.Books.length}`);
    console.log(`Total Reviews: ${db.Reviews.length}`);
    
    fs.writeFileSync(seedFile, JSON.stringify(db, null, 2));
    console.log("Database seed file fully rebuilt!");
}

run().catch(console.error);
