import React, { useState, useEffect } from 'react';
import { Terminal, Check, ArrowRight, Monitor, Moon, Sun, HardDrive, Hexagon, ShieldAlert, Rocket } from 'lucide-react';

const WelcomeModal = ({ onComplete, initialTheme, setTheme }) => {
    const [step, setStep] = useState(1);
    const [credentials, setCredentials] = useState({
        host: '',
        port: 22,
        username: '',
        password: '',
        path: '/home/mcserver'
    });
    const [localTheme, setLocalTheme] = useState(initialTheme);

    const handleNext = () => setStep(step + 1);

    const handleFinish = () => {
        localStorage.setItem('hasVisited', 'true');
        onComplete(credentials);
    };

    const handleThemeChange = (t) => {
        setLocalTheme(t);
        setTheme(t);
    };

    return (
        <div className="welcome-root">
            <div className="welcome-glass glass-panel shadow-premium">
                <div className="modal-progress">
                    <div className={`p-bar ${step >= 1 ? 'filled' : ''}`}></div>
                    <div className={`p-bar ${step >= 2 ? 'filled' : ''}`}></div>
                    <div className={`p-bar ${step >= 3 ? 'filled' : ''}`}></div>
                </div>

                <div className="modal-body">
                    {step === 1 && (
                        <div className="modal-step fade-in">
                            <div className="logo-burst">
                                <div className="logo-core">
                                    <Hexagon size={48} fill="currentColor" opacity={0.2} />
                                    <div className="core-icon"><Terminal size={24} /></div>
                                </div>
                            </div>
                            <h1 className="hero-text">SMM</h1>
                            <p className="hero-sub">Secure SSH Console for your Minecraft Infrastructure.</p>
                            <button className="glass-button launch-btn" onClick={handleNext}>
                                Initiate Sequence <Rocket size={18} />
                            </button>
                        </div>
                    )}

                    {step === 2 && (
                        <div className="modal-step fade-in">
                            <h2 className="step-title">Select Aesthetic Mode</h2>
                            <p className="step-sub">Define the visual properties of your workspace.</p>

                            <div className="aesthetic-options">
                                <div className={`aesthetic-card glass-panel ${localTheme === 'glass' ? 'active' : ''}`} onClick={() => handleThemeChange('glass')}>
                                    <div className="a-preview glass-a" />
                                    <span className="a-label">Liquid Glass</span>
                                    {localTheme === 'glass' && <div className="a-check"><Check size={12} /></div>}
                                </div>

                                <div className={`aesthetic-card glass-panel ${localTheme === 'dark' ? 'active' : ''}`} onClick={() => handleThemeChange('dark')}>
                                    <div className="a-preview dark-a"><Moon size={18} /></div>
                                    <span className="a-label">Obsidian Dark</span>
                                    {localTheme === 'dark' && <div className="a-check"><Check size={12} /></div>}
                                </div>

                                <div className={`aesthetic-card glass-panel ${localTheme === 'coder' ? 'active' : ''}`} onClick={() => handleThemeChange('coder')}>
                                    <div className="a-preview coder-a"><Terminal size={18} /></div>
                                    <span className="a-label">Matrix Code</span>
                                    {localTheme === 'coder' && <div className="a-check"><Check size={12} /></div>}
                                </div>
                            </div>

                            <button className="glass-panel next-util-btn" onClick={handleNext}>
                                Proceed to Host Configuration
                            </button>
                        </div>
                    )}

                    {step === 3 && (
                        <div className="modal-step fade-in">
                            <h2 className="step-title">Link Established</h2>
                            <p className="step-sub">Awaiting SSH credentials to bridge the connection.</p>

                            <div className="auth-form">
                                <div className="auth-row">
                                    <input className="glass-input" placeholder="Secure Host Address" value={credentials.host} onChange={e => setCredentials({ ...credentials, host: e.target.value })} />
                                    <input className="glass-input port" type="number" placeholder="22" value={credentials.port} onChange={e => setCredentials({ ...credentials, port: parseInt(e.target.value) })} />
                                </div>
                                <input className="glass-input full" placeholder="Identity (Username)" value={credentials.username} onChange={e => setCredentials({ ...credentials, username: e.target.value })} />
                                <input className="glass-input full" type="password" placeholder="Key (Password)" value={credentials.password} onChange={e => setCredentials({ ...credentials, password: e.target.value })} />

                                <div className="path-box glass-panel">
                                    <HardDrive size={18} opacity={0.4} />
                                    <input className="clean-input" placeholder="Root Path (e.g. /opt/minecraft)" value={credentials.path} onChange={e => setCredentials({ ...credentials, path: e.target.value })} />
                                </div>
                            </div>

                            <div className="security-notice">
                                <ShieldAlert size={14} />
                                <span>Credentials are stored locally and encrypted in transit.</span>
                            </div>

                            <button className="glass-button finish-btn" onClick={handleFinish}>
                                Establish Full Bridge
                            </button>
                        </div>
                    )}
                </div>
            </div>

            <style jsx>{`
                .welcome-root { position: fixed; inset: 0; z-index: 5000; display: flex; align-items: center; justify-content: center; background: rgba(0,0,0,0.8); backdrop-filter: blur(40px); animation: modal-fade 0.6s var(--ease-liquid); }
                @keyframes modal-fade { from { opacity: 0; } }
                
                .welcome-glass { width: 560px; min-height: 520px; display: flex; flex-direction: column; background: rgba(0,0,0,0.4); overflow: hidden; }
                
                .modal-progress { display: flex; height: 3px; gap: 4px; padding: 0 40px; margin-top: 40px; }
                .p-bar { flex: 1; background: rgba(255,255,255,0.05); border-radius: 10px; transition: 0.6s var(--ease-liquid); position: relative; overflow: hidden; }
                .p-bar.filled { background: var(--accent-primary); box-shadow: 0 0 10px var(--accent-primary); }
                .p-bar.filled::after { content: ''; position: absolute; inset: 0; background: linear-gradient(90deg, transparent, rgba(255,255,255,0.4), transparent); animation: progress-shine 2s infinite; }
                @keyframes progress-shine { from { transform: translateX(-100%); } to { transform: translateX(100%); } }

                .modal-body { flex: 1; display: flex; flex-direction: column; padding: 40px; }
                .modal-step { flex: 1; display: flex; flex-direction: column; align-items: center; text-align: center; }
                
                .logo-burst { margin-bottom: 40px; position: relative; }
                .logo-core { width: 100px; height: 100px; background: var(--accent-gradient); border-radius: 30px; display: flex; align-items: center; justify-content: center; position: relative; z-index: 2; box-shadow: 0 20px 40px rgba(0,0,0,0.4); }
                .core-icon { position: absolute; }
                .logo-burst::after { content: ''; position: absolute; inset: -20px; border-radius: 50%; background: var(--accent-primary); filter: blur(40px); opacity: 0.2; z-index: 1; }

                .hero-text { font-size: 2.4rem; font-weight: 950; letter-spacing: 8px; margin: 0; color: white; text-shadow: 0 10px 20px rgba(0,0,0,0.3); }
                .hero-sub { color: var(--text-secondary); opacity: 0.6; margin: 16px 0 48px; font-weight: 600; font-size: 1rem; max-width: 340px; line-height: 1.6; }
                .launch-btn { height: 56px; padding: 0 40px; font-size: 1.1rem; box-shadow: 0 20px 40px rgba(0,122,255,0.2); }

                .step-title { font-size: 1.6rem; font-weight: 900; color: white; margin: 0; }
                .step-sub { color: var(--text-secondary); opacity: 0.5; margin: 8px 0 40px; font-weight: 700; font-size: 0.9rem; }

                .aesthetic-options { display: grid; grid-template-columns: repeat(3, 1fr); gap: 16px; width: 100%; margin-bottom: 40px; }
                .aesthetic-card { padding: 20px; cursor: pointer; display: flex; flex-direction: column; align-items: center; justify-content: center; gap: 12px; position: relative; transition: 0.3s; background: rgba(255,255,255,0.02); aspect-ratio: 1/1; border-radius: 50%; }
                .aesthetic-card:hover { transform: translateY(-5px); background: rgba(255,255,255,0.05); }
                .aesthetic-card.active { border-color: var(--accent-primary); background: rgba(var(--accent-primary-rgb), 0.1); border: 2px solid var(--accent-primary); }
                
                .a-preview { width: 50px; height: 50px; border-radius: 50%; display: flex; align-items: center; justify-content: center; }
                .glass-a { background: var(--accent-gradient); }
                .dark-a { background: #0c0c0e; border: 1px solid rgba(255,255,255,0.1); color: #555; }
                .coder-a { background: #000; border: 1px solid #0f0; color: #0f0; }
                
                .a-label { font-size: 0.75rem; font-weight: 900; text-transform: uppercase; letter-spacing: 1px; }
                .a-check { position: absolute; top: 0; right: 0; background: var(--accent-primary); color: white; border-radius: 50%; padding: 6px; width: 24px; height: 24px; display: flex; align-items: center; justify-content: center; }

                .next-util-btn { width: 100%; height: 50px; border: none; cursor: pointer; font-weight: 800; color: white; margin-top: auto; }

                /* AUTH FORM */
                .auth-form { width: 100%; display: flex; flex-direction: column; gap: 12px; }
                .auth-row { display: flex; gap: 12px; }
                .auth-row .glass-input { flex: 1; }
                .auth-row .port { width: 100px; flex: none; }
                .full { width: 100%; }
                
                .path-box { padding: 0 16px; height: 50px; display: flex; align-items: center; gap: 16px; background: rgba(0,0,0,0.2); }
                .clean-input { flex: 1; background: transparent; border: none; outline: none; color: white; font-family: var(--font-mono); font-size: 0.9rem; }

                .security-notice { display: flex; align-items: center; gap: 10px; font-size: 0.7rem; color: #34c759; opacity: 0.5; font-weight: 800; margin: 24px 0 40px; }
                .finish-btn { width: 100%; height: 56px; margin-top: auto; box-shadow: 0 15px 30px rgba(0,122,255,0.15); }

                .fade-in { animation: step-in 0.5s var(--ease-liquid); }
                @keyframes step-in { from { opacity: 0; transform: translateY(10px); } }
            `}</style>
        </div>
    );
};

export default WelcomeModal;
