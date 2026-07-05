import { useState, useEffect } from "react";
import {
  Search, BookOpen, Menu, X, Star, Heart, Globe, User,
  ChevronRight, ChevronLeft, Quote, BookMarked, Feather,
  Clock, Eye, Bookmark, Award, LayoutDashboard, Users,
  FileText, MessageSquare, Settings, LogOut, TrendingUp,
  Mail, ArrowRight, Layers, PenLine, ScrollText, Library
} from "lucide-react";

// ─── Types ────────────────────────────────────────────────────────────────────
type Lang = "ar" | "en";
type Page = "home" | "library" | "book" | "login" | "admin" | "profile" | "reading";

// ─── Data ─────────────────────────────────────────────────────────────────────
const BOOKS = [
  { id: 1, titleAr: "مقدمة ابن خلدون", titleEn: "The Muqaddimah", authorAr: "ابن خلدون", authorEn: "Ibn Khaldun", catAr: "التاريخ والفلسفة", catEn: "History & Philosophy", year: "1377", rating: 4.9, reviews: 342, pages: 1029, coverBg: "linear-gradient(135deg,#3D1F0E 0%,#6B3A1F 50%,#4A2810 100%)", accentColor: "#C9A96E", descAr: "أعظم كتاب في علم الاجتماع والتاريخ، يرصد نظريته الخالدة في العمران البشري وصعود الحضارات وانهيارها.", descEn: "The greatest work in sociology and history, tracing the eternal theory of human civilization, the rise and fall of dynasties." },
  { id: 2, titleAr: "ألف ليلة وليلة", titleEn: "One Thousand and One Nights", authorAr: "تراث عربي", authorEn: "Arab Heritage", catAr: "الأدب الشعبي", catEn: "Folk Literature", year: "٩ هـ", rating: 4.8, reviews: 891, pages: 2847, coverBg: "linear-gradient(135deg,#1A2C3A 0%,#2C4A5E 50%,#1A3040 100%)", accentColor: "#B88A3B", descAr: "كنز الأدب الشرقي الخالد. حكايات شهرزاد التي نسجت فيها الخيال بالحكمة لتبقى حية في وجدان الإنسانية.", descEn: "The timeless treasury of Eastern literature. Scheherazade's tales weaving imagination with wisdom, living eternally in humanity's consciousness." },
  { id: 3, titleAr: "رسالة الغفران", titleEn: "Epistle of Forgiveness", authorAr: "أبو العلاء المعري", authorEn: "Abu al-Ala al-Ma'arri", catAr: "الأدب الفلسفي", catEn: "Philosophical Literature", year: "1033", rating: 4.7, reviews: 218, pages: 487, coverBg: "linear-gradient(135deg,#2A1A0E 0%,#4A2E1A 50%,#3A2214 100%)", accentColor: "#DDB96E", descAr: "رحلة خيالية إلى عوالم ما بعد الموت، تجمع بين العبقرية الأدبية والتأمل الفلسفي العميق.", descEn: "An imaginary journey to afterlife realms, combining literary genius with deep philosophical contemplation." },
  { id: 4, titleAr: "الأيام", titleEn: "The Days", authorAr: "طه حسين", authorEn: "Taha Hussein", catAr: "السيرة الذاتية", catEn: "Autobiography", year: "1929", rating: 4.8, reviews: 567, pages: 312, coverBg: "linear-gradient(135deg,#1C2E1C 0%,#2E4A2E 50%,#1E3020 100%)", accentColor: "#A8BB8E", descAr: "سيرة ذاتية خالدة لعميد الأدب العربي، تحكي رحلة طفل أعمى من قرية مصرية إلى قمم المعرفة الإنسانية.", descEn: "The immortal autobiography of the dean of Arabic literature, telling the journey of a blind boy from an Egyptian village to the peaks of human knowledge." },
  { id: 5, titleAr: "زقاق المدق", titleEn: "Midaq Alley", authorAr: "نجيب محفوظ", authorEn: "Naguib Mahfouz", catAr: "الرواية الاجتماعية", catEn: "Social Novel", year: "1947", rating: 4.9, reviews: 743, pages: 286, coverBg: "linear-gradient(135deg,#3E1F1A 0%,#6B3528 50%,#4A2520 100%)", accentColor: "#C9A96E", descAr: "نافذة على حياة المصريين في أزقة القاهرة القديمة. رواية تنبض بالحياة وتعكس الروح الإنسانية بكل صدق.", descEn: "A window into Egyptian life in the alleyways of old Cairo. A novel pulsating with life, reflecting the human spirit with complete honesty." },
  { id: 6, titleAr: "كليلة ودمنة", titleEn: "Kalila wa Dimna", authorAr: "ابن المقفع", authorEn: "Ibn al-Muqaffa", catAr: "الحكمة والأمثال", catEn: "Wisdom & Fables", year: "750", rating: 4.6, reviews: 429, pages: 398, coverBg: "linear-gradient(135deg,#1E2C1A 0%,#3A4E30 50%,#283820 100%)", accentColor: "#B8C98E", descAr: "أروع ما أُنتج في أدب الحكمة. حكايات الحيوانات التي تحمل في باطنها دروساً خالدة للحكام والناس.", descEn: "The finest work of wisdom literature. Animal tales carrying timeless lessons for rulers and people alike." },
];

const CATEGORIES = [
  { id: 1, nameAr: "الأدب العربي", nameEn: "Arabic Literature", count: 245, icon: ScrollText, colorBg: "#6B4423" },
  { id: 2, nameAr: "الفلسفة والفكر", nameEn: "Philosophy & Thought", count: 128, icon: Feather, colorBg: "#4A2E1A" },
  { id: 3, nameAr: "التاريخ", nameEn: "History", count: 189, icon: Layers, colorBg: "#3D5A3E" },
  { id: 4, nameAr: "الشعر", nameEn: "Poetry", count: 167, icon: PenLine, colorBg: "#4A3728" },
  { id: 5, nameAr: "الروايات", nameEn: "Novels", count: 312, icon: BookOpen, colorBg: "#5C3D2E" },
  { id: 6, nameAr: "التصوف والروحانيات", nameEn: "Sufism & Spirituality", count: 94, icon: Star, colorBg: "#2C3E50" },
];

const AUTHORS = [
  { id: 1, nameAr: "نجيب محفوظ", nameEn: "Naguib Mahfouz", booksCount: 34, bioAr: "عميد الرواية العربية وحائز جائزة نوبل للآداب عام 1988. رسّم القاهرة بكلماته وجعل أزقتها خالدة.", bioEn: "Dean of Arabic fiction, Nobel laureate 1988. He painted Cairo with words and immortalized its alleys.", img: "https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=400&h=500&fit=crop&auto=format" },
  { id: 2, nameAr: "جبران خليل جبران", nameEn: "Kahlil Gibran", booksCount: 28, bioAr: "شاعر لبناني عالمي، صاحب 'النبي'. كلماته وصلت قلوب الملايين وعبرت حواجز اللغات.", bioEn: "Lebanese world poet, author of 'The Prophet'. His words reached millions, transcending language barriers.", img: "https://images.unsplash.com/photo-1472099645785-5658abf4ff4e?w=400&h=500&fit=crop&auto=format" },
  { id: 3, nameAr: "غادة السمان", nameEn: "Ghada Al-Samman", booksCount: 22, bioAr: "أديبة سورية رائدة. كتبت بجرأة نادرة عن المرأة والحرية والوطن بأسلوب يجمع الشعر والسرد.", bioEn: "Pioneering Syrian writer who wrote boldly about women, freedom, and homeland in a style combining poetry and narrative.", img: "https://images.unsplash.com/photo-1438761681033-6461ffad8d80?w=400&h=500&fit=crop&auto=format" },
  { id: 4, nameAr: "محمود درويش", nameEn: "Mahmoud Darwish", booksCount: 19, bioAr: "شاعر فلسطين والعروبة. نسج من الألم والأمل قصائد ستظل تُتلى ما بقيت اللغة العربية حية.", bioEn: "Poet of Palestine and Arabism. He wove from pain and hope poems that will be recited as long as Arabic lives.", img: "https://images.unsplash.com/photo-1500648767791-00dcc994a43e?w=400&h=500&fit=crop&auto=format" },
];

const QUOTES = [
  { textAr: "الكتاب وعاء مليء علماً، يفتح بابه لمن استحق الدخول.", textEn: "A book is a vessel full of knowledge, opening its door to those who deserve to enter.", authorAr: "الجاحظ", authorEn: "Al-Jahiz", bookAr: "البيان والتبيين", bookEn: "The Book of Eloquence" },
  { textAr: "اقرأ وارقَ. فإن الكتاب سلّمٌ من أراد الصعود إلى النور.", textEn: "Read and rise. For the book is a ladder for those who wish to ascend toward light.", authorAr: "ابن القيم الجوزية", authorEn: "Ibn al-Qayyim", bookAr: "مدارج السالكين", bookEn: "Madarij al-Salikin" },
  { textAr: "لو كانت الكتب تُباع بأعمار الناس لاشتريتها بعمري كله.", textEn: "If books were sold for the price of lifetimes, I would buy them with my entire life.", authorAr: "الإمام الشافعي", authorEn: "Imam al-Shafi'i", bookAr: "مناقب الشافعي", bookEn: "Manaqib al-Shafi'i" },
];

const ARTICLES = [
  { id: 1, titleAr: "المخطوطات العربية: كنوز دُفنت في زمن الورق", titleEn: "Arabic Manuscripts: Treasures Buried in the Age of Paper", excerptAr: "تحتضن مكتبات العالم آلاف المخطوطات العربية التي لم تُقرأ بعد، تنتظر من يُعيد لها روحها ويكشف أسرارها...", excerptEn: "Libraries around the world hold thousands of unread Arabic manuscripts, waiting for someone to restore their spirit and unveil their secrets...", date: "15 ديسمبر 2024", dateEn: "December 15, 2024", readingTime: 8, img: "https://images.unsplash.com/photo-1524995997946-a1c2e315a42f?w=800&h=500&fit=crop&auto=format" },
  { id: 2, titleAr: "نجيب محفوظ وزقاق المدق: القاهرة كما لم تُرَ", titleEn: "Mahfouz and Midaq Alley: Cairo as Never Seen Before", excerptAr: "حين نقرأ محفوظ، لا نقرأ رواية بل نمشي في شوارع القاهرة القديمة، نشمّ روائح البخور والياسمين...", excerptEn: "When we read Mahfouz, we don't read a novel but walk through old Cairo's streets, smelling incense and jasmine...", date: "8 ديسمبر 2024", dateEn: "December 8, 2024", readingTime: 12, img: "https://images.unsplash.com/photo-1512820790803-83ca734da794?w=800&h=500&fit=crop&auto=format" },
  { id: 3, titleAr: "فن القراءة بين السطور: ما لا تقوله الكلمات", titleEn: "The Art of Reading Between the Lines: What Words Don't Say", excerptAr: "القراءة الحقيقية ليست استيعاب الكلمات فحسب، بل هي الحوار الصامت مع الكاتب في غرفة من الورق...", excerptEn: "True reading is not merely absorbing words, but a silent dialogue with the author in a room made of paper...", date: "1 ديسمبر 2024", dateEn: "December 1, 2024", readingTime: 6, img: "https://images.unsplash.com/photo-1481627834876-b7833e8f5570?w=800&h=500&fit=crop&auto=format" },
];

