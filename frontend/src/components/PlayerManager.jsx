import React, { useState, useEffect } from 'react';
import { useServer } from '../context/ServerContext';
import { useSocket } from '../context/SocketContext';
import { User, Shield, Ban, Ghost, Search, X, HandHeart, MessageSquare, Info, RefreshCw, CheckCircle, Package, Users, Trash2, Zap } from 'lucide-react';
import { MC_ITEMS } from '../data/items';
import { motion, AnimatePresence } from 'framer-motion';
import { Responsive, WidthProvider } from 'react-grid-layout';
import 'react-grid-layout/css/styles.css';
import 'react-resizable/css/styles.css';
import { GripVertical } from 'lucide-react';

const ResponsiveGridLayout = WidthProvider(Responsive);

const PlayerManager = () => {
    const { players, setPlayers, persistentPlayers, setPersistentPlayers, refreshPlayers, isConnected } = useServer();
    const { socket } = useSocket();
    const [searchTerm, setSearchTerm] = useState('');
    const [itemSearch, setItemSearch] = useState('');
    const [modal, setModal] = useState(null); // { type, player, isOp }
    const [modalData, setModalData] = useState({ reason: '', count: 1, item: 'diamond', msg: '' });

    const defaultLayouts = {
        lg: [
            { i: 'registry', x: 0, y: 0, w: 12, h: 10 },
            { i: 'whitelist', x: 0, y: 10, w: 6, h: 8 },
            { i: 'blacklist', x: 6, y: 10, w: 6, h: 8 },
        ],
        md: [
            { i: 'registry', x: 0, y: 0, w: 12, h: 10 },
            { i: 'whitelist', x: 0, y: 10, w: 12, h: 8 },
            { i: 'blacklist', x: 0, y: 18, w: 12, h: 8 },
        ]
    };

    const [layouts, setLayouts] = useState(() => {
        const saved = localStorage.getItem('player_manager_layout');
        return saved ? JSON.parse(saved) : defaultLayouts;
    });

    const onLayoutChange = (currentLayout, allLayouts) => {
        setLayouts(allLayouts);
        localStorage.setItem('player_manager_layout', JSON.stringify(allLayouts));
    };

    useEffect(() => {
        if (isConnected) refreshPlayers();
    }, [isConnected]);

    const executeAction = () => {
        if (!socket || !modal) return;
        let cmd = '';
        const { type, player } = modal;

        switch (type) {
            case 'kick': cmd = `kick ${player} ${modalData.reason || 'Kicked by admin'}`; break;
            case 'ban': cmd = `ban ${player} ${modalData.reason || 'Banned by admin'}`; break;
            case 'unban': cmd = `pardon ${player}`; break;
            case 'give': cmd = `give ${player} ${modalData.item} ${modalData.count}`; break;
            case 'msg': cmd = `msg ${player} ${modalData.msg}`; break;
            case 'op': cmd = `op ${player}`; break;
            case 'deop': cmd = `deop ${player}`; break;
            case 'kill': cmd = `kill ${player}`; break;
        }

        if (cmd) {
            socket.emit('console:input', { command: cmd });
            if (type === 'op' || type === 'deop') {
                const isOp = (type === 'op');
                setPlayers(prev => prev.map(p => (p.name === player ? { ...p, op: isOp } : p)));
                setPersistentPlayers(prev => ({
                    ...prev,
                    cache: (prev.cache || []).map(p => ((p.name || p.username) === player ? { ...p, op: isOp } : p))
                }));
            }
            setModal(null);
            setModalData({ reason: '', count: 1, item: 'diamond', msg: '' });
            setTimeout(refreshPlayers, type === 'op' || type === 'deop' ? 2000 : 1500);
        }
    };

    const filteredItems = MC_ITEMS.filter(item =>
        item.name.toLowerCase().includes(itemSearch.toLowerCase()) ||
        item.id.toLowerCase().includes(itemSearch.toLowerCase())
    ).slice(0, 50);

    const onlineNames = new Set(players.map(p => p.name));
    const registry = [
        ...players.map(p => ({ ...p, status: 'online' })),
        ...(persistentPlayers.cache || [])
            .filter(p => !onlineNames.has(p.name || p.username))
            .map(p => ({ ...p, status: 'offline' }))
    ].sort((a, b) => {
        if (a.status === 'online' && b.status !== 'online') return -1;
        if (a.status !== 'online' && b.status === 'online') return 1;
        return (a.name || a.username || "").localeCompare(b.name || b.username || "");
    });

    const renderActionButtons = (p, category) => {
        const name = p.name || p.username;
        if (category === 'whitelist') return null;
        if (category === 'banned') return (
            <button className="p-2 rounded-xl bg-green-500/10 text-green-400 hover:bg-green-500/20 transition-all border border-green-500/20" onClick={() => setModal({ type: 'unban', player: name })} title="Unban"><CheckCircle size={18} /></button>
        );

        const isOnline = p.status === 'online';
        return (
            <div className="flex gap-2">
                {isOnline && <button className="p-2 rounded-xl bg-blue-500/10 text-blue-400 hover:bg-blue-500/20 transition-all border border-blue-500/20" onClick={() => setModal({ type: 'give', player: name })} title="Give Item"><Package size={18} /></button>}
                {isOnline && <button className="p-2 rounded-xl bg-indigo-500/10 text-indigo-400 hover:bg-indigo-500/20 transition-all border border-indigo-500/20" onClick={() => setModal({ type: 'msg', player: name })} title="Message"><MessageSquare size={18} /></button>}
                <button
                    className={`p-2 rounded-xl transition-all border ${p.op ? 'bg-yellow-400/20 text-yellow-400 border-yellow-400/30' : 'bg-white/5 text-white/40 border-white/10 hover:bg-white/10'}`}
                    onClick={() => setModal({ type: p.op ? 'deop' : 'op', player: name, isOp: p.op })}
                    title="OP Toggle"
                >
                    <Shield size={18} fill={p.op ? "currentColor" : "none"} />
                </button>
                {isOnline && <button className="p-2 rounded-xl bg-orange-500/10 text-orange-400 hover:bg-orange-500/20 transition-all border border-orange-500/20" onClick={() => setModal({ type: 'kick', player: name })} title="Kick"><Zap size={18} /></button>}
                {isOnline && <button className="p-2 rounded-xl bg-purple-500/10 text-purple-400 hover:bg-purple-500/20 transition-all border border-purple-500/20" onClick={() => setModal({ type: 'kill', player: name })} title="Kill"><Ghost size={18} /></button>}
                <button className="p-2 rounded-xl bg-red-500/10 text-red-500 hover:bg-red-500/20 transition-all border border-red-500/20" onClick={() => setModal({ type: 'ban', player: name })} title="Ban"><Ban size={18} /></button>
            </div>
        );
    };

    const renderTable = (list, title, icon, colorClass, category, key) => (
        <div key={key} className="liquid-card flex flex-col p-6 gap-6 h-full">
            <div className="flex items-center justify-between cursor-grab active:cursor-grabbing">
                <div className="flex items-center gap-4">
                    <div className={`w-12 h-12 rounded-2xl flex items-center justify-center text-white shadow-lg ${colorClass === 'accent' ? 'bg-gradient-to-br from-blue-500 to-cyan-400 shadow-blue-500/20' :
                        colorClass === 'success' ? 'bg-gradient-to-br from-green-500 to-emerald-400 shadow-emerald-500/20' :
                            'bg-gradient-to-br from-red-500 to-pink-500 shadow-red-500/20'
                        }`}>
                        {icon}
                    </div>
                    <div>
                        <h3 className="text-lg font-black tracking-tight text-white">{title}</h3>
                        {list.length > 0 && <span className="text-xs font-bold uppercase tracking-wider text-white/40">{list.length} Users Tracked</span>}
                    </div>
                </div>
                <div className="flex items-center gap-4">
                    <button className="p-2 text-white/40 hover:text-white transition-colors" onMouseDown={e => e.stopPropagation()} onClick={refreshPlayers}><RefreshCw size={14} /></button>
                    <GripVertical size={16} className="text-white/20" />
                </div>
            </div>

            <div className="overflow-x-auto flex-1 h-full h-min-0 scrollbar-thin scrollbar-thumb-white/10" onMouseDown={e => e.stopPropagation()}>
                <table className="w-full text-left border-collapse">
                    <thead>
                        <tr className="border-b border-white/5 sticky top-0 bg-transparent backdrop-blur-sm z-10">
                            <th className="py-4 px-2 text-xs font-bold uppercase tracking-widest text-white/30">Explorer</th>
                            <th className="py-4 px-2 text-xs font-bold uppercase tracking-widest text-white/30">Status</th>
                            {category !== 'whitelist' && <th className="py-4 px-2 text-xs font-bold uppercase tracking-widest text-white/30">Ops</th>}
                        </tr>
                    </thead>
                    <tbody className="divide-y divide-white/5">
                        {list.length === 0 ? (
                            <tr><td colSpan="3" className="py-8 text-center text-white/30 text-sm font-medium">No personnel detected</td></tr>
                        ) : list.map((p, i) => {
                            const name = p.name || p.username;
                            return (
                                <tr key={i} className="group hover:bg-white/[0.02] transition-colors">
                                    <td className="py-4 px-2">
                                        <div className="flex items-center gap-4">
                                            <div className="relative w-10 h-10 shrink-0">
                                                <img src={`https://mc-heads.net/avatar/${name}/64`} alt="" className="w-full h-full rounded-xl border border-white/10 group-hover:scale-110 transition-transform duration-300" />
                                                {p.status === 'online' && <div className="absolute -bottom-1 -right-1 w-3 h-3 bg-green-500 border-2 border-black rounded-full" />}
                                            </div>
                                            <a href={`https://namemc.com/profile/${name}`} target="_blank" className="font-bold text-white hover:text-blue-400 hover:underline truncate max-w-[120px]">{name}</a>
                                        </div>
                                    </td>
                                    <td className="py-4 px-2">
                                        <div className="flex flex-col gap-1">
                                            <span className={`text-[10px] font-black uppercase tracking-wider px-2 py-0.5 rounded-full w-fit ${p.status === 'online' ? 'bg-green-500/10 text-green-400 border border-green-500/20' : 'bg-white/5 text-white/30 border border-white/10'
                                                }`}>
                                                {p.status}
                                            </span>
                                        </div>
                                    </td>
                                    {category !== 'whitelist' && (
                                        <td className="py-4 px-2">{renderActionButtons(p, category)}</td>
                                    )}
                                </tr>
                            );
                        })}
                    </tbody>
                </table>
            </div>
        </div>
    );

    return (
        <div className="h-full w-full overflow-y-auto overflow-x-hidden pr-2 scrollbar-thin scrollbar-thumb-white/10">
            <AnimatePresence>
                {modal && (
                    <motion.div
                        initial={{ opacity: 0 }}
                        animate={{ opacity: 1 }}
                        exit={{ opacity: 0 }}
                        className="fixed inset-0 z-[100] flex items-center justify-center bg-black/60 backdrop-blur-md p-4"
                        onClick={() => setModal(null)}
                    >
                        <motion.div
                            initial={{ scale: 0.9, y: 20, opacity: 0 }}
                            animate={{ scale: 1, y: 0, opacity: 1 }}
                            exit={{ scale: 0.9, y: 20, opacity: 0 }}
                            onClick={e => e.stopPropagation()}
                            className="liquid-card w-full max-w-lg overflow-hidden shadow-2xl"
                        >
                            <div className="p-6 border-b border-white/5 flex items-center justify-between bg-white/[0.02]">
                                <div className="flex items-center gap-4">
                                    <div className="p-3 bg-white/5 rounded-xl text-white">
                                        {modal.type === 'give' ? <Package size={20} /> : <Zap size={20} />}
                                    </div>
                                    <div>
                                        <h3 className="text-lg font-black uppercase tracking-tight text-white">{modal.type}</h3>
                                        <p className="text-xs font-bold text-white/40">Target: {modal.player}</p>
                                    </div>
                                </div>
                                <button onClick={() => setModal(null)} className="p-2 hover:bg-white/10 rounded-lg text-white/60 hover:text-white transition-colors"><X size={20} /></button>
                            </div>

                            <div className="p-6">
                                {modal.type === 'give' ? (
                                    <div className="space-y-6">
                                        <div className="flex items-center gap-3 bg-black/20 p-3 rounded-xl border border-white/5">
                                            <Search size={18} className="text-white/40" />
                                            <input
                                                placeholder="Search item database..."
                                                value={itemSearch}
                                                onChange={e => setItemSearch(e.target.value)}
                                                autoFocus
                                                className="bg-transparent border-none outline-none text-white w-full placeholder-white/20 font-medium"
                                            />
                                        </div>
                                        <div className="grid grid-cols-4 gap-3 max-h-[300px] overflow-y-auto pr-2 scrollbar-thin scrollbar-thumb-white/10">
                                            {filteredItems.filter(it => it.id !== 'air').map(item => (
                                                <div
                                                    key={item.id}
                                                    onClick={() => setModalData({ ...modalData, item: item.id })}
                                                    className={`aspect-square p-2 rounded-xl flex flex-col items-center justify-center gap-2 cursor-pointer transition-all border ${modalData.item === item.id
                                                        ? 'bg-blue-500/20 border-blue-500/40 shadow-[0_0_15px_rgba(59,130,246,0.2)]'
                                                        : 'bg-white/5 border-transparent hover:bg-white/10 hover:-translate-y-1'
                                                        }`}
                                                >
                                                    <img
                                                        src={`https://assets.mcasset.cloud/1.21.1/assets/minecraft/textures/item/${item.id}.png`}
                                                        alt={item.name}
                                                        className="w-8 h-8 object-contain pixelated"
                                                        onError={(e) => {
                                                            const current = e.target.src;
                                                            if (current.includes('/item/') && current.includes('1.21.1')) {
                                                                e.target.src = `https://assets.mcasset.cloud/1.21.1/assets/minecraft/textures/block/${item.id}.png`;
                                                            } else if (current.includes('/block/') && current.includes('1.21.1')) {
                                                                e.target.src = `https://assets.mcasset.cloud/1.20.1/assets/minecraft/textures/item/${item.id}.png`;
                                                            } else {
                                                                e.target.style.opacity = '0.3';
                                                            }
                                                        }}
                                                    />
                                                    <span className="text-[10px] font-bold text-center leading-tight line-clamp-2 text-white/80">{item.name}</span>
                                                </div>
                                            ))}
                                        </div>
                                        <div className="flex items-center justify-between pt-4 border-t border-white/5">
                                            <span className="text-sm font-bold text-white/60">Count</span>
                                            <input
                                                type="number"
                                                value={modalData.count}
                                                onChange={e => setModalData({ ...modalData, count: e.target.value })}
                                                min="1" max="64"
                                                className="w-20 bg-black/20 border border-white/10 rounded-lg p-2 text-center text-white outline-none focus:border-blue-500/50"
                                            />
                                        </div>
                                    </div>
                                ) : (modal.type === 'kick' || modal.type === 'ban' || modal.type === 'msg') ? (
                                    <textarea
                                        className="w-full h-32 bg-black/20 border border-white/10 rounded-xl p-4 text-white outline-none focus:border-white/20 placeholder-white/20 resize-none font-medium text-sm"
                                        placeholder={modal.type === 'msg' ? "Transmission content..." : "Log entry reason..."}
                                        value={modal.type === 'msg' ? modalData.msg : modalData.reason}
                                        onChange={e => setModalData({ ...modalData, [modal.type === 'msg' ? 'msg' : 'reason']: e.target.value })}
                                        autoFocus
                                    />
                                ) : (
                                    <div className="py-8 text-center text-white/80 font-medium">
                                        Are you sure you want to execute <span className="text-white font-bold bg-white/10 px-2 py-0.5 rounded">{modal.type}</span> on {modal.player}?
                                    </div>
                                )}
                            </div>

                            <div className="p-6 bg-white/[0.02] border-t border-white/5 flex items-center justify-end gap-3">
                                <button onClick={() => setModal(null)} className="px-6 py-2.5 rounded-xl font-bold text-white/60 hover:text-white hover:bg-white/5 transition-colors">Abort</button>
                                <button
                                    onClick={executeAction}
                                    className={`px-6 py-2.5 rounded-xl font-bold text-white shadow-lg transition-all hover:scale-105 ${modal.type === 'ban' || modal.type === 'kick' || modal.type === 'kill'
                                        ? 'bg-gradient-to-r from-red-600 to-orange-600 shadow-red-600/20'
                                        : modal.type === 'give' ? 'bg-gradient-to-r from-blue-600 to-cyan-500 shadow-blue-600/20'
                                            : 'bg-white/10 border border-white/10'
                                        }`}
                                >
                                    Confirm Sequence
                                </button>
                            </div>
                        </motion.div>
                    </motion.div>
                )}
            </AnimatePresence>

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
                {renderTable(registry, "Personnel Database", <Users size={20} />, "accent", "registry", "registry")}
                {renderTable(persistentPlayers.whitelist || [], "White List", <Shield size={18} />, "success", "whitelist", "whitelist")}
                {renderTable(persistentPlayers.banned || [], "Black List", <Ban size={18} />, "danger", "banned", "blacklist")}
            </ResponsiveGridLayout>
        </div>
    );
};

export default PlayerManager;
