import React, { useState, useEffect, useRef } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import {
    Activity, Folder, Users, Settings as SettingsIcon,
    Terminal, Package, Sliders, ShieldCheck,
    Play, Square, RefreshCcw, Search, Plus,
    Code, Save, CheckCircle, ChevronRight,
    Monitor, Cpu, HardDrive, Layout,
    Palette, Radius, Wallpaper, ToggleLeft, ToggleRight,
    Store, ExternalLink, Zap, ArrowRight, Sparkles, Trash2
} from 'lucide-react'
import GlowCard from './GlowCard'

// --- 1:1 REPLICATED THEMES ---
const themes = {
    glass: { name: 'Glass', primary: '#2997ff', bg: 'rgba(255, 255, 255, 0.06)', blob1: 'rgba(37, 99, 235, 0.2)', blob2: 'rgba(147, 51, 234, 0.1)' },
    coder: { name: 'Coder', primary: '#00ff41', bg: 'rgba(0, 20, 0, 0.9)', blob1: 'rgba(0, 255, 65, 0.1)', blob2: 'rgba(0, 100, 0, 0.05)' },
    obsidian: { name: 'Obsidian', primary: '#ffffff', bg: '#0a0a0a', blob1: 'rgba(255, 255, 255, 0.03)', blob2: 'rgba(100, 100, 100, 0.02)' },
    gold: { name: 'Gold', primary: '#fbbf24', bg: 'rgba(251, 191, 36, 0.05)', blob1: 'rgba(251, 191, 36, 0.15)', blob2: 'rgba(217, 119, 6, 0.1)' },
    forest: { name: 'Forest', primary: '#4ade80', bg: 'rgba(20, 50, 20, 0.3)', blob1: 'rgba(34, 197, 94, 0.15)', blob2: 'rgba(21, 128, 61, 0.1)' },
    nebula: { name: 'Nebula', primary: '#d8b4fe', bg: 'rgba(40, 0, 60, 0.3)', blob1: 'rgba(147, 51, 234, 0.15)', blob2: 'rgba(79, 70, 229, 0.15)' },
    sunset: { name: 'Sunset', primary: '#fb923c', bg: 'rgba(60, 10, 10, 0.3)', blob1: 'rgba(249, 115, 22, 0.15)', blob2: 'rgba(220, 38, 38, 0.1)' },
    sakura: { name: 'Sakura', primary: '#f472b6', bg: 'rgba(60, 10, 30, 0.3)', blob1: 'rgba(244, 114, 182, 0.15)', blob2: 'rgba(219, 39, 119, 0.1)' },
}

// --- SUB-COMPONENTS ---

const ModernToggle = ({ active, onClick, color }) => (
    <div
        onClick={onClick}
        className={`w-10 h-5 rounded-full cursor-pointer transition-all duration-300 relative flex items-center px-1 border border-white/10 ${active ? 'bg-white/10' : 'bg-black/40'}`}
    >
        <motion.div
            animate={{ x: active ? 18 : 0 }}
            className="w-3 h-3 rounded-full shadow-[0_0_10px_rgba(255,255,255,0.2)]"
            style={{ backgroundColor: active ? color : 'rgba(255,255,255,0.2)' }}
        />
    </div>
)

const InteractiveFilesystem = () => {
    const [path, setPath] = useState(['root'])
    const files = {
        'root': [
            { name: 'world', type: 'dir' },
            { name: 'plugins', type: 'dir' },
            { name: 'server.properties', type: 'file' },
            { name: 'logs', type: 'dir' }
        ],
        'world': [
            { name: 'region', type: 'dir' },
            { name: 'level.dat', type: 'file' },
            { name: 'level.dat_old', type: 'file' }
        ],
        'plugins': [
            { name: 'Essentials', type: 'dir' },
            { name: 'LuckPerms.jar', type: 'file' },
            { name: 'WorldEdit.jar', type: 'file' }
        ]
    }
    const currentFiles = files[path[path.length - 1]] || []
    return (
        <div className="flex flex-col h-full overflow-hidden">
            <div className="flex items-center gap-2 mb-6 text-[10px] font-black tracking-widest text-white/20 uppercase">
                {path.map((p, i) => (
                    <React.Fragment key={i}>
                        <span className="hover:text-white cursor-pointer transition-colors" onClick={() => setPath(path.slice(0, i + 1))}>{p}</span>
                        {i < path.length - 1 && <ChevronRight size={10} />}
                    </React.Fragment>
                ))}
            </div>
            <div className="grid gap-2 overflow-auto pr-2">
                {currentFiles.map((file) => (
                    <motion.div initial={{ opacity: 0, x: -10 }} animate={{ opacity: 1, x: 0 }} key={file.name} onClick={() => file.type === 'dir' && setPath([...path, file.name])} className="mini-card p-4 flex items-center justify-between cursor-pointer group">
                        <div className="flex items-center gap-4">
                            {file.type === 'dir' ? <Folder size={16} className="text-yellow-500/50" /> : <Code size={16} className="text-blue-500/50" />}
                            <span className="text-sm font-tech">{file.name}</span>
                        </div>
                        <div className="flex items-center gap-4 text-[10px] font-black text-white/10 uppercase">
                            <span>{file.type === 'dir' ? '--' : '4.2 KB'}</span>
                            <div className="w-10 h-6 bg-white/5 rounded border border-white/5 flex items-center justify-center group-hover:bg-white/10 transition-colors opacity-0 group-hover:opacity-100"><Plus size={12} /></div>
                        </div>
                    </motion.div>
                ))}
            </div>
        </div>
    )
}

