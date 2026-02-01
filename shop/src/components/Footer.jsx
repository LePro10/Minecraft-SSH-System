import React from 'react'
import { Terminal, Github, Twitter, Mail } from 'lucide-react'

const Footer = () => {
    return (
        <footer className="py-20 px-6 border-t border-white/5 bg-black">
            <div className="container mx-auto max-w-7xl">
                <div className="flex flex-col md:flex-row justify-between items-start gap-16 mb-20">
                    <div className="flex flex-col gap-6">
                        <div className="flex items-center gap-4">
                            <div className="w-10 h-10 bg-accent-gradient rounded-xl flex items-center justify-center">
                                <Terminal size={18} className="text-white" />
                            </div>
                            <span className="text-xl font-black italic tracking-tighter">SMM.SYSTEM</span>
                        </div>
                        <p className="max-w-xs text-sm font-light leading-relaxed text-white/30">
                            The professional edge for server architects. <br />
                            Own your infrastructure. Absolute control.
                        </p>
                    </div>

                    <div className="grid grid-cols-2 md:grid-cols-3 gap-16">
                        <div className="flex flex-col gap-6">
                            <h4 className="text-[10px] font-black uppercase tracking-[0.3em] text-white/20">Product</h4>
                            <ul className="flex flex-col gap-4 text-sm font-light text-white/60">
                                <li className="hover:text-blue-400 cursor-pointer transition-colors">Features</li>
                                <li className="hover:text-blue-400 cursor-pointer transition-colors">Industrial v3</li>
                                <li className="hover:text-blue-400 cursor-pointer transition-colors">Security Node</li>
                            </ul>
                        </div>
                        <div className="flex flex-col gap-6">
                            <h4 className="text-[10px] font-black uppercase tracking-[0.3em] text-white/20">Legal</h4>
                            <ul className="flex flex-col gap-4 text-sm font-light text-white/60">
                                <li className="hover:text-blue-400 cursor-pointer transition-colors">Terms</li>
                                <li className="hover:text-blue-400 cursor-pointer transition-colors">Privacy</li>
                                <li className="hover:text-blue-400 cursor-pointer transition-colors">License</li>
                            </ul>
                        </div>
                    </div>
                </div>

                <div className="flex flex-col md:flex-row justify-between items-center gap-8 pt-10 border-t border-white/5 font-tech opacity-20 uppercase tracking-[0.2em] text-[9px]">
                    <span>© 2026 SMM INDUSTRIAL. ALL RIGHTS RESERVED.</span>
                    <div className="flex gap-8">
                        <Twitter size={14} className="hover:text-white cursor-pointer transition-all" />
                        <Github size={14} className="hover:text-white cursor-pointer transition-all" />
                        <Mail size={14} className="hover:text-white cursor-pointer transition-all" />
                    </div>
                </div>
            </div>
        </footer>
    )
}

export default Footer
