import { Moon, Sun } from 'lucide-react';

export default function ThemeToggle({ theme, onChange }: { theme: 'light' | 'dark', onChange: (t: 'light' | 'dark') => void }) {
  return (
    <button
      onClick={() => onChange(theme === 'light' ? 'dark' : 'light')}
      className="p-3 rounded-full bg-black/5 dark:bg-white/10 backdrop-blur-md border border-black/10 dark:border-white/10 text-neutral-600 dark:text-neutral-300 hover:bg-black/10 dark:hover:bg-white/20 transition-all z-50 fixed top-6 right-6 cursor-pointer"
      aria-label="Toggle Theme"
    >
      {theme === 'light' ? <Moon className="w-5 h-5" /> : <Sun className="w-5 h-5" />}
    </button>
  );
}
