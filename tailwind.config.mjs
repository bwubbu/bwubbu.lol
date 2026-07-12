/** @type {import('tailwindcss').Config} */
export default {
  content: ['./src/**/*.{astro,html,js,jsx,ts,tsx,md,mdx}'],
  theme: {
    extend: {
      colors: {
        // Dark 8-bit palette — tweak these to taste
        void: '#0b0b12',       // page background (near-black, slight blue)
        panel: '#14141f',      // card / panel surface
        edge: '#2a2a3c',       // borders
        crt: '#e7e7ea',        // primary text (soft white, not pure)
        dim: '#8a8aa0',        // secondary text
        neon: '#39ff14',       // accent 1 — terminal green
        magenta: '#ff2e97',    // accent 2 — arcade pink
        cyan: '#22e0ff',       // accent 3 — CRT cyan
      },
      fontFamily: {
        pixel: ['"Press Start 2P"', 'monospace'],   // headings / labels
        mono: ['"IBM Plex Mono"', 'ui-monospace', 'monospace'], // body
      },
      keyframes: {
        blink: { '0%,49%': { opacity: '1' }, '50%,100%': { opacity: '0' } },
        scanline: { '0%': { transform: 'translateY(-100%)' }, '100%': { transform: 'translateY(100%)' } },
        glitch: {
          '0%,100%': { transform: 'translate(0)' },
          '20%': { transform: 'translate(-2px, 1px)' },
          '40%': { transform: 'translate(2px, -1px)' },
          '60%': { transform: 'translate(-1px, -1px)' },
          '80%': { transform: 'translate(1px, 1px)' },
        },
      },
      animation: {
        blink: 'blink 1s steps(1) infinite',
        scanline: 'scanline 6s linear infinite',
        glitch: 'glitch 0.3s steps(2) infinite',
      },
    },
  },
  plugins: [],
};