// ─── Helpers ───────────────────────────────────────────────────────────────────
const fontDisplay = (l: Lang) => l === "ar" ? "'Amiri', Georgia, serif" : "'Playfair Display', Georgia, serif";
const fontBody = (l: Lang) => l === "ar" ? "'IBM Plex Sans Arabic', Arial, sans-serif" : "'Lato', 'Helvetica Neue', sans-serif";

const t = (l: Lang, ar: string, en: string) => l === "ar" ? ar : en;

const paperTexture = `url("data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' width='300' height='300'%3E%3Cfilter id='n'%3E%3CfeTurbulence type='fractalNoise' baseFrequency='0.75' numOctaves='4' stitchTiles='stitch'/%3E%3CfeColorMatrix type='saturate' values='0'/%3E%3C/filter%3E%3Crect width='300' height='300' filter='url(%23n)' opacity='0.035'/%3E%3C/svg%3E")`;

// ─── Shared UI ─────────────────────────────────────────────────────────────────
function OrnamentDivider() {
  return (
    <div className="flex items-center justify-center gap-3 mb-4">
      <div className="h-px flex-1 max-w-16" style={{ background: "linear-gradient(to right, transparent, #B88A3B)" }} />
      <span style={{ color: "#B88A3B", fontSize: "1.1rem" }}>✦</span>
      <div className="h-px flex-1 max-w-16" style={{ background: "linear-gradient(to left, transparent, #B88A3B)" }} />
    </div>
  );
}

function SectionHeader({ label, labelEn, subAr, subEn, lang }: { label: string; labelEn: string; subAr: string; subEn: string; lang: Lang }) {
  return (
    <div className="text-center mb-14">
      <OrnamentDivider />
      <h2 className="mb-3" style={{ fontFamily: fontDisplay(lang), fontSize: "clamp(1.75rem,3.5vw,2.5rem)", color: "#4A2E1A", lineHeight: 1.3 }}>
        {lang === "ar" ? label : labelEn}
      </h2>
      <p style={{ fontFamily: fontBody(lang), color: "#8A6848", fontSize: "1rem", maxWidth: "480px", margin: "0 auto", lineHeight: 1.7 }}>
        {lang === "ar" ? subAr : subEn}
      </p>
    </div>
  );
}

function PrimaryBtn({ children, onClick, className = "" }: { children: React.ReactNode; onClick?: () => void; className?: string }) {
  return (
    <button onClick={onClick} className={`px-7 py-3 rounded transition-all duration-300 ${className}`}
      style={{ background: "#6B4423", color: "#F5EFE3", fontFamily: "'Lato', sans-serif", fontSize: "0.9rem", letterSpacing: "0.05em", boxShadow: "0 4px 16px rgba(90,55,30,.2)", border: "1px solid #4A2E1A" }}
      onMouseEnter={e => { (e.currentTarget as HTMLElement).style.background = "#B88A3B"; }}
      onMouseLeave={e => { (e.currentTarget as HTMLElement).style.background = "#6B4423"; }}>
      {children}
    </button>
  );
}

function SecondaryBtn({ children, onClick }: { children: React.ReactNode; onClick?: () => void }) {
  return (
    <button onClick={onClick} className="px-7 py-3 rounded transition-all duration-300"
      style={{ background: "transparent", color: "#F5EFE3", fontFamily: "'Lato', sans-serif", fontSize: "0.9rem", letterSpacing: "0.05em", border: "1px solid rgba(245,239,227,.5)" }}
      onMouseEnter={e => { (e.currentTarget as HTMLElement).style.borderColor = "#B88A3B"; (e.currentTarget as HTMLElement).style.color = "#B88A3B"; }}
      onMouseLeave={e => { (e.currentTarget as HTMLElement).style.borderColor = "rgba(245,239,227,.5)"; (e.currentTarget as HTMLElement).style.color = "#F5EFE3"; }}>
      {children}
    </button>
  );
}

function StarRating({ rating }: { rating: number }) {
  return (
    <div className="flex items-center gap-1">
      {[1,2,3,4,5].map(i => (
        <Star key={i} size={12} fill={i <= Math.round(rating) ? "#B88A3B" : "none"} stroke="#B88A3B" strokeWidth={1.5} />
      ))}
      <span style={{ color: "#8A6848", fontSize: "0.75rem", marginLeft: "4px" }}>{rating}</span>
    </div>
  );
}

// ─── Navigation ────────────────────────────────────────────────────────────────
function Nav({ lang, setLang, page, setPage, scrolled, mobileOpen, setMobileOpen }: {
  lang: Lang; setLang: (l: Lang) => void; page: Page; setPage: (p: Page) => void;
  scrolled: boolean; mobileOpen: boolean; setMobileOpen: (v: boolean) => void;
}) {
  const navItems = [
    { key: "home", ar: "الرئيسية", en: "Home" },
    { key: "library", ar: "المكتبة", en: "Library" },
    { key: "home", ar: "التصنيفات", en: "Categories" },
    { key: "home", ar: "المؤلفون", en: "Authors" },
    { key: "home", ar: "المقالات", en: "Articles" },
    { key: "home", ar: "اقتباسات", en: "Quotes" },
  ];

  return (
    <nav className="fixed top-0 left-0 right-0 z-50 transition-all duration-500"
      style={{ background: scrolled ? "rgba(245,239,227,0.95)" : "transparent", backdropFilter: scrolled ? "blur(12px)" : "none", borderBottom: scrolled ? "1px solid #DDD0BB" : "none", boxShadow: scrolled ? "0 2px 20px rgba(90,55,30,.08)" : "none" }}>
      <div className="max-w-7xl mx-auto px-6 h-18 flex items-center justify-between" style={{ height: "72px" }}>
        {/* Logo */}
        <button onClick={() => setPage("home")} className="flex items-center gap-3 group">
          <div className="w-10 h-10 rounded flex items-center justify-center transition-all duration-300"
            style={{ border: "2px solid #B88A3B", background: "rgba(184,138,59,.08)" }}>
            <BookOpen size={18} stroke="#B88A3B" />
          </div>
          <div>
            <div style={{ fontFamily: "'Amiri', serif", fontSize: "1.1rem", color: scrolled ? "#4A2E1A" : "#F5EFE3", lineHeight: 1.1, fontWeight: 700 }}>بين السطور</div>
            <div style={{ fontFamily: "'Lato', sans-serif", fontSize: "0.55rem", color: scrolled ? "#B88A3B" : "rgba(245,239,227,.7)", letterSpacing: "0.18em", textTransform: "uppercase" }}>Between The Lines</div>
          </div>
        </button>

        {/* Desktop Nav */}
        <div className="hidden md:flex items-center gap-7">
          {navItems.map((item, i) => (
            <button key={i} onClick={() => setPage(item.key as Page)}
              className="transition-all duration-200 text-sm"
              style={{ fontFamily: fontBody(lang), color: scrolled ? (page === item.key ? "#6B4423" : "#4A2E1A") : "rgba(245,239,227,.9)", borderBottom: page === item.key && item.key !== "home" ? "1px solid #B88A3B" : "none", paddingBottom: "2px" }}
              onMouseEnter={e => { (e.currentTarget as HTMLElement).style.color = "#B88A3B"; }}
              onMouseLeave={e => { (e.currentTarget as HTMLElement).style.color = scrolled ? "#4A2E1A" : "rgba(245,239,227,.9)"; }}>
              {lang === "ar" ? item.ar : item.en}
            </button>
          ))}
        </div>

        {/* Right Actions */}
        <div className="hidden md:flex items-center gap-4">
          <button className="transition-colors duration-200"
            style={{ color: scrolled ? "#6B4423" : "rgba(245,239,227,.85)" }}>
            <Search size={18} />
          </button>
          <button onClick={() => setLang(lang === "ar" ? "en" : "ar")}
            className="flex items-center gap-1.5 px-3 py-1.5 rounded transition-all duration-200"
            style={{ border: `1px solid ${scrolled ? "#DDD0BB" : "rgba(245,239,227,.3)"}`, color: scrolled ? "#6B4423" : "rgba(245,239,227,.85)", fontFamily: "'Lato', sans-serif", fontSize: "0.75rem" }}>
            <Globe size={13} />
            {lang === "ar" ? "EN" : "عربي"}
          </button>
          <button onClick={() => setPage("login")}
            className="flex items-center gap-2 px-4 py-2 rounded transition-all duration-200"
            style={{ background: scrolled ? "#6B4423" : "rgba(107,68,35,.8)", color: "#F5EFE3", fontFamily: fontBody(lang), fontSize: "0.8rem", border: "1px solid rgba(184,138,59,.3)" }}>
            <User size={14} />
            {t(lang, "دخول", "Login")}
          </button>
        </div>

        {/* Mobile menu */}
        <button className="md:hidden" onClick={() => setMobileOpen(!mobileOpen)}
          style={{ color: scrolled ? "#4A2E1A" : "#F5EFE3" }}>
          {mobileOpen ? <X size={22} /> : <Menu size={22} />}
        </button>
      </div>

      {/* Mobile Menu */}
      {mobileOpen && (
        <div className="md:hidden" style={{ background: "#F8F4EC", borderTop: "1px solid #DDD0BB", padding: "16px 24px 24px" }}>
          {navItems.map((item, i) => (
            <button key={i} onClick={() => { setPage(item.key as Page); setMobileOpen(false); }}
              className="w-full text-start py-3 transition-colors duration-200"
              style={{ fontFamily: fontBody(lang), color: "#4A2E1A", fontSize: "0.95rem", borderBottom: i < navItems.length - 1 ? "1px solid #EFE3CE" : "none" }}>
              {lang === "ar" ? item.ar : item.en}
            </button>
          ))}
          <div className="flex gap-3 mt-4">
            <button onClick={() => setLang(lang === "ar" ? "en" : "ar")}
              className="flex-1 py-2.5 rounded text-sm transition-all"
              style={{ border: "1px solid #DDD0BB", color: "#6B4423", fontFamily: fontBody(lang) }}>
              {lang === "ar" ? "English" : "عربي"}
            </button>
            <button onClick={() => { setPage("login"); setMobileOpen(false); }}
              className="flex-1 py-2.5 rounded text-sm"
              style={{ background: "#6B4423", color: "#F5EFE3", fontFamily: fontBody(lang) }}>
              {t(lang, "دخول", "Login")}
            </button>
          </div>
        </div>
      )}
    </nav>
  );
}

