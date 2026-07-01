# African Educational News Aggregator

Live app: https://african-news-aggregator.vercel.app

An education-focused news aggregation platform covering Nigeria, Ghana, and Kenya with ingestion, categorization, deduplication, search/filtering, and admin crawl controls.

## Stack

- Backend: Node.js, Express, MongoDB (Mongoose)
- Frontend: React + Vite

## Project Structure

- `backend/` API, ingestion pipeline, seeds, cron scheduler, tests
- `frontend/` web UI and admin dashboard

## Prerequisites

- Node.js 18+
- npm
- MongoDB connection string

## Environment

Create `backend/.env` with at least:

```env
MONGODB_URI=your_mongodb_connection_string
JWT_SECRET=your_jwt_secret
PORT=5000
```

You can also set `frontend/.env` with:

```env
VITE_API_URL=http://localhost:5000
```

## Run Locally

Backend:

```bash
cd backend
npm install
node server.js
```

Frontend:

```bash
cd frontend
npm install
npm run dev
```

## Useful Backend Scripts

```bash
cd backend
node seedSources.js
node seedCategories.js
node seed.js
node forceCrawl.js
node flushArticles.js
node checkLogs.js
node backfillArticleImages.js
node backfillArticleDates.js
```

## Notes

- Sources are configured to prioritize educational content.
- Cards now support real article images with fallback styling.
- Date extraction has been improved for RSS and scraped HTML where publish metadata is available.
