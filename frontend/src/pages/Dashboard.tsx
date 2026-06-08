import React, { useEffect, useState } from 'react';
import { api } from '../services/api';
import Footer from '../components/Footer';
import Header from '../components/Header';

interface Project {
  id: string;
  projectName: string;
  componentName: string;
  createdAt: string;
  shareToken: string;
}

const groupProjects = (projects: Project[]) => {
  const groups: { [key: string]: Project[] } = {};
  projects.forEach(project => {
    if (!groups[project.projectName]) {
      groups[project.projectName] = [];
    }
    groups[project.projectName].push(project);
  });
  return groups;
};

const Dashboard = () => {
  const colorPalette = [
    { light: 'bg-purple-100', bright: 'bg-purple-600', text: 'text-white', border: 'border-purple-200' },
    { light: 'bg-pink-100', bright: 'bg-pink-500', text: 'text-white', border: 'border-pink-200' },
    { light: 'bg-orange-100', bright: 'bg-orange-500', text: 'text-white', border: 'border-orange-200' },
    { light: 'bg-rose-100', bright: 'bg-rose-500', text: 'text-white', border: 'border-rose-200' },
    { light: 'bg-fuchsia-100', bright: 'bg-fuchsia-500', text: 'text-white', border: 'border-fuchsia-200' },
    { light: 'bg-amber-100', bright: 'bg-amber-500', text: 'text-white', border: 'border-amber-200' },
    { light: 'bg-lime-100', bright: 'bg-lime-600', text: 'text-white', border: 'border-lime-200' },
    { light: 'bg-teal-100', bright: 'bg-teal-600', text: 'text-white', border: 'border-teal-200' },
    { light: 'bg-indigo-50', bright: 'bg-indigo-600', text: 'text-white', border: 'border-indigo-200' },
    { light: 'bg-violet-50', bright: 'bg-violet-600', text: 'text-white', border: 'border-violet-200' },
  ];

  const [projects, setProjects] = useState<Project[]>([]);
  const [loading, setLoading] = useState(true);
  const [expandedGroups, setExpandedGroups] = useState<{ [key: string]: boolean }>({});
  const [showConfirm, setShowConfirm] = useState(false);
  const [projectDelete, setProjectDelete] = useState<string | null>(null);
  const deleteProject = (id: string) => {
    setProjectDelete(id);
    setShowConfirm(true);
  };
  const handleConfirmDelete = async () => {
    if (projectDelete) {
        await api.deleteProject(projectDelete);
        setProjects(projects.filter(p => projectDelete !== p.id));
    }
    setShowConfirm(false);
    setProjectDelete(null);
  };  
  const cancelDelete = () => {
    setShowConfirm(false);
    setProjectDelete(null);
    };
  const ownerId = '1511084425325288325';

  useEffect(() => {
    api.getProjects(ownerId)
      .then((res) => {
        setProjects(res.data.projects);
        setLoading(false);
      })
      .catch((err) => {
        console.error(err);
        setLoading(false);
      });
  }, []);

  const getGroupColor = (groupName: string) => {
    const hash = groupName.split('').reduce((acc, char) => acc + char.charCodeAt(0), 0);
    const index = hash % colorPalette.length;
    return colorPalette[index];
  };

  const groupedProjects = groupProjects(projects);
  const toggleGroup = (groupName: string) => {
    setExpandedGroups(prev => ({ ...prev, [groupName]: !prev[groupName] }));
  };

  if (loading) return <div className="p-8 text-center">Загрузка...</div>;

  return (
    <div className="max-w-7xl mx-auto px-4 py-6">
      <Header />
      <main className="mt-24">
        <div className="flex justify-between items-center pb-5 mb-8 px-4 border-b border-gray-200">
          <h1 className="text-3xl font-bold text-gray-800">Swagger Design</h1>
        </div>
        <div className="bg-white rounded-xl shadow-md p-4">
          <div className="text-xl font-semibold text-gray-800 mb-5">Projects</div>
          {projects.length === 0 ? (
            <div className="text-center py-10 text-gray-500 bg-gray-50 rounded-lg">
              У вас пока нет проектов. Экспортируйте макет из Figma.
            </div>
          ) : (
            <div className="space-y-4">
              {Object.entries(groupedProjects).map(([groupName, groupProjects]) => (
                <div key={groupName} className="border border-gray-200 rounded-xl overflow-hidden">
                  <div className={`${getGroupColor(groupName).light} px-5 py-4 flex justify-between items-center cursor-pointer hover:${getGroupColor(groupName).bright} transition`}
                    onClick={() => toggleGroup(groupName)}>
                    <div className="flex items-center gap-3">
                      <div className={`px-3 py-2 rounded-lg font-semibold ${getGroupColor(groupName).bright} ${getGroupColor(groupName).text} border`}>
                        {groupName}
                      </div>
                      <span className="text-s text-gray-500 px-2 py-0.5">
                        {groupProjects.length} {groupProjects.length === 1 ? 'component' : 'components'}
                      </span>
                    </div>
                    <svg className={`w-5 h-5 text-gray-500 transition-transform ${expandedGroups[groupName] ? 'rotate-90' : ''}`}
                      fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
                    </svg>
                  </div>
                  {expandedGroups[groupName] && (
                    <div className="divide-y divide-gray-100">
                      {groupProjects.map((project) => (
                        <div key={project.id} className="bg-white px-5 py-4 hover:bg-gray-50 transition flex justify-between items-center">
                          <div className="flex-1">
                            <div className="flex justify-between">
                              <span className="text-gray-700 font-medium text-s flex items-center pt-1">{project.componentName}</span>
                              <div className="flex justify-row gap-2">
                                <a href={`/project/${project.id}`}
                                    className={`${getGroupColor(groupName).bright} flex items-center text-white px-4 py-2 rounded-md text-sm hover:opacity-80 transition`}>
                                    Открыть
                                </a>
                                <button 
                                className={`flex items-center gap-2 px-4 py-2 rounded-md text-sm transition border-2 hover:opacity-80`}
                                style={{ 
                                    borderColor: getGroupColor(groupName).bright.replace('bg-', ''),
                                    color: getGroupColor(groupName).bright.replace('bg-', '')
                                }}
                                onClick={() => deleteProject(project.id)}
                                >
                                Удалить
                                </button>
                               </div>
                            </div>
                          </div>
                        </div>
                      ))}
                    </div>
                  )}
                </div>
              ))}
            </div>
          )}
        </div>
      </main>
    {showConfirm && (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
        <div className="bg-white rounded-lg p-6 max-w-sm mx-4">
        <h3 className="text-lg font-semibold mb-4">Подтверждение удаления</h3>
        <p className="text-gray-600 mb-6">
            Вы уверены, что хотите удалить этот компонент? Это действие нельзя отменить.
        </p>
        <div className="flex justify-end gap-3">
            <button
            onClick={() => setShowConfirm(false)}
            className="px-4 py-2 border border-gray-300 rounded-md hover:bg-gray-50 transition"
            >
            Отмена
            </button>
            <button
            onClick={handleConfirmDelete}
            className="px-4 py-2 bg-pink-600 text-white rounded-md hover:bg-pink-700 transition"
            >
            Удалить
            </button>
        </div>
        </div>
    </div>
    )}
      <Footer className="mt-60" />
    </div>
  );
};

export default Dashboard;