import React from 'react'
import { motion } from 'framer-motion'
import { Shield, Zap, Package, CheckCircle2, Terminal, Cpu } from 'lucide-react'
import GlowCard from './GlowCard'

const features = [
    {
        icon: <Shield size={24} />,
        title: "Military Grade SSH",
        desc: "RSA-4096 encrypted tunnels ensure that your server control is absolute and impenetrable. No cloud middlemen."
    },
    {
        icon: <Zap size={24} />,
        title: "Zero Latency Bridge",
        desc: "Our native bridge protocol connects directly to your server node, providing sub-millisecond response times for all commands."
    },
    {
        icon: <Package size={24} />,
        title: "Plugin Intelligence",
        desc: "Browse and install over 50,000 plugins directly from the store. Auto-validated dependencies for a stable server."
    },
    {
        icon: <CheckCircle2 size={24} />,
        title: "YAML Verification",
        desc: "Integrated logic layer that validates your configuration files in real-time. Never crash your server on boot again."
    },
    {
        icon: <Terminal size={24} />,
        title: "Enhanced Console",
        desc: "A stylized terminal experience with syntax highlighting, command history, and instant hot-key support."
    },
    {
        icon: <Cpu size={24} />,
        title: "Resource Mastery",
        desc: "High-fidelity telemetry widgets monitor CPU, RAM, and Disk I/O with extreme precision and historical data."
    }
]

const FeatureGrid = () => {
    return (
        <section id="features" className="py-32 px-6">
            <div className="container mx-auto max-w-7xl">
                <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-8">
                    {features.map((f, i) => (
                        <motion.div
                            key={i}
                            initial={{ opacity: 0, y: 20 }}
                            whileInView={{ opacity: 1, y: 0 }}
                            viewport={{ once: true }}
                            transition={{ delay: i * 0.1 }}
                        >
                            <GlowCard className="p-10 h-full hover:bg-white/[0.04]">
                                <div className="w-12 h-12 bg-blue-500/10 rounded-xl flex items-center justify-center text-blue-400 mb-8 border border-blue-500/20 shadow-[0_0_20px_rgba(41,151,255,0.1)]">
                                    {f.icon}
                                </div>
                                <h3 className="text-2xl font-black mb-6 italic tracking-tight">{f.title}</h3>
                                <p className="text-white/40 text-[14px] leading-relaxed font-light">
                                    {f.desc}
                                </p>
                            </GlowCard>
                        </motion.div>
                    ))}
                </div>
            </div>
        </section>
    )
}

export default FeatureGrid
