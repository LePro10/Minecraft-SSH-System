import React from 'react';
import { motion } from 'framer-motion';
import { Terminal, Shield, Cpu, Activity, Folder, Package, Code } from 'lucide-react';

const EnginePreview = () => {
    return (
        <div className="relative w-full max-w-5xl mx-auto h-[600px] mt-32 perspective-1000 hidden lg:block">
            {/* BACKGROUND GLOW */}
            <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[800px] h-[400px] bg-blue-500/10 blur-[150px] rounded-full" />

            {/* SSH DATA LAYER (Bottom) */}
            <motion.div
                initial={{ opacity: 0, rotateX: 45, translateZ: -100, y: 100 }}
                whileInView={{ opacity: 1, rotateX: 45, translateZ: 0, y: 0 }}
                transition={{ duration: 1, delay: 0.2 }}
                className="absolute inset-0 flex items-center justify-center pointer-events-none"
            >
                <div className="w-[80%] h-[400px] glass-2 border-dashed border-blue-500/30 opacity-40 flex flex-col p-8 font-mono text-[10px] text-blue-400 overflow-hidden">
                    <div className="flex gap-2 mb-4 opacity-50">
                        <div className="w-2 h-2 rounded-full bg-blue-500" />
                        <span>SSH ENCRYPTION LAYER v4.2.0</span>
                    </div>
                    {[...Array(15)].map((_, i) => (
                        <div key={i} className="mb-1">
                            {`[${new Date().toLocaleTimeString()}] AUTH_AGENT_SUCCESS: Forwarding identity to rsa-sha2-512...`}
                        </div>
                    ))}
                </div>
            </motion.div>

            {/* CORE LOGIC LAYER (Middle) */}
            <motion.div
                initial={{ opacity: 0, rotateX: 45, translateZ: 0, y: 50 }}
                whileInView={{ opacity: 1, rotateX: 45, translateZ: 100, y: -50 }}
                transition={{ duration: 1, delay: 0.4 }}
                className="absolute inset-0 flex items-center justify-center pointer-events-none"
            >
                <div className="w-[70%] h-[350px] glass-2 border-indigo-500/30 shadow-[0_50px_100px_rgba(0,0,0,0.5)] flex items-center justify-center gap-12 p-10">
                    <div className="flex flex-col items-center gap-2">
                        <div className="w-16 h-16 rounded-2xl bg-indigo-500/20 flex items-center justify-center border border-indigo-500/50">
                            <Activity size={24} className="text-indigo-400" />
                        </div>
                        <span className="text-[10px] font-black uppercase tracking-tighter text-indigo-300">Heartbeat</span>
                    </div>
                    <div className="w-32 h-[2px] bg-gradient-to-r from-transparent via-indigo-500/50 to-transparent" />
                    <div className="flex flex-col items-center gap-2">
                        <div className="w-20 h-20 rounded-full border-2 border-white/10 flex items-center justify-center relative">
                            <div className="absolute inset-0 rounded-full border-t-2 border-blue-500 animate-spin" />
                            <Cpu size={32} className="text-white" />
                        </div>
                        <span className="text-[10px] font-black uppercase tracking-tighter text-white">Engine Core</span>
                    </div>
                    <div className="w-32 h-[2px] bg-gradient-to-r from-transparent via-indigo-500/50 to-transparent" />
                    <div className="flex flex-col items-center gap-2">
                        <div className="w-16 h-16 rounded-2xl bg-cyan-500/20 flex items-center justify-center border border-cyan-500/50">
                            <Package size={24} className="text-cyan-400" />
                        </div>
                        <span className="text-[10px] font-black uppercase tracking-tighter text-cyan-300">I/O Bridge</span>
                    </div>
                </div>
            </motion.div>

            {/* UI INTERFACE LAYER (Top) */}
            <motion.div
                initial={{ opacity: 0, rotateX: 45, translateZ: 100, y: 0 }}
                whileInView={{ opacity: 1, rotateX: 45, translateZ: 200, y: -150 }}
                transition={{ duration: 1, delay: 0.6 }}
                className="absolute inset-0 flex items-center justify-center pointer-events-none"
            >
                <div className="w-[90%] h-[450px] glass-2 heavy-glass shadow-[0_100px_200px_rgba(0,0,0,0.8)] border-white/20 p-6 flex flex-col">
                    <div className="flex items-center justify-between mb-8 pb-4 border-b border-white/10">
                        <div className="flex gap-2">
                            <div className="w-3 h-3 rounded-full bg-red-500/50" />
                            <div className="w-3 h-3 rounded-full bg-yellow-500/50" />
                            <div className="w-3 h-3 rounded-full bg-green-500/50" />
                        </div>
                        <div className="px-4 py-1 rounded-full bg-white/5 border border-white/10 text-[10px] font-black tracking-widest uppercase">
                            Liquid v2.0 // Active
                        </div>
                    </div>

                    <div className="grid grid-cols-12 gap-6 flex-1">
                        <div className="col-span-3 space-y-4">
                            {[Terminal, Activity, Folder, Code].map((Icon, i) => (
                                <div key={i} className={`h-10 rounded-xl flex items-center px-4 gap-3 ${i === 1 ? 'bg-white/10 border border-white/20' : 'bg-white/5 border border-white/5'}`}>
                                    <Icon size={14} className={i === 1 ? 'text-blue-400' : 'text-white/40'} />
                                    <div className="w-12 h-1.5 rounded-full bg-white/10" />
                                </div>
                            ))}
                        </div>
                        <div className="col-span-9 space-y-6">
                            <div className="h-40 rounded-2xl bg-white/5 border border-white/10 flex items-center justify-center">
                                <div className="w-full px-10 flex flex-col gap-6">
                                    <div className="flex justify-between items-end">
                                        <div className="space-y-2">
                                            <div className="w-24 h-2 rounded-full bg-white/5" />
                                            <div className="w-40 h-8 rounded-lg bg-white/10" />
                                        </div>
                                        <div className="w-20 h-20 rounded-full border-4 border-blue-500/20 border-t-blue-500" />
                                    </div>
                                    <div className="w-full h-[2px] bg-white/5" />
                                </div>
                            </div>
                        </div>
                    </div>
                </div>
            </motion.div>

            {/* CONNECTING LINES (SVG) */}
            <svg className="absolute inset-0 w-full h-full pointer-events-none" style={{ zIndex: 5 }}>
                {/* Lines could be added here if needed */}
            </svg>

            {/* LABELS */}
            <div className="absolute top-0 right-0 p-8 space-y-4 text-right">
                <label className="block text-[10px] font-black uppercase tracking-[0.3em] text-blue-400">Layer 03 - UI Surface</label>
                <label className="block text-[10px] font-black uppercase tracking-[0.3em] text-indigo-400 mt-24">Layer 02 - Core Logic</label>
                <label className="block text-[10px] font-black uppercase tracking-[0.3em] text-blue-600/50 mt-32">Layer 01 - SSH Bridge</label>
            </div>
        </div>
    );
};

export default EnginePreview;
