import React, { useState, useEffect } from 'react';
import { useServer } from '../context/ServerContext';
import { useToast } from '../context/ToastContext';
import { Search, Download, Star, ExternalLink, Loader2, CheckCircle, Package, ArrowRight, AlertCircle, Trash2, Filter, Sparkles } from 'lucide-react';
import { motion } from 'framer-motion';

const PluginManager = () => {
    const { config, isConnected } = useServer();
    const [plugins, setPlugins] = useState([]);
    const [installed, setInstalled] = useState([]);
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState(null);
    const [search, setSearch] = useState('');
    const [installing, setInstalling] = useState(null);
    const [uninstalling, setUninstalling] = useState(null);
    const [page, setPage] = useState(1);
    const [showInstalledOnly, setShowInstalledOnly] = useState(false);

    const API_BASE = import.meta.env.VITE_API_URL || 'http://localhost:3001';
    const { showToast } = useToast();

    const fetchPlugins = async (query = '', p = 1) => {
        setLoading(true);
        setError(null);
        try {
            const res = await fetch(`${API_BASE}/api/plugins/search?query=${encodeURIComponent(query)}&page=${p}`);
            const data = await res.json();

            if (!res.ok) {
                throw new Error(data.error || 'The plugin store is temporarily unavailable.');
            }

            if (Array.isArray(data)) {
                if (p === 1) setPlugins(data);
                else setPlugins(prev => [...prev, ...data]);
            } else {
                setPlugins([]);
            }
        } catch (e) {
            console.error('Plugin search error:', e);
            setError(e.message.includes('Failed to fetch') ? 'Cannot connect to the backend server. Is it running?' : e.message);
        } finally {
            setLoading(false);
        }
    };

    const fetchInstalled = async () => {
        if (!isConnected) return;
        try {
            const res = await fetch(`${API_BASE}/api/plugins/installed?serverPath=${encodeURIComponent(config.path)}`);
            if (res.ok) {
                const data = await res.json();
                setInstalled(Array.isArray(data) ? data : []);
            }
        } catch (e) { console.error('Error fetching installed plugins:', e); }
    };

    useEffect(() => {
        fetchPlugins('', 1);
        if (isConnected) fetchInstalled();
    }, [isConnected, config.path]);

    const triggerReload = async () => {
        try {
            await fetch(`${API_BASE}/api/mc/control`, {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ action: 'reload' })
            });
            showToast('Reload signal sent.', 'info');
        } catch (e) {
            showToast('Failed to trigger reload.', 'error');
        }
    };

    const handleInstall = async (plugin) => {
        if (!isConnected) return showToast('Establish SSH link first.', 'error');
        setInstalling(plugin.id);
        try {
            const res = await fetch(`${API_BASE}/api/plugins/install`, {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({
                    resourceId: plugin.id,
                    resourceName: plugin.name,
                    serverPath: config.path
                })
            });
            const data = await res.json();
            if (res.ok) {
                showToast(`${plugin.name} integrated. Reload required.`, 'success', {
                    label: 'Reload Server',
                    onClick: () => triggerReload()
                });
                fetchInstalled();
            } else showToast(`Download failed: ${data.error}`, 'error');
        } catch (e) { showToast('Spiget downlink interrupted.', 'error'); }
        finally { setInstalling(null); }
    };

    const handleUninstall = async (plugin) => {
        if (!isConnected) return showToast('Establish SSH link first.', 'error');
        if (!window.confirm(`Are you sure you want to uninstall ${plugin.name} and DELETE its data folder?`)) return;

        setUninstalling(plugin.id);
        try {
            const res = await fetch(`${API_BASE}/api/plugins/uninstall`, {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({
                    resourceName: plugin.name,
                    serverPath: config.path
                })
            });
            const data = await res.json();
            if (res.ok) {
                showToast(`${plugin.name} purged. Reload required.`, 'success', {
                    label: 'Reload Server',
                    onClick: () => triggerReload()
                });
                fetchInstalled();
            } else showToast(`Purge failed: ${data.error}`, 'error');
        } catch (e) { showToast('Uninstall sync failed.', 'error'); }
        finally { setUninstalling(null); }
    };

    const isInstalled = (name) => {
        if (!name) return false;
        const softName = name.replace(/[^a-z0-9]/gi, '_').toLowerCase();
        return installed.some(f => f.toLowerCase().includes(softName));
    };

    const filteredPlugins = showInstalledOnly
        ? plugins.filter(p => isInstalled(p.name))
        : plugins;

    return (
        <div className="flex flex-col h-full overflow-hidden p-3 gap-6">
            <header className="liquid-card p-6 flex flex-wrap items-center justify-between gap-6 shrink-0 relative z-10">
                <div className="flex items-center gap-5">
                    <div className="w-14 h-14 rounded-2xl bg-gradient-to-br from-purple-600 to-pink-500 shadow-[0_0_20px_rgba(219,39,119,0.3)] flex items-center justify-center text-white">
                        <Package size={28} />
                    </div>
                    <div>
                        <h2 className="text-2xl font-black text-white tracking-tight">Spiget Plugin Store</h2>
                        <div className="flex items-center gap-1.5 text-[10px] font-bold uppercase tracking-widest text-purple-400 mt-1"><Sparkles size={11} /> Pro Installer</div>
                    </div>
                </div>

                <div className="flex items-center gap-4 flex-wrap">
                    <button
                        className={`flex items-center gap-2 px-5 py-3 rounded-xl font-bold text-xs uppercase tracking-wide transition-all border ${showInstalledOnly
                                ? 'bg-green-500/20 border-green-500/40 text-green-400'
                                : 'bg-white/5 border-white/10 text-white/60 hover:text-white hover:bg-white/10'
                            }`}
                        onClick={() => setShowInstalledOnly(!showInstalledOnly)}
                    >
                        <Filter size={16} />
                        <span>Filter Installed</span>
                    </button>

                    <div className="relative group">
                        <div className="absolute inset-y-0 left-4 flex items-center text-white/30 group-focus-within:text-purple-400 transition-colors">
                            <Search size={18} />
                        </div>
                        <input
                            className="w-[300px] h-12 pl-12 pr-28 rounded-xl bg-black/20 border border-white/10 focus:border-purple-500/50 focus:bg-black/40 outline-none text-white text-sm font-medium transition-all placeholder:text-white/20"
                            placeholder="Find next-gen plugins..."
                            value={search}
                            onChange={e => setSearch(e.target.value)}
                            onKeyDown={e => e.key === 'Enter' && fetchPlugins(search, 1)}
                        />
                        <button className="absolute inset-y-1 right-1 px-4 rounded-lg bg-white/10 hover:bg-purple-500/20 text-white/50 hover:text-purple-300 font-bold text-xs uppercase transition-colors" onClick={() => fetchPlugins(search, 1)}>Search</button>
                    </div>
                </div>
            </header>

            <div className="flex-1 overflow-y-auto pr-2 pb-10 scrollbar-thin scrollbar-thumb-white/10 flex flex-col gap-8">
                {error && (
                    <motion.div initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} className="liquid-card p-12 text-center max-w-lg mx-auto flex flex-col items-center gap-6 border-red-500/30">
                        <AlertCircle size={48} className="text-red-400 drop-shadow-[0_0_15px_rgba(248,113,113,0.5)]" />
                        <div>
                            <h3 className="text-xl font-bold text-white mb-2">Store Connection Interrupted</h3>
                            <p className="text-white/50">{error}</p>
                        </div>
                        <button onClick={() => fetchPlugins(search, 1)} className="px-6 py-3 rounded-xl bg-white/5 hover:bg-white/10 border border-white/10 font-bold text-sm text-white transition-all">Retry Connection</button>
                    </motion.div>
                )}

                {loading && page === 1 && (
                    <div className="flex-1 flex flex-col items-center justify-center opacity-70 gap-5 min-h-[400px]">
                        <div className="relative">
                            <div className="absolute inset-0 bg-purple-500/30 blur-xl rounded-full" />
                            <Loader2 className="animate-spin text-purple-400 relative z-10" size={48} />
                        </div>
                        <p className="text-sm font-bold uppercase tracking-widest text-white/40 animate-pulse">Querying the Multiverse...</p>
                    </div>
                )}

                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
                    {filteredPlugins.map((res, idx) => (
                        <motion.div
                            initial={{ opacity: 0, scale: 0.95 }}
                            animate={{ opacity: 1, scale: 1 }}
                            transition={{ delay: idx * 0.05 }}
                            key={`${res.id}-${idx}`}
                            className="liquid-card p-6 flex flex-col gap-5 group hover:-translate-y-1 transition-transform duration-300"
                        >
                            {isInstalled(res.name) && (
                                <div className="absolute top-4 right-4 bg-green-500/20 text-green-400 px-3 py-1 rounded-full text-[10px] font-black uppercase tracking-wider flex items-center gap-1.5 border border-green-500/20">
                                    <CheckCircle size={10} /> Installed
                                </div>
                            )}
                            <div className="flex items-start gap-4">
                                <div className="w-16 h-16 rounded-2xl bg-black/40 overflow-hidden shrink-0 border border-white/10 shadow-lg">
                                    {res.icon?.url ? (
                                        <img src={`https://www.spigotmc.org/${res.icon.url}`} alt="" className="w-full h-full object-cover" />
                                    ) : <div className="w-full h-full flex items-center justify-center text-white/20"><Package size={28} /></div>}
                                </div>
                                <div className="flex-1 min-w-0 pt-1">
                                    <h3 className="font-bold text-lg text-white leading-tight truncate pr-16">{res.name}</h3>
                                    <div className="flex items-center gap-4 mt-2">
                                        <span className="flex items-center gap-1 text-xs font-bold text-yellow-400"><Star size={12} fill="currentColor" /> {res.rating?.average?.toFixed(1) || '0.0'}</span>
                                        <span className="text-xs font-medium text-white/40">{res.downloads?.toLocaleString() || '0'} DLs</span>
                                    </div>
                                </div>
                            </div>
                            <p className="text-sm text-white/60 leading-relaxed font-medium line-clamp-2 h-[2.8em]">{res.tag || 'A high-performance Minecraft resource'}</p>

                            <div className="mt-auto flex gap-3">
                                {!isInstalled(res.name) ? (
                                    <button
                                        className={`flex-1 py-3 rounded-xl font-bold text-xs uppercase tracking-wide flex items-center justify-center gap-2 transition-all shadow-lg ${installing === res.id
                                                ? 'bg-purple-600/50 cursor-wait'
                                                : 'bg-gradient-to-r from-purple-600 to-pink-600 shadow-purple-600/20 text-white hover:scale-[1.02]'
                                            }`}
                                        onClick={() => handleInstall(res)}
                                        disabled={installing !== null || uninstalling !== null}
                                    >
                                        {installing === res.id ? <Loader2 className="animate-spin" size={16} /> : <Download size={16} />}
                                        {installing === res.id ? 'Processing...' : 'Quick Install'}
                                    </button>
                                ) : (
                                    <button
                                        className={`flex-1 py-3 rounded-xl font-bold text-xs uppercase tracking-wide flex items-center justify-center gap-2 transition-all bg-gradient-to-r from-red-600 to-orange-600 shadow-lg shadow-red-600/20 text-white hover:scale-[1.02] ${uninstalling === res.id ? 'opacity-70 cursor-wait' : ''
                                            }`}
                                        onClick={() => handleUninstall(res)}
                                        disabled={installing !== null || uninstalling !== null}
                                    >
                                        {uninstalling === res.id ? <Loader2 className="animate-spin" size={16} /> : <Trash2 size={16} />}
                                        {uninstalling === res.id ? 'Deleting...' : 'Remove'}
                                    </button>
                                )}
                                <a href={`https://www.spigotmc.org/resources/${res.id}`} target="_blank" className="w-12 flex items-center justify-center rounded-xl bg-white/5 border border-white/10 text-white/40 hover:text-white hover:bg-white/10 transition-colors">
                                    <ExternalLink size={18} />
                                </a>
                            </div>
                        </motion.div>
                    ))}
                </div>

                {!loading && plugins.length > 0 && !showInstalledOnly && (
                    <button className="w-full py-6 rounded-2xl bg-white/5 hover:bg-white/10 border border-white/5 text-purple-400 font-black text-sm uppercase tracking-widest flex items-center justify-center gap-3 transition-colors mb-4" onClick={() => {
                        const next = page + 1;
                        setPage(next);
                        fetchPlugins(search, next);
                    }}>
                        Discover More <ArrowRight size={18} />
                    </button>
                )}
            </div>
        </div>
    );
};

export default PluginManager;
