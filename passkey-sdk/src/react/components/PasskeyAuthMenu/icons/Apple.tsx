import React from 'react';

interface AppleIconProps {
  size?: number;
  className?: string;
  color?: string;
  strokeWidth?: number;
  style?: React.CSSProperties;
}

export const AppleIcon: React.FC<AppleIconProps> = ({
  size = 24,
  className = '',
  color = 'currentColor',
  strokeWidth = 2,
  style
}) => {
  return (
    <svg
      xmlns="http://www.w3.org/2000/svg"
      width={size}
      height={size}
      viewBox="0 0 24 24"
      fill="none"
      stroke={color}
      strokeWidth={strokeWidth}
      strokeLinecap="round"
      strokeLinejoin="round"
      className={className}
      style={style}
    >
      <path d="M12 6.528V3a1 1 0 0 1 1-1h0"/>
      <path d="M18.237 21A15 15 0 0 0 22 11a6 6 0 0 0-10-4.472A6 6 0 0 0 2 11a15.1 15.1 0 0 0 3.763 10 3 3 0 0 0 3.648.648 5.5 5.5 0 0 1 5.178 0A3 3 0 0 0 18.237 21"/>
    </svg>
  );
};

export default AppleIcon;