const ThemeEditor = ({ currentTheme, setTheme }) => (
    <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        {Object.entries(themes).map(([key, t]) => (
            <motion.div whileHover={{ scale: 1.05 }} whileTap={{ scale: 0.95 }} key={key} onClick={() => setTheme(key)} className={`p-6 rounded-2xl border cursor-pointer transition-all ${currentTheme === key ? 'bg-white/10 border-white/30 shadow-2xl scale-105' : 'bg-white/[0.02] border-white/5 hover:bg-white/5'}`} style={{ borderBottom: currentTheme === key ? `3px solid ${t.primary}` : '1px solid rgba(255,255,255,0.05)' }}>
                <div className="w-10 h-10 rounded-lg mb-4 flex items-center justify-center" style={{ backgroundColor: `${t.primary}20` }}><Palette size={20} style={{ color: t.primary }} /></div>
                <div className="text-[10px] font-black uppercase tracking-[0.2em]">{t.name}</div>
            </motion.div>
        ))}
    </div>
)

const PluginMall = ({ primaryColor }) => {
    const [view, setView] = useState('marketplace')
    const marketplacePlugins = [
        { name: 'EssentialsX', desc: 'The backbone of every modern Bukkit/Spigot server, providing hundreds of essential commands.', icon: '⚡', downloads: '2.4M', id: 9089 },
        { name: 'LuckPerms', desc: 'An advanced permissions plugin with a web interface, designed for high performance.', icon: '🔑', downloads: '1.8M', id: 28140 },
        { name: 'WorldEdit', desc: 'A pixel-perfect map manipulation tool with powerful brush engines.', icon: '🌍', downloads: '3.1M', id: 191 },
        { name: 'CoreProtect', desc: 'Fast block logging and rollbacks for grief prevention.', icon: '🛡️', downloads: '1.2M', id: 8631 },
    ]

    const installedPlugins = [
        { name: 'Vault', desc: 'Permissions, Chat, and Economy API for hundreds of plugins.', icon: '📦' },
        { name: 'PlaceholderAPI', desc: 'Universal placeholder system for all display-related plugins.', icon: '🧩' },
    ]

    return (
        <div className="flex flex-col gap-8 h-full">
            <div className="flex items-center gap-4 bg-black/40 p-1 rounded-xl border border-white/5 w-fit">
                <button onClick={() => setView('marketplace')} className={`px-5 py-2 rounded-lg text-[10px] font-black uppercase tracking-widest flex items-center gap-2 transition-all ${view === 'marketplace' ? 'bg-white/10 text-white shadow-lg' : 'text-white/30 hover:text-white/60'}`}>
                    <Store size={14} /> Marketplace
                </button>
                <button onClick={() => setView('installed')} className={`px-5 py-2 rounded-lg text-[10px] font-black uppercase tracking-widest flex items-center gap-2 transition-all ${view === 'installed' ? 'bg-white/10 text-white shadow-lg' : 'text-white/30 hover:text-white/60'}`}>
                    <Cpu size={14} /> Installed
                </button>
            </div>

            <AnimatePresence mode="wait">
                {view === 'marketplace' ? (
                    <motion.div key="market" initial={{ opacity: 0, x: -20 }} animate={{ opacity: 1, x: 0 }} exit={{ opacity: 0, x: 20 }} className="grid grid-cols-1 md:grid-cols-2 gap-6">
                        {marketplacePlugins.map((plug, i) => (
                            <div key={plug.name} className="mini-card p-6 flex flex-col gap-6 border-white/5 group relative overflow-hidden">
                                <div className="absolute top-0 right-0 p-4 opacity-10 group-hover:opacity-100 transition-opacity">
                                    <ExternalLink size={20} className="text-white cursor-pointer" />
                                </div>
                                <div className="flex gap-6">
                                    <div className="w-20 h-20 bg-white/5 rounded-2xl flex items-center justify-center text-3xl group-hover:scale-110 transition-transform shadow-inner shrink-0">{plug.icon}</div>
                                    <div className="flex flex-col gap-2">
                                        <div className="flex items-center gap-3">
                                            <h4 className="text-xl font-black italic tracking-tighter" style={{ color: primaryColor }}>{plug.name}</h4>
                                            <span className="text-[8px] font-black bg-white/5 px-2 py-0.5 rounded text-white/40 tracking-widest uppercase">Official</span>
                                        </div>
                                        <p className="text-[10px] text-white/30 font-medium leading-relaxed line-clamp-2">{plug.desc}</p>
                                        <div className="flex items-center gap-4 mt-1">
                                            <span className="text-[9px] font-black text-white/10 flex items-center gap-1"><Zap size={10} /> {plug.downloads} DL</span>
                                            <button className="text-[9px] font-black text-[var(--accent-primary)] hover:underline flex items-center gap-1" style={{ color: primaryColor }}>
                                                View Source <ExternalLink size={10} />
                                            </button>
                                        </div>
                                    </div>
                                </div>
                                <button
                                    className="w-full py-4 text-[10px] font-black uppercase tracking-[0.2em] rounded-xl border transition-all active:scale-95 flex items-center justify-center gap-2"
                                    style={{
                                        backgroundColor: `${primaryColor}10`,
                                        borderColor: `${primaryColor}20`,
                                        color: primaryColor,
                                    }}
                                    onMouseEnter={(e) => { e.target.style.backgroundColor = primaryColor; e.target.style.color = '#000'; }}
                                    onMouseLeave={(e) => { e.target.style.backgroundColor = `${primaryColor}10`; e.target.style.color = primaryColor; }}
                                >
                                    DEPLOY EXTENSION <ArrowRight size={14} />
                                </button>
                            </div>
                        ))}
                    </motion.div>
                ) : (
                    <motion.div key="local" initial={{ opacity: 0, scale: 0.95 }} animate={{ opacity: 1, scale: 1 }} exit={{ opacity: 0, scale: 0.95 }} className="grid grid-cols-1 gap-4">
                        {installedPlugins.map((plug) => (
                            <div key={plug.name} className="mini-card p-5 flex items-center justify-between group border-white/5">
                                <div className="flex items-center gap-5">
                                    <div className="w-14 h-14 bg-white/5 rounded-xl flex items-center justify-center text-2xl group-hover:scale-110 transition-all border border-white/5">
                                        <Sparkles size={24} style={{ color: primaryColor }} className="opacity-40" />
                                    </div>
                                    <div>
                                        <h4 className="text-base font-black italic tracking-tight text-white/80">{plug.name}</h4>
                                        <p className="text-[10px] text-white/20 font-medium">{plug.desc}</p>
                                    </div>
                                </div>
                                <div className="flex items-center gap-4">
                                    <div className="px-3 py-1 rounded-full bg-green-500/10 text-green-400 text-[8px] font-black uppercase tracking-widest border border-green-500/20">Active</div>
                                    <button className="p-3 rounded-lg bg-red-500/10 text-red-500 opacity-0 group-hover:opacity-100 transition-all hover:bg-red-500/20">
                                        <Trash2 size={16} />
                                    </button>
                                </div>
                            </div>
                        ))}
                    </motion.div>
                )}
            </AnimatePresence>
        </div>
    )
}

