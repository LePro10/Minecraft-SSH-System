import React, { useState, useEffect } from 'react';
import { useServer } from '../context/ServerContext';
import { useToast } from '../context/ToastContext';
import { Search, Download, Star, ExternalLink, Loader2, CheckCircle, Package, ArrowRight, AlertCircle, Trash2, Filter, Sparkles } from 'lucide-react';

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
                showToast(`${plugin.name} integrated successfully.`, 'success');
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
                showToast(`${plugin.name} purged from archive.`, 'success');
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
        <div className="store-container">
            <header className="store-header glass-panel">
                <div className="store-branding">
                    <div className="store-icon-wrapper">
                        <Package size={24} />
                    </div>
                    <div>
                        <h2>Spiget Plugin Store</h2>
                        <div className="store-badge"><Sparkles size={12} /> Pro Installer</div>
                    </div>
                </div>

                <div className="store-actions">
                    <button
                        className={`filter-btn glass-panel ${showInstalledOnly ? 'active' : ''}`}
                        onClick={() => setShowInstalledOnly(!showInstalledOnly)}
                    >
                        <Filter size={18} />
                        <span>Filter Installed</span>
                    </button>

                    <div className="search-container glass-panel">
                        <Search size={18} className="search-icon" />
                        <input
                            placeholder="Find your next plugin..."
                            value={search}
                            onChange={e => setSearch(e.target.value)}
                            onKeyDown={e => e.key === 'Enter' && fetchPlugins(search, 1)}
                        />
                        <button className="glass-button search-btn" onClick={() => fetchPlugins(search, 1)}>Search</button>
                    </div>
                </div>
            </header>

            <div className="store-content">
                {error && (
                    <div className="error-card glass-panel">
                        <AlertCircle size={48} className="err-icon" />
                        <h3>Store Connection Interrupted</h3>
                        <p>{error}</p>
                        <button onClick={() => fetchPlugins(search, 1)} className="glass-button">Retry Connection</button>
                    </div>
                )}

                {loading && page === 1 && (
                    <div className="loading-state">
                        <div className="loader-orbit">
                            <Loader2 className="spin" size={40} />
                        </div>
                        <p>Querying the Multiverse...</p>
                    </div>
                )}

                <div className="resource-grid">
                    {filteredPlugins.map((res, idx) => (
                        <div key={`${res.id}-${idx}`} className="res-card glass-panel">
                            {isInstalled(res.name) && (
                                <div className="installed-chip">
                                    <CheckCircle size={10} /> Installed
                                </div>
                            )}
                            <div className="card-top">
                                <div className="plugin-icon-box">
                                    {res.icon?.url ? (
                                        <img src={`https://www.spigotmc.org/${res.icon.url}`} alt="" />
                                    ) : <Package size={28} className="placeholder" />}
                                </div>
                                <div className="plugin-info">
                                    <h3>{res.name}</h3>
                                    <div className="meta-row">
                                        <span className="rating"><Star size={12} fill="var(--accent-primary)" color="var(--accent-primary)" /> {res.rating?.average?.toFixed(1) || '0.0'}</span>
                                        <span className="downloads">{res.downloads?.toLocaleString() || '0'} DLs</span>
                                    </div>
                                </div>
                            </div>
                            <p className="description">{res.tag || 'A high-performance Minecraft resource'}</p>

                            <div className="card-footer">
                                {!isInstalled(res.name) ? (
                                    <button
                                        className={`glass-button install-btn ${installing === res.id ? 'loading' : ''}`}
                                        onClick={() => handleInstall(res)}
                                        disabled={installing !== null || uninstalling !== null}
                                    >
                                        {installing === res.id ? <Loader2 className="spin" size={16} /> : <Download size={16} />}
                                        {installing === res.id ? 'Processing...' : 'Quick Install'}
                                    </button>
                                ) : (
                                    <button
                                        className="glass-button uninstall-btn"
                                        onClick={() => handleUninstall(res)}
                                        disabled={installing !== null || uninstalling !== null}
                                    >
                                        {uninstalling === res.id ? <Loader2 className="spin" size={16} /> : <Trash2 size={16} />}
                                        {uninstalling === res.id ? 'Deleting...' : 'Remove'}
                                    </button>
                                )}
                                <a href={`https://www.spigotmc.org/resources/${res.id}`} target="_blank" className="external-btn glass-panel">
                                    <ExternalLink size={18} />
                                </a>
                            </div>
                        </div>
                    ))}
                </div>

                {!loading && plugins.length > 0 && !showInstalledOnly && (
                    <button className="glass-panel load-more-btn" onClick={() => {
                        const next = page + 1;
                        setPage(next);
                        fetchPlugins(search, next);
                    }}>
                        Discover More <ArrowRight size={18} />
                    </button>
                )}
            </div>

            <style jsx>{`
                .store-container { height: 100%; display: flex; flex-direction: column; gap: 32px; overflow: hidden; padding: 10px; }
                .store-header { padding: 24px 40px; display: flex; justify-content: space-between; align-items: center; background: var(--bg-panel); }
                .store-branding { display: flex; align-items: center; gap: 20px; }
                .store-icon-wrapper { background: var(--accent-gradient); color: white; padding: 12px; border-radius: 16px; box-shadow: 0 8px 16px rgba(0,0,0,0.2); }
                .store-branding h2 { margin: 0; font-size: 1.4rem; font-weight: 800; letter-spacing: -1px; }
                .store-badge { display: flex; align-items: center; gap: 6px; font-size: 0.7rem; font-weight: 900; text-transform: uppercase; color: var(--accent-primary); margin-top: 2px; }
                
                .store-actions { display: flex; align-items: center; gap: 20px; }
                .filter-btn { border: none; padding: 0 20px; height: 50px; display: flex; align-items: center; gap: 10px; font-weight: 700; cursor: pointer; color: var(--text-secondary); background: rgba(255,255,255,0.02); }
                .filter-btn.active { color: var(--accent-primary); border-color: var(--accent-primary); background: rgba(var(--accent-primary), 0.05); }
                
                .search-container { display: flex; align-items: center; padding-left: 20px; height: 50px; min-width: 450px; background: rgba(0,0,0,0.2); border: 1px solid rgba(255,255,255,0.05); }
                .search-icon { color: var(--text-secondary); }
                .search-container input { flex: 1; background: transparent; border: none; color: white; outline: none; font-size: 1rem; padding: 0 10px; }
                .search-btn { height: 100%; border-radius: 0; min-width: 100px; }

                .store-content { flex: 1; overflow-y: auto; padding-right: 12px; display: flex; flex-direction: column; gap: 32px; scrollbar-width: thin; }
                .loading-state { flex: 1; display: flex; flex-direction: column; align-items: center; justify-content: center; opacity: 0.5; gap: 20px; }
                .spin { animation: spin 1s linear infinite; }
                @keyframes spin { from { transform: rotate(0deg); } to { transform: rotate(360deg); } }

                .resource-grid { display: grid; grid-template-columns: repeat(auto-fill, minmax(340px, 1fr)); gap: 24px; padding: 4px; }
                .res-card { padding: 28px; display: flex; flex-direction: column; gap: 24px; transition: transform 0.3s; }
                .res-card:hover { transform: translateY(-8px); }
                
                .installed-chip { position: absolute; top: 16px; right: 16px; background: #34c759; color: white; padding: 4px 10px; font-size: 0.65rem; font-weight: 900; border-radius: 20px; display: flex; align-items: center; gap: 6px; }
                .card-top { display: flex; gap: 20px; align-items: center; }
                .plugin-icon-box { width: 64px; height: 64px; border-radius: 18px; background: rgba(0,0,0,0.4); overflow: hidden; display: flex; align-items: center; justify-content: center; }
                .plugin-icon-box img { width: 100%; height: 100%; object-fit: cover; }
                .placeholder { opacity: 0.2; }
                
                .plugin-info h3 { margin: 0; font-size: 1.1rem; font-weight: 800; display: -webkit-box; -webkit-line-clamp: 1; -webkit-box-orient: vertical; overflow: hidden; }
                .meta-row { display: flex; gap: 15px; margin-top: 4px; }
                .rating { display: flex; align-items: center; gap: 4px; font-size: 0.8rem; color: var(--accent-primary); font-weight: 700; }
                .downloads { font-size: 0.8rem; color: var(--text-secondary); }

                .description { margin: 0; font-size: 0.9rem; color: var(--text-secondary); line-height: 1.6; height: 3.2em; overflow: hidden; }
                .card-footer { display: flex; gap: 12px; }
                .install-btn { flex: 1; }
                .uninstall-btn { flex: 1; background: linear-gradient(135deg, #ff3b30, #ff453a); }
                .external-btn { width: 50px; height: 50px; display: flex; align-items: center; justify-content: center; transition: 0.2s; border: none; cursor: pointer; color: var(--text-secondary); }
                .external-btn:hover { color: white; background: rgba(255,255,255,0.1); }

                .load-more-btn { padding: 24px; text-align: center; border: none; cursor: pointer; font-weight: 800; display: flex; align-items: center; justify-content: center; gap: 15px; background: rgba(255,255,255,0.03); }
                .load-more-btn:hover { background: rgba(255,255,255,0.08); color: var(--accent-primary); }

                .error-card { margin: 40px auto; padding: 60px; text-align: center; max-width: 500px; display: flex; flex-direction: column; align-items: center; gap: 24px; }
                .err-icon { color: #ff3b30; }
            `}</style>
        </div>
    );
};

export default PluginManager;
