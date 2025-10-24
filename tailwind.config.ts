import type { Config } from 'tailwindcss'

const config: Config = {
  content: [
    './app/**/*.{js,ts,jsx,tsx,mdx}',
    './pages/**/*.{js,ts,jsx,tsx,mdx}',
    './components/**/*.{js,ts,jsx,tsx,mdx}',
  ],
  theme: {
    extend: {
      colors: {
        approval: {
          pending: '#C4C4C4',
          approved: '#4CAF50',
          rejected: '#F44336',
          completed: '#2196F3',
        },
      },
    },
  },
  plugins: [],
}
export default config
