import React, { useState, useEffect, useRef } from 'react';
import { useServer } from '../context/ServerContext';
import { useSocket } from '../context/SocketContext';
import { useToast } from '../context/ToastContext';
import { HardDrive, Server, Palette, Loader2, AlertCircle, Upload, Image as ImageIcon, Check, MousePointer2, Box, PenTool } from 'lucide-react';
import { motion } from 'framer-motion';


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
    }, [config.path, config.screenName]);

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
            await fetch(`${import.meta.env.VITE_API_URL || 'http://localhost:3001'}/api/settings`, {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ theme: newTheme })
            });
        } catch (e) {
            console.error('Failed to save theme setting');
        }
    };



    return (
        <div className="h-full overflow-y-auto px-4 pb-20 scrollbar-thin scrollbar-thumb-white/10">


            <div className="max-w-4xl mx-auto flex flex-col gap-12 py-10">
                {/* Connection Section */}
                <div className="liquid-card p-10 flex flex-col gap-8">
                    <div className="flex gap-6 items-center border-b border-white/5 pb-8">
                        <div className="w-14 h-14 rounded-2xl bg-blue-500/10 flex items-center justify-center text-blue-400 shadow-[0_0_20px_rgba(59,130,246,0.2)]">
                            <Server size={28} />
                        </div>
                        <div>
                            <h3 className="text-2xl font-black text-white tracking-tight">Server Connection</h3>
                            <p className="text-white/60 font-medium mt-1">Manage your SSH credentials and connection status.</p>
                        </div>
                    </div>

                    {lastError && (
                        <div className="bg-red-500/10 border border-red-500/20 text-red-400 p-4 rounded-xl flex items-center gap-3 font-bold">
                            <AlertCircle size={20} />
                            <span>{lastError}</span>
                        </div>
                    )}

                    <form onSubmit={handleConnect} className="flex flex-col gap-8">
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                            <div className="flex flex-col gap-2">
                                <label className="text-xs font-bold uppercase tracking-widest text-white/40 ml-1">Host Address</label>
                                <input className="liquid-input font-mono" value={sshConfig.host} onChange={e => setSshConfig({ ...sshConfig, host: e.target.value })} placeholder="127.0.0.1" />
                            </div>
                            <div className="flex flex-col gap-2">
                                <label className="text-xs font-bold uppercase tracking-widest text-white/40 ml-1">SSH Port</label>
                                <input className="liquid-input font-mono" type="number" value={sshConfig.port} onChange={e => setSshConfig({ ...sshConfig, port: parseInt(e.target.value) })} />
                            </div>
                            <div className="flex flex-col gap-2">
                                <label className="text-xs font-bold uppercase tracking-widest text-white/40 ml-1">SSH Username</label>
                                <input className="liquid-input font-mono" value={sshConfig.username} onChange={e => setSshConfig({ ...sshConfig, username: e.target.value })} placeholder="root" />
                            </div>
                            <div className="flex flex-col gap-2">
                                <label className="text-xs font-bold uppercase tracking-widest text-white/40 ml-1">SSH Password</label>
                                <input className="liquid-input font-mono" type="password" value={sshConfig.password} onChange={e => setSshConfig({ ...sshConfig, password: e.target.value })} />
                            </div>
                        </div>

                        <div className="flex flex-col gap-2">
                            <label className="text-xs font-bold uppercase tracking-widest text-white/40 ml-1">Private Key (Optional)</label>
                            <textarea
                                value={sshConfig.privateKey || ''}
                                onChange={e => setSshConfig({ ...sshConfig, privateKey: e.target.value })}
                                placeholder="-----BEGIN RSA PRIVATE KEY-----..."
                                className="liquid-input font-mono text-xs h-32 resize-none"
                            />
                        </div>

                        {isConnected ? (
                            <button type="button" onClick={handleDisconnect} className="w-full py-4 rounded-xl font-bold bg-gradient-to-r from-red-600 to-orange-600 shadow-lg shadow-red-600/20 text-white hover:scale-[1.01] transition-transform">Disconnect Server</button>
                        ) : (
                            <button type="submit" className={`w-full py-4 rounded-xl font-bold bg-gradient-to-r from-blue-600 to-cyan-500 shadow-lg shadow-blue-600/20 text-white hover:scale-[1.01] transition-transform flex items-center justify-center gap-2 ${isConnecting ? 'opacity-70 cursor-wait' : ''}`} disabled={isConnecting}>
                                {isConnecting ? <><Loader2 className="animate-spin" size={20} /> Connecting...</> : 'Connect SSH'}
                            </button>
                        )}
                    </form>
                </div>

                {/* Theme Section */}
                <div className="liquid-card p-10 flex flex-col gap-8">
                    <div className="flex gap-6 items-center border-b border-white/5 pb-8 justify-between">
                        <div className="flex gap-6 items-center">
                            <div className="w-14 h-14 rounded-2xl bg-purple-500/10 flex items-center justify-center text-purple-400 shadow-[0_0_20px_rgba(168,85,247,0.2)]">
                                <Palette size={28} />
                            </div>
                            <div>
                                <h3 className="text-2xl font-black text-white tracking-tight">Personalization</h3>
                                <p className="text-white/60 font-medium mt-1">Customize your immersive environment.</p>
                            </div>
                        </div>
                    </div>

                    <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                        {themes.map(t => (
                            <motion.button
                                whileHover={{ scale: 1.05 }}
                                whileTap={{ scale: 0.95 }}
                                key={t.id}
                                className={`group relative p-4 rounded-xl border flex flex-col items-center gap-3 transition-all cursor-pointer overflow-hidden ${theme === t.id ? 'bg-white/10 border-blue-400/50 shadow-[0_0_20px_rgba(59,130,246,0.2)]' : 'bg-black/20 border-white/5 hover:bg-white/5'
                                    }`}
                                onClick={() => updateTheme(t.id)}
                            >
                                <div
                                    className={`w-16 h-16 rounded-full shadow-inner ${t.id === 'glass' ? 'bg-gradient-to-br from-blue-900 to-black' :
                                        t.id === 'sakura' ? 'bg-gradient-to-br from-pink-500 to-rose-900' :
                                            t.id === 'gold' ? 'bg-gradient-to-br from-yellow-700 to-yellow-900' :
                                                t.id === 'forest' ? 'bg-gradient-to-br from-green-600 to-green-900' :
                                                    t.id === 'nebula' ? 'bg-gradient-to-br from-purple-600 to-indigo-900' :
                                                        t.id === 'sunset' ? 'bg-gradient-to-br from-orange-500 to-red-900' :
                                                            'bg-gray-900'
                                        }`}
                                />
                                <div className="text-center">
                                    <div className="font-bold text-white text-sm">{t.name}</div>
                                    <div className="text-[10px] text-white/40 uppercase tracking-wider">{t.desc.split(' ')[0]}</div>
                                </div>
                                {theme === t.id && <div className="absolute top-2 right-2 text-blue-400"><Check size={16} /></div>}
                            </motion.button>
                        ))}
                    </div>

                    <div className="pt-8 border-t border-white/5">
                        <label className="flex items-center gap-2 mb-4 font-bold text-white/60 uppercase tracking-widest text-xs"><Box size={16} /> Interface Radius</label>
                        <div className="grid grid-cols-3 gap-2 bg-black/20 p-2 rounded-xl border border-white/5">
                            {['sharp', 'soft', 'round'].map(r => (
                                <button
                                    key={r}
                                    className={`py-3 rounded-lg font-bold text-xs uppercase tracking-widest transition-all ${radius === r
                                        ? 'bg-gradient-to-r from-blue-600 to-cyan-500 text-white shadow-lg'
                                        : 'text-white/40 hover:text-white hover:bg-white/5'
                                        }`}
                                    onClick={() => {
                                        setRadius(r);
                                        localStorage.setItem('theme_radius', r);
                                        document.documentElement.setAttribute('data-radius', r);
                                        showToast(`Radius set to ${r}`, 'info');
                                    }}
                                >
                                    {r}
                                </button>
                            ))}
                        </div>
                    </div>
                </div>

                {/* Engine Config */}
                <div className="liquid-card p-10 flex flex-col gap-8">
                    <div className="flex gap-6 items-center border-b border-white/5 pb-8">
                        <div className="w-14 h-14 rounded-2xl bg-emerald-500/10 flex items-center justify-center text-emerald-400 shadow-[0_0_20px_rgba(16,185,129,0.2)]">
                            <HardDrive size={28} />
                        </div>
                        <div>
                            <h3 className="text-2xl font-black text-white tracking-tight">Server Engine Path</h3>
                            <p className="text-white/60 font-medium mt-1">Technical parameters for the Minecraft process.</p>
                        </div>
                    </div>

                    <form onSubmit={handleConfigSave} className="flex flex-col gap-6">
                        <div className="flex flex-col gap-2">
                            <label className="text-xs font-bold uppercase tracking-widest text-white/40 ml-1">Base Server Directory</label>
                            <input className="liquid-input font-mono" value={mcPath} onChange={e => setMcPath(e.target.value)} placeholder="/home/user/mcserver" />
                            <span className="text-[10px] text-white/30 font-medium ml-1">Absolute path where your server files are located.</span>
                        </div>

                        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                            <div className="flex flex-col gap-2">
                                <label className="text-xs font-bold uppercase tracking-widest text-white/40 ml-1">Screen Instance Name</label>
                                <input className="liquid-input font-mono" value={mcScreen} onChange={e => setMcScreen(e.target.value)} placeholder="minecraft" />
                            </div>
                            <div className="flex flex-col gap-2">
                                <label className="text-xs font-bold uppercase tracking-widest text-white/40 ml-1">Start Command (Optional)</label>
                                <input className="liquid-input font-mono" value={mcStart} onChange={e => setMcStart(e.target.value)} placeholder="java -jar server.jar" />
                            </div>
                        </div>

                        <div className="flex flex-col gap-2">
                            <label className="text-xs font-bold uppercase tracking-widest text-white/40 ml-1">Stop Command</label>
                            <input className="liquid-input font-mono" value={mcStop} onChange={e => setMcStop(e.target.value)} placeholder="stop" />
                        </div>

                        {saveStatus && (
                            <div className="bg-green-500/10 border border-green-500/20 text-green-400 p-3 rounded-xl flex items-center gap-3 font-bold text-sm animate-pulse">
                                <Check size={16} />
                                <span>{saveStatus}</span>
                            </div>
                        )}

                        <button type="submit" className="w-full py-4 rounded-xl font-bold border border-emerald-500/30 text-emerald-400 hover:bg-emerald-500/10 transition-colors uppercase tracking-widest text-xs">
                            Update Engine Configuration
                        </button>
                    </form>
                </div>
            </div>
        </div>
    );
};

export default Settings;
