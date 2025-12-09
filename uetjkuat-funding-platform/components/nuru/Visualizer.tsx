import React, { useEffect, useRef } from 'react';

interface VisualizerProps {
  isActive: boolean;
  isSpeaking: boolean;
}

interface Particle {
  angle: number;
  radius: number;
  size: number;
  speed: number;
  opacity: number;
  wobble: number;
}

interface Stardust {
  x: number;
  y: number;
  vx: number;
  vy: number;
  size: number;
  life: number;
  color: string;
}

const Visualizer: React.FC<VisualizerProps> = ({ isActive, isSpeaking }) => {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  
  // Refs for animation state to persist across renders without causing re-renders
  const particlesRef = useRef<Particle[]>([]);
  const stardustRef = useRef<Stardust[]>([]);

  useEffect(() => {
    // Initialize orbit particles once
    if (particlesRef.current.length === 0) {
      particlesRef.current = Array.from({ length: 60 }, () => ({
        angle: Math.random() * Math.PI * 2,
        radius: Math.random() * 200 + 100, // Distance from center
        size: Math.random() * 2,
        speed: Math.random() * 0.002 + 0.001,
        opacity: Math.random() * 0.4 + 0.1,
        wobble: Math.random() * 10
      }));
    }

    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    // Canvas sizing
    const resize = () => {
      canvas.width = canvas.clientWidth * window.devicePixelRatio;
      canvas.height = canvas.clientHeight * window.devicePixelRatio;
      ctx.scale(window.devicePixelRatio, window.devicePixelRatio);
    };
    resize();
    window.addEventListener('resize', resize);

    let animationId: number;
    let time = 0;

    const render = () => {
      // Clear with very slight fade for potential trails (though we want clean here)
      ctx.clearRect(0, 0, canvas.width, canvas.height);
      
      const width = canvas.width / window.devicePixelRatio;
      const height = canvas.height / window.devicePixelRatio;
      const centerX = width / 2;
      const centerY = height / 2;

      time += 0.01;

      if (isActive) {
        // Celestial Orb Logic
        
        // Dynamic breathing: deeply slow when listening, faster pulse when speaking
        const pulseSpeed = isSpeaking ? 8 : 2; 
        const pulseRange = isSpeaking ? 20 : 5;
        const baseRadius = isSpeaking ? 80 : 70;
        
        const r1 = baseRadius + Math.sin(time * pulseSpeed) * pulseRange;
        const r2 = (baseRadius + 20) + Math.sin(time * (pulseSpeed * 0.8) + 1) * pulseRange;
        
        // Colors: Shift from Cool Blue (Listening) to Warm Gold/White (Speaking)
        const outerColor = isSpeaking ? 'rgba(255, 220, 150, 0.08)' : 'rgba(100, 150, 255, 0.05)';
        const innerColorStart = isSpeaking ? 'rgba(255, 250, 240, 0.9)' : 'rgba(255, 255, 255, 0.8)';
        const innerColorEnd = isSpeaking ? 'rgba(255, 200, 100, 0.3)' : 'rgba(200, 220, 255, 0.3)';

        // Outer Aura (Faint)
        const auraGrad = ctx.createRadialGradient(centerX, centerY, r1, centerX, centerY, 300);
        auraGrad.addColorStop(0, 'rgba(255, 255, 255, 0.1)');
        auraGrad.addColorStop(0.5, outerColor);
        auraGrad.addColorStop(1, 'rgba(0,0,0,0)');
        
        ctx.fillStyle = auraGrad;
        ctx.beginPath();
        ctx.arc(centerX, centerY, 300, 0, Math.PI * 2);
        ctx.fill();

        // Inner Glow
        const innerGrad = ctx.createRadialGradient(centerX, centerY, 0, centerX, centerY, r2);
        innerGrad.addColorStop(0, innerColorStart);
        innerGrad.addColorStop(0.3, innerColorEnd);
        innerGrad.addColorStop(1, 'rgba(0,0,0,0)');
        
        ctx.fillStyle = innerGrad;
        ctx.beginPath();
        ctx.arc(centerX, centerY, r2, 0, Math.PI * 2);
        ctx.fill();

        // Core (Bright Heart)
        ctx.fillStyle = isSpeaking ? 'rgba(255, 255, 240, 1)' : 'rgba(255, 255, 255, 0.9)';
        ctx.shadowBlur = isSpeaking ? 60 : 40;
        ctx.shadowColor = isSpeaking ? '#ffd700' : 'white'; // Gold shadow when speaking
        ctx.beginPath();
        const coreRadius = isSpeaking ? 40 + Math.random() * 2 : 35 + Math.sin(time * 3);
        ctx.arc(centerX, centerY, coreRadius, 0, Math.PI * 2);
        ctx.fill();
        ctx.shadowBlur = 0; // Reset

        // --- STARDUST ENGINE ---
        // Emit particles when speaking
        if (isSpeaking) {
            // Spawn rate
            if (Math.random() > 0.3) {
                const angle = Math.random() * Math.PI * 2;
                const speed = Math.random() * 2 + 1;
                stardustRef.current.push({
                    x: centerX,
                    y: centerY,
                    vx: Math.cos(angle) * speed,
                    vy: Math.sin(angle) * speed,
                    size: Math.random() * 3,
                    life: 1.0,
                    color: Math.random() > 0.5 ? '255, 215, 0' : '255, 255, 255' // Gold or White
                });
            }
        }

        // Render Stardust
        for (let i = stardustRef.current.length - 1; i >= 0; i--) {
            const p = stardustRef.current[i];
            p.x += p.vx;
            p.y += p.vy;
            p.life -= 0.015; // Fade out speed
            p.size *= 0.98; // Shrink

            if (p.life <= 0) {
                stardustRef.current.splice(i, 1);
                continue;
            }

            ctx.beginPath();
            ctx.arc(p.x, p.y, p.size, 0, Math.PI * 2);
            ctx.fillStyle = `rgba(${p.color}, ${p.life})`;
            ctx.fill();
        }
      }

      // Draw Orbiting Particles
      particlesRef.current.forEach(p => {
        // Orbit motion
        p.angle += p.speed * (isSpeaking ? 2 : 1);
        
        const currentRadius = p.radius + Math.sin(time + p.wobble) * 10;
        const x = centerX + Math.cos(p.angle) * currentRadius;
        const y = centerY + Math.sin(p.angle) * currentRadius;

        // Opacity fluctuates gently
        const alpha = p.opacity + Math.sin(time * 2 + p.wobble) * 0.1;

        ctx.beginPath();
        ctx.arc(x, y, p.size, 0, Math.PI * 2);
        ctx.fillStyle = `rgba(255, 255, 255, ${Math.max(0, alpha)})`;
        ctx.fill();
      });

      animationId = requestAnimationFrame(render);
    };

    render();

    return () => {
      cancelAnimationFrame(animationId);
      window.removeEventListener('resize', resize);
    };
  }, [isActive, isSpeaking]);

  return (
    <div className="absolute inset-0 z-0 pointer-events-none">
      <canvas 
        ref={canvasRef} 
        className="w-full h-full"
      />
    </div>
  );
};

export default Visualizer;
