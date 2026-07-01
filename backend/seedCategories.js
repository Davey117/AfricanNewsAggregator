const path = require('path');
const mongoose = require('mongoose');
const { Category } = require('./models');
require('dotenv').config({ path: path.join(__dirname, '.env') });

const categories = [
  {
    name: 'Higher Education',
    slug: 'higher-education',
    description: 'Articles about universities, polytechnics, research, admissions, and academic life.'
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

async function seedCategories() {
  try {
    await mongoose.connect(process.env.MONGODB_URI);
    await Category.deleteMany({});
    await Category.insertMany(categories);
    console.log(`[SEED SUCCESS] ${categories.length} categories created.`);
  } catch (error) {
    console.error('[SEED ERROR]', error);
  } finally {
    await mongoose.disconnect();
    process.exit(0);
  }
}

seedCategories();