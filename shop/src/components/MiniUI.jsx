import React, { useState, useEffect } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import {
    Activity, Folder, Users, Settings as SettingsIcon,
    Terminal, Package, Sliders, ShieldCheck,
    Play, Square, RefreshCcw, Search, Plus
} from 'lucide-react'

// Reusable Liquid Sidebar Mockup
export const MiniSidebar = ({ activeTab = 'dashboard' }) => {
    const tabs = [
        { id: 'dashboard', label: 'Dashboard', icon: Activity },
        { id: 'players', label: 'Players', icon: Users },
        { id: 'files', label: 'Filesystem', icon: Folder },
        { id: 'plugins', label: 'Plugins', icon: Package },
        { id: 'properties', label: 'Server Properties', icon: Sliders },
        { id: 'settings', label: 'Settings', icon: SettingsIcon },
    ]

    return (
        <div className="w-[120px] h-full flex flex-col p-3 border-r border-white/5 bg-white/[0.02]">
            <div className="flex items-center gap-2 mb-6 px-1">
                <div className="w-6 h-6 bg-gradient-to-br from-blue-400 to-indigo-600 rounded-md flex items-center justify-center shadow-lg shadow-blue-500/20">
                    <Terminal size={12} className="text-white" />
                </div>
                <span className="text-[10px] font-black tracking-tighter">SMM</span>
            </div>
            <div className="flex flex-col gap-1">
                {tabs.map((tab) => (
                    <div
                        key={tab.id}
                        className={`flex items-center gap-2 px-2 py-2 rounded-lg transition-all ${activeTab === tab.id ? 'bg-white/10 text-white' : 'text-white/30'
                            }`}
                    >
                        <tab.icon size={12} />
                        <span className="text-[8px] font-bold hidden lg:block">{tab.label}</span>
                    </div>
                ))}
            </div>
        </div>
    )
}

// 1. Detailed Terminal / Console
export const HighFiConsole = () => (
    <div className="w-full h-full flex flex-col bg-black/60 font-mono text-[9px] overflow-hidden">
        <div className="p-2 border-b border-white/5 flex justify-between items-center bg-white/[0.02]">
            <div className="flex gap-2">
                <div className="w-2 h-2 rounded-full bg-red-500/50" />
                <div className="w-2 h-2 rounded-full bg-yellow-500/50" />
                <div className="w-2 h-2 rounded-full bg-green-500/50" />
            </div>
            <span className="text-[7px] text-white/20">SESSION: ROOT@NODE-UX-01</span>
        </div>
        <div className="p-3 flex-1 flex flex-col gap-1 opacity-70">
            <div className="text-white/40">[18:24:01] [Server thread/INFO]: Starting minecraft server version 1.21.1</div>
            <div className="text-white/40">[18:24:03] [Server thread/INFO]: Loading properties</div>
            <div className="text-white/40">[18:24:03] [Server thread/INFO]: Default game type: SURVIVAL</div>
            <div className="text-blue-400/60">[SMM] Bridge established via Secure Tunnel</div>
            <div className="text-green-400/60">[SMM] Optimization Layer: ACTIVE (v3.0.5)</div>
            <div className="text-yellow-400/60">[Server thread/WARN]: Can't keep up! Is the server overloaded?</div>
            <div className="text-white/60 mt-1 flex items-center gap-1">
                <span className="text-blue-400 font-bold tracking-tighter">➜ ~</span>
                <motion.span
                    animate={{ opacity: [1, 0] }}
                    transition={{ duration: 0.8, repeat: Infinity }}
                    className="w-1.5 h-3 bg-white/40"
                />
            </div>
        </div>
    </div>
)

