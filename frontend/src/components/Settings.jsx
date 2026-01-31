import React, { useState, useEffect, useRef } from 'react';
import { useServer } from '../context/ServerContext';
import { useSocket } from '../context/SocketContext';
import { HardDrive, Server, Palette, Loader2, AlertCircle, Upload, Image as ImageIcon, Check } from 'lucide-react';

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
    const [uploading, setUploading] = useState(false);
    const fileInputRef = useRef(null);

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
        updateConfig({ path: mcPath, screenName: mcScreen });
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

    const handleWallpaperUpload = async (e) => {
        const file = e.target.files[0];
        if (!file) return;

        const formData = new FormData();
        formData.append('wallpaper', file);

        setUploading(true);
        try {
            const response = await fetch(`${import.meta.env.VITE_API_URL || 'http://localhost:3001'}/api/settings/wallpaper`, {
                method: 'POST',
                body: formData
            });
            const data = await response.json();
            if (data.url) {
                document.documentElement.style.setProperty('--wallpaper', `url(${import.meta.env.VITE_API_URL || 'http://localhost:3001'}${data.url})`);
            }
        } catch (error) {
            console.error('Wallpaper upload failed:', error);
        } finally {
            setUploading(false);
        }
    };

    const themes = [
        { id: 'glass', name: 'Liquid Glass', desc: 'Standard semi-transparent aesthetic' },
        { id: 'forest', name: 'Organic Forest', desc: 'Natural greens and soft rounds' },
        { id: 'coder', name: 'Terminal Coder', desc: 'Matrix vibes with sharp edges' },
        { id: 'magma', name: 'Volcanic Magma', desc: 'High contrast heat theme' }
    ];

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
                            <button type="button" onClick={handleDisconnect} className="glass-button btn-danger">Disconnect Server</button>
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

                    <div className="wallpaper-upload-section">
                        <label>Custom Wallpaper</label>
                        <div className="upload-box glass-panel" onClick={() => fileInputRef.current?.click()}>
                            {uploading ? (
                                <Loader2 className="animate-spin" size={32} />
                            ) : (
                                <>
                                    <Upload size={32} />
                                    <div className="upload-texts">
                                        <span className="main-text">Click to upload new background</span>
                                        <span className="sub-text">JPG, PNG or WebP supported</span>
                                    </div>
                                </>
                            )}
                            <input
                                type="file"
                                ref={fileInputRef}
                                style={{ display: 'none' }}
                                onChange={handleWallpaperUpload}
                                accept="image/*"
                            />
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

                    <form onSubmit={handleConfigSave} className="settings-form">
                        <div className="form-group">
                            <label>Base Server Directory</label>
                            <input className="glass-input" value={mcPath} onChange={e => setMcPath(e.target.value)} />
                            <span className="hint">Must be the absolute path to your minecraft directory.</span>
                        </div>
                        <div className="form-group">
                            <label>Screen Instance Name</label>
                            <input className="glass-input" value={mcScreen} onChange={e => setMcScreen(e.target.value)} />
                        </div>
                        {saveStatus && (
                            <div className="success-banner">
                                <Check size={16} />
                                <span>{saveStatus}</span>
                            </div>
                        )}
                        <button type="submit" className="glass-button">Update Engine Config</button>
                    </form>
                </div>
            </div>

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
                .form-group label { font-size: 0.85rem; font-weight: 700; color: var(--text-secondary); text-transform: uppercase; letter-spacing: 1px; }
                .private-key-textarea { height: 120px; font-family: var(--font-mono); font-size: 0.8rem; }
                .hint { font-size: 0.8rem; color: var(--text-secondary); opacity: 0.7; font-style: italic; }
                
                .theme-grid {
                    display: grid;
                    grid-template-columns: repeat(auto-fill, minmax(200px, 1fr));
                    gap: 20px;
                    margin-top: 10px;
                }
                .theme-card {
                    padding: 0;
                    border: none;
                    text-align: left;
                    cursor: pointer;
                    background: rgba(255,255,255,0.03);
                    border: 1px solid rgba(255,255,255,0.05);
                }
                .theme-card.active {
                    border-color: var(--accent-primary);
                    background: rgba(var(--accent-primary), 0.05);
                }
                .theme-preview {
                    height: 100px;
                    width: 100%;
                    border-bottom: 1px solid rgba(255,255,255,0.05);
                    position: relative;
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
                    padding: 4px;
                    border-radius: 50%;
                }
                .theme-info { padding: 16px; display: flex; flex-direction: column; gap: 4px; }
                .theme-name { font-weight: 700; color: var(--text-primary); }
                .theme-desc { font-size: 0.8rem; color: var(--text-secondary); }

                .wallpaper-upload-section { margin-top: 40px; }
                .wallpaper-upload-section label { display: block; margin-bottom: 16px; font-weight: 700; color: var(--text-secondary); text-transform: uppercase; letter-spacing: 1px; font-size: 0.85rem; }
                .upload-box {
                    height: 140px;
                    border: 2px dashed rgba(255,255,255,0.1);
                    display: flex;
                    align-items: center;
                    justify-content: center;
                    gap: 24px;
                    cursor: pointer;
                    transition: all 0.3s;
                    background: rgba(255,255,255,0.01);
                }
                .upload-box:hover {
                    border-color: var(--accent-primary);
                    background: rgba(var(--accent-primary), 0.05);
                    transform: scale(1.01);
                }
                .upload-texts { display: flex; flex-direction: column; }
                .upload-texts .main-text { font-weight: 700; font-size: 1.1rem; }
                .upload-texts .sub-text { font-size: 0.85rem; color: var(--text-secondary); }

                .btn-danger { background: linear-gradient(135deg, #ef4444 0%, #991b1b 100%); }
                
                .error-banner {
                    background: rgba(239, 68, 68, 0.1);
                    border: 1px solid rgba(239, 68, 68, 0.2);
                    color: #f87171;
                    padding: 16px;
                    border-radius: 12px;
                    display: flex;
                    align-items: center;
                    gap: 12px;
                    margin-bottom: 24px;
                }

                @keyframes animate-spin { from { transform: rotate(0deg); } to { transform: rotate(360deg); } }
                .animate-spin { animation: animate-spin 1s linear infinite; }
            `}</style>
        </div>
    );
};

export default Settings;
