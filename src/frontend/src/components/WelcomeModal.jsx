import React, { useState } from 'react';
import { Terminal, Check, ArrowRight, Moon, HardDrive, Hexagon, ShieldAlert, Rocket, Sparkles } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';

const WelcomeModal = ({ onComplete, initialTheme, setTheme }) => {
    const [step, setStep] = useState(1);
    const [credentials, setCredentials] = useState({
        host: '',
        port: 22,
        username: '',
        password: '',
        path: '/home/mcserver'
    });
    const [localTheme, setLocalTheme] = useState(initialTheme);

    const handleNext = () => setStep(step + 1);

    const handleFinish = () => {
        localStorage.setItem('hasVisited', 'true');
        onComplete(credentials);
    };

    const handleThemeChange = (t) => {
        setLocalTheme(t);
        setTheme(t);
    };

    return (
        <AnimatePresence>
            <motion.div
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                className="fixed inset-0 z-[5000] flex items-center justify-center bg-black/80 backdrop-blur-3xl"
            >
                <div className="relative w-full max-w-[560px] min-h-[580px] flex flex-col liquid-card overflow-hidden shadow-2xl">
                    {/* Progress Bar */}
                    <div className="flex justify-center gap-2 p-10 pb-0">
                        {[1, 2, 3].map((s) => (
                            <div
                                key={s}
                                className={`h-1.5 flex-1 rounded-full transition-all duration-700 ease-[cubic-bezier(0.25,0.8,0.25,1)] relative overflow-hidden ${step >= s ? 'bg-blue-500 shadow-[0_0_10px_rgba(59,130,246,0.6)]' : 'bg-white/5'
                                    }`}
                            >
                                {step >= s && (
                                    <div className="absolute inset-0 bg-gradient-to-r from-transparent via-white/50 to-transparent w-full animate-[shimmer_2s_infinite]" />
                                )}
                            </div>
                        ))}
                    </div>

                    <div className="flex-1 flex flex-col p-10 pt-8">
                        {step === 1 && (
                            <motion.div
                                initial={{ opacity: 0, y: 20 }}
                                animate={{ opacity: 1, y: 0 }}
                                className="flex-1 flex flex-col items-center justify-center text-center gap-8"
                            >
                                <div className="relative">
                                    <div className="absolute inset-0 bg-blue-500/30 blur-[60px] rounded-full" />
                                    <div className="relative w-28 h-28 rounded-[2rem] bg-gradient-to-br from-blue-600 to-cyan-400 flex items-center justify-center text-white shadow-2xl shadow-blue-500/20 z-10">
                                        <Hexagon size={64} className="absolute text-black/10" strokeWidth={1} />
                                        <Terminal size={36} className="relative z-10" />
                                    </div>
                                </div>

                                <div>
                                    <h1 className="text-5xl font-black text-white tracking-[0.2em] mb-4 drop-shadow-2xl">SMM</h1>
                                    <p className="text-lg font-medium text-white/60 max-w-[300px] mx-auto leading-relaxed">Secure SSH Console for your ultra-modern Minecraft Infrastructure.</p>
                                </div>

                                <button
                                    className="w-full h-16 rounded-2xl bg-white/10 hover:bg-white/20 border border-white/10 text-white font-bold text-lg uppercase tracking-widest flex items-center justify-center gap-3 transition-all hover:scale-[1.02] active:scale-[0.98] group"
                                    onClick={handleNext}
                                >
                                    Initiate Sequence <Rocket size={20} className="group-hover:translate-x-1 duration-300 transform -rotate-45" />
                                </button>
                            </motion.div>
                        )}

                        {step === 2 && (
                            <motion.div
                                initial={{ opacity: 0, x: 20 }}
                                animate={{ opacity: 1, x: 0 }}
                                className="flex-1 flex flex-col items-center"
                            >
                                <div className="text-center mb-10">
                                    <h2 className="text-2xl font-black text-white uppercase tracking-widest mb-2">Aesthetic Mode</h2>
                                    <p className="text-white/50 font-medium">Define the visual properties of your workspace.</p>
                                </div>

                                <div className="flex gap-6 mb-12 w-full justify-center">
                                    {[
                                        { id: 'glass', label: 'Liquid Glass', icon: <Sparkles size={20} />, bg: 'bg-gradient-to-br from-blue-500 to-cyan-400' },
                                        { id: 'obsidian', label: 'Obsidian', icon: <Moon size={20} />, bg: 'bg-gray-900 border border-white/10' },
                                        { id: 'coder', label: 'Matrix', icon: <Terminal size={20} />, bg: 'bg-black border border-green-500/50 text-green-400' }
                                    ].map((theme) => (
                                        <div
                                            key={theme.id}
                                            className={`relative w-28 h-28 rounded-3xl cursor-pointer transition-all duration-300 flex flex-col items-center justify-center gap-3 bg-white/5 border border-white/5 hover:-translate-y-2 hover:bg-white/10 ${localTheme === theme.id ? 'ring-2 ring-offset-2 ring-offset-black ring-blue-500 shadow-xl shadow-blue-500/10' : ''
                                                }`}
                                            onClick={() => handleThemeChange(theme.id)}
                                        >
                                            <div className={`w-12 h-12 rounded-full flex items-center justify-center text-white ${theme.bg}`}>
                                                {theme.icon}
                                            </div>
                                            <span className="text-[10px] font-black uppercase tracking-widest text-white/70">{theme.label}</span>
                                            {localTheme === theme.id && <div className="absolute top-2 right-2 text-blue-400"><Check size={14} strokeWidth={4} /></div>}
                                        </div>
                                    ))}
                                </div>

                                <button
                                    className="w-full h-14 rounded-xl bg-white/5 hover:bg-white/10 border border-white/10 text-white font-bold text-sm uppercase tracking-widest transition-all hover:scale-[1.01] mt-auto"
                                    onClick={handleNext}
                                >
                                    Proceed to Host Configuration
                                </button>
                            </motion.div>
                        )}

                        {step === 3 && (
                            <motion.div
                                initial={{ opacity: 0, x: 20 }}
                                animate={{ opacity: 1, x: 0 }}
                                className="flex-1 flex flex-col"
                            >
                                <div className="text-center mb-10">
                                    <h2 className="text-2xl font-black text-white uppercase tracking-widest mb-2">Link Established</h2>
                                    <p className="text-white/50 font-medium">Awaiting SSH credentials to bridge the connection.</p>
                                </div>

                                <div className="flex flex-col gap-4 mb-8">
                                    <div className="flex gap-4">
                                        <input
                                            className="liquid-input flex-1 h-12 px-4 rounded-xl bg-black/20 font-mono text-sm"
                                            placeholder="Host Address"
                                            value={credentials.host}
                                            onChange={e => setCredentials({ ...credentials, host: e.target.value })}
                                        />
                                        <input
                                            className="liquid-input w-24 h-12 px-4 rounded-xl bg-black/20 font-mono text-sm"
                                            type="number"
                                            placeholder="22"
                                            value={credentials.port}
                                            onChange={e => setCredentials({ ...credentials, port: parseInt(e.target.value) })}
                                        />
                                    </div>
                                    <input
                                        className="liquid-input h-12 px-4 rounded-xl bg-black/20 font-mono text-sm"
                                        placeholder="Username"
                                        value={credentials.username}
                                        onChange={e => setCredentials({ ...credentials, username: e.target.value })}
                                    />
                                    <input
                                        className="liquid-input h-12 px-4 rounded-xl bg-black/20 font-mono text-sm"
                                        type="password"
                                        placeholder="Password / Key"
                                        value={credentials.password}
                                        onChange={e => setCredentials({ ...credentials, password: e.target.value })}
                                    />

                                    <div className="flex items-center gap-3 px-4 h-12 rounded-xl bg-white/5 border border-white/5">
                                        <HardDrive size={16} className="text-white/30" />
                                        <input
                                            className="flex-1 bg-transparent border-none outline-none text-white font-mono text-sm placeholder:text-white/20"
                                            placeholder="Root Path (e.g. /opt/minecraft)"
                                            value={credentials.path}
                                            onChange={e => setCredentials({ ...credentials, path: e.target.value })}
                                        />
                                    </div>
                                </div>

                                <div className="flex items-center gap-2 justify-center text-[10px] font-bold uppercase tracking-widest text-emerald-400 opacity-60 mb-8">
                                    <ShieldAlert size={12} />
                                    <span>Credentials are encrypted & stored locally</span>
                                </div>

                                <button
                                    className="w-full h-16 rounded-2xl bg-gradient-to-r from-blue-600 to-cyan-500 shadow-lg shadow-blue-600/20 hover:shadow-blue-600/40 text-white font-black text-sm uppercase tracking-widest transition-all hover:scale-[1.02] active:scale-[0.98]"
                                    onClick={handleFinish}
                                >
                                    Establish Full Bridge
                                </button>
                            </motion.div>
                        )}
                    </div>
                </div>
            </motion.div>
        </AnimatePresence>
    );
};

export default WelcomeModal;
