import React, { useState, useEffect, useRef } from 'react';
import { useServer } from '../context/ServerContext';
import { useSocket } from '../context/SocketContext';
import { useToast } from '../context/ToastContext';
import { Play, Square, RefreshCw, Terminal, Cpu, HardDrive, Database, Activity, Clock, Zap, Shield, Maximize2, Terminal as ConsoleIcon, Radio, Users, Fingerprint, Trash2, Command } from 'lucide-react';
import { AreaChart, Area, XAxis, YAxis, Tooltip, ResponsiveContainer } from 'recharts';
import { motion } from 'framer-motion';

const LiquidMetricCard = ({ title, sub, value, unit, icon: Icon, color, percent }) => (
    <motion.div
        whileHover={{ y: -5, boxShadow: `0 20px 40px -10px ${color}30` }}
        className="liquid-card p-6 group"
    >
        <div className="flex items-start justify-between mb-6">
            <div className={`p-3 rounded-2xl bg-gradient-to-br transition-all duration-500 group-hover:scale-110 ${color === 'blue' ? 'from-blue-500/20 to-cyan-500/20 text-cyan-400 shadow-[0_0_20px_rgba(6,182,212,0.3)]' :
                    color === 'red' ? 'from-red-500/20 to-orange-500/20 text-orange-400 shadow-[0_0_20px_rgba(249,115,22,0.3)]' :
                        'from-green-500/20 to-emerald-500/20 text-emerald-400 shadow-[0_0_20px_rgba(16,185,129,0.3)]'
                }`}>
                <Icon size={24} />
            </div>
            <div className="text-right">
                <div className="text-xs font-bold uppercase tracking-wider text-white/40">{title}</div>
                <div className="text-[10px] font-bold text-white/20">{sub}</div>
            </div>
        </div>

        <div className="flex items-end gap-2 mb-4">
            <span className="text-4xl font-black text-white tracking-tighter">{value}</span>
            <span className="text-lg font-bold text-white/40 mb-1">{unit}</span>
        </div>

        <div className="h-1.5 w-full bg-white/5 rounded-full overflow-hidden">
            <motion.div
                className={`h-full rounded-full shadow-[0_0_10px_currentColor] ${color === 'blue' ? 'bg-cyan-400 text-cyan-400' :
                        color === 'red' ? 'bg-orange-400 text-orange-400' :
                            'bg-emerald-400 text-emerald-400'
                    }`}
                initial={{ width: 0 }}
                animate={{ width: `${percent}%` }}
                transition={{ duration: 1, ease: [0.25, 0.8, 0.25, 1] }}
            />
        </div>
    </motion.div>
);

