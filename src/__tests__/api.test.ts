import request from 'supertest';

// Мокаем Prisma ДО импорта app
jest.mock('@prisma/client', () => {
  const mockProject = {
    findMany: jest.fn(),
    findUnique: jest.fn(),
    create: jest.fn(),
  };
  return {
    PrismaClient: jest.fn(() => ({
      project: mockProject,
    })),
  };
});

// Импортируем app после мока
const app = require('../app').default;

describe('API Endpoints', () => {
  let prismaMock: any;

  beforeEach(() => {
    const { PrismaClient } = require('@prisma/client');
    prismaMock = new PrismaClient();
    jest.clearAllMocks();
  });

  describe('GET /', () => {
    it('возвращает приветствие', async () => {
      const response = await request(app).get('/');
      expect(response.status).toBe(200);
      expect(response.text).toContain('Design2Code Backend is running');
    });
  });

  describe('GET /api/projects/:ownerId', () => {
    it('возвращает проекты пользователя', async () => {
      const mockProjects = [{ id: '1', ownerId: 'user123', projectName: 'Test' }];
      prismaMock.project.findMany.mockResolvedValue(mockProjects);

      const response = await request(app).get('/api/projects/user123');
      
      expect(response.status).toBe(200);
      expect(response.body.success).toBe(true);
      expect(response.body.projects).toEqual(mockProjects);
    });

    it('обрабатывает ошибки', async () => {
      prismaMock.project.findMany.mockRejectedValue(new Error('DB Error'));

      const response = await request(app).get('/api/projects/user123');
      
      expect(response.status).toBe(500);
      expect(response.body.success).toBe(false);
    });
  });

  describe('GET /api/project/:id', () => {
    it('возвращает проект по id', async () => {
      const mockProject = { id: '123', projectName: 'Test' };
      prismaMock.project.findUnique.mockResolvedValue(mockProject);

      const response = await request(app).get('/api/project/123');
      
      expect(response.status).toBe(200);
      expect(response.body.project).toEqual(mockProject);
    });

    it('возвращает 404 если проект не найден', async () => {
      prismaMock.project.findUnique.mockResolvedValue(null);

      const response = await request(app).get('/api/project/999');
      
      expect(response.status).toBe(404);
      expect(response.body.error).toBe('Project not found');
    });
  });

  describe('GET /share/:token', () => {
    it('возвращает проект по токену', async () => {
      const mockProject = { id: '1', shareToken: 'abc123' };
      prismaMock.project.findUnique.mockResolvedValue(mockProject);

      const response = await request(app).get('/share/abc123');
      
      expect(response.status).toBe(200);
      expect(response.body.project).toEqual(mockProject);
    });

    it('возвращает 404 если токен не найден', async () => {
      prismaMock.project.findUnique.mockResolvedValue(null);

      const response = await request(app).get('/share/invalid');
      
      expect(response.status).toBe(404);
    });
  });

  describe('POST /api/generate', () => {
    it('создаёт проект', async () => {
      const mockProject = { id: '1', shareToken: 'token123' };
      prismaMock.project.create.mockResolvedValue(mockProject);

      const response = await request(app)
        .post('/api/generate')
        .send({
          rootNode: { nodeId: '1', nodeName: 'Test' },
          ownerId: 'user123',
          projectName: 'My Project',
          componentName: 'Button',
        });
      
      expect(response.status).toBe(200);
      expect(response.body.success).toBe(true);
      expect(response.body.URL).toBeDefined();
    });

    it('возвращает 400 если нет rootNode', async () => {
      const response = await request(app)
        .post('/api/generate')
        .send({ ownerId: 'user123' });
      
      expect(response.status).toBe(400);
      expect(response.body.error).toContain('Missing');
    });

    it('возвращает 400 если нет ownerId', async () => {
      const response = await request(app)
        .post('/api/generate')
        .send({ rootNode: {} });
      
      expect(response.status).toBe(400);
      expect(response.body.error).toContain('Missing');
    });
  });
});