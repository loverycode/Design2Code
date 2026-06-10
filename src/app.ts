import express from 'express';
import { PrismaClient } from '@prisma/client';
import cors from 'cors';


const app = express();
const prisma = new PrismaClient();
const PORT = 3001;
const archiver = require('archiver');
app.use(cors({
  origin: true,
  credentials: true
}));
app.use(express.json());

app.get('/', (req, res) => {
  res.send('Design2Code Backend is running!');
});

app.get('/api/projects/:ownerId', async (req, res) => {
  try {
    const { ownerId } = req.params;
    const projects = await prisma.project.findMany({
      where: { ownerId },
      orderBy: { createdAt: 'desc' }
    });
    res.json({ success: true, projects });
  } catch (error) {
    return res.status(500).json({ success: false, error: String(error) });
  }
});

app.get('/api/project/:id', async (req, res) => {
  try {
    const { id } = req.params;
    const project = await prisma.project.findUnique({ where: { id } });
    if (!project) {
      return res.status(404).json({ success: false, error: 'Project not found' });
    }
    res.json({ success: true, project });
  } catch (error) {
    return res.status(500).json({ success: false, error: String(error) });
  }
});

app.get('/share/:token', async (req, res) => {
  try {
    const { token } = req.params;
    const project = await prisma.project.findUnique({ where: { shareToken: token } });
    if (!project) {
      return res.status(404).json({ success: false, error: 'Project not found' });
    }
    res.json({ success: true, project });
  } catch (error) {
    return res.status(500).json({ success: false, error: String(error) });
  }
});

app.delete('/api/project/:id', async (req, res) => {
  try {
    const { id } = req.params;
    await prisma.project.delete({ where: { id } });
    res.status(200).json({ success: true });
  } catch (error) {
    res.status(500).json({ success: false, error: String(error) });
  }
});

app.get('/api/project/:id/download', async (req, res) => {
  try {
    const { id } = req.params;
    const project = await prisma.project.findUnique({ where: { id } });
    if (!project) {
      return res.status(404).json({ success: false, error: 'Project not found' });
    }

    const zipName = `${project.componentName || project.projectName || 'project'}.zip`;
    res.setHeader('Content-Type', 'application/zip');
    res.setHeader('Content-Disposition', `attachment; filename="${encodeURIComponent(zipName)}"`);

    const archive = archiver('zip', { zlib: { level: 9 } });
    archive.on('error', (err:any) => {
      throw err;
    });
    archive.pipe(res);

    archive.append(project.reactCode, { name: 'Component.jsx' });
    archive.append(project.htmlCode, { name: 'index.html' });
    archive.append(project.cssCode, { name: 'styles.css' });
    const readme = `# ${project.componentName}\n\nЭкспортировано из Design2Code\n\n## Файлы:\n- Component.jsx — React-компонент\n- index.html — HTML-разметка\n- styles.css — стили\n\nДата экспорта: ${new Date().toLocaleString()}`;
    archive.append(readme, { name: 'README.md' });

    await archive.finalize();
  } catch (error) {
    console.error(error);
    res.status(500).json({ success: false, error: String(error) });
  }
});


app.get('/share/:token/download', async (req, res) => {
  try {
    const { token } = req.params;
    const project = await prisma.project.findUnique({ where: { shareToken: token } });
    if (!project) {
      return res.status(404).json({ success: false, error: 'Project not found' });
    }

    const zipName = `${project.componentName || project.projectName || 'shared-project'}.zip`;
    res.setHeader('Content-Type', 'application/zip');
    res.setHeader('Content-Disposition', `attachment; filename="${encodeURIComponent(zipName)}"`);

    const archive = archiver('zip', { zlib: { level: 9 } });
    archive.on('error', (err:any) => {
      throw err;
    });
    archive.pipe(res);

    archive.append(project.reactCode, { name: 'Component.jsx' });
    archive.append(project.htmlCode, { name: 'index.html' });
    archive.append(project.cssCode, { name: 'styles.css' });

    const readme = `# ${project.componentName}\n\nПубличный экспорт из Design2Code\n\n## Файлы:\n- Component.jsx\n- index.html\n- styles.css\n\nСсылка: /share/${token}`;
    archive.append(readme, { name: 'README.md' });

    await archive.finalize();
  } catch (error) {
    console.error(error);
    res.status(500).json({ success: false, error: String(error) });
  }
});

app.post('/api/generate', async (req, res) => {
  try {
    const { rootNode, ownerId, projectName, componentName } = req.body;
    if (!rootNode || !ownerId) {
      return res.status(400).json({ success: false, error: "Missing rootNode or ownerId" });
    }

    const { CodeGenerator } = require('./codeGenerator');
    const generator = new CodeGenerator();
    const { htmlCode, cssCode, reactCode } = generator.generateCode(rootNode, componentName);
    const shareToken = Math.random().toString(36).substring(7);

    const project = await prisma.project.create({
      data: {
        ownerId,
        projectName: projectName || "Без названия",
        componentName: componentName || "Компонент",
        reactCode,
        htmlCode,
        cssCode,
        shareToken,
      }
    });

    res.json({ success: true, project, URL: `http://localhost:3000/share/${shareToken}` });
  } catch (error) {
    console.error(error);
    return res.status(500).json({ success: false, error: String(error) });
  }
});

app.listen(PORT, () => {
  console.log(`Server is running on http://localhost:${PORT}`);
});

export default app;