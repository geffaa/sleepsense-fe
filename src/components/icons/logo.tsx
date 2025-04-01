import React from 'react';

interface LogoProps {
  width?: number;
  height?: number;
  className?: string;
}

const Logo: React.FC<LogoProps> = ({ 
  width = 40, 
  height = 40, 
  className = '' 
}) => {
  return (
    <svg 
      width={width} 
      height={height} 
      viewBox="0 0 40 40" 
      fill="none" 
      xmlns="http://www.w3.org/2000/svg"
      className={className}
    >
      <rect width="40" height="40" rx="8" fill="#0066FF"/>
      <path d="M13 26.5C13 21.2533 17.2533 17 22.5 17H27V26.5C27 31.7467 22.7467 36 17.5 36H13V26.5Z" fill="white"/>
      <path d="M27 13.5C27 18.7467 22.7467 23 17.5 23H13V13.5C13 8.25329 17.2533 4 22.5 4H27V13.5Z" fill="white" fillOpacity="0.6"/>
    </svg>
  );
};

export default Logo;