/** @type {import('tailwindcss').Config} */
export default {
    content: [
        "./index.html",
        "./src/**/*.{js,ts,jsx,tsx}",
    ],
    theme: {
        extend: {
            colors: {
                glass: {
                    100: 'rgba(255, 255, 255, 0.05)',
                    200: 'rgba(255, 255, 255, 0.1)',
                    300: 'rgba(255, 255, 255, 0.2)',
                    border: 'rgba(255, 255, 255, 0.08)',
                },
                theme: {
                    base: 'var(--bg-app)',
                    panel: 'var(--bg-panel)',
                    text: 'var(--text-primary)',
                    muted: 'var(--text-secondary)',
                    accent: 'var(--accent-primary)',
                }
            },
            borderRadius: {
                'sm': 'var(--radius-sm)',
                'md': 'var(--radius-md)',
                'lg': 'var(--radius-md)',
                'xl': 'var(--radius-md)',
                '2xl': 'var(--radius-lg)',
                '3xl': 'var(--radius-lg)',
                'full': '9999px',
            },
            fontFamily: {
                sans: ['"SF Pro Display"', '"Inter"', 'system-ui', 'sans-serif'],
                mono: ['"SF Mono"', '"JetBrains Mono"', 'monospace'],
            },
            backdropBlur: {
                'xs': '2px',
                '2xl': '40px',
                '3xl': '60px',
            },
            transitionTimingFunction: {
                'liquid': 'cubic-bezier(0.25, 0.8, 0.25, 1)',
                'bounce-soft': 'cubic-bezier(0.175, 0.885, 0.32, 1.275)',
            },
            boxShadow: {
                'glass': '0 8px 32px 0 rgba(0, 0, 0, 0.3)',
                'glass-inset': 'inset 0 0 0 1px rgba(255, 255, 255, 0.05)',
                'glass-rim': 'inset 0 1px 0 0 rgba(255, 255, 255, 0.2)',
                'neon': '0 0 20px rgba(14, 165, 233, 0.5)',
            },
            backgroundImage: {
                'glass-gradient': 'linear-gradient(145deg, rgba(255,255,255,0.07) 0%, rgba(255,255,255,0.01) 100%)',
            },
            animation: {
                'float': 'float 6s ease-in-out infinite',
                'pulse-slow': 'pulse 4s cubic-bezier(0.4, 0, 0.6, 1) infinite',
            },
            keyframes: {
                float: {
                    '0%, 100%': { transform: 'translateY(0)' },
                    '50%': { transform: 'translateY(-20px)' },
                }
            }
        },
    },
    plugins: [],
}
