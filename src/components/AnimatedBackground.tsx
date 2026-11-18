import React, { useEffect, useRef } from 'react';

interface AnimatedBackgroundProps {
  flipped?: boolean;
  variant?: 'moon-and-stars' | 'stars';
  className?: string;
}

interface Star {
  x: number;
  y: number;
  radius: number;
  baseAlpha: number;
  twinkleSpeed: number;
  twinkleOffset: number;
  driftX: number;
  driftY: number;
  isSparkle: boolean;
  tint: string;
}

interface ShootingStar {
  x: number;
  y: number;
  vx: number;
  vy: number;
  length: number;
  life: number;
  maxLife: number;
}

export const AnimatedBackground: React.FC<AnimatedBackgroundProps> = ({
  flipped = false,
  variant = 'moon-and-stars',
  className = '',
}) => {
  const canvasRef = useRef<HTMLCanvasElement>(null);

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    let animationFrameId = 0;
    let width = 0;
    let height = 0;
    let dpr = 1;

    const showMoon = variant === 'moon-and-stars';

    // Pre-generate procedural lunar craters (normalized -1..1 coordinates inside moon disc)
    const craters = [
      { cx: -0.28, cy: -0.22, r: 0.18, alpha: 0.11 },
      { cx: 0.22, cy: -0.35, r: 0.12, alpha: 0.09 },
      { cx: 0.34, cy: 0.12, r: 0.22, alpha: 0.12 },
      { cx: -0.15, cy: 0.32, r: 0.15, alpha: 0.1 },
      { cx: -0.45, cy: 0.08, r: 0.1, alpha: 0.08 },
      { cx: 0.05, cy: -0.05, r: 0.09, alpha: 0.07 },
      { cx: 0.18, cy: 0.42, r: 0.08, alpha: 0.09 },
      { cx: -0.08, cy: -0.48, r: 0.07, alpha: 0.07 },
      { cx: -0.35, cy: 0.4, r: 0.06, alpha: 0.08 },
    ];

    const resize = () => {
      width = canvas.clientWidth || window.innerWidth;
      height = canvas.clientHeight || window.innerHeight;
      dpr = Math.min(window.devicePixelRatio || 1, height > 1800 ? 1.25 : 2);
      canvas.width = Math.floor(width * dpr);
      canvas.height = Math.floor(height * dpr);
      ctx.setTransform(dpr, 0, 0, dpr, 0, 0);
    };

    resize();
    window.addEventListener('resize', resize);

    const areaFactor = Math.max(1, Math.min(3.2, (width * height) / (1280 * 800)));
    const starTints = ['#ffffff', '#e6f0ff', '#cfe4ff', '#ffeccc', '#89AACC'];
    const starCount = Math.round((showMoon ? 220 : 280) * areaFactor);
    const stars: Star[] = Array.from({ length: starCount }, (_, i) => {
      const layer = i % 3;
      return {
        x: Math.random(),
        y: Math.random(),
        radius:
          layer === 0
            ? Math.random() * 0.8 + 0.35
            : layer === 1
            ? Math.random() * 1.15 + 0.75
            : Math.random() * 1.5 + 1.15,
        baseAlpha: layer === 0 ? 0.32 + Math.random() * 0.3 : 0.5 + Math.random() * 0.45,
        twinkleSpeed: 0.8 + Math.random() * 2.4,
        twinkleOffset: Math.random() * Math.PI * 2,
        driftX: (layer + 1) * (showMoon ? 0.000012 : 0.000018),
        driftY: (layer + 1) * ((showMoon ? -0.000005 : -0.000009) / areaFactor),
        isSparkle: i % (showMoon ? 16 : 12) === 0,
        tint: starTints[i % starTints.length],
      };
    });

    const shootingStars: ShootingStar[] = [];
    let nextMeteorAt = performance.now() + 1400;

    const startTime = performance.now();

    const drawFrame = (now: number) => {
      const t = (now - startTime) * 0.001;

      // 1. Deep night sky backdrop
      const skyGrad = ctx.createLinearGradient(0, flipped ? height : 0, 0, flipped ? 0 : height);
      skyGrad.addColorStop(0, '#04070f');
      skyGrad.addColorStop(0.55, '#081020');
      skyGrad.addColorStop(1, '#0a0a0a');
      ctx.fillStyle = skyGrad;
      ctx.fillRect(0, 0, width, height);

      // 2. Subtle cosmic nebula / Milky Way clouds
      const nebulaRadiusBase = Math.min(Math.max(width, 900), 1500);
      const nebulaSpots = [
        {
          x: width * (0.28 + Math.sin(t * 0.08) * 0.03),
          y: height * (flipped ? 0.65 : 0.25),
          r: nebulaRadiusBase * 0.55,
          color: 'rgba(78, 133, 191, 0.14)',
        },
        {
          x: width * (0.72 + Math.cos(t * 0.06) * 0.03),
          y: height * (flipped ? 0.72 : 0.55),
          r: nebulaRadiusBase * 0.48,
          color: 'rgba(137, 170, 204, 0.11)',
        },
        {
          x: width * 0.45,
          y: height * 0.82,
          r: nebulaRadiusBase * 0.52,
          color: 'rgba(30, 58, 102, 0.13)',
        },
      ];

      nebulaSpots.forEach((n) => {
        const grad = ctx.createRadialGradient(n.x, n.y, 0, n.x, n.y, n.r);
        grad.addColorStop(0, n.color);
        grad.addColorStop(1, 'rgba(10, 10, 10, 0)');
        ctx.fillStyle = grad;
        ctx.fillRect(0, 0, width, height);
      });

      // 3. Luminous Moon (ดวงจันทร์) — rendered when variant is 'moon-and-stars'
      if (showMoon) {
        const moonRadius = Math.min(width, height) * (width < 640 ? 0.095 : 0.085);
        const moonX = width * (flipped ? 0.18 : 0.82) + Math.sin(t * 0.12) * 4;
        const moonY = height * (flipped ? 0.72 : 0.24) + Math.cos(t * 0.1) * 4;

        // Outer atmospheric moonlight halo
        const outerHalo = ctx.createRadialGradient(
          moonX,
          moonY,
          moonRadius * 0.6,
          moonX,
          moonY,
          moonRadius * 4.8
        );
        outerHalo.addColorStop(0, 'rgba(210, 228, 255, 0.26)');
        outerHalo.addColorStop(0.28, 'rgba(137, 170, 204, 0.12)');
        outerHalo.addColorStop(0.65, 'rgba(78, 133, 191, 0.04)');
        outerHalo.addColorStop(1, 'rgba(10, 10, 10, 0)');
        ctx.fillStyle = outerHalo;
        ctx.beginPath();
        ctx.arc(moonX, moonY, moonRadius * 4.8, 0, Math.PI * 2);
        ctx.fill();

        // Moon disc with radial limb darkening
        ctx.save();
        ctx.beginPath();
        ctx.arc(moonX, moonY, moonRadius, 0, Math.PI * 2);
        ctx.clip();

        const discGrad = ctx.createRadialGradient(
          moonX - moonRadius * 0.28,
          moonY - moonRadius * 0.28,
          moonRadius * 0.1,
          moonX,
          moonY,
          moonRadius
        );
        discGrad.addColorStop(0, '#fcfdff');
        discGrad.addColorStop(0.6, '#e6eef8');
        discGrad.addColorStop(0.88, '#bccce0');
        discGrad.addColorStop(1, '#8ca2bd');
        ctx.fillStyle = discGrad;
        ctx.fillRect(moonX - moonRadius, moonY - moonRadius, moonRadius * 2, moonRadius * 2);

        // Lunar craters & maria texture
        craters.forEach((c) => {
          ctx.fillStyle = `rgba(102, 122, 150, ${c.alpha})`;
          ctx.beginPath();
          ctx.arc(
            moonX + c.cx * moonRadius,
            moonY + c.cy * moonRadius,
            c.r * moonRadius,
            0,
            Math.PI * 2
          );
          ctx.fill();
        });

        // Soft crescent shadow curve on bottom-left edge for 3D depth
        const shadowGrad = ctx.createRadialGradient(
          moonX - moonRadius * 0.72,
          moonY + moonRadius * 0.55,
          moonRadius * 0.2,
          moonX - moonRadius * 0.35,
          moonY + moonRadius * 0.25,
          moonRadius * 1.45
        );
        shadowGrad.addColorStop(0, 'rgba(6, 10, 20, 0.58)');
        shadowGrad.addColorStop(0.55, 'rgba(10, 16, 30, 0.18)');
        shadowGrad.addColorStop(1, 'rgba(10, 16, 30, 0)');
        ctx.fillStyle = shadowGrad;
        ctx.fillRect(moonX - moonRadius, moonY - moonRadius, moonRadius * 2, moonRadius * 2);

        ctx.restore();

        // Subtle moon rim glow
        ctx.strokeStyle = 'rgba(235, 244, 255, 0.35)';
        ctx.lineWidth = 1.2;
        ctx.beginPath();
        ctx.arc(moonX, moonY, moonRadius, 0, Math.PI * 2);
        ctx.stroke();
      }

      // 4. Twinkling Starfield (ดวงดาว)
      stars.forEach((s) => {
        s.x = (s.x + s.driftX + 1) % 1;
        s.y = (s.y + s.driftY + 1) % 1;

        const sx = s.x * width;
        const sy = s.y * height;
        const twinkle = 0.55 + 0.45 * Math.sin(t * s.twinkleSpeed + s.twinkleOffset);
        const alpha = s.baseAlpha * twinkle;

        ctx.globalAlpha = alpha;
        ctx.fillStyle = s.tint;
        ctx.beginPath();
        ctx.arc(sx, sy, s.radius, 0, Math.PI * 2);
        ctx.fill();

        // 4-point star flare for brightest stars
        if (s.isSparkle && twinkle > 0.7) {
          const flareLen = s.radius * 4.5 * twinkle;
          ctx.strokeStyle = s.tint;
          ctx.lineWidth = 0.7;
          ctx.globalAlpha = alpha * 0.65;
          ctx.beginPath();
          ctx.moveTo(sx - flareLen, sy);
          ctx.lineTo(sx + flareLen, sy);
          ctx.moveTo(sx, sy - flareLen);
          ctx.lineTo(sx, sy + flareLen);
          ctx.stroke();
        }
      });

      // Subtle constellation filaments in stars-only mode
      if (!showMoon) {
        const sparkleStars = stars.filter((s) => s.isSparkle);
        ctx.lineWidth = 0.6;
        for (let i = 0; i < sparkleStars.length; i++) {
          for (let j = i + 1; j < sparkleStars.length; j++) {
            const dx = (sparkleStars[i].x - sparkleStars[j].x) * width;
            const dy = (sparkleStars[i].y - sparkleStars[j].y) * height;
            const dist = Math.hypot(dx, dy);
            if (dist < 170) {
              ctx.globalAlpha = (1 - dist / 170) * 0.14;
              ctx.strokeStyle = '#89AACC';
              ctx.beginPath();
              ctx.moveTo(sparkleStars[i].x * width, sparkleStars[i].y * height);
              ctx.lineTo(sparkleStars[j].x * width, sparkleStars[j].y * height);
              ctx.stroke();
            }
          }
        }
      }
      ctx.globalAlpha = 1;

      // 5. Shooting Stars (ดาวตก)
      if (now >= nextMeteorAt) {
        const startX = width * (0.15 + Math.random() * 0.7);
        const startY = height * (
          !showMoon
            ? 0.05 + Math.random() * 0.82
            : flipped
            ? 0.6 + Math.random() * 0.3
            : 0.06 + Math.random() * 0.32
        );
        const speed = 7 + Math.random() * 5;
        const angle = (flipped ? -1 : 1) * (0.35 + Math.random() * 0.25);
        shootingStars.push({
          x: startX,
          y: startY,
          vx: -Math.cos(angle) * speed,
          vy: Math.sin(angle) * speed,
          length: 90 + Math.random() * 70,
          life: 0,
          maxLife: 45 + Math.random() * 25,
        });
        nextMeteorAt = now + 2600 + Math.random() * 3400;
      }

      for (let i = shootingStars.length - 1; i >= 0; i--) {
        const m = shootingStars[i];
        m.x += m.vx;
        m.y += m.vy;
        m.life += 1;

        const progress = m.life / m.maxLife;
        const alpha = progress < 0.2 ? progress / 0.2 : Math.max(0, 1 - (progress - 0.2) / 0.8);

        const norm = Math.hypot(m.vx, m.vy) || 1;
        const tailX = m.x - (m.vx / norm) * m.length;
        const tailY = m.y - (m.vy / norm) * m.length;

        const grad = ctx.createLinearGradient(m.x, m.y, tailX, tailY);
        grad.addColorStop(0, `rgba(255, 255, 255, ${0.9 * alpha})`);
        grad.addColorStop(0.35, `rgba(137, 170, 204, ${0.5 * alpha})`);
        grad.addColorStop(1, 'rgba(137, 170, 204, 0)');

        ctx.strokeStyle = grad;
        ctx.lineWidth = 1.6;
        ctx.beginPath();
        ctx.moveTo(m.x, m.y);
        ctx.lineTo(tailX, tailY);
        ctx.stroke();

        // Bright meteor head
        ctx.fillStyle = `rgba(255, 255, 255, ${alpha})`;
        ctx.beginPath();
        ctx.arc(m.x, m.y, 1.8, 0, Math.PI * 2);
        ctx.fill();

        if (m.life >= m.maxLife) {
          shootingStars.splice(i, 1);
        }
      }

      animationFrameId = requestAnimationFrame(drawFrame);
    };

    animationFrameId = requestAnimationFrame(drawFrame);

    return () => {
      cancelAnimationFrame(animationFrameId);
      window.removeEventListener('resize', resize);
    };
  }, [flipped]);

  return (
    <canvas
      ref={canvasRef}
      aria-hidden="true"
      className={`w-full h-full block pointer-events-none ${className}`}
    />
  );
};
