import React, { useState, useEffect, useRef } from 'react';
import { SocketProvider } from './context/SocketContext';
import { ServerProvider, useServer } from './context/ServerContext';
import { ToastProvider } from './context/ToastContext';
import ToastContainer from './components/ToastContainer';
import { Activity, Folder, Users, Settings as SettingsIcon, Terminal, Package, Sliders, Hexagon, ShieldCheck } from 'lucide-react';
import { AnimatePresence, motion, useMotionValue, useSpring, useTransform } from 'framer-motion';
import Dashboard from './components/Dashboard';
import FileManager from './components/FileManager';
import PlayerManager from './components/PlayerManager';
import PluginManager from './components/PluginManager';
import ServerProperties from './components/ServerProperties';
import Settings from './components/Settings';
import WelcomeModal from './components/WelcomeModal';

class ErrorBoundary extends React.Component {
  constructor(props) {
    super(props);
    this.state = { hasError: false };
  }
  static getDerivedStateFromError(error) {
    return { hasError: true };
  }
  componentDidCatch(error, errorInfo) {
    console.error('ErrorBoundary caught:', error, errorInfo);
  }
  render() {
    if (this.state.hasError) {
      return <div className="p-10 text-white">Something went wrong. Check console.</div>;
    }
    return this.props.children;
  }
}

// Magnetic Button Component
const MagneticButton = ({ children, className, onClick, active }) => {
  const ref = useRef(null);
  const x = useMotionValue(0);
  const y = useMotionValue(0);

  const mouseXSpring = useSpring(x, { stiffness: 150, damping: 15 });
  const mouseYSpring = useSpring(y, { stiffness: 150, damping: 15 });

  const handleMouseMove = (e) => {
    const { left, top, width, height } = ref.current.getBoundingClientRect();
    const centerX = left + width / 2;
    const centerY = top + height / 2;
    x.set(e.clientX - centerX);
    y.set(e.clientY - centerY);
  };

  const handleMouseLeave = () => {
    x.set(0);
    y.set(0);
  };

  return (
    <motion.button
      ref={ref}
      onMouseMove={handleMouseMove}
      onMouseLeave={handleMouseLeave}
      onClick={onClick}
      style={{ x: mouseXSpring, y: mouseYSpring }}
      className={`relative group ${className}`}
    >
      {children}
    </motion.button>
  );
};

