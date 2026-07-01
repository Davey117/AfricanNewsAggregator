// backend/test/integration/articlesRoute.test.js
const request = require('supertest');
const mongoose = require('mongoose');
const { MongoMemoryServer } = require('mongodb-memory-server');
const express = require('express');

// Mock out a slim variant of your actual articles router for isolated sandboxing
const app = express();
app.use(express.json());

// Explicit schema definition for our sandboxed collection model
const MockArticleSchema = new mongoose.Schema({
  title: String,
  category: String,
  country: String
});
const TestArticle = mongoose.model('TestArticle', MockArticleSchema);

app.get('/api/v1/articles', async (req, res) => {
  const articles = await TestArticle.find();
  res.status(200).json({ status: 'success', articles });
});

describe('Express API Database Route Integration Pipeline', () => {
  let mongoServer;

  // Before running tests, intercept standard connections and re-route to Memory Server
  beforeAll(async () => {
    mongoServer = await MongoMemoryServer.create();
    const uri = mongoServer.getUri();
    await mongoose.connect(uri);
  });

  // After tests finish executing, tear down our ephemeral database instance cleanly
  afterAll(async () => {
    await mongoose.disconnect();
    await mongoServer.stop();
  });

  test('GET /api/v1/articles should return empty arrays cleanly upon fresh initialization', async () => {
    const res = await request(app).get('/api/v1/articles');
    expect(res.statusCode).toBe(200);
    expect(res.body.status).toBe('success');
    expect(res.body.articles).toBeInstanceOf(Array);
    expect(res.body.articles.length).toBe(0);
  });

  test('GET /api/v1/articles should reflect matching database entry sets accurately', async () => {
    // Inject a clean document straight down the sandboxed memory pipeline
    await TestArticle.create({
      title: "NUC Approves New STEM Training Protocols",
      category: "Higher Education",
      country: "NG"
    });

    const res = await request(app).get('/api/v1/articles');
    expect(res.statusCode).toBe(200);
    expect(res.body.articles.length).toBe(1);
    expect(res.body.articles[0].title).toBe("NUC Approves New STEM Training Protocols");
  });
});