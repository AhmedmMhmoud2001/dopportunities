import type { ReactNode } from 'react';
import { useScrollAnimation } from '../hooks/useScrollAnimation';

interface AnimatedSectionProps {
  children: ReactNode;
  animationType?: 'fade-in-up' | 'fade-in-down' | 'fade-in-left' | 'fade-in-right' | 'scale-in' | 'slide-in-up' | 'zoom-in';
  delay?: number;
  className?: string;
}

function AnimatedSection({
  children,
  animationType = 'fade-in-up',
  delay = 0,
  className = '',
}: AnimatedSectionProps) {
  const { ref, isVisible } = useScrollAnimation<HTMLDivElement>({
    threshold: 0.1,
    rootMargin: '0px 0px -50px 0px',
    triggerOnce: true,
  });

  const animationClass = `animate-${animationType}`;
  const delayClass = delay > 0 ? `animate-delay-${Math.min(Math.floor(delay / 100) * 100, 500)}` : '';
  const combinedClass = `${animationClass} ${delayClass} ${className}`.trim();

  return (
    <div
      ref={ref}
      className={`${combinedClass} ${isVisible ? 'animated' : ''}`}
    >
      {children}
    </div>
  );
}

export default AnimatedSection;

