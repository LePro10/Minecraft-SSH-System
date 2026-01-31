import React, { useState, useEffect, useRef } from 'react';
import { useServer } from '../context/ServerContext';
import { File, Folder, ChevronRight, Hash, HardDrive, Plus, Upload, Download, Trash2, Edit3, X, Save, Maximize2, Terminal, Loader2, AlertCircle, FileText, Code, FolderOpen, ArrowLeft } from 'lucide-react';
import { useToast } from '../context/ToastContext';

const FileManager = ({ setDirty }) => {
    const { config, isConnected } = useServer();
    const [path, setPath] = useState(config?.path || '');
    const [items, setItems] = useState([]);
    const [loading, setLoading] = useState(false);
    const [editor, setEditor] = useState({ open: false, file: null, content: '', saving: false });
    const [isDirty, setIsDirty] = useState(false);
    const [selection, setSelection] = useState(new Set());
    const { showToast } = useToast();

    useEffect(() => {
        if (setDirty) setDirty(isDirty);
    }, [isDirty, setDirty]);

    const API_BASE = import.meta.env.VITE_API_URL || 'http://localhost:3001';

    useEffect(() => {
        if (config?.path && !path) {
            setPath(config.path);
        }
    }, [config.path]);

    const fetchFiles = async (targetPath) => {
        if (!isConnected || !targetPath) return;
        setLoading(true);
        try {
            const res = await fetch(`${API_BASE}/api/files/list?path=${encodeURIComponent(targetPath)}`);
            const data = await res.json();
            if (res.ok) {
                setItems(data.filter(i => i.name !== '.' && i.name !== '..'));
            } else console.error(data.error);
        } catch (e) {
            console.error(e);
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        if (isConnected && path) fetchFiles(path);
    }, [path, isConnected]);

    const handleOpen = (item) => {
        console.log('Opening item:', item);
        if (item.isDirectory) {
            const newPath = `${path}/${item.name}`.replace(/\/+/g, '/');
            console.log('Navigating to:', newPath);
            setPath(newPath);
            setSelection(new Set());
        } else {
            console.log('Opening file editor for:', item.name);
            openEditor(item);
        }
    };

    const openEditor = async (file) => {
        const filePath = `${path}/${file.name}`.replace(/\/+/g, '/');
        setEditor({ ...editor, open: true, file, content: 'Reading data stream...', saving: false });
        setIsDirty(false);
        try {
            const res = await fetch(`${API_BASE}/api/files/content?path=${encodeURIComponent(filePath)}`);
            if (res.ok) {
                const text = await res.text();
                setEditor(prev => ({ ...prev, content: text }));
            } else {
                const err = await res.json().catch(() => ({ error: 'Unknown server error' }));
                throw new Error(err.error);
            }
        } catch (e) {
            setEditor(prev => ({ ...prev, content: `CRITICAL ERROR: ${e.message}` }));
        }
    };

    const saveFile = async () => {
        const filePath = `${path}/${editor.file.name}`.replace(/\/+/g, '/');
        setEditor(prev => ({ ...prev, saving: true }));
        try {
            const res = await fetch(`${API_BASE}/api/files/write`, {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ path: filePath, content: editor.content })
            });
            if (res.ok) {
                setIsDirty(false);
                showToast('Archive updated successfully.', 'success');
            } else {
                showToast('Archive write failed.', 'error');
            }
        } catch (e) {
            showToast('Host connection lost.', 'error');
        } finally {
            setEditor(prev => ({ ...prev, saving: false }));
        }
    };

    const closeEditor = () => {
        if (isDirty) {
            if (!window.confirm('You have unsaved changes in the buffer. Discard them?')) return;
        }
        setEditor({ ...editor, open: false });
        setIsDirty(false);
    };

    const handleBack = () => {
        if (!path || path === '/' || path === config?.path) return;
        const parent = path.split('/').slice(0, -1).join('/') || '/';
        setPath(parent);
    };

    const getFileIcon = (name, isDir) => {
        if (isDir) return <FolderOpen size={20} className="dir-icon" />;
        const ext = name.split('.').pop().toLowerCase();
        if (['yml', 'json', 'toml', 'properties', 'yaml'].includes(ext)) return <Code size={20} className="code-icon" />;
        if (['log', 'txt', 'sh', 'bat'].includes(ext)) return <FileText size={20} className="text-icon" />;
        return <File size={20} className="file-icon" />;
    };

    const renderCrumbs = () => {
        if (!path) return null;
        const basePath = config?.path || '';
        const relativePath = path.startsWith(basePath) ? path.slice(basePath.length) : path;
        const parts = relativePath.split('/').filter(p => p);

        return (
            <div className="crumbs">
                <span className="crumb root" onClick={() => setPath(config?.path || '/')}>root</span>
                {parts.map((p, i) => (
                    <React.Fragment key={i}>
                        <ChevronRight size={14} className="crumb-sep" />
                        <span className="crumb" onClick={() => {
                            const newPath = basePath + '/' + parts.slice(0, i + 1).join('/');
                            setPath(newPath.replace(/\/+/g, '/'));
                        }}>{p}</span>
                    </React.Fragment>
                ))}
            </div>
        );
    };

    return (
        <div className="file-manager-root">
            <header className="fm-header glass-panel">
                <div className="header-breadcrumbs">
                    <div className="drive-icon"><HardDrive size={18} /></div>
                    {renderCrumbs()}
                </div>
                <div className="header-controls">
                    <button className="glass-panel util-btn" onClick={handleBack} disabled={!path || path === config?.path}>
                        <ArrowLeft size={16} /> Back
                    </button>
                    <button className="glass-button upload-btn"><Upload size={16} /> Upload Buffer</button>
                    <button className="glass-panel util-btn"><Plus size={16} /></button>
                </div>
            </header>

            <div className="explorer-surface glass-panel">
                {loading ? (
                    <div className="explorer-loader">
                        <Loader2 className="spin" size={40} />
                        <p>Scanning sectors...</p>
                    </div>
                ) : (
                    <div className="file-list-view">
                        <div className="view-header">
                            <span className="h-name">Identity</span>
                            <span className="h-size">Scale</span>
                            <span className="h-date">Sync Date</span>
                        </div>
                        {items.length === 0 && <div className="void-state">No entities detected in this sector.</div>}
                        {items.map(item => (
                            <div key={item.name} className={`file-entry ${selection.has(item.name) ? 'active' : ''}`} onClick={() => handleOpen(item)}>
                                <div className="entry-identity">
                                    <div className="entry-icon">{getFileIcon(item.name, item.isDirectory)}</div>
                                    <span className="entry-name">{item.name}</span>
                                </div>
                                <div className="entry-size">{item.isDirectory ? '--' : (item.size / 1024).toFixed(1) + ' KB'}</div>
                                <div className="entry-date">Decrypted</div>
                            </div>
                        ))}
                    </div>
                )}
            </div>

            {editor.open && (
                <div className="editor-overlay">
                    <div className="editor-glass glass-panel shadow-premium">
                        <div className="ed-header">
                            <div className="ed-meta">
                                <div className="ed-type-icon">{getFileIcon(editor.file.name, false)}</div>
                                <div className="ed-info">
                                    <h3>{editor.file.name}</h3>
                                    <p>{path}</p>
                                </div>
                            </div>
                            <div className="ed-actions">
                                <button className="glass-button save-action" onClick={saveFile} disabled={editor.saving}>
                                    {editor.saving ? <Loader2 size={16} className="spin" /> : <Save size={16} />}
                                    {editor.saving ? 'Syncing...' : 'Commit Changes'}
                                </button>
                                <button className="glass-panel close-action" onClick={closeEditor}><X size={20} /></button>
                            </div>
                        </div>

                        <div className="ed-viewport">
                            <div className="ed-liner">
                                {editor.content.split('\n').map((_, i) => <div key={i} className="line-num">{i + 1}</div>)}
                            </div>
                            <textarea
                                className="code-textarea"
                                value={editor.content}
                                onChange={e => {
                                    setEditor({ ...editor, content: e.target.value });
                                    setIsDirty(true);
                                }}
                                spellCheck="false"
                                wrap="off"
                            />
                        </div>

                        <div className="ed-footer">
                            <div className="f-stat"><Hash size={12} /> {editor.content.split('\n').length} Lines</div>
                            <div className="f-stat"><Terminal size={12} /> UTF-8 Encoding</div>
                            <div className="f-stat"><Maximize2 size={12} /> Full Sync</div>
                        </div>
                    </div>
                </div>
            )}

            <style jsx>{`
                .file-manager-root { height: 100%; display: flex; flex-direction: column; gap: 24px; }
                .fm-header { padding: 20px 32px; display: flex; justify-content: space-between; align-items: center; }
                
                .header-breadcrumbs { display: flex; align-items: center; gap: 16px; }
                .drive-icon { background: var(--accent-gradient); color: white; padding: 10px; border-radius: 12px; box-shadow: 0 4px 12px rgba(0,0,0,0.2); }
                .crumbs { display: flex; align-items: center; gap: 8px; font-weight: 800; font-size: 0.9rem; }
                .crumb { color: var(--text-primary); cursor: pointer; transition: 0.2s; }
                .crumb:hover { color: var(--accent-primary); }
                .crumb.root { color: var(--accent-primary); font-weight: 900; }
                .crumb-sep { opacity: 0.2; color: white; }

                .header-controls { display: flex; gap: 12px; }
                .util-btn { padding: 0 15px; height: 42px; display: flex; align-items: center; gap: 10px; font-weight: 700; border: none; cursor: pointer; }
                .upload-btn { height: 42px; padding: 0 20px; }

                .explorer-surface { flex: 1; overflow: hidden; display: flex; flex-direction: column; }
                .file-list-view { flex: 1; overflow-y: auto; padding: 12px; scrollbar-width: thin; }
                .view-header { display: flex; padding: 15px 24px; font-size: 0.7rem; font-weight: 900; text-transform: uppercase; letter-spacing: 2px; color: var(--text-secondary); opacity: 0.5; border-bottom: 2px solid rgba(255,255,255,0.03); }
                .h-name { flex: 1; }
                .h-size { width: 100px; text-align: right; }
                .h-date { width: 150px; text-align: right; }

                .file-entry { display: flex; align-items: center; padding: 14px 24px; border-radius: 14px; cursor: pointer; transition: 0.2s; background: rgba(255,255,255,0.01); margin-bottom: 4px; border: 1px solid transparent; }
                .file-entry:hover { background: rgba(255,255,255,0.03); border-color: rgba(255,255,255,0.05); }
                .file-entry.active { background: rgba(var(--accent-primary-rgb), 0.1); border-color: var(--accent-primary); }
                
                .entry-identity { flex: 1; display: flex; align-items: center; gap: 16px; }
                .dir-icon { color: #fcc419; }
                .code-icon { color: #3b82f6; }
                .text-icon { color: #10b981; }
                .file-icon { color: rgba(255,255,255,0.3); }
                .entry-name { font-weight: 700; font-size: 0.95rem; }
                .entry-size { width: 100px; text-align: right; font-family: var(--font-mono); font-size: 0.8rem; opacity: 0.4; }
                .entry-date { width: 150px; text-align: right; font-size: 0.8rem; opacity: 0.3; }

                .explorer-loader { flex: 1; display: flex; flex-direction: column; align-items: center; justify-content: center; gap: 20px; opacity: 0.4; }
                .void-state { padding: 60px; text-align: center; color: var(--text-secondary); opacity: 0.4; font-style: italic; }

                /* PREMIUM EDITOR */
                .editor-overlay { position: fixed; inset: 0; background: rgba(0,0,0,0.8); backdrop-filter: blur(20px); z-index: 3000; padding: 40px; display: flex; align-items: center; justify-content: center; animation: ed-fade 0.4s cubic-bezier(0.16, 1, 0.3, 1); }
                @keyframes ed-fade { from { opacity: 0; transform: scale(0.98); } }
                .editor-glass { width: 100%; height: 100%; display: flex; flex-direction: column; overflow: hidden; background: #08080a; }
                
                .ed-header { padding: 0 32px; height: 80px; display: flex; justify-content: space-between; align-items: center; background: rgba(255,255,255,0.02); border-bottom: 1px solid rgba(255,255,255,0.05); }
                .ed-meta { display: flex; align-items: center; gap: 20px; }
                .ed-type-icon { background: rgba(255,255,255,0.05); padding: 12px; border-radius: 12px; color: var(--accent-primary); }
                .ed-info h3 { margin: 0; font-size: 1.1rem; font-weight: 900; letter-spacing: -0.5px; }
                .ed-info p { margin: 2px 0 0; font-size: 0.75rem; color: var(--text-secondary); font-family: var(--font-mono); opacity: 0.4; }

                .ed-actions { display: flex; align-items: center; gap: 16px; }
                .save-action { height: 44px; padding: 0 24px; box-shadow: 0 10px 20px rgba(0,122,255,0.2); }
                .close-action { width: 44px; height: 44px; cursor: pointer; border: none; display: flex; align-items: center; justify-content: center; }

                .ed-viewport { flex: 1; display: flex; overflow: hidden; background: #060608; }
                .ed-liner { width: 60px; background: rgba(0,0,0,0.3); padding: 24px 0; display: flex; flex-direction: column; align-items: flex-end; padding-right: 15px; border-right: 1px solid rgba(255,255,255,0.03); user-select: none; }
                .line-num { font-family: var(--font-mono); font-size: 0.75rem; color: rgba(255,255,255,0.1); line-height: 1.6; }
                
                .code-textarea { flex: 1; background: transparent; border: none; resize: none; color: rgba(255,255,255,0.8); font-family: var(--font-mono); font-size: 1rem; line-height: 1.6; padding: 24px; outline: none; white-space: pre; overflow: auto; tab-size: 4; }

                .ed-footer { height: 40px; background: rgba(255,255,255,0.01); display: flex; align-items: center; padding: 0 32px; gap: 32px; font-size: 0.75rem; color: var(--text-secondary); opacity: 0.4; border-top: 1px solid rgba(255,255,255,0.03); }
                .f-stat { display: flex; align-items: center; gap: 8px; font-weight: 700; }
                
                .spin { animation: spin 1s linear infinite; }
                @keyframes spin { from { transform: rotate(0deg); } to { transform: rotate(360deg); } }
            `}</style>
        </div>
    );
};

export default FileManager;