const Dashboard = ({ onNavigate }) => {
    const { socket } = useSocket();
    const { stats, tps, logs, isConnected, startConsole, players, config, serverVersion, clearLogs } = useServer();
    const [command, setCommand] = useState('');
    const [chartData, setChartData] = useState([]);
    const [autoScroll, setAutoScroll] = useState(true);
    const { showToast } = useToast();

    const logsEndRef = useRef(null);
    const viewportRef = useRef(null);

    const [history, setHistory] = useState([]);
    const [historyIdx, setHistoryIdx] = useState(-1);

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
                // simple detection if user scrolled up
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
        const API_URL = import.meta.env.VITE_API_URL || 'http://localhost:3001';
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

    return (
        <div className="flex flex-col h-full gap-6 pb-2">

            {/* Telemetry Row */}
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6 shrink-0">
                <LiquidMetricCard
                    title="Processing Node"
                    sub="Core Load Monitoring"
                    value={stats.cpu.toFixed(1)}
                    unit="%"
                    icon={Cpu}
                    color="blue"
                    percent={stats.cpu}
                />
                <LiquidMetricCard
                    title="Memory Buffer"
                    sub="RAM Allocation"
                    value={(stats.ramUsed / 1024).toFixed(1)}
                    unit="GB"
                    icon={Database}
                    color="red"
                    percent={(stats.ramUsed / stats.ramTotal) * 100}
                />
                <LiquidMetricCard
                    title="Storage Volume"
                    sub="Persistent Storage"
                    value={stats.disk.replace('%', '')}
                    unit="%"
                    icon={HardDrive}
                    color="green"
                    percent={parseFloat(stats.disk)}
                />
            </div>

            {/* Status Ribbon */}
            <div className="liquid-card p-3 flex items-center justify-between shrink-0">
                <div className="flex items-center gap-6 px-4">
                    <div className="flex items-center gap-3">
                        <Activity className="text-white/40" size={16} />
                        <span className="text-xs font-bold text-white/40 uppercase tracking-widest">TPS Rate</span>
                        <span className={`font-mono text-lg font-bold ${getTpsColor(tps.t1)}`}>{tps.t1.toFixed(2)}</span>
                    </div>
                    <div className="w-px h-6 bg-white/10" />
                    <div className="flex items-center gap-3">
                        <Clock className="text-white/40" size={16} />
                        <span className="text-xs font-bold text-white/40 uppercase tracking-widest">Uptime</span>
                        <span className="text-sm font-bold text-white/80">{stats.uptime}</span>
                    </div>
                    <div className="w-px h-6 bg-white/10" />
                    <div className="flex items-center gap-3 cursor-pointer hover:opacity-80" onClick={() => onNavigate && onNavigate('players')}>
                        <Users className="text-white/40" size={16} />
                        <span className="text-xs font-bold text-white/40 uppercase tracking-widest">Players</span>
                        <span className="text-sm font-bold text-white/80">{players.filter(p => p.online).length} Active</span>
                    </div>
                </div>

                <div className={`px-4 py-1.5 rounded-full border text-[10px] font-black uppercase tracking-[0.2em] flex items-center gap-2 ${isConnected ? 'bg-green-500/10 border-green-500/20 text-green-400' : 'bg-red-500/10 border-red-500/20 text-red-400'
                    }`}>
                    <div className={`w-2 h-2 rounded-full ${isConnected ? 'bg-green-400 shadow-[0_0_10px_currentColor]' : 'bg-red-400'}`} />
                    {isConnected ? 'Node Online' : 'Node Offline'}
                </div>
            </div>

            {/* Ops Grid */}
            <div className="flex-1 min-h-0 grid grid-cols-1 lg:grid-cols-[1fr_360px] gap-6">

                {/* Console */}
                <div className="liquid-card flex flex-col min-h-0 relative group">
                    <div className="flex items-center justify-between p-5 border-b border-white/5">
                        <div className="flex items-center gap-3">
                            <Terminal size={18} className="text-white/60" />
                            <h3 className="text-sm font-bold text-white/90 uppercase tracking-widest">Terminal Access</h3>
                        </div>
                        <div className="flex items-center gap-2">
                            <button onClick={() => setAutoScroll(!autoScroll)} className={`p-2 rounded-lg transition-colors border border-transparent ${autoScroll ? 'bg-blue-500/20 text-blue-400 border-blue-500/20' : 'bg-white/5 text-white/40 hover:bg-white/10'}`}>
                                <Activity size={14} />
                            </button>
                            <div className="w-px h-4 bg-white/10 mx-1" />
                            <button onClick={() => control('start')} className="p-2 rounded-lg bg-emerald-500/10 text-emerald-400 border border-emerald-500/20 hover:bg-emerald-500/20 transition-all hover:-translate-y-0.5"><Play size={14} /></button>
                            <button onClick={() => control('stop')} className="p-2 rounded-lg bg-red-500/10 text-red-400 border border-red-500/20 hover:bg-red-500/20 transition-all hover:-translate-y-0.5"><Square size={14} /></button>
                            <button onClick={() => control('reload')} className="p-2 rounded-lg bg-blue-500/10 text-blue-400 border border-blue-500/20 hover:bg-blue-500/20 transition-all hover:-translate-y-0.5 hover:rotate-180"><RefreshCw size={14} /></button>
                        </div>
                    </div>

                    <div className="flex-1 overflow-y-auto p-5 font-mono text-sm space-y-1 scrollbar-thin scrollbar-thumb-white/10 scrollbar-track-transparent bg-black/20" ref={viewportRef} onScroll={handleScroll}>
                        {logs.map((log, i) => (
                            <div key={i} className="text-white/70 break-all pl-4 relative before:content-['>'] before:absolute before:left-0 before:opacity-30 before:text-blue-400">
                                {log}
                            </div>
                        ))}
                        <div ref={logsEndRef} />
                    </div>

                    <form onSubmit={sendCommand} className="p-4 border-t border-white/5 bg-white/[0.02] flex items-center gap-4">
                        <div className="text-blue-400 font-mono font-bold select-none">root@mc:~$</div>
                        <input
                            value={command}
                            onChange={e => setCommand(e.target.value)}
                            onKeyDown={handleKeyDown}
                            className="flex-1 bg-transparent border-none outline-none text-white font-mono placeholder-white/20"
                            placeholder="Awaiting instruction..."
                        />
                        <Command size={14} className="text-white/20" />
                    </form>
                </div>

                {/* Analytics Side Panel */}
                <div className="liquid-card flex flex-col max-h-full">
                    <div className="flex items-center justify-between p-5 border-b border-white/5">
                        <div className="flex items-center gap-3">
                            <Radio size={18} className="text-white/60" />
                            <h3 className="text-sm font-bold text-white/90 uppercase tracking-widest">History</h3>
                        </div>
                        <div className="px-2 py-1 bg-white/5 rounded text-[10px] font-mono font-bold">{tps.t1.toFixed(1)} TPS</div>
                    </div>
                    <div className="flex-1 min-h-[200px] p-4">
                        <ResponsiveContainer width="100%" height="100%">
                            <AreaChart data={chartData}>
                                <defs>
                                    <linearGradient id="cpuGrad" x1="0" y1="0" x2="0" y2="1">
                                        <stop offset="5%" stopColor="#22d3ee" stopOpacity={0.4} />
                                        <stop offset="95%" stopColor="#22d3ee" stopOpacity={0} />
                                    </linearGradient>
                                    <linearGradient id="ramGrad" x1="0" y1="0" x2="0" y2="1">
                                        <stop offset="5%" stopColor="#f472b6" stopOpacity={0.4} />
                                        <stop offset="05%" stopColor="#f472b6" stopOpacity={0} />
                                    </linearGradient>
                                </defs>
                                <XAxis dataKey="name" hide />
                                <YAxis hide domain={[0, 100]} />
                                <Tooltip
                                    contentStyle={{ background: 'rgba(0,0,0,0.8)', backdropFilter: 'blur(20px)', border: '1px solid rgba(255,255,255,0.1)', borderRadius: '12px', boxShadow: '0 10px 40px rgba(0,0,0,0.5)' }}
                                    itemStyle={{ fontSize: '12px', fontWeight: 'bold' }}
                                    labelStyle={{ display: 'none' }}
                                />
                                <Area type="monotone" dataKey="cpu" stroke="#22d3ee" fill="url(#cpuGrad)" strokeWidth={2} isAnimationActive={false} />
                                <Area type="monotone" dataKey="ram" stroke="#f472b6" fill="url(#ramGrad)" strokeWidth={2} isAnimationActive={false} />
                            </AreaChart>
                        </ResponsiveContainer>
                    </div>
                    <div className="p-5 border-t border-white/5 flex items-center justify-center gap-6">
                        <div className="flex items-center gap-2 text-xs font-bold uppercase tracking-wider text-white/50">
                            <div className="w-2 h-2 rounded-full bg-cyan-400 shadow-[0_0_10px_#22d3ee]" /> Processor
                        </div>
                        <div className="flex items-center gap-2 text-xs font-bold uppercase tracking-wider text-white/50">
                            <div className="w-2 h-2 rounded-full bg-pink-400 shadow-[0_0_10px_#f472b6]" /> Memory
                        </div>
                    </div>
                </div>

            </div>
        </div>
    );
};

export default Dashboard;