function AppContent() {
  const { connectSSH, updateConfig, isConnected, isConnecting } = useServer();
  const [activeTab, setActiveTab] = useState('dashboard');
  const [theme, setTheme] = useState('glass');
  const [showWelcome, setShowWelcome] = useState(false);
  const [sshCredentials, setSshCredentials] = useState(null);
  const [isGlobalDirty, setIsGlobalDirty] = useState(false);

  useEffect(() => {
    const visited = localStorage.getItem('hasVisited');
    if (!visited) setShowWelcome(true);

    const savedRadius = localStorage.getItem('theme_radius') || 'soft';
    document.documentElement.setAttribute('data-radius', savedRadius);

    const loadSettings = async () => {
      try {
        const API_URL = `http://${window.location.hostname}:3001`;
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
    const applyTheme = () => {
      document.documentElement.setAttribute('data-theme', theme);
      localStorage.setItem('mc_theme', theme);

      const root = document.documentElement;
      root.style.removeProperty('--bg-app');
      root.style.removeProperty('--bg-panel');
      root.style.removeProperty('--text-primary');
      root.style.removeProperty('--accent-primary');
      root.style.removeProperty('--accent-gradient');
      root.style.removeProperty('--glass-blur');
      root.style.removeProperty('--glass-border');
      root.style.removeProperty('--blob-color-1');
      root.style.removeProperty('--blob-color-2');
    };

    applyTheme();




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
    { id: 'players', label: 'Players', icon: Users },
    { id: 'files', label: 'Filesystem', icon: Folder },
    { id: 'plugins', label: 'Plugins', icon: Package },
    { id: 'properties', label: 'Server Properties', icon: Sliders },
    { id: 'settings', label: 'Settings', icon: SettingsIcon },
  ];

  const handleTabChange = (id) => {
    if (isGlobalDirty) {
      if (!window.confirm('System detect unsaved changes in progress. Discard modifications?')) return;
    }
    setActiveTab(id);
    setIsGlobalDirty(false);
  };

  const renderContent = () => {
    switch (activeTab) {
      case 'dashboard': return <Dashboard onNavigate={handleTabChange} />;
      case 'files': return <FileManager setDirty={setIsGlobalDirty} />;
      case 'players': return <PlayerManager />;
      case 'plugins': return <PluginManager />;
      case 'properties': return <ServerProperties setDirty={setIsGlobalDirty} />;
      case 'settings': return <Settings theme={theme} setTheme={setTheme} prefill={sshCredentials} />;
      default: return <Dashboard onNavigate={handleTabChange} />;
    }
  };

  return (
    <>
      <div className="fixed inset-0 z-[-1] overflow-hidden bg-black selection:bg-cyan-500/30">
        {/* Dynamic Gradients / Light Blobs */}
        <div className="absolute top-[-20%] left-[-10%] w-[50vw] h-[50vw] rounded-full mix-blend-screen animate-pulse-slow" style={{ backgroundColor: 'var(--blob-color-1)', filter: 'blur(120px)' }} />
        <div className="absolute bottom-[-20%] right-[-10%] w-[60vw] h-[60vw] rounded-full mix-blend-screen animate-pulse-slow" style={{ backgroundColor: 'var(--blob-color-2)', animationDelay: '2s', filter: 'blur(150px)' }} />


      </div>

      {showWelcome && (
        <WelcomeModal
          onComplete={handleWelcomeComplete}
          initialTheme={theme}
          setTheme={setTheme}
        />
      )}

      <div className={`flex h-screen w-screen gap-6 p-6 overflow-hidden transition-all duration-700 ease-liquid ${showWelcome ? 'blur-2xl scale-95 opacity-50 pointer-events-none' : ''}`}>

        {/* Sidebar */}
        <motion.aside
          initial={{ x: -50, opacity: 0 }}
          animate={{ x: 0, opacity: 1 }}
          transition={{ duration: 0.8, ease: "easeOut" }}
          className="liquid-card w-[280px] h-full flex flex-col p-6 z-50 rounded-3xl"
        >
          {/* Brand */}
          <div className="flex items-center gap-4 mb-10 px-2">
            <div className="relative w-12 h-12 flex items-center justify-center">
              <div className="absolute inset-0 bg-blue-500/20 blur-xl rounded-full" />
              <div className="relative z-10 w-full h-full bg-gradient-to-br from-blue-400 to-indigo-600 rounded-xl flex items-center justify-center shadow-lg shadow-blue-500/20">
                <Terminal size={20} className="text-white" />
              </div>

              {/* Status Indicator */}
              <div className={`absolute -inset-1 border-2 rounded-2xl transition-all duration-500 ${isConnected ? 'border-green-500/50 shadow-[0_0_15px_rgba(34,197,94,0.3)]' :
                isConnecting ? 'border-yellow-400/50' : 'border-red-500/30'
                }`} />
            </div>
            <div>
              <h1 className="text-lg font-bold tracking-widest text-white">SMM</h1>
              <span className={`text-[10px] font-bold tracking-widest uppercase px-2 py-0.5 rounded-full border ${isConnected ? 'text-green-400 border-green-500/20 bg-green-500/10' :
                isConnecting ? 'text-yellow-400 border-yellow-500/20 bg-yellow-500/10' : 'text-red-400 border-red-500/20 bg-red-500/10'
                }`}>
                {isConnected ? 'Link Active' : 'Standby'}
              </span>
            </div>
          </div>

          {/* Navigation */}
          <nav className="flex-1 flex flex-col gap-2">
            {tabs.map((tab) => (
              <MagneticButton
                key={tab.id}
                onClick={() => handleTabChange(tab.id)}
                className={`w-full flex items-center gap-4 px-4 py-4 rounded-xl transition-all duration-300 ${activeTab === tab.id
                  ? 'bg-white/10 text-white shadow-[inset_0_1px_0_rgba(255,255,255,0.1)] backdrop-blur-md'
                  : 'text-slate-400 hover:text-white hover:bg-white/5'
                  }`}
              >
                <tab.icon size={20} className={`transition-transform duration-300 ${activeTab === tab.id ? 'scale-110 text-cyan-400 drop-shadow-[0_0_8px_rgba(34,211,238,0.5)]' : ''}`} />
                <span className="font-medium tracking-wide text-sm">{tab.label}</span>

                {activeTab === tab.id && (
                  <motion.div
                    layoutId="activeTabGlow"
                    className="absolute inset-0 rounded-xl bg-gradient-to-r from-cyan-500/10 to-transparent pointer-events-none"
                    initial={false}
                    transition={{ type: "spring", stiffness: 500, damping: 30 }}
                  />
                )}
              </MagneticButton>
            ))}
          </nav>

          {/* Footer */}
          <div className="pt-6 border-t border-white/5 mt-auto">
            <div className="flex items-center gap-3 px-4 py-3 bg-green-500/5 border border-green-500/10 rounded-xl text-xs font-bold text-green-400 tracking-wider">
              <ShieldCheck size={14} />
              <span>ENCRYPTED V2 Link</span>
            </div>
          </div>
        </motion.aside>

        {/* Main Content Area */}
        <main className="flex-1 h-full min-w-0 relative z-10">
          <AnimatePresence mode="wait">
            <motion.div
              key={activeTab}
              initial={{ opacity: 0, y: 10, scale: 0.99 }}
              animate={{ opacity: 1, y: 0, scale: 1 }}
              exit={{ opacity: 0, y: -10, scale: 0.99, filter: 'blur(10px)' }}
              transition={{ duration: 0.3, ease: "easeOut" }}
              className="w-full h-full"
            >
              {renderContent()}
            </motion.div>
          </AnimatePresence>
        </main>
      </div>
    </>
  );
}

const App = () => {
  return (
    <ErrorBoundary>
      <SocketProvider>
        <ServerProvider>
          <ToastProvider>
            <AppContent />
            <ToastContainer />
          </ToastProvider>
        </ServerProvider>
      </SocketProvider>
    </ErrorBoundary>
  );
};

export default App;
