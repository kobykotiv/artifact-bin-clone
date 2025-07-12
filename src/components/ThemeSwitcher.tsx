import React, { useEffect, useState } from 'react';
import { Sun, Moon, Zap, Monitor, Eye, Palette, X } from 'lucide-react';

const THEMES = [
  { key: 'light', icon: <Sun />, label: 'Light', description: 'Classic light theme' },
  { key: 'dark', icon: <Moon />, label: 'Dark', description: 'Modern dark theme' },
  { key: 'solarized', icon: <Zap />, label: 'Solarized', description: 'Easy on the eyes' },
  { key: 'high-contrast', icon: <Eye />, label: 'High Contrast', description: 'Enhanced accessibility' },
  { key: 'system', icon: <Monitor />, label: 'System', description: 'Follow system preference' },
  { key: 'dracula', icon: <Palette />, label: 'Dracula', description: 'Dark theme with purple accents' },
];

interface ThemeSwitcherProps {
  open?: boolean;
  onClose?: () => void;
}

export function ThemeSwitcher({ open, onClose }: ThemeSwitcherProps = {}) {
  const [theme, setTheme] = useState(() => localStorage.getItem('theme') || 'light');

  useEffect(() => {
    document.documentElement.dataset.theme = theme;
    localStorage.setItem('theme', theme);
  }, [theme]);

  const nextTheme = () => {
    const idx = THEMES.findIndex(t => t.key === theme);
    setTheme(THEMES[(idx + 1) % THEMES.length].key);
  };

  const current = THEMES.find(t => t.key === theme);

  return (
    <button
      aria-label="Switch theme"
      onClick={nextTheme}
      style={{
        position: 'fixed',
        bottom: 24,
        right: 24,
        zIndex: 1000,
        borderRadius: '50%',
        width: 56,
        height: 56,
        background: 'var(--background, #fff)',
        color: 'var(--foreground, #222)',
        boxShadow: '0 4px 16px rgba(0,0,0,0.15)',
        border: '2px solid #222',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        fontSize: 24,
        cursor: 'pointer',
        transition: 'background 0.2s, color 0.2s',
      }}
      title={`Switch to ${THEMES[(THEMES.findIndex(t => t.key === theme) + 1) % THEMES.length].label} mode`}
    >
      {current?.icon}
    </button>
  );
}
