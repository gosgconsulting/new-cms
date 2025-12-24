import type { Config } from "tailwindcss";

export default {
	
	content: [
		"./pages/**/*.{ts,tsx}",
		"./components/**/*.{ts,tsx}",
		"./app/**/*.{ts,tsx}",
		"./src/**/*.{ts,tsx}",
	],
	prefix: "",
	theme: {
		container: {
			center: true,
			padding: '2rem',
			screens: {
				'2xl': '1400px'
			}
		},
		screens: {
			'xs': '475px',
			'sm': '640px',
			'md': '768px',
			'lg': '1024px',
			'xl': '1280px',
			'2xl': '1400px',
		},
		extend: {
			colors: {
				border: 'hsl(var(--border))',
				input: 'hsl(var(--input))',
				ring: 'hsl(var(--ring))',
				background: 'hsl(var(--background))',
				foreground: 'hsl(var(--foreground))',
				primary: {
					DEFAULT: 'hsl(var(--primary))',
					foreground: 'hsl(var(--primary-foreground))'
				},
				secondary: {
					DEFAULT: 'hsl(var(--secondary))',
					foreground: 'hsl(var(--secondary-foreground))'
				},
				destructive: {
					DEFAULT: 'hsl(var(--destructive))',
					foreground: 'hsl(var(--destructive-foreground))'
				},
				success: {
					DEFAULT: 'hsl(var(--success))',
					foreground: 'hsl(var(--success-foreground))'
				},
				warning: {
					DEFAULT: 'hsl(var(--warning))',
					foreground: 'hsl(var(--warning-foreground))'
				},
				muted: {
					DEFAULT: 'hsl(var(--muted))',
					foreground: 'hsl(var(--muted-foreground))'
				},
				accent: {
					DEFAULT: 'hsl(var(--accent))',
					foreground: 'hsl(var(--accent-foreground))'
				},
				popover: {
					DEFAULT: 'hsl(var(--popover))',
					foreground: 'hsl(var(--popover-foreground))'
				},
				card: {
					DEFAULT: 'hsl(var(--card))',
					foreground: 'hsl(var(--card-foreground))'
				},
				// Sparti business colors
				'lead-orange': 'hsl(var(--lead-orange))',
				'contact-blue': 'hsl(var(--contact-blue))',
				'opportunity-green': 'hsl(var(--opportunity-green))',
				sidebar: {
					DEFAULT: 'hsl(var(--sidebar-background))',
					foreground: 'hsl(var(--sidebar-foreground))',
					primary: 'hsl(var(--sidebar-primary))',
					'primary-foreground': 'hsl(var(--sidebar-primary-foreground))',
					accent: 'hsl(var(--sidebar-accent))',
					'accent-foreground': 'hsl(var(--sidebar-accent-foreground))',
					border: 'hsl(var(--sidebar-border))',
					ring: 'hsl(var(--sidebar-ring))'
				}
			},
			borderRadius: {
				lg: 'var(--radius)',
				md: 'calc(var(--radius) - 2px)',
				sm: 'calc(var(--radius) - 4px)'
			},
			fontFamily: {
				'orbitron': ['Orbitron', 'monospace'],
				'montserrat': ['Montserrat', 'sans-serif'],
			},
			keyframes: {
				'accordion-down': {
					from: { height: '0' },
					to: { height: 'var(--radix-accordion-content-height)' }
				},
				'accordion-up': {
					from: { height: 'var(--radix-accordion-content-height)' },
					to: { height: '0' }
				},
				'float': {
					'0%, 100%': { transform: 'translateY(0px)' },
					'50%': { transform: 'translateY(-10px)' }
				},
				'pulse-neon': {
					'0%': { boxShadow: 'var(--glow-primary)' },
					'100%': { boxShadow: 'var(--glow-primary), 0 0 30px hsl(267 84% 65% / 0.8)' }
				},
				'bounce-in': {
					'0%': { transform: 'scale(0.3) rotate(-5deg)', opacity: '0' },
					'50%': { transform: 'scale(1.05) rotate(2deg)' },
					'70%': { transform: 'scale(0.9) rotate(-1deg)' },
					'100%': { transform: 'scale(1) rotate(0deg)', opacity: '1' }
				},
				'radar-pulse': {
					'0%': { transform: 'scale(1)', opacity: '1' },
					'100%': { transform: 'scale(2.5)', opacity: '0' }
				},
				'paw-walk': {
					'0%': { transform: 'translateX(-100px) scale(0)', opacity: '0' },
					'50%': { transform: 'translateX(50vw) scale(1)', opacity: '0.6' },
					'100%': { transform: 'translateX(calc(100vw + 100px)) scale(0)', opacity: '0' }
				},
				'radar-sweep': {
					'0%': { transform: 'translate(-50%, -100%) rotate(0deg)' },
					'100%': { transform: 'translate(-50%, -100%) rotate(360deg)' }
				},
				'radar-pulse-delayed': {
					'0%, 100%': { transform: 'scale(1)', opacity: '0.4' },
					'50%': { transform: 'scale(1.08)', opacity: '0.7' }
				},
				'radar-pulse-delayed-2': {
					'0%, 100%': { transform: 'scale(1)', opacity: '0.3' },
					'50%': { transform: 'scale(1.12)', opacity: '0.6' }
				}
			},
			animation: {
				'accordion-down': 'accordion-down 0.2s ease-out',
				'accordion-up': 'accordion-up 0.2s ease-out',
				'float': 'float 3s ease-in-out infinite',
				'pulse-neon': 'pulse-neon 2s ease-in-out infinite alternate',
				'bounce-in': 'bounce-in 0.6s cubic-bezier(0.68, -0.55, 0.265, 1.55)',
				'radar-pulse': 'radar-pulse 2s ease-out infinite',
				'radar-pulse-delayed': 'radar-pulse-delayed 2s ease-out infinite 0.3s',
				'radar-pulse-delayed-2': 'radar-pulse-delayed-2 2s ease-out infinite 0.6s',
				'radar-sweep': 'radar-sweep 3s linear infinite',
				'paw-walk': 'paw-walk 8s linear infinite'
			},
			backgroundImage: {
				'gradient-hero': 'var(--gradient-hero)',
				'gradient-neon': 'var(--gradient-neon)',
				'gradient-glass': 'var(--gradient-glass)'
			},
			spacing: {
				'touch': '44px', // Minimum touch target size
				'safe-top': 'env(safe-area-inset-top)',
				'safe-bottom': 'env(safe-area-inset-bottom)',
				'safe-left': 'env(safe-area-inset-left)',
				'safe-right': 'env(safe-area-inset-right)',
			},
			minHeight: {
				'touch': '44px',
				'screen-safe': 'calc(100vh - env(safe-area-inset-top) - env(safe-area-inset-bottom))',
			},
			minWidth: {
				'touch': '44px',
			}
		}
	},
	plugins: [require("tailwindcss-animate"), require("tailwind-scrollbar")],
} satisfies Config;
