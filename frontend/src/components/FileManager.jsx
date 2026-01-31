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
    const [selection, setSelection] = useState([]);
    const [clipboard, setClipboard] = useState(null);
    const [editor, setEditor] = useState(null);
    const [contextMenu, setContextMenu] = useState(null);
    const { showToast } = useToast();
    const fileInputRef = useRef(null);

    const { config } = useServer();

    useEffect(() => {
        if (config && config.path && path === '/') {
            setPath(config.path);
        }
    }, [config, path]);

    useEffect(() => {
        if (path !== '/') fetchFiles(path);
        else if (config && config.path) fetchFiles(config.path);
    }, [path, config]);

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
                    body: JSON.stringify({ path: targetPath, type: 'any' })
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

        const action = clipboard.type === 'copy' ? 'copy' : 'move';
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

    const handleDrop = async (e, targetDir) => {
        e.preventDefault();
        const srcName = e.dataTransfer.getData('text/plain');
        if (!srcName) return;

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

    const openFile = async (file) => {
        if (file.isDirectory) {
            setPath(`${path}/${file.name}`.replace(/\/+/g, '/'));
            setSelection([]);
        } else {
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

    const getIcon = (name, isDir) => {
        if (isDir) return <Folder className="text-amber-400 drop-shadow-[0_0_8px_rgba(251,191,36,0.5)]" size={40} />;
        if (name.endsWith('.json') || name.endsWith('.yml')) return <Code className="text-violet-400 drop-shadow-[0_0_8px_rgba(167,139,250,0.5)]" size={40} />;
        if (name.endsWith('.png') || name.endsWith('.jpg')) return <Image className="text-emerald-400 drop-shadow-[0_0_8px_rgba(52,211,153,0.5)]" size={40} />;
        if (name.endsWith('.jar')) return <Archive className="text-rose-400 drop-shadow-[0_0_8px_rgba(251,113,133,0.5)]" size={40} />;
        return <FileText className="text-blue-300 drop-shadow-[0_0_8px_rgba(147,197,253,0.3)]" size={40} />;
    };

    return (
        <div className="flex flex-col h-full overflow-hidden relative pb-4" onClick={() => setContextMenu(null)}>
            {/* Toolbar */}
            <div className="liquid-card p-3 mb-6 flex items-center justify-between z-10 shrink-0">
                <div className="flex items-center gap-4 pl-2">
                    <button
                        className="p-2 hover:bg-white/10 rounded-lg text-white/70 hover:text-white transition-colors disabled:opacity-30"
                        onClick={() => setPath(path.split('/').slice(0, -1).join('/') || '/')}
                        disabled={path === '/'}
                    >
                        <ArrowLeft size={18} />
                    </button>
                    <div className="flex items-center gap-2 overflow-x-auto max-w-[400px] scrollbar-hide pb-1">
                        <button className="text-white/40 hover:text-cyan-400 font-mono transition-colors" onClick={() => setPath('/')}><HardDrive size={16} /></button>
                        {path.split('/').filter(Boolean).map((p, i) => (
                            <React.Fragment key={i}>
                                <span className="text-white/20">/</span>
                                <button className="text-sm font-bold text-white/70 hover:text-cyan-400 transition-colors whitespace-nowrap" onClick={() => setPath('/' + path.split('/').slice(0, i + 1).slice(1).join('/'))}>
                                    {p}
                                </button>
                            </React.Fragment>
                        ))}
                    </div>
                </div>

                <div className="flex items-center gap-2">
                    <button className="p-2.5 rounded-xl bg-gradient-to-r from-blue-600 to-cyan-500 text-white font-bold text-xs flex items-center gap-2 shadow-lg shadow-blue-500/20 hover:scale-105 transition-transform" onClick={() => setContextMenu({ type: 'create', x: 0, y: 0 })}>
                        <Plus size={16} /> NEW
                    </button>
                    <button className="p-2.5 rounded-xl bg-white/5 border border-white/10 text-white/70 hover:text-white hover:bg-white/10 transition-colors" onClick={() => fileInputRef.current.click()}>
                        <Upload size={18} />
                    </button>
                    <button className="p-2.5 rounded-xl bg-white/5 border border-white/10 text-white/70 hover:text-white hover:bg-white/10 transition-colors" onClick={() => fetchFiles(path)}>
                        <RefreshCw size={18} className={loading ? 'animate-spin' : ''} />
                    </button>
                    {clipboard && (
                        <button className="p-2.5 rounded-xl bg-amber-500/10 border border-amber-500/20 text-amber-400 hover:bg-amber-500/20 transition-colors flex items-center gap-2 font-bold text-xs animate-pulse" onClick={handlePaste}>
                            <Clipboard size={16} /> PASTE ({clipboard.items.length})
                        </button>
                    )}
                </div>
            </div>

            {/* Simulating Create Context Menu via top-right absolute if triggered */}
            {contextMenu?.type === 'create' && (
                <div className="absolute top-20 right-10 z-50 liquid-card p-2 flex flex-col gap-1 w-48 shadow-2xl backdrop-blur-xl">
                    <button className="flex items-center gap-3 px-3 py-2.5 rounded-lg hover:bg-white/10 text-white/80 transition-colors text-sm font-bold" onClick={() => { handleCreate('folder'); setContextMenu(null); }}><Folder size={16} className="text-amber-400" /> New Folder</button>
                    <button className="flex items-center gap-3 px-3 py-2.5 rounded-lg hover:bg-white/10 text-white/80 transition-colors text-sm font-bold" onClick={() => { handleCreate('file'); setContextMenu(null); }}><FileText size={16} className="text-blue-400" /> New File</button>
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

            {/* Grid */}
            <div className="flex-1 overflow-y-auto px-4 pb-10 scrollbar-thin scrollbar-thumb-white/10">
                {loading && <div className="absolute inset-0 flex items-center justify-center bg-black/40 backdrop-blur-sm z-20"><Loader2 className="animate-spin text-cyan-400" size={48} /></div>}
                <div className="grid grid-cols-[repeat(auto-fill,minmax(120px,1fr))] gap-4">
                    {files.map(f => (
                        <motion.div
                            layout
                            key={f.name}
                            initial={{ opacity: 0, scale: 0.9 }}
                            animate={{ opacity: 1, scale: 1 }}
                            className={`flex flex-col items-center p-4 rounded-xl cursor-pointer transition-all duration-200 border group ${selection.includes(f.name)
                                    ? 'bg-blue-500/10 border-blue-500/30'
                                    : 'bg-transparent border-transparent hover:bg-white/[0.03]'
                                }`}
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
                            <div className="mb-3 transition-transform duration-300 group-hover:scale-110 group-active:scale-95">
                                {getIcon(f.name, f.isDirectory)}
                            </div>
                            <span className="text-xs font-medium text-white/90 text-center line-clamp-2 w-full break-all leading-tight">{f.name}</span>
                            <span className="text-[10px] text-white/30 mt-1 font-mono">{f.size === 0 ? '' : (f.size / 1024).toFixed(1) + ' KB'}</span>
                        </motion.div>
                    ))}
                </div>
            </div>

            {/* Context Menu */}
            {contextMenu && contextMenu.item && (
                <div className="fixed z-[100] liquid-card p-1.5 flex flex-col min-w-[180px] shadow-2xl backdrop-blur-xl border border-white/20" style={{ top: Math.min(contextMenu.y, window.innerHeight - 300), left: Math.min(contextMenu.x, window.innerWidth - 200) }}>
                    <div className="px-3 py-2 text-[10px] font-black uppercase tracking-widest text-white/30 border-b border-white/10 mb-1 truncate max-w-[160px]">{contextMenu.item.name}</div>
                    <button className="flex items-center gap-3 px-3 py-2 rounded-lg hover:bg-blue-500/20 text-white/80 hover:text-blue-200 transition-colors text-xs font-bold" onClick={() => openFile(contextMenu.item)}>
                        {contextMenu.item.isDirectory ? <Folder size={14} /> : <Edit2 size={14} />}
                        {contextMenu.item.isDirectory ? 'Open Folder' : 'Edit File'}
                    </button>
                    <button className="flex items-center gap-3 px-3 py-2 rounded-lg hover:bg-white/10 text-white/80 hover:text-white transition-colors text-xs font-bold" onClick={() => handleDownload(contextMenu.item.name)}><ArrowLeft size={14} className="-rotate-90" /> Download</button>
                    <div className="h-px bg-white/10 my-1" />
                    <button className="flex items-center gap-3 px-3 py-2 rounded-lg hover:bg-white/10 text-white/80 hover:text-white transition-colors text-xs font-bold" onClick={() => { setClipboard({ type: 'copy', items: [contextMenu.item.name], sourcePath: path }); setContextMenu(null); }}>
                        <Copy size={14} /> Copy
                    </button>
                    <button className="flex items-center gap-3 px-3 py-2 rounded-lg hover:bg-white/10 text-white/80 hover:text-white transition-colors text-xs font-bold" onClick={() => { setClipboard({ type: 'cut', items: [contextMenu.item.name], sourcePath: path }); setContextMenu(null); }}>
                        <Scissors size={14} /> Cut
                    </button>
                    <button className="flex items-center gap-3 px-3 py-2 rounded-lg hover:bg-white/10 text-white/80 hover:text-white transition-colors text-xs font-bold" onClick={() => { handleRename(contextMenu.item.name); setContextMenu(null); }}>
                        <Edit2 size={14} /> Rename
                    </button>
                    <button className="flex items-center gap-3 px-3 py-2 rounded-lg hover:bg-white/10 text-white/80 hover:text-white transition-colors text-xs font-bold" onClick={() => { handleChmod(contextMenu.item.name); setContextMenu(null); }}>
                        <Shield size={14} /> Permissions
                    </button>
                    <div className="h-px bg-white/10 my-1" />
                    <button className="flex items-center gap-3 px-3 py-2 rounded-lg hover:bg-red-500/20 text-red-400 hover:text-red-300 transition-colors text-xs font-bold text-left" onClick={() => { handleDelete([contextMenu.item.name]); setContextMenu(null); }}>
                        <Trash2 size={14} /> <span className="flex-1">Delete</span>
                    </button>
                </div>
            )}

            {/* Editor Modal */}
            <AnimatePresence>
                {editor && (
                    <motion.div className="fixed inset-0 z-[200] flex items-center justify-center bg-black/80 backdrop-blur-xl p-6" initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}>
                        <motion.div className="liquid-card w-full h-full max-w-6xl flex flex-col overflow-hidden shadow-2xl border border-white/10" initial={{ scale: 0.95 }} animate={{ scale: 1 }}>
                            <div className="flex items-center justify-between p-4 bg-white/[0.02] border-b border-white/5">
                                <div className="flex items-center gap-3">
                                    <div className="p-2 bg-blue-500/10 rounded-lg text-blue-400"><Code size={20} /></div>
                                    <span className="font-mono text-sm text-white/70">{editor.path}</span>
                                    {editor.content !== editor.original && <span className="px-2 py-0.5 rounded bg-red-500/20 text-red-400 text-[10px] font-bold uppercase">Unsaved</span>}
                                </div>
                                <div className="flex items-center gap-3">
                                    <button id="save-btn" className="px-4 py-2 bg-blue-600 hover:bg-blue-500 text-white rounded-lg text-xs font-bold transition-colors shadow-lg shadow-blue-600/20" onClick={saveEditor}>Save Changes</button>
                                    <button className="p-2 hover:bg-white/10 rounded-lg text-white/50 hover:text-white transition-colors" onClick={() => setEditor(null)}><X size={20} /></button>
                                </div>
                            </div>
                            <textarea
                                className="flex-1 bg-black/30 border-none p-6 text-white font-mono text-sm leading-relaxed outline-none resize-none"
                                value={editor.content}
                                onChange={e => setEditor({ ...editor, content: e.target.value })}
                                spellCheck={false}
                            />
                        </motion.div>
                    </motion.div>
                )}
            </AnimatePresence>
        </div>
    );
};

export default FileManager;
