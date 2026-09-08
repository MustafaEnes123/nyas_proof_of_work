/**
 * The Living Blueprint - NYAS 2026-2027
 * Author: Mustafa Enes Kayacı
 * Master Controller: Web Audio tactile synthesizer, magnetic button physics,
 * haptic screen-shake illusion, smooth navigation, and dossier exporter.
 */

(function () {
  'use strict';

  // ==========================================================================
  // Web Audio API Synthesizer (Tactile Mechanical Clicks & Haptic Illusion)
  // ==========================================================================
  class TactileAudioController {
    constructor() {
      this.ctx = null;
      this.enabled = true;
      this.toggleBtn = document.getElementById('audio-toggle-btn');
      this.init();
    }

    init() {
      if (this.toggleBtn) {
        this.toggleBtn.addEventListener('click', () => this.toggle());
      }

      // Unlock AudioContext on first user interaction
      const unlockAudio = () => {
        if (!this.ctx) {
          const AudioContext = window.AudioContext || window.webkitAudioContext;
          if (AudioContext) {
            this.ctx = new AudioContext();
          }
        }
        if (this.ctx && this.ctx.state === 'suspended') {
          this.ctx.resume();
        }
        window.removeEventListener('click', unlockAudio);
        window.removeEventListener('keydown', unlockAudio);
      };

      window.addEventListener('click', unlockAudio, { once: false });
      window.addEventListener('keydown', unlockAudio, { once: false });
    }

    toggle() {
      this.enabled = !this.enabled;
      if (this.toggleBtn) {
        if (this.enabled) {
          this.toggleBtn.classList.add('active');
          this.toggleBtn.innerHTML = `
            <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><polygon points="11 5 6 9 2 9 2 15 6 15 11 19 11 5"></polygon><path d="M15.54 8.46a5 5 0 0 1 0 7.07"></path></svg>
            <span>Sound: ON</span>
          `;
          this.playClick(640);
        } else {
          this.toggleBtn.classList.remove('active');
          this.toggleBtn.innerHTML = `
            <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><polygon points="11 5 6 9 2 9 2 15 6 15 11 19 11 5"></polygon><line x1="23" y1="9" x2="17" y2="15"></line><line x1="17" y1="9" x2="23" y2="15"></line></svg>
            <span>Sound: OFF</span>
          `;
        }
      }
    }

    playClick(freq = 520) {
      if (!this.enabled || !this.ctx) return;
      try {
        const osc = this.ctx.createOscillator();
        const gain = this.ctx.createGain();
        const now = this.ctx.currentTime;

        osc.type = 'triangle';
        osc.frequency.setValueAtTime(freq, now);
        osc.frequency.exponentialRampToValueAtTime(120, now + 0.04);

        gain.gain.setValueAtTime(0.08, now);
        gain.gain.exponentialRampToValueAtTime(0.001, now + 0.04);

        osc.connect(gain);
        gain.connect(this.ctx.destination);

        osc.start(now);
        osc.stop(now + 0.04);
      } catch (err) {
        // Silently handle audio restriction
      }
    }

    playSuccessChime() {
      if (!this.enabled || !this.ctx) return;
      try {
        const notes = [523.25, 659.25, 783.99]; // C5 - E5 - G5 chord
        notes.forEach((freq, idx) => {
          const osc = this.ctx.createOscillator();
          const gain = this.ctx.createGain();
          const now = this.ctx.currentTime + idx * 0.08;

          osc.type = 'sine';
          osc.frequency.setValueAtTime(freq, now);

          gain.gain.setValueAtTime(0.06, now);
          gain.gain.exponentialRampToValueAtTime(0.0001, now + 0.28);

          osc.connect(gain);
          gain.connect(this.ctx.destination);

          osc.start(now);
          osc.stop(now + 0.28);
        });
      } catch (err) {}
    }

    triggerHapticShake() {
      document.body.classList.remove('haptic-shake');
      void document.body.offsetWidth; // Trigger reflow
      document.body.classList.add('haptic-shake');
      setTimeout(() => {
        document.body.classList.remove('haptic-shake');
      }, 190);
    }
  }

  window.AudioController = new TactileAudioController();

  // ==========================================================================
  // Magnetic Element Attraction (Tactile Cursor Physics)
  // ==========================================================================
  function initMagneticElements() {
    // Only enable magnetic pull on pointer devices (not touchscreens)
    if (window.matchMedia('(hover: none)').matches) return;

    const magneticTargets = document.querySelectorAll('.btn, .author-card-mini, .audio-toggle-btn');

    magneticTargets.forEach((el) => {
      let isHovered = false;

      el.addEventListener('mouseenter', () => {
        isHovered = true;
      });

      el.addEventListener('mousemove', (e) => {
        if (!isHovered) return;
        const rect = el.getBoundingClientRect();
        const centerX = rect.left + rect.width / 2;
        const centerY = rect.top + rect.height / 2;

        const deltaX = (e.clientX - centerX) * 0.25;
        const deltaY = (e.clientY - centerY) * 0.25;

        el.style.transform = `translate3d(${deltaX}px, ${deltaY}px, 0)`;
      });

      el.addEventListener('mouseleave', () => {
        isHovered = false;
        el.style.transform = 'translate3d(0, 0, 0)';
      });

      // Tactile sound & haptics on click
      el.addEventListener('click', () => {
        if (window.AudioController) {
          window.AudioController.playClick(460);
          window.AudioController.triggerHapticShake();
        }
      });
    });
  }

  // ==========================================================================
  // Active Navigation & Smooth Scroll Spy
  // ==========================================================================
  function initNavigationSpy() {
    const navLinks = document.querySelectorAll('.nav-link');
    const sections = document.querySelectorAll('section[id]');

    window.addEventListener('scroll', () => {
      let currentSectionId = '';
      const scrollPos = window.scrollY + 120;

      sections.forEach((section) => {
        const top = section.offsetTop;
        const height = section.offsetHeight;
        if (scrollPos >= top && scrollPos < top + height) {
          currentSectionId = section.getAttribute('id');
        }
      });

      navLinks.forEach((link) => {
        link.classList.remove('active');
        if (link.getAttribute('href') === `#${currentSectionId}`) {
          link.classList.add('active');
        }
      });
    }, { passive: true });
  }

  // ==========================================================================
  // Dossier Summary Downloader / Exporter
  // ==========================================================================
  function initDossierExporter() {
    const exportBtn = document.getElementById('export-dossier-btn');
    if (!exportBtn) return;

    exportBtn.addEventListener('click', (e) => {
      e.preventDefault();
      if (window.AudioController) {
        window.AudioController.playSuccessChime();
        window.AudioController.triggerHapticShake();
      }

      const dossierContent = `
================================================================================
THE LIVING BLUEPRINT - NYAS 2026-2027 SPECIFICATION DOSSIER
Author: Mustafa Enes Kayacı (AI Engineer & Cloud Architect)
Date: September 2026
Target: New York Academy of Sciences (NYAS) Launchpad & Technical Lead (CTO)
================================================================================

1. EXECUTIVE SUMMARY & OBJECTIVES
--------------------------------------------------------------------------------
This platform serves as a living, interactive Proof of Work (PoW) designed to
demonstrate technical depth, AI architecture, geospatial computing, and tactile
interface engineering for the upcoming 10-week NYAS Sprint.

2. VERIFIED PROOFS OF CONCEPT
--------------------------------------------------------------------------------
[POC 1] BrainTech (Neural Sync Interface)
- Logic: BCI Signal Acquisition, Artifact Filtering & Geometric Neural Alignment.
- Telemetry: Real-time SNR, Phase-Lock Value (PLV), Channel Impedance (<2.4 kΩ).
- Intent Decoded: Sensorimotor rhythm extraction & Alpha/Theta synchronization.

[POC 2] Misinformation & AI in Public Health (AI Fact-Checker)
- Logic: Semantic RAG Retrieval, MeSH entity extraction, PubMed/WHO validation.
- Trust Score: Dynamic scoring algorithm with peer-reviewed DOI citations.
- Safety: Cross-model Hallucination Detection & Consensus Variance Audit.

[POC 3] Climatizing Infrastructure (Green Retrofit Mapper)
- Logic: Geospatial climate zone modeling and building energy retrofit simulations.
- Analysis: Rooftop Solar PV generation (MWh/yr), Heat pump COP ROI payback period,
  annual metric tons CO2 avoided, and urban heat island mitigation.

3. CANDIDATE PROFILE & TECH STACK
--------------------------------------------------------------------------------
Mustafa Enes Kayacı
- Specialization: AI Systems, RAG Pipelines, Cloud Architecture (AWS/GCP), Geospatial.
- Roles Targeted: CTO / Technical Lead for multidisciplinary NYAS Sprint Teams.
- Contact: GitHub: https://github.com/MustafaEnes123 | LinkedIn: https://www.linkedin.com/in/mustafa-enes-kayaci/

================================================================================
Generated from The Living Blueprint MVP // NYAS 2026-2027
================================================================================
      `.trim();

      const blob = new Blob([dossierContent], { type: 'text/plain;charset=utf-8' });
      const url = URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.href = url;
      a.download = 'Mustafa_Enes_Kayaci_NYAS_Living_Blueprint_Dossier.txt';
      document.body.appendChild(a);
      a.click();
      document.body.removeChild(a);
      URL.revokeObjectURL(url);
    });
  }

  // ==========================================================================
  // Initialization
  // ==========================================================================
  document.addEventListener('DOMContentLoaded', () => {
    initMagneticElements();
    initNavigationSpy();
    initDossierExporter();

    // Console Easter Egg
    console.log(
      '%c✦ THE LIVING BLUEPRINT // NYAS 2026-2027 ✦\n%cCandidate: Mustafa Enes Kayacı | AI Engineer & Cloud Architect\nStatus: Ready for NYAS Sprint',
      'font-size: 14px; font-weight: bold; color: #B65434;',
      'font-size: 11px; color: #4B6B54; font-family: monospace;'
    );
  });

})();
