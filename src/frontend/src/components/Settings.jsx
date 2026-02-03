import React, { useState, useEffect, useRef } from 'react';
import { useServer } from '../context/ServerContext';
import { useSocket } from '../context/SocketContext';
import { useToast } from '../context/ToastContext';
import { HardDrive, Server, Palette, Loader2, AlertCircle, Upload, Image as ImageIcon, Check, MousePointer2, Box, PenTool, GripVertical } from 'lucide-react';
import { motion } from 'framer-motion';
import { Responsive, WidthProvider } from 'react-grid-layout';
import 'react-grid-layout/css/styles.css';
import 'react-resizable/css/styles.css';

const ResponsiveGridLayout = WidthProvider(Responsive);


const Settings = ({ theme, setTheme, prefill }) => {
    const {
        config, updateConfig, isConnected, isConnecting, lastError, connectSSH, disconnectSSH
    } = useServer();

    const [sshConfig, setSshConfig] = useState({
        host: '',
        port: 22,
        username: '',
        password: ''
    });

    const [mcPath, setMcPath] = useState(config.path);
    const [mcScreen, setMcScreen] = useState(config.screenName);
    const [mcStart, setMcStart] = useState(config.startScript || './start.sh');
    const [mcStop, setMcStop] = useState(config.stopScript || 'stop');
    const [radius, setRadius] = useState(localStorage.getItem('theme_radius') || 'soft');
    const { showToast } = useToast();
    const [saveStatus, setSaveStatus] = useState(null);
    const { socket } = useSocket();

    const defaultLayouts = {
        lg: [
            { i: 'connection', x: 0, y: 0, w: 12, h: 14 },
            { i: 'personalization', x: 0, y: 14, w: 12, h: 10 },
            { i: 'engine', x: 0, y: 24, w: 12, h: 12 },
        ],
        md: [
            { i: 'connection', x: 0, y: 0, w: 12, h: 14 },
            { i: 'personalization', x: 0, y: 14, w: 12, h: 10 },
            { i: 'engine', x: 0, y: 24, w: 12, h: 12 },
        ]
    };

    const [layouts, setLayouts] = useState(() => {
        const saved = localStorage.getItem('settings_layout');
        return saved ? JSON.parse(saved) : defaultLayouts;
    });

    const onLayoutChange = (currentLayout, allLayouts) => {
        setLayouts(allLayouts);
        localStorage.setItem('settings_layout', JSON.stringify(allLayouts));
    };

    const themes = [
        { id: 'glass', name: 'Liquid Glass', desc: 'Default vibrant sapphire' },
        { id: 'sakura', name: 'Cherry Blossom', desc: 'Soft pink elegance' },
        { id: 'coder', name: 'Matrix Coder', desc: 'The hacker console' },
        { id: 'obsidian', name: 'Obsidian Black', desc: 'High contrast OLED experience' },
        { id: 'gold', name: 'Gold', desc: 'Premium luxury gold' },
        { id: 'forest', name: 'Enchanted Forest', desc: 'Deep mystic greens' },
        { id: 'nebula', name: 'Deep Nebula', desc: 'Cosmic purple void' },
        { id: 'sunset', name: 'Crimson Sunset', desc: 'Warm gradients' },
    ];

    useEffect(() => {
        setMcPath(config.path);
        setMcScreen(config.screenName);
        setMcStart(config.startScript || './start.sh');
        setMcStop(config.stopScript || 'stop');
    }, [config]);

    useEffect(() => {
        const saved = localStorage.getItem('ssh_credentials');
        if (saved) {
            setSshConfig(JSON.parse(saved));
        } else if (prefill) {
            setSshConfig(prev => ({ ...prev, ...prefill }));
        }
    }, [prefill]);

    useEffect(() => {
        if (!socket) return;
        const handleAck = (res) => {
            if (res.success) {
                setSaveStatus('Config synchronized successfully.');
                setTimeout(() => setSaveStatus(null), 3000);
            }
        };
        socket.on('config:ack', handleAck);
        return () => socket.off('config:ack', handleAck);
    }, [socket]);

    const handleConnect = (e) => {
        e.preventDefault();
        connectSSH(sshConfig);
    };

    const handleDisconnect = (e) => {
        e.preventDefault();
        disconnectSSH();
    };

    const handleConfigSave = (e) => {
        if (e) e.preventDefault();
        updateConfig({
            path: mcPath,
            screenName: mcScreen,
            startScript: mcStart,
            stopScript: mcStop
        });
    };

    const updateTheme = async (newTheme) => {
        setTheme(newTheme);
        try {
            await fetch(`http://${window.location.hostname}:3001/api/settings`, {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ theme: newTheme })
            });
        } catch (e) {
            console.error('Failed to save theme setting');
        }
    };

    return (
        <div className="h-full w-full overflow-y-auto overflow-x-hidden pr-2 scrollbar-thin scrollbar-thumb-white/10">
            <ResponsiveGridLayout
                className="layout"
                layouts={layouts}
                breakpoints={{ lg: 1200, md: 996, sm: 768, xs: 480, xxs: 0 }}
                cols={{ lg: 12, md: 12, sm: 6, xs: 4, xxs: 2 }}
                rowHeight={40}
                margin={[16, 16]}
                onLayoutChange={onLayoutChange}
                draggableHandle=".cursor-grab"
                isDraggable={true}
                isResizable={true}
            >
                {/* Connection Section */}
                <div key="connection" className="liquid-card p-10 flex flex-col gap-8 border-white/10 overflow-hidden">
                    <div className="flex gap-6 items-center border-b border-white/5 pb-8 cursor-grab active:cursor-grabbing backdrop-blur-md">
                        <div className="w-14 h-14 rounded-2xl bg-[var(--accent-primary)]/10 flex items-center justify-center text-[var(--accent-primary)] shadow-[0_0_30px_var(--accent-primary)]/10 relative">
                            <Server size={28} className="relative z-10" />
                            <div className="absolute inset-0 bg-[var(--accent-primary)] blur-xl opacity-20" />
                        </div>
                        <div>
                            <h3 className="text-2xl font-black text-white tracking-tight uppercase">Access Control</h3>
                            <p className="text-white/40 font-bold text-[10px] uppercase tracking-widest mt-1">Direct SSH Matrix Configuration</p>
                        </div>
                        <div className="ml-auto opacity-10"><GripVertical size={20} /></div>
                    </div>

                    <div onMouseDown={e => e.stopPropagation()} className="flex-1 overflow-y-auto pr-2 scrollbar-thin scrollbar-thumb-white/10">
                        {lastError && (
                            <div className="bg-red-500/10 border border-red-500/20 text-red-400 p-5 rounded-xl flex items-center gap-4 font-black text-xs uppercase tracking-widest mb-8 shadow-lg shadow-red-500/10">
                                <AlertCircle size={20} />
                                <span>{lastError}</span>
                            </div>
                        )}

                        <form onSubmit={handleConnect} className="flex flex-col gap-10">
                            <div className="grid grid-cols-1 md:grid-cols-2 gap-x-10 gap-y-8">
                                <div className="flex flex-col gap-3 group">
                                    <label className="text-[10px] font-black uppercase tracking-[0.2em] text-white/20 group-focus-within:text-[var(--accent-primary)] transition-colors ml-1">Virtual Host // Address</label>
                                    <input className="liquid-input font-mono text-sm bg-black/40 border-white/5 focus:border-[var(--accent-primary)]/30" value={sshConfig.host} onChange={e => setSshConfig({ ...sshConfig, host: e.target.value })} placeholder="127.0.0.1" />
                                </div>
                                <div className="flex flex-col gap-3 group">
                                    <label className="text-[10px] font-black uppercase tracking-[0.2em] text-white/20 group-focus-within:text-[var(--accent-primary)] transition-colors ml-1">Channel Port // Default 22</label>
                                    <input className="liquid-input font-mono text-sm bg-black/40 border-white/5 focus:border-[var(--accent-primary)]/30" type="number" value={sshConfig.port} onChange={e => setSshConfig({ ...sshConfig, port: parseInt(e.target.value) })} />
                                </div>
                                <div className="flex flex-col gap-3 group">
                                    <label className="text-[10px] font-black uppercase tracking-[0.2em] text-white/20 group-focus-within:text-[var(--accent-primary)] transition-colors ml-1">Identity // UID</label>
                                    <input className="liquid-input font-mono text-sm bg-black/40 border-white/5 focus:border-[var(--accent-primary)]/30" value={sshConfig.username} onChange={e => setSshConfig({ ...sshConfig, username: e.target.value })} placeholder="root" />
                                </div>
                                <div className="flex flex-col gap-3 group">
                                    <label className="text-[10px] font-black uppercase tracking-[0.2em] text-white/20 group-focus-within:text-[var(--accent-primary)] transition-colors ml-1">Authorization // Secret</label>
                                    <input className="liquid-input font-mono text-sm bg-black/40 border-white/5 focus:border-[var(--accent-primary)]/30" type="password" value={sshConfig.password} onChange={e => setSshConfig({ ...sshConfig, password: e.target.value })} />
                                </div>
                            </div>
                            <div className="flex flex-col gap-3 group">
                                <label className="text-[10px] font-black uppercase tracking-[0.2em] text-white/20 group-focus-within:text-[var(--accent-primary)] transition-colors ml-1">RSA Private Identity (PKCS#8)</label>
                                <textarea
                                    value={sshConfig.privateKey || ''}
                                    onChange={e => setSshConfig({ ...sshConfig, privateKey: e.target.value })}
                                    className="liquid-input font-mono text-[11px] h-32 resize-none bg-black/40 border-white/5 focus:border-[var(--accent-primary)]/30 selection:bg-[var(--accent-primary)]/20"
                                    placeholder="-----BEGIN RSA PRIVATE KEY-----"
                                />
                            </div>
                            <div className="pt-4">
                                {isConnected ? (
                                    <button type="button" onClick={handleDisconnect} className="w-full py-5 rounded-2xl font-black uppercase tracking-[0.2em] bg-rose-600 hover:bg-rose-500 text-white shadow-xl shadow-rose-900/40 transition-all active:scale-95 text-xs">Terminate Active Link</button>
                                ) : (
                                    <button type="submit" className={`w-full py-5 rounded-2xl font-black uppercase tracking-[0.2em] bg-[var(--accent-primary)] text-black shadow-xl shadow-[var(--accent-primary)]/20 hover:saturate-150 transition-all active:scale-95 flex items-center justify-center gap-3 text-xs ${isConnecting ? 'opacity-70 cursor-wait' : ''}`} disabled={isConnecting}>
                                        {isConnecting ? <><Loader2 className="animate-spin" size={20} /> Establish Link...</> : 'Initialize SSH Connection'}
                                    </button>
                                )}
                            </div>
                        </form>
                    </div>
                </div>

                {/* Theme Section */}
                <div key="personalization" className="liquid-card p-10 flex flex-col gap-8 border-white/10">
                    <div className="flex gap-6 items-center border-b border-white/5 pb-8 cursor-grab active:cursor-grabbing bg-white/[0.01]">
                        <div className="w-14 h-14 rounded-2xl bg-purple-500/10 flex items-center justify-center text-purple-400 shadow-[0_0_30px_rgba(168,85,247,0.1)]">
                            <Palette size={28} />
                        </div>
                        <div>
                            <h3 className="text-2xl font-black text-white tracking-tight uppercase">Visual Matrix</h3>
                            <p className="text-white/40 font-bold text-[10px] uppercase tracking-widest mt-1">Environmental Theming Engine</p>
                        </div>
                        <div className="ml-auto opacity-10"><GripVertical size={20} /></div>
                    </div>

                    <div onMouseDown={e => e.stopPropagation()} className="flex-1 overflow-y-auto pr-2 scrollbar-thin scrollbar-thumb-white/10">
                        <div className="grid grid-cols-2 lg:grid-cols-4 gap-6 mb-10">
                            {themes.map(t => (
                                <motion.button
                                    whileHover={{ scale: 1.05, y: -5 }}
                                    whileTap={{ scale: 0.95 }}
                                    key={t.id}
                                    className={`group relative p-5 rounded-2xl border flex flex-col items-center gap-4 transition-all cursor-pointer overflow-hidden ${theme === t.id ? 'bg-white/10 border-[var(--accent-primary)]/50 shadow-[0_20px_40px_rgba(0,0,0,0.5)]' : 'bg-black/40 border-white/5 hover:border-white/10 hover:bg-black/60'
                                        }`}
                                    onClick={() => updateTheme(t.id)}
                                >
                                    <div
                                        className={`w-14 h-14 rounded-full shadow-2xl relative ${t.id === 'glass' ? 'bg-gradient-to-br from-blue-600 to-black' :
                                            t.id === 'sakura' ? 'bg-gradient-to-br from-pink-400 to-rose-900 shadow-pink-500/20' :
                                                t.id === 'gold' ? 'bg-gradient-to-br from-yellow-500 to-yellow-900 shadow-yellow-500/20' :
                                                    t.id === 'forest' ? 'bg-gradient-to-br from-emerald-500 to-green-950 shadow-emerald-500/20' :
                                                        t.id === 'nebula' ? 'bg-gradient-to-br from-purple-500 to-indigo-950 shadow-purple-500/20' :
                                                            t.id === 'sunset' ? 'bg-gradient-to-br from-orange-500 to-red-950 shadow-orange-500/20' :
                                                                'bg-gray-950 shadow-white/5'
                                            }`}
                                    >
                                        <div className="absolute inset-0 rounded-full bg-white/10 blur-[2px] mask-gradient" />
                                    </div>
                                    <div className="text-center group-hover:scale-105 transition-transform">
                                        <div className="font-black text-white text-[10px] uppercase tracking-widest">{t.name}</div>
                                    </div>
                                    {theme === t.id && (
                                        <motion.div layoutId="theme-active" className="absolute top-2 right-2 text-[var(--accent-primary)]">
                                            <Check size={18} className="drop-shadow-[0_0_10px_currentColor]" />
                                        </motion.div>
                                    )}
                                </motion.button>
                            ))}
                        </div>

                        <div className="pt-10 border-t border-white/5">
                            <label className="flex items-center gap-3 mb-5 font-black text-white/40 uppercase tracking-[0.3em] text-[10px]"><Box size={16} className="text-[var(--accent-primary)]" /> Geometry Density</label>
                            <div className="grid grid-cols-3 gap-3 bg-black/60 p-2 rounded-2xl border border-white/5 shadow-inner">
                                {['sharp', 'soft', 'round'].map(r => (
                                    <button
                                        key={r}
                                        className={`py-3 rounded-xl font-black text-[10px] uppercase tracking-widest transition-all ${radius === r
                                            ? 'bg-[var(--accent-primary)] text-black shadow-[0_10px_20px_var(--accent-primary)]/10'
                                            : 'text-white/20 hover:text-white hover:bg-white/5'
                                            }`}
                                        onClick={() => {
                                            setRadius(r);
                                            localStorage.setItem('theme_radius', r);
                                            document.documentElement.setAttribute('data-radius', r);
                                            showToast(`Geometry: ${r}`, 'info');
                                        }}
                                    >
                                        {r}
                                    </button>
                                ))}
                            </div>
                        </div>
                    </div>
                </div>

                {/* Engine Config */}
                <div key="engine" className="liquid-card p-10 flex flex-col gap-8 border-white/10">
                    <div className="flex gap-6 items-center border-b border-white/5 pb-8 cursor-grab active:cursor-grabbing bg-white/[0.01]">
                        <div className="w-14 h-14 rounded-2xl bg-emerald-500/10 flex items-center justify-center text-emerald-400 shadow-[0_0_30px_rgba(52,211,153,0.1)]">
                            <HardDrive size={28} />
                        </div>
                        <div>
                            <h3 className="text-2xl font-black text-white tracking-tight uppercase">Logic Engine</h3>
                            <p className="text-white/40 font-bold text-[10px] uppercase tracking-widest mt-1">Core Startup Parameters</p>
                        </div>
                        <div className="ml-auto opacity-10"><GripVertical size={20} /></div>
                    </div>

                    <div onMouseDown={e => e.stopPropagation()} className="flex-1 overflow-y-auto pr-2 scrollbar-thin scrollbar-thumb-white/10">
                        <form onSubmit={handleConfigSave} className="flex flex-col gap-10">
                            <div className="flex flex-col gap-3 group">
                                <label className="text-[10px] font-black uppercase tracking-[0.2em] text-white/20 group-focus-within:text-emerald-400">Root Deployment Path</label>
                                <input className="liquid-input font-mono text-sm bg-black/40 border-white/5 focus:border-emerald-500/30" value={mcPath} onChange={e => setMcPath(e.target.value)} placeholder="/home/user/mcserver" />
                            </div>
                            <div className="grid grid-cols-1 md:grid-cols-2 gap-x-10 gap-y-8">
                                <div className="flex flex-col gap-3 group">
                                    <label className="text-[10px] font-black uppercase tracking-[0.2em] text-white/20 group-focus-within:text-emerald-400">Multiplexer Domain (Screen)</label>
                                    <input className="liquid-input font-mono text-sm bg-black/40 border-white/5 focus:border-emerald-500/30" value={mcScreen} onChange={e => setMcScreen(e.target.value)} placeholder="minecraft" />
                                </div>
                                <div className="flex flex-col gap-3 group">
                                    <label className="text-[10px] font-black uppercase tracking-[0.2em] text-white/20 group-focus-within:text-emerald-400">Initialization Sequence</label>
                                    <input className="liquid-input font-mono text-sm bg-black/40 border-white/5 focus:border-emerald-500/30" value={mcStart} onChange={e => setMcStart(e.target.value)} placeholder="./start.sh" />
                                </div>
                            </div>
                            <div className="flex flex-col gap-3 group">
                                <label className="text-[10px] font-black uppercase tracking-[0.2em] text-white/20 group-focus-within:text-emerald-400">Termination Protocol</label>
                                <input className="liquid-input font-mono text-sm bg-black/40 border-white/5 focus:border-emerald-500/30" value={mcStop} onChange={e => setMcStop(e.target.value)} placeholder="stop" />
                            </div>
                            {saveStatus && (
                                <motion.div initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} className="bg-emerald-500/10 border border-emerald-500/20 text-emerald-400 p-4 rounded-xl flex items-center gap-4 font-black text-[10px] uppercase tracking-widest shadow-lg shadow-emerald-500/10">
                                    <Check size={18} />
                                    <span>{saveStatus}</span>
                                </motion.div>
                            )}
                            <button type="submit" className="w-full py-5 rounded-2xl font-black border border-emerald-500/30 text-emerald-400 hover:bg-emerald-500/10 transition-all uppercase tracking-[0.3em] text-[11px] active:scale-[0.98]">
                                Commit Engine Changes
                            </button>
                        </form>
                    </div>
                </div>
            </ResponsiveGridLayout>
        </div>
    );
};

export default Settings;
