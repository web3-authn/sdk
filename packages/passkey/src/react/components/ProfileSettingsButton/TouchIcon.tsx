

import React from 'react';
import './TouchIcon.css';

interface TouchIconProps {
  className?: string;
  strokeWidth?: number;
  width?: number;
  height?: number;
  style?: React.CSSProperties;
}

const TouchIcon: React.FC<TouchIconProps> = ({
  className,
  strokeWidth,
  width,
  height,
  style,
}) => (
  <svg
    className={`${className || ''}`}
    style={{ ...style }}
    width={width || 24}
    height={height || 24}
    viewBox="0 0 24 24"
    fill="none"
    xmlns="http://www.w3.org/2000/svg"
  >
    <path
      d="M6.40519 19.0481C6.58912 18.6051 6.75832 18.1545 6.91219 17.6969M14.3433 20.6926C14.6095 19.9418 14.8456 19.1768 15.0502 18.399C15.2359 17.6934 15.3956 16.9772 15.5283 16.2516M19.4477 17.0583C19.8121 15.0944 20.0026 13.0694 20.0026 11C20.0026 6.58172 16.4209 3 12.0026 3C10.7472 3 9.55932 3.28918 8.50195 3.80456M3.52344 15.0245C3.83663 13.7343 4.00262 12.3865 4.00262 11C4.00262 9.25969 4.55832 7.64917 5.50195 6.33621M12.003 11C12.003 13.7604 11.5557 16.4163 10.7295 18.8992C10.5169 19.5381 10.2792 20.1655 10.0176 20.7803M7.71227 14.5C7.90323 13.3618 8.00262 12.1925 8.00262 11C8.00262 8.79086 9.79348 7 12.0026 7C14.2118 7 16.0026 8.79086 16.0026 11C16.0026 11.6166 15.9834 12.2287 15.9455 12.8357"
      stroke="currentColor"
      strokeWidth={strokeWidth || 1}
      strokeLinecap="round"
      strokeLinejoin="round"
      vectorEffect="non-scaling-stroke"
      pathLength={1}
    />
  </svg>
);

export default TouchIcon;