const LiveDemo = () => {
    const [activeTab, setActiveTab] = useState('dashboard')
    const [theme, setTheme] = useState('glass')
    const [cpu, setCpu] = useState(38)
    const [settings, setSettings] = useState({ whitelist: true, pvp: true, commandBlocks: false, hardcore: false })

    useEffect(() => {
        const interval = setInterval(() => {
            setCpu(prev => Math.max(10, Math.min(90, prev + (Math.random() - 0.5) * 15)))
        }, 2000)
        return () => clearInterval(interval)
    }, [])

    const tabs = [
        { id: 'dashboard', label: 'Overview', icon: Activity },
        { id: 'files', label: 'File Manager', icon: Folder },
        { id: 'plugins', label: 'Plugin Mall', icon: Package },
        { id: 'properties', label: 'Config', icon: Sliders },
        { id: 'settings', label: 'Themes', icon: SettingsIcon },
    ]

    const activeThemeData = themes[theme] || themes.glass

    return (
        <section id="demo" className="py-32 px-6 relative overflow-hidden bg-[#020202]">
            <div className="absolute inset-0 z-0 pointer-events-none opacity-30">
                <motion.div animate={{ x: [0, 50, 0], y: [0, 20, 0] }} transition={{ duration: 10, repeat: Infinity }} className="absolute top-1/4 left-1/4 w-[400px] h-[400px] rounded-full mix-blend-screen" style={{ backgroundColor: activeThemeData.blob1, filter: 'blur(100px)' }} />
                <motion.div animate={{ x: [0, -50, 0], y: [0, -20, 0] }} transition={{ duration: 12, repeat: Infinity, delay: 2 }} className="absolute bottom-1/4 right-1/4 w-[400px] h-[400px] rounded-full mix-blend-screen" style={{ backgroundColor: activeThemeData.blob2, filter: 'blur(100px)' }} />
            </div>

            <div className="container mx-auto max-w-7xl relative z-10">
                <div className="text-center mb-20 flex flex-col items-center">
                    <span className="px-4 py-1 text-[10px] font-black uppercase tracking-[0.4em] bg-white/5 border border-white/10 rounded-full text-white/30 mb-8">Engineering Lab</span>
                    <h2 className="text-4xl md:text-7xl font-black tracking-tighter italic mb-10 leading-none">The <span className="text-gradient-premium" style={{ '--gradient-start': activeThemeData.primary }}>Industrial</span> Canvas.</h2>
                </div>

                <motion.div
                    initial={{ opacity: 0, scale: 0.95 }}
                    whileInView={{ opacity: 1, scale: 1 }}
                    className="liquid-card h-[750px] shadow-[0_100px_200px_-50px_rgba(0,0,0,0.8)] flex border-white/5 overflow-hidden"
                    style={{ backgroundColor: activeThemeData.bg, transition: 'all 0.8s ease' }}
                >
                    <aside className="w-[80px] md:w-[260px] border-r border-white/5 p-8 flex flex-col bg-black/20 backdrop-blur-3xl">
                        <div className="flex items-center gap-4 mb-14 px-2">
                            <div className="relative w-12 h-12 flex items-center justify-center">
                                <div className="absolute inset-0 bg-blue-500/20 blur-xl rounded-full" />
                                <div className="relative z-10 w-full h-full bg-gradient-to-br from-blue-400 to-indigo-600 rounded-xl flex items-center justify-center shadow-lg shadow-blue-500/20"><Terminal size={20} className="text-white" /></div>
                            </div>
                            <div className="hidden md:block text-left">
                                <h1 className="text-lg font-black italic tracking-tighter leading-none">SMM.PRO</h1>
                                <span className="text-[10px] font-black uppercase text-green-400 tracking-widest">v3.0.5</span>
                            </div>
                        </div>

                        <nav className="flex-1 flex flex-col gap-2">
                            {tabs.map(tab => (
                                <motion.div whileHover={{ x: 5 }} key={tab.id} onClick={() => setActiveTab(tab.id)} className={`flex items-center gap-4 px-4 py-4 rounded-xl cursor-pointer transition-all duration-300 ${activeTab === tab.id ? 'bg-white/10 text-white shadow-[inset_0_1px_0_rgba(255,255,255,0.1)]' : 'text-white/20 hover:text-white hover:bg-white/5'}`}>
                                    <tab.icon size={20} className={activeTab === tab.id ? '' : 'opacity-40'} style={{ color: activeTab === tab.id ? activeThemeData.primary : '' }} />
                                    <span className="text-sm font-tech hidden md:block">{tab.label}</span>
                                </motion.div>
                            ))}
                        </nav>
                    </aside>

                    <div className="flex-1 flex flex-col overflow-hidden">
                        <header className="h-16 border-b border-white/5 flex items-center justify-between px-8 bg-black/20 backdrop-blur-md">
                            <div className="flex items-center gap-6">
                                <div className="flex items-center gap-3 text-[10px] font-black text-white/30 uppercase tracking-[0.2em]">
                                    <div className="w-2 h-2 rounded-full bg-green-500 animate-pulse" /> Node Established
                                </div>
                            </div>
                            <div className="flex gap-2">
                                <button className="p-2 hover:bg-white/5 rounded-lg text-white/40"><RefreshCcw size={16} /></button>
                            </div>
                        </header>

                        <div className="flex-1 overflow-auto p-10">
                            <AnimatePresence mode="wait">
                                {activeTab === 'dashboard' && (
                                    <motion.div initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: -10 }} key="dash" className="grid grid-cols-1 md:grid-cols-3 gap-6">
                                        <div className="mini-card p-6 md:col-span-2">
                                            <h4 className="text-[10px] font-black uppercase tracking-widest text-white/20 mb-10 flex justify-between">Performance Metrics <Activity size={14} /></h4>
                                            <div className="h-40 flex items-end gap-2 px-2">
                                                {[...Array(24)].map((_, i) => (
                                                    <motion.div key={i} animate={{ height: `${20 + Math.random() * 80}%` }} transition={{ duration: 1.5, repeat: Infinity, repeatType: "reverse", delay: i * 0.05 }} className="flex-1 rounded-t-[2px]" style={{ backgroundColor: `${activeThemeData.primary}30` }} />
                                                ))}
                                            </div>
                                        </div>
                                        <div className="mini-card p-6 flex flex-col items-center justify-center text-center">
                                            <h4 className="text-[10px] font-black uppercase tracking-widest text-white/20 mb-6">World Health</h4>
                                            <div className="text-6xl font-black italic tracking-tighter" style={{ color: activeThemeData.primary }}>20.0</div>
                                            <span className="text-[8px] font-black uppercase text-white/10 tracking-[0.4em] mt-2">Ticks Per Second</span>
                                        </div>
                                    </motion.div>
                                )}
                                {activeTab === 'files' && (
                                    <motion.div initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} key="files" className="h-full"><InteractiveFilesystem /></motion.div>
                                )}
                                {activeTab === 'plugins' && (
                                    <motion.div initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} key="plugins" className="h-full">
                                        <PluginMall primaryColor={activeThemeData.primary} />
                                    </motion.div>
                                )}
                                {activeTab === 'settings' && (
                                    <motion.div initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} key="settings" className="space-y-12">
                                        <div className="flex flex-col gap-2"><h3 className="text-2xl font-black italic tracking-tighter">Theme Laboratory.</h3></div>
                                        <ThemeEditor currentTheme={theme} setTheme={setTheme} />
                                    </motion.div>
                                )}
                                {activeTab === 'properties' && (
                                    <motion.div initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} key="prop" className="flex flex-col h-full gap-8">
                                        {/* EDITOR WITH LIQUID GLASS BACKGROUND */}
                                        <div className="flex-1 flex flex-col mini-card overflow-hidden bg-white/[0.02] backdrop-blur-2xl border-white/10">
                                            <div className="h-10 bg-white/5 flex items-center justify-between px-6 border-b border-white/5">
                                                <span className="text-[10px] font-black uppercase text-white/30 tracking-widest">Logic Layer: server.properties</span>
                                                <Save size={14} className="text-blue-500 cursor-pointer" />
                                            </div>
                                            <div className="flex-1 p-8 font-mono text-[11px] leading-relaxed text-white/40 text-left">
                                                <div className="text-green-500/40"># SMM NATIVE OPTIMIZED</div>
                                                <div>spawn-protection=16</div>
                                                <div className="text-blue-400">difficulty=hard</div>
                                                <div>max-players=50</div>
                                                <div className="text-pink-400">motd=\u00A7bIndustrial Nexus</div>
                                                <span className="animate-pulse w-1.5 h-4 bg-white/20 inline-block ml-1 align-middle" />
                                            </div>
                                        </div>

                                        {/* ADVANCED SETTINGS TOGGLES */}
                                        <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                                            {[
                                                { id: 'whitelist', label: 'Whitelist', icon: <Users size={14} /> },
                                                { id: 'pvp', label: 'PVP Mode', icon: <Zap size={14} /> },
                                                { id: 'hardcore', label: 'Hardcore', icon: <Activity size={14} /> },
                                                { id: 'commandBlocks', label: 'Cmd Blocks', icon: <Terminal size={14} /> },
                                            ].map(s => (
                                                <div key={s.id} className="mini-card p-4 flex flex-col gap-4">
                                                    <div className="flex items-center justify-between">
                                                        <div className="text-[9px] font-black uppercase tracking-widest text-white/30 flex items-center gap-2">
                                                            {s.icon} {s.label}
                                                        </div>
                                                        <ModernToggle
                                                            active={settings[s.id]}
                                                            onClick={() => setSettings(prev => ({ ...prev, [s.id]: !prev[s.id] }))}
                                                            color={activeThemeData.primary}
                                                        />
                                                    </div>
                                                </div>
                                            ))}
                                        </div>
                                    </motion.div>
                                )}
                            </AnimatePresence>
                        </div>
                    </div>
                </motion.div>
            </div>
        </section>
    )
}

export default LiveDemo
