import React, { useState, useEffect } from 'react'
import { motion } from 'framer-motion'
import { Terminal } from 'lucide-react'

const Navbar = ({ onBuyClick }) => {
    const [scrolled, setScrolled] = useState(false)

    useEffect(() => {
        const handleScroll = () => setScrolled(window.scrollY > 50)
        window.addEventListener('scroll', handleScroll)
        return () => window.removeEventListener('scroll', handleScroll)
    }, [])

    return (
        <nav className={`fixed top-0 left-0 right-0 z-[100] transition-all duration-501 ${scrolled ? 'py-4' : 'py-10'
            }`}>
            <div className="container mx-auto px-6">
                <div className={`flex items-center justify-between px-8 py-4 transition-all duration-500 ${scrolled ? 'glass-card rounded-2xl shadow-2xl bg-black/40 backdrop-blur-3xl border-white/5' : 'bg-transparent border-transparent'
                    }`}>
                    {/* Logo */}
                    <div className="flex items-center gap-4 group cursor-pointer">
                        <div className="w-10 h-10 bg-accent-gradient rounded-xl shadow-lg flex items-center justify-center group-hover:scale-110 transition-transform">
                            <Terminal size={18} className="text-white" />
                        </div>
                        <div className="flex flex-col">
                            <span className="text-lg font-black italic tracking-tighter leading-none">SMM.SYSTEM</span>
                            <span className="text-[8px] font-black uppercase tracking-[0.4em] text-blue-400">Industrial Edition</span>
                        </div>
                    </div>

                    {/* Nav Links */}
                    <div className="hidden lg:flex items-center gap-12">
                        {['Features', 'Demo', 'Docs', 'Pricing'].map(item => (
                            <a
                                key={item}
                                href={`#${item.toLowerCase()}`}
                                className="text-[10px] font-black uppercase tracking-[0.3em] text-white/30 hover:text-white transition-colors"
                            >
                                {item}
                            </a>
                        ))}
                    </div>

                    {/* CTA */}
                    <div className="flex items-center gap-8">
                        <span className="hidden sm:inline font-tech text-white/20 uppercase tracking-[0.2em]">v3.0.5</span>
                        <button
                            onClick={onBuyClick}
                            className="btn-buy py-3 px-8 text-[11px] tracking-widest shadow-xl"
                        >
                            SECURE ACCESS
                        </button>
                    </div>
                </div>
            </div>
        </nav>
    )
}

export default Navbar
