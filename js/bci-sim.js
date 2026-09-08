/**
 * The Living Blueprint - Tool 1: BrainTech (Neural Sync Interface)
 * Simulates real-time BCI signal processing, multi-channel EEG jitter,
 * and geometric neural lattice snapping upon user calibration hold.
 */

(function () {
  'use strict';

  const canvas = document.getElementById('bci-canvas');
  if (!canvas) return;

  const ctx = canvas.getContext('2d');
  let width, height;

  // DOM Elements
  const holdBtn = document.getElementById('bci-hold-btn');
  const progressBar = document.getElementById('bci-progress-bar');
  const hudState = document.getElementById('bci-hud-state');
  const snrVal = document.getElementById('bci-snr-val');
  const plvVal = document.getElementById('bci-plv-val');
  const impVal = document.getElementById('bci-imp-val');
  const intentVal = document.getElementById('bci-intent-val');
  const modeBtns = document.querySelectorAll('.bci-mode-btn');

  // Simulation State
  let isCalibrating = false;
  let calibrationProgress = 0; // 0 to 1
  let currentMode = 'motor'; // 'motor', 'visual', 'executive'

  const mouse = {
    x: 0,
    y: 0,
    inCanvas: false
  };

  // Node System
  const NODE_COUNT = 48;
  const nodes = [];

  class BciNode {
    constructor(id) {
      this.id = id;
      this.resetChaotic();
      this.lockedX = 0;
      this.lockedY = 0;
      this.freq = 0.5 + Math.random() * 2;
      this.phase = Math.random() * Math.PI * 2;
      this.pulse = 0;
      this.spike = false;
    }

    resetChaotic() {
      this.chaoticX = (0.1 + Math.random() * 0.8) * width;
      this.chaoticY = (0.15 + Math.random() * 0.7) * height;
      this.vx = (Math.random() - 0.5) * 1.6;
      this.vy = (Math.random() - 0.5) * 1.6;
    }

    update(progress, time, focusPoint) {
      // Chaotic drift
      this.chaoticX += this.vx + Math.sin(time * 0.05 + this.phase) * 0.8;
      this.chaoticY += this.vy + Math.cos(time * 0.05 + this.phase) * 0.8;

      // Bounce off boundaries
      if (this.chaoticX < 20 || this.chaoticX > width - 20) this.vx *= -1;
      if (this.chaoticY < 20 || this.chaoticY > height - 60) this.vy *= -1;

      // Calculate Target Geometric Locked Position based on mode & focusPoint
      const cols = 8;
      const rows = 6;
      const col = this.id % cols;
      const row = Math.floor(this.id / cols);

      const spacingX = Math.min(width * 0.6, 380) / cols;
      const spacingY = Math.min(height * 0.5, 260) / rows;

      const gridCenterX = focusPoint.x;
      const gridCenterY = focusPoint.y - 15;

      const targetX = gridCenterX + (col - cols / 2 + 0.5) * spacingX;
      const targetY = gridCenterY + (row - rows / 2 + 0.5) * spacingY;

      // Hexagonal / Radial modifier for visual richness
      const angle = (this.id / NODE_COUNT) * Math.PI * 2;
      const ringRadius = 50 + (this.id % 3) * 45;
      const radialX = gridCenterX + Math.cos(angle) * ringRadius;
      const radialY = gridCenterY + Math.sin(angle) * ringRadius;

      // Select target based on mode
      const finalTargetX = (currentMode === 'visual') ? radialX : targetX;
      const finalTargetY = (currentMode === 'visual') ? radialY : targetY;

      // Smooth interpolation using easing
      const ease = progress * progress * (3 - 2 * progress); // smoothstep
      this.currentX = this.chaoticX * (1 - ease) + finalTargetX * ease;
      this.currentY = this.chaoticY * (1 - ease) + finalTargetY * ease;

      // Synaptic pulse fire
      if (Math.random() < 0.02 + progress * 0.08) {
        this.pulse = 1.0;
      }
      this.pulse *= 0.92;
    }

    draw(ctx, progress) {
      const isSynced = progress > 0.85;
      const baseRadius = isSynced ? 3.5 : 2.5;
      const radius = baseRadius + this.pulse * 3;

      ctx.save();
      ctx.beginPath();
      ctx.arc(this.currentX, this.currentY, radius, 0, Math.PI * 2);

      if (isSynced) {
        // High-coherence Blueprint Ochre / Amber
        ctx.fillStyle = this.pulse > 0.4 ? '#FFF7D6' : '#C88A3B';
        ctx.shadowColor = '#E0A34B';
        ctx.shadowBlur = 8 + this.pulse * 10;
      } else {
        // Chaotic state: Muted earthen nodes
        const r = Math.floor(160 + progress * 60);
        const g = Math.floor(130 + progress * 30);
        const b = Math.floor(100 - progress * 40);
        ctx.fillStyle = `rgb(${r}, ${g}, ${b})`;
        ctx.shadowBlur = 0;
      }

      ctx.fill();
      ctx.restore();
    }
  }

  function resize() {
    const rect = canvas.getBoundingClientRect();
    width = canvas.width = rect.width;
    height = canvas.height = rect.height;

    if (nodes.length === 0) {
      for (let i = 0; i < NODE_COUNT; i++) {
        nodes.push(new BciNode(i));
      }
    }
  }

  // Mouse tracking on canvas
  canvas.addEventListener('mousemove', (e) => {
    const rect = canvas.getBoundingClientRect();
    mouse.x = e.clientX - rect.left;
    mouse.y = e.clientY - rect.top;
    mouse.inCanvas = true;
  });

  canvas.addEventListener('mouseleave', () => {
    mouse.inCanvas = false;
  });

  // Hold-to-Calibrate Button Interaction
  let holdInterval = null;

  function startCalibration(e) {
    if (e) e.preventDefault();
    isCalibrating = true;
    if (window.AudioController) window.AudioController.playClick(440);

    if (holdInterval) clearInterval(holdInterval);
    holdInterval = setInterval(() => {
      if (calibrationProgress < 1) {
        calibrationProgress += 0.035;
        if (calibrationProgress >= 1) {
          calibrationProgress = 1;
          onCalibrationComplete();
        }
        updateUI();
      }
    }, 30);
  }

  function releaseCalibration() {
    isCalibrating = false;
    if (holdInterval) clearInterval(holdInterval);
    
    // Smooth decay if released before full lock
    holdInterval = setInterval(() => {
      if (calibrationProgress > 0) {
        calibrationProgress -= 0.05;
        if (calibrationProgress <= 0) {
          calibrationProgress = 0;
          clearInterval(holdInterval);
        }
        updateUI();
      }
    }, 30);
  }

  function onCalibrationComplete() {
    if (window.AudioController) {
      window.AudioController.playSuccessChime();
      window.AudioController.triggerHapticShake();
    }
  }

  // Attach button listeners (Touch + Mouse)
  holdBtn.addEventListener('mousedown', startCalibration);
  window.addEventListener('mouseup', releaseCalibration);
  holdBtn.addEventListener('touchstart', startCalibration, { passive: false });
  window.addEventListener('touchend', releaseCalibration);
  window.addEventListener('touchcancel', releaseCalibration);

  // Mode Selection Buttons
  modeBtns.forEach(btn => {
    btn.addEventListener('click', () => {
      modeBtns.forEach(b => b.classList.remove('active'));
      btn.classList.add('active');
      currentMode = btn.dataset.mode || 'motor';
      if (window.AudioController) window.AudioController.playClick(580);
      updateUI();
    });
  });

  function updateUI() {
    progressBar.style.width = `${calibrationProgress * 100}%`;

    if (calibrationProgress >= 0.95) {
      hudState.textContent = 'LOCKED // COHERENT SYNC';
      hudState.style.color = '#78B884';
      snrVal.textContent = '+19.4 dB';
      plvVal.textContent = '0.98';
      impVal.textContent = '< 2.4 kΩ';
      
      if (currentMode === 'motor') {
        intentVal.textContent = 'C3/C4 Sensorimotor Vector Decoded';
      } else if (currentMode === 'visual') {
        intentVal.textContent = 'Alpha Wave Desync (Oz Focus)';
      } else {
        intentVal.textContent = 'Frontal Theta Coherence (Executive)';
      }
    } else if (calibrationProgress > 0.1) {
      hudState.textContent = `FILTERING ARTIFACTS (${Math.round(calibrationProgress * 100)}%)`;
      hudState.style.color = '#E0A34B';
      const snr = (-4.0 + calibrationProgress * 23.4).toFixed(1);
      snrVal.textContent = `${snr > 0 ? '+' : ''}${snr} dB`;
      plvVal.textContent = (0.18 + calibrationProgress * 0.8).toFixed(2);
      impVal.textContent = `${(22.0 - calibrationProgress * 19.5).toFixed(1)} kΩ`;
      intentVal.textContent = 'Extracting Spatial Features...';
    } else {
      hudState.textContent = 'RAW EEG // CHAOTIC';
      hudState.style.color = '#C88A3B';
      snrVal.textContent = '-4.2 dB';
      plvVal.textContent = '0.14';
      impVal.textContent = '24.6 kΩ';
      intentVal.textContent = 'Acquiring Channel Baseline...';
    }
  }

  // Draw EEG Mini Waveforms in canvas corner
  function drawMiniEEG(ctx, time, progress) {
    const waveX = 20;
    const waveY = height - 44;
    const waveW = Math.min(width - 40, 320);
    const waveH = 26;

    ctx.save();
    ctx.fillStyle = 'rgba(24, 19, 15, 0.7)';
    ctx.fillRect(waveX - 4, waveY - 4, waveW + 8, waveH + 8);
    ctx.strokeStyle = 'rgba(191, 123, 43, 0.25)';
    ctx.strokeRect(waveX - 4, waveY - 4, waveW + 8, waveH + 8);

    ctx.beginPath();
    ctx.font = '9px "JetBrains Mono", monospace';
    ctx.fillStyle = 'rgba(226, 211, 184, 0.7)';
    ctx.fillText('EEG CH1 (μV)', waveX + 4, waveY + 8);

    ctx.beginPath();
    for (let x = 0; x < waveW; x++) {
      const t = (time * 0.08) + (x * 0.08);
      // Noise component vs clean sinusoidal signal
      const noise = (Math.sin(t * 3.7) + Math.cos(t * 1.9) + (Math.random() - 0.5) * 1.5) * (1 - progress * 0.85);
      const clean = Math.sin(t) * 8 * progress;
      const y = waveY + waveH / 2 + (noise * 4 + clean);

      if (x === 0) ctx.moveTo(waveX + x, y);
      else ctx.lineTo(waveX + x, y);
    }

    ctx.strokeStyle = progress > 0.85 ? '#78B884' : '#E0A34B';
    ctx.lineWidth = 1.2;
    ctx.stroke();
    ctx.restore();
  }

  let animTime = 0;

  function render() {
    animTime += 1;

    ctx.fillStyle = '#14100D';
    ctx.fillRect(0, 0, width, height);

    // Subtle background grid
    ctx.save();
    ctx.strokeStyle = 'rgba(92, 71, 56, 0.15)';
    ctx.lineWidth = 1;
    const gridSize = 32;
    for (let x = 0; x < width; x += gridSize) {
      ctx.beginPath();
      ctx.moveTo(x, 0);
      ctx.lineTo(x, height);
      ctx.stroke();
    }
    for (let y = 0; y < height; y += gridSize) {
      ctx.beginPath();
      ctx.moveTo(0, y);
      ctx.lineTo(width, y);
      ctx.stroke();
    }
    ctx.restore();

    // Focal center: mouse if hovering, else center of canvas
    const focusPoint = {
      x: mouse.inCanvas ? mouse.x : width / 2,
      y: mouse.inCanvas ? mouse.y : height / 2
    };

    // Update all nodes
    nodes.forEach(n => n.update(calibrationProgress, animTime, focusPoint));

    // Draw Synaptic Connections
    const maxDist = calibrationProgress > 0.7 ? 110 : 85;
    ctx.save();
    for (let i = 0; i < nodes.length; i++) {
      for (let j = i + 1; j < nodes.length; j++) {
        const dx = nodes[i].currentX - nodes[j].currentX;
        const dy = nodes[i].currentY - nodes[j].currentY;
        const dist = Math.sqrt(dx * dx + dy * dy);

        if (dist < maxDist) {
          const alpha = (1 - dist / maxDist) * (0.15 + calibrationProgress * 0.45);
          ctx.beginPath();
          ctx.moveTo(nodes[i].currentX, nodes[i].currentY);
          ctx.lineTo(nodes[j].currentX, nodes[j].currentY);

          if (calibrationProgress > 0.85) {
            ctx.strokeStyle = `rgba(224, 163, 75, ${alpha})`;
            ctx.lineWidth = 1.4;
          } else {
            ctx.strokeStyle = `rgba(139, 115, 85, ${alpha * 0.6})`;
            ctx.lineWidth = 0.8;
          }
          ctx.stroke();
        }
      }
    }
    ctx.restore();

    // Draw Nodes
    nodes.forEach(n => n.draw(ctx, calibrationProgress));

    // Focal Target Cursor Ring
    ctx.save();
    ctx.beginPath();
    ctx.arc(focusPoint.x, focusPoint.y, 22 + Math.sin(animTime * 0.08) * 3, 0, Math.PI * 2);
    ctx.strokeStyle = calibrationProgress > 0.85 ? 'rgba(120, 184, 132, 0.7)' : 'rgba(191, 123, 43, 0.35)';
    ctx.setLineDash([4, 4]);
    ctx.lineWidth = 1.2;
    ctx.stroke();
    ctx.restore();

    // Draw EEG Stream
    drawMiniEEG(ctx, animTime, calibrationProgress);

    requestAnimationFrame(render);
  }

  window.addEventListener('resize', resize);
  setTimeout(() => {
    resize();
    render();
  }, 50);

})();
