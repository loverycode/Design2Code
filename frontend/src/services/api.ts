import axios from 'axios';

const API_BASE = 'http://localhost:3001';

export const api = {
    getProjects: (ownerId: string) =>
    axios.get(`${API_BASE}/api/projects/${ownerId}`),

  getProject: (id: string) =>
    axios.get(`${API_BASE}/api/project/${id}`),

  getSharedProject: (token: string) =>
    axios.get(`${API_BASE}/share/${token}`),

  deleteProject: (id: string) =>
    axios.delete(`${API_BASE}/api/project/${id}`),

  generateProject: (rootNode: any, ownerId: string, projectName: string) =>
    axios.post(`${API_BASE}/api/generate`, { rootNode, ownerId, projectName }),
};