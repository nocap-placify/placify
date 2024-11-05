export default {
  content: [
    './src/**/*.{js,jsx,ts,tsx}',
  ],
  theme: {
    extend: {
      colors: {
        'yellow-600/80': 'rgba(234, 179, 8, 0.8)', // Adjust transparency
        'orange-600/80': 'rgba(251, 146, 60, 0.8)',
        'green-600/80': 'rgba(34, 197, 94, 0.8)',
        'blue-600/80': 'rgba(37, 99, 235, 0.8)',
      },
      backdropBlur: {
        lg: '20px',
      },
    },
  },
  plugins: [],
};
