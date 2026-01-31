import React, { useState, useEffect } from 'react';
import { useServer } from '../context/ServerContext';
import { useSocket } from '../context/SocketContext';
import { User, Shield, Ban, Ghost, Search, X, HandHeart, MessageSquare, Info, RefreshCw, CheckCircle, Package, Users, Trash2, Zap } from 'lucide-react';
import { MC_ITEMS } from '../data/items';

const PlayerManager = () => {
    const { players, persistentPlayers, refreshPlayers, isConnected } = useServer();
    const { socket } = useSocket();
    const [searchTerm, setSearchTerm] = useState('');
    const [itemSearch, setItemSearch] = useState('');
    const [modal, setModal] = useState(null); // { type, player, isOp }
    const [modalData, setModalData] = useState({ reason: '', count: 1, item: 'diamond', msg: '' });

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
            setModal(null);
            setModalData({ reason: '', count: 1, item: 'diamond', msg: '' });
            setTimeout(refreshPlayers, 1500);
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
            <button className="icon-btn success" onClick={() => setModal({ type: 'unban', player: name })} title="Unban"><CheckCircle size={18} /></button>
        );

        const isOnline = p.status === 'online';
        return (
            <div className="action-row">
                {isOnline && <button className="icon-btn primary" onClick={() => setModal({ type: 'give', player: name })} title="Give Item"><Package size={18} /></button>}
                {isOnline && <button className="icon-btn info" onClick={() => setModal({ type: 'msg', player: name })} title="Message"><MessageSquare size={18} /></button>}
                <button className={`icon-btn ${p.op ? 'active-op' : 'warning-lite'}`} onClick={() => setModal({ type: p.op ? 'deop' : 'op', player: name, isOp: p.op })} title="OP Toggle">
                    <Shield size={18} fill={p.op ? "currentColor" : "none"} />
                </button>
                {isOnline && <button className="icon-btn warning" onClick={() => setModal({ type: 'kick', player: name })} title="Kick"><Zap size={18} /></button>}
                {isOnline && <button className="icon-btn danger-lite" onClick={() => setModal({ type: 'kill', player: name })} title="Kill"><Ghost size={18} /></button>}
                <button className="icon-btn danger" onClick={() => setModal({ type: 'ban', player: name })} title="Ban"><Ban size={18} /></button>
            </div>
        );
    };

    const renderTable = (list, title, icon, colorClass, category) => (
        <div className="player-block glass-panel">
            <div className="block-header">
                <div className="header-info">
                    <div className={`icon-circle ${colorClass}`}>{icon}</div>
                    <div className="header-text">
                        <h3>{title}</h3>
                        {list.length > 0 && <span className="count-label">{list.length} Users Tracked</span>}
                    </div>
                </div>
                <button className="glass-panel refresh-mini" onClick={refreshPlayers}><RefreshCw size={14} /></button>
            </div>
            <div className="table-container">
                <table className="player-table">
                    <thead>
                        <tr>
                            <th>Explorer</th>
                            <th>Status & Identity</th>
                            {category !== 'whitelist' && <th>Operations</th>}
                        </tr>
                    </thead>
                    <tbody>
                        {list.length === 0 ? (
                            <tr><td colSpan="3" className="empty-row">No personnel detected in registry</td></tr>
                        ) : list.map((p, i) => {
                            const name = p.name || p.username;
                            return (
                                <tr key={i} className="player-row">
                                    <td>
                                        <div className="player-identity">
                                            <div className="avatar-box">
                                                <img src={`https://mc-heads.net/avatar/${name}/64`} alt="" />
                                                {p.status === 'online' && <div className="online-dot" />}
                                            </div>
                                            <a href={`https://namemc.com/profile/${name}`} target="_blank" className="player-name">{name}</a>
                                        </div>
                                    </td>
                                    <td>
                                        <div className="identity-data">
                                            <span className={`status-pill ${p.status}`}>{p.status}</span>
                                            {p.status === 'online' && <span className="network-addr">{p.ip || 'Local Node'}</span>}
                                        </div>
                                    </td>
                                    {category !== 'whitelist' && (
                                        <td>{renderActionButtons(p, category)}</td>
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
        <div className="player-manager-root">
            {modal && (
                <div className="modal-backdrop" onClick={() => setModal(null)}>
                    <div className="modal-glass glass-panel" onClick={e => e.stopPropagation()}>
                        <div className="m-header">
                            <div className="m-title-group">
                                <div className="m-icon-box">{modal.type === 'give' ? <Package size={20} /> : <Zap size={20} />}</div>
                                <div>
                                    <h3>{modal.type.toUpperCase()}</h3>
                                    <p className="m-sub">Target: {modal.player}</p>
                                </div>
                            </div>
                            <button className="m-close" onClick={() => setModal(null)}><X size={20} /></button>
                        </div>
                        <div className="m-body">
                            {modal.type === 'give' ? (
                                <div className="give-container">
                                    <div className="m-search-box glass-panel">
                                        <Search size={18} />
                                        <input placeholder="Search item database..." value={itemSearch} onChange={e => setItemSearch(e.target.value)} autoFocus />
                                    </div>
                                    <div className="item-selection-grid">
                                        {filteredItems.map(item => (
                                            <div key={item.id} className={`item-card glass-panel ${modalData.item === item.id ? 'active' : ''}`} onClick={() => setModalData({ ...modalData, item: item.id })}>
                                                <img
                                                    src={`https://raw.githubusercontent.com/PrismarineJS/minecraft-assets/master/data/1.21/items/${item.id}.png`}
                                                    alt={item.name}
                                                    onError={(e) => {
                                                        const current = e.target.src;
                                                        if (current.includes('/1.21/')) {
                                                            e.target.src = `https://raw.githubusercontent.com/PrismarineJS/minecraft-assets/master/data/1.20.1/items/${item.id}.png`;
                                                        } else if (current.includes('/1.20.1/')) {
                                                            e.target.src = `https://raw.githubusercontent.com/PrismarineJS/minecraft-assets/master/data/1.19.1/items/${item.id}.png`;
                                                        } else if (current.includes('/1.19.1/')) {
                                                            e.target.src = `https://raw.githubusercontent.com/PrismarineJS/minecraft-assets/master/data/1.18.2/items/${item.id}.png`;
                                                        }
                                                    }}
                                                />
                                                <span className="it-label">{item.name}</span>
                                            </div>
                                        ))}
                                    </div>
                                    <div className="quantity-row">
                                        <span>Quantity to Dispense:</span>
                                        <input type="number" className="glass-input q-input" value={modalData.count} onChange={e => setModalData({ ...modalData, count: e.target.value })} min="1" max="64" />
                                    </div>
                                </div>
                            ) : (modal.type === 'kick' || modal.type === 'ban') ? (
                                <textarea className="glass-input m-textarea" placeholder="Log entry reason..." value={modalData.reason} onChange={e => setModalData({ ...modalData, reason: e.target.value })} autoFocus />
                            ) : modal.type === 'msg' ? (
                                <textarea className="glass-input m-textarea" placeholder="Transmission content..." value={modalData.msg} onChange={e => setModalData({ ...modalData, msg: e.target.value })} autoFocus />
                            ) : <p className="confirm-txt">Authorize {modal.type} sequence for {modal.player}?</p>}
                        </div>
                        <div className="m-footer">
                            <button className="glass-button cancel-btn" onClick={() => setModal(null)}>Abort</button>
                            <button className={`glass-button exec-btn ${modal.type}`} onClick={executeAction}>Confirm & Execute</button>
                        </div>
                    </div>
                </div>
            )}

            <div className="registry-layout">
                <div className="registry-main">
                    {renderTable(registry, "Personnel Database", <Users size={20} />, "accent", "registry")}
                </div>
                <div className="registry-secondary">
                    {renderTable(persistentPlayers.whitelist || [], "White List", <Shield size={18} />, "success", "whitelist")}
                    {renderTable(persistentPlayers.banned || [], "Black List", <Ban size={18} />, "danger", "banned")}
                </div>
            </div>

            <style jsx>{`
                .player-manager-root { height: 100%; overflow-y: auto; padding-right: 12px; scrollbar-width: thin; }
                .registry-layout { display: flex; flex-direction: column; gap: 32px; padding-bottom: 60px; }
                .registry-secondary { display: grid; grid-template-columns: 1fr 1fr; gap: 32px; }
                @media (max-width: 1200px) { .registry-secondary { grid-template-columns: 1fr; } }

                .player-block { padding: 0; display: flex; flex-direction: column; overflow: hidden; }
                .block-header { padding: 24px 32px; display: flex; justify-content: space-between; align-items: center; background: rgba(255,255,255,0.02); border-bottom: 1px solid rgba(255,255,255,0.05); }
                .header-info { display: flex; align-items: center; gap: 20px; }
                .icon-circle { width: 50px; height: 50px; border-radius: 16px; display: flex; align-items: center; justify-content: center; color: white; }
                .icon-circle.accent { background: var(--accent-gradient); box-shadow: 0 8px 16px rgba(0,0,0,0.2); }
                .icon-circle.success { background: linear-gradient(135deg, #34c759, #248a3d); }
                .icon-circle.danger { background: linear-gradient(135deg, #ff3b30, #b21d3a); }
                
                .header-text h3 { margin: 0; font-size: 1.1rem; font-weight: 800; letter-spacing: -0.5px; }
                .count-label { font-size: 0.75rem; color: var(--text-secondary); font-weight: 600; text-transform: uppercase; letter-spacing: 1px; }
                .refresh-mini { border: none; padding: 10px; cursor: pointer; color: var(--text-secondary); }

                .table-container { overflow-x: auto; }
                .player-table { width: 100%; border-collapse: collapse; }
                .player-table th { text-align: left; padding: 16px 32px; font-size: 0.7rem; color: var(--text-secondary); text-transform: uppercase; font-weight: 900; letter-spacing: 1.5px; opacity: 0.6; }
                .player-row { border-bottom: 1px solid rgba(255,255,255,0.02); transition: background 0.2s; }
                .player-row:hover { background: rgba(255,255,255,0.02); }
                .player-row td { padding: 18px 32px; vertical-align: middle; }

                .player-identity { display: flex; align-items: center; gap: 16px; }
                .avatar-box { position: relative; width: 44px; height: 44px; }
                .avatar-box img { width: 44px; height: 44px; border-radius: 12px; border: 2px solid rgba(255,255,255,0.1); }
                .online-dot { position: absolute; bottom: -2px; right: -2px; width: 12px; height: 12px; background: #34c759; border: 3px solid rgba(0,0,0,0.5); border-radius: 50%; }
                .player-name { font-weight: 800; color: white; text-decoration: none; font-size: 0.95rem; }
                .player-name:hover { color: var(--accent-primary); text-decoration: underline; }

                .identity-data { display: flex; flex-direction: column; gap: 4px; }
                .status-pill { font-size: 0.65rem; font-weight: 900; text-transform: uppercase; padding: 3px 10px; border-radius: 50px; width: fit-content; letter-spacing: 0.5px; }
                .status-pill.online { background: rgba(52, 199, 89, 0.15); color: #34c759; }
                .status-pill.offline { background: rgba(255, 255, 255, 0.05); color: rgba(255,255,255,0.3); }
                .network-addr { font-size: 0.7rem; color: var(--text-secondary); font-family: var(--font-mono); opacity: 0.5; }

                .action-row { display: flex; gap: 10px; }
                .icon-btn { width: 40px; height: 40px; border-radius: 12px; border: 1px solid rgba(255,255,255,0.05); background: rgba(255,255,255,0.03); color: var(--text-secondary); cursor: pointer; display: flex; align-items: center; justify-content: center; transition: all 0.3s cubic-bezier(0.16, 1, 0.3, 1); }
                .icon-btn:hover { transform: translateY(-3px) scale(1.1); color: white; background: rgba(255,255,255,0.1); }
                
                .primary:hover { color: #007aff; border-color: rgba(0,122,255,0.3); }
                .info:hover { color: #32d74b; border-color: rgba(50,215,75,0.3); }
                .warning-lite:hover { color: #ffd60a; border-color: rgba(255,214,10,0.3); }
                .active-op { color: #ffd60a !important; background: rgba(255,214,10,0.1) !important; border-color: #ffd60a !important; }
                .warning:hover { color: #f59e0b; border-color: rgba(245,158,11,0.3); }
                .danger-lite:hover { color: #bf5af2; border-color: rgba(191,90,242,0.3); }
                .danger:hover { color: #ff3b30; border-color: rgba(255,59,48,0.3); }
                .success:hover { color: #34c759; border-color: rgba(52,199,89,0.3); }

                /* MODAL GLASS */
                .modal-backdrop { position: fixed; inset: 0; background: rgba(0,0,0,0.8); backdrop-filter: blur(15px); z-index: 2000; display: flex; align-items: center; justify-content: center; }
                .modal-glass { width: 95%; max-width: 550px; padding: 0; display: flex; flex-direction: column; overflow: hidden; animation: m-in 0.3s cubic-bezier(0.16, 1, 0.3, 1); }
                @keyframes m-in { from { opacity: 0; transform: scale(0.95) translateY(20px); } }
                
                .m-header { padding: 30px; display: flex; justify-content: space-between; align-items: center; border-bottom: 1px solid rgba(255,255,255,0.05); }
                .m-title-group { display: flex; align-items: center; gap: 18px; }
                .m-icon-box { background: rgba(255,255,255,0.05); padding: 12px; border-radius: 12px; color: var(--accent-primary); }
                .m-header h3 { margin: 0; font-size: 1.2rem; font-weight: 900; letter-spacing: -0.5px; }
                .m-sub { margin: 2px 0 0; font-size: 0.8rem; color: var(--text-secondary); font-weight: 700; }
                .m-close { border: none; background: transparent; color: var(--text-secondary); cursor: pointer; padding: 8px; }

                .m-body { padding: 30px; }
                .m-search-box { display: flex; align-items: center; gap: 12px; padding: 0 16px; height: 50px; background: rgba(0,0,0,0.2); margin-bottom: 20px; }
                .m-search-box input { flex: 1; background: transparent; border: none; color: white; outline: none; }
                
                .item-selection-grid { display: grid; grid-template-columns: repeat(4, 1fr); gap: 12px; max-height: 300px; overflow-y: auto; padding-right: 10px; margin-bottom: 20px; }
                .item-card { padding: 15px; display: flex; flex-direction: column; align-items: center; gap: 8px; text-align: center; cursor: pointer; transition: 0.2s; border: 1px solid transparent; }
                .item-card:hover { background: rgba(255,255,255,0.06); }
                .item-card.active { border-color: var(--accent-primary); background: rgba(var(--accent-primary), 0.1); }
                .item-card img { width: 32px; height: 32px; image-rendering: pixelated; }
                .it-label { font-size: 0.7rem; font-weight: 700; overflow: hidden; text-overflow: ellipsis; white-space: nowrap; width: 100%; }

                .quantity-row { display: flex; align-items: center; justify-content: space-between; margin-top: 20px; border-top: 1px solid rgba(255,255,255,0.05); padding-top: 20px; }
                .q-input { width: 80px; text-align: center; }

                .m-textarea { width: 100%; height: 120px; resize: none; padding: 20px; }
                .m-footer { padding: 20px 30px; background: rgba(255,255,255,0.02); display: flex; justify-content: flex-end; gap: 15px; }
                
                .exec-btn.kick { background: #f59e0b; color: black; }
                .exec-btn.ban { background: #ff3b30; color: white; }
                .exec-btn.give { background: #007aff; color: white; }
            `}</style>
        </div>
    );
};

export default PlayerManager;

