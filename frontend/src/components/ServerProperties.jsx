import React, { useState, useEffect } from 'react';
import { useServer } from '../context/ServerContext';
import { Save, RefreshCw, Info, Settings, Search, Loader2, AlertCircle, Shield, Globe, Zap, Cpu, Sliders } from 'lucide-react';

const ServerProperties = () => {
    const { config, isConnected } = useServer();
    const [properties, setProperties] = useState({});
    const [metadata, setMetadata] = useState({});
    const [loading, setLoading] = useState(false);
    const [saving, setSaving] = useState(false);
    const [error, setError] = useState(null);
    const [errors, setErrors] = useState({});
    const [filter, setFilter] = useState('');

    const API_BASE = import.meta.env.VITE_API_URL || 'http://localhost:3001';

    const fetchProperties = async () => {
        if (!isConnected) {
            setError('SSH is not connected. Please connect in the Dashboard first.');
            return;
        }
        setLoading(true);
        setError(null);
        try {
            const res = await fetch(`${API_BASE}/api/mc/properties?path=${encodeURIComponent(config.path)}`);
            const data = await res.json();
            if (res.ok) {
                setProperties(data.values || {});
                setMetadata(data.metadata || {});
            } else {
                setError(data.error || 'Failed to load properties.');
                setProperties({});
            }
        } catch (e) {
            console.error('Fetch error:', e);
            setError('Could not reach the backend server.');
            setProperties({});
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        fetchProperties();
    }, [isConnected, config.path]);

    const validate = (key, val) => {
        const meta = metadata[key];
        if (!meta) return true;
        if (meta.type === 'number') {
            const n = parseInt(val);
            if (isNaN(n)) return false;
            if (meta.min !== undefined && n < meta.min) return false;
            if (meta.max !== undefined && n > meta.max) return false;
        }
        return true;
    };

    const updateProp = (key, val) => {
        if (!validate(key, val)) {
            setErrors(prev => ({ ...prev, [key]: true }));
        } else {
            setErrors(prev => {
                const next = { ...prev };
                delete next[key];
                return next;
            });
        }
        setProperties(prev => ({ ...prev, [key]: val }));
    };

    const handleSave = async () => {
        if (Object.keys(errors).length > 0) return alert('Please fix red errors before saving.');
        setSaving(true);
        try {
            const res = await fetch(`${API_BASE}/api/mc/properties`, {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ path: config.path, properties })
            });
            if (res.ok) alert('Settings saved successfully!');
            else {
                const data = await res.json();
                alert(`Save Failed: ${data.error}`);
            }
        } catch (e) { alert('Connection error while saving.'); }
        finally { setSaving(false); }
    };

    const sections = [
        {
            title: 'Gameplay Essentials',
            keys: ['gamemode', 'difficulty', 'hardcore', 'pvp', 'level-name', 'level-type', 'max-players'],
            icon: <Zap size={18} />
        },
        {
            title: 'World & Physics',
            keys: ['spawn-monsters', 'spawn-animals', 'spawn-npcs', 'allow-nether', 'view-distance', 'simulation-distance', 'spawn-protection'],
            icon: <Globe size={18} />
        },
        {
            title: 'Network & Security',
            keys: ['online-mode', 'white-list', 'enforce-whitelist', 'server-port', 'allow-flight', 'enable-query', 'enable-rcon', 'use-native-transport'],
            icon: <Shield size={18} />
        }
    ];

    const groupedKeys = new Set(sections.flatMap(s => s.keys));
    const advancedKeys = Object.keys(properties).filter(k => !groupedKeys.has(k));

    const renderInput = (key) => {
        const value = properties[key];
        const meta = metadata[key] || { type: 'string', desc: 'Custom property from configuration file.' };
        if (filter && !key.toLowerCase().includes(filter.toLowerCase())) return null;

        return (
            <div key={key} className={`prop-row ${errors[key] ? 'has-error' : ''}`}>
                <div className="prop-name-group">
                    <span className="prop-name">{key.replace(/-/g, ' ')}</span>
                    <div className="prop-info-trigger">
                        <Info size={14} className="info-icon" />
                        <div className="prop-tooltip">{meta.desc}</div>
                    </div>
                </div>

                <div className="prop-control">
                    {meta.type === 'boolean' || value === 'true' || value === 'false' ? (
                        <button
                            className={`prop-toggle ${value === 'true' ? 'on' : 'off'}`}
                            onClick={() => updateProp(key, value === 'true' ? 'false' : 'true')}
                        >
                            <div className="knob" />
                        </button>
                    ) : meta.type === 'enum' ? (
                        <select
                            className="glass-input prop-select"
                            value={value}
                            onChange={e => updateProp(key, e.target.value)}
                        >
                            {meta.options.map(opt => <option key={opt} value={opt}>{opt.replace('minecraft:', '')}</option>)}
                        </select>
                    ) : (
                        <input
                            className="glass-input prop-input"
                            type={meta.type === 'number' ? 'number' : 'text'}
                            value={value}
                            onChange={e => updateProp(key, e.target.value)}
                        />
                    )}
                </div>
            </div>
        );
    };

    return (
        <div className="properties-container">
            <header className="properties-header glass-panel">
                <div className="header-main">
                    <div className="header-icon-box">
                        <Sliders size={24} />
                    </div>
                    <div className="header-text">
                        <h2>Engine Properties</h2>
                        <span className="file-badge">server.properties</span>
                    </div>
                </div>

                <div className="header-actions">
                    <div className="search-box glass-panel">
                        <Search size={16} />
                        <input placeholder="Search properties..." value={filter} onChange={e => setFilter(e.target.value)} />
                    </div>
                    <button className="glass-button refresh-btn" onClick={fetchProperties}>
                        <RefreshCw className={loading ? 'spin' : ''} size={18} />
                    </button>
                    <button className="glass-button save-btn" onClick={handleSave} disabled={saving}>
                        {saving ? <Loader2 className="spin" size={18} /> : <Save size={18} />}
                        Save Changes
                    </button>
                </div>
            </header>

            {error ? (
                <div className="error-state glass-panel">
                    <AlertCircle size={48} className="err-color" />
                    <h3>Configuration Error</h3>
                    <p>{error}</p>
                    <button onClick={fetchProperties} className="glass-button">Retry Connection</button>
                </div>
            ) : Object.keys(properties).length === 0 && !loading ? (
                <div className="error-state glass-panel">
                    <Info size={48} />
                    <h3>Properties Empty</h3>
                    <p>No configuration properties found at the specified path.</p>
                </div>
            ) : (
                <div className="properties-scroll">
                    <div className="properties-grid">
                        {sections.map(section => {
                            const visibleKeys = section.keys.filter(k => properties[k] !== undefined);
                            if (visibleKeys.length === 0 && !filter) return null;

                            return (
                                <section key={section.title} className="glass-panel prop-section">
                                    <div className="section-title">
                                        <div className="section-icon">{section.icon}</div>
                                        <h3>{section.title}</h3>
                                    </div>
                                    <div className="section-content">
                                        {visibleKeys.map(renderInput)}
                                    </div>
                                </section>
                            );
                        })}

                        {advancedKeys.length > 0 && (
                            <section className="glass-panel prop-section advanced">
                                <div className="section-title">
                                    <div className="section-icon"><Cpu size={18} /></div>
                                    <h3>Advanced & Technical</h3>
                                </div>
                                <div className="section-content advanced-grid">
                                    {advancedKeys.map(renderInput)}
                                </div>
                            </section>
                        )}
                    </div>
                </div>
            )}

            {loading && (
                <div className="loading-overlay">
                    <Loader2 className="spin" size={48} />
                    <p>Accessing Engine Records...</p>
                </div>
            )}

            <style jsx>{`
                .properties-container { height: 100%; display: flex; flex-direction: column; gap: 32px; overflow: hidden; padding: 10px; }
                .properties-header { padding: 24px 40px; display: flex; justify-content: space-between; align-items: center; background: var(--bg-panel); }
                .header-main { display: flex; align-items: center; gap: 20px; }
                .header-icon-box { background: var(--accent-gradient); color: white; padding: 12px; border-radius: 16px; box-shadow: 0 8px 16px rgba(0,0,0,0.2); }
                .header-text h2 { margin: 0; font-size: 1.4rem; font-weight: 800; letter-spacing: -1px; }
                .file-badge { font-family: var(--font-mono); font-size: 0.7rem; color: var(--accent-primary); background: rgba(var(--accent-primary), 0.1); padding: 2px 8px; border-radius: 4px; font-weight: 700; text-transform: uppercase; }
                
                .header-actions { display: flex; gap: 15px; }
                .search-box { display: flex; align-items: center; gap: 12px; padding: 0 20px; height: 50px; width: 300px; background: rgba(0,0,0,0.2); }
                .search-box input { flex: 1; background: transparent; border: none; color: white; outline: none; font-size: 0.95rem; }
                
                .properties-scroll { flex: 1; overflow-y: auto; padding-right: 12px; scrollbar-width: thin; }
                .properties-grid { display: grid; grid-template-columns: repeat(auto-fill, minmax(450px, 1fr)); gap: 24px; padding-bottom: 40px; }
                .prop-section { padding: 28px; }
                .section-title { display: flex; align-items: center; gap: 15px; border-bottom: 2px solid rgba(255,255,255,0.03); padding-bottom: 15px; margin-bottom: 20px; }
                .section-icon { color: var(--accent-primary); }
                .section-title h3 { margin: 0; font-size: 0.85rem; font-weight: 900; text-transform: uppercase; letter-spacing: 1.5px; opacity: 0.7; }

                .prop-row { display: flex; align-items: center; justify-content: space-between; padding: 10px 16px; border-radius: 12px; transition: 0.2s; background: rgba(255,255,255,0.015); margin-bottom: 8px; }
                .prop-row:hover { background: rgba(255,255,255,0.04); }
                
                .prop-name-group { display: flex; align-items: center; gap: 12px; }
                .prop-name { font-size: 0.9rem; font-weight: 700; color: var(--text-primary); text-transform: capitalize; }
                .prop-info-trigger { position: relative; color: var(--text-secondary); opacity: 0.4; cursor: help; }
                .prop-tooltip { visibility: hidden; opacity: 0; position: absolute; left: 50%; bottom: 150%; transform: translateX(-50%); width: 260px; background: rgba(0,0,0,0.9); border: 1px solid var(--glass-border); padding: 15px; border-radius: 12px; font-size: 0.8rem; line-height: 1.5; color: white; z-index: 100; transition: 0.3s; pointer-events: none; backdrop-filter: blur(10px); }
                .prop-info-trigger:hover .prop-tooltip { visibility: visible; opacity: 1; transform: translateX(-50%) translateY(-10px); }

                .prop-toggle { width: 44px; height: 24px; border-radius: 50px; border: none; padding: 3px; cursor: pointer; position: relative; transition: 0.4s; }
                .prop-toggle.on { background: #34c759; box-shadow: 0 0 15px rgba(52, 199, 89, 0.3); }
                .prop-toggle.off { background: rgba(255,255,255,0.1); }
                .knob { width: 18px; height: 18px; background: white; border-radius: 50%; transition: 0.4s cubic-bezier(0.16, 1, 0.3, 1); }
                .prop-toggle.on .knob { transform: translateX(20px); }
                
                .prop-select, .prop-input { min-width: 140px; padding: 8px 12px; font-size: 0.85rem; text-align: right; }
                .advanced { grid-column: 1 / -1; }
                .advanced-grid { display: grid; grid-template-columns: 1fr 1fr; gap: 0 20px; }
                @media (max-width: 1100px) { .advanced-grid { grid-template-columns: 1fr; } }

                .error-state { margin: 60px auto; display: flex; flex-direction: column; align-items: center; gap: 24px; padding: 60px; max-width: 500px; text-align: center; }
                .err-color { color: #ff3b30; }
                
                .loading-overlay { flex: 1; display: flex; flex-direction: column; align-items: center; justify-content: center; opacity: 0.5; gap: 20px; }
                .spin { animation: spin 1s linear infinite; }
                @keyframes spin { from { transform: rotate(0deg); } to { transform: rotate(360deg); } }
            `}</style>
        </div>
    );
};

export default ServerProperties;

