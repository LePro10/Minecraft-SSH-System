import React from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { useToast } from '../context/ToastContext';
import { CheckCircle, AlertCircle, Info, X } from 'lucide-react';

const ToastItem = ({ toast }) => {
    const [expanded, setExpanded] = React.useState(false);

    const copyError = () => {
        if (!toast.details) return;
        const text = typeof toast.details === 'object' ? JSON.stringify(toast.details, null, 2) : toast.details;
        navigator.clipboard.writeText(text);
        // Could show a mini feedback here, but simple is better
    };

    return (
        <motion.div
            layout
            initial={{ opacity: 0, x: -50, scale: 0.8 }}
            animate={{ opacity: 1, x: 0, scale: 1 }}
            exit={{ opacity: 0, scale: 0.5, transition: { duration: 0.2 } }}
            className={`toast-item ${toast.type}`}
        >
            <div className="toast-icon">
                {toast.type === 'success' && <CheckCircle size={18} />}
                {toast.type === 'error' && <AlertCircle size={18} />}
                {toast.type === 'info' && <Info size={18} />}
            </div>
            <div className="toast-content">
                <div className="toast-msg">{toast.message}</div>
                {toast.action && (
                    <button className="toast-action-btn" onClick={() => toast.action.onClick()}>
                        {toast.action.label}
                    </button>
                )}
                {toast.details && (
                    <div className="toast-details-wrapper">
                        <div className="details-actions">
                            <button className="toast-expand-btn" onClick={() => setExpanded(!expanded)}>
                                {expanded ? 'Hide Details' : 'View Details'}
                            </button>
                            {expanded && <button className="toast-copy-btn" onClick={copyError}>Copy</button>}
                        </div>
                        {expanded && (
                            <pre className="toast-error-log">
                                {typeof toast.details === 'object' ? JSON.stringify(toast.details, null, 2) : toast.details}
                            </pre>
                        )}
                    </div>
                )}
            </div>
        </motion.div>
    );
};

const ToastContainer = () => {
    const { toasts } = useToast();

    return (
        <div className="toast-container">
            <AnimatePresence>
                {toasts.map(toast => (
                    <ToastItem key={toast.id} toast={toast} />
                ))}
            </AnimatePresence>

            <style jsx>{`
                .toast-container {
                    position: fixed;
                    bottom: 24px;
                    right: 24px;
                    z-index: 9999;
                    display: flex;
                    flex-direction: column;
                    gap: 12px;
                    pointer-events: none;
                }
                .toast-item {
                    pointer-events: auto;
                    min-width: 320px;
                    max-width: 450px;
                    background: rgba(15, 18, 25, 0.95);
                    backdrop-filter: blur(16px);
                    border: 1px solid rgba(255, 255, 255, 0.1);
                    border-radius: 12px;
                    padding: 16px;
                    display: flex;
                    align-items: flex-start;
                    gap: 12px;
                    box-shadow: 0 10px 40px rgba(0, 0, 0, 0.5);
                    color: white;
                }
                .toast-item.success { border-left: 4px solid #34c759; }
                .toast-item.error { border-left: 4px solid #ff3b30; }
                .toast-item.info { border-left: 4px solid #007aff; }
                
                .toast-icon { padding-top: 2px; display: flex; align-items: center; justify-content: center; }
                .toast-item.success .toast-icon { color: #34c759; }
                .toast-item.error .toast-icon { color: #ff3b30; }
                .toast-item.info .toast-icon { color: #007aff; }
                
                .toast-content { flex: 1; font-size: 0.9rem; font-weight: 500; display: flex; flex-direction: column; gap: 8px; overflow: hidden; }
                .toast-msg { line-height: 1.4; }

                .toast-action-btn { align-self: flex-start; background: rgba(255,255,255,0.1); border: none; padding: 6px 12px; border-radius: 4px; color: white; cursor: pointer; font-size: 0.8rem; font-weight: 600; transition: 0.2s; }
                .toast-action-btn:hover { background: rgba(255,255,255,0.2); }

                .toast-expand-btn { background: none; border: none; padding: 0; color: var(--text-secondary); font-size: 0.75rem; cursor: pointer; text-decoration: underline; align-self: flex-start; }
                .toast-expand-btn:hover { color: white; }
                
                .toast-error-log { margin-top: 8px; background: rgba(0,0,0,0.3); padding: 8px; border-radius: 6px; font-family: monospace; font-size: 0.7rem; color: #ff8a80; white-space: pre-wrap; word-break: break-all; max-height: 200px; overflow-y: auto; }
                
                .details-actions { display: flex; align-items: center; gap: 12px; }
                .toast-copy-btn { background: rgba(255,255,255,0.1); border: none; padding: 2px 8px; border-radius: 4px; color: var(--text-secondary); cursor: pointer; font-size: 0.7rem; }
                .toast-copy-btn:hover { background: white; color: black; }
            `}</style>
        </div>
    );
};

export default ToastContainer;
