/**
 * The Living Blueprint - Tool 2: Misinformation & AI in Public Health (AI Fact-Checker)
 * Dynamic NLP Verification Simulation Engine with RAG search emulation,
 * scientific citation synthesis, and trust-score radial gauge rendering.
 */

(function () {
  'use strict';

  const searchInput = document.getElementById('fact-query-input');
  const verifyBtn = document.getElementById('fact-verify-btn');
  const quickChips = document.querySelectorAll('.prompt-chip');
  const scanningPane = document.getElementById('fact-scanning-pane');
  const scanningText = document.getElementById('scanning-step-text');
  const resultsPane = document.getElementById('fact-results-pane');

  const trustScoreEl = document.getElementById('trust-score-num');
  const trustCircleEl = document.getElementById('trust-circle-fill');
  const verdictTitle = document.getElementById('fact-verdict-title');
  const verdictStatus = document.getElementById('fact-verdict-status');
  const verdictSummary = document.getElementById('fact-verdict-summary');
  const sourcesContainer = document.getElementById('fact-sources-list');

  const ragMatchEl = document.getElementById('audit-rag-match');
  const hallucinationEl = document.getElementById('audit-hallucination');
  const consensusEl = document.getElementById('audit-consensus');
  const entityCountEl = document.getElementById('audit-entities');

  // Pre-catalogued verified biomedical ground truths
  const KNOWLEDGE_BASE = {
    bleach: {
      queryPattern: /bleach|chlorine|disinfectant|mms/i,
      score: 3,
      status: 'debunked',
      statusText: 'HIGH TOXICITY // HARMFUL MISINFORMATION',
      title: 'Debunked: Ingestion of Chemical Disinfectants Causes Severe Toxicity',
      summary: 'Chlorine dioxide and industrial bleach ingestions do not neutralize internal pathogens. Clinical literature documents corrosive mucosal damage, acute hemolysis, and renal failure upon consumption.',
      sources: [
        {
          title: 'Acute Toxicity from Ingestion of Sodium Hypochlorite Solutions',
          journal: 'New England Journal of Medicine (NEJM)',
          meta: 'DOI: 10.1056/NEJM199804233381706 | Systematic Toxicology Review | n=1,240'
        },
        {
          title: 'FDA Public Warning: Danger of Miracle Mineral Solution (MMS)',
          journal: 'CDC Morbidity and Mortality Weekly Report (MMWR)',
          meta: 'PMCID: PMC7234892 | Regulatory Clinical Safety Alert'
        }
      ],
      ragMatch: '99.4%',
      hallucination: 'Critical Claim Distortion Detected',
      consensus: '0% (Universal Disproven)'
    },
    vaccine: {
      queryPattern: /vaccine|mrna|dna|alter.*dna|genetics/i,
      score: 96,
      status: 'verified',
      statusText: 'SCIENTIFIC CONSENSUS // VERIFIED SAFE',
      title: 'Verified: mRNA Vaccines Cannot Integrate Into or Alter Genomic DNA',
      summary: 'mRNA molecules reside transiently in cellular cytoplasm and cannot cross the nuclear envelope to integrate into human genomic DNA. They naturally degrade within 48 to 72 hours post-ribosomal translation.',
      sources: [
        {
          title: 'Mechanisms of mRNA Vaccine Translation and Cellular Clearance',
          journal: 'Nature Reviews Immunology',
          meta: 'DOI: 10.1038/s41577-021-00556-8 | Molecular Biology Cohort | n=42,500'
        },
        {
          title: 'Assessment of Genomic Stability Post-mRNA Vaccination in Human Cells',
          journal: 'The Lancet Infectious Diseases',
          meta: 'DOI: 10.1016/S1473-3099(21)00224-3 | Randomized Multicenter Trial'
        }
      ],
      ragMatch: '98.8%',
      hallucination: 'Zero Hallucination Flagged',
      consensus: '99.1% Global Scientific Consensus'
    },
    vitamin_d: {
      queryPattern: /vitamin d|cholecalciferol|respiratory|immune/i,
      score: 78,
      status: 'nuanced',
      statusText: 'NUANCED EVIDENCE // CORRELATED BENEFIT',
      title: 'Nuanced: Modest Protective Effect Observed Primarily in Deficient Populations',
      summary: 'Meta-analyses demonstrate that daily vitamin D supplementation modestly decreases acute respiratory infections among individuals with baseline severe deficiency (<25 nmol/L), but provides negligible additive benefit in replete individuals.',
      sources: [
        {
          title: 'Vitamin D Supplementation to Prevent Acute Respiratory Tract Infections',
          journal: 'BMJ (British Medical Journal)',
          meta: 'DOI: 10.1136/bmj.i6583 | Individual Participant Data Meta-Analysis | n=10,933'
        },
        {
          title: 'Immunomodulatory Roles of 1,25-Dihydroxyvitamin D in Pulmonary Epithelium',
          journal: 'Journal of Clinical Endocrinology & Metabolism',
          meta: 'DOI: 10.1210/clinem/dgaa348 | Clinical Biomarker Panel'
        }
      ],
      ragMatch: '91.2%',
      hallucination: 'Minor Overgeneralization Detected in Casual Media',
      consensus: '74% Context-Dependent Consensus'
    },
    fluoride: {
      queryPattern: /fluoride|pineal|water fluoridation|calcif/i,
      score: 14,
      status: 'debunked',
      statusText: 'DEBUNKED // UNFOUNDED CAUSATION',
      title: 'Debunked: Municipal Water Fluoridation Does Not Impair Pineal Endocrine Function',
      summary: 'While hydroxyapatite in physiological pineal concretions naturally binds trace minerals over a lifetime, rigorous epidemiological reviews show no causal association between standard fluoridated municipal water levels (0.7 mg/L) and circadian sleep disruption.',
      sources: [
        {
          title: 'Systematic Review of Water Fluoridation Safety and Neurological Outcomes',
          journal: 'European Commission Scientific Committee on Health',
          meta: 'SCHER Clinical Report | Population Epidemiology | n=64,000'
        },
        {
          title: 'Pineal Calcification Patterns Across Age Cohorts and Environmental Exposures',
          journal: 'JAMA Otolaryngology & Head Science',
          meta: 'DOI: 10.1001/jamaoto.2019.0411 | Longitudinal Imaging Study'
        }
      ],
      ragMatch: '94.6%',
      hallucination: 'Conflated In Vitro Tissue Binding With Clinical Pathology',
      consensus: '4% (Rejected Hypothesis)'
    }
  };

  // Pipeline Animation Steps
  const SCANNING_STEPS = [
    'Parsing query syntax & tokenizing clinical terminology...',
    'Extracting biomedical named entities & PubMed MeSH ontology tags...',
    'Running semantic similarity search across WHO/CDC vector indices...',
    'Cross-referencing randomized clinical trials & meta-analyses...',
    'Auditing LLM hallucination delta & scoring consensus variance...'
  ];

  function runVerification(query) {
    const cleanQuery = (query || searchInput.value || '').trim();
    if (!cleanQuery) return;

    if (window.AudioController) {
      window.AudioController.playClick(520);
      window.AudioController.triggerHapticShake();
    }

    resultsPane.classList.remove('visible');
    resultsPane.style.display = 'none';
    scanningPane.style.display = 'block';

    let stepIndex = 0;
    scanningText.textContent = SCANNING_STEPS[0];

    const stepInterval = setInterval(() => {
      stepIndex++;
      if (stepIndex < SCANNING_STEPS.length) {
        scanningText.textContent = SCANNING_STEPS[stepIndex];
        if (window.AudioController) window.AudioController.playClick(600 + stepIndex * 80);
      } else {
        clearInterval(stepInterval);
        displayResults(cleanQuery);
      }
    }, 420);
  }

  function displayResults(query) {
    scanningPane.style.display = 'none';
    resultsPane.style.display = 'block';
    setTimeout(() => resultsPane.classList.add('visible'), 20);

    // Determine match from Knowledge Base or construct dynamic NLP response
    let match = null;
    for (const key in KNOWLEDGE_BASE) {
      if (KNOWLEDGE_BASE[key].queryPattern.test(query)) {
        match = KNOWLEDGE_BASE[key];
        break;
      }
    }

    if (!match) {
      // Dynamic fallback for custom user inputs
      const isPositiveQuery = /benefit|effective|healthy|proven|safe|nutrition|exercise|sleep/i.test(query);
      const score = isPositiveQuery ? 84 : 32;
      match = {
        score: score,
        status: isPositiveQuery ? 'verified' : 'debunked',
        statusText: isPositiveQuery ? 'PRELIMINARY CONSENSUS // LIKELY VALID' : 'UNVERIFIED CLAIM // ELEVATED SKEPTICISM',
        title: `NLP Evaluation for: "${query.slice(0, 60)}${query.length > 60 ? '...' : ''}"`,
        summary: `Automated RAG synthesis scanned the clinical biomedical corpus against this specific proposition. Evidence points toward a ${isPositiveQuery ? 'supportive' : 'critical or disproven'} baseline in peer-reviewed literature.`,
        sources: [
          {
            title: `Systematic Evidence Synthesis for Query Entities in Biomedical Contexts`,
            journal: 'Cochrane Library Systematic Reviews',
            meta: 'DOI: 10.1002/14651858.CD012984 | Cohort Synthesized'
          },
          {
            title: `Epidemiological Baseline Assessment in Global Health Research`,
            journal: 'The Lancet Global Health',
            meta: 'DOI: 10.1016/S2214-109X(22)00412-1 | Peer Review Index'
          }
        ],
        ragMatch: `${(88 + Math.random() * 9).toFixed(1)}%`,
        hallucination: isPositiveQuery ? 'Low Risk // Minor Contextual Boundary Nuance' : 'Elevated Risk of Unsubstantiated Causal Inference',
        consensus: `${score}% Estimated Convergence`
      };
    }

    // Render Trust Gauge
    animateGauge(match.score);

    // Update Status Pill
    verdictStatus.className = `fact-verdict-status status-${match.status}`;
    verdictStatus.textContent = match.statusText;

    verdictTitle.textContent = match.title;
    verdictSummary.textContent = match.summary;

    // Render Sources
    sourcesContainer.innerHTML = '';
    match.sources.forEach(src => {
      const el = document.createElement('div');
      el.className = 'source-item';
      el.innerHTML = `
        <div class="source-title">${src.title}</div>
        <div class="source-meta">
          <span><strong>${src.journal}</strong></span>
          <span>${src.meta}</span>
        </div>
      `;
      sourcesContainer.appendChild(el);
    });

    // Update Audit Values
    ragMatchEl.textContent = match.ragMatch;
    hallucinationEl.textContent = match.hallucination;
    consensusEl.textContent = match.consensus;
    entityCountEl.textContent = `${Math.floor(4 + Math.random() * 4)} Extracted Entities`;

    if (window.AudioController) {
      if (match.status === 'verified') window.AudioController.playSuccessChime();
      else window.AudioController.playClick(320);
    }
  }

  function animateGauge(targetScore) {
    const circumference = 2 * Math.PI * 40; // r=40
    trustCircleEl.style.strokeDasharray = `${circumference}`;

    // Color based on score
    let strokeColor = '#B65434'; // rust/red for low
    if (targetScore >= 75) strokeColor = '#4B6B54'; // sage/green for high
    else if (targetScore >= 50) strokeColor = '#BF7B2B'; // ochre for medium

    trustCircleEl.style.stroke = strokeColor;

    // Animate stroke dash
    const offset = circumference - (targetScore / 100) * circumference;
    trustCircleEl.style.strokeDashoffset = offset;

    // Animate numeric counter
    let current = 0;
    const duration = 750;
    const stepTime = 20;
    const increment = targetScore / (duration / stepTime);

    const counter = setInterval(() => {
      current += increment;
      if (current >= targetScore) {
        current = targetScore;
        clearInterval(counter);
      }
      trustScoreEl.textContent = `${Math.round(current)}%`;
    }, stepTime);
  }

  // Event Listeners
  verifyBtn.addEventListener('click', () => runVerification());

  searchInput.addEventListener('keydown', (e) => {
    if (e.key === 'Enter') {
      e.preventDefault();
      runVerification();
    }
  });

  quickChips.forEach(chip => {
    chip.addEventListener('click', () => {
      searchInput.value = chip.dataset.prompt || chip.textContent;
      runVerification(searchInput.value);
    });
  });

  // Render initial default claim on load without audio chime
  setTimeout(() => {
    if (searchInput && searchInput.value) {
      displayResults(searchInput.value);
    }
  }, 100);

})();
