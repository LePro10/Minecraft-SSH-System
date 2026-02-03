import React, { useState, useEffect } from 'react';
import { useServer } from '../context/ServerContext';
import { useToast } from '../context/ToastContext';
import { Search, Loader2, AlertCircle, Package, Filter, Sparkles, ArrowRight, ExternalLink, CheckCircle, Trash2, RefreshCw, Zap, Store, Cpu } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';

const PluginManager = () => {
    const { isConnected, config } = useServer();
    const { showToast } = useToast();
    const [plugins, setPlugins] = useState([]);
    const [installed, setInstalled] = useState([]);
    const [loading, setLoading] = useState(false);
    const [search, setSearch] = useState('');
    const [installedSearch, setInstalledSearch] = useState('');
    const [page, setPage] = useState(1);
    const [view, setView] = useState('store'); // 'store' or 'installed'

    const API_BASE = `http://${window.location.hostname}:3001`;

    useEffect(() => {
        if (isConnected) {
            fetchInstalled();
            if (view === 'store') fetchPlugins();
        }
    }, [isConnected, search, page, view]);

    const fetchPlugins = async () => {
        setLoading(true);
        try {
            const res = await fetch(`${API_BASE}/api/plugins/search?query=${encodeURIComponent(search)}&page=${page}`);
            const data = await res.json();
            const results = Array.isArray(data) ? data : (data.results || []);
            setPlugins(results);
        } catch (e) {
            console.error('Fetch plugins error:', e);
            showToast('Failed to fetch store plugins', 'error');
        } finally {
            setLoading(false);
        }
    };

    const fetchInstalled = async () => {
        try {
            const res = await fetch(`${API_BASE}/api/plugins/installed?serverPath=${encodeURIComponent(config.path)}`);
            const data = await res.json();
            setInstalled(Array.isArray(data) ? data : []);
        } catch (e) {
            console.error('Failed to fetch installed plugins:', e);
        }
    };

    const handleInstall = async (plugin) => {
        try {
            showToast(`Installing ${plugin.name}...`, 'info');
            const res = await fetch(`${API_BASE}/api/plugins/install`, {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({
                    resourceId: plugin.id,
                    resourceName: plugin.name,
                    serverPath: config.path
                })
            });
            if (res.ok) {
                showToast('Installed successfully!', 'success');
                setTimeout(fetchInstalled, 1500);
            } else {
                const data = await res.json();
                showToast(data.error || 'Installation failed', 'error');
            }
        } catch (e) {
            showToast('Error during installation', 'error');
        }
    };

    const handleUninstall = async (fileName) => {
        if (!confirm(`Uninstall ${fileName}?`)) return;
        try {
            const res = await fetch(`${API_BASE}/api/plugins/uninstall`, {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ resourceName: fileName.replace('.jar', ''), serverPath: config.path })
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

    const filteredInstalled = installed.filter(name =>
        name.toLowerCase().includes(installedSearch.toLowerCase())
    );

    const filteredStore = plugins.filter(p =>
        !installed.some(i => i.toLowerCase().includes(p.name.toLowerCase()))
    );

    return (
        <div className="h-full w-full overflow-y-auto overflow-x-hidden scrollbar-thin scrollbar-thumb-white/10 relative bg-[#050505]/20">
            <div className="p-8 flex flex-col gap-10 max-w-[1400px] mx-auto">
                <header className="liquid-card p-8 flex flex-wrap items-center justify-between gap-8 shrink-0 relative z-10 border-white/10 backdrop-blur-3xl">
                    <div className="flex items-center gap-6">
                        <div className="w-16 h-16 rounded-2xl bg-gradient-to-br from-[var(--accent-primary)] to-[var(--accent-secondary,var(--accent-primary))] shadow-[0_0_40px_rgba(0,0,0,0.5)] flex items-center justify-center text-white relative group overflow-hidden">
                            <div className="absolute inset-0 blur-xl opacity-30 bg-[var(--accent-primary)] group-hover:opacity-50 transition-opacity" />
                            <Package size={32} className="relative z-10" />
                        </div>
                        <div>
                            <h2 className="text-3xl font-black text-white tracking-tighter">Plugin Architect</h2>
                            <div className="flex items-center gap-3 mt-1.5">
                                <span className="flex items-center gap-1.5 text-[10px] font-black uppercase tracking-widest text-[var(--accent-primary)] font-mono bg-[var(--accent-primary)]/10 px-3 py-1 rounded border border-[var(--accent-primary)]/10">Spiget Repository Active</span>
                                <span className="flex items-center gap-1.5 text-[10px] font-black uppercase tracking-widest text-white/20 font-mono bg-white/5 px-3 py-1 rounded border border-white/5">{installed.length} Active Nodes</span>
                            </div>
                        </div>
                    </div>

                    <div className="flex items-center gap-6 bg-black/40 p-1.5 rounded-2xl border border-white/5">
                        <button
                            onClick={() => setView('store')}
                            className={`px-6 py-2.5 rounded-xl flex items-center gap-2 text-[10px] font-black uppercase tracking-[0.2em] transition-all ${view === 'store' ? 'bg-[var(--accent-primary)] text-black shadow-lg shadow-[var(--accent-primary)]/20' : 'text-white/40 hover:text-white hover:bg-white/5'}`}
                        >
                            <Store size={14} /> Marketplace
                        </button>
                        <button
                            onClick={() => setView('installed')}
                            className={`px-6 py-2.5 rounded-xl flex items-center gap-2 text-[10px] font-black uppercase tracking-[0.2em] transition-all ${view === 'installed' ? 'bg-[var(--accent-primary)] text-black shadow-lg shadow-[var(--accent-primary)]/20' : 'text-white/40 hover:text-white hover:bg-white/5'}`}
                        >
                            <Cpu size={14} /> My Extensions
                        </button>
                    </div>
                </header>

                <main className="flex flex-col gap-10">
                    <AnimatePresence mode="wait">
                        {view === 'store' ? (
                            <motion.div
                                key="store"
                                initial={{ opacity: 0, y: 20 }}
                                animate={{ opacity: 1, y: 0 }}
                                exit={{ opacity: 0, y: -20 }}
                                className="flex flex-col gap-8"
                            >
                                <div className="flex items-center justify-between gap-6 px-4">
                                    <div className="relative flex-1 group max-w-xl">
                                        <Search size={20} className="absolute left-5 top-1/2 -translate-y-1/2 text-white/20 group-focus-within:text-[var(--accent-primary)] transition-colors" />
                                        <input
                                            className="w-full h-16 pl-14 pr-6 rounded-2xl bg-black/40 border border-white/5 focus:border-[var(--accent-primary)]/30 outline-none text-white text-base font-medium transition-all placeholder:text-white/10"
                                            placeholder="Search commercial and free extensions..."
                                            value={search}
                                            onChange={e => { setSearch(e.target.value); setPage(1); }}
                                        />
                                    </div>
                                    <button onClick={fetchPlugins} className="h-16 w-16 rounded-2xl bg-white/5 hover:bg-white/10 border border-white/5 flex items-center justify-center text-white/30 hover:text-white transition-all">
                                        <RefreshCw size={24} className={loading ? 'animate-spin text-[var(--accent-primary)]' : ''} />
                                    </button>
                                </div>

                                <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                                    {loading && plugins.length === 0 && (
                                        <div className="col-span-full py-40 flex flex-col items-center justify-center gap-4 text-white/20">
                                            <Loader2 className="animate-spin" size={48} />
                                            <span className="text-[10px] font-black uppercase tracking-[0.3em]">Accessing External Repositories...</span>
                                        </div>
                                    )}
                                    {filteredStore.map(p => (
                                        <motion.div
                                            key={p.id}
                                            layout
                                            className="liquid-card p-8 hover:bg-white/[0.04] transition-all group border-white/5 flex flex-col gap-6"
                                        >
                                            <div className="flex gap-8">
                                                <div className="w-24 h-24 rounded-3xl bg-black/60 border border-white/10 flex items-center justify-center overflow-hidden shrink-0 group-hover:border-[var(--accent-primary)]/40 transition-all shadow-2xl relative">
                                                    {p.icon && p.icon.url ? (
                                                        <img src={`https://api.spiget.org/v2/resources/${p.id}/icon/data`} className="w-full h-full object-cover" />
                                                    ) : (
                                                        <Package className="text-white/10" size={40} />
                                                    )}
                                                    <div className="absolute inset-0 bg-gradient-to-t from-black/60 to-transparent opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center">
                                                        <ExternalLink className="text-white" size={20} />
                                                    </div>
                                                </div>
                                                <div className="flex-1 flex flex-col gap-3">
                                                    <div className="flex items-center justify-between">
                                                        <div className="flex items-center gap-3">
                                                            <h4 className="text-xl font-black text-white group-hover:text-[var(--accent-primary)] transition-colors">{p.name}</h4>
                                                            {p.premium && <div className="px-2 py-1 rounded bg-amber-500/20 text-amber-500 text-[9px] font-black uppercase tracking-tighter border border-amber-500/10">Premium</div>}
                                                        </div>
                                                        <a
                                                            href={`https://www.spigotmc.org/resources/${p.id}`}
                                                            target="_blank"
                                                            rel="noopener noreferrer"
                                                            className="p-2.5 rounded-xl bg-white/5 hover:bg-white/10 text-white/40 hover:text-white transition-all border border-white/5"
                                                            title="View on Spigot"
                                                        >
                                                            <ExternalLink size={18} />
                                                        </a>
                                                    </div>
                                                    <p className="text-sm text-white/40 leading-relaxed line-clamp-3 font-medium">{p.tagline || 'No official description available.'}</p>
                                                    <div className="flex items-center gap-6 mt-2">
                                                        <span className="text-[10px] font-black text-white/20 flex items-center gap-2 uppercase tracking-widest"><Zap size={12} className="text-emerald-500" /> {p.downloads.toLocaleString()} Downloads</span>
                                                        <span className="text-[10px] font-black text-[var(--accent-primary)] uppercase tracking-widest bg-[var(--accent-primary)]/5 px-2 py-0.5 rounded">{p.version?.name || 'V.LATEST'}</span>
                                                    </div>
                                                </div>
                                            </div>

                                            <div className="flex items-center gap-4 border-t border-white/5 pt-6 mt-auto">
                                                <button
                                                    onClick={() => handleInstall(p)}
                                                    className="flex-1 py-4 rounded-2xl bg-[var(--accent-primary)] text-black text-[11px] font-black uppercase tracking-[0.2em] hover:saturate-150 transition-all active:scale-95 shadow-lg shadow-[var(--accent-primary)]/10 flex items-center justify-center gap-2"
                                                >
                                                    Deploy Extension <ArrowRight size={14} />
                                                </button>
                                            </div>
                                        </motion.div>
                                    ))}
                                </div>

                                <div className="flex items-center justify-center gap-6 mt-12 mb-20">
                                    <button
                                        className="px-8 py-4 rounded-2xl bg-white/5 border border-white/5 text-white/40 hover:text-white hover:bg-white/10 disabled:opacity-20 text-[10px] font-black uppercase tracking-[0.2em] transition-all"
                                        onClick={() => { setPage(p => Math.max(1, p - 1)); window.scrollTo(0, 0); }}
                                        disabled={page === 1}
                                    >
                                        Revoke Phase
                                    </button>
                                    <div className="px-6 py-4 bg-black/60 rounded-2xl border border-white/5 text-[11px] font-mono text-white/20 uppercase tracking-widest">Sector {page}</div>
                                    <button
                                        className="px-8 py-4 rounded-2xl bg-white/5 border border-white/5 text-white/40 hover:text-white hover:bg-white/10 disabled:opacity-20 text-[10px] font-black uppercase tracking-[0.2em] transition-all"
                                        onClick={() => { setPage(p => p + 1); window.scrollTo(0, 0); }}
                                        disabled={plugins.length < 24}
                                    >
                                        Next Phase
                                    </button>
                                </div>
                            </motion.div>
                        ) : (
                            <motion.div
                                key="installed"
                                initial={{ opacity: 0, scale: 0.95 }}
                                animate={{ opacity: 1, scale: 1 }}
                                exit={{ opacity: 0, scale: 0.95 }}
                                className="flex flex-col gap-8"
                            >
                                <div className="flex items-center justify-between px-4">
                                    <div className="flex items-center gap-4">
                                        <div className="w-2.5 h-8 rounded-full bg-[var(--accent-primary)] shadow-[0_0_20px_var(--accent-primary)]" />
                                        <h3 className="text-sm font-black uppercase tracking-[0.3em] text-white/60">Local Memory Unit // {installed.length} Active</h3>
                                    </div>
                                    <div className="relative group w-[300px]">
                                        <Search size={16} className="absolute left-4 top-1/2 -translate-y-1/2 text-white/10 group-focus-within:text-[var(--accent-primary)] transition-colors" />
                                        <input
                                            className="w-full bg-black/40 border border-white/5 rounded-xl pl-12 pr-4 py-3 text-[11px] text-white placeholder:text-white/10 outline-none focus:border-[var(--accent-primary)]/20 transition-all font-mono uppercase tracking-widest"
                                            placeholder="Sector Search..."
                                            value={installedSearch}
                                            onChange={e => setInstalledSearch(e.target.value)}
                                        />
                                    </div>
                                </div>

                                <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                                    {installed.length === 0 && (
                                        <div className="col-span-full liquid-card py-40 flex flex-col items-center justify-center text-white/5 border-dashed border-2">
                                            <Cpu size={64} className="mb-6 opacity-20" />
                                            <div className="text-[12px] uppercase font-black tracking-[0.5em] text-center">Zero Logic Elements Detected <br /><span className="mt-2 block opacity-30 font-mono italic">Sector is currently void</span></div>
                                        </div>
                                    )}
                                    {filteredInstalled.map((pName, i) => (
                                        <motion.div key={i} layout initial={{ opacity: 0, x: -20 }} animate={{ opacity: 1, x: 0 }} className="liquid-card p-6 flex items-center justify-between group border-white/5 hover:bg-white/[0.04]">
                                            <div className="flex items-center gap-6">
                                                <div className="w-16 h-16 rounded-2xl bg-white/5 flex items-center justify-center text-[var(--accent-primary)] group-hover:bg-[var(--accent-primary)]/10 transition-all shadow-inner border border-white/5">
                                                    <Sparkles size={28} />
                                                </div>
                                                <div>
                                                    <div className="text-lg font-black text-white shrink-0 capitalize tracking-tight group-hover:text-[var(--accent-primary)] transition-colors">{pName.replace('.jar', '').replace(/[-_]/g, ' ')}</div>
                                                    <div className="text-[10px] font-mono text-white/20 lowercase tracking-normal truncate max-w-[200px] mt-1">{pName}</div>
                                                </div>
                                            </div>
                                            <div className="flex items-center gap-4">
                                                <div className="px-3 py-1.5 rounded-lg bg-emerald-500/10 text-emerald-400 text-[10px] font-black uppercase tracking-widest flex items-center gap-2 border border-emerald-500/20">
                                                    <CheckCircle size={12} /> Unit Active
                                                </div>
                                                <button onClick={() => handleUninstall(pName)} className="w-12 h-12 rounded-xl bg-red-500/10 text-red-500 opacity-0 group-hover:opacity-100 transition-all hover:bg-red-500/20 flex items-center justify-center shadow-lg shadow-red-900/10 border border-red-500/10">
                                                    <Trash2 size={20} />
                                                </button>
                                            </div>
                                        </motion.div>
                                    ))}
                                </div>
                            </motion.div>
                        )}
                    </AnimatePresence>
                </main>
                <div className="h-32 shrink-0" />
            </div>
        </div>
    );
};

export default PluginManager;
