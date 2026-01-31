import React, { useState, useEffect, useRef } from 'react';
import { useServer } from '../context/ServerContext';
import { useSocket } from '../context/SocketContext';
import { useToast } from '../context/ToastContext';
import { Play, Square, RefreshCw, Terminal, Cpu, HardDrive, Database, Activity, Clock, Zap, Shield, Maximize2, Terminal as ConsoleIcon, Radio, Users, Fingerprint, Trash2 } from 'lucide-react';
import { AreaChart, Area, XAxis, YAxis, Tooltip, ResponsiveContainer } from 'recharts';

const Dashboard = ({ onNavigate }) => {
    const { socket } = useSocket();
    const { stats, tps, logs, isConnected, startConsole, players, config, serverVersion, clearLogs } = useServer();
    const [command, setCommand] = useState('');
    const [consoleActive, setConsoleActive] = useState(false);
    const [history, setHistory] = useState([]);
    const [historyIdx, setHistoryIdx] = useState(-1);
    const [chartData, setChartData] = useState([]);
    const [autoScroll, setAutoScroll] = useState(true);
    const { showToast } = useToast();

    const logsEndRef = useRef(null);
    const viewportRef = useRef(null);

    const getTpsColor = (val) => {
        if (val >= 18) return '#34c759';
        if (val >= 15) return '#ffd60a';
        return '#ff3b30';
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

        // Immediate forced snap
        viewport.scrollTop = viewport.scrollHeight;

        // Continuous enforcement for 1s after logs update to prevent "jerkiness"
        let timer = setInterval(() => {
            if (viewport.scrollTop !== viewport.scrollHeight) {
                viewport.scrollTop = viewport.scrollHeight;
            }
        }, 50);

        return () => clearInterval(timer);
    }, [logs, autoScroll]);

    const handleScroll = (e) => {
        if (autoScroll && viewportRef.current) {
            const viewport = viewportRef.current;
            // Snappy snap: if user scrolls up even 1px, we slam it down
            if (viewport.scrollTop < viewport.scrollHeight - viewport.clientHeight) {
                viewport.scrollTop = viewport.scrollHeight;
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
                    // Give the server a moment to create/access the log file, then refresh console
                    setTimeout(() => {
                        if (startConsole) startConsole();
                    }, 1000);
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
        <div className="dashboard-root">
            {/* Real-time Telemetry Grid */}
            <div className="telemetry-grid">
                <div className="telemetry-card glass-panel cpu">
                    <div className="card-top">
                        <div className="icon-glow cpu-glow"><Cpu size={24} /></div>
                        <div className="meta">
                            <span className="label">Processing Node</span>
                            <span className="sub">Core Load Monitoring</span>
                        </div>
                    </div>
                    <div className="card-main">
                        <div className="value-group">
                            <span className="value">{stats.cpu.toFixed(1)}</span>
                            <span className="unit">%</span>
                        </div>
                        <div className="mini-chart">
                            <div className="load-label">Load Avg: {stats.load}</div>
                            <div className="progress-track">
                                <div className="progress-fill" style={{ width: `${stats.cpu}%` }}></div>
                            </div>
                        </div>
                    </div>
                </div>

                <div className="telemetry-card glass-panel ram">
                    <div className="card-top">
                        <div className="icon-glow ram-glow"><Database size={24} /></div>
                        <div className="meta">
                            <span className="label">Memory Buffer</span>
                            <span className="sub">Total System RAM Allocation</span>
                        </div>
                    </div>
                    <div className="card-main">
                        <div className="value-group">
                            <span className="value">{(stats.ramUsed / 1024).toFixed(1)}</span>
                            <span className="unit">GB</span>
                        </div>
                        <div className="mini-chart">
                            <div className="load-label">Cached: {stats.ramCache} MB</div>
                            <div className="progress-track">
                                <div className="progress-fill" style={{ width: `${(stats.ramUsed / stats.ramTotal) * 100}%` }}></div>
                            </div>
                        </div>
                    </div>
                </div>

                <div className="telemetry-card glass-panel disk">
                    <div className="card-top">
                        <div className="icon-glow disk-glow"><HardDrive size={24} /></div>
                        <div className="meta">
                            <span className="label">Storage Volume</span>
                            <span className="sub">Persistent Object Storage</span>
                        </div>
                    </div>
                    <div className="card-main">
                        <div className="value-group">
                            <span className="value">{stats.disk.replace('%', '')}</span>
                            <span className="unit">%</span>
                        </div>
                        <div className="mini-chart">
                            <div className="load-label">{stats.diskUsed} / {stats.diskTotal}</div>
                            <div className="progress-track">
                                <div className="progress-fill" style={{ width: stats.disk }}></div>
                            </div>
                        </div>
                    </div>
                </div>
            </div>

            {/* Network & Performance Status Bar */}
            <div className="status-ribbon glass-panel">
                <div className="status-section">
                    <div className="perf-metric">
                        <Activity size={18} className="pulse" />
                        <span className="perf-label">Heartrate (TPS):</span>
                        <span className="tps-block" style={{ color: getTpsColor(tps.t1) }}>{tps.t1.toFixed(2)}</span>
                    </div>
                    <div className="v-sep"></div>
                    <div className="perf-metric">
                        <Clock size={16} />
                        <span className="perf-label">Uptime:</span>
                        <span className="uptime-val">{stats.uptime}</span>
                    </div>
                    <div className="v-sep"></div>
                    <div className="perf-metric" onClick={() => onNavigate && onNavigate('players')} style={{ cursor: onNavigate ? 'pointer' : 'default' }}>
                        <Users size={16} />
                        <span className="perf-label">Players:</span>
                        <span className="uptime-val">{players.filter(p => p.online).length} Active</span>
                    </div>
                    <div className="v-sep"></div>
                    <div className="perf-metric">
                        <Fingerprint size={16} />
                        <span className="perf-label">Release:</span>
                        <span className="uptime-val">{serverVersion || 'Waiting for log...'}</span>
                    </div>
                </div>
                <div className="status-badge" style={{ background: isConnected ? 'rgba(52, 199, 89, 0.2)' : 'rgba(255, 59, 48, 0.2)', color: isConnected ? '#34c759' : '#ff3b30' }}>
                    <div className="dot" style={{ background: isConnected ? '#34c759' : '#ff3b30' }} />
                    {isConnected ? 'NODE CONNECTED' : 'NODE OFFLINE'}
                </div>
            </div>

            {/* Operations Interface */}
            <div className="ops-grid">
                <div className="glass-panel console-box">
                    <div className="box-header">
                        <div className="h-left">
                            <ConsoleIcon size={16} />
                            <h3>Terminal Access</h3>
                        </div>
                        <div className="h-right">
                            <button className={`op-btn ${autoScroll ? 'info-lite' : 'danger-lite'}`} onClick={() => setAutoScroll(!autoScroll)} title={autoScroll ? "Auto-scroll ON" : "Auto-scroll OFF"}>
                                {autoScroll ? <Activity size={14} /> : <Zap size={14} />}
                            </button>
                            <button className="op-btn danger-lite" onClick={() => clearLogs && clearLogs()} title="Clear Console Binary"><Trash2 size={14} /></button>
                            <div className="v-sep-mini" />
                            <button className="op-btn info-lite" onClick={() => socket?.emit('console:input', { command: 'list' })} title="List Online Players"><Users size={14} /></button>
                            <button className="op-btn warning-lite" onClick={() => socket?.emit('console:input', { command: 'tps' })} title="Check Server TPS"><Activity size={14} /></button>
                            <div className="v-sep-mini" />
                            <button className="op-btn start" onClick={() => control('start')} title="Boot Link"><Play size={14} /></button>
                            <button className="op-btn stop" onClick={() => control('stop')} title="Terminate Link"><Square size={14} /></button>
                            <button className="op-btn reload" onClick={() => control('reload')} title="Reload Server"><RefreshCw size={14} /></button>
                        </div>
                    </div>
                    <div className="console-viewport" ref={viewportRef} onScroll={handleScroll}>
                        {logs.map((log, i) => <div key={i} className="terminal-line">{log}</div>)}
                        <div ref={logsEndRef} />
                    </div>
                    <form onSubmit={sendCommand} className="command-input">
                        <span className="prompt">root@mc:~$</span>
                        <input value={command} onChange={e => setCommand(e.target.value)} onKeyDown={handleKeyDown} placeholder="Awaiting instruction..." />
                    </form>
                </div>

                <div className="glass-panel analytics-box">
                    <div className="box-header">
                        <div className="h-left">
                            <Radio size={16} />
                            <h3>Historical Data</h3>
                        </div>
                        <div className="stat-pill">{tps.t1.toFixed(1)} TPS</div>
                    </div>
                    <div className="chart-container">
                        <ResponsiveContainer width="100%" height="100%">
                            <AreaChart data={chartData}>
                                <defs>
                                    <linearGradient id="cpuGrad" x1="0" y1="0" x2="0" y2="1">
                                        <stop offset="5%" stopColor="#007aff" stopOpacity={0.4} />
                                        <stop offset="95%" stopColor="#007aff" stopOpacity={0} />
                                    </linearGradient>
                                    <linearGradient id="ramGrad" x1="0" y1="0" x2="0" y2="1">
                                        <stop offset="5%" stopColor="#ff2d55" stopOpacity={0.4} />
                                        <stop offset="05%" stopColor="#ff2d55" stopOpacity={0} />
                                    </linearGradient>
                                </defs>
                                <XAxis dataKey="name" hide />
                                <YAxis hide domain={[0, 100]} />
                                <Tooltip contentStyle={{ background: 'rgba(0,0,0,0.8)', backdropFilter: 'blur(15px)', border: '1px solid rgba(255,255,255,0.1)', borderRadius: '15px' }} />
                                <Area type="monotone" dataKey="cpu" stroke="#007aff" fill="url(#cpuGrad)" strokeWidth={3} isAnimationActive={false} />
                                <Area type="monotone" dataKey="ram" stroke="#ff2d55" fill="url(#ramGrad)" strokeWidth={3} isAnimationActive={false} />
                            </AreaChart>
                        </ResponsiveContainer>
                    </div>
                    <div className="legend-row">
                        <div className="legend-item"><div className="dot b" /> Processor</div>
                        <div className="legend-item"><div className="dot r" /> Memory</div>
                    </div>
                </div>
            </div>

            <div style={{ position: 'fixed', bottom: 10, right: 10, fontSize: '10px', opacity: 0.3, color: 'white', pointerEvents: 'none' }}>
                Dashboard v3.0.6 | Backend {isConnected ? 'Link Active' : 'Standby'}
            </div>

            <style jsx>{`
                .dashboard-root { display: flex; flex-direction: column; gap: 32px; height: 100%; overflow: hidden; padding-bottom: 20px; }
                
                /* TELEMETRY CARDS */
                .telemetry-grid { display: grid; grid-template-columns: repeat(3, 1fr); gap: 32px; flex-shrink: 0; }
                .telemetry-card { padding: 32px; display: flex; flex-direction: column; gap: 24px; transition: 0.4s var(--ease-liquid); }
                .telemetry-card:hover { transform: translateY(-5px); box-shadow: 0 20px 40px rgba(0,0,0,0.3); }
                
                .card-top { display: flex; align-items: center; gap: 20px; }
                .icon-glow { width: 56px; height: 56px; border-radius: 16px; display: flex; align-items: center; justify-content: center; color: white; position: relative; }
                .icon-glow::after { content: ''; position: absolute; inset: -5px; border-radius: 20px; background: inherit; filter: blur(15px); opacity: 0.3; }
                
                .cpu-glow { background: linear-gradient(135deg, #007aff, #00c6ff); }
                .ram-glow { background: linear-gradient(135deg, #ff2d55, #ff512f); }
                .disk-glow { background: linear-gradient(135deg, #34c759, #43e97b); }
                
                .meta { display: flex; flex-direction: column; }
                .label { font-size: 0.8rem; font-weight: 950; color: white; letter-spacing: 1px; text-transform: uppercase; }
                .sub { font-size: 0.65rem; color: var(--text-secondary); opacity: 0.5; font-weight: 700; }

                .card-main { display: flex; flex-direction: column; gap: 12px; }
                .value-group { display: flex; align-items: baseline; gap: 6px; }
                .value { font-size: 2.8rem; font-weight: 950; color: white; letter-spacing: -2px; line-height: 1; }
                .unit { font-size: 1rem; font-weight: 800; color: var(--text-secondary); opacity: 0.4; }
                
                .mini-chart { display: flex; flex-direction: column; gap: 8px; }
                .load-label { font-size: 0.65rem; font-family: var(--font-mono); color: var(--text-secondary); opacity: 0.6; }
                .progress-track { height: 6px; background: rgba(255,255,255,0.05); border-radius: 10px; overflow: hidden; }
                .progress-fill { height: 100%; background: white; border-radius: 10px; transition: width 0.8s var(--ease-liquid); }
                
                .cpu .progress-fill { background: #007aff; box-shadow: 0 0 10px rgba(0,122,255,0.5); }
                .ram .progress-fill { background: #ff2d55; box-shadow: 0 0 10px rgba(255,45,85,0.5); }
                .disk .progress-fill { background: #34c759; box-shadow: 0 0 10px rgba(52,199,89,0.5); }

                /* STATUS RIBBON */
                .status-ribbon { padding: 14px 28px; display: flex; align-items: center; justify-content: space-between; flex-shrink: 0; border: 1px solid rgba(255,255,255,0.05); }
                .status-section { display: flex; align-items: center; gap: 32px; }
                .perf-metric { display: flex; align-items: center; gap: 12px; font-weight: 800; font-size: 0.9rem; }
                .perf-label { color: var(--text-secondary); opacity: 0.5; font-size: 0.75rem; text-transform: uppercase; letter-spacing: 0.5px; }
                .tps-block { font-family: var(--font-mono); font-size: 1.1rem; font-weight: 900; }
                .uptime-val { color: white; opacity: 0.8; }
                .v-sep { width: 1px; height: 24px; background: rgba(255,255,255,0.05); }
                
                .status-badge { padding: 6px 16px; border-radius: 50px; font-size: 0.7rem; font-weight: 950; letter-spacing: 1.5px; display: flex; align-items: center; gap: 10px; border: 1px solid rgba(255,255,255,0.1); }
                .dot { width: 8px; height: 8px; border-radius: 50%; box-shadow: 0 0 10px currentColor; }
                .pulse { animation: pulse 2s infinite; }
                @keyframes pulse { 0% { opacity: 0.4; } 50% { opacity: 1; } 100% { opacity: 0.4; } }

                /* OPS GRID */
                .ops-grid { flex: 1; display: grid; grid-template-columns: 1fr 360px; gap: 32px; min-height: 0; }
                
                .console-box { display: flex; flex-direction: column; overflow: hidden; background: rgba(0,0,0,0.3); }
                .box-header { padding: 20px 28px; border-bottom: 1px solid rgba(255,255,255,0.05); display: flex; justify-content: space-between; align-items: center; }
                .h-left { display: flex; align-items: center; gap: 14px; }
                .h-left h3 { margin: 0; font-size: 0.85rem; font-weight: 900; color: white; text-transform: uppercase; letter-spacing: 1px; }
                
                .h-right { display: flex; gap: 12px; }
                .op-btn { width: 40px; height: 40px; border-radius: 12px; border: none; background: rgba(255,255,255,0.03); color: white; cursor: pointer; display: flex; align-items: center; justify-content: center; transition: 0.3s; border: 1px solid rgba(255,255,255,0.05); }
                .op-btn:hover { background: rgba(255,255,255,0.1); transform: translateY(-3px); }
                .start:hover { color: #34c759; border-color: rgba(52,199,89,0.3); }
                .stop:hover { color: #ff3b30; border-color: rgba(255,59,48,0.3); }
                .reload:hover { color: #007aff; transform: rotate(180deg); }
                .info-lite:hover { color: #64d2ff; border-color: rgba(100,210,255,0.3); }
                .warning-lite:hover { color: #ffd60a; border-color: rgba(255,214,10,0.3); }
                .v-sep-mini { width: 1px; height: 16px; background: rgba(255,255,255,0.1); margin: 0 4px; }

                .console-viewport { flex: 1; padding: 32px; overflow-y: auto; font-family: var(--font-mono); font-size: 0.9rem; line-height: 1.8; background: rgba(0,0,0,0.2); scrollbar-width: thin; }
                .terminal-line { margin-bottom: 8px; color: #d1d5db; position: relative; padding-left: 20px; }
                .terminal-line::before { content: '>'; position: absolute; left: 0; opacity: 0.3; color: var(--accent-primary); }
                
                .command-input { display: flex; align-items: center; padding: 20px 32px; background: rgba(0,0,0,0.4); border-top: 1px solid rgba(255,255,255,0.05); gap: 16px; }
                .prompt { color: var(--accent-primary); font-weight: 950; font-family: var(--font-mono); }
                .command-input input { flex: 1; background: transparent !important; border: none !important; color: white !important; font-family: var(--font-mono); outline: none; font-size: 0.95rem; }

                .analytics-box { padding: 32px; display: flex; flex-direction: column; gap: 24px; }
                .stat-pill { padding: 4px 12px; border-radius: 6px; background: rgba(255,255,255,0.05); font-family: var(--font-mono); font-size: 0.8rem; font-weight: 800; }
                .chart-container { flex: 1; min-height: 200px; margin: 10px 0; }
                .legend-row { display: flex; gap: 32px; padding-top: 24px; border-top: 1px solid rgba(255,255,255,0.05); }
                .legend-item { display: flex; align-items: center; gap: 10px; font-size: 0.75rem; font-weight: 800; color: var(--text-secondary); text-transform: uppercase; letter-spacing: 1px; }
                .dot { width: 10px; height: 10px; border-radius: 50%; }
                .dot.b { background: #007aff; box-shadow: 0 0 10px rgba(0,122,255,0.4); }
                .dot.r { background: #ff2d55; box-shadow: 0 0 10px rgba(255,45,85,0.4); }
            `}</style>
        </div>
    );
};

export default Dashboard;

