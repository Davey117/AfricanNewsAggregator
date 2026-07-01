// services/ingestionEngine.js
const Parser = require('rss-parser');
const axios = require('axios');
const cheerio = require('cheerio');
const puppeteer = require('puppeteer');
const https = require('https');

const parser = new Parser({
  headers: { 'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AfricanEduNewsAggregator/1.0' },
  customFields: {
    item: [
      'media:content',
      'media:thumbnail',
      'media:group'
    ]
  }
});

function firstValidUrl(candidates = []) {
  for (const candidate of candidates) {
    if (typeof candidate === 'string' && /^https?:\/\//i.test(candidate.trim())) {
      return candidate.trim();
    }

    if (candidate && typeof candidate === 'object') {
      const value = candidate.url || candidate.href || candidate.$?.url || candidate._;
      if (typeof value === 'string' && /^https?:\/\//i.test(value.trim())) {
        return value.trim();
      }
    }
  }

  return null;
}

function extractImageFromRssItem(item = {}) {
  return firstValidUrl([
    item.enclosure?.url,
    item['media:thumbnail']?.url,
    item['media:thumbnail'],
    item['media:content']?.url,
    item['media:content'],
    item['media:group']?.['media:content'],
    item['media:group']?.['media:thumbnail'],
    item.image?.url,
    item.image,
    item.thumbnail
  ]);
}

function extractImageFromHtmlFragment(htmlFragment, siteUrl) {
  if (!htmlFragment || typeof htmlFragment !== 'string') return null;

  try {
    const $ = cheerio.load(htmlFragment);
    const fragmentImage =
      $('img').first().attr('src') ||
      $('img').first().attr('data-src') ||
      $('img').first().attr('data-lazy-src') ||
      $('source').first().attr('srcset') ||
      '';

    const rawUrl = String(fragmentImage).split(',')[0]?.trim().split(' ')[0]?.trim();
    if (!rawUrl) return null;

    return new URL(rawUrl, siteUrl).toString();
  } catch (error) {
    return null;
  }
}

function extractImageFromElement($, element, siteUrl) {
  const imageCandidate =
    $(element).find('img').first().attr('src') ||
    $(element).find('img').first().attr('data-src') ||
    $(element).find('img').first().attr('data-lazy-src') ||
    $(element).find('[data-srcset]').first().attr('data-srcset') ||
    $(element).find('source').first().attr('srcset') ||
    '';

  const rawUrl = String(imageCandidate).split(',')[0]?.trim().split(' ')[0]?.trim();
  if (!rawUrl) return null;

  try {
    return new URL(rawUrl, siteUrl).toString();
  } catch (error) {
    return null;
  }
}

function parseCandidateDate(rawValue) {
  if (!rawValue || typeof rawValue !== 'string') return null;
  const parsed = new Date(rawValue.trim());
  if (Number.isNaN(parsed.getTime())) return null;
  return parsed;
}

function extractPublishedAtFromRssItem(item = {}) {
  const candidates = [
    item.pubDate,
    item.isoDate,
    item.published,
    item.updated,
    item['dc:date'],
    item['published_at']
  ];

  for (const raw of candidates) {
    const parsed = parseCandidateDate(String(raw || ''));
    if (parsed) return parsed;
  }

  return null;
}

function extractPublishedAtFromElement($, element) {
  const candidates = [
    $(element).find('time').first().attr('datetime'),
    $(element).find('time').first().attr('dateTime'),
    $(element).find('time').first().text(),
    $(element).attr('datetime'),
    $(element).attr('data-date'),
    $(element).attr('data-published'),
    $(element).find('[itemprop="datePublished"]').attr('content'),
    $(element).find('[property="article:published_time"]').attr('content')
  ];

  for (const raw of candidates) {
    const parsed = parseCandidateDate(String(raw || ''));
    if (parsed) return parsed;
  }

  return null;
}

/**
 * STRATEGY 1: STANDARD SYNDICATION (RSS/ATOM Parsing)
 * High-performance XML parser for standard syndication documents.
 */
