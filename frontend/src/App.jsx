import React, { useState, useEffect } from 'react';
import { SocketProvider } from './context/SocketContext';
import { ServerProvider, useServer } from './context/ServerContext';
import { Activity, Folder, Users, Settings as SettingsIcon, Terminal, Package, Sliders, Hexagon, ShieldCheck } from 'lucide-react';
import { AnimatePresence, motion } from 'framer-motion';
import Dashboard from './components/Dashboard';
import FileManager from './components/FileManager';
import PlayerManager from './components/PlayerManager';
import PluginManager from './components/PluginManager';
import ServerProperties from './components/ServerProperties';
import Settings from './components/Settings';
import WelcomeModal from './components/WelcomeModal';
import './styles/main.css';

function AppContent() {
  const { connectSSH, updateConfig, isConnected, isConnecting } = useServer();
  const [activeTab, setActiveTab] = useState('dashboard');
  const [theme, setTheme] = useState('glass');
  const [showWelcome, setShowWelcome] = useState(false);
  const [sshCredentials, setSshCredentials] = useState(null);

  useEffect(() => {
    const visited = localStorage.getItem('hasVisited');
    if (!visited) setShowWelcome(true);

    const loadSettings = async () => {
      try {
        const API_URL = import.meta.env.VITE_API_URL || 'http://localhost:3001';
        const response = await fetch(`${API_URL}/api/settings`);
        const settings = await response.json();
        if (settings.theme) setTheme(settings.theme);
        if (settings.wallpaper) {
          document.documentElement.style.setProperty('--wallpaper', `url(${API_URL}${settings.wallpaper})`);
        }
      } catch (e) {
        const savedTheme = localStorage.getItem('mc_theme');
        if (savedTheme) setTheme(savedTheme);
      }
    };
    loadSettings();
  }, []);

  useEffect(() => {
    document.documentElement.setAttribute('data-theme', theme);
    localStorage.setItem('mc_theme', theme);
  }, [theme]);

  const handleWelcomeComplete = (creds) => {
    if (!creds) return;
    const { path, ...sshCreds } = creds;
    setSshCredentials(sshCreds);
    setShowWelcome(false);
    connectSSH(sshCreds);
    if (path) updateConfig({ path, screenName: 'minecraft' });
  };

  const tabs = [
    { id: 'dashboard', label: 'Dashboard', icon: Activity },
    { id: 'players', label: 'Personnel', icon: Users },
    { id: 'files', label: 'Filesystem', icon: Folder },
    { id: 'plugins', label: 'Extensions', icon: Package },
    { id: 'properties', label: 'Configuration', icon: Sliders },
    { id: 'settings', label: 'Core System', icon: SettingsIcon },
  ];

  const renderContent = () => {
    switch (activeTab) {
      case 'dashboard': return <Dashboard />;
      case 'files': return <FileManager />;
      case 'players': return <PlayerManager />;
      case 'plugins': return <PluginManager />;
      case 'properties': return <ServerProperties />;
      case 'settings': return <Settings theme={theme} setTheme={setTheme} prefill={sshCredentials} />;
      default: return <Dashboard />;
    }
  };

  return (
    <>
      {showWelcome && (
        <WelcomeModal
          onComplete={handleWelcomeComplete}
          initialTheme={theme}
          setTheme={setTheme}
        />
      )}

      <div className={`app-container ${showWelcome ? 'blurred' : ''}`}>
        {/* Navigation Sidebar */}
        <aside className="glass-panel main-sidebar">
          <div className="brand-header">
            <div className="brand-logo">
              <Hexagon size={24} color="white" fill="currentColor" opacity={0.2} />
              <div className="logo-inner">
                <Terminal size={18} color="white" />
              </div>
              <div className={`connection-ring ${isConnected ? 'online' : isConnecting ? 'pending' : 'offline'}`} />
            </div>
            <div className="brand-text">
              <h1>SMM</h1>
              <p>v2.4 {isConnected ? 'Link Active' : 'Standby'}</p>
            </div>
          </div>

          <nav className="sidebar-nav">
            {tabs.map((tab) => (
              <button
                key={tab.id}
                className={`sidebar-link ${activeTab === tab.id ? 'active' : ''}`}
                onClick={() => setActiveTab(tab.id)}
              >
                <div className="link-content">
                  <tab.icon size={20} className="link-icon" />
                  <span>{tab.label}</span>
                </div>
                {activeTab === tab.id && (
                  <motion.div
                    layoutId="sidebarActive"
                    className="active-indicator"
                    transition={{ type: "spring", stiffness: 350, damping: 25 }}
                  />
                )}
              </button>
            ))}
          </nav>

          <div className="sidebar-footer">
            <div className="security-status glass-panel">
              <ShieldCheck size={16} />
              <span>Encrypted Link</span>
            </div>
          </div>
        </aside>

        {/* Main View Area */}
        <main className="view-viewport">
          <AnimatePresence mode="wait">
            <motion.div
              key={activeTab}
              initial={{ opacity: 0, scale: 0.99, y: 10 }}
              animate={{ opacity: 1, scale: 1, y: 0 }}
              exit={{ opacity: 0, scale: 1.01, y: -10 }}
              transition={{ duration: 0.3, ease: [0.16, 1, 0.3, 1] }}
              className="view-wrapper"
            >
              {renderContent()}
            </motion.div>
          </AnimatePresence>
        </main>
      </div>

      <style jsx>{`
        .app-container { display: flex; height: 100vh; width: 100vw; transition: 0.6s var(--ease-liquid); gap: 24px; padding: 24px; background: #000; overflow: hidden; }
        .app-container.blurred { filter: blur(30px) brightness(0.6); pointer-events: none; }
        
        /* SIDEBAR PREMIUM */
        .main-sidebar { width: 300px; height: 100%; display: flex; flex-direction: column; padding: 40px 24px; z-index: 100; flex-shrink: 0; }
        
        .brand-header { display: flex; align-items: center; gap: 20px; margin-bottom: 60px; padding-left: 8px; }
        .brand-logo { position: relative; width: 48px; height: 48px; display: flex; align-items: center; justify-content: center; }
        .logo-inner { position: absolute; inset: 0; display: flex; align-items: center; justify-content: center; background: var(--accent-gradient); border-radius: 14px; box-shadow: var(--shadow-glow); }
        
        .connection-ring { position: absolute; inset: -4px; border-radius: 18px; border: 2px solid transparent; }
        .connection-ring.online { border-color: #34c759; box-shadow: 0 0 15px rgba(52,199,89,0.3); animation: ringPulse 2s infinite; }
        .connection-ring.pending { border-color: #ffd60a; animation: ringPulse 1.5s infinite; }
        .connection-ring.offline { border-color: #ff3b30; }
        @keyframes ringPulse { 0% { opacity: 1; transform: scale(1); } 50% { opacity: 0.4; transform: scale(1.05); } 100% { opacity: 1; transform: scale(1); } }

        .brand-text h1 { margin: 0; font-size: 1.1rem; font-weight: 950; letter-spacing: 2px; color: white; line-height: 1; }
        .brand-text p { margin: 4px 0 0; font-size: 0.65rem; font-weight: 800; color: var(--text-secondary); opacity: 0.4; text-transform: uppercase; letter-spacing: 1px; }

        .sidebar-nav { display: flex; flex-direction: column; gap: 8px; flex: 1; }
        .sidebar-link { position: relative; padding: 18px 24px; border: none; background: transparent; color: var(--text-secondary); border-radius: 18px; font-weight: 800; font-size: 0.95rem; cursor: pointer; transition: 0.3s var(--ease-liquid); text-align: left; opacity: 0.6; }
        .sidebar-link:hover { opacity: 1; background: rgba(255,255,255,0.03); transform: translateX(8px); }
        .sidebar-link.active { opacity: 1; color: white; }
        
        .link-content { position: relative; z-index: 5; display: flex; align-items: center; gap: 18px; }
        .link-icon { transition: transform 0.3s; }
        .sidebar-link.active .link-icon { transform: scale(1.1); color: var(--accent-primary); }
        
        .active-indicator { position: absolute; inset: 0; background: rgba(255,255,255,0.03); border-radius: 18px; border: 1px solid rgba(255,255,255,0.08); z-index: 1; box-shadow: inset 0 0 20px rgba(0,0,0,0.2); }
        .sidebar-link.active::before { content: ''; position: absolute; left: 0; top: 18px; bottom: 18px; width: 4px; border-radius: 0 4px 4px 0; background: var(--accent-primary); box-shadow: 0 0 15px var(--accent-primary); z-index: 10; }

        .sidebar-footer { padding-top: 24px; border-top: 1px solid rgba(255,255,255,0.05); }
        .security-status { display: flex; align-items: center; gap: 12px; padding: 16px; font-size: 0.75rem; font-weight: 800; color: #34c759; background: rgba(52,199,89,0.05); }

        .view-viewport { flex: 1; height: 100%; position: relative; min-width: 0; }
        .view-wrapper { height: 100%; width: 100%; }
      `}</style>
    </>
  );
}

function App() {
  return (
    <SocketProvider>
      <ServerProvider>
        <AppContent />
      </ServerProvider>
    </SocketProvider>
  )
}

export default App;
