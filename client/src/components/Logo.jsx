import React from 'react';

export default function Logo({ size = 36, color = 'var(--accent-gold)' }) {
  return (
    <svg 
      width={size} 
      height={size} 
      viewBox="0 0 40 40" 
      fill="none" 
      xmlns="http://www.w3.org/2000/svg"
      style={{ filter: 'drop-shadow(0 0 10px rgba(255, 215, 0, 0.5))' }}
    >
      {/* Background shape */}
      <rect x="4" y="4" width="32" height="32" rx="8" fill="var(--bg-elevated)" stroke={color} strokeWidth="1.5" />
      
      {/* Abstract Newspaper / Data lines */}
      <path d="M12 12H28" stroke={color} strokeWidth="2" strokeLinecap="round" />
      <path d="M12 18H28" stroke={color} strokeWidth="2" strokeLinecap="round" />
      <path d="M12 24H20" stroke={color} strokeWidth="2" strokeLinecap="round" />
      
      {/* AI Node / Neural Point */}
      <circle cx="28" cy="24" r="3" fill="var(--accent-copper)" stroke={color} strokeWidth="1" />
      <path d="M28 21V18" stroke={color} strokeWidth="1.5" strokeLinecap="round" />
      <path d="M25 24H28" stroke={color} strokeWidth="1.5" strokeLinecap="round" />
      
      {/* Subtle Glowing Pulse */}
      <circle cx="28" cy="24" r="1.5" fill="#FFF">
        <animate 
          attributeName="opacity" 
          values="0.2;1;0.2" 
          dur="3s" 
          repeatCount="indefinite" 
        />
      </circle>
    </svg>
  );
}
