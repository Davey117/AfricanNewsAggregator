const path = require('path');
const mongoose = require('mongoose');
const { Source, Article } = require('./models');
require('dotenv').config({ path: path.join(__dirname, '.env') });

const countries = [
  { code: 'DZ', name: 'Algeria' },
  { code: 'AO', name: 'Angola' },
  { code: 'BJ', name: 'Benin' },
  { code: 'BW', name: 'Botswana' },
  { code: 'BF', name: 'Burkina Faso' },
  { code: 'BI', name: 'Burundi' },
  { code: 'CV', name: 'Cabo Verde' },
  { code: 'CM', name: 'Cameroon' },
  { code: 'CF', name: 'Central African Republic' },
  { code: 'TD', name: 'Chad' },
  { code: 'KM', name: 'Comoros' },
  { code: 'CD', name: 'Congo (DRC)' },
  { code: 'CG', name: 'Congo (Republic)' },
  { code: 'CI', name: "Côte d'Ivoire" },
  { code: 'DJ', name: 'Djibouti' },
  { code: 'EG', name: 'Egypt' },
  { code: 'GQ', name: 'Equatorial Guinea' },
  { code: 'ER', name: 'Eritrea' },
  { code: 'SZ', name: 'Eswatini' },
  { code: 'ET', name: 'Ethiopia' },
  { code: 'GA', name: 'Gabon' },
  { code: 'GM', name: 'Gambia' },
  { code: 'GH', name: 'Ghana' },
  { code: 'GN', name: 'Guinea' },
  { code: 'GW', name: 'Guinea-Bissau' },
  { code: 'KE', name: 'Kenya' },
  { code: 'LS', name: 'Lesotho' },
  { code: 'LR', name: 'Liberia' },
  { code: 'LY', name: 'Libya' },
  { code: 'MG', name: 'Madagascar' },
  { code: 'MW', name: 'Malawi' },
  { code: 'ML', name: 'Mali' },
  { code: 'MR', name: 'Mauritania' },
  { code: 'MU', name: 'Mauritius' },
  { code: 'MA', name: 'Morocco' },
  { code: 'MZ', name: 'Mozambique' },
  { code: 'NA', name: 'Namibia' },
  { code: 'NE', name: 'Niger' },
  { code: 'NG', name: 'Nigeria' },
  { code: 'RE', name: 'Réunion' },
  { code: 'RW', name: 'Rwanda' },
  { code: 'ST', name: 'São Tomé and Príncipe' },
  { code: 'SN', name: 'Senegal' },
  { code: 'SC', name: 'Seychelles' },
  { code: 'SL', name: 'Sierra Leone' },
  { code: 'SO', name: 'Somalia' },
  { code: 'ZA', name: 'South Africa' },
  { code: 'SS', name: 'South Sudan' },
  { code: 'SD', name: 'Sudan' },
  { code: 'TZ', name: 'Tanzania' },
  { code: 'TG', name: 'Togo' },
  { code: 'TN', name: 'Tunisia' },
  { code: 'UG', name: 'Uganda' },
  { code: 'EH', name: 'Western Sahara' },
  { code: 'ZM', name: 'Zambia' },
  { code: 'ZW', name: 'Zimbabwe' }
];

