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

    const API_BASE = `http://${window.location.hostname}:3001`;

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
            <div key={key} className={`group relative flex flex-col gap-2 p-3 rounded-xl transition-all border border-transparent ${isModified ? 'bg-[var(--accent-primary)]/5 border-[var(--accent-primary)]/20' : 'hover:bg-white/[0.03] hover:border-white/5'}`}>
                <div className="flex items-center justify-between">
                    <label className="text-[10px] font-black uppercase tracking-widest text-white/30 group-hover:text-white/60 transition-colors truncate pr-4">
                        {key.replace(/-/g, ' ')}
                    </label>
                    {isModified && <div className="w-1.5 h-1.5 rounded-full bg-[var(--accent-primary)] shadow-[0_0_8px_var(--accent-primary)]" />}
                </div>

                {meta.type === 'boolean' ? (
                    <button
                        className={`h-10 px-4 rounded-lg font-bold text-[10px] uppercase tracking-widest flex items-center justify-between transition-all group/btn ${value === 'true'
                            ? 'bg-[var(--accent-primary)]/10 text-[var(--accent-primary)] border border-[var(--accent-primary)]/20 hover:bg-[var(--accent-primary)]/20 shadow-inner'
                            : 'bg-white/5 text-white/40 border border-white/5 hover:bg-white/10 hover:text-white/60'
                            }`}
                        onClick={() => setProperties({ ...properties, [key]: value === 'true' ? 'false' : 'true' })}
                    >
                        {value === 'true' ? 'Enabled' : 'Disabled'}
                        <div className={`w-1.5 h-1.5 rounded-full transition-all duration-300 ${value === 'true' ? 'bg-[var(--accent-primary)] shadow-[0_0_10px_var(--accent-primary)]' : 'bg-white/20'}`} />
                    </button>
                ) : meta.type === 'enum' ? (
                    <div className="relative">
                        <select
                            className="w-full h-10 px-4 rounded-lg bg-black/40 border border-white/10 text-white text-[10px] font-black uppercase tracking-widest outline-none focus:border-[var(--accent-primary)]/50 appearance-none cursor-pointer"
                            value={value}
                            onChange={e => setProperties({ ...properties, [key]: e.target.value })}
                        >
                            {meta.options?.map(opt => <option key={opt} value={opt} className="bg-neutral-900">{opt.toUpperCase()}</option>)}
                        </select>
                        <ChevronDown size={14} className="absolute right-3 top-1/2 -translate-y-1/2 text-white/20 pointer-events-none" />
                    </div>
                ) : (
                    <input
                        className="h-10 px-4 rounded-lg bg-black/40 border border-white/10 text-white font-mono text-[11px] outline-none focus:border-[var(--accent-primary)]/50 transition-all placeholder:text-white/5"
                        value={value || ''}
                        placeholder="..."
                        onChange={e => setProperties({ ...properties, [key]: e.target.value })}
                        type={meta.type === 'number' ? 'number' : 'text'}
                    />
                )}
                {meta.desc && <p className="text-[9px] text-white/10 italic leading-tight px-1 line-clamp-1 group-hover:line-clamp-none transition-all">{meta.desc}</p>}
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
                <header className="liquid-card p-6 flex flex-wrap items-center justify-between gap-6 shrink-0 relative z-10 border-white/10">
                    <div className="flex items-center gap-5">
                        <div className="w-14 h-14 rounded-2xl bg-gradient-to-br from-[var(--accent-primary)] to-[var(--accent-secondary,var(--accent-primary))] shadow-[0_0_20px_rgba(0,0,0,0.3)] flex items-center justify-center text-white relative">
                            <Sliders size={28} className="relative z-10" />
                            <div className="absolute inset-0 bg-[var(--accent-primary)] blur-xl opacity-30" />
                        </div>
                        <div>
                            <h2 className="text-2xl font-black text-white tracking-tight">Engine Properties</h2>
                            <span className="flex items-center gap-1.5 text-[10px] font-bold uppercase tracking-widest text-[var(--accent-primary)] mt-1 font-mono bg-[var(--accent-primary)]/10 px-2 py-0.5 rounded w-fit">server.properties</span>
                        </div>
                    </div>

                    <div className="flex items-center gap-4 flex-wrap">
                        <div className="relative group">
                            <div className="absolute inset-y-0 left-4 flex items-center text-white/30 group-focus-within:text-[var(--accent-primary)] transition-colors">
                                <Search size={18} />
                            </div>
                            <input
                                className="w-[180px] h-12 pl-12 pr-4 rounded-xl bg-black/40 border border-white/10 focus:border-[var(--accent-primary)]/50 focus:bg-black/60 outline-none text-white text-sm font-medium transition-all placeholder:text-white/20"
                                placeholder="Filter..."
                                value={filter}
                                onChange={e => setFilter(e.target.value)}
                            />
                        </div>

                        <button className="h-12 w-12 rounded-xl bg-white/5 hover:bg-white/10 border border-white/10 flex items-center justify-center text-white/60 hover:text-white transition-all" onClick={fetchProperties}>
                            <RefreshCw className={loading ? 'animate-spin text-[var(--accent-primary)]' : ''} size={20} />
                        </button>

                        <button
                            className={`h-12 px-6 rounded-xl font-black text-xs uppercase tracking-widest flex items-center justify-center gap-2 transition-all shadow-lg ${isDirty
                                ? 'bg-[var(--accent-primary)] hover:bg-[var(--accent-primary)] text-black shadow-[var(--accent-primary)]/20 scale-105 saturate-[1.2]'
                                : 'bg-white/5 border border-white/10 text-white/40 cursor-not-allowed text-[10px]'
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
                            <div key={section.id} className="liquid-card flex flex-col p-0 overflow-hidden h-fit border-white/5">
                                <div className="p-5 border-b border-white/5 flex items-center gap-4 bg-white/[0.03] backdrop-blur-md">
                                    <div className="p-3 rounded-xl bg-[var(--accent-primary)]/10 text-[var(--accent-primary)] shadow-inner">
                                        {section.icon}
                                    </div>
                                    <h3 className="font-bold text-[10px] uppercase tracking-[0.2em] text-white/80">{section.title}</h3>
                                </div>
                                <div className="p-6 flex flex-col gap-1">
                                    {visibleKeys.map(renderInput)}
                                </div>
                            </div>
                        );
                    })}
                </div>

                {advancedKeys.length > 0 && (
                    <div className="liquid-card flex flex-col p-0 overflow-hidden h-fit border-white/5">
                        <div className="p-6 border-b border-white/5 flex items-center gap-4 bg-white/[0.03] backdrop-blur-md">
                            <div className="p-3 rounded-xl bg-purple-500/10 text-purple-400">
                                <Cpu size={18} />
                            </div>
                            <h3 className="font-bold text-[10px] uppercase tracking-[0.2em] text-white/80">Advanced Logic Layer</h3>
                        </div>
                        <div className="p-6 grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-x-6 gap-y-1">
                            {advancedKeys.map(renderInput)}
                        </div>
                    </div>
                )}
                <div className="h-20 shrink-0" />
            </div>

            {loading && (
                <div className="fixed inset-0 flex flex-col items-center justify-center bg-black/60 backdrop-blur-sm z-50">
                    <Loader2 className="animate-spin text-[var(--accent-primary)] mb-4" size={48} />
                    <p className="font-bold text-white/70 animate-pulse uppercase tracking-[0.3em] text-[10px]">Accessing Engine Records...</p>
                </div>
            )}
        </div>
    );
};

export default ServerProperties;
