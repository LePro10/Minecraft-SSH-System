import React, { useState, useEffect, useRef } from 'react';
import { useServer } from '../context/ServerContext';
import {
    Folder, FileText, File, ArrowLeft, RefreshCw, Upload, Plus,
    MoreVertical, Trash2, Edit2, Copy, Scissors, Clipboard,
    HardDrive, Archive, Image, Music, Video, Code, Shield, X, Check,
    Loader2
} from 'lucide-react';
import { useToast } from '../context/ToastContext';
import { motion, AnimatePresence } from 'framer-motion';

const API_BASE = import.meta.env.VITE_API_URL || 'http://localhost:3001';

const FileManager = () => {
    const [path, setPath] = useState('/');
    const [files, setFiles] = useState([]);
    const [loading, setLoading] = useState(false);
    const [selection, setSelection] = useState([]); // Array of file names
    const [clipboard, setClipboard] = useState(null); // { type: 'copy'|'cut', items: [], sourcePath: '' }
    const [editor, setEditor] = useState(null); // { path, content, original }
    const [contextMenu, setContextMenu] = useState(null); // { x, y, item }
    const { showToast } = useToast();
    const fileInputRef = useRef(null);

    // --- Server Context ---
    const { config } = useServer(); // Need to import useServer from context

    // Initial Path Load
    useEffect(() => {
        if (config && config.path && path === '/') {
            setPath(config.path);
        }
    }, [config, path]);

    // Initial Fetch
    useEffect(() => {
        if (path !== '/') fetchFiles(path); // Don't fetch root if we are waiting for config
        else if (config && config.path) fetchFiles(config.path); // Fallback
    }, [path, config]);



    // --- API Interactions ---
    const fetchFiles = async (dirPath) => {
        setLoading(true);
        try {
            const res = await fetch(`${API_BASE}/api/files/list?path=${encodeURIComponent(dirPath)}`);
            if (res.ok) {
                const data = await res.json();
                setFiles(data);
            } else {
                showToast('Failed to load directory', 'error');
            }
        } catch (e) {
            showToast('Connection error', 'error');
        }
        setLoading(false);
    };

    const handleDownload = (itemName) => {
        const url = `${API_BASE}/api/files/download?path=${encodeURIComponent(path + '/' + itemName)}`;
        window.open(url, '_blank');
    };

    const handleDelete = async (items) => {
        if (!confirm(`Delete ${items.length} item(s)? This cannot be undone.`)) return;

        for (const item of items) {
            try {
                const targetPath = `${path}/${item}`.replace(/\/+/g, '/');
                await fetch(`${API_BASE}/api/files/delete`, {
                    method: 'POST',
                    headers: { 'Content-Type': 'application/json' },
                    body: JSON.stringify({ path: targetPath, type: 'any' }) // type checked in backend usually, or assume safe
                });
            } catch (e) { console.error(e); }
        }
        showToast('Items deleted', 'success');
        fetchFiles(path);
        setSelection([]);
    };

    const handleCreate = async (type) => {
        const name = prompt(`Enter name for new ${type}:`);
        if (!name) return;

        const endpoint = type === 'folder' ? 'create-dir' : 'create-file';
        const targetPath = `${path}/${name}`.replace(/\/+/g, '/');

        try {
            const res = await fetch(`${API_BASE}/api/files/${endpoint}`, {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ path: targetPath })
            });
            if (res.ok) {
                showToast(`${type} created`, 'success');
                fetchFiles(path);
            } else {
                const d = await res.json();
                showToast(d.error || 'Creation failed', 'error');
            }
        } catch (e) { showToast('Request failed', 'error'); }
    };

    const handleRename = async (oldName) => {
        const newName = prompt('Rename to:', oldName);
        if (!newName || newName === oldName) return;

        const src = `${path}/${oldName}`;
        const dest = `${path}/${newName}`;

        try {
            const res = await fetch(`${API_BASE}/api/files/move`, {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ src, dest })
            });
            if (res.ok) {
                showToast('Renamed successfully', 'success');
                fetchFiles(path);
            } else {
                showToast('Rename failed', 'error');
            }
        } catch (e) { showToast('Error renaming', 'error'); }
    };

    const handleChmod = async (itemName) => {
        const mode = prompt('Enter new permissions (e.g., 755):');
        if (!mode) return;

        const targetPath = `${path}/${itemName}`;
        try {
            const res = await fetch(`${API_BASE}/api/files/chmod`, {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ path: targetPath, mode })
            });
            if (res.ok) showToast('Permissions updated', 'success');
            else showToast('Chmod failed', 'error');
        } catch (e) { showToast('Error updating permissions', 'error'); }
    };

    const handlePaste = async () => {
        if (!clipboard || !clipboard.items.length) return;

        const action = clipboard.type === 'copy' ? 'copy' : 'move'; // 'move' endpoint handles rename/move
        // Backend 'move' is sftp.rename, 'copy' is cp -r (custom)

        let successCount = 0;
        for (const item of clipboard.items) {
            const src = `${clipboard.sourcePath}/${item}`;
            const dest = `${path}/${item}`;

            if (src === dest) continue;

            const res = await fetch(`${API_BASE}/api/files/${action}`, {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ src, dest })
            });
            if (res.ok) successCount++;
        }

        showToast(`Pasted ${successCount} items`, 'success');
        if (clipboard.type === 'cut') setClipboard(null);
        fetchFiles(path);
    };

    // --- Drag & Drop ---
    const handleDrop = async (e, targetDir) => {
        e.preventDefault();
        const srcName = e.dataTransfer.getData('text/plain');
        if (!srcName) return; // Could be external file?

        // Internal Move
        const src = `${path}/${srcName}`;
        const dest = `${path}/${targetDir}/${srcName}`;

        if (src === dest) return;

        try {
            await fetch(`${API_BASE}/api/files/move`, {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ src, dest })
            });
            showToast(`Moved ${srcName}`, 'success');
            fetchFiles(path);
        } catch (e) { showToast('Move failed', 'error'); }
    };

    // --- Editor Logic ---
    const openFile = async (file) => {
        if (file.isDirectory) {
            setPath(`${path}/${file.name}`.replace(/\/+/g, '/'));
            setSelection([]);
        } else {
            // Check extension
            if (!/\.(txt|json|yml|yaml|properties|log|sh|js|md|css)$/i.test(file.name)) {
                return showToast('File type not editable', 'info');
            }

            const targetPath = `${path}/${file.name}`;
            try {
                const res = await fetch(`${API_BASE}/api/files/read?path=${encodeURIComponent(targetPath)}`);
                const content = await res.text();
                setEditor({ path: targetPath, content, original: content });
            } catch (e) { showToast('Could not read file', 'error'); }
        }
    };

    const saveEditor = async () => {
        if (!editor) return;
        const btn = document.getElementById('save-btn');
        if (btn) btn.innerText = 'Saving...';

        try {
            // Create a timeout promise
            const controller = new AbortController();
            const timeoutId = setTimeout(() => controller.abort(), 5000);

            const res = await fetch(`${API_BASE}/api/files/write`, {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ path: editor.path, content: editor.content }),
                signal: controller.signal
            });
            clearTimeout(timeoutId);

            if (res.ok) {
                setEditor(prev => ({ ...prev, original: prev.content }));
                showToast('File saved successfully', 'success');
            } else {
                const err = await res.json();
                showToast('Save failed', 'error', { details: err });
            }
        } catch (e) {
            if (e.name === 'AbortError') showToast('Save timed out', 'error');
            else showToast('Save error', 'error', { details: e.message });
        } finally {
            if (btn) btn.innerText = 'Save Changes';
        }
    };

    // --- UI Components ---
    const Breadcrumbs = () => {
        const parts = path.split('/').filter(Boolean);
        return (
            <div className="breadcrumbs">
                <button className="crumb" onClick={() => setPath('/')}><HardDrive size={16} /></button>
                {parts.map((p, i) => (
                    <span key={i} className="crumb-group">
                        <span className="sep">/</span>
                        <button className="crumb" onClick={() => setPath('/' + parts.slice(0, i + 1).join('/'))}>{p}</button>
                    </span>
                ))}
            </div>
        );
    };

    const getIcon = (name, isDir) => {
        if (isDir) return <Folder className="f-icon dir" />;
        if (name.endsWith('.json') || name.endsWith('.yml')) return <Code className="f-icon code" />;
        if (name.endsWith('.png') || name.endsWith('.jpg')) return <Image className="f-icon img" />;
        if (name.endsWith('.jar')) return <Archive className="f-icon zip" />;
        return <FileText className="f-icon file" />;
    };

    return (
        <div className="fm-container" onClick={() => setContextMenu(null)}>
            {/* Toolbar */}
            <div className="fm-toolbar glass-panel">
                <div className="left-tools">
                    <button className="tool-btn" onClick={() => setPath(path.split('/').slice(0, -1).join('/') || '/')} disabled={path === '/'}>
                        <ArrowLeft size={18} />
                    </button>
                    <Breadcrumbs />
                </div>
                <div className="right-tools">
                    <button className="tool-btn primary" onClick={() => setContextMenu({ type: 'create', x: 0, y: 0 })}>
                        <Plus size={18} /> <span className="lbl">New</span>
                    </button>
                    <button className="tool-btn" onClick={() => fileInputRef.current.click()}>
                        <Upload size={18} /> <span className="lbl">Upload</span>
                    </button>
                    <button className="tool-btn" onClick={() => fetchFiles(path)}>
                        <RefreshCw size={18} className={loading ? 'spin' : ''} />
                    </button>
                    {clipboard && (
                        <button className="tool-btn accent-pulse" onClick={handlePaste}>
                            <Clipboard size={18} /> Paste ({clipboard.items.length})
                        </button>
                    )}
                </div>
            </div>

            {/* File Create Popover replacement (handled by simple context logic for now, or just prompt) 
                Actually, let's use the dropdown if prompted manually, but I used prompts in handlers.
                Let's stick to prompts for simplicity of code vs complex UI.
            */}
            {contextMenu?.type === 'create' && (
                <div className="ctx-menu glass-panel" style={{ top: 60, right: 120 }}>
                    <button onClick={() => { handleCreate('folder'); setContextMenu(null); }}><Folder size={16} /> New Folder</button>
                    <button onClick={() => { handleCreate('file'); setContextMenu(null); }}><FileText size={16} /> New File</button>
                </div>
            )}

            <input
                type="file"
                ref={fileInputRef}
                style={{ display: 'none' }}
                onChange={async (e) => {
                    if (!e.target.files[0]) return;
                    const formData = new FormData();
                    formData.append('file', e.target.files[0]);
                    formData.append('targetDir', path);
                    const res = await fetch(`${API_BASE}/api/files/upload`, { method: 'POST', body: formData });
                    if (res.ok) { showToast('Uploaded', 'success'); fetchFiles(path); }
                    else showToast('Upload failed', 'error');
                }}
            />

            {/* File Grid */}
            <div className="file-grid-wrapper">
                {loading && <div className="loader-overlay"><Loader2 className="spin" size={40} /></div>}

                <div className="file-grid">
                    {files.map(f => (
                        <div
                            key={f.name}
                            className={`file-item ${selection.includes(f.name) ? 'selected' : ''}`}
                            onClick={(e) => {
                                if (e.ctrlKey) {
                                    setSelection(prev => prev.includes(f.name) ? prev.filter(n => n !== f.name) : [...prev, f.name]);
                                } else {
                                    setSelection([f.name]);
                                }
                            }}
                            onDoubleClick={() => openFile(f)}
                            onContextMenu={(e) => {
                                e.preventDefault();
                                e.stopPropagation();
                                setSelection([f.name]);
                                setContextMenu({ x: e.clientX, y: e.clientY, item: f });
                            }}
                            draggable
                            onDragStart={(e) => e.dataTransfer.setData('text/plain', f.name)}
                            onDragOver={(e) => { if (f.isDirectory) e.preventDefault(); }}
                            onDrop={(e) => { if (f.isDirectory) handleDrop(e, f.name); }}
                        >
                            <div className="icon-box">{getIcon(f.name, f.isDirectory)}</div>
                            <span className="file-name">{f.name}</span>
                            <span className="file-meta">{f.size === 0 ? '' : (f.size / 1024).toFixed(1) + ' KB'}</span>
                        </div>
                    ))}
                </div>
            </div>

            {/* Context Menu */}
            {contextMenu && contextMenu.item && (
                <div className="ctx-menu glass-panel" style={{ top: contextMenu.y, left: contextMenu.x }}>
                    <div className="ctx-header">{contextMenu.item.name}</div>
                    <button onClick={() => openFile(contextMenu.item)}>
                        {contextMenu.item.isDirectory ? <Folder size={16} /> : <Edit2 size={16} />}
                        {contextMenu.item.isDirectory ? 'Open' : 'Edit'}
                    </button>
                    <button onClick={() => handleDownload(contextMenu.item.name)}><ArrowLeft size={16} style={{ transform: 'rotate(-90deg)' }} /> Download</button>
                    <div className="ctx-div"></div>
                    <button onClick={() => { setClipboard({ type: 'copy', items: [contextMenu.item.name], sourcePath: path }); setContextMenu(null); }}>
                        <Copy size={16} /> Copy
                    </button>
                    <button onClick={() => { setClipboard({ type: 'cut', items: [contextMenu.item.name], sourcePath: path }); setContextMenu(null); }}>
                        <Scissors size={16} /> Cut
                    </button>
                    <button onClick={() => { handleRename(contextMenu.item.name); setContextMenu(null); }}>
                        <Edit2 size={16} /> Rename
                    </button>
                    <button onClick={() => { handleChmod(contextMenu.item.name); setContextMenu(null); }}>
                        <Shield size={16} /> Permissions
                    </button>
                    <div className="ctx-div"></div>
                    <button className="ctx-danger" onClick={() => { handleDelete([contextMenu.item.name]); setContextMenu(null); }}>
                        <Trash2 size={16} /> Delete
                    </button>
                </div>
            )}

            {/* Editor Modal */}
            <AnimatePresence>
                {editor && (
                    <motion.div className="editor-overlay" initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}>
                        <div className="editor-window glass-panel">
                            <div className="editor-header">
                                <div className="eh-left">
                                    <FileText size={20} className="accent" />
                                    <span>{editor.path}</span>
                                    {editor.content !== editor.original && <span className="unsaved-badge">Unsaved</span>}
                                </div>
                                <div className="eh-right">
                                    <button id="save-btn" className="glass-button" onClick={saveEditor}>Save Changes</button>
                                    <button className="close-btn" onClick={() => setEditor(null)}><X size={24} /></button>
                                </div>
                            </div>
                            <textarea
                                className="editor-content"
                                value={editor.content}
                                onChange={e => setEditor({ ...editor, content: e.target.value })}
                                spellCheck={false}
                            />
                        </div>
                    </motion.div>
                )}
            </AnimatePresence>

            <style jsx>{`
                .fm-container { display: flex; flex-direction: column; height: 100%; position: relative; }
                .fm-toolbar { margin: 16px 20px; padding: 12px 20px; display: flex; justify-content: space-between; align-items: center; z-index: 10; }
                .left-tools, .right-tools { display: flex; align-items: center; gap: 12px; }
                
                .tool-btn { background: rgba(255,255,255,0.05); border: 1px solid rgba(255,255,255,0.1); color: var(--text-secondary); width: 40px; height: 40px; border-radius: 8px; display: flex; align-items: center; justify-content: center; transition: 0.2s; cursor: pointer; }
                .tool-btn:hover { background: rgba(255,255,255,0.1); color: white; }
                .tool-btn:disabled { opacity: 0.3; cursor: not-allowed; }
                .tool-btn.primary { width: auto; padding: 0 16px; background: var(--accent-gradient); color: white; border: none; gap: 8px; }
                .tool-btn.primary:hover { transform: translateY(-1px); box-shadow: 0 4px 12px rgba(14, 165, 233, 0.3); }
                .lbl { font-size: 0.9rem; font-weight: 600; display: none; }
                @media(min-width: 800px) { .lbl { display: inline; } .tool-btn { width: auto; padding: 0 12px; } }

                .breadcrumbs { display: flex; align-items: center; gap: 6px; overflow-x: auto; max-width: 400px; padding-bottom: 4px; }
                .crumb { background: none; border: none; color: var(--text-secondary); font-family: var(--font-mono); font-size: 0.9rem; cursor: pointer; padding: 4px 8px; border-radius: 4px; transition: 0.2s; }
                .crumb:hover { background: rgba(255,255,255,0.1); color: white; }
                .sep { color: rgba(255,255,255,0.2); }

                .file-grid-wrapper { flex: 1; overflow-y: auto; padding: 0 20px 20px; position: relative; }
                .file-grid { display: grid; grid-template-columns: repeat(auto-fill, minmax(110px, 1fr)); gap: 16px; }
                
                .file-item { display: flex; flex-direction: column; align-items: center; text-align: center; padding: 16px 8px; border-radius: 12px; transition: 0.2s; cursor: pointer; border: 1px solid transparent; }
                .file-item:hover { background: rgba(255,255,255,0.03); }
                .file-item.selected { background: rgba(14, 165, 233, 0.1); border-color: rgba(14, 165, 233, 0.3); }
                
                .icon-box { margin-bottom: 12px; transition: 0.2s; color: var(--text-secondary); }
                .file-item:hover .icon-box { transform: scale(1.1); color: white; }
                .f-icon { width: 42px; height: 42px; stroke-width: 1.5px; }
                .f-icon.dir { color: #f59e0b; fill: rgba(245, 158, 11, 0.1); }
                .f-icon.code { color: #8b5cf6; }
                .f-icon.img { color: #10b981; }
                .f-icon.zip { color: #e11d48; }

                .file-name { font-size: 0.85rem; font-weight: 500; color: #e2e8f0; word-break: break-word; line-height: 1.3; max-width: 100%; display: -webkit-box; -webkit-line-clamp: 2; -webkit-box-orient: vertical; overflow: hidden; }
                .file-meta { font-size: 0.7rem; color: var(--text-secondary); margin-top: 4px; opacity: 0.6; }

                /* Context Menu */
                .ctx-menu { position: fixed; z-index: 100; min-width: 180px; padding: 6px; display: flex; flex-direction: column; gap: 2px; animation: fadeIn 0.1s ease; }
                .ctx-menu button { background: transparent; border: none; color: #e2e8f0; text-align: left; padding: 10px 12px; border-radius: 6px; font-size: 0.9rem; cursor: pointer; display: flex; align-items: center; gap: 10px; transition: 0.1s; width: 100%; }
                .ctx-menu button:hover { background: rgba(255,255,255,0.1); }
                .ctx-header { padding: 8px 12px; font-size: 0.75rem; color: var(--text-secondary); font-weight: 700; text-transform: uppercase; border-bottom: 1px solid rgba(255,255,255,0.1); margin-bottom: 4px; }
                .ctx-div { height: 1px; background: rgba(255,255,255,0.1); margin: 4px 0; }
                .ctx-danger { color: #ff4757 !important; }
                .ctx-danger:hover { background: rgba(255, 71, 87, 0.1) !important; }

                /* Editor */
                .editor-overlay { position: fixed; inset: 0; background: rgba(0,0,0,0.8); backdrop-filter: blur(10px); z-index: 1000; display: flex; align-items: center; justify-content: center; padding: 40px; }
                .editor-window { width: 100%; height: 100%; max-width: 1200px; display: flex; flex-direction: column; overflow: hidden; border: 1px solid rgba(255,255,255,0.1); background: rgba(15, 23, 42, 0.95); }
                
                .editor-header { height: 60px; padding: 0 24px; display: flex; justify-content: space-between; align-items: center; border-bottom: 1px solid rgba(255,255,255,0.1); background: rgba(0,0,0,0.2); }
                .eh-left { display: flex; align-items: center; gap: 12px; font-family: var(--font-mono); color: var(--text-secondary); }
                .eh-left .accent { color: var(--accent-primary); }
                .unsaved-badge { font-size: 0.7rem; background: #e11d48; color: white; padding: 2px 8px; border-radius: 4px; font-weight: bold; }
                
                .eh-right { display: flex; align-items: center; gap: 16px; }
                .close-btn { width: 44px; height: 44px; border-radius: 50%; display: flex; align-items: center; justify-content: center; background: rgba(255,255,255,0.05); border: none; color: white; cursor: pointer; transition: 0.2s; }
                .close-btn:hover { background: rgba(255, 59, 48, 0.2); color: #ff3b30; transform: rotate(90deg); }

                .editor-content { flex: 1; background: transparent; border: none; padding: 24px; color: #f1f5f9; font-family: var(--font-mono); font-size: 0.95rem; line-height: 1.6; resize: none; outline: none; }
                
                .spin { animation: spin 1s linear infinite; }
                @keyframes spin { from { transform: rotate(0deg); } to { transform: rotate(360deg); } }
            `}</style>
        </div>
    );
};

export default FileManager;
