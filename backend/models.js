// models.js
const mongoose = require('mongoose');

/**
 * SOURCE SCHEMA
 * Manages configuration and telemetry states for individual content publishers[cite: 496].
 */
const SourceSchema = new mongoose.Schema({
  name: {
    type: String,
    required: [true, 'Source name is required'],
    trim: true
  },
  siteUrl: {
    type: String,
    required: [true, 'Target homepage URL is required'],
    trim: true
  },
  feedUrl: {
    type: String,
    default: null,
    trim: true
  },
  feedType: {
    type: String,
    required: [true, 'Ingestion processing modality is required'],
    enum: {
      values: ['rss', 'scrape-static', 'scrape-dynamic'],
      message: '{VALUE} is not a supported ingestion engine routine'
    }
  },
  country: {
    type: String,
    required: [true, 'ISO country code mapping identifier required'],
    uppercase: true,
    minLength: 2,
    maxLength: 2,
    default: 'NG'
  },
  language: {
    type: String,
    default: 'en',
    lowercase: true
  },
  defaultCategory: {
    type: String,
    required: [true, 'A fallback category sorting tag must be configured'],
    default: 'Higher Education'
  },
  isActive: {
    type: Boolean,
    default: true
  },
  priority: {
    type: String,
    enum: ['high', 'standard', 'low'],
    default: 'standard',
    lowercase: true
  },
  lastFetchedAt: {
    type: Date,
    default: null
  }
}, {
  timestamps: true
});

// Compile Source Model immediately
const Source = mongoose.model('Source', SourceSchema);

/**
 * ARTICLE SCHEMA
 * Stores the normalized metadata of every unique aggregated news article[cite: 485].
 */
const ArticleSchema = new mongoose.Schema({
  title: {
    type: String,
    required: [true, 'Article title headline is required'],
    trim: true
  },
  summary: {
    type: String,
    default: '',
    trim: true
  },
  url: {
    type: String,
    required: [true, 'Canonical source article URL is required'],
    trim: true,
    unique: true // Crucial Indexing Step: Database-level unique constraint [cite: 415, 489]
  },
  sourceId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Source',
    required: [true, 'A valid relational source reference ID is required']
  },
  category: {
    type: String,
    required: [true, 'Thematic domain classification string is required'],
    trim: true
  },
  country: {
    type: String,
    required: [true, 'Geographic origin country code identifier is required'],
    uppercase: true,
    trim: true
  },
  publishedAt: {
    type: Date,
    required: [true, 'Original publication date/time token is required'],
    default: Date.now
  },
  scrapedAt: {
    type: Date,
    default: Date.now
  },
  imageUrl: {
    type: String,
    default: null,
    trim: true
  },
  isFeatured: {
    type: Boolean,
    default: false
  }
}, {
  timestamps: true
});

/**
 * INDEX CONFIGURATIONS FOR OPTIMIZED SYSTEM PERFORMANCE [cite: 495]
 */
ArticleSchema.index(
  { title: 'text', summary: 'text' },
  { weights: { title: 3, summary: 1 }, name: 'ArticleTextSearchIndex' }
);

ArticleSchema.index(
  { publishedAt: -1 },
  { name: 'ChronologicalSortIndex' }
);

// Compile Article Model
const Article = mongoose.model('Article', ArticleSchema);

/**
 * CATEGORY SCHEMA
 * Captures the curated educational taxonomy used by the public search and filtering API.
 */
const CategorySchema = new mongoose.Schema({
  name: {
    type: String,
    required: [true, 'Category name is required'],
    trim: true,
    unique: true
  },
  slug: {
    type: String,
    required: [true, 'Category slug is required'],
    trim: true,
    lowercase: true,
    unique: true
  },
  description: {
    type: String,
    default: '',
    trim: true
  },
  isActive: {
    type: Boolean,
    default: true
  }
}, {
  timestamps: true
});

const Category = mongoose.model('Category', CategorySchema);

/**
 * FEED LOG SCHEMA
 * Operates as a persistent audit recorder tracking the health of your ingestion workers[cite: 501].
 */
const FeedLogSchema = new mongoose.Schema({
  sourceId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Source',
    required: [true, 'Relational source reference ID is required'],
    index: true
  },
  fetchedAt: {
    type: Date,
    default: Date.now,
    required: true
  },
  articlesFound: {
    type: Number,
    default: 0,
    min: [0, 'Crawl yield count cannot evaluate below zero values']
  },
  status: {
    type: String,
    required: [true, 'Crawl execution operational outcome state required'],
    enum: {
      values: ['success', 'error'],
      message: '{VALUE} is not a valid transaction tracking logging state'
    }
  },
  errorMsg: {
    type: String,
    default: null,
    trim: true
  }
}, {
  timestamps: false
});

FeedLogSchema.index({ fetchedAt: -1 });

// Compile FeedLog Model
const FeedLog = mongoose.model('FeedLog', FeedLogSchema);


/**
 * USER SCHEMA
 * Manages administrative credentials for secure endpoint route guarding.
 */
const UserSchema = new mongoose.Schema({
  name: {
    type: String,
    required: [true, 'User name is required'],
    trim: true
  },
  email: {
    type: String,
    required: [true, 'Email address is required'],
    unique: true,
    lowercase: true,
    trim: true
  },
  password: {
    type: String,
    required: [true, 'Password verification token is required'],
    minlength: 6
  },
  role: {
    type: String,
    enum: ['admin', 'moderator'],
    default: 'admin'
  }
}, {
  timestamps: true
});

// Compile the model
const User = mongoose.model('User', UserSchema);

module.exports = {
  Source,
  Article,
  Category,
  FeedLog,
  User
};