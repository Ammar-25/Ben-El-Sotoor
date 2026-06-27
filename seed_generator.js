const fs = require('fs');
const path = require('path');
const https = require('https');

const API_BASE = 'https://openlibrary.org/search.json';
const ASSETS_DIR = path.join(__dirname, 'frontend', 'assets', 'images', 'books');
const AUTHORS_DIR = path.join(__dirname, 'frontend', 'assets', 'images', 'authors');
const OUTPUT_FILE = path.join(__dirname, 'backend', 'BaynAlSutoor.Persistence', 'seed_data.json');

// Ensure directories exist
if (!fs.existsSync(ASSETS_DIR)) fs.mkdirSync(ASSETS_DIR, { recursive: true });
if (!fs.existsSync(AUTHORS_DIR)) fs.mkdirSync(AUTHORS_DIR, { recursive: true });

async function downloadImage(url, destPath) {
    if (fs.existsSync(destPath)) return true; // Skip already downloaded
    return new Promise((resolve) => {
        if (!url) return resolve(false);
        url = url.replace(/^http:\/\//i, 'https://');
        const file = fs.createWriteStream(destPath);
        https.get(url, (response) => {
            if (response.statusCode === 200) {
                response.pipe(file);
                file.on('finish', () => { file.close(); resolve(true); });
            } else if (response.statusCode > 300 && response.statusCode < 400 && response.headers.location) {
                let redirectUrl = response.headers.location;
                if (!redirectUrl.startsWith('http')) {
                    redirectUrl = 'https://covers.openlibrary.org' + redirectUrl;
                }
                https.get(redirectUrl, (res) => {
                    res.pipe(file);
                    file.on('finish', () => { file.close(); resolve(true); });
                }).on('error', () => { fs.unlink(destPath, () => {}); resolve(false); });
            } else {
                file.close();
                fs.unlink(destPath, () => {});
                resolve(false);
            }
        }).on('error', () => {
            file.close();
            fs.unlink(destPath, () => {});
            resolve(false);
        });
    });
}

const queries = [
    { q: 'subject=programming', lang: 'en', categoryId: 1 },
    { q: 'subject=software_engineering', lang: 'en', categoryId: 1 },
    { q: 'subject=artificial_intelligence', lang: 'en', categoryId: 1 },
    { q: 'subject=history', lang: 'en', categoryId: 4 },
    { q: 'subject=fiction', lang: 'en', categoryId: 2 },
    { q: 'subject=science_fiction', lang: 'en', categoryId: 2 },
    { q: 'subject=psychology', lang: 'en', categoryId: 3 },
    { q: 'subject=business', lang: 'en', categoryId: 6 },
    { q: 'subject=marketing', lang: 'en', categoryId: 6 },
    { q: 'q=روايات', lang: 'ar', categoryId: 2 },
    { q: 'q=تاريخ', lang: 'ar', categoryId: 4 },
    { q: 'q=تطوير+الذات', lang: 'ar', categoryId: 3 },
    { q: 'q=برمجة', lang: 'ar', categoryId: 1 },
    { q: 'q=أعمال', lang: 'ar', categoryId: 6 },
    { q: 'q=أطفال', lang: 'ar', categoryId: 7 },
    { q: 'q=اقتصاد', lang: 'ar', categoryId: 6 }
];

let authors = [];
let books = [];
let reviews = [];
let authorIdCounter = 10;
let bookIdCounter = 20;
let reviewIdCounter = 100;
const authorMap = new Map();

// Load existing data to resume
if (fs.existsSync(OUTPUT_FILE)) {
    try {
        const existingData = JSON.parse(fs.readFileSync(OUTPUT_FILE, 'utf8'));
        authors = existingData.Authors || [];
        books = existingData.Books || [];
        reviews = existingData.Reviews || [];
        
        authors.forEach(a => authorMap.set(a.NameEn.replace(' (EN)', ''), a.Id));
        if (authors.length > 0) authorIdCounter = Math.max(...authors.map(a => a.Id)) + 1;
        if (books.length > 0) bookIdCounter = Math.max(...books.map(b => b.Id)) + 1;
        if (reviews.length > 0) reviewIdCounter = Math.max(...reviews.map(r => r.Id)) + 1;
        console.log(`Resuming: Loaded ${authors.length} authors, ${books.length} books.`);
    } catch (e) {
        console.error('Error parsing existing data, starting fresh.');
    }
}

const users = [
    { Id: 1 }, { Id: 2 }, { Id: 3 }, { Id: 4 }, { Id: 5 }
];

async function fetchWithRetry(url, retries = 5) {
    for (let i = 0; i < retries; i++) {
        try {
            const controller = new AbortController();
            const timeoutId = setTimeout(() => controller.abort(), 15000); // 15s timeout
            const res = await fetch(url, { signal: controller.signal });
            clearTimeout(timeoutId);
            if (res.ok) return await res.json();
            if (res.status === 429) {
                console.log(`Rate limited. Waiting ${2 ** i}s...`);
                await new Promise(r => setTimeout(r, (2 ** i) * 1000));
            } else {
                throw new Error(`Status ${res.status}`);
            }
        } catch (e) {
            console.log(`Fetch failed (attempt ${i+1}/${retries}): ${e.message}`);
            if (i === retries - 1) throw e;
            await new Promise(r => setTimeout(r, (2 ** i) * 1000));
        }
    }
    return null;
}

function saveData() {
    const output = { Authors: authors, Books: books, Reviews: reviews };
    fs.writeFileSync(OUTPUT_FILE, JSON.stringify(output, null, 2));
}

async function fetchBooks() {
    for (const query of queries) {
        if (books.length >= 300) {
            console.log("Reached target of 300 books. Stopping.");
            break;
        }

        console.log(`Fetching: ${query.q}`);
        try {
            const data = await fetchWithRetry(`${API_BASE}?${query.q}&limit=25`);
            if (!data || !data.docs) continue;

            for (const item of data.docs) {
                if (!item.title || !item.author_name || item.author_name.length === 0) continue;
                
                // Skip if book title already exists
                const existingBook = books.find(b => b.TitleEn === item.title || b.TitleEn === item.title + " (EN)" || b.TitleAr === item.title);
                if (existingBook) continue;

                const authorName = item.author_name[0];
                if (!authorMap.has(authorName)) {
                    const author = {
                        Id: authorIdCounter++,
                        NameAr: query.lang === 'ar' ? authorName : authorName + " (AR)",
                        NameEn: query.lang === 'en' ? authorName : authorName + " (EN)",
                        Photo: "assets/images/authors/author-default.png",
                        Banner: "assets/images/banners/author-banner-1.png",
                        BioAr: "سيرة ذاتية متوفرة قريباً.",
                        BioEn: "Biography available soon.",
                        Followers: Math.floor(Math.random() * 50000) + 100,
                        Rating: (Math.random() * 1.5 + 3.5).toFixed(1),
                        AchievementsJson: JSON.stringify({ Ar: ["كاتب متميز"], En: ["Bestselling Author"] }),
                        QuoteAr: "المعرفة قوة.",
                        QuoteEn: "Knowledge is power."
                    };
                    authors.push(author);
                    authorMap.set(authorName, author.Id);
                }

                const currentAuthorId = authorMap.get(authorName);
                let coverPath = "assets/images/books/book-default.png";
                if (item.cover_i) {
                    const imgUrl = `https://covers.openlibrary.org/b/id/${item.cover_i}-M.jpg`;
                    const fileName = `book-${bookIdCounter}.jpg`;
                    const fullPath = path.join(ASSETS_DIR, fileName);
                    const success = await downloadImage(imgUrl, fullPath);
                    if (success) {
                        coverPath = `assets/images/books/${fileName}`;
                    }
                }

                const book = {
                    Id: bookIdCounter++,
                    TitleAr: query.lang === 'ar' ? item.title : item.title + " (AR)",
                    TitleEn: query.lang === 'en' ? item.title : item.title + " (EN)",
                    AuthorId: currentAuthorId,
                    CategoryId: query.categoryId,
                    Cover: coverPath,
                    Rating: (Math.random() * 2 + 3).toFixed(1),
                    ReviewsCount: Math.floor(Math.random() * 500) + 10,
                    DescriptionAr: query.lang === 'ar' ? "وصف متاح للكتاب قريبا" : "الوصف المترجم غير متاح.",
                    DescriptionEn: query.lang === 'en' ? "Description available soon." : "Translated description not available.",
                    Price: Math.floor(Math.random() * 200) + 50,
                    OldPrice: Math.random() > 0.5 ? Math.floor(Math.random() * 100) + 250 : 0,
                    IsNew: Math.random() > 0.8,
                    PublisherAr: item.publisher ? item.publisher[0] : "ناشر غير معروف",
                    PublisherEn: item.publisher ? item.publisher[0] : "Unknown Publisher",
                    LanguageAr: query.lang === 'ar' ? "العربية" : "الإنجليزية",
                    LanguageEn: query.lang === 'ar' ? "Arabic" : "English",
                    Pages: item.number_of_pages_median || Math.floor(Math.random() * 400) + 100,
                    Year: item.first_publish_year || 2020,
                    CreatedAt: new Date(Date.now() - Math.floor(Math.random() * 10000000000)).toISOString().split('T')[0]
                };

                books.push(book);

                // Generate Reviews
                const numReviews = Math.floor(Math.random() * 4) + 1;
                for (let i = 0; i < numReviews; i++) {
                    const randomUser = users[Math.floor(Math.random() * users.length)];
                    const rRating = Math.floor(Math.random() * 2) + 4;
                    reviews.push({
                        Id: reviewIdCounter++,
                        BookId: book.Id,
                        UserId: randomUser.Id,
                        Rating: rRating,
                        TextAr: rRating === 5 ? "كتاب رائع جداً!" : "جيد ومفيد.",
                        TextEn: rRating === 5 ? "Absolutely fantastic book!" : "Good and informative.",
                        Date: new Date(Date.now() - Math.floor(Math.random() * 10000000000)).toISOString().split('T')[0]
                    });
                }
                
                // Save progress periodically
                if (books.length % 10 === 0) {
                    saveData();
                    console.log(`Saved progress: ${books.length} books.`);
                }
            }
            saveData(); // Save at end of each query
        } catch (e) {
            console.error(`Skipping query ${query.q} due to repeated failures: ${e.message}`);
        }
    }
    
    saveData();
    console.log(`Completed. Total: ${authors.length} authors, ${books.length} books, and ${reviews.length} reviews.`);
}

fetchBooks();