// ─── Hero ──────────────────────────────────────────────────────────────────────
function HeroSection({ lang, setPage }: { lang: Lang; setPage: (p: Page) => void }) {
  const [search, setSearch] = useState("");
  return (
    <section className="relative min-h-screen flex items-center justify-center" style={{ backgroundImage: `url("https://images.unsplash.com/photo-1507842217343-583bb7270b66?w=1920&h=1080&fit=crop&auto=format")`, backgroundSize: "cover", backgroundPosition: "center" }}>
      <div className="absolute inset-0" style={{ background: "linear-gradient(to bottom, rgba(20,8,2,.65) 0%, rgba(40,18,6,.72) 60%, rgba(20,8,2,.85) 100%)" }} />

      {/* Decorative corner ornaments */}
      <div className="absolute top-24 right-8 opacity-20 text-5xl" style={{ color: "#B88A3B", fontFamily: "'Amiri', serif" }}>❧</div>
      <div className="absolute top-24 left-8 opacity-20 text-5xl" style={{ color: "#B88A3B", fontFamily: "'Amiri', serif" }}>❧</div>

      <div className="relative z-10 text-center px-6 max-w-4xl mx-auto">
        <div className="mb-6 flex items-center justify-center gap-3">
          <div className="h-px w-12 opacity-50" style={{ background: "#B88A3B" }} />
          <span style={{ color: "#B88A3B", fontSize: "0.7rem", letterSpacing: "0.3em", fontFamily: "'Lato', sans-serif", textTransform: "uppercase" }}>
            {t(lang, "مكتبة رقمية راقية", "A Premium Digital Library")}
          </span>
          <div className="h-px w-12 opacity-50" style={{ background: "#B88A3B" }} />
        </div>

        <h1 className="mb-4" style={{ fontFamily: fontDisplay(lang), color: "#F5EFE3", fontSize: "clamp(2.2rem,5.5vw,4.5rem)", lineHeight: 1.25, textShadow: "0 2px 20px rgba(0,0,0,.4)" }}>
          {t(lang, "ليست كل الكتب تُقرأ...", "Not All Books Are Read...")}
        </h1>
        <h2 className="mb-10" style={{ fontFamily: fontDisplay(lang), color: "#C9A96E", fontSize: "clamp(1.5rem,3.5vw,2.8rem)", fontStyle: "italic", lineHeight: 1.3, textShadow: "0 2px 12px rgba(0,0,0,.3)" }}>
          {t(lang, "بعضها يُعاش بين السطور.", "Some Are Lived Between the Lines.")}
        </h2>

        {/* Search bar */}
        <div className="max-w-2xl mx-auto mb-10 relative">
          <div className="flex items-center rounded" style={{ background: "rgba(252,250,245,.12)", backdropFilter: "blur(12px)", border: "1px solid rgba(184,138,59,.4)", padding: "6px 6px 6px 16px" }}>
            <Search size={18} stroke="#B88A3B" className="shrink-0" />
            <input value={search} onChange={e => setSearch(e.target.value)} dir={lang === "ar" ? "rtl" : "ltr"}
              placeholder={t(lang, "ابحث في المكتبة... كتب، مؤلفون، مواضيع", "Search the library... books, authors, topics")}
              className="flex-1 bg-transparent outline-none mx-3 text-sm"
              style={{ color: "#F5EFE3", fontFamily: fontBody(lang) }}
            />
            <button className="px-6 py-3 rounded text-sm transition-colors duration-200 shrink-0"
              style={{ background: "#6B4423", color: "#F5EFE3", fontFamily: fontBody(lang), border: "1px solid rgba(184,138,59,.3)" }}
              onMouseEnter={e => { (e.currentTarget as HTMLElement).style.background = "#B88A3B"; }}
              onMouseLeave={e => { (e.currentTarget as HTMLElement).style.background = "#6B4423"; }}>
              {t(lang, "بحث", "Search")}
            </button>
          </div>
        </div>

        <div className="flex items-center justify-center gap-4 flex-wrap">
          <PrimaryBtn onClick={() => setPage("library")}>{t(lang, "استكشف المكتبة", "Explore the Library")}</PrimaryBtn>
          <SecondaryBtn onClick={() => setPage("reading")}>{t(lang, "ابدأ القراءة", "Start Reading")}</SecondaryBtn>
        </div>

        <div className="mt-14 flex items-center justify-center gap-10 flex-wrap">
          {[{ n: "+12,000", ar: "كتاب رقمي", en: "Digital Books" }, { n: "+850", ar: "مؤلف", en: "Authors" }, { n: "+45,000", ar: "قارئ", en: "Readers" }].map((s, i) => (
            <div key={i} className="text-center">
              <div style={{ fontFamily: "'Playfair Display', serif", fontSize: "1.6rem", color: "#C9A96E", fontWeight: 600 }}>{s.n}</div>
              <div style={{ fontFamily: fontBody(lang), fontSize: "0.75rem", color: "rgba(245,239,227,.65)", letterSpacing: "0.05em" }}>{lang === "ar" ? s.ar : s.en}</div>
            </div>
          ))}
        </div>
      </div>

      <div className="absolute bottom-0 left-0 right-0 h-24" style={{ background: "linear-gradient(to bottom, transparent, #F5EFE3)" }} />
    </section>
  );
}

// ─── Featured Books ────────────────────────────────────────────────────────────
function BookCard({ book, lang, onSelect }: { book: typeof BOOKS[0]; lang: Lang; onSelect: () => void }) {
  const [hovered, setHovered] = useState(false);
  return (
    <button onMouseEnter={() => setHovered(true)} onMouseLeave={() => setHovered(false)} onClick={onSelect}
      className="text-start w-full rounded overflow-hidden transition-all duration-500"
      style={{ background: "#FCFAF5", border: "1px solid #DDD0BB", boxShadow: hovered ? "0 20px 50px rgba(90,55,30,.2)" : "0 4px 20px rgba(90,55,30,.08)", transform: hovered ? "translateY(-8px) rotate(0.5deg)" : "none" }}>
      {/* Book cover */}
      <div className="relative h-56 flex items-end p-5" style={{ background: book.coverBg }}>
        <div className="absolute inset-0 opacity-10" style={{ backgroundImage: paperTexture }} />
        <div className="absolute top-4 right-4 opacity-30" style={{ color: book.accentColor, fontSize: "2rem", fontFamily: "'Amiri', serif" }}>❧</div>
        <div className="relative">
          <div className="text-xs mb-2 opacity-70" style={{ color: book.accentColor, fontFamily: "'Lato', sans-serif", letterSpacing: "0.15em", textTransform: "uppercase" }}>{lang === "ar" ? book.catAr : book.catEn}</div>
          <div style={{ fontFamily: "'Amiri', serif", color: "#F5EFE3", fontSize: "1.25rem", lineHeight: 1.3, fontWeight: 700 }}>{lang === "ar" ? book.titleAr : book.titleEn}</div>
        </div>
        {/* Spine shadow */}
        <div className="absolute left-0 top-0 w-3 h-full" style={{ background: "rgba(0,0,0,.2)" }} />
      </div>
      {/* Info */}
      <div className="p-5">
        <div className="flex items-center justify-between mb-2">
          <span style={{ fontFamily: fontBody(lang), color: "#6B4423", fontSize: "0.85rem", fontWeight: 600 }}>{lang === "ar" ? book.authorAr : book.authorEn}</span>
          <span style={{ fontFamily: "'Lato', sans-serif", color: "#8A6848", fontSize: "0.75rem" }}>{book.year}</span>
        </div>
        <p className="mb-4 line-clamp-2" style={{ fontFamily: fontBody(lang), color: "#6A5040", fontSize: "0.82rem", lineHeight: 1.6 }}>
          {lang === "ar" ? book.descAr : book.descEn}
        </p>
        <div className="flex items-center justify-between">
          <StarRating rating={book.rating} />
          <div className="flex gap-2">
            <button className="p-1.5 rounded transition-colors" style={{ color: "#B88A3B" }}><Heart size={14} /></button>
            <button className="p-1.5 rounded transition-colors" style={{ color: "#B88A3B" }}><Bookmark size={14} /></button>
          </div>
        </div>
      </div>
    </button>
  );
}

function FeaturedBooksSection({ lang, setPage, setBook }: { lang: Lang; setPage: (p: Page) => void; setBook: (b: typeof BOOKS[0]) => void }) {
  return (
    <section className="py-24 px-6" style={{ background: "#F5EFE3", backgroundImage: paperTexture }}>
      <div className="max-w-7xl mx-auto">
        <SectionHeader label="الكتب المميزة" labelEn="Featured Books" subAr="مختارات عناها أهل المعرفة ووضعوها في صدر المكتبة لكل طالب علم" subEn="Selections curated by scholars and placed at the heart of the library for every seeker of knowledge" lang={lang} />
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-8">
          {BOOKS.map(book => (
            <BookCard key={book.id} book={book} lang={lang} onSelect={() => { setBook(book); setPage("book"); }} />
          ))}
        </div>
        <div className="text-center mt-12">
          <button onClick={() => setPage("library")} className="inline-flex items-center gap-2 px-8 py-3.5 rounded transition-all duration-300"
            style={{ border: "1px solid #6B4423", color: "#6B4423", fontFamily: fontBody(lang), fontSize: "0.9rem" }}
            onMouseEnter={e => { (e.currentTarget as HTMLElement).style.background = "#6B4423"; (e.currentTarget as HTMLElement).style.color = "#F5EFE3"; }}
            onMouseLeave={e => { (e.currentTarget as HTMLElement).style.background = "transparent"; (e.currentTarget as HTMLElement).style.color = "#6B4423"; }}>
            {t(lang, "تصفح كل الكتب", "Browse All Books")}
            {lang === "ar" ? <ChevronLeft size={16} /> : <ChevronRight size={16} />}
          </button>
        </div>
      </div>
    </section>
  );
}

