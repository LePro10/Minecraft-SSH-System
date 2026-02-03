import React, { useState, useEffect, useRef } from 'react';
import { useServer } from '../context/ServerContext';
import { useSocket } from '../context/SocketContext';
import { useToast } from '../context/ToastContext';
import { Play, Square, RefreshCw, Terminal, Cpu, HardDrive, Database, Activity, Clock, Radio, Users, Command, GripVertical } from 'lucide-react';
import { AreaChart, Area, XAxis, YAxis, Tooltip, ResponsiveContainer } from 'recharts';
import { motion } from 'framer-motion';
import { Responsive, WidthProvider } from 'react-grid-layout';
import 'react-grid-layout/css/styles.css';
import 'react-resizable/css/styles.css';

const ResponsiveGridLayout = WidthProvider(Responsive);

const LiquidMetricCard = ({ title, sub, value, unit, icon: Icon, color, percent, style, className, onMouseDown, onMouseUp, onTouchEnd, children, ...props }) => (
    <div
        style={style}
        className={`${className} liquid-card p-6 group flex flex-col justify-between select-none border-white/5`}
        onMouseDown={onMouseDown}
        onMouseUp={onMouseUp}
        onTouchEnd={onTouchEnd}
        {...props}
    >
        {/* Drag Handle */}
        <div className="absolute top-4 right-4 opacity-0 group-hover:opacity-20 cursor-grab active:cursor-grabbing transition-opacity">
            <GripVertical size={16} />
        </div>

        <div className="flex items-start justify-between mb-4">
            <div className={`p-3 rounded-2xl bg-gradient-to-br transition-all duration-500 group-hover:scale-110 shadow-lg ${color === 'blue' ? 'from-[var(--accent-primary)]/20 to-[var(--accent-secondary,var(--accent-primary))]/20 text-[var(--accent-primary)] shadow-[var(--accent-primary)]/10' :
                color === 'red' ? 'from-rose-500/20 to-orange-500/20 text-rose-400 shadow-rose-500/10' :
                    'from-emerald-500/20 to-teal-500/20 text-emerald-400 shadow-emerald-500/10'
                }`}>
                <Icon size={24} />
            </div>
            <div className="text-right">
                <div className="text-[10px] font-black uppercase tracking-[0.2em] text-white/30">{title}</div>
                <div className="text-[9px] font-bold text-white/10 mt-0.5">{sub}</div>
            </div>
        </div>

        <div>
            <div className="flex items-end gap-2 mb-4">
                <span className="text-4xl font-black text-white tracking-tighter">{value}</span>
                <span className="text-lg font-bold text-white/40 mb-1">{unit}</span>
            </div>

            <div className="h-2 w-full bg-white/5 rounded-full overflow-hidden border border-white/5 p-[1px]">
                <motion.div
                    className={`h-full rounded-full ${color === 'blue' ? 'bg-[var(--accent-primary)] shadow-[0_0_15px_var(--accent-primary)]' :
                        color === 'red' ? 'bg-rose-500 shadow-[0_0_15px_rgba(244,63,94,0.5)]' :
                            'bg-emerald-400 shadow-[0_0_15px_rgba(52,211,153,0.5)]'
                        }`}
                    initial={{ width: 0 }}
                    animate={{ width: `${percent}%` }}
                    transition={{ duration: 1.5, ease: [0.25, 0.8, 0.25, 1] }}
                />
            </div>
        </div>
        {children}
    </div>
);

