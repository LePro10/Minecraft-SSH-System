import React, { createContext, useContext, useState, useEffect, useRef } from 'react';
import { useSocket } from './SocketContext';

const ServerContext = createContext();

export const useServer = () => useContext(ServerContext);

export const ServerProvider = ({ children }) => {
    const { socket } = useSocket();

    const [stats, setStats] = useState({ cpu: 0, ram: 0, ramUsed: 0, ramTotal: 0, ramCache: 0, disk: '0%', diskUsed: '0', diskTotal: '0', load: '0 0 0', uptime: 'unknown' });
    const [tps, setTps] = useState({ t1: 20, t5: 20, t15: 20 });
    const [persistentPlayers, setPersistentPlayers] = useState({ whitelist: [], banned: [], cache: [] });
    const [players, setPlayers] = useState([]);
    const [logs, setLogs] = useState([]);
    const [config, setConfig] = useState(() => {
        const saved = localStorage.getItem('mc_config');
        return saved ? JSON.parse(saved) : { path: '/home/mcserver', screenName: 'minecraft' };
    });

    const [isConnected, setIsConnected] = useState(false);
    const [isConnecting, setIsConnecting] = useState(false);
    const [lastError, setLastError] = useState(null);
    const connectionTimeoutRef = useRef(null);

    useEffect(() => {
        if (!socket) return;

        socket.on('metrics:update', (data) => {
            setStats(prev => ({ ...prev, ...data }));
        });

        socket.on('metrics:tps', (data) => {
            setTps(data);
        });

        socket.on('players:update', (data) => {
            setPlayers(data);
        });

        socket.on('players:data_update', (data) => {
            setPersistentPlayers(data);
        });

        socket.on('console:log', (msg) => {
            setLogs(prev => [...prev.slice(-199), msg]);
        });

        socket.on('ssh:status', (status) => {
            console.log('SSH Status update:', status);
            setIsConnected(status.connected);
            setIsConnecting(false);
            if (status.connected) {
                setLastError(null);
                if (connectionTimeoutRef.current) clearTimeout(connectionTimeoutRef.current);
            }
        });

        socket.on('ssh:error', (error) => {
            console.error('SSH Error received:', error);
            setLastError(error);
            setIsConnecting(false);
            setIsConnected(false);
            if (connectionTimeoutRef.current) clearTimeout(connectionTimeoutRef.current);
        });

        socket.on('config:current', (cfg) => {
            setConfig(cfg);
            localStorage.setItem('mc_config', JSON.stringify(cfg));
        });

        // Reconnect logic: if socket reconnects, re-emit last known credentials if we were connected
        socket.on('connect', () => {
            const savedCreds = localStorage.getItem('ssh_credentials');
            if (savedCreds && !isConnected && !isConnecting) {
                console.log('Socket reconnected, attempting SSH auto-reconnect...');
                connectSSH(JSON.parse(savedCreds));
            }
        });

        return () => {
            socket.off('metrics:update');
            socket.off('players:update');
            socket.off('players:data_update');
            socket.off('console:log');
            socket.off('ssh:status');
            socket.off('ssh:error');
            socket.off('config:current');
            socket.off('connect');
        };
    }, [socket, isConnected, isConnecting]);

    const connectSSH = (creds) => {
        if (!socket) return;

        setIsConnecting(true);
        setLastError(null);
        localStorage.setItem('ssh_credentials', JSON.stringify(creds));

        socket.emit('ssh:connect', creds);

        // Timeout fallback
        if (connectionTimeoutRef.current) clearTimeout(connectionTimeoutRef.current);
        connectionTimeoutRef.current = setTimeout(() => {
            if (!isConnected) {
                setIsConnecting(false);
                setLastError('Connection timed out. Check your host and port.');
            }
        }, 35000); // 35 seconds timeout
    };

    const disconnectSSH = () => {
        if (!socket) return;
        socket.emit('ssh:disconnect');
        localStorage.removeItem('ssh_credentials');
        setIsConnected(false);
        setIsConnecting(false);
    };

    const updateConfig = (newConfig) => {
        if (socket) {
            setConfig(prev => ({ ...prev, ...newConfig }));
            socket.emit('config:update', newConfig);
            localStorage.setItem('mc_config', JSON.stringify({ ...config, ...newConfig }));
        }
    };

    const startConsole = () => {
        if (socket) socket.emit('console:start');
    };

    const refreshPlayers = () => {
        if (socket) socket.emit('players:refresh');
    };

    return (
        <ServerContext.Provider value={{
            stats,
            tps,
            players,
            persistentPlayers,
            logs,
            config,
            updateConfig,
            isConnected,
            isConnecting,
            lastError,
            connectSSH,
            disconnectSSH,
            startConsole,
            refreshPlayers
        }}>
            {children}
        </ServerContext.Provider>
    );
};