// ─── Categories ────────────────────────────────────────────────────────────────
function CategoriesSection({ lang }: { lang: Lang }) {
  const [hovered, setHovered] = useState<number | null>(null);
  return (
    <section className="py-24 px-6" style={{ background: "#F8F4EC" }}>
      <div className="max-w-7xl mx-auto">
        <SectionHeader label="أبواب المعرفة" labelEn="Doors of Knowledge" subAr="تجول في أروقة المكتبة واستكشف أبوابها الستة الكبرى" subEn="Wander through the library's corridors and explore its six great gates" lang={lang} />
        <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-6 gap-4">
          {CATEGORIES.map(cat => {
            const Icon = cat.icon;
            return (
              <button key={cat.id} onMouseEnter={() => setHovered(cat.id)} onMouseLeave={() => setHovered(null)}
                className="flex flex-col items-center p-6 rounded text-center transition-all duration-300"
                style={{ background: hovered === cat.id ? cat.colorBg : "#FCFAF5", border: `1px solid ${hovered === cat.id ? cat.colorBg : "#DDD0BB"}`, boxShadow: hovered === cat.id ? `0 8px 30px rgba(90,55,30,.2)` : "0 2px 8px rgba(90,55,30,.05)", transform: hovered === cat.id ? "translateY(-4px)" : "none" }}>
                <div className="w-12 h-12 rounded flex items-center justify-center mb-4 transition-all duration-300"
                  style={{ background: hovered === cat.id ? "rgba(255,255,255,.15)" : cat.colorBg + "18" }}>
                  <Icon size={22} stroke={hovered === cat.id ? "#F5EFE3" : cat.colorBg} strokeWidth={1.5} />
                </div>
                <div className="font-medium mb-1 transition-colors duration-300 text-sm" style={{ fontFamily: fontBody(lang), color: hovered === cat.id ? "#F5EFE3" : "#2A1A0E" }}>
                  {lang === "ar" ? cat.nameAr : cat.nameEn}
                </div>
                <div className="text-xs transition-colors duration-300" style={{ fontFamily: "'Lato', sans-serif", color: hovered === cat.id ? "rgba(245,239,227,.7)" : "#8A6848" }}>
                  {cat.count} {t(lang, "كتاب", "books")}
                </div>
              </button>
            );
          })}
        </div>
      </div>
    </section>
  );
}