async function parseRSS(feedUrl) {
  try {
    // 1. Corrected variable mapping to use passed parameters and accept standard SSL certificates
    const response = await axios.get(feedUrl, {
      headers: {
        'User-Agent': 'Mozilla/5.0 (X11; Linux x86_64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36',
        'Accept': 'application/rss+xml, application/xml, text/xml, */*'
      },
      timeout: 10000,
      // Prevents 403 / SSL certificate rejections on local networks
      httpsAgent: new https.Agent({ rejectUnauthorized: false })
    });

    const rawXmlString = response.data;

    // 2. Pre-sanitize common invalid XML entity bugs natively
    const sanitizedXml = rawXmlString
      .replace(/&(?![a-zA-Z0-9#]+;)/g, '&amp;')
      .replace(/&amp;=/g, '=');

    // 3. Parse the sanitized string data footprint directly
    const feed = await parser.parseString(sanitizedXml);
    
    return feed.items.map(item => ({
      title: item.title ? item.title.trim() : '',
      summary: item.contentSnippet || item.content || '',
      url: item.link ? item.link.trim() : '',
      publishedAt: extractPublishedAtFromRssItem(item) || new Date(),
      imageUrl:
        extractImageFromRssItem(item) ||
        extractImageFromHtmlFragment(item.content || item['content:encoded'], feedUrl)
    }));
  } catch (error) {
    throw new Error(`RSS Parsing Error: ${error.message}`);
  }
}

/**
 * Attempt to discover RSS/Atom links from a regular HTML page.
 */
async function discoverFeedUrl(siteUrl) {
  try {
    const { data } = await axios.get(siteUrl, {
      headers: {
        'User-Agent': 'Mozilla/5.0 (X11; Linux x86_64) AfricanEduNewsAggregator/1.0',
        'Accept': 'text/html,application/xhtml+xml'
      },
      timeout: 10000,
      httpsAgent: new https.Agent({ rejectUnauthorized: false })
    });

    const $ = cheerio.load(data);
    const candidateLinks = [];

    $('link[rel="alternate"]').each((_, el) => {
      const type = ($(el).attr('type') || '').toLowerCase();
      const href = ($(el).attr('href') || '').trim();
      if (!href) return;
      if (type.includes('rss') || type.includes('atom') || type.includes('xml')) {
        candidateLinks.push(href);
      }
    });

    // Common fallback path on many CMS platforms.
    candidateLinks.push('/feed/');

    for (const href of candidateLinks) {
      try {
        const absolute = new URL(href, siteUrl).toString();
        if (absolute.startsWith('http://') || absolute.startsWith('https://')) {
          return absolute;
        }
      } catch (error) {
        // Keep iterating through candidates.
      }
    }

    return null;
  } catch (error) {
    return null;
  }
}

/**
 * STRATEGY 2: STATIC WEB SCRAPING (Axios + Cheerio)
 */
async function scrapeStaticHTML(siteUrl, selectors) {
  try {
    const { data } = await axios.get(siteUrl, {
      headers: { 'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AfricanEduNewsAggregator/1.0' },
      timeout: 10000,
      httpsAgent: new https.Agent({ rejectUnauthorized: false }) 
    });
    
    const $ = cheerio.load(data);
    const articles = [];

    const container = selectors?.container || 'article, .post, .news-item';
    const titleSelector = selectors?.title || 'h2, h3, .entry-title';
    const linkSelector = selectors?.link || 'a';
    const summarySelector = selectors?.summary || 'p, .excerpt';

    $(container).each((index, element) => {
      const title = $(element).find(titleSelector).text().trim();
      let url = $(element).find(linkSelector).attr('href');
      const summary = $(element).find(summarySelector).text().trim();

      if (url && url.startsWith('/')) {
        const urlObj = new URL(siteUrl);
        url = `${urlObj.origin}${url}`;
      }

      if (title && url) {
        articles.push({
          title,
          summary: summary.substring(0, 250),
          url,
          publishedAt: extractPublishedAtFromElement($, element) || new Date(),
          imageUrl: extractImageFromElement($, element, siteUrl)
        });
      }
    });

    return articles;
  } catch (error) {
    throw new Error(`Static Scraping Error: ${error.message}`);
  }
}

/**
 * STRATEGY 3: DYNAMIC HEADLESS EVALUATION (Puppeteer)
 */
async function scrapeDynamicHTML(siteUrl, selectors) {
  let browser = null;
  try {
    browser = await puppeteer.launch({
      headless: 'new',
      args: ['--no-sandbox', '--disable-setuid-sandbox']
    });

    const page = await browser.newPage();
    
    await page.setRequestInterception(true);
    page.on('request', (req) => {
      if (req.resourceType() === 'image' || req.resourceType() === 'stylesheet' || req.resourceType() === 'font') {
        req.abort();
      } else {
        req.continue();
      }
    });

    await page.goto(siteUrl, { waitUntil: 'networkidle2', timeout: 30000 });

    const targetSelector = selectors?.container || 'article';
    await page.waitForSelector(targetSelector, { timeout: 5000 }).catch(() => {});

    const htmlContent = await page.content();
    const $ = cheerio.load(htmlContent);
    const articles = [];

    const container = selectors?.container || 'article, .post, .news-item';
    const titleSelector = selectors?.title || 'h2, h3, .entry-title';
    const linkSelector = selectors?.link || 'a';
    const summarySelector = selectors?.summary || 'p, .excerpt';

    $(container).each((index, element) => {
      const title = $(element).find(titleSelector).text().trim();
      let url = $(element).find(linkSelector).attr('href');
      const summary = $(element).find(summarySelector).text().trim();

      if (url && url.startsWith('/')) {
        const urlObj = new URL(siteUrl);
        url = `${urlObj.origin}${url}`;
      }

      if (title && url) {
        articles.push({
          title,
          summary: summary.substring(0, 250),
          url,
          publishedAt: extractPublishedAtFromElement($, element) || new Date(),
          imageUrl: extractImageFromElement($, element, siteUrl)
        });
      }
    });

    return articles;
  } catch (error) {
    throw new Error(`Dynamic Scraping Error: ${error.message}`);
  } finally {
    if (browser) await browser.close();
  }
}

/**
 * CENTRAL ORCHESTRATOR ROUTER
 */
async function ingestFromSource(source, customSelectors = null) {
  console.log(`[INGESTION TRIGGER] Parsing initialized for target: ${source.name} via [${source.feedType}]`);
  
  switch (source.feedType) {
    case 'rss': {
      const directFeed = (source.feedUrl || '').trim();
      const targetFeedUrl = directFeed || await discoverFeedUrl(source.siteUrl);

      if (!targetFeedUrl) {
        throw new Error(`RSS feed URL not configured/discovered for source: ${source.name}`);
      }

      return await parseRSS(targetFeedUrl);
    }
    case 'scrape-static':
      return await scrapeStaticHTML(source.siteUrl, customSelectors);
    case 'scrape-dynamic':
      return await scrapeDynamicHTML(source.siteUrl, customSelectors);
    default:
      throw new Error(`Unsupported ingestion mechanism: ${source.feedType}`);
  }
}

module.exports = {
  ingestFromSource
};