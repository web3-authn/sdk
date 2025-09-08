import React from 'react';

interface ChromeIconProps {
  size?: number;
  className?: string;
  color?: string;
}

export const ChromeIcon: React.FC<ChromeIconProps> = ({
  size = 24,
  className = '',
  color = 'currentColor'
}) => {
  return (
    <svg
      xmlns="http://www.w3.org/2000/svg"
      width={size}
      height={size}
      viewBox="0 0 24 24"
      fill="none"
      stroke={color}
      strokeWidth="2"
      strokeLinecap="round"
      strokeLinejoin="round"
      className={`lucide lucide-chromium-icon lucide-chromium ${className}`}
    >
      <path d="M10.88 21.94 15.46 14"/>
      <path d="M21.17 8H12"/>
      <path d="M3.95 6.06 8.54 14"/>
      <circle cx="12" cy="12" r="10"/>
      <circle cx="12" cy="12" r="4"/>
    </svg>
  );
};

export default ChromeIcon;