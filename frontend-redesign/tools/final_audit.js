const fs = require('fs');

async function run() {
    try {
        const booksRes = await fetch('http://localhost:5033/api/Books?pageNumber=1&pageSize=1000');
        const booksData = await booksRes.json();
        
        const authorsRes = await fetch('http://localhost:5033/api/Authors?pageNumber=1&pageSize=1000');
        const authorsData = await authorsRes.json();

        // Check books
        const books = booksData.data || [];
        const missingCovers = books.filter(b => !b.cover || b.cover.includes('placeholder') || b.cover.includes('default'));
        
        // Check authors
        const authors = authorsData.data || [];
        const missingPhotos = authors.filter(a => !a.photo || a.photo.includes('placeholder') || a.photo.includes('default'));

        console.log("=== FINAL AUDIT ===");
        console.log(`Total Books: ${booksData.totalRecords}`);
        console.log(`Books with placeholder covers: ${missingCovers.length}`);
        
        console.log(`Total Authors: ${authorsData.totalRecords}`);
        console.log(`Authors with placeholder photos: ${missingPhotos.length}`);
        
        // Let's get reviews for the first book
        if (books.length > 0) {
            const firstBook = books[0];
            const reviewsRes = await fetch(`http://localhost:5033/api/Reviews/book/${firstBook.id}`);
            const reviewsData = await reviewsRes.json();
            console.log(`Reviews for Book ${firstBook.id}: ${reviewsData.length}`);
            if (reviewsData.length > 0) {
                console.log(`Sample Review by User ID ${reviewsData[0].userId}: ${reviewsData[0].textEn}`);
            }
        }
        
    } catch (err) {
        console.error("Audit failed", err);
    }
}
run();
