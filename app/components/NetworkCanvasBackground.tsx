'use client';

import React, { useEffect, useRef } from 'react';

export default function NetworkCanvasBackground() {
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
    // Massive amount of nodes across the whole screen
    const NODE_COUNT = isMobile ? 600 : 1500; 
    const CONNECTION_DIST = isMobile ? 80 : 140;
    const MOUSE_RADIUS = isMobile ? 120 : 250;
    const BG = '#0a1f1a';

    let W = window.innerWidth;
    let H = window.innerHeight;
    let mouseX = -999;
    let mouseY = -999;
    let scrollY = 0;

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

    // Tracking
    window.addEventListener('mousemove', (e) => { mouseX = e.clientX; mouseY = e.clientY; });
    window.addEventListener('touchmove', (e) => {
      if (e.touches[0]) { mouseX = e.touches[0].clientX; mouseY = e.touches[0].clientY; }
    }, { passive: true });
    window.addEventListener('scroll', () => { scrollY = window.scrollY; }, { passive: true });

    // ─── DENSITY ATTRACTORS ──────────────────────
    // We create invisible "attractors" spread across the screen.
    // Nodes are more likely to spawn near these attractors, 
    // creating dense clusters that organically flow into sparse areas, covering the whole screen.
    const ATTRACTOR_COUNT = isMobile ? 5 : 12;
    const attractors: Array<{x: number, y: number, strength: number}> = [];
    for (let i = 0; i < ATTRACTOR_COUNT; i++) {
      attractors.push({
        x: W * (0.1 + Math.random() * 0.8),
        y: H * (0.1 + Math.random() * 0.8),
        strength: 200 + Math.random() * 400 // spread radius
      });
    }

    // ─── NODES ───────────────────────────────────
    interface NodeData {
      baseX: number; baseY: number;
      offsetX: number; offsetY: number;
      vx: number; vy: number;
      x: number; y: number; // Final computed
      isCore: boolean;
      baseR: number;
      hue: number;
      phase: number;
      hoverPhase: number;
    }

    const nodes: NodeData[] = [];

    for (let i = 0; i < NODE_COUNT; i++) {
      let bx = 0, by = 0;

      // 60% chance to spawn clustered around an attractor, 40% chance completely random
      if (Math.random() < 0.6) {
        const att = attractors[Math.floor(Math.random() * attractors.length)];
        // Gaussian-like offset
        const ang = Math.random() * Math.PI * 2;
        const rad = (Math.random() + Math.random()) * att.strength * 0.5;
        bx = att.x + Math.cos(ang) * rad;
        by = att.y + Math.sin(ang) * rad;
      } else {
        bx = Math.random() * W;
        by = Math.random() * H;
      }

      // Add edge padding to cover the whole valid area fully
      if (bx < -100) bx += W + 200;
      if (bx > W + 100) bx -= W + 200;
      if (by < -100) by += H + 200;
      if (by > H + 100) by -= H + 200;

      const isCore = Math.random() < 0.03; // 3% of nodes are thick cores

      nodes.push({
        baseX: bx, baseY: by,
        offsetX: 0, offsetY: 0,
        vx: (Math.random() - 0.5) * 0.6, // Faster drift velocity
        vy: (Math.random() - 0.5) * 0.6,
        x: 0, y: 0,
        isCore,
        baseR: isCore ? 1.5 + Math.random() * 1.5 : 0.4 + Math.random() * 0.8,
        hue: 155 + Math.random() * 30, // Brand cyan/mint
        phase: Math.random() * Math.PI * 2,
        hoverPhase: 0
      });
    }

    // Optimization: spatial binning grid
    // Since O(N^2) for 1500 nodes is 2.2 million distance checks per frame, we use a grid.
    const GRID_SIZE = CONNECTION_DIST;
    
    let time = 0;

    // ─── RENDER ──────────────────────────────────
    const render = () => {
      time += 0.025; // Faster global breathing/pulsing

      ctx.fillStyle = BG;
      ctx.fillRect(0, 0, W, H);

      // Build Spatial Grid for O(N) connections instead of O(N^2)
      const cols = Math.ceil(W / GRID_SIZE) + 1;
      const rows = Math.ceil(H / GRID_SIZE) + 1;
      const grid: NodeData[][][] = Array(cols).fill(0).map(() => Array(rows).fill(0).map(() => []));

      // ── Process Nodes ──
      for (const n of nodes) {
        // Organic drift around base position (Lissajous curve wandering)
        // This keeps nodes spread out over time instead of drifting off screen.
        n.offsetX += n.vx;
        n.offsetY += n.vy;
        
        // Soft tether to base to prevent them drifting forever
        n.offsetX *= 0.99;
        n.offsetY *= 0.99;

        // Base coordinates + organic global breathing + SCROLL PARALLAX
        const globalBreathX = Math.sin(time + n.baseY * 0.005) * 20;
        const globalBreathY = Math.cos(time + n.baseX * 0.005) * 20;
        const parallaxY = -scrollY * 0.3; // Scroll moves nodes up

        n.x = n.baseX + n.offsetX + globalBreathX;
        n.y = n.baseY + n.offsetY + globalBreathY + parallaxY;

        // Hover interaction
        const dx = mouseX - n.x;
        const dy = mouseY - n.y;
        const distToMouse = Math.sqrt(dx*dx + dy*dy);
        
        if (distToMouse < MOUSE_RADIUS) {
          n.hoverPhase += (1 - n.hoverPhase) * 0.1;
          // Mild repulsion pushing nodes physically away from mouse slightly
          if (distToMouse > 0) {
            n.offsetX -= (dx / distToMouse) * 0.5;
            n.offsetY -= (dy / distToMouse) * 0.5;
          }
        } else {
          n.hoverPhase += (0 - n.hoverPhase) * 0.05;
        }

        // Add to spatial grid
        const cx = Math.max(0, Math.min(cols - 1, Math.floor(n.x / GRID_SIZE)));
        const cy = Math.max(0, Math.min(rows - 1, Math.floor(n.y / GRID_SIZE)));
        
        // Skip nodes completely off screen (viewport culling)
        if (n.x >= -GRID_SIZE && n.x <= W + GRID_SIZE && n.y >= -GRID_SIZE && n.y <= H + GRID_SIZE) {
          grid[cx][cy].push(n);
        }
      }

      ctx.lineCap = 'round';

      // ── Draw Connections (Grid-based) ──
      ctx.beginPath();
      
      for (let c = 0; c < cols; c++) {
        for (let r = 0; r < rows; r++) {
          const cellNodes = grid[c][r];
          
          // Compare within this cell and neighboring right/bottom cells (to avoid duplicates)
          const neighbors = [
            [0, 0], [1, 0], [0, 1], [1, 1], [-1, 1]
          ];

          for (let i = 0; i < cellNodes.length; i++) {
            const a = cellNodes[i];
            
            for (const [nc, nr] of neighbors) {
              const checkC = c + nc;
              const checkR = r + nr;
              if (checkC >= 0 && checkC < cols && checkR >= 0 && checkR < rows) {
                const targetCell = grid[checkC][checkR];
                
                // If same cell, start loop from i+1. Else start from 0.
                const startIdx = (nc === 0 && nr === 0) ? i + 1 : 0;
                
                for (let j = startIdx; j < targetCell.length; j++) {
                  const b = targetCell[j];
                  
                  const dx = a.x - b.x;
                  const dy = a.y - b.y;
                  const distSq = dx*dx + dy*dy;
                  
                  const threshold = a.isCore || b.isCore ? CONNECTION_DIST * 1.5 : CONNECTION_DIST;
                  
                  if (distSq < threshold * threshold) {
                    const dist = Math.sqrt(distSq);
                    
                    // Hover boosts line alpha massively
                    const hoverBoost = Math.max(a.hoverPhase, b.hoverPhase);
                    
                    // Higher base visibility independent of hover
                    const baseAlpha = (1 - dist / threshold);
                    const alpha = baseAlpha * 0.65 + hoverBoost * baseAlpha * 0.35;
                    
                    if (alpha < 0.05) continue;

                    ctx.moveTo(a.x, a.y);
                    ctx.lineTo(b.x, b.y);
                    
                    const hue = hoverBoost > 0.1 ? 180 : a.hue;
                    ctx.strokeStyle = `hsla(${hue}, 80%, 65%, ${alpha})`;
                    
                    const width = (a.isCore || b.isCore ? 1.0 : 0.5) + hoverBoost * 0.8;
                    ctx.lineWidth = width;
                    ctx.stroke();
                    ctx.beginPath(); // Essential to restart path for new color/width batch
                  }
                }
              }
            }
          }
        }
      }

      // ── Draw Nodes ──
      for (const n of nodes) {
        // Only draw visible nodes
        if (n.x < -10 || n.x > W + 10 || n.y < -10 || n.y > H + 10) continue;

        const pulse = n.isCore ? 0.5 + 0.5 * Math.sin(time * 3 + n.phase) : 1;
        const r = n.baseR * (n.isCore ? 1 + pulse * 0.5 : 1) * (1 + n.hoverPhase * 0.5);
        
        ctx.beginPath();
        ctx.arc(n.x, n.y, r, 0, Math.PI * 2);
        
        const hue = n.hoverPhase > 0.1 ? 180 : n.hue;
        const lum = n.isCore ? 85 : 70; // Brighter nodes
        const alpha = (n.isCore ? 1 : 0.85) + n.hoverPhase * 0.15; // Much higher base alpha
        
        ctx.fillStyle = `hsla(${hue}, 80%, ${lum}%, ${alpha})`;
        ctx.fill();

        if (n.isCore || n.hoverPhase > 0.1) {
          ctx.shadowBlur = n.isCore ? 15 : 10 + n.hoverPhase * 10;
          ctx.shadowColor = `hsla(${hue}, 90%, 70%, ${alpha})`;
          ctx.fill();
          ctx.shadowBlur = 0;
        }
      }

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
      window.removeEventListener('scroll', () => {});
      document.removeEventListener('visibilitychange', onVis);
    };
  }, []);

  return (
    <canvas
      ref={canvasRef}
      className="absolute inset-0 w-full h-full pointer-events-auto z-0"
      style={{ background: '#0a1f1a' }}
    />
  );
}
