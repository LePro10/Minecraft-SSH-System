import React, { useState } from 'react'
import { motion } from 'framer-motion'
import { Terminal, Copy, Check, Download } from 'lucide-react'
import GlowCard from './GlowCard'

const Installation = () => {
    const [copied, setCopied] = useState(false)
    const command = "curl -sL smm.sh | bash"

    const handleCopy = () => {
        navigator.clipboard.writeText(command)
        setCopied(true)
        setTimeout(() => setCopied(false), 2000)
    }

    return (
        <section className="py-32 px-6">
            <div className="container mx-auto max-w-4xl">
                <div className="text-center mb-16">
                    <h2 className="text-4xl md:text-6xl font-black italic tracking-tighter mb-6">Zero Friction.</h2>
                    <p className="text-white/40 font-light max-w-xl mx-auto italic">Deploy your entire management ecosystem with a single command.</p>
                </div>

                <GlowCard className="p-10 border-white/5 bg-black/60 shadow-2xl">
                    <div className="flex items-center justify-between mb-8">
                        <div className="flex gap-2">
                            <div className="w-3 h-3 rounded-full bg-red-500/30" />
                            <div className="w-3 h-3 rounded-full bg-yellow-500/30" />
                            <div className="w-3 h-3 rounded-full bg-green-500/30" />
                        </div>
                        <div className="text-[10px] font-black uppercase tracking-[0.2em] text-white/20 flex items-center gap-2">
                            <Terminal size={12} /> BASH SESSION
                        </div>
                    </div>

                    <div className="flex flex-col md:flex-row items-center gap-6 bg-white/[0.02] p-6 rounded-2xl border border-white/5">
                        <div className="flex-1 font-mono text-sm md:text-lg tracking-tight flex items-center gap-4">
                            <span className="text-blue-500 font-black">$</span>
                            <span className="text-white/80">{command}</span>
                        </div>
                        <button
                            onClick={handleCopy}
                            className="btn-buy py-3 px-6 text-xs flex items-center gap-2"
                        >
                            {copied ? <Check size={14} /> : <Copy size={14} />}
                            {copied ? "COPIED" : "COPY INSTALL"}
                        </button>
                    </div>

                    <div className="mt-10 grid grid-cols-3 gap-6">
                        {[
                            { label: 'Download', val: '12 MB', icon: <Download size={14} /> },
                            { label: 'Setup Time', val: '~15 Sec', icon: <Download size={14} /> },
                            { label: 'Encryption', val: 'Enabled', icon: <Download size={14} /> },
                        ].map((item, i) => (
                            <div key={i} className="text-center">
                                <div className="text-[9px] font-black uppercase text-white/20 tracking-widest mb-1">{item.label}</div>
                                <div className="text-sm font-black text-white/60">{item.val}</div>
                            </div>
                        ))}
                    </div>
                </GlowCard>
            </div>
        </section>
    )
}

export default Installation
