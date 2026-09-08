/**
 * The Living Blueprint - Tool 3: Climatizing Infrastructure (Green Retrofit Mapper)
 * Geo-spatial energy modeling, Leaflet map with custom earthy blueprint cartography,
 * dynamic ROI calculations, and interactive slider simulations.
 */

(function () {
  'use strict';

  // Preset Global Cities with geospatial climate metrics
  const CITIES = {
    newyork: {
      name: 'New York City, USA',
      coords: [40.7128, -74.0060],
      solarInsolation: 1420, // kWh/m²/yr
      baseCo2Grid: 0.38, // kg CO2/kWh
      climateZone: 'ASHRAE 4A (Mixed-Humid)',
      rebateProgram: 'NY-Sun Incentive + IRA 25C ($12,400 est.)',
      hvacPaybackBase: 4.8,
      heatIslandDelta: '+3.8°C'
    },
    istanbul: {
      name: 'Istanbul, Türkiye',
      coords: [41.0082, 28.9784],
      solarInsolation: 1680,
      baseCo2Grid: 0.44,
      climateZone: 'Mediterranean / Transitional',
      rebateProgram: 'EBRD Green Cities Facility + National EE Fund',
      hvacPaybackBase: 3.6,
      heatIslandDelta: '+4.2°C'
    },
    london: {
      name: 'London, UK',
      coords: [51.5074, -0.1278],
      solarInsolation: 1080,
      baseCo2Grid: 0.22,
      climateZone: 'Marine West Coast (Cfb)',
      rebateProgram: 'Boiler Upgrade Scheme (£7,500 grant)',
      hvacPaybackBase: 5.4,
      heatIslandDelta: '+2.9°C'
    },
    dubai: {
      name: 'Dubai, UAE',
      coords: [25.2048, 55.2708],
      solarInsolation: 2150,
      baseCo2Grid: 0.52,
      climateZone: 'Hot Arid Desert (BWh)',
      rebateProgram: 'Shams Dubai Net Metering Initiative',
      hvacPaybackBase: 2.9,
      heatIslandDelta: '+5.1°C'
    },
    tokyo: {
      name: 'Tokyo, Japan',
      coords: [35.6762, 139.6503],
      solarInsolation: 1390,
      baseCo2Grid: 0.41,
      climateZone: 'Humid Subtropical (Cfa)',
      rebateProgram: 'Tokyo Metropolitan Zero Emission Housing Subsidy',
      hvacPaybackBase: 4.2,
      heatIslandDelta: '+3.5°C'
    },
    berlin: {
      name: 'Berlin, Germany',
      coords: [52.5200, 13.4050],
      solarInsolation: 1120,
      baseCo2Grid: 0.34,
      climateZone: 'Temperate Continental',
      rebateProgram: 'KfW BEG Building Efficiency Grants (up to 45%)',
      hvacPaybackBase: 5.1,
      heatIslandDelta: '+2.7°C'
    }
  };

  let map = null;
  let activeMarker = null;
  let activeRadarCircle = null;
  let currentCityKey = 'newyork';

  // DOM Elements
  const mapElement = document.getElementById('retrofit-map');
  const cityPills = document.querySelectorAll('.city-pill');
  const cityNameEl = document.getElementById('report-city-name');
  const cityCoordsEl = document.getElementById('report-city-coords');
  const solarValEl = document.getElementById('rm-solar-val');
  const solarSubEl = document.getElementById('rm-solar-sub');
  const hvacValEl = document.getElementById('rm-hvac-val');
  const hvacSubEl = document.getElementById('rm-hvac-sub');
  const co2ValEl = document.getElementById('rm-co2-val');
  const rebateValEl = document.getElementById('rm-rebate-val');
  const heatIslandValEl = document.getElementById('rm-heat-val');

  // Sliders
  const areaSlider = document.getElementById('slider-floor-area');
  const areaDisplay = document.getElementById('val-floor-area');
  const insulationSlider = document.getElementById('slider-insulation');
  const insulationDisplay = document.getElementById('val-insulation');
  const netZeroSlider = document.getElementById('slider-netzero');
  const netZeroDisplay = document.getElementById('val-netzero');

  function initMap() {
    if (!mapElement || typeof L === 'undefined') return;

    const initialCity = CITIES[currentCityKey];
    
    // Initialize Leaflet Map
    map = L.map('retrofit-map', {
      center: initialCity.coords,
      zoom: 13,
      zoomControl: false,
      attributionControl: false
    });

    // Clean OpenStreetMap cartography tile layer (styled with earthy blueprint filter)
    L.tileLayer('https://tile.openstreetmap.org/{z}/{x}/{y}.png', {
      maxZoom: 19,
      attribution: '&copy; OpenStreetMap contributors'
    }).addTo(map);

    // Add minimal zoom controls on bottom right
    L.control.zoom({ position: 'bottomright' }).addTo(map);

    // Create marker
    updateMapFocus(currentCityKey, false);

    // Map click to set custom coordinates
    map.on('click', (e) => {
      const lat = e.latlng.lat.toFixed(4);
      const lng = e.latlng.lng.toFixed(4);
      
      cityNameEl.textContent = 'Custom Geo-Coordinate Analysis';
      cityCoordsEl.textContent = `${lat}° N, ${lng}° E // Custom Grid Node`;

      cityPills.forEach(p => p.classList.remove('active'));

      if (activeMarker) map.removeLayer(activeMarker);
      activeMarker = L.circleMarker([e.latlng.lat, e.latlng.lng], {
        radius: 8,
        color: '#B65434',
        fillColor: '#EFE8DC',
        fillOpacity: 1,
        weight: 3
      }).addTo(map);

      recalculateMetrics({
        name: 'Custom Location',
        solarInsolation: 1400 + (Math.abs(e.latlng.lat) % 20) * 25,
        baseCo2Grid: 0.35,
        hvacPaybackBase: 4.5,
        rebateProgram: 'Regional Clean Energy Fund / Municipal Tax Credit',
        heatIslandDelta: '+3.2°C'
      });

      if (window.AudioController) window.AudioController.playClick(620);
    });
  }

  function updateMapFocus(cityKey, animate = true) {
    const city = CITIES[cityKey];
    if (!city || !map) return;

    currentCityKey = cityKey;

    cityNameEl.textContent = city.name;
    cityCoordsEl.textContent = `${city.coords[0].toFixed(4)}° N, ${city.coords[1].toFixed(4)}° E // ${city.climateZone}`;

    if (animate) {
      map.flyTo(city.coords, 13, { duration: 1.4 });
    } else {
      map.setView(city.coords, 13);
    }

    // Marker
    if (activeMarker) map.removeLayer(activeMarker);
    activeMarker = L.circleMarker(city.coords, {
      radius: 9,
      color: '#4B6B54',
      fillColor: '#F6F3EC',
      fillOpacity: 1,
      weight: 3
    }).addTo(map);

    // Pulse / Radar Circle
    if (activeRadarCircle) map.removeLayer(activeRadarCircle);
    activeRadarCircle = L.circle(city.coords, {
      radius: 1200,
      color: 'rgba(75, 107, 84, 0.4)',
      fillColor: 'rgba(75, 107, 84, 0.08)',
      fillOpacity: 0.3,
      weight: 1.5,
      dashArray: '4, 4'
    }).addTo(map);

    recalculateMetrics(city);
  }

  function recalculateMetrics(city) {
    const area = parseFloat(areaSlider.value); // m²
    const insulationGrade = parseInt(insulationSlider.value); // 1 = Low (R-10), 2 = Mid (R-25), 3 = Passive (R-50)
    const targetYear = parseInt(netZeroSlider.value);

    // Solar Viability Calculation
    // Rooftop assumed to be ~40% of total multi-story floor area, panel efficiency 21%
    const roofArea = area * 0.42;
    const annualKwhSolar = (roofArea * (city.solarInsolation * 0.85) * 0.21);
    const solarMwh = (annualKwhSolar / 1000).toFixed(1);

    solarValEl.textContent = `${solarMwh} MWh/yr`;
    solarSubEl.textContent = `${(solarMwh * 0.14 * 1000).toLocaleString('en-US', { style: 'currency', currency: 'USD', maximumFractionDigits: 0 })} annual utility offset`;

    // HVAC Heat Pump Payback Calculation
    // Better insulation reduces HVAC load, shortening payback
    const insulationFactor = insulationGrade === 1 ? 1.2 : insulationGrade === 2 ? 0.95 : 0.72;
    const adjustedPayback = (city.hvacPaybackBase * insulationFactor).toFixed(1);
    hvacValEl.textContent = `${adjustedPayback} Years`;
    hvacSubEl.textContent = `COP 3.8 Seasonal Heat Pump (Saves ~${Math.round(42 * insulationFactor)}% thermal energy)`;

    // CO2 Emissions Avoided
    const co2AvoidedTons = ((annualKwhSolar * city.baseCo2Grid) / 1000 * 1.3).toFixed(1);
    co2ValEl.textContent = `${co2AvoidedTons} tCO₂e / yr`;

    // Rebate
    rebateValEl.textContent = city.rebateProgram;

    // Heat Island
    heatIslandValEl.textContent = `${city.heatIslandDelta} baseline (mitigated by -1.4°C with green roof)`;
  }

  // Slider Event Listeners
  if (areaSlider) {
    areaSlider.addEventListener('input', () => {
      areaDisplay.textContent = `${parseInt(areaSlider.value).toLocaleString()} m²`;
      recalculateMetrics(CITIES[currentCityKey] || CITIES.newyork);
    });
  }

  if (insulationSlider) {
    insulationSlider.addEventListener('input', () => {
      const val = parseInt(insulationSlider.value);
      const labels = ['Low (R-10 Legacy)', 'Standard (R-25 Code)', 'High-Performance (R-50 Passive)'];
      insulationDisplay.textContent = labels[val - 1];
      recalculateMetrics(CITIES[currentCityKey] || CITIES.newyork);
    });
  }

  if (netZeroSlider) {
    netZeroSlider.addEventListener('input', () => {
      netZeroDisplay.textContent = netZeroSlider.value;
      recalculateMetrics(CITIES[currentCityKey] || CITIES.newyork);
    });
  }

  // City preset pill clicks
  cityPills.forEach(pill => {
    pill.addEventListener('click', () => {
      cityPills.forEach(p => p.classList.remove('active'));
      pill.classList.add('active');

      const cityKey = pill.dataset.city;
      updateMapFocus(cityKey, true);

      if (window.AudioController) {
        window.AudioController.playClick(480);
        window.AudioController.triggerHapticShake();
      }
    });
  });

  // Delay map initialization slightly to ensure container dimensions
  setTimeout(initMap, 150);

})();
