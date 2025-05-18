import React, { useState, useEffect } from 'react';
import ReactConfetti from 'react-confetti';

interface ConfettiProps {
  active?: boolean;
  duration?: number;
  colors?: string[];
}

export const Confetti: React.FC<ConfettiProps> = ({
  active = false,
  duration = 3000,
  colors = ['#FFCA28', '#0D6EFD', '#4CAF50', '#FF5722', '#9C27B0']
}) => {
  const [isActive, setIsActive] = useState(active);
  const [windowDimensions, setWindowDimensions] = useState({
    width: typeof window !== 'undefined' ? window.innerWidth : 0,
    height: typeof window !== 'undefined' ? window.innerHeight : 0
  });

  useEffect(() => {
    setIsActive(active);

    if (active) {
      // Automatically stop confetti after the specified duration
      const timer = setTimeout(() => {
        setIsActive(false);
      }, duration);

      return () => clearTimeout(timer);
    }
  }, [active, duration]);

  useEffect(() => {
    // Update dimensions on window resize
    const handleResize = () => {
      setWindowDimensions({
        width: window.innerWidth,
        height: window.innerHeight
      });
    };

    window.addEventListener('resize', handleResize);
    return () => window.removeEventListener('resize', handleResize);
  }, []);

  if (!isActive) return null;

  return (
    <ReactConfetti
      width={windowDimensions.width}
      height={windowDimensions.height}
      recycle={false}
      numberOfPieces={300}
      gravity={0.15}
      colors={colors}
      tweenDuration={duration * 0.5}
      initialVelocityX={4}
      initialVelocityY={10}
    />
  );
};

export default Confetti;