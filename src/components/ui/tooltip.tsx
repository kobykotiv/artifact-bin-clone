import React, { ReactNode, useState } from 'react';

export function TooltipProvider({ children }: { children: ReactNode }) {
  return <>{children}</>;
}

export function Tooltip({ children }: { children: ReactNode }) {
  return <>{children}</>;
}

export function TooltipTrigger({ children }: { children: ReactNode }) {
  return <>{children}</>;
}

export function TooltipContent({ children }: { children: ReactNode }) {
  const [visible, setVisible] = useState(false);
  return (
    <span
      onMouseEnter={() => setVisible(true)}
      onMouseLeave={() => setVisible(false)}
      style={{ position: 'relative', display: 'inline-block' }}
    >
      {visible && (
        <span style={{
          position: 'absolute',
          bottom: '100%',
          left: '50%',
          transform: 'translateX(-50%)',
          marginBottom: 8,
          background: 'rgba(0,0,0,0.85)',
          color: '#fff',
          padding: '4px 10px',
          borderRadius: 4,
          fontSize: 12,
          whiteSpace: 'nowrap',
          zIndex: 9999,
        }}>
          {children}
        </span>
      )}
    </span>
  );
}