const categoryImages = {
  'Higher Education': [
    'https://images.unsplash.com/photo-1523050854058-8df90110c9f1?auto=format&fit=crop&w=600&q=80',
    'https://images.unsplash.com/photo-1541339907198-e08756dedf3f?auto=format&fit=crop&w=600&q=80',
    'https://images.unsplash.com/photo-1524178232363-1fb2b075b655?auto=format&fit=crop&w=600&q=80'
  ],
  'Policy and Governance': [
    'https://images.unsplash.com/photo-1450133064473-71024230f91b?auto=format&fit=crop&w=600&q=80',
    'https://images.unsplash.com/photo-1517486808906-6ca8b3f04846?auto=format&fit=crop&w=600&q=80',
    'https://images.unsplash.com/photo-1457369804613-52c61a468e7d?auto=format&fit=crop&w=600&q=80'
  ],
  'Institutional Funding': [
    'https://images.unsplash.com/photo-1526304640581-d334cdbbf45e?auto=format&fit=crop&w=600&q=80',
    'https://images.unsplash.com/photo-1579621970563-ebec7560ff3e?auto=format&fit=crop&w=600&q=80',
    'https://images.unsplash.com/photo-1634733988138-bf2c3a2a13fa?auto=format&fit=crop&w=600&q=80'
  ],
  'Research and Innovation': [
    'https://images.unsplash.com/photo-1507668077129-56e32842fceb?auto=format&fit=crop&w=600&q=80',
    'https://images.unsplash.com/photo-1532094349884-543bc11b234d?auto=format&fit=crop&w=600&q=80',
    'https://images.unsplash.com/photo-1581091226825-a6a2a5aee158?auto=format&fit=crop&w=600&q=80'
  ]
};

const templates = {
  'Higher Education': [
    {
      title: `[Country] Universities Launch Multi-Million Dollar Academic Exchange Program`,
      summary: `A consortium of major universities in [Country] has signed a landmark academic agreement to facilitate student exchanges, joint degree programs, and collaborative research initiatives.`
    },
    {
      title: `Curriculum Reforms Adopted Across [Country] Tertiary Institutions`,
      summary: `The Ministry of Higher Education in [Country] has announced new curriculum standards designed to improve post-graduation employment rates and align with global job market needs.`
    },
    {
      title: `Academic Senate in [Country] Approves New Faculty Welfare and Recruitment Policy`,
      summary: `In a bid to attract top-tier academic talent, universities in [Country] are introducing revised remuneration packages and streamlined research grant allocation processes.`
    },
    {
      title: `Digital Library Launch Connects [Country] Students to Global Research Databases`,
      summary: `Students and professors in [Country] now have free, high-speed access to millions of academic journals, papers, and textbooks following the launch of the new digital database initiative.`
    }
  ],
  'Policy and Governance': [
    {
      title: `[Country] Announces Strategic Ten-Year Plan for Educational Sector Development`,
      summary: `The cabinet has approved a comprehensive policy document outlining key structural reforms, digital infrastructure expansions, and teacher training targets for [Country].`
    },
    {
      title: `Senate Committee in [Country] Proposes Reforms for Academic Accreditation Standards`,
      summary: `A new legislative bill introduced today seeks to establish stricter oversight and performance metrics for both public and private higher education institutions in [Country].`
    },
    {
      title: `New Regulatory Body Established to Monitor Education Quality in [Country]`,
      summary: `The government has launched an independent regulatory agency tasked with auditing tertiary campuses, checking standard compliance, and recommending policy adjustments.`
    },
    {
      title: `Politicization of Education: Civil Society Groups Call for Autonomy in [Country]`,
      summary: `A coalition of education advocates and civil groups in [Country] has presented a joint petition requesting increased administrative autonomy for state-owned universities.`
    }
  ],
  'Institutional Funding': [
    {
      title: `[Country] Education Trust Fund Disburses New Infrastructure Development Grants`,
      summary: `Dozens of schools and universities across [Country] will benefit from a new round of funding aimed at building modern lecture halls, engineering laboratories, and student housing.`
    },
    {
      title: `President Announces Massive Student Loan Scheme Expansion in [Country]`,
      summary: `Under the new policy, low-income students in [Country] will be eligible for zero-interest tuition loans with flexible repayment plans starting next academic session.`
    },
    {
      title: `International Development Bank Partners with [Country] to Fund Science Labs`,
      summary: `A foreign grant of $15 million has been secured by [Country] to completely renovate and equip STEM laboratories in national technical institutes.`
    },
    {
      title: `Corporate Philanthropy: Tech Giant Sponsors Tech Scholarships in [Country]`,
      summary: `A leading tech multinational has established a foundation to cover full tuition fees and internships for 500 promising computer science undergraduates in [Country].`
    }
  ],
  'Research and Innovation': [
    {
      title: `Researchers in [Country] Develop Low-Cost Solar Powered Agricultural Automation System`,
      summary: `An engineering research team at a top national university in [Country] has successfully tested a smart solar device designed to help local farmers optimize irrigation.`
    },
    {
      title: `EdTech Startup in [Country] Wins Global Award for Offline Learning Platform`,
      summary: `A local educational technology firm from [Country] has been recognized globally for developing an application that delivers curriculum content without internet access.`
    },
    {
      title: `National Innovation Hub Launched to Support Student Entrepreneurs in [Country]`,
      summary: `The Ministry of Science and Technology has opened a state-of-the-art incubation center in [Country] to provide student-led startups with seed funding and mentorship.`
    },
    {
      title: `Scientific Breakthrough: [Country] Institute Patents New Water Purification Compound`,
      summary: `In a significant step for local science, researchers in [Country] have patented an eco-friendly compound that removes microplastics and heavy metals from rural water supplies.`
    }
  ]
};

