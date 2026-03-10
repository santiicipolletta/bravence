'use client';

import React, { useEffect, useRef } from 'react';

export default function FunnelCanvasBackground() {
  const canvasRef = useRef<HTMLCanvasElement>(null);

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext('2d') as CanvasRenderingContext2D;
    if (!ctx) return;

    let animationFrameId: number;
    const isMobile = window.innerWidth < 768;
    const DPR = Math.min(window.devicePixelRatio || 1, 2);

    // ─── CONFIG ──────────────────────────────────
    const PARTICLE_COUNT = isMobile ? 18000 : 60000;
    const BG = '#0a1f1a';

    let W = window.innerWidth;
    let H = window.innerHeight;

    const resize = () => {
      W = window.innerWidth;
      H = window.innerHeight;
      canvas.width = W * DPR;
      canvas.height = H * DPR;
      canvas.style.width = W + 'px';
      canvas.style.height = H + 'px';
      ctx.setTransform(DPR, 0, 0, DPR, 0, 0);
    };
    resize();
    window.addEventListener('resize', resize);

    // ─── PARTICLE SYSTEM ─────────────────────────
    // Each particle orbits in 3D around a vertical axis (Y),
    // with the radius pinching at the center (hourglass/vortex shape).

    const particles: Float32Array = new Float32Array(PARTICLE_COUNT * 7);
    // Layout per particle: [angle, yNorm, orbitRadius, speed, size, hue, brightness]
    // yNorm: -1 (top) to 1 (bottom), 0 = center pinch

    for (let i = 0; i < PARTICLE_COUNT; i++) {
      const idx = i * 7;

      // Angle around the vertical axis (0 to 2PI)
      particles[idx + 0] = Math.random() * Math.PI * 2;

      // Y position: -1 to 1, distributed with more density near center
      // Use a distribution that clusters near 0 for the hourglass density
      const rawY = Math.random() * 2 - 1;
      const sign = rawY >= 0 ? 1 : -1;
      particles[idx + 1] = sign * Math.pow(Math.abs(rawY), 0.7);

      // Orbit radius base: 
      // 75% of particles spawned in the tight inner trunk (0.02 - 0.2)
      // 25% spawned in the wide outer galaxy (0.2 - 3.5)
      if (Math.random() < 0.75) {
        particles[idx + 2] = 0.02 + Math.pow(Math.random(), 2) * 0.18;
      } else {
        particles[idx + 2] = 0.2 + Math.pow(Math.random(), 3) * 3.3;
      }

      // Rotation speed (faster near center for vortex feel)
      particles[idx + 3] = 0.5 + Math.random() * 1.5; // Sped up the core even more

      // Base Size (very small for fine dust effect)
      particles[idx + 4] = 0.1 + Math.random() * 0.6;

      // Hue variation: 155-195 range (teal/mint/cyan in brand palette)
      particles[idx + 5] = 155 + Math.random() * 40;

      // Brightness: 40-95%
      particles[idx + 6] = 40 + Math.random() * 55;
    }

    // Background star field (tiny static dots)
    const STAR_COUNT = isMobile ? 100 : 200;
    const stars: Array<{ x: number; y: number; r: number; a: number; twinklePhase: number }> = [];
    for (let i = 0; i < STAR_COUNT; i++) {
      stars.push({
        x: Math.random() * W,
        y: Math.random() * H,
        r: 0.3 + Math.random() * 1,
        a: 0.1 + Math.random() * 0.3,
        twinklePhase: Math.random() * Math.PI * 2,
      });
    }

    let time = 0;

    // ─── RENDER ──────────────────────────────────
    const render = () => {
      time += 0.008;

      ctx.fillStyle = BG;
      ctx.fillRect(0, 0, W, H);

      // ── Background Stars ──
      for (const s of stars) {
        const twinkle = 0.5 + 0.5 * Math.sin(time * 2 + s.twinklePhase);
        ctx.beginPath();
        ctx.arc(s.x, s.y, s.r, 0, Math.PI * 2);
        ctx.fillStyle = `rgba(198,255,247,${s.a * twinkle})`;
        ctx.fill();
      }

      // ── Center glow ──
      const cx = W / 2;
      const cy = H / 2;
      const glowGrd = ctx.createRadialGradient(cx, cy, 0, cx, cy, W * 0.2);
      glowGrd.addColorStop(0, 'rgba(77,174,161,0.08)');
      glowGrd.addColorStop(0.5, 'rgba(77,174,161,0.03)');
      glowGrd.addColorStop(1, 'rgba(77,174,161,0)');
      ctx.fillStyle = glowGrd;
      ctx.fillRect(0, 0, W, H);

      // ── Vortex Particles ──
      // The hourglass shape: radius is large at top/bottom, pinches at center
      // Formula: effectiveRadius = minR + (maxR - minR) * |yNorm|^power
      // We make maxR insanely massive so the top and bottom bases of the hourglass flare out violently
      const maxR = Math.max(W, H) * (isMobile ? 1.5 : 2.5);
      const minR = Math.min(W, H) * 0.05; // Tight pinch at center
      const pinchPower = 1.6; // Higher pinch power = stays narrow in the middle, flares wide at the ends

      const verticalSpread = H * 0.70; // Massive vertical stretch so the cone fills top/bottom bounds

      for (let i = 0; i < PARTICLE_COUNT; i++) {
        const idx = i * 7;
        let angle = particles[idx + 0];
        const yNorm = particles[idx + 1];
        const orbitBase = particles[idx + 2];
        const speed = particles[idx + 3];
        const size = particles[idx + 4];
        const hue = particles[idx + 5];
        const bright = particles[idx + 6];

        // Rotate: speed increases near center (|yNorm| close to 0)
        const centerProximity = 1 - Math.abs(yNorm);
        const rotationSpeed = speed * (0.4 + centerProximity * 2.0);
        angle += rotationSpeed * 0.008;
        // Keep angle in range
        if (angle > Math.PI * 2) angle -= Math.PI * 2;
        particles[idx + 0] = angle;

        // Calculate hourglass radius at this Y position
        const absY = Math.abs(yNorm);
        const hourglassR = minR + (maxR - minR) * Math.pow(absY, pinchPower);
        const effectiveR = hourglassR * orbitBase;

        // 3D → 2D projection (simple cylindrical projection)
        const projX = cx + Math.cos(angle) * effectiveR;
        const projY = cy + yNorm * verticalSpread;

        // Depth effect: particles "behind" the axis are dimmer
        const depth = Math.sin(angle); // -1 (back) to 1 (front)
        const depthAlpha = 0.15 + (depth + 1) * 0.35; // 0.15 to 0.85

        // Core particles (orbitBase < 0.2) get a slight size and brightness boost
        const isCoreParticle = orbitBase < 0.2;
        const coreBoost = isCoreParticle ? 1.5 : 1.0;

        // Slight Z-sorting: adjust size by depth and core status
        const depthSize = size * (0.5 + (depth + 1) * 0.3) * coreBoost;

        // Skip off-screen
        if (projX < -20 || projX > W + 20 || projY < -20 || projY > H + 20) continue;

        // Draw particle
        ctx.beginPath();
        ctx.arc(projX, projY, depthSize, 0, Math.PI * 2);

        // Color: vary between teal, cyan, and white based on brightness
        const sat = bright > 80 ? 50 : 80;
        const lum = bright > 80 ? 90 : bright;
        ctx.fillStyle = `hsla(${hue}, ${sat}%, ${lum}%, ${depthAlpha})`;
        ctx.fill();
      }

      // ── Bright core line at the pinch point ──
      const coreGrd = ctx.createLinearGradient(cx - maxR * 0.05, cy, cx + maxR * 0.05, cy);
      coreGrd.addColorStop(0, 'rgba(198,255,247,0)');
      coreGrd.addColorStop(0.5, `rgba(198,255,247,${0.08 + 0.04 * Math.sin(time * 3)})`);
      coreGrd.addColorStop(1, 'rgba(198,255,247,0)');
      ctx.fillStyle = coreGrd;
      ctx.fillRect(cx - maxR * 0.4, cy - 1, maxR * 0.8, 2);

      animationFrameId = requestAnimationFrame(render);
    };

    const onVis = () => {
      if (document.hidden) cancelAnimationFrame(animationFrameId);
      else animationFrameId = requestAnimationFrame(render);
    };
    document.addEventListener('visibilitychange', onVis);

    animationFrameId = requestAnimationFrame(render);

    return () => {
      cancelAnimationFrame(animationFrameId);
      window.removeEventListener('resize', resize);
      document.removeEventListener('visibilitychange', onVis);
    };
  }, []);

  return (
    <canvas
      ref={canvasRef}
      className="absolute inset-0 w-full h-full pointer-events-none z-0"
    />
  );
}
