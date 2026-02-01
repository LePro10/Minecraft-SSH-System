import React, { useState, Suspense, lazy } from 'react'
import Navbar from './components/Navbar'
import Hero from './components/Hero'
import CheckoutModal from './components/CheckoutModal'
import Footer from './components/Footer'

// Lazy loaded for performance
const LiveDemo = lazy(() => import('./components/LiveDemo'))
const FeatureGrid = lazy(() => import('./components/FeatureGrid'))
const Installation = lazy(() => import('./components/Installation'))
const SocialProof = lazy(() => import('./components/SocialProof'))

const LoadingFallback = () => (
    <div className="h-[400px] w-full flex items-center justify-center">
        <div className="w-8 h-8 border-2 border-white/10 border-t-white/40 rounded-full animate-spin" />
    </div>
)

function App() {
    const [isModalOpen, setIsModalOpen] = useState(false)

    return (
        <div className="min-h-screen bg-background selection:bg-blue-500/30 overflow-x-hidden relative">
            {/* GLOBAL LIQUID BACKGROUND */}
            <div className="fixed inset-0 z-0 pointer-events-none">
                <div
                    className="absolute top-[-20%] left-[-10%] w-[60vw] h-[60vw] rounded-full mix-blend-screen animate-glow-pulse"
                    style={{ backgroundColor: 'rgba(41, 151, 255, 0.08)', filter: 'blur(150px)' }}
                />
                <div
                    className="absolute bottom-[-20%] right-[-10%] w-[70vw] h-[70vw] rounded-full mix-blend-screen animate-glow-pulse"
                    style={{ backgroundColor: 'rgba(162, 89, 255, 0.06)', animationDelay: '2s', filter: 'blur(180px)' }}
                />
            </div>

            <div className="relative z-10">
                <Navbar onBuyClick={() => setIsModalOpen(true)} />

                <main>
                    <Hero onBuyClick={() => setIsModalOpen(true)} />

                    <Suspense fallback={<LoadingFallback />}>
                        <LiveDemo />
                        <FeatureGrid />
                        <Installation />
                        <SocialProof />
                    </Suspense>

                    {/* Scarcity Price Section */}
                    <section className="py-32 px-6 text-center">
                        <div className="container mx-auto max-w-4xl">
                            <h2 className="text-5xl md:text-8xl font-black italic tracking-tighter mb-10 text-glow">
                                Final Chance. <br />
                                <span className="text-white/20 not-italic">Claim Life Access.</span>
                            </h2>
                            <div className="flex flex-col items-center gap-8">
                                <div className="text-3xl font-black italic tracking-tighter flex items-center gap-4 text-white/40">
                                    STAY AT <span className="text-white line-through opacity-20">10.00</span>
                                    <span className="text-white text-6xl">1.95 <span className="text-sm not-italic opacity-50 uppercase tracking-widest">CHF</span></span>
                                </div>
                                <button
                                    onClick={() => setIsModalOpen(true)}
                                    className="btn-buy py-6 px-16 text-xl shadow-[0_20px_50px_rgba(255,255,255,0.2)]"
                                >
                                    SECURE MY LICENSE NOW
                                </button>
                                <p className="font-tech text-white/20 uppercase tracking-[0.3em]">Secure Stripe & PayPal Checkout</p>
                            </div>
                        </div>
                    </section>
                </main>

                <Footer />
            </div>

            <CheckoutModal
                isOpen={isModalOpen}
                onClose={() => setIsModalOpen(false)}
            />
        </div>
    )
}

export default App