const Dashboard = ({ onNavigate }) => {
    const { socket } = useSocket();
    const { stats, tps, logs, isConnected, startConsole, players, clearLogs } = useServer();
    const [command, setCommand] = useState('');
    const [chartData, setChartData] = useState([]);
    const [autoScroll, setAutoScroll] = useState(true);
    const { showToast } = useToast();

    const logsEndRef = useRef(null);
    const viewportRef = useRef(null);

    const [history, setHistory] = useState([]);
    const [historyIdx, setHistoryIdx] = useState(-1);

    const defaultLayouts = {
        lg: [
            { i: 'cpu', x: 0, y: 0, w: 4, h: 4 },
            { i: 'ram', x: 4, y: 0, w: 4, h: 4 },
            { i: 'disk', x: 8, y: 0, w: 4, h: 4 },
            { i: 'status', x: 0, y: 4, w: 12, h: 2 },
            { i: 'console', x: 0, y: 6, w: 8, h: 10 },
            { i: 'analytics', x: 8, y: 6, w: 4, h: 10 },
        ],
        md: [
            { i: 'cpu', x: 0, y: 0, w: 6, h: 4 },
            { i: 'ram', x: 6, y: 0, w: 6, h: 4 },
            { i: 'disk', x: 0, y: 4, w: 12, h: 4 },
            { i: 'status', x: 0, y: 8, w: 12, h: 2 },
            { i: 'console', x: 0, y: 10, w: 12, h: 10 },
            { i: 'analytics', x: 0, y: 20, w: 12, h: 8 },
        ]
    };

    const [layouts, setLayouts] = useState(() => {
        const saved = localStorage.getItem('dashboard_layout');
        return saved ? JSON.parse(saved) : defaultLayouts;
    });

    const getTpsColor = (val) => {
        if (val >= 18) return 'text-emerald-400';
        if (val >= 15) return 'text-yellow-400';
        return 'text-red-400';
    };

    useEffect(() => {
        setChartData(prev => {
            const now = new Date().toLocaleTimeString();
            const newItem = { name: now, cpu: stats.cpu, ram: stats.ram, tps: tps.t1 };
            return [...prev, newItem].slice(-30);
        });
    }, [stats, tps]);

    useEffect(() => {
        if (isConnected) startConsole();
    }, [isConnected]);

    useEffect(() => {
        if (!autoScroll) return;
        const viewport = viewportRef.current;
        if (!viewport) return;
        viewport.scrollTop = viewport.scrollHeight;
    }, [logs, autoScroll]);

    const handleScroll = () => {
        if (autoScroll && viewportRef.current) {
            const viewport = viewportRef.current;
            if (viewport.scrollTop < viewport.scrollHeight - viewport.clientHeight - 50) {
                // User scrolled up
            }
        }
    };

    const handleKeyDown = (e) => {
        if (e.key === 'ArrowUp') {
            e.preventDefault();
            const nextIdx = historyIdx + 1;
            if (nextIdx < history.length) {
                setHistoryIdx(nextIdx);
                setCommand(history[nextIdx]);
            }
        } else if (e.key === 'ArrowDown') {
            e.preventDefault();
            const nextIdx = historyIdx - 1;
            if (nextIdx >= 0) {
                setHistoryIdx(nextIdx);
                setCommand(history[nextIdx]);
            } else {
                setHistoryIdx(-1);
                setCommand('');
            }
        }
    };

    const sendCommand = (e) => {
        e.preventDefault();
        if (command.trim() && socket) {
            socket.emit('console:input', { command });
            setHistory(prev => [command, ...prev.filter(h => h !== command)].slice(0, 50));
            setHistoryIdx(-1);
            setCommand('');
        }
    };

    const control = async (action) => {
        const API_URL = `http://${window.location.hostname}:3001`;
        try {
            const res = await fetch(`${API_URL}/api/mc/control`, {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ action })
            });
            if (res.ok) {
                showToast(`Action ${action} initiated.`, 'info');
                if (action === 'start') {
                    if (clearLogs) clearLogs();
                    setTimeout(() => { if (startConsole) startConsole(); }, 1000);
                }
            } else {
                const errData = await res.json();
                showToast(`Control failed: ${action}`, 'error', { details: errData.error || 'Unknown error' });
            }
        } catch (e) {
            showToast('Host connection lost.', 'error', { details: e.message });
        }
    };

    const onLayoutChange = (currentLayout, allLayouts) => {
        setLayouts(allLayouts);
        localStorage.setItem('dashboard_layout', JSON.stringify(allLayouts));
    };

    return (
        <div className="h-full w-full overflow-y-auto overflow-x-hidden pr-2 scrollbar-thin scrollbar-thumb-white/10">
            <ResponsiveGridLayout
                className="layout"
                layouts={layouts}
                breakpoints={{ lg: 1200, md: 996, sm: 768, xs: 480, xxs: 0 }}
                cols={{ lg: 12, md: 12, sm: 6, xs: 4, xxs: 2 }}
                rowHeight={40}
                margin={[16, 16]}
                onLayoutChange={onLayoutChange}
                draggableHandle=".cursor-grab"
                isDraggable={true}
                isResizable={true}
            >
                {/* CPU */}
                <LiquidMetricCard
                    key="cpu"
                    title="Engine Cluster"
                    sub="Core Efficiency Load"
                    value={stats.cpu.toFixed(1)}
                    unit="%"
                    icon={Cpu}
                    color="blue"
                    percent={stats.cpu}
                />

                {/* RAM */}
                <LiquidMetricCard
                    key="ram"
                    title="Memory Bank"
                    sub="Buffer Allocation"
                    value={(stats.ramUsed / 1024).toFixed(1)}
                    unit="GB"
                    icon={Database}
                    color="red"
                    percent={(stats.ramUsed / stats.ramTotal) * 100}
                />

                {/* DISK */}
                <LiquidMetricCard
                    key="disk"
                    title="Storage Block"
                    sub="Static Persistence"
                    value={stats.disk.replace('%', '')}
                    unit="%"
                    icon={HardDrive}
                    color="green"
                    percent={parseFloat(stats.disk)}
                />

                {/* STATUS BAR */}
                <div key="status" className="liquid-card p-3 flex items-center justify-between overflow-hidden border-white/5">
                    <div className="flex items-center gap-6 px-4">
                        <div className="flex items-center gap-3">
                            <Activity className="text-white/20" size={16} />
                            <span className="text-[10px] font-black uppercase tracking-widest text-white/30 hidden sm:inline">TPS Rate</span>
                            <span className={`font-mono text-lg font-black ${getTpsColor(tps.t1)}`}>{tps.t1.toFixed(2)}</span>
                        </div>
                        <div className="w-px h-6 bg-white/5 hidden sm:block" />
                        <div className="flex items-center gap-3">
                            <Clock className="text-white/20" size={16} />
                            <span className="text-[10px] font-black uppercase tracking-widest text-white/30 hidden sm:inline">Runtime</span>
                            <span className="text-sm font-bold text-white/80 font-mono tracking-tighter">{stats.uptime}</span>
                        </div>
                        <div className="w-px h-6 bg-white/5 hidden sm:block" />
                        <div className="flex items-center gap-3 cursor-pointer hover:opacity-80 transition-all" onClick={() => onNavigate && onNavigate('players')}>
                            <Users className="text-white/20" size={16} />
                            <span className="text-[10px] font-black uppercase tracking-widest text-white/30 hidden sm:inline">Active Units</span>
                            <span className="text-sm font-black text-[var(--accent-primary)] bg-[var(--accent-primary)]/10 px-2 py-0.5 rounded shadow-[0_0_10px_var(--accent-primary)]/10">{players.filter(p => p.online).length}</span>
                        </div>
                        <div className="ml-4 opacity-10 hover:opacity-50 cursor-grab active:cursor-grabbing">
                            <GripVertical size={16} />
                        </div>
                    </div>

                    <div className={`px-4 py-1.5 rounded-xl border text-[9px] font-black uppercase tracking-[0.3em] flex items-center gap-3 transition-all ${isConnected ? 'bg-emerald-500/10 border-emerald-500/20 text-emerald-400 shadow-[0_0_15px_rgba(52,211,153,0.1)]' : 'bg-red-500/10 border-red-500/20 text-red-400'
                        }`}>
                        <div className={`w-1.5 h-1.5 rounded-full ${isConnected ? 'bg-emerald-400 shadow-[0_0_10px_currentColor]' : 'bg-red-400 animate-pulse'}`} />
                        <span className="hidden sm:inline">{isConnected ? 'Link Stable' : 'Link Severed'}</span>
                    </div>
                </div>

                {/* CONSOLE */}
                <div key="console" className="liquid-card flex flex-col min-h-0 relative group border-white/10 overflow-hidden">
                    <div className="flex items-center justify-between p-5 border-b border-white/5 cursor-grab active:cursor-grabbing bg-white/[0.02] backdrop-blur-md">
                        <div className="flex items-center gap-3">
                            <div className="p-2 bg-[var(--accent-primary)]/10 rounded-lg text-[var(--accent-primary)]">
                                <Terminal size={18} />
                            </div>
                            <h3 className="text-[10px] font-black text-white/70 uppercase tracking-[0.2em]">Matrix Terminal</h3>
                        </div>
                        <div className="flex items-center gap-3">
                            <button onClick={() => setAutoScroll(!autoScroll)} className={`p-2 rounded-lg transition-all border ${autoScroll ? 'bg-[var(--accent-primary)]/20 text-[var(--accent-primary)] border-[var(--accent-primary)]/20' : 'bg-white/5 text-white/30 border-transparent hover:bg-white/10'}`}>
                                <Activity size={14} />
                            </button>
                            <div className="w-px h-4 bg-white/10 mx-1" />
                            <button onMouseDown={e => e.stopPropagation()} onClick={() => control('start')} className="p-2 rounded-lg bg-emerald-500/10 text-emerald-400 border border-emerald-500/20 hover:bg-emerald-500/20 transition-all hover:-translate-y-0.5"><Play size={14} /></button>
                            <button
                                onMouseDown={e => e.stopPropagation()}
                                onClick={() => {
                                    if (socket && isConnected) {
                                        socket.emit('console:input', { command: 'stop' });
                                        showToast('Termination signal sent.', 'info');
                                    } else {
                                        control('stop');
                                    }
                                }}
                                className="p-2 rounded-lg bg-rose-500/10 text-rose-400 border border-rose-500/20 hover:bg-rose-500/20 transition-all hover:-translate-y-0.5"
                            >
                                <Square size={14} />
                            </button>
                            <button onMouseDown={e => e.stopPropagation()} onClick={() => control('reload')} className="p-2 rounded-lg bg-blue-500/10 text-blue-400 border border-blue-500/20 hover:bg-blue-500/20 transition-all hover:-translate-y-0.5 hover:rotate-180"><RefreshCw size={14} /></button>
                            <GripVertical size={16} className="ml-2 opacity-10" />
                        </div>
                    </div>

                    <div className="flex-1 overflow-y-auto p-6 font-mono text-[11px] space-y-1.5 scrollbar-thin scrollbar-thumb-white/10 scrollbar-track-transparent bg-black/40 backdrop-blur-3xl" ref={viewportRef} onScroll={handleScroll} onMouseDown={e => e.stopPropagation()}>
                        {logs.length === 0 && <div className="text-white/5 italic text-center py-20 uppercase tracking-[0.5em] font-black">Waiting for Data Stream...</div>}
                        {logs.map((log, i) => (
                            <div key={i} className="text-white/60 break-all pl-5 relative before:content-[''] before:absolute before:left-0 before:top-1.5 before:w-1.5 before:h-1.5 before:rounded-full before:bg-[var(--accent-primary)] before:opacity-20 flex flex-col group/log">
                                <span className="group-hover/log:text-white transition-colors">{log}</span>
                            </div>
                        ))}
                        <div ref={logsEndRef} />
                    </div>

                    <form onSubmit={sendCommand} className="p-5 border-t border-white/5 bg-white/[0.04] flex items-center gap-4 backdrop-blur-md" onMouseDown={e => e.stopPropagation()}>
                        <div className="text-[var(--accent-primary)] font-mono text-[10px] font-black select-none hidden sm:block opacity-50">NODE_SSH // &gt;_</div>
                        <input
                            value={command}
                            onChange={e => setCommand(e.target.value)}
                            onKeyDown={handleKeyDown}
                            className="flex-1 bg-transparent border-none outline-none text-white font-mono text-sm placeholder:text-white/10 focus:placeholder:text-[var(--accent-primary)]/20 transition-all"
                            placeholder="Input control sequence..."
                        />
                        <Command size={14} className="text-white/10" />
                    </form>
                </div>

                {/* ANALYTICS */}
                <div key="analytics" className="liquid-card flex flex-col max-h-full border-white/5 overflow-hidden">
                    <div className="flex items-center justify-between p-5 border-b border-white/5 cursor-grab active:cursor-grabbing bg-white/[0.01]">
                        <div className="flex items-center gap-3">
                            <Radio size={18} className="text-white/20" />
                            <h3 className="text-[10px] font-black text-white/50 uppercase tracking-[0.2em]">Live Telemetry</h3>
                        </div>
                        <div className="px-3 py-1 bg-[var(--accent-primary)]/10 text-[var(--accent-primary)] rounded-lg text-[10px] font-mono font-black border border-[var(--accent-primary)]/10">{tps.t1.toFixed(1)} TPS</div>
                        <GripVertical size={16} className="ml-2 opacity-10" />
                    </div>
                    <div className="flex-1 min-h-[100px] p-6" onMouseDown={e => e.stopPropagation()}>
                        <ResponsiveContainer width="100%" height="100%">
                            <AreaChart data={chartData}>
                                <defs>
                                    <linearGradient id="cpuGrad" x1="0" y1="0" x2="0" y2="1">
                                        <stop offset="5%" stopColor="var(--accent-primary)" stopOpacity={0.4} />
                                        <stop offset="95%" stopColor="var(--accent-primary)" stopOpacity={0} />
                                    </linearGradient>
                                    <linearGradient id="ramGrad" x1="0" y1="0" x2="0" y2="1">
                                        <stop offset="5%" stopColor="#f472b6" stopOpacity={0.2} />
                                        <stop offset="95%" stopColor="#f472b6" stopOpacity={0} />
                                    </linearGradient>
                                </defs>
                                <XAxis dataKey="name" hide />
                                <YAxis hide domain={[0, 100]} />
                                <Tooltip
                                    contentStyle={{
                                        background: 'rgba(0,0,0,0.9)',
                                        backdropFilter: 'blur(30px)',
                                        border: '1px solid rgba(255,255,255,0.1)',
                                        borderRadius: '16px',
                                        boxShadow: '0 20px 50px rgba(0,0,0,0.8)',
                                        padding: '12px 16px'
                                    }}
                                    itemStyle={{ fontSize: '11px', fontWeight: '900', textTransform: 'uppercase', letterSpacing: '0.1em' }}
                                    labelStyle={{ display: 'none' }}
                                />
                                <Area type="monotone" dataKey="cpu" stroke="var(--accent-primary)" fill="url(#cpuGrad)" strokeWidth={3} isAnimationActive={false} dot={false} />
                                <Area type="monotone" dataKey="ram" stroke="#f472b6" fill="url(#ramGrad)" strokeWidth={2} isAnimationActive={false} dot={false} strokeDasharray="5 5" />
                            </AreaChart>
                        </ResponsiveContainer>
                    </div>
                    <div className="p-5 border-t border-white/5 flex items-center justify-center gap-8 bg-black/20">
                        <div className="flex items-center gap-3 text-[10px] font-black uppercase tracking-widest text-white/30">
                            <div className="w-2.5 h-2.5 rounded-full bg-[var(--accent-primary)] shadow-[0_0_15px_var(--accent-primary)]" /> Engine
                        </div>
                        <div className="flex items-center gap-3 text-[10px] font-black uppercase tracking-widest text-white/30">
                            <div className="w-2.5 h-2.5 rounded-full bg-pink-500/50 border border-pink-400" /> Memory
                        </div>
                    </div>
                </div>

            </ResponsiveGridLayout>
        </div>
    );
};

export default Dashboard;
