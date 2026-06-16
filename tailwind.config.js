/** @type {import('tailwindcss').Config} */

export default {
  darkMode: "class",
  content: ["./index.html", "./src/**/*.{js,ts,jsx,tsx}"],
  theme: {
    container: {
      center: true,
    },
    extend: {
      colors: {
        industrial: {
          50: '#eff6ff',
          100: '#dbeafe',
          500: '#1E40AF',
          600: '#1e3a8a',
          700: '#1e3a8a',
        }
      },
      fontFamily: {
        sans: ['Noto Sans SC', 'system-ui', 'sans-serif'],
        mono: ['JetBrains Mono', 'ui-monospace', 'monospace'],
      },
      animation: {
        'pulse-slow': 'pulse 3s cubic-bezier(0.4, 0, 0.6, 1) infinite',
      },
      boxShadow: {
        'card': '0 1px 3px 0 rgba(0, 0, 0, 0.05), 0 1px 2px 0 rgba(0, 0, 0, 0.03)',
        'card-hover': '0 10px 15px -3px rgba(0, 0, 0, 0.05), 0 4px 6px -2px rgba(0, 0, 0, 0.03)',
      }
    },
  },
  plugins: [],
  safelist: [
    'text-blue-500', 'text-blue-600', 'bg-blue-50', 'bg-blue-100', 'bg-blue-500', 'bg-blue-600', 'text-blue-400', 'ring-blue-500', 'border-blue-200',
    'text-emerald-500', 'text-emerald-600', 'bg-emerald-50', 'bg-emerald-100', 'bg-emerald-500', 'bg-emerald-600', 'text-emerald-400', 'ring-emerald-500', 'border-emerald-200',
    'text-amber-500', 'text-amber-600', 'bg-amber-50', 'bg-amber-100', 'bg-amber-500', 'bg-amber-600', 'text-amber-400', 'ring-amber-500', 'border-amber-200',
    'text-orange-500', 'text-orange-600', 'bg-orange-50', 'bg-orange-100', 'bg-orange-500', 'bg-orange-600', 'text-orange-400', 'ring-orange-500', 'border-orange-200',
    'text-red-500', 'text-red-600', 'bg-red-50', 'bg-red-100', 'bg-red-500', 'bg-red-600', 'text-red-400', 'ring-red-500', 'border-red-200',
    'text-cyan-500', 'text-cyan-600', 'bg-cyan-50', 'bg-cyan-100', 'bg-cyan-500', 'bg-cyan-600', 'text-cyan-400', 'ring-cyan-500', 'border-cyan-200',
    'text-slate-500', 'text-slate-600', 'bg-slate-50', 'bg-slate-100', 'bg-slate-500', 'bg-slate-600', 'text-slate-400', 'ring-slate-500', 'border-slate-200',
    'text-indigo-500', 'text-indigo-600', 'bg-indigo-50', 'bg-indigo-100', 'bg-indigo-500', 'bg-indigo-600', 'text-indigo-400', 'ring-indigo-500', 'border-indigo-200',
    'text-purple-500', 'text-purple-600', 'bg-purple-50', 'bg-purple-100', 'bg-purple-500', 'bg-purple-600', 'text-purple-400', 'ring-purple-500', 'border-purple-200',
  ],
};
