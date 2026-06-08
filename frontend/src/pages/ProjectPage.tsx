import React, { useEffect, useState } from 'react';
import { useParams } from 'react-router-dom';
import Editor from '@monaco-editor/react';
import { api } from '../services/api';
import Footer from '../components/Footer';
import Header from '../components/Header';

interface Project {
  id: string;
  projectName: string;
  componentName: string;
  reactCode: string;
  htmlCode: string;
  cssCode: string;
  shareToken: string;
}

const ProjectPage = () => {
  const { id, token } = useParams<{ id?: string; token?: string }>();
  const [project, setProject] = useState<Project | null>(null);
  const [activeTab, setActiveTab] = useState<'react' | 'html' | 'css'>('react');
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (token) {
      api.getSharedProject(token)
        .then((res) => {
          setProject(res.data.project);
          setLoading(false);
        })
        .catch((err) => {
          console.error(err);
          setLoading(false);
        });
    } else if (id) {
      api.getProject(id)
        .then((res) => {
          setProject(res.data.project);
          setLoading(false);
        })
        .catch((err) => {
          console.error(err);
          setLoading(false);
        });
    }
  }, [id, token]);

  const getCurrentCode = () => {
    if (!project) return '';
    switch (activeTab) {
      case 'react': return project.reactCode;
      case 'html': return project.htmlCode;
      case 'css': return project.cssCode;
    }
  };

  const copyToClipboard = () => {
    navigator.clipboard.writeText(getCurrentCode());
    alert('Код скопирован!');
  };

  if (loading) return <div className="text-center py-12 text-gray-500">Загрузка...</div>;
  if (!project) return <div className="text-center py-12 text-red-500">Проект не найден</div>;

  return (
    <div className="min-h-screen bg-gray-50">
      <Header />
      <main className="max-w-6xl mx-auto px-4 py-8">
        <div className="flex justify-between items-center mb-6">
          <h1 className="text-2xl font-bold text-gray-800">{project.componentName}</h1>
          <button
            className="flex items-center gap-1 px-4 py-2 border border-gray-300 hover:border-purple-600 hover:bg-gray-50 transition rounded-lg"
            onClick={() => window.location.href = '/'}
          >
            <svg className="w-4 h-4 text-gray-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10 19l-7-7m0 0l7-7m-7 7h18" />
            </svg>
            <span className="text-sm text-gray-600 hover:text-purple-600">{project.projectName}</span>
          </button>
        </div>

        <div className="bg-white rounded-xl shadow-md overflow-hidden">
          <div className="flex border-b">
            <button onClick={() => setActiveTab('react')}
              className={`px-5 py-3 text-sm font-medium transition ${activeTab === 'react' ? 'border-b-2 border-purple-600 text-purple-600' : 'text-gray-500 hover:text-gray-700'}`}>
              React
            </button>
            <button onClick={() => setActiveTab('html')}
              className={`px-5 py-3 text-sm font-medium transition ${activeTab === 'html' ? 'border-b-2 border-purple-600 text-purple-600' : 'text-gray-500 hover:text-gray-700'}`}>
              HTML
            </button>
            <button onClick={() => setActiveTab('css')}
              className={`px-5 py-3 text-sm font-medium transition ${activeTab === 'css' ? 'border-b-2 border-purple-600 text-purple-600' : 'text-gray-500 hover:text-gray-700'}`}>
              CSS
            </button>
          </div>

          <Editor height="500px" language={activeTab === 'css' ? 'css' : 'html'} theme="vs-dark"
            value={getCurrentCode()} options={{ readOnly: true, minimap: { enabled: false } }} />

          <div className="flex gap-4 p-4 border-t">
            <button onClick={copyToClipboard}
              className="flex items-center gap-2 px-4 py-2 border border-fuchsia-600 bg-fuchsia-600 rounded-lg hover:bg-gray-50 transition text-white hover:text-purple-600 text-sm">
              Копировать код
            </button>
            <button onClick={() => alert('Архив будет доступен позже')}
              className="flex items-center gap-2 px-4 py-2 border border-fuchsia-600 bg-fuchsia-600 rounded-lg hover:bg-gray-50 transition text-white hover:text-purple-600 text-sm">
              Скачать ZIP
            </button>
          </div>
        </div>
      </main>
      <Footer />
    </div>
  );
};

export default ProjectPage;