// backend/flushArticles.js
const mongoose = require('mongoose');
const path = require('path');
const fs = require('fs');

// Log current working directory for defense debugging
console.log(`[CWD]: ${process.cwd()}`);

// Resolve the absolute path to your .env file
const envPath = path.resolve(__dirname, '.env');
console.log(`[LOOKING FOR .ENV AT]: ${envPath}`);

if (fs.existsSync(envPath)) {
  require('dotenv').config({ path: envPath });
  console.log('[ENV LOADED] System environments loaded successfully.');
} else {
  console.error('[CRITICAL] Could not locate your .env file at the designated path.');
  process.exit(1);
}

async function purgeDatabase() {
  // Try both common connection string variable names
  const connectionString = process.env.MONGO_URI || process.env.MONGODB_URI;

  if (!connectionString) {
    console.error('[CONFIG ERROR] URI variable is undefined. Check your .env file contents.');
    process.exit(1);
  }

  try {
    await mongoose.connect(connectionString);
    console.log('[DATABASE SUCCESS] Connected securely to cloud MongoDB Atlas cluster.');
    
    // Wipe out everything inside the articles collection
    const result = await Article.deleteMany({});
    console.log(`\n========================================`);
    console.log(`[PURGE COMPLETE] Successfully deleted ${result.deletedCount} contaminated articles.`);
    console.log(`========================================\n`);
    
    process.exit(0);
  } catch (error) {
    console.error(`[PURGE CRASH] Execution failed: ${error.message}`);
    process.exit(1);
  }
}

// Dynamically reference the Article model compilation layer
const { Article } = require('./models');
purgeDatabase();