// ─── Authors ───────────────────────────────────────────────────────────────────
function AuthorsSection({ lang }: { lang: Lang }) {
  return (
    <section className="py-24 px-6" style={{ background: "#F5EFE3", backgroundImage: paperTexture }}>
      <div className="max-w-7xl mx-auto">
        <SectionHeader label="أعلام الأدب" labelEn="Literary Masters" subAr="عقول أضاءت الحضارة وتركت بصماتها في مسيرة الفكر الإنساني" subEn="Minds that illuminated civilization and left their mark on the journey of human thought" lang={lang} />
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
          {AUTHORS.map(author => (
            <div key={author.id} className="rounded overflow-hidden transition-all duration-400 group"
              style={{ background: "#FCFAF5", border: "1px solid #DDD0BB", boxShadow: "0 4px 20px rgba(90,55,30,.07)" }}>
              <div className="relative h-52 overflow-hidden">
                <img src={author.img} alt={author.nameEn} className="w-full h-full object-cover transition-transform duration-700 group-hover:scale-105" />
                <div className="absolute inset-0" style={{ background: "linear-gradient(to top, rgba(74,46,26,.7) 0%, transparent 60%)" }} />
                <div className="absolute bottom-4 inset-x-4">
                  <div style={{ fontFamily: "'Amiri', serif", color: "#F5EFE3", fontSize: "1.1rem", fontWeight: 700 }}>{lang === "ar" ? author.nameAr : author.nameEn}</div>
                  <div style={{ fontFamily: "'Lato', sans-serif", color: "#C9A96E", fontSize: "0.7rem", letterSpacing: "0.1em" }}>{author.booksCount} {t(lang, "كتاباً", "books")}</div>
                </div>
              </div>
              <div className="p-5">
                <p style={{ fontFamily: fontBody(lang), color: "#6A5040", fontSize: "0.82rem", lineHeight: 1.7 }} className="line-clamp-3">
                  {lang === "ar" ? author.bioAr : author.bioEn}
                </p>
                <button className="mt-4 text-xs transition-colors duration-200 flex items-center gap-1"
                  style={{ color: "#B88A3B", fontFamily: fontBody(lang) }}>
                  {t(lang, "مؤلفاته", "Their Works")}
                  {lang === "ar" ? <ChevronLeft size={12} /> : <ChevronRight size={12} />}
                </button>
              </div>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}

// ─── Quotes ────────────────────────────────────────────────────────────────────
function QuotesSection({ lang }: { lang: Lang }) {
  const [active, setActive] = useState(0);
  const q = QUOTES[active];

  useEffect(() => {
    const timer = setInterval(() => setActive(a => (a + 1) % QUOTES.length), 5000);
    return () => clearInterval(timer);
  }, []);

  return (
    <section className="py-24 px-6 relative overflow-hidden" style={{ background: "#4A2E1A" }}>
      <div className="absolute inset-0 opacity-5" style={{ backgroundImage: paperTexture }} />
      <div className="absolute top-8 left-8 opacity-10" style={{ color: "#B88A3B", fontSize: "8rem", fontFamily: "'Amiri', serif", lineHeight: 1 }}>"</div>
      <div className="absolute bottom-8 right-8 opacity-10" style={{ color: "#B88A3B", fontSize: "8rem", fontFamily: "'Amiri', serif", lineHeight: 1 }}>"</div>

      <div className="max-w-3xl mx-auto text-center relative z-10">
        <div className="mb-6"><Quote size={28} stroke="#B88A3B" strokeWidth={1} /></div>
        <div key={active} className="mb-8 transition-all duration-700"
          style={{ fontFamily: fontDisplay(lang), color: "#F5EFE3", fontSize: "clamp(1.2rem,2.5vw,1.8rem)", lineHeight: 1.6, fontStyle: "italic" }}>
          {lang === "ar" ? q.textAr : q.textEn}
        </div>
        <div className="mb-2" style={{ fontFamily: "'Lato', sans-serif", color: "#B88A3B", fontSize: "0.85rem", letterSpacing: "0.1em" }}>
          ─ {lang === "ar" ? q.authorAr : q.authorEn}
        </div>
        <div style={{ fontFamily: fontBody(lang), color: "rgba(245,239,227,.5)", fontSize: "0.75rem" }}>
          {lang === "ar" ? q.bookAr : q.bookEn}
        </div>
        <div className="flex justify-center gap-2 mt-10">
          {QUOTES.map((_, i) => (
            <button key={i} onClick={() => setActive(i)}
              className="rounded-full transition-all duration-300"
              style={{ width: i === active ? "24px" : "8px", height: "8px", background: i === active ? "#B88A3B" : "rgba(184,138,59,.3)" }} />
          ))}
        </div>
      </div>
    </section>
  );
}

// ─── Articles ──────────────────────────────────────────────────────────────────
function ArticlesSection({ lang }: { lang: Lang }) {
  const [main, ...rest] = ARTICLES;
  return (
    <section className="py-24 px-6" style={{ background: "#F8F4EC" }}>
      <div className="max-w-7xl mx-auto">
        <SectionHeader label="من المكتبة" labelEn="From the Library" subAr="مقالات وتأملات تعمّق تجربة القراءة وتفتح آفاق المعرفة" subEn="Articles and reflections that deepen the reading experience and open horizons of knowledge" lang={lang} />
        <div className="grid grid-cols-1 lg:grid-cols-5 gap-6">
          {/* Main article */}
          <button className="lg:col-span-3 rounded overflow-hidden text-start group transition-all duration-400"
            style={{ background: "#FCFAF5", border: "1px solid #DDD0BB", boxShadow: "0 4px 24px rgba(90,55,30,.08)" }}>
            <div className="h-64 overflow-hidden">
              <img src={main.img} alt="" className="w-full h-full object-cover transition-transform duration-700 group-hover:scale-105" />
            </div>
            <div className="p-7">
              <div className="flex items-center gap-4 mb-3">
                <span style={{ fontFamily: "'Lato', sans-serif", color: "#B88A3B", fontSize: "0.7rem", letterSpacing: "0.15em", textTransform: "uppercase" }}>
                  {t(lang, "مقال مميز", "Featured Article")}
                </span>
                <span style={{ color: "#DDD0BB" }}>·</span>
                <span style={{ fontFamily: "'Lato', sans-serif", color: "#8A6848", fontSize: "0.75rem" }}>
                  {lang === "ar" ? main.date : main.dateEn} · {main.readingTime} {t(lang, "دقائق", "min")}
                </span>
              </div>
              <h3 className="mb-3" style={{ fontFamily: fontDisplay(lang), color: "#2A1A0E", fontSize: "1.35rem", lineHeight: 1.4 }}>
                {lang === "ar" ? main.titleAr : main.titleEn}
              </h3>
              <p style={{ fontFamily: fontBody(lang), color: "#6A5040", fontSize: "0.85rem", lineHeight: 1.7 }} className="line-clamp-3">
                {lang === "ar" ? main.excerptAr : main.excerptEn}
              </p>
              <div className="mt-5 flex items-center gap-1 text-sm" style={{ color: "#B88A3B", fontFamily: fontBody(lang) }}>
                {t(lang, "اقرأ المقال", "Read Article")}
                {lang === "ar" ? <ChevronLeft size={14} /> : <ChevronRight size={14} />}
              </div>
            </div>
          </button>
          {/* Side articles */}
          <div className="lg:col-span-2 flex flex-col gap-6">
            {rest.map(art => (
              <button key={art.id} className="rounded overflow-hidden text-start group transition-all duration-400 flex h-36"
                style={{ background: "#FCFAF5", border: "1px solid #DDD0BB", boxShadow: "0 4px 16px rgba(90,55,30,.06)" }}>
                <div className="w-36 shrink-0 overflow-hidden">
                  <img src={art.img} alt="" className="w-full h-full object-cover transition-transform duration-700 group-hover:scale-105" />
                </div>
                <div className="p-4 flex flex-col justify-center">
                  <div className="mb-1" style={{ fontFamily: "'Lato', sans-serif", color: "#8A6848", fontSize: "0.7rem" }}>
                    {lang === "ar" ? art.date : art.dateEn} · {art.readingTime} {t(lang, "دق", "min")}
                  </div>
                  <h4 className="line-clamp-2 mb-1" style={{ fontFamily: fontDisplay(lang), color: "#2A1A0E", fontSize: "0.95rem", lineHeight: 1.35 }}>
                    {lang === "ar" ? art.titleAr : art.titleEn}
                  </h4>
                  <p className="line-clamp-2 text-xs" style={{ fontFamily: fontBody(lang), color: "#8A6848", lineHeight: 1.5 }}>
                    {lang === "ar" ? art.excerptAr : art.excerptEn}
                  </p>
                </div>
              </button>
            ))}
          </div>
        </div>
      </div>
    </section>
  );
}

// ─── Why BTL ───────────────────────────────────────────────────────────────────
function WhySection({ lang }: { lang: Lang }) {
  const features = [
    { icon: Library, ar: "مكتبة لا حدود لها", en: "Boundless Library", descAr: "أكثر من اثني عشر ألف كتاب عربي وعالمي في مكان واحد", descEn: "Over twelve thousand Arabic and global books in one place" },
    { icon: Eye, ar: "قراءة بلا إزعاج", en: "Distraction-Free Reading", descAr: "تجربة قراءة هادئة تشبه قراءة الكتاب الورقي الأصيل", descEn: "A quiet reading experience resembling reading an authentic paper book" },
    { icon: BookMarked, ar: "مكتبتك الشخصية", en: "Your Personal Library", descAr: "احفظ واصنّف وتابع قراءتك في مكتبة رقمية تخصك", descEn: "Save, organize, and track your reading in your personal digital library" },
    { icon: Award, ar: "محتوى مُعتنى به", en: "Curated Content", descAr: "كل كتاب يمر بمراجعة دقيقة لضمان الجودة وصحة المحتوى", descEn: "Every book goes through careful review to ensure quality and content accuracy" },
  ];

  return (
    <section className="py-24 px-6" style={{ background: "#F5EFE3", backgroundImage: paperTexture }}>
      <div className="max-w-7xl mx-auto">
        <SectionHeader label="لماذا بين السطور؟" labelEn="Why Between the Lines?" subAr="لأن القراءة الحقيقية أكثر من كلمات على شاشة" subEn="Because true reading is more than words on a screen" lang={lang} />
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
          {features.map((f, i) => {
            const Icon = f.icon;
            return (
              <div key={i} className="p-7 rounded text-center transition-all duration-300 group"
                style={{ background: "#FCFAF5", border: "1px solid #DDD0BB", boxShadow: "0 4px 20px rgba(90,55,30,.07)" }}
                onMouseEnter={e => { (e.currentTarget as HTMLElement).style.boxShadow = "0 12px 40px rgba(90,55,30,.15)"; (e.currentTarget as HTMLElement).style.borderColor = "#B88A3B"; }}
                onMouseLeave={e => { (e.currentTarget as HTMLElement).style.boxShadow = "0 4px 20px rgba(90,55,30,.07)"; (e.currentTarget as HTMLElement).style.borderColor = "#DDD0BB"; }}>
                <div className="w-14 h-14 rounded mx-auto mb-5 flex items-center justify-center" style={{ background: "rgba(107,68,35,.08)", border: "1px solid rgba(184,138,59,.2)" }}>
                  <Icon size={24} stroke="#6B4423" strokeWidth={1.5} />
                </div>
                <h4 className="mb-3" style={{ fontFamily: fontDisplay(lang), color: "#4A2E1A", fontSize: "1.1rem" }}>{lang === "ar" ? f.ar : f.en}</h4>
                <p style={{ fontFamily: fontBody(lang), color: "#8A6848", fontSize: "0.82rem", lineHeight: 1.7 }}>{lang === "ar" ? f.descAr : f.descEn}</p>
              </div>
            );
          })}
        </div>
      </div>
    </section>
  );
}

// ─── Newsletter ────────────────────────────────────────────────────────────────
function NewsletterSection({ lang }: { lang: Lang }) {
  const [email, setEmail] = useState("");
  const [sent, setSent] = useState(false);
  return (
    <section className="py-20 px-6" style={{ background: "#6B4423" }}>
      <div className="max-w-2xl mx-auto text-center">
        <div className="mb-3" style={{ color: "#C9A96E", fontSize: "0.7rem", fontFamily: "'Lato', sans-serif", letterSpacing: "0.25em", textTransform: "uppercase" }}>{t(lang, "النشرة البريدية", "Newsletter")}</div>
        <h3 className="mb-3" style={{ fontFamily: fontDisplay(lang), color: "#F5EFE3", fontSize: "clamp(1.5rem,3vw,2.2rem)" }}>
          {t(lang, "أخبار المكتبة إلى بريدك", "Library News to Your Inbox")}
        </h3>
        <p className="mb-8 text-sm" style={{ fontFamily: fontBody(lang), color: "rgba(245,239,227,.65)", lineHeight: 1.7 }}>
          {t(lang, "اشترك لتصلك إضافات الكتب الجديدة والمقالات المختارة كل أسبوع", "Subscribe to receive new book additions and selected articles every week")}
        </p>
        {sent ? (
          <div className="py-4 text-sm" style={{ color: "#C9A96E", fontFamily: fontBody(lang) }}>
            ✦ {t(lang, "شكراً! سنتواصل معك قريباً", "Thank you! We will reach out soon")}
          </div>
        ) : (
          <div className="flex gap-3 max-w-md mx-auto flex-wrap justify-center">
            <input value={email} onChange={e => setEmail(e.target.value)} dir={lang === "ar" ? "rtl" : "ltr"}
              placeholder={t(lang, "بريدك الإلكتروني", "Your email address")}
              className="flex-1 min-w-0 px-5 py-3 rounded text-sm outline-none"
              style={{ background: "rgba(245,239,227,.1)", border: "1px solid rgba(184,138,59,.4)", color: "#F5EFE3", fontFamily: fontBody(lang) }} />
            <button onClick={() => setSent(true)}
              className="px-6 py-3 rounded text-sm shrink-0 transition-colors duration-200"
              style={{ background: "#B88A3B", color: "#2A1A0E", fontFamily: fontBody(lang), fontWeight: 600 }}
              onMouseEnter={e => { (e.currentTarget as HTMLElement).style.background = "#C9A96E"; }}
              onMouseLeave={e => { (e.currentTarget as HTMLElement).style.background = "#B88A3B"; }}>
              {t(lang, "اشتراك", "Subscribe")}
            </button>
          </div>
        )}
      </div>
    </section>
  );
}

// ─── Footer ────────────────────────────────────────────────────────────────────
function Footer({ lang, setPage }: { lang: Lang; setPage: (p: Page) => void }) {
  const cols = [
    { headAr: "المكتبة", headEn: "Library", links: [{ ar: "الكتب", en: "Books" }, { ar: "المؤلفون", en: "Authors" }, { ar: "التصنيفات", en: "Categories" }, { ar: "الاقتباسات", en: "Quotes" }] },
    { headAr: "القارئ", headEn: "Reader", links: [{ ar: "حسابي", en: "My Account" }, { ar: "مكتبتي", en: "My Library" }, { ar: "المفضلة", en: "Favorites" }, { ar: "سجل القراءة", en: "Reading History" }] },
    { headAr: "المنصة", headEn: "Platform", links: [{ ar: "من نحن", en: "About Us" }, { ar: "المقالات", en: "Articles" }, { ar: "تواصل معنا", en: "Contact" }, { ar: "الخصوصية", en: "Privacy" }] },
  ];
  return (
    <footer style={{ background: "#2A1A0E", borderTop: "1px solid rgba(184,138,59,.2)" }}>
      <div className="max-w-7xl mx-auto px-6 py-16">
        <div className="grid grid-cols-1 md:grid-cols-4 gap-12">
          <div>
            <div className="flex items-center gap-3 mb-5">
              <div className="w-10 h-10 rounded flex items-center justify-center" style={{ border: "2px solid #B88A3B" }}>
                <BookOpen size={18} stroke="#B88A3B" />
              </div>
              <div>
                <div style={{ fontFamily: "'Amiri', serif", fontSize: "1.1rem", color: "#F5EFE3", fontWeight: 700 }}>بين السطور</div>
                <div style={{ fontFamily: "'Lato', sans-serif", fontSize: "0.55rem", color: "#B88A3B", letterSpacing: "0.18em" }}>BETWEEN THE LINES</div>
              </div>
            </div>
            <p style={{ fontFamily: fontBody(lang), color: "rgba(245,239,227,.5)", fontSize: "0.8rem", lineHeight: 1.8 }}>
              {t(lang, "مكتبة رقمية راقية تحمل عبق الورق وروح المخطوط، لكل من يؤمن أن الكتاب يُعاش لا يُقرأ فحسب.", "A premium digital library carrying the fragrance of paper and the soul of the manuscript, for all who believe a book is lived, not merely read.")}
            </p>
          </div>
          {cols.map((col, ci) => (
            <div key={ci}>
              <h5 className="mb-5 text-xs uppercase tracking-widest" style={{ fontFamily: "'Lato', sans-serif", color: "#B88A3B", letterSpacing: "0.2em" }}>{lang === "ar" ? col.headAr : col.headEn}</h5>
              <div className="flex flex-col gap-3">
                {col.links.map((l, li) => (
                  <button key={li} className="text-start text-sm transition-colors duration-200"
                    style={{ fontFamily: fontBody(lang), color: "rgba(245,239,227,.5)" }}
                    onMouseEnter={e => { (e.currentTarget as HTMLElement).style.color = "#C9A96E"; }}
                    onMouseLeave={e => { (e.currentTarget as HTMLElement).style.color = "rgba(245,239,227,.5)"; }}>
                    {lang === "ar" ? l.ar : l.en}
                  </button>
                ))}
              </div>
            </div>
          ))}
        </div>
        <div className="mt-12 pt-6 flex items-center justify-between flex-wrap gap-4" style={{ borderTop: "1px solid rgba(184,138,59,.12)" }}>
          <span style={{ fontFamily: "'Lato', sans-serif", color: "rgba(245,239,227,.3)", fontSize: "0.75rem" }}>
            © 2024 بين السطور · Between The Lines. {t(lang, "جميع الحقوق محفوظة", "All rights reserved")}
          </span>
          <span style={{ color: "#B88A3B", fontSize: "1rem" }}>✦</span>
        </div>
      </div>
    </footer>
  );
}

// ─── Home Page ─────────────────────────────────────────────────────────────────
function HomePage({ lang, setPage, setBook }: { lang: Lang; setPage: (p: Page) => void; setBook: (b: typeof BOOKS[0]) => void }) {
  return (
    <>
      <HeroSection lang={lang} setPage={setPage} />
      <FeaturedBooksSection lang={lang} setPage={setPage} setBook={setBook} />
      <CategoriesSection lang={lang} />
      <AuthorsSection lang={lang} />
      <QuotesSection lang={lang} />
      <ArticlesSection lang={lang} />
      <WhySection lang={lang} />
      <NewsletterSection lang={lang} />
      <Footer lang={lang} setPage={setPage} />
    </>
  );
}

// ─── Library Page ──────────────────────────────────────────────────────────────
function LibraryPage({ lang, setPage, setBook }: { lang: Lang; setPage: (p: Page) => void; setBook: (b: typeof BOOKS[0]) => void }) {
  const [search, setSearch] = useState("");
  const [activecat, setActiveCat] = useState<number | null>(null);
  const filtered = BOOKS.filter(b => {
    const q = search.toLowerCase();
    return b.titleAr.includes(search) || b.titleEn.toLowerCase().includes(q) || b.authorEn.toLowerCase().includes(q);
  });

  return (
    <div className="min-h-screen pt-20" style={{ background: "#F5EFE3", backgroundImage: paperTexture }}>
      <div className="max-w-7xl mx-auto px-6 py-12">
        {/* Header */}
        <div className="mb-10">
          <OrnamentDivider />
          <h1 className="text-center mb-2" style={{ fontFamily: fontDisplay(lang), fontSize: "clamp(1.8rem,4vw,3rem)", color: "#4A2E1A" }}>{t(lang, "المكتبة", "The Library")}</h1>
          <p className="text-center text-sm mb-8" style={{ fontFamily: fontBody(lang), color: "#8A6848" }}>{t(lang, "اكتشف كنوز الأدب العربي والعالمي", "Discover the treasures of Arabic and world literature")}</p>
          {/* Search + Filter */}
          <div className="flex gap-3 flex-wrap">
            <div className="flex-1 min-w-64 flex items-center gap-3 px-4 py-3 rounded"
              style={{ background: "#FCFAF5", border: "1px solid #DDD0BB" }}>
              <Search size={16} stroke="#8A6848" />
              <input value={search} onChange={e => setSearch(e.target.value)} dir={lang === "ar" ? "rtl" : "ltr"}
                placeholder={t(lang, "ابحث عن كتاب أو مؤلف...", "Search for a book or author...")}
                className="flex-1 bg-transparent outline-none text-sm"
                style={{ fontFamily: fontBody(lang), color: "#2A1A0E" }} />
            </div>
            {CATEGORIES.slice(0, 4).map(c => (
              <button key={c.id} onClick={() => setActiveCat(activecat === c.id ? null : c.id)}
                className="px-4 py-3 rounded text-xs transition-all duration-200"
                style={{ background: activecat === c.id ? "#6B4423" : "#FCFAF5", color: activecat === c.id ? "#F5EFE3" : "#6B4423", border: "1px solid " + (activecat === c.id ? "#6B4423" : "#DDD0BB"), fontFamily: fontBody(lang) }}>
                {lang === "ar" ? c.nameAr : c.nameEn}
              </button>
            ))}
          </div>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-8">
          {filtered.map(book => (
            <BookCard key={book.id} book={book} lang={lang} onSelect={() => { setBook(book); setPage("book"); }} />
          ))}
        </div>
        {filtered.length === 0 && (
          <div className="text-center py-24">
            <BookOpen size={48} stroke="#DDD0BB" className="mx-auto mb-4" />
            <p style={{ fontFamily: fontBody(lang), color: "#8A6848", fontSize: "1rem" }}>{t(lang, "لا توجد نتائج لبحثك", "No results found for your search")}</p>
          </div>
        )}
      </div>
      <Footer lang={lang} setPage={setPage} />
    </div>
  );
}

// ─── Book Detail ───────────────────────────────────────────────────────────────
function BookDetailPage({ lang, book, setPage }: { lang: Lang; book: typeof BOOKS[0]; setPage: (p: Page) => void }) {
  const [tab, setTab] = useState<"overview" | "reviews" | "quotes">("overview");
  const tabs = [{ key: "overview", ar: "نظرة عامة", en: "Overview" }, { key: "reviews", ar: "التقييمات", en: "Reviews" }, { key: "quotes", ar: "اقتباسات", en: "Quotes" }];

  return (
    <div className="min-h-screen pt-20" style={{ background: "#F5EFE3", backgroundImage: paperTexture }}>
      <div className="max-w-6xl mx-auto px-6 py-12">
        <button onClick={() => setPage("library")} className="flex items-center gap-2 mb-8 text-sm transition-colors duration-200"
          style={{ color: "#8A6848", fontFamily: fontBody(lang) }}
          onMouseEnter={e => { (e.currentTarget as HTMLElement).style.color = "#6B4423"; }}
          onMouseLeave={e => { (e.currentTarget as HTMLElement).style.color = "#8A6848"; }}>
          {lang === "ar" ? <ChevronRight size={16} /> : <ChevronLeft size={16} />}
          {t(lang, "العودة إلى المكتبة", "Back to Library")}
        </button>

        <div className="grid grid-cols-1 lg:grid-cols-5 gap-12">
          {/* Cover */}
          <div className="lg:col-span-2">
            <div className="rounded-sm overflow-hidden h-96 relative"
              style={{ background: book.coverBg, boxShadow: "8px 8px 30px rgba(90,55,30,.3), -2px 0 8px rgba(0,0,0,.15)" }}>
              <div className="absolute inset-0 opacity-10" style={{ backgroundImage: paperTexture }} />
              <div className="absolute left-0 top-0 w-4 h-full" style={{ background: "rgba(0,0,0,.2)" }} />
              <div className="absolute inset-0 flex flex-col justify-end p-8">
                <div className="mb-2 text-xs opacity-60" style={{ color: book.accentColor, fontFamily: "'Lato', sans-serif", letterSpacing: "0.15em" }}>{lang === "ar" ? book.catAr : book.catEn}</div>
                <div style={{ fontFamily: "'Amiri', serif", color: "#F5EFE3", fontSize: "1.8rem", lineHeight: 1.3, fontWeight: 700 }}>{lang === "ar" ? book.titleAr : book.titleEn}</div>
                <div className="mt-2 text-sm opacity-75" style={{ color: book.accentColor, fontFamily: "'Lato', sans-serif" }}>{lang === "ar" ? book.authorAr : book.authorEn}</div>
              </div>
            </div>
            <div className="mt-6 flex gap-3">
              <PrimaryBtn onClick={() => setPage("reading")} className="flex-1 text-center">{t(lang, "ابدأ القراءة", "Start Reading")}</PrimaryBtn>
              <button className="px-4 py-3 rounded transition-all duration-200" style={{ border: "1px solid #DDD0BB", color: "#6B4423", background: "#FCFAF5" }}><Heart size={16} /></button>
              <button className="px-4 py-3 rounded transition-all duration-200" style={{ border: "1px solid #DDD0BB", color: "#6B4423", background: "#FCFAF5" }}><Bookmark size={16} /></button>
            </div>
          </div>

          {/* Info */}
          <div className="lg:col-span-3">
            <div className="mb-2 text-xs uppercase tracking-widest" style={{ color: "#B88A3B", fontFamily: "'Lato', sans-serif" }}>{lang === "ar" ? book.catAr : book.catEn}</div>
            <h1 className="mb-2" style={{ fontFamily: fontDisplay(lang), fontSize: "clamp(1.5rem,3vw,2.4rem)", color: "#2A1A0E", lineHeight: 1.3 }}>{lang === "ar" ? book.titleAr : book.titleEn}</h1>
            <p className="mb-1 text-sm" style={{ fontFamily: fontBody(lang), color: "#6B4423" }}>{lang === "ar" ? book.authorAr : book.authorEn}</p>
            <div className="flex items-center gap-4 mb-6">
              <StarRating rating={book.rating} />
              <span style={{ color: "#8A6848", fontSize: "0.75rem", fontFamily: "'Lato', sans-serif" }}>{book.reviews} {t(lang, "تقييم", "reviews")}</span>
            </div>

            <div className="grid grid-cols-3 gap-4 mb-8 p-5 rounded" style={{ background: "#FCFAF5", border: "1px solid #DDD0BB" }}>
              {[{ label: t(lang, "السنة", "Year"), val: book.year }, { label: t(lang, "الصفحات", "Pages"), val: book.pages }, { label: t(lang, "التقييم", "Rating"), val: book.rating }].map((s, i) => (
                <div key={i} className="text-center">
                  <div style={{ fontFamily: "'Playfair Display', serif", fontSize: "1.2rem", color: "#6B4423", fontWeight: 600 }}>{s.val}</div>
                  <div style={{ fontFamily: fontBody(lang), fontSize: "0.7rem", color: "#8A6848" }}>{s.label}</div>
                </div>
              ))}
            </div>

            {/* Tabs */}
            <div className="flex gap-0 mb-6 rounded overflow-hidden" style={{ border: "1px solid #DDD0BB" }}>
              {tabs.map(tb => (
                <button key={tb.key} onClick={() => setTab(tb.key as "overview" | "reviews" | "quotes")}
                  className="flex-1 py-2.5 text-sm transition-all duration-200"
                  style={{ background: tab === tb.key ? "#6B4423" : "#FCFAF5", color: tab === tb.key ? "#F5EFE3" : "#6B4423", fontFamily: fontBody(lang), borderRight: "1px solid #DDD0BB" }}>
                  {lang === "ar" ? tb.ar : tb.en}
                </button>
              ))}
            </div>

            {tab === "overview" && (
              <p style={{ fontFamily: fontBody(lang), color: "#4A3020", fontSize: "0.95rem", lineHeight: 1.9 }}>
                {lang === "ar" ? book.descAr : book.descEn}
                {lang === "ar"
                  ? " هذا الكتاب يعدّ من أعظم ما أنتجه الفكر الإنساني عبر التاريخ، ويجسّد عمق التراث الأدبي والفكري العربي في أبهى صوره."
                  : " This book is considered among the greatest works the human mind has ever produced, embodying the depth of Arabic literary and intellectual heritage in its most splendid form."}
              </p>
            )}
            {tab === "reviews" && (
              <div className="space-y-4">
                {[{ name: "أحمد م.", text: "من أعظم ما قرأت في حياتي، يفتح آفاقاً لا تُرى إلا بعين القلب.", rating: 5 }, { name: "Sara K.", text: "A transformative reading experience. Every page reveals new wisdom.", rating: 5 }].map((r, i) => (
                  <div key={i} className="p-4 rounded" style={{ background: "#FCFAF5", border: "1px solid #DDD0BB" }}>
                    <div className="flex items-center justify-between mb-2">
                      <span style={{ fontFamily: fontBody(lang), color: "#4A2E1A", fontWeight: 600, fontSize: "0.9rem" }}>{r.name}</span>
                      <StarRating rating={r.rating} />
                    </div>
                    <p style={{ fontFamily: fontBody(lang), color: "#6A5040", fontSize: "0.85rem", lineHeight: 1.7 }}>{r.text}</p>
                  </div>
                ))}
              </div>
            )}
            {tab === "quotes" && (
              <div className="space-y-4">
                {QUOTES.slice(0, 2).map((q, i) => (
                  <blockquote key={i} className="p-5 rounded" style={{ background: "#FCFAF5", border: "1px solid #DDD0BB", borderRight: "3px solid #B88A3B" }}>
                    <p style={{ fontFamily: fontDisplay(lang), color: "#2A1A0E", fontSize: "0.95rem", lineHeight: 1.7, fontStyle: "italic" }}>{lang === "ar" ? q.textAr : q.textEn}</p>
                    <cite className="mt-2 block text-xs" style={{ color: "#B88A3B", fontFamily: "'Lato', sans-serif" }}>— {lang === "ar" ? q.authorAr : q.authorEn}</cite>
                  </blockquote>
                ))}
              </div>
            )}
          </div>
        </div>
      </div>
      <Footer lang={lang} setPage={setPage} />
    </div>
  );
}

// ─── Reading Page ──────────────────────────────────────────────────────────────
function ReadingPage({ lang, book, setPage }: { lang: Lang; book: typeof BOOKS[0]; setPage: (p: Page) => void }) {
  const sampleText = {
    ar: `اعلم أن الكلام في هذا العلم مستحدث الصنعة، غريب النزعة، غزير الفائدة. نحن نفردنا بتأسيس هذا العلم وتمهيد قواعده، وذلك أن كيفيات الوقائع والأحوال في العمران وطبائعها مودودة في كتب التاريخ. غير أنها مختلطة بغيرها ومتفرقة في أبواب الكتاب. فلو انتُزعت تلك الكيفيات ووضعت في باب مفرد وجُعلت ذلك الباب علماً مستقلاً بنفسه كان ذلك علماً صحيحاً.

وهذا العلم مستقل بنفسه، إذ له موضوع وهو العمران البشري والاجتماع الإنساني، وله مسائل وهي بيان ما يلحق العمران من العوارض والأحوال لذاته واحدة بعد أخرى. وهذا شأن كل علم من العلوم.`,
    en: `Know that the discussion of this science is novel in its subject matter and unusual in its approach, yet immensely profitable. We have given exclusive attention to establishing this science and laying its foundations. For the conditions and characteristics of events in civilization, along with their nature, are found in the books of history. However, they are mixed in with other matters and scattered throughout different chapters.

Were these conditions extracted, placed in a separate chapter, and made into an independent science, this would be a legitimate science. And this science is independent in itself, for it has a subject matter—namely, human civilization and social organization—and it has problems to examine.`,
  };

  return (
    <div className="min-h-screen pt-20" style={{ background: "#F8F4EC", backgroundImage: paperTexture }}>
      <div className="max-w-3xl mx-auto px-6 py-12">
        <button onClick={() => setPage("book")} className="flex items-center gap-2 mb-10 text-sm"
          style={{ color: "#8A6848", fontFamily: fontBody(lang) }}>
          {lang === "ar" ? <ChevronRight size={16} /> : <ChevronLeft size={16} />}
          {t(lang, "العودة إلى الكتاب", "Back to Book")}
        </button>
        <div className="mb-8 text-center">
          <div className="text-xs mb-2 uppercase tracking-widest" style={{ color: "#B88A3B", fontFamily: "'Lato', sans-serif" }}>{lang === "ar" ? book.catAr : book.catEn}</div>
          <h2 style={{ fontFamily: fontDisplay(lang), color: "#4A2E1A", fontSize: "1.6rem" }}>{lang === "ar" ? book.titleAr : book.titleEn}</h2>
          <p className="text-sm mt-1" style={{ fontFamily: fontBody(lang), color: "#8A6848" }}>{lang === "ar" ? book.authorAr : book.authorEn}</p>
        </div>
        <div className="mb-6 flex items-center justify-between text-xs" style={{ color: "#8A6848", fontFamily: "'Lato', sans-serif", borderBottom: "1px solid #DDD0BB", paddingBottom: "12px" }}>
          <span>{t(lang, "الفصل الأول", "Chapter One")}</span>
          <span>{t(lang, "المقدمة", "Introduction")}</span>
          <span>1 / {book.pages}</span>
        </div>
        <div className="rounded p-8 md:p-12" style={{ background: "#FCFAF5", boxShadow: "0 8px 40px rgba(90,55,30,.1)", border: "1px solid #DDD0BB" }}>
          <p className="whitespace-pre-line" style={{ fontFamily: lang === "ar" ? "'Amiri', serif" : "'Playfair Display', serif", color: "#2A1A0E", fontSize: lang === "ar" ? "1.15rem" : "1.05rem", lineHeight: 2, textAlign: lang === "ar" ? "right" : "justify" }}>
            {sampleText[lang]}
          </p>
        </div>
        <div className="flex items-center justify-between mt-8">
          <button className="flex items-center gap-2 px-5 py-2.5 rounded text-sm" style={{ border: "1px solid #DDD0BB", color: "#6B4423", fontFamily: fontBody(lang), background: "#FCFAF5" }}>
            {lang === "ar" ? <ChevronRight size={16} /> : <ChevronLeft size={16} />} {t(lang, "السابق", "Previous")}
          </button>
          <span style={{ color: "#8A6848", fontSize: "0.75rem", fontFamily: "'Lato', sans-serif" }}>1 / {book.pages}</span>
          <button className="flex items-center gap-2 px-5 py-2.5 rounded text-sm" style={{ background: "#6B4423", color: "#F5EFE3", fontFamily: fontBody(lang) }}>
            {t(lang, "التالي", "Next")} {lang === "ar" ? <ChevronLeft size={16} /> : <ChevronRight size={16} />}
          </button>
        </div>
      </div>
    </div>
  );
}

// ─── Login Page ────────────────────────────────────────────────────────────────
function LoginPage({ lang, setPage }: { lang: Lang; setPage: (p: Page) => void }) {
  const [email, setEmail] = useState("");
  const [pass, setPass] = useState("");
  const [isReg, setIsReg] = useState(false);

  return (
    <div className="min-h-screen flex" style={{ background: "#F5EFE3", backgroundImage: paperTexture }}>
      {/* Left panel */}
      <div className="hidden lg:flex flex-1 relative items-center justify-center"
        style={{ backgroundImage: `url("https://images.unsplash.com/photo-1481627834876-b7833e8f5570?w=900&h=1200&fit=crop&auto=format")`, backgroundSize: "cover", backgroundPosition: "center" }}>
        <div className="absolute inset-0" style={{ background: "rgba(30,12,3,.75)" }} />
        <div className="relative z-10 text-center p-12">
          <div style={{ color: "#B88A3B", fontSize: "3rem", fontFamily: "'Amiri', serif", lineHeight: 1, marginBottom: "16px" }}>❧</div>
          <div style={{ fontFamily: "'Amiri', serif", fontSize: "2.2rem", color: "#F5EFE3", fontWeight: 700 }}>بين السطور</div>
          <div style={{ fontFamily: "'Lato', sans-serif", fontSize: "0.65rem", color: "#B88A3B", letterSpacing: "0.25em", marginTop: "8px" }}>BETWEEN THE LINES</div>
          <p className="mt-8 text-sm leading-relaxed" style={{ fontFamily: fontBody(lang), color: "rgba(245,239,227,.6)", maxWidth: "320px" }}>
            {t(lang, "مكتبتك الرقمية للأدب العربي والعالمي في مكان واحد", "Your digital library for Arabic and world literature in one place")}
          </p>
        </div>
      </div>

      {/* Form panel */}
      <div className="flex-1 flex items-center justify-center px-6 py-12">
        <div className="w-full max-w-md">
          <button onClick={() => setPage("home")} className="flex items-center gap-2 mb-10 text-sm"
            style={{ color: "#8A6848", fontFamily: fontBody(lang) }}>
            {lang === "ar" ? <ChevronRight size={16} /> : <ChevronLeft size={16} />}
            {t(lang, "العودة للرئيسية", "Back to Home")}
          </button>

          <div className="rounded p-8" style={{ background: "#FCFAF5", border: "1px solid #DDD0BB", boxShadow: "0 8px 40px rgba(90,55,30,.1)" }}>
            <OrnamentDivider />
            <h2 className="text-center mb-2" style={{ fontFamily: fontDisplay(lang), fontSize: "1.6rem", color: "#4A2E1A" }}>
              {t(lang, isReg ? "إنشاء حساب" : "مرحباً بعودتك", isReg ? "Create Account" : "Welcome Back")}
            </h2>
            <p className="text-center mb-8 text-sm" style={{ fontFamily: fontBody(lang), color: "#8A6848" }}>
              {t(lang, isReg ? "انضم إلى مجتمع القراء" : "سجّل دخولك لمكتبتك", isReg ? "Join our reading community" : "Sign in to your library")}
            </p>

            <div className="space-y-4">
              {isReg && (
                <div>
                  <label className="block text-xs mb-2" style={{ fontFamily: fontBody(lang), color: "#6B4423" }}>{t(lang, "الاسم الكامل", "Full Name")}</label>
                  <input dir={lang === "ar" ? "rtl" : "ltr"} placeholder={t(lang, "أدخل اسمك", "Enter your name")}
                    className="w-full px-4 py-3 rounded outline-none text-sm transition-all"
                    style={{ background: "#F8F4EC", border: "1px solid #DDD0BB", fontFamily: fontBody(lang), color: "#2A1A0E" }} />
                </div>
              )}
              <div>
                <label className="block text-xs mb-2" style={{ fontFamily: fontBody(lang), color: "#6B4423" }}>{t(lang, "البريد الإلكتروني", "Email Address")}</label>
                <input value={email} onChange={e => setEmail(e.target.value)} dir="ltr" type="email" placeholder="you@example.com"
                  className="w-full px-4 py-3 rounded outline-none text-sm"
                  style={{ background: "#F8F4EC", border: "1px solid #DDD0BB", fontFamily: "'Lato', sans-serif", color: "#2A1A0E" }} />
              </div>
              <div>
                <label className="block text-xs mb-2" style={{ fontFamily: fontBody(lang), color: "#6B4423" }}>{t(lang, "كلمة المرور", "Password")}</label>
                <input value={pass} onChange={e => setPass(e.target.value)} dir="ltr" type="password" placeholder="••••••••"
                  className="w-full px-4 py-3 rounded outline-none text-sm"
                  style={{ background: "#F8F4EC", border: "1px solid #DDD0BB", fontFamily: "'Lato', sans-serif", color: "#2A1A0E" }} />
              </div>
            </div>

            <button onClick={() => setPage("home")} className="w-full mt-6 py-3.5 rounded text-sm transition-colors duration-200"
              style={{ background: "#6B4423", color: "#F5EFE3", fontFamily: fontBody(lang), letterSpacing: "0.05em" }}
              onMouseEnter={e => { (e.currentTarget as HTMLElement).style.background = "#B88A3B"; }}
              onMouseLeave={e => { (e.currentTarget as HTMLElement).style.background = "#6B4423"; }}>
              {t(lang, isReg ? "إنشاء الحساب" : "تسجيل الدخول", isReg ? "Create Account" : "Sign In")}
            </button>

            <div className="mt-6 text-center">
              <button onClick={() => setIsReg(!isReg)} className="text-xs transition-colors duration-200"
                style={{ fontFamily: fontBody(lang), color: "#8A6848" }}
                onMouseEnter={e => { (e.currentTarget as HTMLElement).style.color = "#6B4423"; }}
                onMouseLeave={e => { (e.currentTarget as HTMLElement).style.color = "#8A6848"; }}>
                {t(lang, isReg ? "لديك حساب؟ سجّل دخولك" : "لا تملك حساباً؟ أنشئ واحداً", isReg ? "Already have an account? Sign in" : "No account? Create one")}
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

// ─── Admin Dashboard ───────────────────────────────────────────────────────────
function AdminPage({ lang, setPage }: { lang: Lang; setPage: (p: Page) => void }) {
  const [activeSec, setActiveSec] = useState("dashboard");
  const stats = [
    { icon: BookOpen, ar: "إجمالي الكتب", en: "Total Books", val: "12,487", trend: "+124 هذا الشهر" },
    { icon: Users, ar: "القراء", en: "Readers", val: "45,219", trend: "+1,240 هذا الشهر" },
    { icon: Eye, ar: "القراءات", en: "Reading Sessions", val: "189,420", trend: "+8,400 هذا الشهر" },
    { icon: Star, ar: "متوسط التقييم", en: "Avg Rating", val: "4.7", trend: "↑ 0.2 هذا الشهر" },
  ];
  const navItems = [
    { key: "dashboard", icon: LayoutDashboard, ar: "لوحة التحكم", en: "Dashboard" },
    { key: "books", icon: BookOpen, ar: "الكتب", en: "Books" },
    { key: "authors", icon: Feather, ar: "المؤلفون", en: "Authors" },
    { key: "categories", icon: Layers, ar: "التصنيفات", en: "Categories" },
    { key: "articles", icon: FileText, ar: "المقالات", en: "Articles" },
    { key: "reviews", icon: MessageSquare, ar: "التقييمات", en: "Reviews" },
    { key: "users", icon: Users, ar: "المستخدمون", en: "Users" },
    { key: "newsletter", icon: Mail, ar: "النشرة البريدية", en: "Newsletter" },
    { key: "settings", icon: Settings, ar: "الإعدادات", en: "Settings" },
  ];

  return (
    <div className="min-h-screen flex" style={{ background: "#F5EFE3", fontFamily: fontBody(lang) }}>
      {/* Sidebar */}
      <aside className="w-60 shrink-0 flex flex-col" style={{ background: "#2A1A0E", borderRight: "1px solid rgba(184,138,59,.15)" }}>
        <div className="p-6 flex items-center gap-3" style={{ borderBottom: "1px solid rgba(184,138,59,.15)" }}>
          <BookOpen size={18} stroke="#B88A3B" />
          <div>
            <div style={{ fontFamily: "'Amiri', serif", fontSize: "0.95rem", color: "#F5EFE3", fontWeight: 700 }}>بين السطور</div>
            <div style={{ fontFamily: "'Lato', sans-serif", fontSize: "0.55rem", color: "#B88A3B", letterSpacing: "0.15em" }}>ADMIN PANEL</div>
          </div>
        </div>
        <nav className="flex-1 p-4 space-y-1">
          {navItems.map(item => {
            const Icon = item.icon;
            return (
              <button key={item.key} onClick={() => setActiveSec(item.key)}
                className="w-full flex items-center gap-3 px-3 py-2.5 rounded text-sm text-start transition-all duration-200"
                style={{ background: activeSec === item.key ? "rgba(184,138,59,.12)" : "transparent", color: activeSec === item.key ? "#C9A96E" : "rgba(245,239,227,.5)", borderLeft: activeSec === item.key ? "2px solid #B88A3B" : "2px solid transparent" }}>
                <Icon size={15} strokeWidth={1.5} />
                {lang === "ar" ? item.ar : item.en}
              </button>
            );
          })}
        </nav>
        <div className="p-4" style={{ borderTop: "1px solid rgba(184,138,59,.15)" }}>
          <button onClick={() => setPage("home")} className="w-full flex items-center gap-3 px-3 py-2.5 rounded text-sm"
            style={{ color: "rgba(245,239,227,.4)", fontFamily: fontBody(lang) }}>
            <LogOut size={15} />
            {t(lang, "خروج", "Logout")}
          </button>
        </div>
      </aside>

      {/* Main content */}
      <main className="flex-1 overflow-auto">
        <div className="px-8 py-6" style={{ borderBottom: "1px solid #DDD0BB", background: "#FCFAF5" }}>
          <h1 style={{ fontFamily: fontDisplay(lang), fontSize: "1.4rem", color: "#2A1A0E" }}>
            {lang === "ar" ? navItems.find(n => n.key === activeSec)?.ar : navItems.find(n => n.key === activeSec)?.en}
          </h1>
          <p className="text-xs mt-1" style={{ color: "#8A6848", fontFamily: "'Lato', sans-serif" }}>
            {t(lang, "آخر تحديث: اليوم، 10:42 ص", "Last updated: Today, 10:42 AM")}
          </p>
        </div>

        <div className="p-8">
          {/* Stats */}
          <div className="grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-4 gap-5 mb-8">
            {stats.map((s, i) => {
              const Icon = s.icon;
              return (
                <div key={i} className="p-6 rounded" style={{ background: "#FCFAF5", border: "1px solid #DDD0BB", boxShadow: "0 2px 12px rgba(90,55,30,.06)" }}>
                  <div className="flex items-start justify-between mb-4">
                    <div className="w-10 h-10 rounded flex items-center justify-center" style={{ background: "rgba(107,68,35,.08)" }}>
                      <Icon size={18} stroke="#6B4423" strokeWidth={1.5} />
                    </div>
                    <TrendingUp size={14} stroke="#68714F" />
                  </div>
                  <div style={{ fontFamily: "'Playfair Display', serif", fontSize: "1.7rem", color: "#2A1A0E", fontWeight: 600 }}>{s.val}</div>
                  <div className="text-xs mt-1" style={{ fontFamily: fontBody(lang), color: "#8A6848" }}>{lang === "ar" ? s.ar : s.en}</div>
                  <div className="text-xs mt-1" style={{ color: "#68714F", fontFamily: "'Lato', sans-serif" }}>{s.trend}</div>
                </div>
              );
            })}
          </div>

          {/* Recent Books table */}
          <div className="rounded overflow-hidden" style={{ background: "#FCFAF5", border: "1px solid #DDD0BB" }}>
            <div className="px-6 py-4 flex items-center justify-between" style={{ borderBottom: "1px solid #DDD0BB" }}>
              <h3 style={{ fontFamily: fontDisplay(lang), fontSize: "1rem", color: "#2A1A0E" }}>{t(lang, "آخر الكتب المضافة", "Recently Added Books")}</h3>
              <button className="text-xs" style={{ color: "#B88A3B", fontFamily: fontBody(lang) }}>{t(lang, "عرض الكل", "View All")}</button>
            </div>
            <div className="overflow-x-auto">
              <table className="w-full text-sm">
                <thead>
                  <tr style={{ background: "#F8F4EC", borderBottom: "1px solid #DDD0BB" }}>
                    {[t(lang, "الكتاب", "Book"), t(lang, "المؤلف", "Author"), t(lang, "التصنيف", "Category"), t(lang, "التقييم", "Rating"), t(lang, "الحالة", "Status")].map((h, i) => (
                      <th key={i} className="px-5 py-3 text-start text-xs font-medium" style={{ color: "#8A6848", fontFamily: "'Lato', sans-serif", letterSpacing: "0.08em" }}>{h}</th>
                    ))}
                  </tr>
                </thead>
                <tbody>
                  {BOOKS.slice(0, 5).map((b, i) => (
                    <tr key={b.id} style={{ borderBottom: i < 4 ? "1px solid #EFE3CE" : "none" }}>
                      <td className="px-5 py-3.5" style={{ fontFamily: fontBody(lang), color: "#2A1A0E", fontSize: "0.85rem" }}>{lang === "ar" ? b.titleAr : b.titleEn}</td>
                      <td className="px-5 py-3.5" style={{ fontFamily: fontBody(lang), color: "#6A5040", fontSize: "0.82rem" }}>{lang === "ar" ? b.authorAr : b.authorEn}</td>
                      <td className="px-5 py-3.5" style={{ fontFamily: fontBody(lang), color: "#8A6848", fontSize: "0.8rem" }}>{lang === "ar" ? b.catAr : b.catEn}</td>
                      <td className="px-5 py-3.5">
                        <span style={{ color: "#B88A3B", fontFamily: "'Lato', sans-serif", fontSize: "0.8rem" }}>★ {b.rating}</span>
                      </td>
                      <td className="px-5 py-3.5">
                        <span className="px-2.5 py-1 rounded-full text-xs" style={{ background: "rgba(104,113,79,.1)", color: "#68714F", fontFamily: "'Lato', sans-serif" }}>
                          {t(lang, "منشور", "Published")}
                        </span>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        </div>
      </main>
    </div>
  );
}

// ─── App ───────────────────────────────────────────────────────────────────────
export default function App() {
  const [lang, setLang] = useState<Lang>("ar");
  const [page, setPage] = useState<Page>("home");
  const [scrolled, setScrolled] = useState(false);
  const [mobileOpen, setMobileOpen] = useState(false);
  const [selectedBook, setSelectedBook] = useState<typeof BOOKS[0]>(BOOKS[0]);

  useEffect(() => {
    const onScroll = () => setScrolled(window.scrollY > 64);
    window.addEventListener("scroll", onScroll);
    return () => window.removeEventListener("scroll", onScroll);
  }, []);

  useEffect(() => { window.scrollTo(0, 0); setMobileOpen(false); }, [page]);

  const isFullNav = page !== "admin";

  return (
    <div dir={lang === "ar" ? "rtl" : "ltr"} style={{ fontFamily: fontBody(lang), background: "#F5EFE3" }}>
      {isFullNav && (
        <Nav lang={lang} setLang={setLang} page={page} setPage={setPage} scrolled={scrolled} mobileOpen={mobileOpen} setMobileOpen={setMobileOpen} />
      )}

      {page === "home" && <HomePage lang={lang} setPage={setPage} setBook={setSelectedBook} />}
      {page === "library" && <LibraryPage lang={lang} setPage={setPage} setBook={setSelectedBook} />}
      {page === "book" && <BookDetailPage lang={lang} book={selectedBook} setPage={setPage} />}
      {page === "reading" && <ReadingPage lang={lang} book={selectedBook} setPage={setPage} />}
      {page === "login" && <LoginPage lang={lang} setPage={setPage} />}
      {page === "admin" && <AdminPage lang={lang} setPage={setPage} />}

      {/* Demo nav strip */}
      {page !== "admin" && (
        <div className="fixed bottom-5 left-1/2 -translate-x-1/2 z-50 flex items-center gap-1 px-3 py-2 rounded-full shadow-lg"
          style={{ background: "rgba(42,26,14,.92)", backdropFilter: "blur(12px)", border: "1px solid rgba(184,138,59,.25)" }}>
          {([["home", "🏛", "الرئيسية"], ["library", "📚", "المكتبة"], ["book", "📖", "كتاب"], ["reading", "✒️", "قراءة"], ["login", "🔑", "دخول"], ["admin", "⚙️", "إدارة"]] as [Page, string, string][]).map(([p, emoji, label]) => (
            <button key={p} onClick={() => setPage(p)}
              className="flex items-center gap-1 px-3 py-1.5 rounded-full text-xs transition-all duration-200"
              style={{ background: page === p ? "#B88A3B" : "transparent", color: page === p ? "#2A1A0E" : "rgba(245,239,227,.55)", fontFamily: fontBody(lang) }}>
              <span>{emoji}</span>
              <span className="hidden sm:inline">{label}</span>
            </button>
          ))}
        </div>
      )}
    </div>
  );
}
