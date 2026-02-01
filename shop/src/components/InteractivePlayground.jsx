import React, { useState, useEffect } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import {
    Activity, Folder, Users, Settings as SettingsIcon,
    Terminal, Package, Sliders, ShieldCheck,
    Play, Square, RefreshCcw, Search, Plus,
    Monitor, Cpu, HardDrive, Smartphone
} from 'lucide-react'
import {
    HighFiConsole, HighFiDashboard, HighFiPlayers,
    HighFiPlugins, HighFiFiles, HighFiProperties
} from './MiniUI'

const TabIcon = ({ icon: Icon, active, label }) => (
    <motion.div
        whileHover={{ x: 5 }}
        className={`flex items-center gap-4 px-4 py-3 rounded-xl cursor-pointer transition-all duration-300 ${active
                ? 'bg-white/10 text-white shadow-[inset_0_1px_0_rgba(255,255,255,0.1)] backdrop-blur-md'
                : 'text-white/30 hover:text-white hover:bg-white/5'
            }`}
    >
        <Icon size={18} className={active ? 'text-blue-400' : ''} />
        <span className="text-sm font-bold tracking-wide hidden md:block">{label}</span>
        {active && (
            <motion.div
                layoutId="activeTabGlow"
                className="absolute inset-0 rounded-xl bg-gradient-to-r from-blue-500/10 to-transparent pointer-events-none"
            />
        )}
    </motion.div>
)

