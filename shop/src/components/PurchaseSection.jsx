import React from 'react'
import { motion } from 'framer-motion'
import { CreditCard, Rocket, Shield, Box } from 'lucide-react'

const PurchaseSection = () => {
    return (
        <section id="pricing" className="py-24 overflow-hidden relative">
            {/* Background Glow */}
            <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[600px] h-[600px] bg-blue-500/5 blur-[120px] rounded-full -z-10" />

            <div className="container mx-auto px-6">
                <motion.div
                    initial={{ opacity: 0, scale: 0.95 }}
                    whileInView={{ opacity: 1, scale: 1 }}
                    viewport={{ once: true }}
                    className="max-w-5xl mx-auto glass-card relative overflow-hidden"
                >
                    {/* Accent Glow */}
                    <div className="absolute top-0 right-0 w-[400px] h-[400px] bg-purple-500/5 blur-[100px] -translate-y-1/2 translate-x-1/2 rounded-full" />

                    <div className="p-10 md:p-20 flex flex-col md:flex-row gap-16 items-center relative z-10">
                        <div className="flex-1 text-center md:text-left">
                            <span className="text-blue-400 uppercase tracking-[0.4em] font-black text-[10px] mb-6 block">Immediate Delivery</span>
                            <h2 className="text-5xl md:text-7xl font-black mb-8 leading-[1] tracking-tighter">Your System. <br /><span className="text-white/40">Your Legacy.</span></h2>
                            <p className="text-white/40 text-lg md:text-xl mb-10 leading-relaxed max-w-md">
                                No monthly costs. No cloud dependency. Own the most sophisticated management system ever built for Minecraft professionals.
                            </p>

                            <div className="grid grid-cols-2 gap-8 mb-4">
                                <div className="flex flex-col gap-2">
                                    <div className="flex items-center gap-3 text-white/80">
                                        <Shield className="w-5 h-5 text-blue-500" />
                                        <span className="text-xs font-black uppercase tracking-widest">Safe & Secure</span>
                                    </div>
                                    <p className="text-[10px] text-white/20 ml-8 uppercase font-bold">AES-256 SSH Encryption</p>
                                </div>
                                <div className="flex flex-col gap-2">
                                    <div className="flex items-center gap-3 text-white/80">
                                        <Rocket className="w-5 h-5 text-purple-500" />
                                        <span className="text-xs font-black uppercase tracking-widest">Instant Boot</span>
                                    </div>
                                    <p className="text-[10px] text-white/20 ml-8 uppercase font-bold">Zero-Wait Deployment</p>
                                </div>
                            </div>
                        </div>

                        <div className="w-full md:w-[400px] glass-card p-10 shadow-2xl border-white/20 relative group">
                            <div className="absolute inset-0 bg-gradient-to-b from-blue-500/10 to-transparent opacity-0 group-hover:opacity-100 transition-opacity rounded-[24px]" />

                            <div className="relative z-10">
                                <div className="text-center mb-10">
                                    <p className="text-[10px] font-black text-blue-400 uppercase tracking-[0.3em] mb-4">Ultimate Edition</p>
                                    <div className="flex items-baseline justify-center gap-4">
                                        <span className="text-2xl text-white/10 line-through font-black">10.00</span>
                                        <span className="text-7xl font-black italic tracking-tighter text-glow">1.95 <span className="text-2xl not-italic opacity-30">CHF</span></span>
                                    </div>
                                    <p className="text-[10px] text-white/20 mt-4 font-bold tracking-widest uppercase">One-time payment, forever yours</p>
                                </div>

                                <button className="btn-primary w-full py-6 text-xl mb-10 shadow-[0_20px_40px_rgba(41,151,255,0.2)]">
                                    GET ACCESS NOW
                                </button>

                                <div className="flex flex-col gap-6">
                                    <p className="text-[8px] font-black uppercase text-center text-white/20 tracking-[0.4em]">Partnered with Industry Leaders</p>
                                    <div className="flex justify-center gap-8 opacity-20 group-hover:opacity-50 transition-all duration-700 grayscale group-hover:grayscale-0">
                                        <CreditCard className="w-8 h-8" />
                                        <Box className="w-8 h-8" />
                                        <div className="font-extrabold text-2xl italic tracking-tighter">STRIPE</div>
                                    </div>
                                </div>
                            </div>
                        </div>
                    </div>
                </motion.div>
            </div>
        </section>
    )
}

export default PurchaseSection
