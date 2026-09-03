import React, { useState, useEffect } from 'react';
import Navbar from './components/Navbar';
import Sidebar from './components/Sidebar';
import Dashboard from './components/Dashboard';
import Onboarding from './components/Onboarding';
import AgentActivity from './components/AgentActivity';
import Architecture from './components/Architecture';
import TasksIssues from './components/TasksIssues';
import CodeReviews from './components/CodeReviews';
import Deployments from './components/Deployments';
import Settings from './components/Settings';
import ProfileModal from './components/ProfileModal';
import AuthPage from './components/AuthPage';

const DEFAULT_PROJECT = {
  id: 'proj-1',
  title: 'Expense Tracker SaaS',
  description: 'AI-powered expense tracking platform for college students with AI insights, budget planning, and real-time analytics.',
  status: 'Active',
  progress: 68,
  tasksCompleted: 32,
  tasksTotal: 47,
  activeAgents: 8,
  openIssues: 12
};

export default function App() {
  const [currentUser, setCurrentUser] = useState(() => {
    const saved = localStorage.getItem('forge_user');
    return saved ? JSON.parse(saved) : null;
  });

  const [currentTab, setCurrentTab] = useState('dashboard');
  const [project, setProject] = useState(DEFAULT_PROJECT);
  const [isProfileOpen, setIsProfileOpen] = useState(false);

  function handleAuthSuccess(user) {
    setCurrentUser(user);
  }

  function handleLogout() {
    localStorage.removeItem('forge_user');
    setCurrentUser(null);
    setIsProfileOpen(false);
  }

  function handleUpdateUser(updatedUser) {
    setCurrentUser(updatedUser);
  }

  function handleCreateProject(newProj) {
    setProject({
      ...DEFAULT_PROJECT,
      title: newProj.title,
      description: newProj.description
    });
    setCurrentTab('dashboard');
  }

  // Show Auth Gateway if not logged in
  if (!currentUser) {
    return <AuthPage onAuthSuccess={handleAuthSuccess} />;
  }

  return (
    <div className="app-container">
      {/* FORGE Dark Sidebar */}
      <Sidebar 
        currentTab={currentTab} 
        onSelectTab={setCurrentTab}
        onOpenProfile={() => setIsProfileOpen(true)}
        user={currentUser}
      />

      {/* Main Content Area */}
      <div className="main-content">
        <Navbar 
          project={project}
          user={currentUser}
          onOpenProfile={() => setIsProfileOpen(true)}
          onOpenNewProject={() => setCurrentTab('onboarding')}
        />

        <main style={{ flex: 1 }}>
          {currentTab === 'dashboard' && (
            <Dashboard 
              project={project}
              onSelectTab={setCurrentTab}
              onOpenNewTask={() => setCurrentTab('tasks')}
            />
          )}

          {currentTab === 'onboarding' && (
            <Onboarding 
              onCreateProject={handleCreateProject}
            />
          )}

          {currentTab === 'agents' && (
            <AgentActivity />
          )}

          {currentTab === 'architecture' && (
            <Architecture />
          )}

          {currentTab === 'tasks' && (
            <TasksIssues />
          )}

          {currentTab === 'reviews' && (
            <CodeReviews />
          )}

          {currentTab === 'deployments' && (
            <Deployments />
          )}

          {currentTab === 'integrations' && (
            <Settings project={project} user={currentUser} />
          )}

          {currentTab === 'settings' && (
            <Settings project={project} user={currentUser} />
          )}
        </main>
      </div>

      {/* Profile Editor Modal */}
      <ProfileModal 
        isOpen={isProfileOpen} 
        onClose={() => setIsProfileOpen(false)} 
        user={currentUser}
        onUpdateUser={handleUpdateUser}
        onLogout={handleLogout}
      />
    </div>
  );
}