// 2. Detailed Dashboard / Resource Hub
export const HighFiDashboard = () => {
    const [cpu, setCpu] = useState(42)

    useEffect(() => {
        const interval = setInterval(() => {
            setCpu(prev => Math.max(10, Math.min(90, prev + (Math.random() - 0.5) * 10)))
        }, 2000)
        return () => clearInterval(interval)
    }, [])

    return (
        <div className="w-full h-full p-4 grid grid-cols-2 gap-3 overflow-hidden">
            <div className="col-span-2 flex justify-between items-center mb-1">
                <h4 className="text-[10px] font-black uppercase tracking-widest text-white/60">Real-Time Metrics</h4>
                <div className="flex gap-2">
                    <Play className="w-3 h-3 text-green-500" />
                    <RefreshCcw className="w-3 h-3 text-blue-500" />
                </div>
            </div>

            {/* Metrics Grid */}
            {[
                { label: 'CPU Usage', val: `${Math.round(cpu)}%`, color: 'from-blue-500/50', current: cpu },
                { label: 'RAM Alloc', val: '4.2 / 8GB', color: 'from-purple-500/50', current: 52 },
                { label: 'Server TPS', val: '20.0', color: 'from-green-500/50', current: 100 },
                { label: 'Players', val: '14 / 50', color: 'from-orange-500/50', current: 28 },
            ].map((m, i) => (
                <div key={i} className="mini-card p-3 flex flex-col gap-2">
                    <span className="text-[7px] font-bold text-white/30 uppercase tracking-widest">{m.label}</span>
                    <span className="text-xs font-black">{m.val}</span>
                    <div className="h-1 bg-white/5 rounded-full overflow-hidden">
                        <motion.div
                            animate={{ width: `${m.label === 'CPU Usage' ? cpu : m.current}%` }}
                            className={`h-full bg-gradient-to-r ${m.color} to-transparent`}
                        />
                    </div>
                </div>
            ))}

            {/* Mini Graph */}
            <div className="col-span-2 mini-card p-2 h-12 flex items-end gap-1">
                {[...Array(12)].map((_, i) => (
                    <motion.div
                        key={i}
                        animate={{ height: `${20 + Math.random() * 80}%` }}
                        transition={{ duration: 2, repeat: Infinity, repeatType: 'reverse', delay: i * 0.1 }}
                        className="flex-1 bg-white/10 rounded-t-[1px]"
                    />
                ))}
            </div>
        </div>
    )
}

// 3. Player Manager Replicated
export const HighFiPlayers = () => (
    <div className="w-full h-full p-4 flex flex-col gap-3">
        <div className="flex justify-between items-center mb-1">
            <div className="relative flex-1 max-w-[120px]">
                <Search className="absolute left-2 top-1/2 -translate-y-1/2 w-2.5 h-2.5 text-white/20" />
                <div className="w-full bg-black/40 border border-white/5 rounded-lg py-1 pl-6 text-[8px] text-white/40">Search players...</div>
            </div>
            <div className="flex items-center gap-2 text-[9px] font-black text-green-400">
                <span className="w-1.5 h-1.5 rounded-full bg-green-400 animate-pulse" />
                <span>14 ONLINE</span>
            </div>
        </div>

        <div className="flex flex-col gap-2">
            {[
                { name: 'LeandroX', op: true, ping: '24ms' },
                { name: 'Notch', op: false, ping: '48ms' },
                { name: 'Admin_User', op: true, ping: '12ms' },
                { name: 'Player_42', op: false, ping: '110ms' },
            ].map((p, i) => (
                <div key={i} className="mini-card p-2 flex items-center justify-between group">
                    <div className="flex items-center gap-3">
                        <div className="w-6 h-6 rounded-md bg-white/5 border border-white/10 flex items-center justify-center text-[8px] font-black">
                            {p.name[0]}
                        </div>
                        <div className="flex flex-col">
                            <span className="text-[9px] font-bold">{p.name}</span>
                            <span className="text-[7px] text-white/30 uppercase font-black tracking-widest">{p.ping}</span>
                        </div>
                    </div>
                    <div className="flex gap-2">
                        <div className={`px-2 py-0.5 rounded-full text-[6px] font-black uppercase ${p.op ? 'bg-blue-500/20 text-blue-400' : 'bg-white/5 text-white/30'}`}>
                            {p.op ? 'OP' : 'Member'}
                        </div>
                        <div className="w-4 h-4 rounded-md bg-white/5 flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity cursor-pointer border border-white/10">
                            <Plus className="w-2.5 h-2.5 text-white/40" />
                        </div>
                    </div>
                </div>
            ))}
        </div>
    </div>
)

// 4. Plugin Store Replicated
export const HighFiPlugins = () => (
    <div className="w-full h-full p-4 flex flex-col gap-3">
        <div className="grid grid-cols-2 gap-3">
            {[
                { name: 'EssentialsX', desc: 'Core server commands', downloads: '2.4M', icon: '⚡' },
                { name: 'LuckPerms', desc: 'Permission system', downloads: '1.8M', icon: '🔑' },
                { name: 'WorldEdit', desc: 'Map manipulation', downloads: '3.1M', icon: '🌍' },
                { name: 'Vault', desc: 'Economy bridge', downloads: '4.2M', icon: '💰' },
            ].map((plug, i) => (
                <div key={i} className="mini-card p-3 flex flex-col gap-1.5 border-white/10 hover:border-blue-500/40 transition-colors">
                    <div className="flex justify-between items-start">
                        <span className="text-xs">{plug.icon}</span>
                        <span className="text-[7px] text-white/30 font-black uppercase tracking-widest">{plug.downloads}</span>
                    </div>
                    <span className="text-[9px] font-bold">{plug.name}</span>
                    <span className="text-[7px] text-white/20 leading-tight mb-2">{plug.desc}</span>
                    <button className="w-full bg-blue-500/20 text-blue-400 text-[8px] font-black py-1 rounded-md border border-blue-500/20 hover:bg-blue-500 hover:text-white transition-all">
                        INSTALL
                    </button>
                </div>
            ))}
        </div>
    </div>
)

