import type { Config } from 'tailwindcss'

const config: Config = {
  content: [
    './pages/**/*.{js,ts,jsx,tsx,mdx}',
    './components/**/*.{js,ts,jsx,tsx,mdx}',
    './app/**/*.{js,ts,jsx,tsx,mdx}',
  ],
  theme: {
    extend: {
      colors: {
        storm: { DEFAULT: '#1a1a2e', 50: '#e8e8f0', 900: '#0d0d1a' },
        alert: { red: '#ef4444', amber: '#f59e0b', green: '#22c55e', blue: '#3b82f6' },
      },
    },
  },
  plugins: [],
}
export default config
