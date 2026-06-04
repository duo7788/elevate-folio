import { useEffect, useRef } from 'react';

export default function ParticleBackground({ theme }: { theme: 'light' | 'dark' }) {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const themeRef = useRef(theme);

  useEffect(() => {
    themeRef.current = theme;
  }, [theme]);

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;

    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    let width = canvas.width = window.innerWidth;
    let height = canvas.height = window.innerHeight;

    let targetMouse = { x: width / 2, y: height / 2 };
    let mouseVelocity = { x: 0, y: 0 };

    const handleMouseMove = (e: MouseEvent) => {
      mouseVelocity.x += e.clientX - targetMouse.x;
      mouseVelocity.y += e.clientY - targetMouse.y;
      targetMouse.x = e.clientX;
      targetMouse.y = e.clientY;
    };

    window.addEventListener('mousemove', handleMouseMove);

    const handleResize = () => {
      width = canvas.width = window.innerWidth;
      height = canvas.height = window.innerHeight;
    };

    window.addEventListener('resize', handleResize);

    class Particle {
      x: number;
      y: number;
      baseX: number;
      baseY: number;
      size: number;
      speed: number;
      angle: number;
      distance: number;
      flowX: number;
      flowY: number;

      constructor() {
        this.baseX = Math.random() * width;
        this.baseY = Math.random() * height;
        this.x = this.baseX;
        this.y = this.baseY;
        this.size = Math.random() * 0.75 + 0.3;
        this.speed = Math.random() * 0.5 + 0.1;
        this.angle = Math.random() * Math.PI * 2;
        this.distance = Math.random() * 100;
        this.flowX = 0;
        this.flowY = 0;
      }

      update(mouseTargetX: number, mouseTargetY: number, velocityX: number, velocityY: number) {
        // Slow constant drift
        this.angle += this.speed * 0.01;
        const driftX = Math.cos(this.angle) * this.distance * 0.1;
        const driftY = Math.sin(this.angle) * this.distance * 0.1;

        const baseX = this.baseX + driftX;
        const baseY = this.baseY + driftY;
        const dxToMouse = mouseTargetX - baseX;
        const dyToMouse = mouseTargetY - baseY;
        const distToMouse = Math.sqrt(dxToMouse * dxToMouse + dyToMouse * dyToMouse);

        const interactionRadius = 360;
        if (distToMouse < interactionRadius) {
          const flowStrength = Math.pow((interactionRadius - distToMouse) / interactionRadius, 2.2);
          this.flowX += velocityX * flowStrength * 0.035;
          this.flowY += velocityY * flowStrength * 0.035;
        }

        this.flowX *= 0.9;
        this.flowY *= 0.9;

        this.x = baseX + this.flowX;
        this.y = baseY + this.flowY;
        
        // Wrap around gracefully off-screen
        let wrapped = false;
        if (this.baseX < -150) { this.baseX += width + 300; wrapped = true; }
        if (this.baseX > width + 150) { this.baseX -= width + 300; wrapped = true; }
        if (this.baseY < -150) { this.baseY += height + 300; wrapped = true; }
        if (this.baseY > height + 150) { this.baseY -= height + 300; wrapped = true; }
        
        if (wrapped) {
          this.flowX = 0;
          this.flowY = 0;
        }
      }

      draw() {
        if (!ctx) return;
        const glowSize = this.size * 2.6;
        const gradient = ctx.createRadialGradient(this.x, this.y, 0, this.x, this.y, glowSize);
        if (themeRef.current === 'light') {
          gradient.addColorStop(0, 'rgba(0, 100, 255, 0.22)');
          gradient.addColorStop(1, 'rgba(0, 100, 255, 0)');
        } else {
          gradient.addColorStop(0, 'rgba(100, 155, 255, 0.22)');
          gradient.addColorStop(1, 'rgba(70, 130, 255, 0)');
        }
        ctx.fillStyle = gradient;
        ctx.beginPath();
        ctx.arc(this.x, this.y, glowSize, 0, Math.PI * 2);
        ctx.fill();

        ctx.fillStyle = themeRef.current === 'light' ? 'rgba(0, 100, 255, 0.24)' : 'rgba(145, 185, 255, 0.42)';
        ctx.beginPath();
        ctx.arc(this.x, this.y, this.size, 0, Math.PI * 2);
        ctx.fill();
      }
    }

    const particles: Particle[] = [];
    const particleCount = calculateParticleCount() * 2.4;

    function calculateParticleCount() {
      // Adjust density based on screen size
      return Math.floor((width * height) / 7000);
    }

    for (let i = 0; i < particleCount; i++) {
      particles.push(new Particle());
    }

    let animationFrameId: number;

    const animate = () => {
      if (!ctx) return;
      ctx.clearRect(0, 0, width, height);

      for (const particle of particles) {
        particle.update(targetMouse.x, targetMouse.y, mouseVelocity.x, mouseVelocity.y);
        particle.draw();
      }

      mouseVelocity.x *= 0.78;
      mouseVelocity.y *= 0.78;

      animationFrameId = requestAnimationFrame(animate);
    };

    animate();

    return () => {
      window.removeEventListener('mousemove', handleMouseMove);
      window.removeEventListener('resize', handleResize);
      cancelAnimationFrame(animationFrameId);
    };
  }, []);

  return (
    <canvas
      ref={canvasRef}
      className="fixed inset-0 pointer-events-none z-0"
      style={{ opacity: 0.68 }}
    />
  );
}