async function seed() {
  try {
    if (!process.env.MONGODB_URI) {
      throw new Error('MONGODB_URI is not set in backend/.env');
    }
    await mongoose.connect(process.env.MONGODB_URI);
    console.log('[SEED] Connected to MongoDB.');

    // Clear previous articles to prevent duplicate key errors
    await Article.deleteMany({});
    console.log('[SEED] Cleared all existing articles to prevent duplicate key errors.');

    let articlesToInsert = [];

    for (const country of countries) {
      // Find or create a source for this country
      let source = await Source.findOne({ country: country.code });
      if (!source) {
        source = new Source({
          name: `${country.name} Education News Source`,
          siteUrl: `https://www.google.com/search?q=${encodeURIComponent(country.name)}+education+news`,
          feedType: 'scrape-static',
          country: country.code,
          isActive: true,
          priority: 'standard',
          defaultCategory: 'Higher Education'
        });
        await source.save();
      }

      // Generate multiple articles for each category
      for (const catName of Object.keys(templates)) {
        const catTemplates = templates[catName];
        
        // Loop through all 4 templates per category to generate 16 articles per country
        for (let i = 0; i < catTemplates.length; i++) {
          const template = catTemplates[i];
          const imageList = categoryImages[catName];
          const randomImage = imageList[Math.floor(Math.random() * imageList.length)];
          
          // Interpolate the country name into titles and summaries
          const title = template.title.replace(/\[Country\]/g, country.name);
          const summary = template.summary.replace(/\[Country\]/g, country.name);
          
          articlesToInsert.push({
            title: title,
            summary: summary,
            url: `https://example.com/news/${country.code.toLowerCase()}/${catName.toLowerCase().replace(/[^a-z0-9]+/g, '-')}-item-${i}-${Date.now()}-${Math.floor(Math.random() * 100000)}`,
            sourceId: source._id,
            category: catName,
            country: country.code,
            publishedAt: new Date(Date.now() - i * 24 * 60 * 60 * 1000 - Math.random() * 24 * 60 * 60 * 1000), // Stagger dates back by days
            imageUrl: randomImage,
            isFeatured: i === 0 && Math.random() > 0.6 // Make first item occasionally featured
          });
        }
      }
    }

    await Article.insertMany(articlesToInsert);
    console.log(`[SEED SUCCESS] Successfully seeded 16 articles with cover images for all ${countries.length} countries! Total articles in DB: ${articlesToInsert.length}`);

  } catch (err) {
    console.error('[SEED ERROR] Seeding failed:', err.message);
  } finally {
    await mongoose.disconnect();
    process.exit(0);
  }
}

seed();
