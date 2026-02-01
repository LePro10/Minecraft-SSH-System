import React from 'react'
import { motion } from 'framer-motion'
import { Terminal, Shield, Zap, Package, Activity, Users, Folder, Sliders } from 'lucide-react'
import {
    HighFiConsole, HighFiDashboard, HighFiPlayers, HighFiPlugins,
    HighFiFiles, HighFiProperties, FullToolPreview
} from './MiniUI'

const features = [
    {
        title: "Secure Native SSH",
        tab: 'dashboard',
        description: "Built on enterprise-grade RSA-4096 security protocols. Unlike heavy wrappers, our native SSH bridge communicates directly with your node. Get raw performance, zero latency, and the confidence of a system that's as secure as it is fast.",
        icon: <Terminal className="w-6 h-6" />,
        label: "Enterprise",
        preview: <HighFiConsole />,
        accent: "from-blue-500/10"
    },
    {
        title: "Real-Time Resource Hub",
        tab: 'dashboard',
        description: "Monitor every heartbeat of your server. Our high-fidelity widgets track TPS, RAM allocation, and CPU load with extreme precision. Identify performance peaks and optimize your server load before your players even notice.",
        icon: <Activity className="w-6 h-6" />,
        label: "Professional",
        preview: <HighFiDashboard />,
        accent: "from-purple-500/10"
    },
    {
        title: "Advanced Player Suite",
        tab: 'players',
        description: "Complete authority over your community. Toggle OP status, manage permissions, and monitor player latency from a centralized, beautiful interface. Managing your world has never felt this intuitive or powerful.",
        icon: <Users className="w-6 h-6" />,
        label: "Elite",
        preview: <HighFiPlayers />,
        accent: "from-green-500/10"
    },
    {
        title: "Intelligence Plugin Store",
        tab: 'plugins',
        description: "The ultimate edge for server owners. Browse, install, and hot-reload over 50,000+ plugins directly from our intelligence engine. Auto-dependency resolution ensures your server stays stable while you scale.",
        icon: <Package className="w-6 h-6" />,
        label: "Intelligent",
        preview: <HighFiPlugins />,
        accent: "from-cyan-500/10"
    },
    {
        title: "Liquid Filesystem",
        tab: 'files',
        description: "A file manager that feels like a native desktop app. Browse, edit, upload, and manage your entire server directory with zero lag. Features include bulk actions, deep-search, and an integrated industrial-grade editor.",
        icon: <Folder className="w-6 h-6" />,
        label: "Advanced",
        preview: <HighFiFiles />,
        accent: "from-orange-500/10"
    },
    {
        title: "Property Precision",
        tab: 'properties',
        description: "Stop parsing text files manually. Our live property editor gives you a clean, visual interface to manage all server.properties and YAML configs. Changes are validated in real-time to prevent boot failures.",
        icon: <Sliders className="w-6 h-6" />,
        label: "Accurate",
        preview: <HighFiProperties />,
        accent: "from-red-500/10"
    }
]

