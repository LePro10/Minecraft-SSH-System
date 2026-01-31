import React from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { useToast } from '../context/ToastContext';
import { CheckCircle, AlertCircle, Info, X } from 'lucide-react';

const ToastContainer = () => {
    const { toasts } = useToast();

    return (
        <div className="toast-container">
            <AnimatePresence>
                {toasts.map(toast => (
                    <motion.div
                        key={toast.id}
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
                        <div className="toast-content">{toast.message}</div>
                    </motion.div>
                ))}
            </AnimatePresence>

            <style jsx>{`
                .toast-container {
                    position: fixed;
                    bottom: 24px;
                    left: 24px;
                    z-index: 9999;
                    display: flex;
                    flex-direction: column;
                    gap: 12px;
                    pointer-events: none;
                }
                .toast-item {
                    pointer-events: auto;
                    min-width: 280px;
                    background: rgba(15, 18, 25, 0.8);
                    backdrop-filter: blur(16px);
                    border: 1px solid rgba(255, 255, 255, 0.1);
                    border-radius: 16px;
                    padding: 16px;
                    display: flex;
                    align-items: center;
                    gap: 12px;
                    box-shadow: 0 10px 30px rgba(0, 0, 0, 0.4);
                    color: white;
                }
                .toast-item.success { border-left: 4px solid #34c759; }
                .toast-item.error { border-left: 4px solid #ff3b30; }
                .toast-item.info { border-left: 4px solid #007aff; }
                
                .toast-icon { display: flex; align-items: center; justify-content: center; }
                .toast-item.success .toast-icon { color: #34c759; }
                .toast-item.error .toast-icon { color: #ff3b30; }
                .toast-item.info .toast-icon { color: #007aff; }
                
                .toast-content { font-size: 0.9rem; font-weight: 500; }
            `}</style>
        </div>
    );
};

export default ToastContainer;
