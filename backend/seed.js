// backend/seedSources.js
const path = require('path');
const mongoose = require('mongoose');
const { Source, Category } = require('./models'); 
require('dotenv').config({ path: path.join(__dirname, '.env') });

const dummyCategories = [
  {
    name: 'Higher Education',
    slug: 'higher-education',
    description: 'Articles and news about universities, polytechnics, research, admissions, and academic life.'
  },
  {
    name: 'Policy and Governance',
    slug: 'policy-and-governance',
    description: 'Coverage of educational policy, regulation, administration, and governance reforms.'
  },
  {
    name: 'Institutional Funding',
    slug: 'institutional-funding',
    description: 'Coverage of scholarships, grants, budgets, and funding initiatives for African education.'
  },
  {
    name: 'Research and Innovation',
    slug: 'research-and-innovation',
    description: 'Stories on academic research, innovation, edtech, and science development in education.'
  }
];

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
    name: "GhanaWeb - Education",
    siteUrl: "https://www.ghanaweb.com/GhanaHomePage/education/",
    feedUrl: "https://cdn.ghanaweb.com/feed/newsfeed.xml",
    feedType: "scrape-static",
    country: "GH",
    isActive: true,
    priority: "high",
    defaultCategory: "Policy and Governance"
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
    await Category.deleteMany({});
    console.log('[SEED] Stale sources and category taxonomy cleared from database records.');

    // Write the newly expanded taxonomy and regional source entries
    await Category.insertMany(dummyCategories);
    await Source.insertMany(dummySources);
    console.log(`[SEED SUCCESS] ${dummyCategories.length} categories and ${dummySources.length} active regional sources registered smoothly!`);

  } catch (err) {
    console.error('Seeding halted with error:', err);
  } finally {
    await mongoose.disconnect();
    process.exit(0);
  }
}

seedDatabase();