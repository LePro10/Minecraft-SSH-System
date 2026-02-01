import React from 'react'
import { motion } from 'framer-motion'
import { Star, User, ShieldCheck } from 'lucide-react'
import GlowCard from './GlowCard'

const reviews = [
    {
        name: "Alex M.",
        role: "Network Admin",
        text: "The first dashboard that actually feels like professional software. The SSH native link is a game changer for latency.",
        rating: 5
    },
    {
        name: "Stefan K.",
        role: "Community Owner",
        text: "v3.0.5 is incredibly stable. The YAML validation saved my server at least four times during bulk config updates.",
        rating: 5
    },
    {
        name: "Laura D.",
        role: "Developer",
        text: "Finally a tool that looks as good as it works. The Apple-style aesthetics really elevate the whole experience.",
        rating: 5
    },
    {
        name: "MinecraftGuy",
        role: "Server Owner",
        text: "Install was done in 10 seconds. Best 1.95 CHF I've ever spent on my project. Lifetime license is unreal value.",
        rating: 5
    }
]

const SocialProof = () => {
    return (
        <section className="py-32 px-6">
            <div className="container mx-auto max-w-7xl">
                <div className="text-center mb-20">
                    <h2 className="text-4xl md:text-6xl font-black tracking-tighter italic italic">Trusted by <span className="text-white/40">Architects.</span></h2>
                </div>

                <div className="columns-1 md:columns-2 lg:columns-3 gap-8 space-y-8">
                    {reviews.map((r, i) => (
                        <motion.div
                            key={i}
                            initial={{ opacity: 0, scale: 0.95 }}
                            whileInView={{ opacity: 1, scale: 1 }}
                            viewport={{ once: true }}
                            transition={{ delay: i * 0.1 }}
                            className="break-inside-avoid"
                        >
                            <GlowCard className="p-8">
                                <div className="flex items-center justify-between mb-8">
                                    <div className="flex gap-1 text-blue-400">
                                        {[...Array(r.rating)].map((_, i) => <Star key={i} size={14} fill="currentColor" />)}
                                    </div>
                                    <div className="flex items-center gap-2 px-3 py-1 bg-white/5 rounded-full border border-white/5">
                                        <ShieldCheck size={10} className="text-green-400" />
                                        <span className="text-[8px] font-black uppercase tracking-widest text-white/40">VERIFIED</span>
                                    </div>
                                </div>
                                <p className="text-lg font-light leading-relaxed mb-8 italic text-white/80">
                                    "{r.text}"
                                </p>
                                <div className="flex items-center gap-4">
                                    <div className="w-10 h-10 bg-white/5 rounded-full flex items-center justify-center border border-white/10">
                                        <User size={18} className="text-white/20" />
                                    </div>
                                    <div className="flex flex-col">
                                        <span className="text-xs font-black italic">{r.name}</span>
                                        <span className="text-[9px] font-bold text-white/20 tracking-widest uppercase">{r.role}</span>
                                    </div>
                                </div>
                            </GlowCard>
                        </motion.div>
                    ))}
                </div>
            </div>
        </section>
    )
}

export default SocialProof