const FeatureShowcase = () => {
    return (
        <section id="features" className="py-20 relative">
            <div className="container mx-auto px-6">
                <div className="text-center mb-32">
                    <motion.div
                        initial={{ opacity: 0, scale: 0.9 }}
                        whileInView={{ opacity: 1, scale: 1 }}
                        viewport={{ once: true }}
                        className="inline-block px-4 py-1 mb-8 text-[10px] font-black tracking-[0.3em] uppercase bg-white/5 border border-white/10 rounded-full text-white/50"
                    >
                        Core Architecture
                    </motion.div>
                    <motion.h2
                        initial={{ opacity: 0, y: 30 }}
                        whileInView={{ opacity: 1, y: 0 }}
                        viewport={{ once: true }}
                        className="text-5xl md:text-8xl font-black mb-8 tracking-tighter italic"
                    >
                        Engineered for <span className="text-gradient">Control.</span>
                    </motion.h2>
                </div>

                <div className="grid gap-40">
                    {features.map((feature, index) => (
                        <motion.div
                            key={index}
                            initial={{ opacity: 0, y: 50 }}
                            whileInView={{ opacity: 1, y: 0 }}
                            viewport={{ once: true }}
                            transition={{ duration: 0.8, ease: "easeOut" }}
                            className={`flex flex-col ${index % 2 === 0 ? 'lg:flex-row' : 'lg:flex-row-reverse'} gap-24 items-center`}
                        >
                            {/* Feature Text */}
                            <div className="lg:w-1/2">
                                <div className="flex items-center gap-4 mb-8">
                                    <div className="p-4 bg-white/5 rounded-2xl flex items-center justify-center text-blue-400 border border-white/10 shadow-xl group-hover:scale-110 transition-transform">
                                        {feature.icon}
                                    </div>
                                    <div className="flex flex-col">
                                        <span className="text-[10px] font-black uppercase tracking-[0.3em] text-white/20">Industrial Module</span>
                                        <span className="text-sm font-black text-white/80">{feature.label}</span>
                                    </div>
                                </div>
                                <h3 className="text-4xl md:text-6xl font-black mb-8 leading-tight tracking-tighter italic text-glow">{feature.title}</h3>
                                <p className="text-white/40 text-xl leading-relaxed mb-10 max-w-xl font-medium">
                                    {feature.description}
                                </p>

                                <div className="grid grid-cols-2 gap-6 mb-12">
                                    {[
                                        { label: "Stability", val: "99.9%" },
                                        { label: "Encryption", val: "RSA-4096" },
                                    ].map((stat, i) => (
                                        <div key={i} className="mini-card p-4">
                                            <div className="text-[10px] font-black uppercase text-white/20 mb-1">{stat.label}</div>
                                            <div className="text-xl font-black text-blue-400 tracking-tighter">{stat.val}</div>
                                        </div>
                                    ))}
                                </div>

                                <button className="liquid-button">
                                    TECHNICAL SPECIFICATIONS <Zap size={14} className="text-blue-500" />
                                </button>
                            </div>

                            {/* Feature Preview (Mixed Element style) */}
                            <div className="lg:w-1/2 w-full relative group">
                                {/* Background Shadow Glow */}
                                <div className={`absolute -inset-10 bg-gradient-to-br ${feature.accent} to-transparent blur-[100px] rounded-full opacity-0 group-hover:opacity-100 transition-opacity duration-700`} />

                                <motion.div
                                    whileHover={{ scale: 1.02, rotate: index % 2 === 0 ? -1 : 1 }}
                                    className="relative z-10 w-full aspect-[4/3] md:aspect-video"
                                >
                                    <div className="w-full h-full liquid-card border-white/20 shadow-[0_60px_120px_-20px_rgba(0,0,0,0.9)] overflow-hidden">
                                        <FullToolPreview activeTab={feature.tab}>
                                            {feature.preview}
                                        </FullToolPreview>
                                    </div>

                                    {/* Floating Micro-UI bits */}
                                    <motion.div
                                        animate={{ y: [0, -15, 0] }}
                                        transition={{ duration: 4, repeat: Infinity, ease: "easeInOut" }}
                                        className="absolute -top-6 -right-6 w-32 h-32 mini-card border-white/20 bg-black/40 backdrop-blur-3xl p-4 flex flex-col justify-between shadow-2xl z-20 hidden md:flex"
                                    >
                                        <Shield size={16} className="text-blue-500/50" />
                                        <div className="h-1 bg-white/5 rounded-full"><div className="w-3/4 h-full bg-blue-500/40 rounded-full" /></div>
                                        <span className="text-[8px] font-black uppercase text-white/20">Handshake Active</span>
                                    </motion.div>
                                </motion.div>
                            </div>
                        </motion.div>
                    ))}
                </div>
            </div>
        </section>
    )
}

export default FeatureShowcase
