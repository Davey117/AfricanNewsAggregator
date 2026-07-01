const express = require('express');
const request = require('supertest');
const jwt = require('jsonwebtoken');

jest.mock('../../services/pipelineOrchestrator', () => ({
  runIngestionPipeline: jest.fn().mockResolvedValue(undefined),
}));

const { runIngestionPipeline } = require('../../services/pipelineOrchestrator');

const mockUser = {
  _id: 'admin-id',
  email: 'admin@example.com',
  role: 'admin',
};

jest.mock('../../models', () => ({
  User: {
    findById: jest.fn(() => ({
      select: jest.fn(() => ({
        lean: jest.fn().mockResolvedValue(mockUser),
      })),
    })),
  },
  Source: {
    find: jest.fn(),
    create: jest.fn(),
    findByIdAndDelete: jest.fn(),
  },
}));

const feedRouter = require('../../routes/feedRoutes');

describe('admin crawl trigger route', () => {
  let app;

  beforeEach(() => {
    process.env.JWT_SECRET = 'test-secret';
    jest.clearAllMocks();
    app = express();
    app.use(express.json());
    app.use('/api/v1/feed', feedRouter);
    app.post('/api/v1/feed/auto-crawl', async (req, res) => {
      const { protectAdminRoute } = require('../../services/authMiddleware');
      await protectAdminRoute(req, res, () => {
        res.status(200).json({ status: 'success', message: 'ok' });
      });
    });
  });

  test('accepts a valid bearer token for the auto-crawl trigger', async () => {
    const token = jwt.sign({ id: 'admin-id', role: 'admin' }, 'test-secret', { expiresIn: '1h' });

    const res = await request(app)
      .post('/api/v1/feed/auto-crawl')
      .set('Authorization', `Bearer ${token}`)
      .send({ priority: 'high' });

    expect(res.statusCode).toBe(200);
    expect(runIngestionPipeline).not.toHaveBeenCalled();
    expect(res.body.status).toBe('success');
  });
});
