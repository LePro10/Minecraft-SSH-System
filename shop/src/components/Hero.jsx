import React from 'react'
import { motion } from 'framer-motion'
import { Sparkles, ArrowRight, ShieldCheck } from 'lucide-react'

const Hero = ({ onBuyClick }) => {
    return (
        <section className="relative pt-44 pb-32 overflow-hidden px-6">
            {/* Background Decor */}
            <div className="absolute top-0 left-1/2 -translate-x-1/2 w-full h-[1000px] -z-10">
                <div className="absolute top-[-10%] left-[-10%] w-[50%] h-[50%] bg-blue-500/5 blur-[120px] rounded-full animate-glow-pulse" />
                <div className="absolute bottom-[20%] right-[-10%] w-[40%] h-[40%] bg-purple-500/5 blur-[100px] rounded-full animate-glow-pulse" style={{ animationDelay: '2s' }} />
            </div>

            <div className="container mx-auto max-w-6xl text-center">
                <motion.div
                    initial={{ opacity: 0, scale: 0.9 }}
                    animate={{ opacity: 1, scale: 1 }}
                    transition={{ duration: 1, ease: [0.22, 1, 0.36, 1] }}
                >
                    {/* Animated Badge */}
                    <div className="inline-flex items-center gap-3 px-4 py-2 mb-12 bg-white/5 border border-white/10 rounded-full backdrop-blur-3xl overflow-hidden">
                        <motion.div
                            animate={{ rotate: 360 }}
                            transition={{ duration: 4, repeat: Infinity, ease: "linear" }}
                        >
                            <Sparkles size={14} className="text-blue-400" />
                        </motion.div>
                        <span className="text-[10px] font-black uppercase tracking-[0.3em] text-white/50">Flash Offer Live</span>
                        <div className="w-px h-3 bg-white/10 mx-1" />
                        <span className="text-[10px] font-black uppercase text-blue-400">80% OFF</span>
                    </div>

                    <h1 className="text-6xl md:text-9xl font-black mb-10 leading-[0.85] tracking-tighter italic text-gradient-premium">
                        Your Server. <br />
                        Reimagined.
                    </h1>

                    <p className="max-w-2xl mx-auto text-lg md:text-xl text-white/60 mb-16 leading-relaxed font-light">
                        The elite SSH-native ecosystem for Minecraft management. <br />
                        Ultra-speed. Absolute security. Industrial workflow.
                    </p>

                    <div className="flex flex-col items-center gap-8">
                        <div className="flex items-baseline gap-6 mb-4">
                            <span className="text-4xl text-white/10 line-through font-black">10.00</span>
                            <span className="text-8xl md:text-[8rem] font-black italic tracking-tighter text-glow flex items-baseline gap-2">
                                1.95 <span className="text-2xl not-italic opacity-30">CHF</span>
                            </span>
                        </div>

                        <button
                            onClick={onBuyClick}
                            className="btn-buy group relative flex items-center gap-4 py-6 px-12 text-xl"
                        >
                            GET PERMANENT ACCESS <ArrowRight className="group-hover:translate-x-1 transition-transform" />
                        </button>

                        <div className="flex flex-wrap justify-center gap-8 mt-4">
                            {[
                                { icon: <ShieldCheck size={14} />, text: "One-Time Life Purchase" },
                                { icon: <ShieldCheck size={14} />, text: "Zero Monthly Fees" }
                            ].map((item, i) => (
                                <div key={i} className="flex items-center gap-2 text-[10px] font-black uppercase tracking-widest text-white/20">
                                    <span className="text-blue-500/50">{item.icon}</span>
                                    {item.text}
                                </div>
                            ))}
                        </div>
                    </div>
                </motion.div>
            </div>
        </section>
    )
}

export default Hero
