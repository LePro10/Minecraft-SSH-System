import React, { createContext, useContext, useState, useCallback } from 'react';

const ToastContext = createContext();

export const useToast = () => {
    const context = useContext(ToastContext);
    if (!context) throw new Error('useToast must be used within a ToastProvider');
    return context;
};

export const ToastProvider = ({ children }) => {
    const [toasts, setToasts] = useState([]);

    const showToast = useCallback((message, type = 'success', options = null) => {
        const id = Math.random().toString(36).substr(2, 9);
        const action = options?.label ? options : (options?.action || null);
        const details = options?.details || null;
        const duration = options?.duration || 5000;

        setToasts(prev => [...prev, { id, message, type, action, details }]);
        setTimeout(() => {
            setToasts(prev => prev.filter(t => t.id !== id));
        }, duration);
    }, []);

    return (
        <ToastContext.Provider value={{ showToast, toasts }}>
            {children}
        </ToastContext.Provider>
    );
};