const InteractivePlayground = () => {
    const [activeTab, setActiveTab] = useState('dashboard')
    const [theme, setTheme] = useState('glass')

    const tabs = [
        { id: 'dashboard', label: 'Dashboard', icon: Activity },
        { id: 'players', label: 'Players', icon: Users },
        { id: 'files', label: 'Filesystem', icon: Folder },
        { id: 'plugins', label: 'Plugins', icon: Package },
        { id: 'properties', label: 'Properties', icon: Sliders },
        { id: 'settings', label: 'Settings', icon: SettingsIcon },
    ]

    const renderContent = () => {
        switch (activeTab) {
            case 'dashboard': return <HighFiDashboard />
            case 'players': return <HighFiPlayers />
            case 'files': return <HighFiFiles />
            case 'plugins': return <HighFiPlugins />
            case 'properties': return <HighFiProperties />
            case 'settings': return (
                <div className="p-8 flex flex-col gap-8">
                    <div className="flex flex-col gap-2">
                        <h4 className="text-xs font-black uppercase text-white/20 tracking-widest">Theme Customization</h4>
                        <p className="text-[10px] text-white/40 mb-4">Switch between curated visual experiences.</p>
                        <div className="grid grid-cols-2 gap-4">
                            {['glass', 'nebula', 'obsidian', 'sakura'].map(t => (
                                <div
                                    key={t}
                                    onClick={() => setTheme(t)}
                                    className={`p-4 rounded-xl border cursor-pointer transition-all ${theme === t ? 'bg-blue-500/20 border-blue-500/50' : 'bg-white/5 border-white/10'
                                        }`}
                                >
                                    <div className="flex items-center justify-between mb-2">
                                        <span className="text-[10px] font-black uppercase">{t}</span>
                                        <div className={`w-2 h-2 rounded-full ${theme === t ? 'bg-blue-400 animate-pulse' : 'bg-white/10'}`} />
                                    </div>
                                    <div className="flex gap-1">
                                        <div className="w-full h-1 bg-white/10 rounded-full" />
                                        <div className="w-1/2 h-1 bg-white/5 rounded-full" />
                                    </div>
                                </div>
                            ))}
                        </div>
                    </div>

                    <div className="flex flex-col gap-4">
                        <h4 className="text-xs font-black uppercase text-white/20 tracking-widest">System Performance</h4>
                        <div className="mini-card p-4 flex items-center justify-between">
                            <div className="flex items-center gap-3">
                                <Monitor className="text-blue-400" size={16} />
                                <span className="text-[10px] font-bold">Optimization Layer v3.0</span>
                            </div>
                            <div className="w-8 h-4 bg-green-500/40 rounded-full flex items-center justify-end px-0.5">
                                <div className="w-3 h-3 bg-white rounded-full shadow-lg" />
                            </div>
                        </div>
                    </div>
                </div>
            )
            default: return null
        }
    }

    return (
        <div className="w-full max-w-6xl mx-auto h-[700px] liquid-card shadow-[0_100px_200px_-50px_rgba(0,0,0,0.8)] flex overflow-hidden group">
            {/* Sidebar */}
            <div className="w-[80px] md:w-[240px] flex flex-col border-r border-white/5 p-4 bg-white/[0.01]">
                <div className="flex items-center gap-4 mb-12 px-2">
                    <div className="w-12 h-12 bg-gradient-to-br from-blue-400 to-indigo-600 rounded-2xl flex items-center justify-center shadow-lg shadow-blue-500/20">
                        <Terminal size={24} className="text-white" />
                    </div>
                    <div className="hidden md:block">
                        <h3 className="text-lg font-black tracking-tighter">SMM PRO</h3>
                        <span className="text-[8px] font-black uppercase text-blue-400 tracking-widest border border-blue-500/20 px-2 py-0.5 rounded-full bg-blue-500/5">Link Active</span>
                    </div>
                </div>

                <nav className="flex-1 flex flex-col gap-1">
                    {tabs.map(tab => (
                        <div key={tab.id} onClick={() => setActiveTab(tab.id)}>
                            <TabIcon
                                icon={tab.icon}
                                active={activeTab === tab.id}
                                label={tab.label}
                            />
                        </div>
                    ))}
                </nav>

                <div className="mt-auto p-4 bg-blue-500/5 border border-white/5 rounded-2xl">
                    <div className="flex items-center gap-3 text-[10px] font-black uppercase text-white/40 mb-3">
                        <ShieldCheck size={14} className="text-blue-500/50" />
                        <span className="tracking-widest">Secure Node</span>
                    </div>
                    <div className="h-1 bg-white/5 rounded-full overflow-hidden">
                        <motion.div
                            animate={{ width: ['0%', '100%'] }}
                            transition={{ duration: 3, repeat: Infinity, ease: "linear" }}
                            className="h-full bg-blue-500/40"
                        />
                    </div>
                </div>
            </div>

            {/* Content Area */}
            <div className="flex-1 flex flex-col relative overflow-hidden">
                {/* Top Header Mockup */}
                <div className="h-16 border-b border-white/5 flex items-center justify-between px-8 bg-white/[0.02] backdrop-blur-xl">
                    <div className="flex items-center gap-6">
                        <div className="flex items-center gap-3">
                            <div className="w-2 h-2 rounded-full bg-green-500 shadow-[0_0_10px_rgba(34,197,94,0.5)]" />
                            <span className="text-[10px] font-black uppercase tracking-widest text-white/30">Node Primary-01</span>
                        </div>
                        <div className="h-4 w-px bg-white/5" />
                        <div className="flex items-center gap-3">
                            <Cpu size={14} className="text-white/20" />
                            <span className="text-[10px] font-black text-white/60">12 CORE i9</span>
                        </div>
                    </div>

                    <div className="flex items-center gap-4">
                        <div className="flex gap-1">
                            <div className="w-8 h-8 rounded-lg bg-white/5 border border-white/10 flex items-center justify-center hover:bg-white/10 cursor-pointer transition-colors">
                                <Play size={14} className="text-green-500" />
                            </div>
                            <div className="w-8 h-8 rounded-lg bg-white/5 border border-white/10 flex items-center justify-center hover:bg-red-500/20 cursor-pointer transition-colors">
                                <Square size={14} className="text-red-500" />
                            </div>
                        </div>
                        <div className="w-32 h-8 bg-white/5 border border-white/10 rounded-full flex items-center justify-end px-1 relative">
                            <span className="absolute left-3 text-[8px] font-black uppercase text-white/20">Auto-Update</span>
                            <div className="w-6 h-6 rounded-full bg-blue-400 shadow-xl shadow-blue-400/50" />
                        </div>
                    </div>
                </div>

                {/* Content with Animation */}
                <div className="flex-1 overflow-auto relative z-10">
                    <AnimatePresence mode="wait">
                        <motion.div
                            key={activeTab}
                            initial={{ opacity: 0, scale: 0.98, filter: 'blur(10px)' }}
                            animate={{ opacity: 1, scale: 1, filter: 'blur(0px)' }}
                            exit={{ opacity: 0, scale: 1.02, filter: 'blur(10px)' }}
                            transition={{ duration: 0.4, ease: "easeOut" }}
                            className="h-full"
                        >
                            {renderContent()}
                        </motion.div>
                    </AnimatePresence>
                </div>

                {/* Terminal Peek (Optional overlay for dashboard) */}
                {activeTab === 'dashboard' && (
                    <motion.div
                        initial={{ y: 200 }}
                        animate={{ y: 0 }}
                        className="absolute bottom-6 left-6 right-6 h-32 bg-black/80 rounded-2xl border border-white/10 backdrop-blur-3xl overflow-hidden shadow-2xl z-20"
                    >
                        <HighFiConsole />
                    </motion.div>
                )}
            </div>

            {/* Absolute Overlays for extra "crazy" feel */}
            <div className="absolute -top-10 -right-10 w-40 h-40 bg-blue-500/10 blur-[80px] rounded-full group-hover:bg-blue-500/20 transition-all duration-1000" />
        </div>
    )
}

export default InteractivePlayground
