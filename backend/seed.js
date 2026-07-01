// backend/seedSources.js
const path = require('path');
const mongoose = require('mongoose');
const { Source } = require('./models'); 
require('dotenv').config({ path: path.join(__dirname, '.env') });

const dummySources = [
  // ==========================================================================
  // ============================ NIGERIA FEEDS ===============================
  // ==========================================================================
  {
    name: "Punch Newspapers - Education",
    siteUrl: "https://punchng.com/topics/education/",
    feedUrl: "https://punchng.com/topics/education/feed/",
    feedType: "rss",
    country: "NG",
    isActive: true,
    priority: "high",
    defaultCategory: "Higher Education"
  },
  {
    name: "Punch Newspapers - Sports",
    siteUrl: "https://punchng.com/topics/sports/",
    feedUrl: "https://punchng.com/topics/sports/feed/",
    feedType: "rss",
    country: "NG",
    isActive: true,
    priority: "high",
    defaultCategory: "Sports"
  },
  {
    name: "Vanguard News - Sports",
    siteUrl: "https://www.vanguardngr.com/category/sports/",
    feedUrl: "https://www.vanguardngr.com/category/sports/", 
    feedType: "scrape-static",
    country: "NG",
    isActive: true,
    priority: "high",
    defaultCategory: "Sports"
  },
  {
    name: "Premium Times - Education",
    siteUrl: "https://www.premiumtimesng.com/category/news/top-news",
    feedUrl: "https://www.premiumtimesng.com/category/features-and-interviews/education-features/feed",
    feedType: "rss",
    country: "NG",
    isActive: true,
    priority: "high",
    defaultCategory: "Policy and Governance"
  },

  // ==========================================================================
  // ============================= GHANA FEEDS ================================
  // ==========================================================================
  {
    name: "GhanaWeb - General News",
    siteUrl: "https://www.ghanaweb.com",
    feedUrl: "https://cdn.ghanaweb.com/feed/newsfeed.xml",
    feedType: "scrape-static",
    country: "GH",
    isActive: true,
    priority: "high",
    defaultCategory: "Policy and Governance"
  },
  {
    name: "GhanaWeb - Sports",
    siteUrl: "https://www.ghanaweb.com",
    feedUrl: "https://cdn.ghanaweb.com/feed/sportsfeed.xml",
    feedType: "scrape-static",
    country: "GH",
    isActive: true,
    priority: "high",
    defaultCategory: "Sports"
  },
  {
    name: "ModernGhana - Higher Education",
    siteUrl: "https://www.modernghana.com/section/14/education.html",
    feedUrl: "https://www.modernghana.com/section/14/education.html",
    feedType: "scrape-static",
    country: "GH",
    isActive: true,
    priority: "high",
    defaultCategory: "Higher Education"
  },
  {
    name: "Graphic Online - Sports",
    siteUrl: "https://www.graphic.com.gh/sports.html",
    feedUrl: "https://www.graphic.com.gh/sports.xml",
    feedType: "rss",
    country: "GH",
    isActive: true,
    priority: "high",
    defaultCategory: "Sports"
  },

  // ==========================================================================
  // ============================= KENYA FEEDS ================================
  // ==========================================================================
  {
    name: "Capital FM Kenya - Education",
    siteUrl: "https://www.capitalfm.co.ke/news/category/education/",
    feedUrl: "https://www.capitalfm.co.ke/news/category/education/feed/",
    feedType: "rss",
    country: "KE",
    isActive: true,
    priority: "high",
    defaultCategory: "Higher Education"
  },
  {
    name: "The Standard Kenya - Sports",
    siteUrl: "https://www.standardmedia.co.ke/category/4/sports",
    feedUrl: "https://www.standardmedia.co.ke/rss/sports.php",
    feedType: "rss",
    country: "KE",
    isActive: true,
    priority: "high",
    defaultCategory: "Sports"
  },
  {
    name: "Citizen Digital Kenya - Sports",
    siteUrl: "https://www.citizen.digital/sports",
    feedUrl: "https://www.citizen.digital/rss/sports",
    feedType: "rss",
    country: "KE",
    isActive: true,
    priority: "high",
    defaultCategory: "Sports"
  },
  {
    name: "Business Daily Kenya - Policy",
    siteUrl: "https://www.businessdailyafrica.com",
    feedUrl: "https://www.businessdailyafrica.com/service/search/feed/21456/4295482/rss.xml",
    feedType: "rss",
    country: "KE",
    isActive: true,
    priority: "high",
    defaultCategory: "Institutional Funding"
  }
];

async function seedDatabase() {
  try {
    // Standardized to use your exact active MONGODB_URI parameter
    await mongoose.connect(process.env.MONGODB_URI);
    console.log('[SEED] Connected to database.');

    // Wipe old mappings cleanly
    await Source.deleteMany({});
    console.log('[SEED] Stale sources cleared from database records.');

    // Write the newly expanded regional array entries
    await Source.insertMany(dummySources);
    console.log(`[SEED SUCCESS] ${dummySources.length} active regional sources registered smoothly!`);

  } catch (err) {
    console.error('Seeding halted with error:', err);
  } finally {
    await mongoose.disconnect();
    process.exit(0);
  }
}

seedDatabase();