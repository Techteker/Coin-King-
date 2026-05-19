import React from 'react';

export const CustomGoldCoin: React.FC<{ className?: string }> = ({ className = "h-5 w-5" }) => {
  return (
    <svg 
      viewBox="0 0 200 200" 
      className={className} 
      referrerPolicy="no-referrer"
    >
      <defs>
        {/* Outer radial gradient for 3D metallic feel */}
        <radialGradient id="gold-radial" cx="50%" cy="50%" r="50%" fx="30%" fy="30%">
          <stop offset="0%" stopColor="#FFE57F" />
          <stop offset="35%" stopColor="#FFC107" />
          <stop offset="70%" stopColor="#FF8F00" />
          <stop offset="100%" stopColor="#9E7D0A" />
        </radialGradient>
        {/* Inner face gradient */}
        <linearGradient id="gold-linear" x1="0%" y1="0%" x2="100%" y2="100%">
          <stop offset="0%" stopColor="#FFF9C4" />
          <stop offset="50%" stopColor="#FBC02D" />
          <stop offset="100%" stopColor="#F57F17" />
        </linearGradient>
        {/* Laurel wreath leaf definition */}
        <path id="leaf" d="M0,0 Q-8,-15 0,-30 Q8,-15 0,0" fill="#E65100" opacity="0.85" />
      </defs>

      {/* Outer gold rim with 3D shadow */}
      <circle cx="100" cy="100" r="95" fill="url(#gold-radial)" filter="drop-shadow(0px 3px 4px rgba(0,0,0,0.2))" />
      
      {/* Inner sunken circle */}
      <circle cx="100" cy="100" r="82" fill="url(#gold-linear)" stroke="#FFA000" strokeWidth="2.5" />
      
      {/* Inner decorative ridge */}
      <circle cx="100" cy="100" r="68" fill="none" stroke="#E65100" strokeWidth="2" strokeDasharray="4 2.5" opacity="0.7" />

      {/* Wreaths (left and right) */}
      <g transform="translate(48, 100) scale(0.65)" opacity="0.9">
        {/* Left wreath */}
        <path d="M 10 70 A 50 50 0 0 1 10 -70" fill="none" stroke="#E65100" strokeWidth="3" strokeLinecap="round" />
        <use href="#leaf" x="14" y="-55" transform="rotate(-30 14 -55)" />
        <use href="#leaf" x="0" y="-35" transform="rotate(-15 0 -35)" />
        <use href="#leaf" x="-8" y="-10" transform="rotate(0 -8 -10)" />
        <use href="#leaf" x="-6" y="15" transform="rotate(15 -6 15)" />
        <use href="#leaf" x="6" y="40" transform="rotate(35 6 40)" />
        <use href="#leaf" x="24" y="60" transform="rotate(50 24 60)" />
      </g>
      <g transform="translate(152, 100) scale(0.65) scale(-1, 1)" opacity="0.9">
        {/* Right wreath */}
        <path d="M 10 70 A 50 50 0 0 1 10 -70" fill="none" stroke="#E65100" strokeWidth="3" strokeLinecap="round" />
        <use href="#leaf" x="14" y="-55" transform="rotate(-30 14 -55)" />
        <use href="#leaf" x="0" y="-35" transform="rotate(-15 0 -35)" />
        <use href="#leaf" x="-8" y="-10" transform="rotate(0 -8 -10)" />
        <use href="#leaf" x="-6" y="15" transform="rotate(15 -6 15)" />
        <use href="#leaf" x="6" y="40" transform="rotate(35 6 40)" />
        <use href="#leaf" x="24" y="60" transform="rotate(50 24 60)" />
      </g>

      {/* SIKKA - replaced by COIN or COIN KING as requested */}
      <text 
        x="100" 
        y="62" 
        textAnchor="middle" 
        fill="#7E5109" 
        fontSize="14" 
        fontWeight="black" 
        fontFamily='"Inter", system-ui, sans-serif'
        letterSpacing="1.5"
      >
        COIN
      </text>

      {/* Central Big S */}
      <text 
        x="100" 
        y="126" 
        textAnchor="middle" 
        fill="#1A1A1A" 
        fontSize="76" 
        fontWeight="900" 
        fontFamily='"Inter", system-ui, sans-serif'
        filter="drop-shadow(0px 2px 2px rgba(255,255,255,0.6))"
      >
        S
      </text>

      {/* KING at the bottom */}
      <text 
        x="100" 
        y="156" 
        textAnchor="middle" 
        fill="#7E5109" 
        fontSize="14" 
        fontWeight="black" 
        fontFamily='"Inter", system-ui, sans-serif'
        letterSpacing="2"
      >
        KING
      </text>
    </svg>
  );
};
