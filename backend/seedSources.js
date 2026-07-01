const path = require('path');
const mongoose = require('mongoose');
const { Source } = require('./models');
require('dotenv').config({ path: path.join(__dirname, '.env') });

const sources = [
  // Nigeria (17)
  { name: "Punch Newspapers - Education", siteUrl: "https://punchng.com/topics/education/", feedUrl: "https://punchng.com/topics/education/feed/", feedType: "rss", country: "NG", isActive: true, priority: "high", defaultCategory: "Higher Education" },
  { name: "Premium Times - Education", siteUrl: "https://www.premiumtimesng.com/", feedUrl: "https://www.premiumtimesng.com/category/features-and-interviews/education-features/feed", feedType: "rss", country: "NG", isActive: true, priority: "high", defaultCategory: "Policy and Governance" },
  { name: "The Guardian Nigeria - Education", siteUrl: "https://guardian.ng/news/education/", feedUrl: "https://guardian.ng/feed/", feedType: "rss", country: "NG", isActive: true, priority: "high", defaultCategory: "Higher Education" },
  { name: "Vanguard Nigeria - Education", siteUrl: "https://www.vanguardngr.com/category/education/", feedUrl: "https://www.vanguardngr.com/feed/", feedType: "rss", country: "NG", isActive: true, priority: "high", defaultCategory: "Higher Education" },
  { name: "ThisDay - Education", siteUrl: "https://www.thisdaylive.com/", feedUrl: "", feedType: "scrape-static", country: "NG", isActive: true, priority: "high", defaultCategory: "Policy and Governance" },
  { name: "Daily Trust - Education", siteUrl: "https://dailytrust.com/tags/education/", feedUrl: "", feedType: "scrape-static", country: "NG", isActive: true, priority: "high", defaultCategory: "Higher Education" },
  { name: "The Nation Nigeria - Education", siteUrl: "https://thenationonlineng.net/category/education/", feedUrl: "https://thenationonlineng.net/feed/", feedType: "rss", country: "NG", isActive: true, priority: "high", defaultCategory: "Higher Education" },
  { name: "TheCable - Education", siteUrl: "https://www.thecable.ng/tag/education", feedUrl: "https://www.thecable.ng/feed", feedType: "rss", country: "NG", isActive: true, priority: "high", defaultCategory: "Policy and Governance" },
  { name: "Daily Post Nigeria - Education", siteUrl: "https://dailypost.ng/category/education/", feedUrl: "", feedType: "scrape-static", country: "NG", isActive: true, priority: "high", defaultCategory: "Higher Education" },
  { name: "Leadership Newspaper - Education", siteUrl: "https://leadership.ng/category/education/", feedUrl: "https://leadership.ng/feed/", feedType: "rss", country: "NG", isActive: true, priority: "high", defaultCategory: "Higher Education" },
  { name: "Channels TV - Education", siteUrl: "https://www.channelstv.com/tag/education/", feedUrl: "https://www.channelstv.com/feed/", feedType: "rss", country: "NG", isActive: true, priority: "high", defaultCategory: "Higher Education" },
  { name: "EducationNG", siteUrl: "https://education.gov.ng/", feedUrl: "", feedType: "scrape-static", country: "NG", isActive: true, priority: "high", defaultCategory: "Institutional Funding" },
  { name: "Independent Nigeria - Education", siteUrl: "https://independent.ng/category/education/", feedUrl: "", feedType: "scrape-static", country: "NG", isActive: true, priority: "standard", defaultCategory: "Higher Education" },
  { name: "SaharaReporters - Education", siteUrl: "http://saharareporters.com/tags/education", feedUrl: "", feedType: "scrape-static", country: "NG", isActive: true, priority: "standard", defaultCategory: "Policy and Governance" },
  { name: "Nairametrics - Education & Skills", siteUrl: "https://nairametrics.com/category/education/", feedUrl: "", feedType: "scrape-static", country: "NG", isActive: true, priority: "standard", defaultCategory: "Research and Innovation" },
  { name: "BusinessDay Nigeria - Education", siteUrl: "https://businessday.ng/tag/education/", feedUrl: "", feedType: "scrape-static", country: "NG", isActive: true, priority: "high", defaultCategory: "Institutional Funding" },
  { name: "The Nigerian Voice - Education", siteUrl: "https://www.thenigerianvoice.com/tags/education/", feedUrl: "", feedType: "scrape-static", country: "NG", isActive: true, priority: "low", defaultCategory: "Higher Education" },

  // Kenya (17)
  { name: "Daily Nation - Education", siteUrl: "https://nation.africa/kenya/education", feedUrl: "https://nation.africa/kenya/rss", feedType: "rss", country: "KE", isActive: true, priority: "high", defaultCategory: "Higher Education" },
  { name: "The Standard - Education", siteUrl: "https://www.standardmedia.co.ke/education", feedUrl: "https://www.standardmedia.co.ke/rss/headlines.php", feedType: "rss", country: "KE", isActive: true, priority: "high", defaultCategory: "Higher Education" },
  { name: "The Star Kenya - Education", siteUrl: "https://www.the-star.co.ke/topic/education/", feedUrl: "", feedType: "scrape-static", country: "KE", isActive: true, priority: "standard", defaultCategory: "Policy and Governance" },
  { name: "Citizen Digital - Education", siteUrl: "https://citizen.digital/news/education/", feedUrl: "", feedType: "scrape-static", country: "KE", isActive: true, priority: "standard", defaultCategory: "Policy and Governance" },
  { name: "Capital FM Kenya - Education", siteUrl: "https://www.capitalfm.co.ke/news/category/education/", feedUrl: "https://www.capitalfm.co.ke/news/category/education/feed/", feedType: "rss", country: "KE", isActive: true, priority: "high", defaultCategory: "Policy and Governance" },
  { name: "Nation Africa - Schools & Education", siteUrl: "https://nation.africa/kenya/sports/education", feedUrl: "https://nation.africa/kenya/rss", feedType: "rss", country: "KE", isActive: true, priority: "high", defaultCategory: "Higher Education" },
  { name: "The Nairobian - Education", siteUrl: "https://nairobian.co.ke/category/education/", feedUrl: "", feedType: "scrape-static", country: "KE", isActive: true, priority: "low", defaultCategory: "Higher Education" },
  { name: "K24 TV - Education", siteUrl: "https://www.k24tv.co.ke/tag/education/", feedUrl: "", feedType: "scrape-static", country: "KE", isActive: true, priority: "standard", defaultCategory: "Higher Education" },
  { name: "The Conversation Africa - Education (Kenya)", siteUrl: "https://theconversation.com/africa/topics/education-56", feedUrl: "", feedType: "scrape-static", country: "KE", isActive: true, priority: "standard", defaultCategory: "Research and Innovation" },
  { name: "Education News Kenya", siteUrl: "https://www.educationnews.co.ke/", feedUrl: "", feedType: "scrape-static", country: "KE", isActive: true, priority: "high", defaultCategory: "Higher Education" },
  { name: "University of Nairobi News", siteUrl: "https://uonbi.ac.ke/news", feedUrl: "", feedType: "scrape-static", country: "KE", isActive: true, priority: "standard", defaultCategory: "Higher Education" },
  { name: "Kenyans.co.ke - Education", siteUrl: "https://www.kenyans.co.ke/tags/education", feedUrl: "", feedType: "scrape-static", country: "KE", isActive: true, priority: "low", defaultCategory: "Higher Education" },
  { name: "Tuko News - Education", siteUrl: "https://www.tuko.co.ke/tags/education/", feedUrl: "", feedType: "scrape-static", country: "KE", isActive: true, priority: "low", defaultCategory: "Higher Education" },
  { name: "Education Today Kenya", siteUrl: "https://educationtoday.co.ke/", feedUrl: "", feedType: "scrape-static", country: "KE", isActive: true, priority: "standard", defaultCategory: "Higher Education" },
  { name: "Moi University News", siteUrl: "https://mu.ac.ke/news/", feedUrl: "", feedType: "scrape-static", country: "KE", isActive: true, priority: "low", defaultCategory: "Higher Education" },
  { name: "Jambo News - Education", siteUrl: "https://www.jambonewspost.com/tags/education/", feedUrl: "", feedType: "scrape-static", country: "KE", isActive: true, priority: "low", defaultCategory: "Higher Education" },
  { name: "Kenyatta University News", siteUrl: "https://www.ku.ac.ke/news", feedUrl: "", feedType: "scrape-static", country: "KE", isActive: true, priority: "standard", defaultCategory: "Higher Education" },

  // Ghana (16)
  { name: "GhanaWeb - Education", siteUrl: "https://www.ghanaweb.com/GhanaHomePage/education/", feedUrl: "https://cdn.ghanaweb.com/feed/newsfeed.xml", feedType: "rss", country: "GH", isActive: true, priority: "high", defaultCategory: "Higher Education" },
  { name: "ModernGhana - Higher Education", siteUrl: "https://www.modernghana.com/section/14/education.html", feedUrl: "https://www.modernghana.com/rss", feedType: "rss", country: "GH", isActive: true, priority: "high", defaultCategory: "Higher Education" },
  { name: "Joy Online - Education", siteUrl: "https://www.myjoyonline.com/topics/education/", feedUrl: "https://www.myjoyonline.com/feed/", feedType: "rss", country: "GH", isActive: true, priority: "high", defaultCategory: "Higher Education" },
  { name: "Graphic Online - Education", siteUrl: "https://www.graphic.com.gh/news/education.html", feedUrl: "", feedType: "scrape-static", country: "GH", isActive: true, priority: "high", defaultCategory: "Higher Education" },
  { name: "Citi Newsroom - Education", siteUrl: "https://citinewsroom.com/tag/education/", feedUrl: "https://citinewsroom.com/tag/education/feed/", feedType: "rss", country: "GH", isActive: true, priority: "standard", defaultCategory: "Policy and Governance" },
  { name: "Ghana News Agency - Education", siteUrl: "https://gna.org.gh/category/education/", feedUrl: "", feedType: "scrape-static", country: "GH", isActive: true, priority: "standard", defaultCategory: "Higher Education" },
  { name: "MyJoyOnline - Universities", siteUrl: "https://www.myjoyonline.com/tag/universities/", feedUrl: "", feedType: "scrape-static", country: "GH", isActive: true, priority: "standard", defaultCategory: "Higher Education" },
  { name: "University of Ghana - News", siteUrl: "https://www.ug.edu.gh/news", feedUrl: "", feedType: "scrape-static", country: "GH", isActive: true, priority: "low", defaultCategory: "Higher Education" },
  { name: "Ghanaian Times - Education", siteUrl: "https://www.ghanaiantimes.com.gh/category/education/", feedUrl: "https://www.ghanaiantimes.com.gh/category/education/feed/", feedType: "rss", country: "GH", isActive: true, priority: "standard", defaultCategory: "Policy and Governance" },
  { name: "EducationWeb Ghana", siteUrl: "https://educationweb.com.gh/", feedUrl: "", feedType: "scrape-static", country: "GH", isActive: true, priority: "low", defaultCategory: "Higher Education" },
  { name: "Ghana Education Service - News", siteUrl: "https://ges.gov.gh/", feedUrl: "", feedType: "scrape-static", country: "GH", isActive: true, priority: "high", defaultCategory: "Institutional Funding" },
  { name: "The Chronicle - Education", siteUrl: "https://thechronicle.com.gh/tag/education/", feedUrl: "", feedType: "scrape-static", country: "GH", isActive: true, priority: "low", defaultCategory: "Higher Education" },
  { name: "Modernghana Education Blogs", siteUrl: "https://www.modernghana.com/tag/education/", feedUrl: "", feedType: "scrape-static", country: "GH", isActive: true, priority: "low", defaultCategory: "Higher Education" },
  { name: "GhanaWeb - Tertiary", siteUrl: "https://www.ghanaweb.com/GhanaHomePage/education/tertiary", feedUrl: "", feedType: "scrape-static", country: "GH", isActive: true, priority: "standard", defaultCategory: "Higher Education" },
  { name: "Elite Education Ghana", siteUrl: "https://eliteeducationgh.com/", feedUrl: "", feedType: "scrape-static", country: "GH", isActive: true, priority: "low", defaultCategory: "Higher Education" },
  { name: "University of Cape Coast - News", siteUrl: "https://ucc.edu.gh/news", feedUrl: "", feedType: "scrape-static", country: "GH", isActive: true, priority: "standard", defaultCategory: "Higher Education" }
];

async function seedSources() {
  try {
    await mongoose.connect(process.env.MONGODB_URI);
    await Source.deleteMany({});
    await Source.insertMany(sources);
    console.log(`[SEED SUCCESS] ${sources.length} sources created.`);
  } catch (error) {
    console.error('[SEED ERROR]', error);
  } finally {
    await mongoose.disconnect();
    process.exit(0);
  }
}

seedSources();