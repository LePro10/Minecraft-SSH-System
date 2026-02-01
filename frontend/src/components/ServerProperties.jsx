import React, { useState, useEffect } from 'react';
import { useServer } from '../context/ServerContext';
import { useToast } from '../context/ToastContext';
import {
    Sliders, Search, RefreshCw, Save, Check, Loader2,
    Cpu, Zap, Globe, Shield, MessageSquare, List,
    ChevronDown, Play, Box
} from 'lucide-react';

const ServerProperties = () => {
    const { isConnected, config } = useServer();
    const { showToast } = useToast();
    const [properties, setProperties] = useState({});
    const [metadata, setMetadata] = useState({});
    const [loading, setLoading] = useState(false);
    const [saving, setSaving] = useState(false);
    const [filter, setFilter] = useState('');
    const [original, setOriginal] = useState({});

    const API_BASE = import.meta.env.VITE_API_URL || 'http://localhost:3001';

    useEffect(() => {
        if (isConnected && config?.path) {
            fetchProperties();
        }
    }, [isConnected, config?.path]);

    const fetchProperties = async () => {
        setLoading(true);
        try {
            const res = await fetch(`${API_BASE}/api/mc/properties?path=${encodeURIComponent(config.path)}`);
            const data = await res.json();
            if (data.values) {
                setProperties(data.values);
                setOriginal(data.values);
                setMetadata(data.metadata || {});
            }
        } catch (e) {
            showToast('Failed to load properties', 'error');
        } finally {
            setLoading(false);
        }
    };

    const handleSave = async () => {
        setSaving(true);
        try {
            const res = await fetch(`${API_BASE}/api/mc/properties`, {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({
                    path: config.path,
                    properties
                })
            });
            if (res.ok) {
                setOriginal(properties);
                showToast('Properties synchronized!', 'success');
            } else {
                showToast('Sync failed', 'error');
            }
        } catch (e) {
            showToast('Connection error', 'error');
        } finally {
            setSaving(false);
        }
    };

    const isDirty = JSON.stringify(properties) !== JSON.stringify(original);

    const renderInput = (key) => {
        const value = properties[key];
        const meta = metadata[key] || {};
        const isModified = value !== original[key];

        if (filter && !key.toLowerCase().includes(filter.toLowerCase())) return null;

        return (
            <div key={key} className={`group relative flex flex-col gap-2 p-3 rounded-xl transition-all ${isModified ? 'bg-emerald-500/5' : 'hover:bg-white/[0.02]'}`}>
                <div className="flex items-center justify-between">
                    <label className="text-[10px] font-black uppercase tracking-widest text-white/30 group-hover:text-white/60 transition-colors">
                        {key.replace(/-/g, ' ')}
                    </label>
                    {isModified && <div className="w-1.5 h-1.5 rounded-full bg-emerald-500 shadow-[0_0_8px_rgba(16,185,129,0.5)]" />}
                </div>

                {meta.type === 'boolean' ? (
                    <button
                        className={`h-10 px-4 rounded-lg font-bold text-xs uppercase tracking-widest flex items-center justify-between transition-all ${value === 'true'
                            ? 'bg-emerald-500/10 text-emerald-400 border border-emerald-500/20'
                            : 'bg-red-500/10 text-red-500 border border-red-500/20'
                            }`}
                        onClick={() => setProperties({ ...properties, [key]: value === 'true' ? 'false' : 'true' })}
                    >
                        {value === 'true' ? 'Enabled' : 'Disabled'}
                        <div className={`w-2 h-2 rounded-full ${value === 'true' ? 'bg-emerald-400' : 'bg-red-400'}`} />
                    </button>
                ) : meta.type === 'enum' ? (
                    <select
                        className="h-10 px-4 rounded-lg bg-black/40 border border-white/10 text-white text-xs font-bold outline-none focus:border-emerald-500/50 appearance-none cursor-pointer"
                        value={value}
                        onChange={e => setProperties({ ...properties, [key]: e.target.value })}
                    >
                        {meta.options.map(opt => <option key={opt} value={opt}>{opt.toUpperCase()}</option>)}
                    </select>
                ) : (
                    <input
                        className="h-10 px-4 rounded-lg bg-black/40 border border-white/10 text-white font-mono text-xs outline-none focus:border-emerald-500/50 transition-all"
                        value={value || ''}
                        onChange={e => setProperties({ ...properties, [key]: e.target.value })}
                        type={meta.type === 'number' ? 'number' : 'text'}
                    />
                )}
                {meta.desc && <p className="text-[10px] text-white/20 italic leading-tight px-1 line-clamp-1 group-hover:line-clamp-none transition-all">{meta.desc}</p>}
            </div>
        );
    };

    if (!isConnected) return null;

    const sections = [
        { id: 'world', title: 'World & Physics', icon: <Globe size={18} />, keys: ['level-name', 'level-seed', 'level-type', 'gamemode', 'difficulty', 'hardcore', 'allow-nether', 'generate-structures', 'force-gamemode'] },
        { id: 'gameplay', title: 'Gameplay Essentials', icon: <Play size={18} />, keys: ['view-distance', 'simulation-distance', 'max-players', 'pvp', 'allow-flight', 'enable-command-block', 'spawn-animals', 'spawn-monsters', 'spawn-npcs', 'spawn-protection'] },
        { id: 'network', title: 'Network & Security', icon: <Shield size={18} />, keys: ['server-port', 'server-ip', 'online-mode', 'white-list', 'enforce-whitelist', 'prevent-proxy-connections', 'hide-online-players', 'enable-query', 'enable-rcon'] }
    ];

    const advancedKeys = Object.keys(properties).filter(k => !sections.some(s => s.keys.includes(k)));

    return (
        <div className="h-full w-full overflow-y-auto overflow-x-hidden scrollbar-thin scrollbar-thumb-white/10">
            <div className="p-6 flex flex-col gap-8">
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
                                className="w-[180px] h-12 pl-12 pr-4 rounded-xl bg-black/20 border border-white/10 focus:border-emerald-500/50 focus:bg-black/40 outline-none text-white text-sm font-medium transition-all placeholder:text-white/20"
                                placeholder="Filter..."
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

                <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
                    {sections.map(section => {
                        const visibleKeys = section.keys.filter(k => properties[k] !== undefined);
                        if (visibleKeys.length === 0 && !filter) return null;

                        return (
                            <div key={section.id} className="liquid-card flex flex-col p-0 overflow-hidden h-fit">
                                <div className="p-5 border-b border-white/5 flex items-center gap-4 bg-white/[0.02]">
                                    <div className="p-3 rounded-xl bg-emerald-500/10 text-emerald-400">
                                        {section.icon}
                                    </div>
                                    <h3 className="font-bold text-sm uppercase tracking-widest text-white/80">{section.title}</h3>
                                </div>
                                <div className="p-6 flex flex-col gap-1">
                                    {visibleKeys.map(renderInput)}
                                </div>
                            </div>
                        );
                    })}
                </div>

                {advancedKeys.length > 0 && (
                    <div className="liquid-card flex flex-col p-0 overflow-hidden h-fit">
                        <div className="p-6 border-b border-white/5 flex items-center gap-4 bg-white/[0.02]">
                            <div className="p-3 rounded-xl bg-purple-500/10 text-purple-400">
                                <Cpu size={18} />
                            </div>
                            <h3 className="font-bold text-sm uppercase tracking-widest text-white/80">Advanced Settings</h3>
                        </div>
                        <div className="p-6 grid grid-cols-1 md:grid-cols-2 gap-x-8 gap-y-1">
                            {advancedKeys.map(renderInput)}
                        </div>
                    </div>
                )}
                <div className="h-20 shrink-0" />
            </div>

            {loading && (
                <div className="fixed inset-0 flex flex-col items-center justify-center bg-black/60 backdrop-blur-sm z-50">
                    <Loader2 className="animate-spin text-emerald-400 mb-4" size={48} />
                    <p className="font-bold text-white/70 animate-pulse">Accessing Engine Records...</p>
                </div>
            )}
        </div>
    );
};

export default ServerProperties;
