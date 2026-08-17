import React from 'react';

interface ZoZoLogoProps {
  className?: string;
  height?: number | string;
}

export const ZoZoLogo: React.FC<ZoZoLogoProps> = ({ className = '', height = 32 }) => {
  return (
    <svg
      viewBox="0 0 235 60"
      height={height}
      className={className}
      fill="none"
      xmlns="http://www.w3.org/2000/svg"
      style={{ display: 'inline-block', verticalAlign: 'middle' }}
    >
      {/* First Z */}
      <path
        d="M10 18H42L18 48H50"
        stroke="white"
        strokeWidth="8.5"
        strokeLinecap="butt"
        strokeLinejoin="miter"
      />
      
      {/* First o (Red rounded rect) */}
      <rect
        x="56"
        y="18"
        width="30"
        height="30"
        rx="9.5"
        fill="#ef4444"
        stroke="white"
        strokeWidth="6.5"
      />
      
      {/* Second Z */}
      <path
        d="M94 18H126L102 48H134"
        stroke="white"
        strokeWidth="8.5"
        strokeLinecap="butt"
        strokeLinejoin="miter"
      />
      
      {/* Second o (Blue rounded rect) */}
      <rect
        x="140"
        y="18"
        width="30"
        height="30"
        rx="9.5"
        fill="#0055ff"
        stroke="white"
        strokeWidth="6.5"
      />
      
      {/* A (caret / inverted V) */}
      <path
        d="M178 48L194 18L210 48"
        stroke="white"
        strokeWidth="8.5"
        strokeLinecap="butt"
        strokeLinejoin="miter"
      />
      
      {/* i (vertical stem and gold dot) */}
      <path
        d="M221 31V48"
        stroke="white"
        strokeWidth="8.5"
        strokeLinecap="butt"
      />
      <circle
        cx="221"
        cy="18"
        r="5.5"
        fill="#ffcc00"
      />
    </svg>
  );
};
