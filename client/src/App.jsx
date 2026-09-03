import React, { useState, useEffect } from 'react';
import Navbar from './components/Navbar';
import Sidebar from './components/Sidebar';
import Dashboard from './components/Dashboard';
import Playground from './components/Playground';
import WorkflowBuilder from './components/WorkflowBuilder';
import KnowledgeBase from './components/KnowledgeBase';
import ImageStudio from './components/ImageStudio';
import ApiKeyManager from './components/ApiKeyManager';
import BillingModal from './components/BillingModal';
import ProfileModal from './components/ProfileModal';
import AuthPage from './components/AuthPage';
import { fetchStats, fetchCurrentUser } from './services/api';

export default function App() {
  const [currentUser, setCurrentUser] = useState(() => {
    const saved = localStorage.getItem('nexus_user');
    return saved ? JSON.parse(saved) : null;
  });
  
  const [currentTab, setCurrentTab] = useState('dashboard');
  const [stats, setStats] = useState(null);
  const [recentActivity, setRecentActivity] = useState([]);
  const [isBillingOpen, setIsBillingOpen] = useState(false);
  const [isProfileOpen, setIsProfileOpen] = useState(false);

  useEffect(() => {
    if (currentUser) {
      loadTelemetry();
    }
  }, [currentUser]);

  async function loadTelemetry() {
    try {
      const res = await fetchStats();
      if (res.success) {
        setStats(res.stats);
        setRecentActivity(res.recentActivity);
      }
    } catch (err) {
      console.error('Failed to fetch telemetry:', err);
    }
  }

  function handleAuthSuccess(user) {
    setCurrentUser(user);
    loadTelemetry();
  }

  function handleLogout() {
    localStorage.removeItem('nexus_user');
    setCurrentUser(null);
    setIsProfileOpen(false);
  }

  function handleUpdateUser(updatedUser) {
    setCurrentUser(updatedUser);
  }

  // If user is not logged in, show the Login/Sign Up Page
  if (!currentUser) {
    return <AuthPage onAuthSuccess={handleAuthSuccess} />;
  }

  return (
    <div className="app-container">
      {/* Fixed Sidebar */}
      <Sidebar 
        currentTab={currentTab} 
        onSelectTab={setCurrentTab} 
        onOpenBilling={() => setIsBillingOpen(true)} 
      />

      {/* Main Content Area */}
      <div className="main-content">
        <Navbar 
          stats={stats} 
          recentActivity={recentActivity} 
          user={currentUser}
          onOpenBilling={() => setIsBillingOpen(true)}
          onOpenProfile={() => setIsProfileOpen(true)}
          onTabChange={setCurrentTab}
        />

        <main style={{ flex: 1 }}>
          {currentTab === 'dashboard' && (
            <Dashboard 
              stats={stats} 
              recentActivity={recentActivity} 
              onSelectTab={setCurrentTab} 
              onRefresh={loadTelemetry}
            />
          )}

          {currentTab === 'playground' && (
            <Playground onUpdateStats={loadTelemetry} />
          )}

          {currentTab === 'workflows' && (
            <WorkflowBuilder onUpdateStats={loadTelemetry} />
          )}

          {currentTab === 'knowledge' && (
            <KnowledgeBase onUpdateStats={loadTelemetry} />
          )}

          {currentTab === 'images' && (
            <ImageStudio onUpdateStats={loadTelemetry} />
          )}

          {currentTab === 'apikeys' && (
            <ApiKeyManager onUpdateStats={loadTelemetry} />
          )}
        </main>
      </div>

      {/* Subscription & Billing Modal */}
      <BillingModal 
        isOpen={isBillingOpen} 
        onClose={() => setIsBillingOpen(false)} 
      />

      {/* Editable Profile Modal */}
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
