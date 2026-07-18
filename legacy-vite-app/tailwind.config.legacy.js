/** @type {import('tailwindcss').Config} */
export default {
  content: ['./index.html', './src/**/*.{js,ts,jsx,tsx}'],
  theme: {
    extend: {
      colors: {
        primary: {
          50: '#eef5ff', 100: '#d9e8ff', 200: '#bcd7ff', 300: '#8ebdff',
          400: '#5996ff', 500: '#356fff', 600: '#1f4ff5', 700: '#173ce0',
          800: '#1831b4', 900: '#1a2f8e', 950: '#141d57',
        },
        accent: {
          50: '#fff8ed', 100: '#ffefd4', 200: '#ffdba8', 300: '#ffc070',
          400: '#ff9a37', 500: '#ff7d10', 600: '#f06006', 700: '#c74807',
          800: '#9d380e', 900: '#7e3010',
        },
        neutral: {
          50: '#f8fafc', 100: '#f1f5f9', 200: '#e2e8f0', 300: '#cbd5e1',
          400: '#94a3b8', 500: '#64748b', 600: '#475569', 700: '#334155',
          800: '#1e293b', 900: '#0f172a', 950: '#020617',
        },
        success: { 500: '#10b981', 600: '#059669', 50: '#ecfdf5' },
        warning: { 500: '#f59e0b', 600: '#d97706', 50: '#fffbeb' },
        error:   { 500: '#ef4444', 600: '#dc2626', 50: '#fef2f2' },
      },
      fontFamily: {
        sans: ['Inter', 'system-ui', 'sans-serif'],
        display: ['"Plus Jakarta Sans"', 'Inter', 'system-ui', 'sans-serif'],
      },
      boxShadow: {
        card: '0 1px 3px rgba(15,23,42,0.06), 0 1px 2px rgba(15,23,42,0.04)',
        soft: '0 4px 16px rgba(15,23,42,0.06)',
        pop: '0 10px 30px rgba(15,23,42,0.10)',
      },
    },
  },
  plugins: [],
};
