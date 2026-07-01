// services/ingestionEngine.js
const Parser = require('rss-parser');
const axios = require('axios');
const cheerio = require('cheerio');
const puppeteer = require('puppeteer');
const https = require('https');

const parser = new Parser({
  headers: { 'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AfricanEduNewsAggregator/1.0' }
});

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
      .replace(/&(?! [a-zA-Z0-9#]+;)/g, '&amp;') 
      .replace(/&amp;=/g, '=');

    // 3. Parse the sanitized string data footprint directly
    const feed = await parser.parseString(sanitizedXml);
    
    return feed.items.map(item => ({
      title: item.title ? item.title.trim() : '',
      summary: item.contentSnippet || item.content || '',
      url: item.link ? item.link.trim() : '',
      publishedAt: item.pubDate ? new Date(item.pubDate) : new Date(),
      imageUrl: item.enclosure?.url || null
    }));
  } catch (error) {
    throw new Error(`RSS Parsing Error: ${error.message}`);
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
          publishedAt: new Date(),
          imageUrl: null
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
          publishedAt: new Date(),
          imageUrl: null
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
    case 'rss':
      return await parseRSS(source.feedUrl);
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