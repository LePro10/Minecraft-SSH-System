/** @type {import('tailwindcss').Config} */
module.exports = {
    content: [
        "./index.html",
        "./src/**/*.{js,ts,jsx,tsx}",
    ],
    theme: {
        extend: {
            fontFamily: {
                sans: ['Inter', 'Outfit', 'sans-serif'],
                mono: ['JetBrains Mono', 'Fira Code', 'monospace'],
            },
            colors: {
                background: '#020202',
                dim: '#05070a',
                accent: {
                    primary: '#2997ff',
                    secondary: '#a259ff',
                    success: '#34c759',
                },
                glass: {
                    surface: 'rgba(255, 255, 255, 0.03)',
                    border: 'rgba(255, 255, 255, 0.08)',
                    highlight: 'rgba(255, 255, 255, 0.15)',
                }
            },
            animation: {
                'glow-pulse': 'glow-pulse 8s infinite ease-in-out',
                'fade-in-up': 'fade-in-up 0.8s ease-out forwards',
                'float': 'float 6s infinite ease-in-out',
                'spin-slow': 'spin 20s linear infinite',
            },
            keyframes: {
                'glow-pulse': {
                    '0%, 100%': { opacity: 0.2, transform: 'scale(1)' },
                    '50%': { opacity: 0.4, transform: 'scale(1.15)' },
                },
                'fade-in-up': {
                    '0%': { opacity: 0, transform: 'translateY(20px)' },
                    '100%': { opacity: 1, transform: 'translateY(0)' },
                },
                'float': {
                    '0%, 100%': { transform: 'translateY(0)' },
                    '50%': { transform: 'translateY(-20px)' },
                }
            },
            backdropBlur: {
                'xs': '2px',
            }
        },
    },
    plugins: [],
}