// 5. Filesystem Manager Replicated
export const HighFiFiles = () => (
    <div className="w-full h-full p-4 flex flex-col gap-2">
        <div className="flex items-center gap-3 mb-2 px-1">
            <div className="flex items-center gap-1 text-[8px] font-bold text-white/30 uppercase tracking-widest">
                <span>ROOT</span>
                <span>/</span>
                <span className="text-blue-400">SERVER</span>
                <span>/</span>
                <span>PLUGINS</span>
            </div>
        </div>
        <div className="flex flex-col gap-1">
            {[
                { name: 'world', type: 'folder', size: '2.4 GB' },
                { name: 'plugins', type: 'folder', size: '148 MB' },
                { name: 'server.properties', type: 'file', size: '4.2 KB' },
                { name: 'spigot.yml', type: 'file', size: '12.8 KB' },
                { name: 'logs', type: 'folder', size: '512 MB' },
            ].map((f, i) => (
                <div key={i} className="mini-card px-3 py-2 flex items-center justify-between group cursor-pointer hover:bg-white/5">
                    <div className="flex items-center gap-3">
                        {f.type === 'folder' ? <Folder size={10} className="text-yellow-500/60" /> : <Package size={10} className="text-blue-500/60" />}
                        <span className="text-[9px] font-medium">{f.name}</span>
                    </div>
                    <div className="flex items-center gap-4">
                        <span className="text-[7px] text-white/20 font-bold uppercase">{f.size}</span>
                        <div className="flex gap-2">
                            <div className="w-3 h-3 rounded bg-white/5 flex items-center justify-center"><Sliders size={6} /></div>
                            <div className="w-3 h-3 rounded bg-red-500/10 flex items-center justify-center"><Square size={6} className="text-red-500" /></div>
                        </div>
                    </div>
                </div>
            ))}
        </div>
    </div>
)

// 6. Server Properties Editor Replicated
export const HighFiProperties = () => (
    <div className="w-full h-full p-6 flex flex-col gap-6">
        <div className="flex justify-between items-center opacity-50">
            <h5 className="text-[10px] font-black uppercase tracking-[0.2em]">Live Property Config</h5>
            <span className="text-[8px] bg-blue-500/20 text-blue-400 px-2 py-0.5 rounded-full font-black">24 KEYS ACTIVE</span>
        </div>
        <div className="grid gap-4">
            {[
                { key: 'motd', val: 'Elite Minecraft Network', type: 'text' },
                { key: 'max-players', val: '50', type: 'number' },
                { key: 'difficulty', val: 'hard', type: 'select' },
                { key: 'pvp', val: 'true', type: 'toggle' },
            ].map((prop, i) => (
                <div key={i} className="flex flex-col gap-2">
                    <label className="text-[8px] font-black uppercase text-white/20 tracking-widest">{prop.key.replace('-', ' ')}</label>
                    <div className="liquid-input py-2 text-[10px] bg-black/40 border-white/5 flex items-center justify-between">
                        <span>{prop.val}</span>
                        {prop.type === 'toggle' && <div className="w-6 h-3 bg-blue-500/40 rounded-full flex items-center justify-end px-0.5"><div className="w-2 h-2 bg-white rounded-full" /></div>}
                    </div>
                </div>
            ))}
        </div>
    </div>
)

// Full Dashboard Shell Mockup (Combines Sidebar + Content)
export const FullToolPreview = ({ children, activeTab = 'dashboard' }) => (
    <div className="w-full h-full bg-[#050505] flex overflow-hidden rounded-2xl border border-white/10 shadow-2xl">
        <MiniSidebar activeTab={activeTab} />
        <div className="flex-1 flex flex-col bg-white/[0.01]">
            <div className="h-10 border-b border-white/5 flex items-center justify-between px-4 bg-white/[0.02]">
                <div className="flex items-center gap-2">
                    <div className="w-1.5 h-1.5 rounded-full bg-green-500" />
                    <span className="text-[8px] font-bold text-white/40 uppercase tracking-widest">Server Online: 1.21.1</span>
                </div>
                <div className="flex items-center gap-3">
                    <div className="p-1 h-6 w-12 bg-white/5 rounded-full border border-white/10 flex items-center justify-end px-1">
                        <div className="w-4 h-4 rounded-full bg-cyan-400 shadow-lg shadow-cyan-400/50" />
                    </div>
                    <SettingsIcon className="w-3 h-3 text-white/20" />
                </div>
            </div>
            <div className="flex-1 overflow-hidden">
                {children}
            </div>
        </div>
    </div>
)
