import React from 'react';

interface LoginIllustrationProps {
  width?: number;
  height?: number;
  className?: string;
}

const LoginIllustration: React.FC<LoginIllustrationProps> = ({ 
  width = 500, 
  height = 400, 
  className = '' 
}) => {
  return (
    <svg 
      width={width} 
      height={height} 
      viewBox="0 0 500 400" 
      fill="none" 
      xmlns="http://www.w3.org/2000/svg"
      className={className}
    >
      <rect width="500" height="400" rx="8" fill="white" fillOpacity="0.1"/>
      <circle cx="250" cy="150" r="80" fill="white" fillOpacity="0.2"/>
      <path d="M170 250C170 227.909 187.909 210 210 210H290C312.091 210 330 227.909 330 250V330C330 352.091 312.091 370 290 370H210C187.909 370 170 352.091 170 330V250Z" fill="white" fillOpacity="0.2"/>
      <path d="M150 200L350 200" stroke="white" strokeOpacity="0.5" strokeWidth="4" strokeLinecap="round" strokeDasharray="8 12"/>
      <path d="M200 120V160" stroke="white" strokeOpacity="0.5" strokeWidth="4" strokeLinecap="round"/>
      <path d="M300 120V160" stroke="white" strokeOpacity="0.5" strokeWidth="4" strokeLinecap="round"/>
      <path d="M180 180C180 157.909 197.909 140 220 140H280C302.091 140 320 157.909 320 180V180C320 202.091 302.091 220 280 220H220C197.909 220 180 202.091 180 180V180Z" fill="white" fillOpacity="0.1"/>
      <path d="M220 280C220 269.954 228.954 262 240 262H260C270.046 262 278 269.954 278 280V300C278 310.046 270.046 317 260 317H240C228.954 317 220 310.046 220 300V280Z" fill="white" fillOpacity="0.3"/>
      <path d="M200 340H300" stroke="white" strokeOpacity="0.5" strokeWidth="4" strokeLinecap="round"/>
      <path d="M150 190C150 162.386 172.386 140 200 140H300C327.614 140 350 162.386 350 190V190C350 217.614 327.614 240 300 240H200C172.386 240 150 217.614 150 190V190Z" stroke="white" strokeOpacity="0.3" strokeWidth="2"/>
      
      {/* Sleep wave patterns */}
      <path d="M150 80C150 80 170 60 190 80C210 100 230 60 250 80C270 100 290 60 310 80C330 100 350 80 350 80" stroke="white" strokeOpacity="0.6" strokeWidth="3" strokeLinecap="round"/>
      
      {/* Pulse icon */}
      <path d="M240 170H260" stroke="white" strokeWidth="3" strokeLinecap="round"/>
      <path d="M220 180H280" stroke="white" strokeWidth="3" strokeLinecap="round"/>
      <path d="M230 190H270" stroke="white" strokeWidth="3" strokeLinecap="round"/>
      <path d="M245 200H255" stroke="white" strokeWidth="3" strokeLinecap="round"/>
    </svg>
  );
};

export default LoginIllustration;