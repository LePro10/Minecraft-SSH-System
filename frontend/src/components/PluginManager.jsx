import React, { useState, useEffect } from 'react';
import { useServer } from '../context/ServerContext';
import { useToast } from '../context/ToastContext';
import { Search, Loader2, AlertCircle, Package, Filter, Sparkles, ArrowRight, ExternalLink, CheckCircle, Trash2, RefreshCw, Zap } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';

const PluginManager = () => {
    const { isConnected, config } = useServer();
    const { showToast } = useToast();
    const [plugins, setPlugins] = useState([]);
    const [installed, setInstalled] = useState([]);
    const [loading, setLoading] = useState(false);
    const [search, setSearch] = useState('');
    const [page, setPage] = useState(1);
    const [total, setTotal] = useState(0);

    const API_BASE = import.meta.env.VITE_API_URL || 'http://localhost:3001';

    useEffect(() => {
        if (isConnected) {
            fetchInstalled();
            fetchPlugins();
        }
    }, [isConnected, search, page]);

    const fetchPlugins = async () => {
        setLoading(true);
        try {
            const res = await fetch(`${API_BASE}/api/plugins/search?query=${encodeURIComponent(search)}&page=${page}`);
            const data = await res.json();
            setPlugins(data.results || []);
            setTotal(data.total || 0);
        } catch (e) {
            showToast('Failed to fetch store plugins', 'error');
        } finally {
            setLoading(false);
        }
    };

    const fetchInstalled = async () => {
        try {
            const res = await fetch(`${API_BASE}/api/plugins/installed?path=${encodeURIComponent(config.path)}`);
            const data = await res.json();
            setInstalled(data || []);
        } catch (e) {
            console.error('Failed to fetch installed plugins');
        }
    };

    const handleInstall = async (plugin) => {
        try {
            showToast(`Installing ${plugin.name}...`, 'info');
            const res = await fetch(`${API_BASE}/api/plugins/install`, {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({
                    url: plugin.downloadUrl,
                    name: plugin.name + '.jar',
                    path: config.path
                })
            });
            if (res.ok) {
                showToast('Installed successfully!', 'success');
                fetchInstalled();
            } else {
                showToast('Installation failed', 'error');
            }
        } catch (e) {
            showToast('Error during installation', 'error');
        }
    };

    const handleUninstall = async (name) => {
        if (!confirm(`Uninstall ${name}?`)) return;
        try {
            const res = await fetch(`${API_BASE}/api/plugins/uninstall`, {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ name, path: config.path })
            });
            if (res.ok) {
                showToast('Uninstalled successfully', 'success');
                fetchInstalled();
            }
        } catch (e) {
            showToast('Error uninstalling', 'error');
        }
    };

    if (!isConnected) {
        return (
            <div className="flex flex-col items-center justify-center h-full text-white/40 gap-4">
                <AlertCircle size={48} className="opacity-20" />
                <p className="font-bold uppercase tracking-widest text-sm">Connect SSH to Manage Plugins</p>
            </div>
        );
    }

    const filteredStore = plugins.filter(p => !installed.some(i => i.name.toLowerCase().includes(p.name.toLowerCase())));

    return (
        <div className="h-full w-full overflow-y-auto overflow-x-hidden scrollbar-thin scrollbar-thumb-white/10 relative">
            <div className="p-6 flex flex-col gap-8">
                <header className="liquid-card p-6 flex flex-wrap items-center justify-between gap-6 shrink-0 relative z-10">
                    <div className="flex items-center gap-5">
                        <div className="w-14 h-14 rounded-2xl bg-gradient-to-br from-purple-600 to-pink-500 shadow-[0_0_20px_rgba(219,39,119,0.3)] flex items-center justify-center text-white">
                            <Package size={28} />
                        </div>
                        <div>
                            <h2 className="text-2xl font-black text-white tracking-tight">Plugin Store</h2>
                            <span className="flex items-center gap-1.5 text-[10px] font-bold uppercase tracking-widest text-pink-400 mt-1 font-mono bg-pink-500/10 px-2 py-0.5 rounded w-fit">SpigotMC Repository</span>
                        </div>
                    </div>

                    <div className="flex items-center gap-4 flex-wrap">
                        <div className="relative group">
                            <div className="absolute inset-y-0 left-4 flex items-center text-white/30 group-focus-within:text-pink-400 transition-colors">
                                <Search size={18} />
                            </div>
                            <input
                                className="w-[280px] h-12 pl-12 pr-4 rounded-xl bg-black/20 border border-white/10 focus:border-pink-500/50 focus:bg-black/40 outline-none text-white text-sm font-medium transition-all placeholder:text-white/20"
                                placeholder="Search extensions..."
                                value={search}
                                onChange={e => { setSearch(e.target.value); setPage(1); }}
                            />
                        </div>

                        <button className="h-12 w-12 rounded-xl bg-white/5 hover:bg-white/10 border border-white/10 flex items-center justify-center text-white/60 hover:text-white transition-all">
                            <Filter size={20} />
                        </button>
                    </div>
                </header>

                <div className="grid grid-cols-1 xl:grid-cols-2 gap-8">
                    {/* Installed Section */}
                    <div className="flex flex-col gap-6">
                        <div className="flex items-center justify-between px-2">
                            <div className="flex items-center gap-3">
                                <div className="w-2 h-6 bg-pink-500 rounded-full" />
                                <h3 className="text-xs font-black uppercase tracking-[0.2em] text-white/50">Core Extensions ({installed.length})</h3>
                            </div>
                            <button onClick={fetchInstalled} className="text-white/20 hover:text-white transition-colors"><RefreshCw size={14} /></button>
                        </div>

                        <div className="flex flex-col gap-3">
                            {installed.map((p, i) => (
                                <motion.div key={i} layout initial={{ opacity: 0, x: -20 }} animate={{ opacity: 1, x: 0 }} className="liquid-card p-4 flex items-center justify-between group">
                                    <div className="flex items-center gap-4">
                                        <div className="w-12 h-12 rounded-xl bg-white/5 flex items-center justify-center text-pink-400 group-hover:bg-pink-500/10 transition-colors">
                                            <Sparkles size={20} />
                                        </div>
                                        <div>
                                            <div className="text-sm font-bold text-white shrink-0">{p.name}</div>
                                            <div className="text-[10px] font-mono text-white/30 lowercase tracking-tighter truncate max-w-[200px]">{p.name.replace('.jar', '')}</div>
                                        </div>
                                    </div>
                                    <div className="flex items-center gap-2">
                                        <div className="px-2 py-1 rounded-md bg-emerald-500/10 text-emerald-400 text-[10px] font-bold uppercase tracking-widest flex items-center gap-1.5 border border-emerald-500/20">
                                            <CheckCircle size={10} /> Active
                                        </div>
                                        <button onClick={() => handleUninstall(p.name)} className="w-9 h-9 rounded-lg bg-red-500/10 text-red-400 opacity-0 group-hover:opacity-100 transition-all hover:bg-red-500/20 flex items-center justify-center">
                                            <Trash2 size={16} />
                                        </button>
                                    </div>
                                </motion.div>
                            ))}
                        </div>
                    </div>

                    {/* Store Section */}
                    <div className="flex flex-col gap-6">
                        <div className="flex items-center gap-3 px-2">
                            <div className="w-2 h-6 bg-purple-500 rounded-full" />
                            <h3 className="text-xs font-black uppercase tracking-[0.2em] text-white/50">Marketplace</h3>
                        </div>

                        <div className="flex flex-col gap-4 relative min-h-[400px]">
                            {loading && (
                                <div className="absolute inset-0 flex items-center justify-center bg-black/20 backdrop-blur-sm z-20 rounded-3xl">
                                    <Loader2 className="animate-spin text-pink-400" size={32} />
                                </div>
                            )}

                            <AnimatePresence mode="popLayout">
                                {plugins.map(p => (
                                    <motion.div
                                        key={p.id}
                                        layout
                                        initial={{ opacity: 0, scale: 0.95 }}
                                        animate={{ opacity: 1, scale: 1 }}
                                        exit={{ opacity: 0, scale: 0.95 }}
                                        className="liquid-card p-5 hover:bg-white/[0.04] transition-all group"
                                    >
                                        <div className="flex items-start justify-between">
                                            <div className="flex gap-5">
                                                <div className="w-16 h-16 rounded-2xl bg-black/40 border border-white/5 flex items-center justify-center overflow-hidden shrink-0 group-hover:border-pink-500/30 transition-colors">
                                                    {p.iconUrl ? <img src={p.iconUrl} className="w-full h-full object-cover" /> : <Package className="text-white/10" size={24} />}
                                                </div>
                                                <div className="flex flex-col gap-1">
                                                    <div className="flex items-center gap-2">
                                                        <h4 className="font-bold text-white group-hover:text-pink-400 transition-colors">{p.name}</h4>
                                                        {p.premium && <div className="px-1.5 py-0.5 rounded bg-amber-500/20 text-amber-500 text-[8px] font-black uppercase tracking-tighter">Premium</div>}
                                                    </div>
                                                    <p className="text-xs text-white/40 line-clamp-2 leading-relaxed">{p.tagline}</p>
                                                    <div className="flex items-center gap-4 mt-2">
                                                        <span className="text-[10px] font-bold text-white/20 flex items-center gap-1"><Zap size={10} /> {p.downloads} DN</span>
                                                        <span className="text-[10px] font-bold text-pink-500/40">{p.version}</span>
                                                    </div>
                                                </div>
                                            </div>

                                            <button
                                                onClick={() => handleInstall(p)}
                                                className="px-4 py-2 rounded-xl bg-pink-500/10 border border-pink-500/20 text-pink-400 text-[10px] font-black uppercase tracking-widest hover:bg-pink-500 hover:text-white transition-all flex items-center gap-2"
                                            >
                                                GET <ArrowRight size={12} />
                                            </button>
                                        </div>
                                    </motion.div>
                                ))}
                            </AnimatePresence>

                            {/* Pagination */}
                            <div className="flex items-center justify-center gap-2 mt-4">
                                <button
                                    className="px-4 py-2 rounded-lg bg-white/5 border border-white/10 text-white/40 hover:text-white disabled:opacity-20 text-[10px] font-bold uppercase"
                                    onClick={() => setPage(p => Math.max(1, p - 1))}
                                    disabled={page === 1}
                                >
                                    Prev
                                </button>
                                <span className="text-xs font-mono text-white/20">PAGE {page}</span>
                                <button
                                    className="px-4 py-2 rounded-lg bg-white/5 border border-white/10 text-white/40 hover:text-white disabled:opacity-20 text-[10px] font-bold uppercase"
                                    onClick={() => setPage(p => p + 1)}
                                    disabled={plugins.length < 10}
                                >
                                    Next
                                </button>
                            </div>
                        </div>
                    </div>
                </div>
                <div className="h-20 shrink-0" />
            </div>
        </div>
    );
};

export default PluginManager;
