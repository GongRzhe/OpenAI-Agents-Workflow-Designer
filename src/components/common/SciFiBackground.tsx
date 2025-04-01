// src/components/common/SciFiBackground.tsx
import React from 'react';
import { useCallback } from 'react';
import bgImage from '../../assets/bg.jpg';

interface SciFiBackgroundProps {
  opacity?: number;
}

const SciFiBackground: React.FC<SciFiBackgroundProps> = ({ opacity = 0.3 }) => {
  return (
    <div
      style={{
        position: 'absolute',
        top: 0,
        left: 0,
        width: '100%',
        height: '100%',
        backgroundImage: `url(${bgImage})`,
        backgroundSize: 'cover',
        backgroundPosition: 'center',
        opacity: opacity,
        pointerEvents: 'none',
        zIndex: -1,
      }}
    />
  );
};

export default SciFiBackground;