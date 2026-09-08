/**
 * The Living Blueprint - Living Background Canvas
 * Simulates organic breathing blobs and gentle mouse-reactive fluid ripples
 * in warm earthy tones (Oatmeal, Linen, Mocha, Terracotta, Sage).
 */

(function () {
  'use strict';

  const canvas = document.getElementById('bg-canvas');
  if (!canvas) return;

  const ctx = canvas.getContext('2d');
  let width, height, dpr;

  // Track cursor position and speed
  const mouse = {
    x: -1000,
    y: -1000,
    targetX: -1000,
    targetY: -1000,
    active: false,
    lastX: 0,
    lastY: 0,
    speed: 0
  };

  // Fluid ripple rings triggered by cursor motion
  const ripples = [];
  const MAX_RIPPLES = 18;

  // Organic floating blobs configuration
  const blobs = [
    {
      baseX: 0.25,
      baseY: 0.35,
      radius: 360,
      color: 'rgba(215, 198, 178, 0.32)', // Warm Mocha tint
      speed: 0.0006,
      phase: 0,
      noiseOffsetX: 0,
      noiseOffsetY: 0
    },
    {
      baseX: 0.75,
      baseY: 0.65,
      radius: 420,
      color: 'rgba(225, 218, 202, 0.45)', // Warm Oatmeal
      speed: 0.00045,
      phase: Math.PI / 2,
      noiseOffsetX: 10,
      noiseOffsetY: 20
    },
    {
      baseX: 0.68,
      baseY: 0.25,
      radius: 280,
      color: 'rgba(182, 84, 52, 0.06)', // Terracotta breath
      speed: 0.0005,
      phase: Math.PI,
      noiseOffsetX: 30,
      noiseOffsetY: 50
    },
    {
      baseX: 0.2,
      baseY: 0.8,
      radius: 320,
      color: 'rgba(75, 107, 84, 0.06)', // Subtle Sage breath
      speed: 0.0004,
      phase: Math.PI * 1.5,
      noiseOffsetX: 40,
      noiseOffsetY: 15
    }
  ];

  function resize() {
    dpr = Math.min(window.devicePixelRatio || 1, 2);
    width = window.innerWidth;
    height = window.innerHeight;
    canvas.width = width * dpr;
    canvas.height = height * dpr;
    ctx.scale(dpr, dpr);
  }

  // Smooth mouse interpolation and ripple generation
  window.addEventListener('mousemove', (e) => {
    mouse.active = true;
    mouse.targetX = e.clientX;
    mouse.targetY = e.clientY;

    const dx = e.clientX - mouse.lastX;
    const dy = e.clientY - mouse.lastY;
    const dist = Math.sqrt(dx * dx + dy * dy);

    if (dist > 24 && ripples.length < MAX_RIPPLES) {
      ripples.push({
        x: e.clientX,
        y: e.clientY,
        radius: 4,
        maxRadius: Math.min(180, 50 + dist * 1.5),
        alpha: Math.min(0.28, 0.08 + dist * 0.004),
        speed: 1.2 + dist * 0.04
      });
      mouse.lastX = e.clientX;
      mouse.lastY = e.clientY;
    }
  }, { passive: true });

  window.addEventListener('mouseleave', () => {
    mouse.active = false;
  });

  window.addEventListener('resize', resize);
  resize();

  let time = 0;

  function render() {
    time += 1;

    // Smooth cursor follow
    if (mouse.active) {
      mouse.x += (mouse.targetX - mouse.x) * 0.1;
      mouse.y += (mouse.targetY - mouse.y) * 0.1;
    }

    // Clear background
    ctx.clearRect(0, 0, width, height);

    // Draw organic blobs
    blobs.forEach((blob) => {
      const wobbleTime = time * blob.speed;
      
      // Blob center drifting
      const driftX = Math.sin(wobbleTime + blob.phase) * 60;
      const driftY = Math.cos(wobbleTime * 0.8 + blob.phase) * 45;
      
      let centerX = width * blob.baseX + driftX;
      let centerY = height * blob.baseY + driftY;

      // Gentle repulsion/attraction to cursor
      if (mouse.active) {
        const dx = mouse.x - centerX;
        const dy = mouse.y - centerY;
        const dist = Math.sqrt(dx * dx + dy * dy);
        if (dist < 400 && dist > 0) {
          const force = (400 - dist) / 400;
          centerX += (dx / dist) * force * 30;
          centerY += (dy / dist) * force * 30;
        }
      }

      // Render soft radial gradient blob
      const currentRadius = blob.radius + Math.sin(wobbleTime * 1.5) * 20;
      const gradient = ctx.createRadialGradient(
        centerX, centerY, currentRadius * 0.05,
        centerX, centerY, currentRadius
      );

      gradient.addColorStop(0, blob.color);
      gradient.addColorStop(0.5, blob.color.replace(/[\d\.]+\)$/, '0.08)'));
      gradient.addColorStop(1, 'rgba(246, 243, 236, 0)');

      ctx.save();
      ctx.fillStyle = gradient;
      ctx.beginPath();
      ctx.arc(centerX, centerY, currentRadius, 0, Math.PI * 2);
      ctx.fill();
      ctx.restore();
    });

    // Draw & update fluid ripples
    for (let i = ripples.length - 1; i >= 0; i--) {
      const r = ripples[i];
      r.radius += r.speed;
      r.alpha *= 0.965;

      if (r.alpha < 0.005 || r.radius > r.maxRadius) {
        ripples.splice(i, 1);
        continue;
      }

      ctx.save();
      ctx.beginPath();
      ctx.arc(r.x, r.y, r.radius, 0, Math.PI * 2);
      ctx.strokeStyle = `rgba(139, 115, 85, ${r.alpha})`;
      ctx.lineWidth = 1.2;
      ctx.stroke();

      // Inner faint secondary ring
      if (r.radius > 20) {
        ctx.beginPath();
        ctx.arc(r.x, r.y, r.radius * 0.65, 0, Math.PI * 2);
        ctx.strokeStyle = `rgba(182, 84, 52, ${r.alpha * 0.45})`;
        ctx.lineWidth = 0.8;
        ctx.stroke();
      }
      ctx.restore();
    }

    requestAnimationFrame(render);
  }

  render();
})();
