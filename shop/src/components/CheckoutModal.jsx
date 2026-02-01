import React from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { X, ShieldCheck, CreditCard, Lock, Sparkles } from 'lucide-react'

const CheckoutModal = ({ isOpen, onClose }) => {
    return (
        <AnimatePresence>
            {isOpen && (
                <>
                    {/* Backdrop */}
                    <motion.div
                        initial={{ opacity: 0 }}
                        animate={{ opacity: 1 }}
                        exit={{ opacity: 0 }}
                        onClick={onClose}
                        className="fixed inset-0 bg-black/80 backdrop-blur-md z-[200]"
                    />

                    {/* Modal */}
                    <motion.div
                        initial={{ opacity: 0, scale: 0.9, y: 20 }}
                        animate={{ opacity: 1, scale: 1, y: 0 }}
                        exit={{ opacity: 0, scale: 0.9, y: 20 }}
                        className="fixed top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-full max-w-lg z-[210] p-6"
                    >
                        <div className="glass-card shadow-[0_50px_100px_rgba(0,0,0,0.9)] p-8 relative">
                            <button
                                onClick={onClose}
                                className="absolute top-6 right-6 text-white/20 hover:text-white transition-colors"
                            >
                                <X size={20} />
                            </button>

                            <div className="flex flex-col items-center text-center mb-10">
                                <div className="w-16 h-16 bg-white/5 rounded-2xl flex items-center justify-center mb-6 border border-white/10">
                                    <Sparkles className="text-blue-400" size={32} />
                                </div>
                                <h2 className="text-3xl font-black mb-2 italic">Secure Access.</h2>
                                <p className="font-tech text-white/40">v3.0.5 Industrial License</p>
                            </div>

                            <div className="space-y-4 mb-10">
                                <div className="flex justify-between items-center p-4 bg-white/5 rounded-xl border border-white/5 font-tech">
                                    <span className="text-white/60">One-Time License</span>
                                    <span className="font-black">1.95 CHF</span>
                                </div>
                                <div className="flex justify-between items-center p-4 bg-white/5 rounded-xl border border-white/5 font-tech">
                                    <span className="text-white/60">Updates & Support</span>
                                    <span className="text-green-400 font-bold uppercase text-[10px] tracking-widest">Included</span>
                                </div>
                                <div className="h-px bg-white/5 my-4" />
                                <div className="flex justify-between items-center px-4 font-black text-xl italic">
                                    <span>Total Amount</span>
                                    <span className="text-glow">1.95 CHF</span>
                                </div>
                            </div>

                            <button className="btn-buy w-full py-5 mb-6 text-lg tracking-tight group">
                                COMPLETE ORDER
                            </button>

                            <div className="flex items-center justify-center gap-6 opacity-20 grayscale mb-8">
                                <CreditCard size={24} />
                                <Lock size={24} />
                                <ShieldCheck size={24} />
                            </div>

                            <div className="text-center">
                                <p className="text-[10px] font-black uppercase text-red-400/60 tracking-[0.2em] mb-2 animate-pulse">
                                    Limited availability
                                </p>
                                <p className="text-[10px] font-bold text-white/20 uppercase tracking-widest">
                                    Only 47 licenses left at this price point.
                                </p>
                            </div>
                        </div>
                    </motion.div>
                </>
            )}
        </AnimatePresence>
    )
}

export default CheckoutModal
