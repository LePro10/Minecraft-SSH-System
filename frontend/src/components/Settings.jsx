import React, { useState, useEffect, useRef } from 'react';
import { useServer } from '../context/ServerContext';
import { useSocket } from '../context/SocketContext';
import { useToast } from '../context/ToastContext';
import { HardDrive, Server, Palette, Loader2, AlertCircle, Upload, Image as ImageIcon, Check, MousePointer2, Box } from 'lucide-react';

const Settings = ({ theme, setTheme, prefill }) => {
    const {
        config, updateConfig, isConnected, isConnecting, lastError, connectSSH, disconnectSSH
    } = useServer();

    const [sshConfig, setSshConfig] = useState({
        host: '',
        port: 22,
        username: '',
        password: ''
    });

    const [mcPath, setMcPath] = useState(config.path);
    const [mcScreen, setMcScreen] = useState(config.screenName);
    const [mcStart, setMcStart] = useState(config.startScript || './start.sh');
    const [mcStop, setMcStop] = useState(config.stopScript || 'stop');
    const [radius, setRadius] = useState(localStorage.getItem('theme_radius') || 'soft');
    const { showToast } = useToast();
    const [uploading, setUploading] = useState(false);
    const fileInputRef = useRef(null);

    const themes = [
        { id: 'glass', name: 'Liquid Glass', desc: 'Default vibrant sapphire' },
        { id: 'coder', name: 'Matrix Coder', desc: 'The hacker console' },
        { id: 'obsidian', name: 'Obsidian Black', desc: 'High contrast OLED experience' },
        { id: 'gold', name: 'Gold', desc: 'Premium luxury gold' },
        { id: 'berry', name: 'Berry', desc: 'Deep purple vibes' },
        { id: 'slate', name: 'Slate', desc: 'Professional gray' },
        { id: 'crimson', name: 'Crimson', desc: 'Deep blood red' },
        { id: 'moss', name: 'Moss', desc: 'Natural organic green' }
    ];

    useEffect(() => {
        setMcPath(config.path);
        setMcScreen(config.screenName);
    }, [config.path, config.screenName]);

    useEffect(() => {
        const saved = localStorage.getItem('ssh_credentials');
        if (saved) {
            setSshConfig(JSON.parse(saved));
        } else if (prefill) {
            setSshConfig(prev => ({ ...prev, ...prefill }));
        }
    }, [prefill]);

    const handleConnect = (e) => {
        e.preventDefault();
        connectSSH(sshConfig);
    };

    const handleDisconnect = (e) => {
        e.preventDefault();
        disconnectSSH();
    };

    const [saveStatus, setSaveStatus] = useState(null);
    const { socket } = useSocket();

    useEffect(() => {
        if (!socket) return;
        const handleAck = (res) => {
            if (res.success) {
                setSaveStatus('Config synchronized successfully.');
                setTimeout(() => setSaveStatus(null), 3000);
            }
        };
        socket.on('config:ack', handleAck);
        return () => socket.off('config:ack', handleAck);
    }, [socket]);

    const handleConfigSave = (e) => {
        if (e) e.preventDefault();
        updateConfig({
            path: mcPath,
            screenName: mcScreen,
            startScript: mcStart,
            stopScript: mcStop
        });
    };

    const updateTheme = async (newTheme) => {
        setTheme(newTheme);
        try {
            await fetch(`${import.meta.env.VITE_API_URL || 'http://localhost:3001'}/api/settings`, {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ theme: newTheme })
            });
        } catch (e) {
            console.error('Failed to save theme setting');
        }
    };


    return (
        <div className="settings-scroll-container">
            <div className="glass-panel settings-container">
                <div className="settings-section">
                    <div className="section-header">
                        <Server size={22} className="accent-text" />
                        <div>
                            <h3>Server Connection</h3>
                            <p className="section-desc">Manage your SSH credentials and connection status.</p>
                        </div>
                    </div>

                    {lastError && (
                        <div className="error-banner">
                            <AlertCircle size={16} />
                            <span>{lastError}</span>
                        </div>
                    )}

                    <form onSubmit={handleConnect} className="settings-form">
                        <div className="form-grid">
                            <div className="form-group">
                                <label>Host Address</label>
                                <input className="glass-input" value={sshConfig.host} onChange={e => setSshConfig({ ...sshConfig, host: e.target.value })} placeholder="127.0.0.1" />
                            </div>
                            <div className="form-group">
                                <label>SSH Port</label>
                                <input className="glass-input" type="number" value={sshConfig.port} onChange={e => setSshConfig({ ...sshConfig, port: parseInt(e.target.value) })} />
                            </div>
                            <div className="form-group">
                                <label>SSH Username</label>
                                <input className="glass-input" value={sshConfig.username} onChange={e => setSshConfig({ ...sshConfig, username: e.target.value })} placeholder="root" />
                            </div>
                            <div className="form-group">
                                <label>SSH Password</label>
                                <input className="glass-input" type="password" value={sshConfig.password} onChange={e => setSshConfig({ ...sshConfig, password: e.target.value })} />
                            </div>
                        </div>

                        <div className="form-group full-width">
                            <label>Private Key (Optional)</label>
                            <textarea
                                value={sshConfig.privateKey || ''}
                                onChange={e => setSshConfig({ ...sshConfig, privateKey: e.target.value })}
                                placeholder="-----BEGIN RSA PRIVATE KEY-----..."
                                className="glass-input private-key-textarea"
                            />
                        </div>

                        {isConnected ? (
                            <button type="button" onClick={handleDisconnect} className="glass-button btn-danger disconnect-btn">Disconnect Server</button>
                        ) : (
                            <button type="submit" className={`glass-button ${isConnecting ? 'loading' : ''}`} disabled={isConnecting}>
                                {isConnecting ? <><Loader2 className="animate-spin" size={18} /> Connecting...</> : 'Connect SSH'}
                            </button>
                        )}
                    </form>
                </div>

                <div className="divider"></div>

                <div className="settings-section">
                    <div className="section-header">
                        <Palette size={22} className="accent-text" />
                        <div>
                            <h3>Personalization</h3>
                            <p className="section-desc">Customize your dashboard's look and feel.</p>
                        </div>
                    </div>

                    <div className="theme-grid">
                        {themes.map(t => (
                            <button
                                key={t.id}
                                className={`theme-card glass-panel ${theme === t.id ? 'active' : ''}`}
                                onClick={() => updateTheme(t.id)}
                            >
                                <div className={`theme-preview ${t.id}-preview`}>
                                    {theme === t.id && <div className="active-check"><Check size={16} /></div>}
                                </div>
                                <div className="theme-info">
                                    <span className="theme-name">{t.name}</span>
                                    <span className="theme-desc">{t.desc}</span>
                                </div>
                            </button>
                        ))}
                    </div>

                    <div className="customization-row">
                        <div className="form-group">
                            <label><Box size={16} /> Interface Radius</label>
                            <div className="radius-selector glass-panel">
                                {['sharp', 'soft', 'round'].map(r => (
                                    <button
                                        key={r}
                                        className={radius === r ? 'active' : ''}
                                        onClick={() => {
                                            setRadius(r);
                                            localStorage.setItem('theme_radius', r);
                                            document.documentElement.setAttribute('data-radius', r);
                                            showToast(`Radius set to ${r}`, 'info');
                                        }}
                                    >
                                        {r.toUpperCase()}
                                    </button>
                                ))}
                            </div>
                        </div>
                    </div>

                </div>

                <div className="divider"></div>

                <div className="settings-section">
                    <div className="section-header">
                        <HardDrive size={22} className="accent-text" />
                        <div>
                            <h3>Server Engine Path</h3>
                            <p className="section-desc">Technical parameters for the Minecraft process.</p>
                        </div>
                    </div>

                    <form onSubmit={handleConfigSave} className="settings-form engine-config-form">
                        <div className="form-group full-width mb-32">
                            <label>Base Server Directory</label>
                            <input className="glass-input" value={mcPath} onChange={e => setMcPath(e.target.value)} placeholder="/home/user/mcserver" />
                            <span className="hint">Absolute path where your server files are located.</span>
                        </div>

                        <div className="engine-grid">
                            <div className="form-group">
                                <label>Screen Instance Name</label>
                                <input className="glass-input" value={mcScreen} onChange={e => setMcScreen(e.target.value)} placeholder="minecraft" />
                                <span className="hint">Used for default screen-based execution.</span>
                            </div>
                            <div className="form-group">
                                <label>Start Command (Optional)</label>
                                <input className="glass-input" value={mcStart} onChange={e => setMcStart(e.target.value)} placeholder="java -jar server.jar" />
                                <span className="hint">Leave empty for default (java -jar server.jar).</span>
                            </div>
                            <div className="form-group">
                                <label>Stop Command</label>
                                <input className="glass-input" value={mcStop} onChange={e => setMcStop(e.target.value)} placeholder="stop" />
                                <span className="hint">Command sent to console to stop server.</span>
                            </div>
                        </div>

                        {saveStatus && (
                            <div className="success-banner">
                                <Check size={16} />
                                <span>{saveStatus}</span>
                            </div>
                        )}
                        <button type="submit" className="glass-button engine-submit-btn">Update Engine Configuration</button>
                    </form>
                </div>
            </div >

            <style jsx>{`
                .success-banner {
                    background: rgba(52, 199, 89, 0.1);
                    border: 1px solid rgba(52, 199, 89, 0.2);
                    color: #34c759;
                    padding: 16px;
                    border-radius: 12px;
                    display: flex;
                    align-items: center;
                    gap: 12px;
                    margin-bottom: 24px;
                    font-weight: 700;
                    font-size: 0.9rem;
                    animation: slideIn 0.3s ease;
                }
                @keyframes slideIn { from { opacity: 0; transform: translateY(-10px); } }
                .settings-scroll-container { 
                    height: 100%; 
                    overflow-y: auto; 
                    padding: 20px;
                    scrollbar-width: thin;
                    scrollbar-color: rgba(255,255,255,0.1) transparent;
                }
                .settings-container { 
                    max-width: 1000px; 
                    margin: 0 auto;
                    padding: 48px;
                    display: flex;
                    flex-direction: column;
                    gap: 60px;
                    background: var(--bg-panel);
                }
                .section-header {
                    display: flex;
                    gap: 20px;
                    margin-bottom: 32px;
                }
                .section-header h3 {
                    margin: 0;
                    font-size: 1.5rem;
                    font-weight: 800;
                    letter-spacing: -0.5px;
                }
                .section-desc {
                    margin: 4px 0 0 0;
                    color: var(--text-secondary);
                    font-size: 0.95rem;
                }
                .accent-text { color: var(--accent-primary); }
                .divider { height: 1px; background: var(--glass-border); width: 100%; opacity: 0.5; }
                
                .form-grid {
                    display: grid;
                    grid-template-columns: 1fr 1fr;
                    gap: 24px;
                    margin-bottom: 24px;
                }
                .form-group { display: flex; flex-direction: column; gap: 8px; }
                .form-group label { font-size: 0.75rem; font-weight: 600; color: var(--text-secondary); text-transform: uppercase; letter-spacing: 0.5px; opacity: 0.8; margin-left: 2px; }
                .private-key-textarea { height: 120px; font-family: var(--font-mono); font-size: 0.8rem; }
                .hint { font-size: 0.75rem; color: var(--text-secondary); opacity: 0.5; font-style: normal; margin-top: 4px; margin-left: 2px; }
                
                .theme-grid {
                    display: grid;
                    grid-template-columns: repeat(auto-fill, minmax(200px, 1fr));
                    gap: 20px;
                    margin-top: 10px;
                }
                .theme-card {
                    padding: 0;
                    border: none;
                    display: flex;
                    flex-direction: column;
                    background: rgba(255,255,255,0.03);
                    border: 1px solid rgba(255,255,255,0.1);
                    border-radius: 16px;
                    overflow: hidden;
                    cursor: pointer;
                    transition: all 0.2s;
                    position: relative;
                }
                .theme-card:hover { transform: translateY(-2px); border-color: var(--accent-primary); }
                .theme-card.active { border: 2px solid var(--accent-primary); box-shadow: 0 0 20px rgba(var(--accent-primary-rgb), 0.2); }
                
                .theme-preview {
                    width: 100%;
                    aspect-ratio: 1 / 1; /* Force Square */
                    background: linear-gradient(135deg, rgba(255,255,255,0.1), rgba(0,0,0,0));
                }
                .glass-preview { background: linear-gradient(135deg, #1e293b, #0f172a); }
                .forest-preview { background: linear-gradient(135deg, #064e3b, #065f46); }
                .coder-preview { background: linear-gradient(135deg, #022c22, #000); }
                .magma-preview { background: linear-gradient(135deg, #450a0a, #7f1d1d); }
                
                .active-check {
                    position: absolute;
                    top: 10px;
                    right: 10px;
                    background: var(--accent-primary);
                    color: white;
                    width: 24px;
                    height: 24px;
                    border-radius: 50%;
                    display: flex;
                    align-items: center;
                    justify-content: center;
                    box-shadow: 0 4px 10px rgba(0,0,0,0.3);
                }
                
                .theme-info { padding: 16px; display: flex; flex-direction: column; gap: 4px; }
                .theme-name { font-weight: 700; color: var(--text-primary); }
                .theme-desc { font-size: 0.8rem; color: var(--text-secondary); }

                .customization-row { margin-top: 32px; }
                .customization-row label { display: block; margin-bottom: 8px; font-weight: 500; color: var(--text-secondary); }
                .radius-selector {
                    display: grid;
                    grid-template-columns: 1fr 1fr 1fr;
                    padding: 4px;
                    background: rgba(0,0,0,0.3);
                    border-radius: 12px;
                    border: 1px solid rgba(255,255,255,0.05);
                }
                .radius-selector button {
                    background: transparent;
                    border: none;
                    color: var(--text-secondary);
                    padding: 10px;
                    border-radius: 8px;
                    font-size: 0.75rem;
                    font-weight: 800;
                    cursor: pointer;
                    transition: all 0.2s;
                    letter-spacing: 1px;
                }
                .radius-selector button.active {
                    background: var(--accent-gradient);
                color: white;
                box-shadow: 0 4px 15px rgba(0,0,0,0.2);
                }

                .btn-danger { background: linear-gradient(135deg, #ef4444 0%, #991b1b 100%); }
                .disconnect-btn { margin-top: 32px; width: 100%; }
                
                .engine-grid {
                    display: grid;
                    grid-template-columns: 1fr 1fr;
                    gap: 24px;
                    margin-top: 24px;
                }
                .mb-32 { margin-bottom: 32px; }
                .engine-config-form .full-width { grid-column: span 2; }
                .engine-submit-btn { margin-top: 40px; width: 100%; border-color: var(--accent-primary); color: white; }
                .engine-submit-btn:hover { background: var(--accent-primary); color: black; }

                .obsidian-preview {background: #000; }
                .midnight-preview {background: #020617; }
                .aurora-preview {background: #011c1a; }
                .cyberpunk-preview {background: #0b0114; }
                .sakura-preview {background: #1a0b0f; }
                .gold-preview {background: #12100e; }
                .berry-preview {background: #120512; }
                .slate-preview {background: #0f172a; }
                .crimson-preview {background: #1a0505; }
                .steel-preview {background: #0d1117; }
                .moss-preview {background: #111a11; }

                @keyframes animate-spin {from {transform: rotate(0deg); } to {transform: rotate(360deg); } }
                .animate-spin {animation: animate-spin 1s linear infinite; }
            `}</style>
        </div >
    );
};

export default Settings;
