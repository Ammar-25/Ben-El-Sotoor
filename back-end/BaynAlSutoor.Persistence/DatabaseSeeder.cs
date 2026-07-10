using BaynAlSutoor.Application.Interfaces;
using BaynAlSutoor.Domain.Entities;
using Microsoft.EntityFrameworkCore;
using System;
using System.Collections.Generic;
using System.Linq;
using System.Threading.Tasks;
using System.Text.Json;
using System.IO;

namespace BaynAlSutoor.Persistence
{
    public class DatabaseSeeder
    {
        private readonly ApplicationDbContext _context;
        private readonly IPasswordHasher _passwordHasher;

        public DatabaseSeeder(ApplicationDbContext context, IPasswordHasher passwordHasher)
        {
            _context = context;
            _passwordHasher = passwordHasher;
        }

        public async Task SeedAsync()
        {
            // Ensure Database is Created using Migrations
            await _context.Database.MigrateAsync();

            using var transaction = await _context.Database.BeginTransactionAsync();

            // 1. Seed Roles
            if (!await _context.Roles.AnyAsync())
            {
                var roles = new List<Role>
                {
                    new() { Id = 1, Name = "Admin" },
                    new() { Id = 2, Name = "Reader" },
                    new() { Id = 3, Name = "Author" }
                };
                await _context.Database.ExecuteSqlRawAsync("SET IDENTITY_INSERT Roles ON");
                await _context.Roles.AddRangeAsync(roles);
                await _context.SaveChangesAsync();
                await _context.Database.ExecuteSqlRawAsync("SET IDENTITY_INSERT Roles OFF");
            }

            // 2. Seed Permissions
            if (!await _context.Permissions.AnyAsync())
            {
                var permissions = new List<Permission>
                {
                    new() { Id = 1, Name = "ManageBooks", Description = "Create, edit, and delete books" },
                    new() { Id = 2, Name = "ManageAuthors", Description = "Create, edit, and delete authors" },
                    new() { Id = 3, Name = "ManageUsers", Description = "View and edit user details" },
                    new() { Id = 4, Name = "ViewLogs", Description = "View administrative audit logs" }
                };
                await _context.Database.ExecuteSqlRawAsync("SET IDENTITY_INSERT Permissions ON");
                await _context.Permissions.AddRangeAsync(permissions);
                await _context.SaveChangesAsync();
                await _context.Database.ExecuteSqlRawAsync("SET IDENTITY_INSERT Permissions OFF");

                // Map all permissions to Admin role
                var adminRole = await _context.Roles.FindAsync(1);
                if (adminRole != null)
                {
                    foreach (var perm in permissions)
                    {
                        await _context.RolePermissions.AddAsync(new RolePermission { RoleId = adminRole.Id, PermissionId = perm.Id });
                    }
                    await _context.SaveChangesAsync();
                }
            }

            // 3. Seed Admin User
            if (!await _context.Users.AnyAsync(u => u.Email == "admin@baynalsutoor.com"))
            {
                var admin = new User
                {
                    Name = "System Administrator",
                    Email = "admin@baynalsutoor.com",
                    PasswordHash = _passwordHasher.HashPassword("AdminPass123!"),
                    MemberSince = DateTime.UtcNow.Year,
                    CreatedAt = DateTime.UtcNow
                };
                await _context.Users.AddAsync(admin);
                await _context.SaveChangesAsync();

                // Assign Admin Role
                await _context.UserRoles.AddAsync(new UserRole { UserId = admin.Id, RoleId = 1 });
                await _context.SaveChangesAsync();
            }

            // 4. Seed Categories
            if (!await _context.Categories.AnyAsync())
            {
                var categories = new List<Category>
                {
                    new() { Id = 1, NameEn = "science", NameAr = "علم", Icon = "🔬", DescriptionEn = "Science Books", DescriptionAr = "كتب علمية" },
                    new() { Id = 2, NameEn = "novels", NameAr = "روايات", Icon = "📖", DescriptionEn = "Novels & Stories", DescriptionAr = "روايات وقصص" },
                    new() { Id = 3, NameEn = "self-development", NameAr = "تطوير الذات", Icon = "🌱", DescriptionEn = "Self Development & Growth", DescriptionAr = "تطوير الذات والنمو الشخصي" },
                    new() { Id = 4, NameEn = "history", NameAr = "تاريخ", Icon = "🏛️", DescriptionEn = "Historical Studies", DescriptionAr = "الدراسات التاريخية" },
                    new() { Id = 5, NameEn = "poetry", NameAr = "شعر", Icon = "🪶", DescriptionEn = "Poetry & Anthologies", DescriptionAr = "كتب شعرية وأدبية" },
                    new() { Id = 6, NameEn = "business", NameAr = "أعمال", Icon = "💼", DescriptionEn = "Business & Economics", DescriptionAr = "كتب مال وأعمال" },
                    new() { Id = 7, NameEn = "children", NameAr = "أطفال", Icon = "🧸", DescriptionEn = "Children Stories", DescriptionAr = "قصص ومغامرات الأطفال" }
                };
                await _context.Database.ExecuteSqlRawAsync("SET IDENTITY_INSERT Categories ON");
                await _context.Categories.AddRangeAsync(categories);
                await _context.SaveChangesAsync();
                await _context.Database.ExecuteSqlRawAsync("SET IDENTITY_INSERT Categories OFF");
            }

            // 5. Seed Authors
            if (!await _context.Authors.AnyAsync())
            {
                var authors = new List<Author>
                {
                    new()
                    {
                        Id = 1,
                        NameAr = "د. سارة المنصور",
                        NameEn = "Dr. Sara Al-Mansour",
                        Photo = "assets/images/author-default.png",
                        Banner = "assets/images/banners/author-banner-1.png",
                        BioAr = "عالمة فيزياء وكاتبة علمية شغوفة بتبسيط العلوم للقارئ العربي، نشرت أكثر من عشرة كتب.",
                        BioEn = "A physicist and science writer passionate about making science accessible to Arab readers, with over ten published books.",
                        Followers = 12500,
                        Rating = 4.8m,
                        AchievementsJson = "{\"Ar\":[\"جائزة أفضل كتاب علمي 2023\",\"زمالة الجمعية الفيزيائية\",\"أكثر من مليون قارئ\"],\"En\":[\"Best Science Book Award 2023\",\"Physics Society Fellowship\",\"Over a million readers\"]}",
                        QuoteAr = "العلم هو الفضول حين يصبح منهجًا.",
                        QuoteEn = "Science is curiosity once it becomes a method."
                    },
                    new()
                    {
                        Id = 2,
                        NameAr = "أحمد رشدي",
                        NameEn = "Ahmed Roshdy",
                        Photo = "assets/images/author-default.png",
                        Banner = "assets/images/banners/author-banner-2.png",
                        BioAr = "روائي وكاتب قصص أطفال، تتميز أعماله بالحبكة المشوّقة واللغة القريبة من القلب.",
                        BioEn = "A novelist and children's author known for gripping plots and heartfelt language.",
                        Followers = 8400,
                        Rating = 4.6m,
                        AchievementsJson = "{\"Ar\":[\"أفضل رواية عربية 2021\",\"ترجمت أعماله لخمس لغات\"],\"En\":[\"Best Arabic Novel 2021\",\"Works translated into five languages\"]}",
                        QuoteAr = "كل مدينة تخفي رواية تنتظر من يكتبها.",
                        QuoteEn = "Every city hides a novel waiting to be written."
                    },
                    new()
                    {
                        Id = 3,
                        NameAr = "ليلى عبد الرحمن",
                        NameEn = "Layla Abdul-Rahman",
                        Photo = "assets/images/author-default.png",
                        Banner = "assets/images/banners/author-banner-3.png",
                        BioAr = "مدرّبة تطوير ذات وخبيرة في ريادة الأعمال، تجمع بين العلم والتجربة العملية.",
                        BioEn = "A self-development coach and entrepreneurship expert blending science with hands-on experience.",
                        Followers = 21000,
                        Rating = 4.7m,
                        AchievementsJson = "{\"Ar\":[\"متحدثة في 50 مؤتمرًا\",\"الأكثر مبيعًا لثلاث سنوات\"],\"En\":[\"Speaker at 50 conferences\",\"Bestseller for three consecutive years\"]}",
                        QuoteAr = "التغيير يبدأ بقرار صغير يتكرر كل يوم.",
                        QuoteEn = "Change begins with one small decision repeated daily."
                    },
                    new()
                    {
                        Id = 4,
                        NameAr = "د. كريم فؤاد",
                        NameEn = "Dr. Karim Fouad",
                        Photo = "assets/images/author-default.png",
                        Banner = "assets/images/banners/author-banner-4.png",
                        BioAr = "مؤرخ وأستاذ جامعي متخصص في تاريخ الحضارات وطرق التجارة القديمة.",
                        BioEn = "A historian and professor specializing in the history of civilizations and ancient trade routes.",
                        Followers = 6700,
                        Rating = 4.5m,
                        AchievementsJson = "{\"Ar\":[\"جائزة الدولة في العلوم الإنسانية\",\"عضو اتحاد المؤرخين\"],\"En\":[\"State Award in Humanities\",\"Member of the Historians Union\"]}",
                        QuoteAr = "من لا يقرأ التاريخ محكوم بأن يعيد أخطاءه.",
                        QuoteEn = "Those who ignore history are bound to repeat its mistakes."
                    },
                    new()
                    {
                        Id = 5,
                        NameAr = "نور الهدى",
                        NameEn = "Nour Al-Huda",
                        Photo = "assets/images/author-default.png",
                        Banner = "assets/images/banners/author-banner-5.png",
                        BioAr = "شاعرة وكاتبة، تكتب عن الحنين والإنسان والهدوء الداخلي بلغة شفّافة.",
                        BioEn = "A poet and writer exploring nostalgia, humanity, and inner calm in transparent language.",
                        Followers = 9800,
                        Rating = 4.6m,
                        AchievementsJson = "{\"Ar\":[\"جائزة الشعر العربي 2022\",\"أمسيات في عشر دول\"],\"En\":[\"Arabic Poetry Award 2022\",\"Readings across ten countries\"]}",
                        QuoteAr = "الكلمة الصادقة تجد طريقها دائمًا.",
                        QuoteEn = "An honest word always finds its way."
                    }
                };
                await _context.Database.ExecuteSqlRawAsync("SET IDENTITY_INSERT Authors ON");
                await _context.Authors.AddRangeAsync(authors);
                await _context.SaveChangesAsync();
                await _context.Database.ExecuteSqlRawAsync("SET IDENTITY_INSERT Authors OFF");
            }

            // 6. Seed Books
            if (!await _context.Books.AnyAsync())
            {
                var books = new List<Book>
                {
                    new()
                    {
                        Id = 1,
                        TitleAr = "أسرار الكون",
                        TitleEn = "Secrets of the Universe",
                        AuthorId = 1,
                        CategoryId = 1, // science
                        Cover = "assets/images/books/book-1.png",
                        Rating = 4.7m,
                        ReviewsCount = 128,
                        DescriptionAr = "رحلة مبسّطة في أعماق الفيزياء الحديثة والكون الفسيح بأسلوب يفهمه الجميع.",
                        DescriptionEn = "A simplified journey into modern physics and the vast cosmos in language anyone can follow.",
                        Price = 120,
                        OldPrice = 160,
                        IsNew = true,
                        PublisherAr = "دار المعرفة",
                        PublisherEn = "Dar Al-Maarefa",
                        LanguageAr = "العربية",
                        LanguageEn = "Arabic",
                        Pages = 320,
                        Year = 2024,
                        CreatedAt = DateTime.Parse("2024-11-02")
                    },
                    new()
                    {
                        Id = 2,
                        TitleAr = "ظلال المدينة",
                        TitleEn = "City Shadows",
                        AuthorId = 2,
                        CategoryId = 2, // novels
                        Cover = "assets/images/books/book-2.png",
                        Rating = 4.4m,
                        ReviewsCount = 96,
                        DescriptionAr = "رواية تشويقية تدور أحداثها في أزقة مدينة قديمة تخفي أسرارها خلف كل باب.",
                        DescriptionEn = "A thriller set in the alleys of an old city that hides a secret behind every door.",
                        Price = 90,
                        OldPrice = 110,
                        IsNew = false,
                        PublisherAr = "دار الأدب",
                        PublisherEn = "Dar Al-Adab",
                        LanguageAr = "العربية",
                        LanguageEn = "Arabic",
                        Pages = 280,
                        Year = 2023,
                        CreatedAt = DateTime.Parse("2023-06-15")
                    },
                    new()
                    {
                        Id = 3,
                        TitleAr = "عقل بلا حدود",
                        TitleEn = "Mind Without Limits",
                        AuthorId = 3,
                        CategoryId = 3, // self-development
                        Cover = "assets/images/books/book-3.png",
                        Rating = 4.8m,
                        ReviewsCount = 204,
                        DescriptionAr = "دليل عملي لبناء عادات قوية وتطوير الذات خطوة بخطوة نحو حياة أكثر إنتاجية.",
                        DescriptionEn = "A practical guide to building strong habits and developing yourself step by step.",
                        Price = 75,
                        OldPrice = 95,
                        IsNew = true,
                        PublisherAr = "دار النهضة",
                        PublisherEn = "Dar Al-Nahda",
                        LanguageAr = "العربية",
                        LanguageEn = "Arabic",
                        Pages = 240,
                        Year = 2024,
                        CreatedAt = DateTime.Parse("2024-12-01")
                    },
                    new()
                    {
                        Id = 4,
                        TitleAr = "تاريخ لا يُروى",
                        TitleEn = "An Untold History",
                        AuthorId = 4,
                        CategoryId = 4, // history
                        Cover = "assets/images/books/book-4.png",
                        Rating = 4.5m,
                        ReviewsCount = 142,
                        DescriptionAr = "إعادة قراءة لأحداث تاريخية فارقة من زوايا جديدة بعيدًا عن الرواية الرسمية.",
                        DescriptionEn = "A fresh reading of pivotal historical events away from the official narrative.",
                        Price = 110,
                        OldPrice = 0,
                        IsNew = false,
                        PublisherAr = "دار التاريخ",
                        PublisherEn = "Dar Al-Tarikh",
                        LanguageAr = "العربية",
                        LanguageEn = "Arabic",
                        Pages = 410,
                        Year = 2022,
                        CreatedAt = DateTime.Parse("2022-09-20")
                    },
                    new()
                    {
                        Id = 5,
                        TitleAr = "حديقة الشعر",
                        TitleEn = "Garden of Poetry",
                        AuthorId = 5,
                        CategoryId = 5, // poetry
                        Cover = "assets/images/books/book-5.png",
                        Rating = 4.6m,
                        ReviewsCount = 73,
                        DescriptionAr = "مجموعة شعرية تنبض بالحنين والجمال وتأخذك في رحلة وجدانية هادئة.",
                        DescriptionEn = "A poetry collection pulsing with nostalgia and beauty for a calm emotional journey.",
                        Price = 60,
                        OldPrice = 80,
                        IsNew = false,
                        PublisherAr = "دار الشعر",
                        PublisherEn = "Dar Al-Shiir",
                        LanguageAr = "العربية",
                        LanguageEn = "Arabic",
                        Pages = 150,
                        Year = 2023,
                        CreatedAt = DateTime.Parse("2023-03-11")
                    },
                    new()
                    {
                        Id = 6,
                        TitleAr = "اقتصاد الغد",
                        TitleEn = "The Economy of Tomorrow",
                        AuthorId = 3,
                        CategoryId = 6, // business
                        Cover = "assets/images/books/book-6.png",
                        Rating = 4.3m,
                        ReviewsCount = 88,
                        DescriptionAr = "تحليل لمستقبل الاقتصاد الرقمي وكيف تستعد الشركات والأفراد للموجة القادمة.",
                        DescriptionEn = "An analysis of the digital economy's future and how to prepare for the next wave.",
                        Price = 130,
                        OldPrice = 150,
                        IsNew = true,
                        PublisherAr = "دار الأعمال",
                        PublisherEn = "Dar Al-Aamal",
                        LanguageAr = "العربية",
                        LanguageEn = "Arabic",
                        Pages = 300,
                        Year = 2024,
                        CreatedAt = DateTime.Parse("2024-10-05")
                    },
                    new()
                    {
                        Id = 7,
                        TitleAr = "مغامرات الصغار",
                        TitleEn = "Little Adventures",
                        AuthorId = 2,
                        CategoryId = 7, // children
                        Cover = "assets/images/books/book-7.png",
                        Rating = 4.9m,
                        ReviewsCount = 311,
                        DescriptionAr = "قصص مصوّرة ممتعة تغرس القيم الجميلة في نفوس الأطفال بأسلوب محبب.",
                        DescriptionEn = "Fun illustrated stories that plant beautiful values in children's hearts.",
                        Price = 50,
                        OldPrice = 65,
                        IsNew = false,
                        PublisherAr = "دار الطفل",
                        PublisherEn = "Dar Al-Tifl",
                        LanguageAr = "العربية",
                        LanguageEn = "Arabic",
                        Pages = 120,
                        Year = 2023,
                        CreatedAt = DateTime.Parse("2023-08-19")
                    },
                    new()
                    {
                        Id = 8,
                        TitleAr = "الذكاء الاصطناعي للجميع",
                        TitleEn = "AI for Everyone",
                        AuthorId = 1,
                        CategoryId = 1, // science
                        Cover = "assets/images/books/book-8.png",
                        Rating = 4.7m,
                        ReviewsCount = 176,
                        DescriptionAr = "مدخل واضح إلى عالم الذكاء الاصطناعي وتطبيقاته في حياتنا اليومية.",
                        DescriptionEn = "A clear introduction to artificial intelligence and its everyday applications.",
                        Price = 140,
                        OldPrice = 170,
                        IsNew = true,
                        PublisherAr = "دار التقنية",
                        PublisherEn = "Dar Al-Teqnia",
                        LanguageAr = "العربية",
                        LanguageEn = "Arabic",
                        Pages = 360,
                        Year = 2025,
                        CreatedAt = DateTime.Parse("2025-01-10")
                    },
                    new()
                    {
                        Id = 9,
                        TitleAr = "طريق الحرير",
                        TitleEn = "The Silk Road",
                        AuthorId = 4,
                        CategoryId = 4, // history
                        Cover = "assets/images/books/book-9.png",
                        Rating = 4.4m,
                        ReviewsCount = 64,
                        DescriptionAr = "حكاية أعظم طرق التجارة في التاريخ وما حملته من حضارات وثقافات.",
                        DescriptionEn = "The story of history's greatest trade route and the civilizations it carried.",
                        Price = 100,
                        OldPrice = 0,
                        IsNew = false,
                        PublisherAr = "دار التاريخ",
                        PublisherEn = "Dar Al-Tarikh",
                        LanguageAr = "العربية",
                        LanguageEn = "Arabic",
                        Pages = 290,
                        Year = 2022,
                        CreatedAt = DateTime.Parse("2022-05-30")
                    },
                    new()
                    {
                        Id = 10,
                        TitleAr = "فن الهدوء",
                        TitleEn = "The Art of Calm",
                        AuthorId = 5,
                        CategoryId = 3, // self-development
                        Cover = "assets/images/books/book-10.png",
                        Rating = 4.6m,
                        ReviewsCount = 119,
                        DescriptionAr = "كيف تجد السكينة وسط ضجيج الحياة وتعيد التوازن إلى يومك.",
                        DescriptionEn = "How to find serenity amid life's noise and restore balance to your day.",
                        Price = 70,
                        OldPrice = 90,
                        IsNew = false,
                        PublisherAr = "دار النهضة",
                        PublisherEn = "Dar Al-Nahda",
                        LanguageAr = "العربية",
                        LanguageEn = "Arabic",
                        Pages = 200,
                        Year = 2024,
                        CreatedAt = DateTime.Parse("2024-07-22")
                    },
                    new()
                    {
                        Id = 11,
                        TitleAr = "رحلة رائد فضاء",
                        TitleEn = "An Astronaut's Journey",
                        AuthorId = 1,
                        CategoryId = 2, // novels
                        Cover = "assets/images/books/book-11.png",
                        Rating = 4.5m,
                        ReviewsCount = 102,
                        DescriptionAr = "رواية خيال علمي مشوّقة عن أول رحلة بشرية إلى ما وراء المجموعة الشمسية.",
                        DescriptionEn = "A gripping sci-fi novel about the first human voyage beyond the solar system.",
                        Price = 95,
                        OldPrice = 120,
                        IsNew = true,
                        PublisherAr = "دار الأدب",
                        PublisherEn = "Dar Al-Adab",
                        LanguageAr = "العربية",
                        LanguageEn = "Arabic",
                        Pages = 340,
                        Year = 2025,
                        CreatedAt = DateTime.Parse("2025-02-14")
                    },
                    new()
                    {
                        Id = 12,
                        TitleAr = "قيادة الفرق",
                        TitleEn = "Leading Teams",
                        AuthorId = 3,
                        CategoryId = 6, // business
                        Cover = "assets/images/books/book-12.png",
                        Rating = 4.2m,
                        ReviewsCount = 57,
                        DescriptionAr = "مبادئ عملية في القيادة وبناء فرق عمل ناجحة وملهمة.",
                        DescriptionEn = "Practical principles for leadership and building successful, inspired teams.",
                        Price = 115,
                        OldPrice = 135,
                        IsNew = false,
                        PublisherAr = "دار الأعمال",
                        PublisherEn = "Dar Al-Aamal",
                        LanguageAr = "العربية",
                        LanguageEn = "Arabic",
                        Pages = 260,
                        Year = 2023,
                        CreatedAt = DateTime.Parse("2023-11-08")
                    }
                };
                await _context.Database.ExecuteSqlRawAsync("SET IDENTITY_INSERT Books ON");
                await _context.Books.AddRangeAsync(books);
                await _context.SaveChangesAsync();
                await _context.Database.ExecuteSqlRawAsync("SET IDENTITY_INSERT Books OFF");
            }

            // 7. Seed Subscription Plans
            if (!await _context.SubscriptionPlans.AnyAsync())
            {
                var plans = new List<SubscriptionPlan>
                {
                    new()
                    {
                        Id = "single",
                        NameAr = "كتاب واحد",
                        NameEn = "Single Book",
                        Price = 0,
                        PriceLabelAr = "حسب الكتاب",
                        PriceLabelEn = "Per book",
                        PeriodAr = "مرة واحدة",
                        PeriodEn = "one-time",
                        Featured = false,
                        FeatureKeysJson = "[\"payPerBook\",\"lifetimeAccess\",\"noCommitment\"]"
                    },
                    new()
                    {
                        Id = "monthly",
                        NameAr = "الاشتراك الشهري",
                        NameEn = "Monthly",
                        Price = 99,
                        PriceLabelAr = "٩٩ ج.م",
                        PriceLabelEn = "99 EGP",
                        PeriodAr = "شهريًا",
                        PeriodEn = "per month",
                        Featured = false,
                        FeatureKeysJson = "[\"unlimitedReading\",\"newReleases\",\"cancelAnytime\",\"oneDevice\"]"
                    },
                    new()
                    {
                        Id = "annual",
                        NameAr = "الاشتراك السنوي",
                        NameEn = "Annual",
                        Price = 899,
                        PriceLabelAr = "٨٩٩ ج.م",
                        PriceLabelEn = "899 EGP",
                        PeriodAr = "سنويًا",
                        PeriodEn = "per year",
                        Featured = true,
                        FeatureKeysJson = "[\"unlimitedReading\",\"newReleases\",\"twoMonthsFree\",\"threeDevices\",\"offlineReading\"]"
                    },
                    new()
                    {
                        Id = "premium",
                        NameAr = "البريميوم",
                        NameEn = "Premium",
                        Price = 1499,
                        PriceLabelAr = "١٤٩٩ ج.م",
                        PriceLabelEn = "1499 EGP",
                        PeriodAr = "سنويًا",
                        PeriodEn = "per year",
                        Featured = false,
                        FeatureKeysJson = "[\"everythingAnnual\",\"audioBooks\",\"exclusiveContent\",\"fiveDevices\",\"prioritySupport\"]"
                    }
                };
                await _context.SubscriptionPlans.AddRangeAsync(plans);
                await _context.SaveChangesAsync();
            }

            // 8. Seed FAQs
            if (!await _context.FAQs.AnyAsync())
            {
                var faqs = new List<FAQ>
                {
                    new()
                    {
                        QuestionAr = "هل يمكنني إلغاء اشتراكي في أي وقت؟",
                        QuestionEn = "Can I cancel my subscription anytime?",
                        AnswerAr = "نعم، يمكنك الإلغاء في أي وقت دون أي رسوم إضافية.",
                        AnswerEn = "Yes, you can cancel anytime with no extra fees."
                    },
                    new()
                    {
                        QuestionAr = "هل الكتب الصوتية متوفرة؟",
                        QuestionEn = "Are audiobooks available?",
                        AnswerAr = "الكتب الصوتية متوفرة في الخطة المميزة (البريميوم) فقط.",
                        AnswerEn = "Audiobooks are available in the Premium plan only."
                    },
                    new()
                    {
                        QuestionAr = "هل يمكنني القراءة دون اتصال بالإنترنت؟",
                        QuestionEn = "Can I read offline?",
                        AnswerAr = "نعم، القراءة دون اتصال بالإنترنت متوفرة في الخطتين السنوية والمميزة.",
                        AnswerEn = "Yes, offline reading is available in the Annual and Premium plans."
                    },
                    new()
                    {
                        QuestionAr = "ما هو عدد الأجهزة المسموح بها؟",
                        QuestionEn = "How many devices are allowed?",
                        AnswerAr = "يعتمد ذلك على خطتك، من جهاز واحد وحتى خمسة أجهزة.",
                        AnswerEn = "It depends on your plan, from one device up to five."
                    }
                };
                await _context.FAQs.AddRangeAsync(faqs);
                await _context.SaveChangesAsync();
            }

            // 9. Seed AppSettings
            if (!await _context.AppSettings.AnyAsync())
            {
                var appSetting = new AppSetting
                {
                    SiteNameAr = "بين السطور",
                    SiteNameEn = "Bayn Al-Sutoor",
                    LogoUrl = "assets/images/ui/logo-placeholder.png",
                    ContactEmail = "support@baynalsutoor.com",
                    ContactPhone = "+201000000000",
                    AddressAr = "القاهرة، مصر",
                    AddressEn = "Cairo, Egypt",
                    FacebookUrl = "https://facebook.com/baynalsutoor",
                    TwitterUrl = "https://twitter.com/baynalsutoor",
                    InstagramUrl = "https://instagram.com/baynalsutoor"
                };
                await _context.AppSettings.AddAsync(appSetting);
                await _context.SaveChangesAsync();
            }

            // 10. Seed Initial Reviews (Matches reviews.json)
            if (!await _context.Reviews.AnyAsync())
            {
                var reviews = new List<Review>
                {
                    new() { BookId = 1, UserId = 1, Rating = 5, TextAr = "كتاب رائع بسّط لي مفاهيم كنت أظنها مستحيلة الفهم. أنصح به بشدة.", TextEn = "A brilliant book that simplified concepts I thought impossible to grasp. Highly recommended.", Date = DateTime.Parse("2025-01-12") },
                    new() { BookId = 1, UserId = 1, Rating = 4, TextAr = "معلومات قيّمة وأسلوب ممتع، لكن بعض الفصول طويلة قليلاً.", TextEn = "Valuable information and an enjoyable style, though some chapters run a bit long.", Date = DateTime.Parse("2024-12-28") },
                    new() { BookId = 3, UserId = 1, Rating = 5, TextAr = "غيّر هذا الكتاب طريقة تنظيمي ليومي بالكامل. شكراً للكاتبة.", TextEn = "This book completely changed how I organize my day. Thank you to the author.", Date = DateTime.Parse("2025-02-03") }
                };
                await _context.Reviews.AddRangeAsync(reviews);
                await _context.SaveChangesAsync();
            }

            // 11. Load and Seed Generated Data
            var seedFilePath = Path.Combine(AppDomain.CurrentDomain.BaseDirectory, "..", "..", "..", "..", "BaynAlSutoor.Persistence", "seed_data.json");
            if (!File.Exists(seedFilePath))
            {
                // Fallback for different execution contexts
                seedFilePath = Path.Combine(Directory.GetCurrentDirectory(), "..", "BaynAlSutoor.Persistence", "seed_data.json");
            }
            
            if (File.Exists(seedFilePath))
            {
                var jsonData = await File.ReadAllTextAsync(seedFilePath);
                var options = new JsonSerializerOptions 
                { 
                    PropertyNameCaseInsensitive = true,
                    NumberHandling = System.Text.Json.Serialization.JsonNumberHandling.AllowReadingFromString 
                };
                var seedData = JsonSerializer.Deserialize<SeedDataDto>(jsonData, options);

                if (seedData != null)
                {
                    if (seedData.Authors != null && seedData.Authors.Any() && !await _context.Authors.AnyAsync(a => a.Id > 5))
                    {
                        await _context.Database.ExecuteSqlRawAsync("SET IDENTITY_INSERT Authors ON");
                        await _context.Authors.AddRangeAsync(seedData.Authors);
                        await _context.SaveChangesAsync();
                        await _context.Database.ExecuteSqlRawAsync("SET IDENTITY_INSERT Authors OFF");
                    }

                    if (seedData.Books != null && seedData.Books.Any() && !await _context.Books.AnyAsync(b => b.Id > 12))
                    {
                        await _context.Database.ExecuteSqlRawAsync("SET IDENTITY_INSERT Books ON");
                        await _context.Books.AddRangeAsync(seedData.Books);
                        await _context.SaveChangesAsync();
                        await _context.Database.ExecuteSqlRawAsync("SET IDENTITY_INSERT Books OFF");
                    }

                    if (seedData.Users != null && seedData.Users.Any() && !await _context.Users.AnyAsync(u => u.Id > 1))
                    {
                        foreach (var user in seedData.Users)
                        {
                            user.PasswordHash = _passwordHasher.HashPassword(user.PasswordHash);
                        }
                        await _context.Database.ExecuteSqlRawAsync("SET IDENTITY_INSERT Users ON");
                        await _context.Users.AddRangeAsync(seedData.Users);
                        await _context.SaveChangesAsync();
                        await _context.Database.ExecuteSqlRawAsync("SET IDENTITY_INSERT Users OFF");
                    }

                    if (seedData.Reviews != null && seedData.Reviews.Any() && !await _context.Reviews.AnyAsync(r => r.Id > 10))
                    {
                        await _context.Database.ExecuteSqlRawAsync("SET IDENTITY_INSERT Reviews ON");
                        await _context.Reviews.AddRangeAsync(seedData.Reviews);
                        await _context.SaveChangesAsync();
                        await _context.Database.ExecuteSqlRawAsync("SET IDENTITY_INSERT Reviews OFF");
                    }
                }
            }

            await transaction.CommitAsync();
        }
    }

    public class SeedDataDto
    {
        public List<Author> Authors { get; set; }
        public List<Book> Books { get; set; }
        public List<User> Users { get; set; }
        public List<Review> Reviews { get; set; }
    }
}
