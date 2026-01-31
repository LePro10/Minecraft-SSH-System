import React, { useState, useEffect } from 'react';
import { useServer } from '../context/ServerContext';
import { Save, RefreshCw, Info, Settings, Search, Loader2, AlertCircle, Shield, Globe, Zap, Cpu, Sliders, Check } from 'lucide-react';
import { useToast } from '../context/ToastContext';
import { motion, AnimatePresence } from 'framer-motion';

const ServerProperties = ({ setDirty }) => {
    const { config, isConnected } = useServer();
    const [properties, setProperties] = useState({});
    const [metadata, setMetadata] = useState({});
    const [loading, setLoading] = useState(false);
    const [saving, setSaving] = useState(false);
    const [error, setError] = useState(null);
    const [errors, setErrors] = useState({});
    const [filter, setFilter] = useState('');
    const [isDirty, setIsDirty] = useState(false);
    const { showToast } = useToast();

    useEffect(() => {
        if (setDirty) setDirty(isDirty);
    }, [isDirty, setDirty]);

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
                setIsDirty(false);
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
        setIsDirty(true);
    };

    const handleSave = async () => {
        if (Object.keys(errors).length > 0) return showToast('Resolve validation errors first.', 'error');
        setSaving(true);
        try {
            const res = await fetch(`${API_BASE}/api/mc/properties`, {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ path: config.path, properties })
            });
            if (res.ok) {
                showToast('Engine configuration updated.', 'success');
                setIsDirty(false);
            } else {
                const data = await res.json();
                showToast(`Sync Failed: ${data.error}`, 'error');
            }
        } catch (e) { showToast('Uplink lost during sync.', 'error'); }
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
            <div key={key} className={`flex items-center justify-between p-3 rounded-xl transition-colors ${errors[key] ? 'bg-red-500/10 border border-red-500/30' : 'bg-white/[0.03] hover:bg-white/[0.06]'}`}>
                <div className="flex items-center gap-3">
                    <span className="font-bold text-sm text-white capitalize">{key.replace(/-/g, ' ')}</span>
                    <div className="group relative">
                        <Info size={14} className="text-white/30 hover:text-white/60 cursor-help transition-colors" />
                        <div className="absolute left-1/2 bottom-full mb-2 -translate-x-1/2 w-64 p-3 rounded-xl bg-black/90 backdrop-blur-xl border border-white/10 text-xs text-white/80 opacity-0 group-hover:opacity-100 pointer-events-none transition-opacity z-50 shadow-2xl">
                            {meta.desc}
                        </div>
                    </div>
                </div>

                <div>
                    {meta.type === 'boolean' || value === 'true' || value === 'false' ? (
                        <button
                            className={`w-11 h-6 rounded-full relative transition-all duration-300 ${value === 'true' ? 'bg-green-500 shadow-[0_0_15px_rgba(34,197,94,0.4)]' : 'bg-white/10'}`}
                            onClick={() => updateProp(key, value === 'true' ? 'false' : 'true')}
                        >
                            <div className={`w-4 h-4 rounded-full bg-white absolute top-1 transition-all duration-300 ${value === 'true' ? 'left-6' : 'left-1'}`} />
                        </button>
                    ) : meta.type === 'enum' ? (
                        <select
                            className="liquid-input py-1 px-3 text-sm h-8"
                            value={value}
                            onChange={e => updateProp(key, e.target.value)}
                        >
                            {meta.options.map(opt => <option key={opt} value={opt} className="bg-gray-900">{opt.replace('minecraft:', '')}</option>)}
                        </select>
                    ) : (
                        <input
                            className={`liquid-input py-1 px-3 text-sm h-8 w-40 font-mono text-right ${errors[key] ? 'border-red-500/50 text-red-200' : ''}`}
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
        <div className="flex flex-col h-full overflow-hidden p-3 gap-6">
            <header className="liquid-card p-6 flex flex-wrap items-center justify-between gap-6 shrink-0 relative z-10">
                <div className="flex items-center gap-5">
                    <div className="w-14 h-14 rounded-2xl bg-gradient-to-br from-emerald-500 to-teal-400 shadow-[0_0_20px_rgba(16,185,129,0.3)] flex items-center justify-center text-white">
                        <Sliders size={28} />
                    </div>
                    <div>
                        <h2 className="text-2xl font-black text-white tracking-tight">Engine Properties</h2>
                        <span className="flex items-center gap-1.5 text-[10px] font-bold uppercase tracking-widest text-emerald-400 mt-1 font-mono bg-emerald-500/10 px-2 py-0.5 rounded w-fit">server.properties</span>
                    </div>
                </div>

                <div className="flex items-center gap-4 flex-wrap">
                    <div className="relative group">
                        <div className="absolute inset-y-0 left-4 flex items-center text-white/30 group-focus-within:text-emerald-400 transition-colors">
                            <Search size={18} />
                        </div>
                        <input
                            className="w-[260px] h-12 pl-12 pr-4 rounded-xl bg-black/20 border border-white/10 focus:border-emerald-500/50 focus:bg-black/40 outline-none text-white text-sm font-medium transition-all placeholder:text-white/20"
                            placeholder="Search properties..."
                            value={filter}
                            onChange={e => setFilter(e.target.value)}
                        />
                    </div>

                    <button className="h-12 w-12 rounded-xl bg-white/5 hover:bg-white/10 border border-white/10 flex items-center justify-center text-white/60 hover:text-white transition-all" onClick={fetchProperties}>
                        <RefreshCw className={loading ? 'animate-spin' : ''} size={20} />
                    </button>

                    <button
                        className={`h-12 px-6 rounded-xl font-bold text-xs uppercase tracking-wide flex items-center justify-center gap-2 transition-all shadow-lg ${isDirty
                                ? 'bg-emerald-500 hover:bg-emerald-400 text-white shadow-emerald-500/20 scale-105'
                                : 'bg-white/5 border border-white/10 text-white/40 cursor-not-allowed'
                            }`}
                        onClick={handleSave}
                        disabled={saving || !isDirty}
                    >
                        {saving ? <Loader2 className="animate-spin" size={18} /> : (isDirty ? <Save size={18} /> : <Check size={18} />)}
                        {saving ? 'Saving...' : (isDirty ? 'Save Changes' : 'Synced')}
                    </button>
                </div>
            </header>

            <div className="flex-1 overflow-y-auto pr-2 pb-10 scrollbar-thin scrollbar-thumb-white/10 flex flex-col gap-6">
                {error ? (
                    <div className="liquid-card p-12 text-center max-w-lg mx-auto flex flex-col items-center gap-6 border-red-500/30">
                        <AlertCircle size={48} className="text-red-400 drop-shadow-[0_0_15px_rgba(248,113,113,0.5)]" />
                        <div>
                            <h3 className="text-xl font-bold text-white mb-2">Configuration Error</h3>
                            <p className="text-white/50">{error}</p>
                        </div>
                        <button onClick={fetchProperties} className="px-6 py-3 rounded-xl bg-white/5 hover:bg-white/10 border border-white/10 font-bold text-sm text-white transition-all">Retry Connection</button>
                    </div>
                ) : Object.keys(properties).length === 0 && !loading ? (
                    <div className="liquid-card p-12 text-center max-w-lg mx-auto flex flex-col items-center gap-6">
                        <Info size={48} className="text-blue-400" />
                        <div>
                            <h3 className="text-xl font-bold text-white mb-2">Properties Empty</h3>
                            <p className="text-white/50">No configuration properties found at the specified path.</p>
                        </div>
                    </div>
                ) : (
                    <div className="grid grid-cols-1 xl:grid-cols-3 gap-6 pb-8">
                        {sections.map(section => {
                            const visibleKeys = section.keys.filter(k => properties[k] !== undefined);
                            if (visibleKeys.length === 0 && !filter) return null;

                            return (
                                <motion.section
                                    initial={{ opacity: 0, y: 20 }}
                                    animate={{ opacity: 1, y: 0 }}
                                    key={section.title}
                                    className="liquid-card p-0 overflow-hidden flex flex-col"
                                >
                                    <div className="p-5 border-b border-white/5 flex items-center gap-3 bg-white/[0.02]">
                                        <div className="text-emerald-400">{section.icon}</div>
                                        <h3 className="font-bold text-sm uppercase tracking-widest text-white/80">{section.title}</h3>
                                    </div>
                                    <div className="p-4 flex flex-col gap-1">
                                        {visibleKeys.map(renderInput)}
                                    </div>
                                </motion.section>
                            );
                        })}

                        {advancedKeys.length > 0 && (
                            <motion.section
                                initial={{ opacity: 0, y: 20 }}
                                animate={{ opacity: 1, y: 0 }}
                                className="liquid-card p-0 overflow-hidden col-span-1 xl:col-span-3"
                            >
                                <div className="p-5 border-b border-white/5 flex items-center gap-3 bg-white/[0.02]">
                                    <div className="text-purple-400"><Cpu size={18} /></div>
                                    <h3 className="font-bold text-sm uppercase tracking-widest text-white/80">Advanced & Technical Settings</h3>
                                </div>
                                <div className="p-4 grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-x-6 gap-y-1">
                                    {advancedKeys.map(renderInput)}
                                </div>
                            </motion.section>
                        )}
                    </div>
                )}

                {loading && (
                    <div className="absolute inset-0 flex flex-col items-center justify-center bg-black/60 backdrop-blur-sm z-50">
                        <Loader2 className="animate-spin text-emerald-400 mb-4" size={48} />
                        <p className="font-bold text-white/70 animate-pulse">Accessing Engine Records...</p>
                    </div>
                )}
            </div>
        </div>
    );
};

export default ServerProperties;
