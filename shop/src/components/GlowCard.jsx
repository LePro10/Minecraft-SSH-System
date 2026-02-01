import React, { useRef } from 'react'

const GlowCard = ({ children, className = "" }) => {
    const cardRef = useRef(null)

    const handleMouseMove = (e) => {
        if (!cardRef.current) return
        const { left, top } = cardRef.current.getBoundingClientRect()
        cardRef.current.style.setProperty('--mouse-x', `${e.clientX - left}px`)
        cardRef.current.style.setProperty('--mouse-y', `${e.clientY - top}px`)
    }

    return (
        <div
            ref={cardRef}
            onMouseMove={handleMouseMove}
            className={`glass-card glow-card ${className}`}
        >
            <div className="relative z-20">
                {children}
            </div>
        </div>
    )
}

export default GlowCard
