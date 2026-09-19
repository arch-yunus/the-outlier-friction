// The Outlier Friction — Interactive Web Platform Engine

// State Management
const SimState = {
  running: false,
  step: 0,
  maxSteps: 60,
  speed: 250, // ms per step
  timer: null,
  
  // Model Parameters
  agentsCount: 16,
  conformity: 0.8,
  envy: 0.7,
  delta: 0.9,
  scenario: 'academic',

  // Simulation Entities
  agents: [],
  links: [],
  history: [],
  pulses: []
};

// Monograph Data (TR / EN)
const MonographContent = {
  tr: `
    <h2>1. Prolegomena: Kapalı Havza Sendromu</h2>
    <p>Üniversite amfileri, enstitü atölyeleri, staj ekipleri veya departman koridorları açık birer serbest pazar değildir. Bu yapılar; üyelerinin günün büyük bölümünü aynı fiziksel sınırda geçirdiği, kaçış rotalarının kısıtlı olduğu, coğrafi ve sosyal sınırları tahkim edilmiş <strong>yüksek sürtünmeli mikro-havzalardır</strong>.</p>
    <p>Böyle ortamlarda liyakat veya teknik yetkinlik her zaman kurucu değer işlevi görmez. Çoğu zaman belirleyici olan, grubun zımni (tacit) olarak mutabık kaldığı "ortalama konfor seviyesi"dir.</p>
    <blockquote>"Outlier'ın varlığı nötr bir olgu olarak kalmaz; grubun kendi tembelliğini, yetersizliğini ve durağanlığını görünür kılan canlı bir ayna işlevi görür. Ayna kırılmak istenmez; aynayı tutan tasfiye edilir."</blockquote>

    <h2>2. Sosyolojik Altyapı: Sınır Bekçiliği ve Kurbanın İşlevi</h2>
    <p>Topluluklar sınırlarını kurallarla değil, cezalandırdıkları kurbanlarla çizer. Sosyolojik açıdan sapkınlık (deviance), grubun kendi ahlakını ve aidiyetini tescil ettiği kurucu bir ritüeldir.</p>
    <blockquote>"Sapkınlık olmasaydı, toplumun ahlaki bilinci körelirdi. Bir eylemin kınanması, grubun neyi doğru kabul ettiğini hatırlamasını sağlar."<br>— <strong>Émile Durkheim</strong> (1895)</blockquote>

    <h2>3. Sosyal Psikolojik İnfaz: Kara Koyun Dinamiği</h2>
    <p>Sosyal Kimlik Kuramı uyarınca iç-grup sapkınları, dış-gruptaki benzer bireylere kıyasla çok daha sert yargılarla cezalandırılır. Dışarıdan birinin standartları ihlal etmesi önemsizdir; ancak 'bizden biri' ihlal ettiğinde bu doğrudan grubun kimliksel bütünlüğüne bir tehdit olarak algılanır.</p>

    <h2>4. İletişimsel İmha Protokolü: Stanley Schachter Modeli</h2>
    <p>Grup, çoğunluk görüşüne meydan okuyan sapkın üyeye başlangıçta muazzam bir iletişim enerjisi yöneltir. Ancak üyenin tutumunu değiştirmeyeceği anlaşıldığı anda iletişim bıçak gibi kesilir: Birey psikolojik olarak terk edilir ve yok sayılır.</p>

    <h2>5. Sessiz Şiddetin Biyolojisi: Ostracism ve Nörolojik İmha</h2>
    <p>fMRI verileri, birey sosyal olarak dışlandığında ve görmezden gelindiğinde beynin dorsal anterior singulat korteks (dACC) bölgesinin aktive olduğunu göstermektedir. Bu bölge, fiziksel travmanın duyusal acısını işleyen merkezdir. İnsan beyni sosyal dışlama ile fiziksel darbe arasında nörolojik bir ayrım gözetmez (Eisenberger et al., 2003).</p>
  `,
  en: `
    <h2>1. Prolegomena: The Closed Basin Syndrome</h2>
    <p>University lecture halls, graduate workshops, and corporate department corridors do not function as open meritocracies. They operate as <strong>high-friction micro-basins</strong> where members spend significant time confined within identical structural perimeters with limited immediate exit avenues.</p>
    <p>In such environments, merit or intellectual rigor does not automatically govern. The default equilibrium is the tacit consensus on an "average comfort level".</p>
    <blockquote>"The presence of the outlier is never neutral; it acts as a mirror reflecting the collective lethargy of the group. The group does not wish to shatter the mirror; it liquidates the one holding it."</blockquote>

    <h2>2. Sociological Foundations: Boundary Maintenance</h2>
    <p>Collectives establish boundaries not by abstract laws, but through the sacrificial victims they penalize. Deviance is an indispensable condition for social cohesion (Durkheim, 1895; Erikson, 1966).</p>

    <h2>3. Social-Psychological Execution: The Black Sheep Effect</h2>
    <p>Ingroup deviants are evaluated and punished far more severely than comparable outgroup deviants. Internal non-conformity threatens the perceived moral integrity and uniformity of the collective (Marques et al., 1988).</p>

    <h2>4. Communicative Liquidation: The Stanley Schachter Model</h2>
    <p>Upon detecting deviance, the group unleashes an immense surge of communication aimed at persuasion. Once non-compliance is confirmed, communication collapses to zero: the target is psychologically excised.</p>

    <h2>5. The Biology of Silent Violence: Ostracism & dACC Activation</h2>
    <p>Functional MRI data demonstrates that social ostracism activates the dorsal anterior cingulate cortex (dACC)—the exact hub processing physical pain. The nervous system makes no distinction between social rejection and physical injury (Eisenberger et al., 2003).</p>
  `
};

const OFI_Questions = [
  { id: 1, text: "Do peers make sarcastic remarks or backhanded jokes when you work outside standard expectations?" },
  { id: 2, text: "Is there an unspoken consensus to exert only the bare minimum required effort?" },
  { id: 3, text: "Have you noticed conversations abruptly pausing or whispering when you enter a room?" },
  { id: 4, text: "Are project opportunities, tools, or information channels withheld informally?" },
  { id: 5, text: "When you address tensions, are you told 'You are being oversensitive / It is all in your head'?" },
  { id: 6, text: "Does striving for higher quality lead to peer friction rather than shared enthusiasm?" },
  { id: 7, text: "Is the community socially and physically closed (high structural barrier to exit)?" },
  { id: 8, text: "Do peers express solidarity when someone slacks, but hostility when someone excels?" },
  { id: 9, text: "Do you feel an urge to downplay or hide your achievements to avoid conflict?" },
  { id: 10, text: "Have you experienced sudden collective silence (ostracism) following intellectual disagreement?" }
];

// Initialize Simulation Entities
function initSimulation() {
  SimState.step = 0;
  SimState.agents = [];
  SimState.links = [];
  SimState.history = [];
  SimState.pulses = [];

  const canvas = document.getElementById('simCanvas');
  const width = canvas.width;
  const height = canvas.height;
  const centerX = width / 2;
  const centerY = height / 2;

  // 1. Create Outlier (Index 0)
  SimState.agents.push({
    id: 0,
    name: "Outlier",
    isOutlier: true,
    x: centerX,
    y: centerY,
    vx: 0,
    vy: 0,
    radius: 12,
    daccStress: 0,
    state: 'integrated',
    resilience: 0.8
  });

  // 2. Create Peer Agents in Orbit
  const nPeers = SimState.agentsCount - 1;
  const orbitRadius = Math.min(width, height) * 0.35;

  for (let i = 1; i <= nPeers; i++) {
    const angle = ((i - 1) / nPeers) * 2 * Math.PI;
    const x = centerX + Math.cos(angle) * orbitRadius + (Math.random() - 0.5) * 20;
    const y = centerY + Math.sin(angle) * orbitRadius + (Math.random() - 0.5) * 20;

    SimState.agents.push({
      id: i,
      name: `Peer_${i}`,
      isOutlier: false,
      x: x,
      y: y,
      vx: 0,
      vy: 0,
      radius: 8,
      conformity: SimState.conformity,
      envy: SimState.envy,
      state: 'integrated'
    });
  }

  // 3. Initialize High Initial Connectivity
  for (let i = 0; i < SimState.agents.length; i++) {
    for (let j = i + 1; j < SimState.agents.length; j++) {
      SimState.links.push({
        source: i,
        target: j,
        active: true,
        isOutlierLink: (i === 0 || j === 0),
        weight: 1.0
      });
    }
  }

  updateTelemetryUI();
  drawSimulation();
  drawCharts();
}

// Step Simulation
function stepSimulation() {
  if (SimState.step >= SimState.maxSteps) {
    pauseSimulation();
    return;
  }

  SimState.step++;
  const step = SimState.step;
  const outlier = SimState.agents[0];

  // Determine Phase
  let phaseName = "Phase 1: Radar";
  let phaseClass = "phase-1";
  let commMultiplier = 1.0;

  if (step < 10) {
    phaseName = "Phase 1: Radar";
    phaseClass = "phase-1";
    outlier.state = "questioned";
    commMultiplier = 1.0 + (step * 0.25 * SimState.conformity);
  } else if (step < 22) {
    phaseName = "Phase 2: Ridicule";
    phaseClass = "phase-2";
    outlier.state = "ridiculed";
    // Peak Schachter pressure
    commMultiplier = 3.2 * Math.exp(-0.06 * (step - 10));
  } else if (step < 36) {
    phaseName = "Phase 3: Cabal";
    phaseClass = "phase-3";
    outlier.state = "conspired_against";
    // Decaying communication
    commMultiplier = 2.0 * Math.exp(-0.14 * (step - 22));
  } else if (step < 50) {
    phaseName = "Phase 4: Isolation";
    phaseClass = "phase-4";
    outlier.state = "ostracized";
    commMultiplier = 0.0; // Total communicative cutoff
  } else {
    phaseName = "Phase 5: Liquidation (Exit)";
    phaseClass = "phase-5";
    outlier.state = "exited";
    commMultiplier = 0.0;
  }

  // Update Links & Prune Outlier Links during Ostracism
  if (step >= 36) {
    SimState.links.forEach(link => {
      if (link.isOutlierLink) {
        link.active = false;
      }
    });
  }

  // Generate Communication Pulses along active links
  if (commMultiplier > 0.1) {
    SimState.links.forEach(link => {
      if (link.active && link.isOutlierLink && Math.random() < 0.6) {
        SimState.pulses.push({
          source: link.source,
          target: link.target,
          progress: 0,
          speed: 0.05 + Math.random() * 0.05
        });
      }
    });
  }

  // Calculate dACC Stress Accumulation
  const isolationRatio = step >= 36 ? 1.0 : (step > 22 ? (step - 22) / 14 : 0.0);
  const rawPain = (isolationRatio * 0.7 + SimState.envy * 0.3) * (1.1 - outlier.resilience * 0.5);
  outlier.daccStress = Math.min(10.0, outlier.daccStress * 0.88 + rawPain * 1.8);

  // Record History for Charts
  SimState.history.push({
    step: step,
    phase: phaseName,
    comm: commMultiplier * (SimState.agentsCount - 1),
    dacc: outlier.daccStress,
    activeLinks: SimState.links.filter(l => l.active).length
  });

  // UI Badges Update
  const badge = document.getElementById('current-phase-badge');
  badge.textContent = phaseName;
  badge.className = `badge-phase ${phaseClass}`;

  updateTelemetryUI();
  drawSimulation();
  drawCharts();
}

// Physics & Animation Loop
function updatePhysics() {
  const canvas = document.getElementById('simCanvas');
  const width = canvas.width;
  const height = canvas.height;
  const centerX = width / 2;
  const centerY = height / 2;

  // Repulsion between all nodes
  for (let i = 0; i < SimState.agents.length; i++) {
    for (let j = i + 1; j < SimState.agents.length; j++) {
      const a = SimState.agents[i];
      const b = SimState.agents[j];
      const dx = b.x - a.x;
      const dy = b.y - a.y;
      const dist = Math.sqrt(dx * dx + dy * dy) || 1;
      const force = 120 / (dist * dist);
      const fx = (dx / dist) * force;
      const fy = (dy / dist) * force;

      a.vx -= fx;
      a.vy -= fy;
      b.vx += fx;
      b.vy += fy;
    }
  }

  // Spring forces along active links
  SimState.links.forEach(l => {
    if (!l.active) return;
    const a = SimState.agents[l.source];
    const b = SimState.agents[l.target];
    const dx = b.x - a.x;
    const dy = b.y - a.y;
    const dist = Math.sqrt(dx * dx + dy * dy) || 1;
    const targetDist = l.isOutlierLink ? 140 : 80;
    const springForce = (dist - targetDist) * 0.008;

    const fx = (dx / dist) * springForce;
    const fy = (dy / dist) * springForce;

    a.vx += fx;
    a.vy += fy;
    b.vx -= fx;
    b.vy -= fy;
  });

  // Center Gravity & Boundary
  SimState.agents.forEach(a => {
    // If outlier is exited, push far away to bottom right
    if (a.state === 'exited') {
      a.vx += (width * 0.9 - a.x) * 0.05;
      a.vy += (height * 0.9 - a.y) * 0.05;
    } else {
      const dx = centerX - a.x;
      const dy = centerY - a.y;
      a.vx += dx * 0.002;
      a.vy += dy * 0.002;
    }

    a.vx *= 0.85; // Damping
    a.vy *= 0.85;
    a.x += a.vx;
    a.y += a.vy;

    // Bounds containment
    const pad = 30;
    a.x = Math.max(pad, Math.min(width - pad, a.x));
    a.y = Math.max(pad, Math.min(height - pad, a.y));
  });

  // Update communication pulses
  for (let i = SimState.pulses.length - 1; i >= 0; i--) {
    const p = SimState.pulses[i];
    p.progress += p.speed;
    if (p.progress >= 1.0) {
      SimState.pulses.splice(i, 1);
    }
  }
}

// Canvas Rendering
function drawSimulation() {
  const canvas = document.getElementById('simCanvas');
  const ctx = canvas.getContext('2d');
  const width = canvas.width;
  const height = canvas.height;

  ctx.clearRect(0, 0, width, height);

  // 1. Draw Links
  SimState.links.forEach(l => {
    const a = SimState.agents[l.source];
    const b = SimState.agents[l.target];

    ctx.beginPath();
    ctx.moveTo(a.x, a.y);
    ctx.lineTo(b.x, b.y);

    if (l.active) {
      if (l.isOutlierLink) {
        ctx.strokeStyle = 'rgba(245, 158, 11, 0.45)';
        ctx.lineWidth = 1.5;
      } else {
        ctx.strokeStyle = 'rgba(59, 130, 246, 0.2)';
        ctx.lineWidth = 1.0;
      }
    } else {
      if (l.isOutlierLink) {
        ctx.strokeStyle = 'rgba(239, 68, 68, 0.15)';
        ctx.lineWidth = 1.0;
        ctx.setLineDash([4, 4]);
      } else {
        return;
      }
    }

    ctx.stroke();
    ctx.setLineDash([]);
  });

  // 2. Draw Pulses
  SimState.pulses.forEach(p => {
    const a = SimState.agents[p.source];
    const b = SimState.agents[p.target];
    const px = a.x + (b.x - a.x) * p.progress;
    const py = a.y + (b.y - a.y) * p.progress;

    ctx.beginPath();
    ctx.arc(px, py, 3.5, 0, Math.PI * 2);
    ctx.fillStyle = '#f59e0b';
    ctx.shadowColor = '#f59e0b';
    ctx.shadowBlur = 8;
    ctx.fill();
    ctx.shadowBlur = 0;
  });

  // 3. Draw Agents
  SimState.agents.forEach(a => {
    ctx.beginPath();
    ctx.arc(a.x, a.y, a.radius, 0, Math.PI * 2);

    if (a.isOutlier) {
      if (a.state === 'exited') {
        ctx.fillStyle = '#64748b';
        ctx.strokeStyle = '#ef4444';
      } else if (a.state === 'ostracized') {
        ctx.fillStyle = '#ef4444';
        ctx.strokeStyle = '#f59e0b';
        ctx.shadowColor = '#ef4444';
        ctx.shadowBlur = 12;
      } else {
        ctx.fillStyle = '#f59e0b';
        ctx.strokeStyle = '#ffffff';
        ctx.shadowColor = '#f59e0b';
        ctx.shadowBlur = 10;
      }
      ctx.lineWidth = 2.5;
    } else {
      ctx.fillStyle = '#3b82f6';
      ctx.strokeStyle = 'rgba(255, 255, 255, 0.2)';
      ctx.lineWidth = 1.5;
      ctx.shadowBlur = 0;
    }

    ctx.fill();
    ctx.stroke();
    ctx.shadowBlur = 0;

    // Label
    ctx.font = '10px Fira Code';
    ctx.fillStyle = a.isOutlier ? '#f59e0b' : '#94a3b8';
    ctx.textAlign = 'center';
    ctx.fillText(a.name, a.x, a.y + a.radius + 12);
  });
}

// Telemetry & Charts
function updateTelemetryUI() {
  document.getElementById('step-counter').textContent = SimState.step;
  const activeCount = SimState.links.filter(l => l.active).length;
  document.getElementById('edge-counter').textContent = activeCount;
}

function drawCharts() {
  drawMiniChart('chartSchachter', SimState.history.map(h => h.comm), '#f59e0b', 'Comm Intensity');
  drawMiniChart('chartDacc', SimState.history.map(h => h.dacc), '#ef4444', 'dACC Pain (0-10)', 10);
}

function drawMiniChart(canvasId, data, color, label, fixedMax = null) {
  const canvas = document.getElementById(canvasId);
  const ctx = canvas.getContext('2d');
  const w = canvas.width;
  const h = canvas.height;

  ctx.clearRect(0, 0, w, h);

  if (data.length < 2) return;

  const max = fixedMax !== null ? fixedMax : Math.max(...data, 5);
  const stepX = w / (SimState.maxSteps - 1);

  ctx.beginPath();
  ctx.strokeStyle = color;
  ctx.lineWidth = 2;

  data.forEach((val, i) => {
    const x = i * stepX;
    const y = h - (val / max) * (h - 10) - 5;
    if (i === 0) ctx.moveTo(x, y);
    else ctx.lineTo(x, y);
  });

  ctx.stroke();

  // Subtle gradient fill under curve
  ctx.lineTo((data.length - 1) * stepX, h);
  ctx.lineTo(0, h);
  ctx.closePath();
  ctx.fillStyle = color.replace(')', ', 0.15)').replace('rgb', 'rgba');
  ctx.fill();
}

// Simulation Playback Controls
function playSimulation() {
  if (SimState.running) return;
  SimState.running = true;
  document.getElementById('btn-play').textContent = '❚❚ Pause';
  SimState.timer = setInterval(() => {
    stepSimulation();
  }, SimState.speed);
}

function pauseSimulation() {
  SimState.running = false;
  document.getElementById('btn-play').textContent = '▶ Run';
  clearInterval(SimState.timer);
}

function resetSimulation() {
  pauseSimulation();
  initSimulation();
}

// Preset Scenario Handler
function applyScenario(type) {
  SimState.scenario = type;
  if (type === 'academic') {
    SimState.conformity = 0.85;
    SimState.envy = 0.80;
    SimState.delta = 0.95;
  } else if (type === 'corporate') {
    SimState.conformity = 0.90;
    SimState.envy = 0.65;
    SimState.delta = 0.70;
  } else if (type === 'creative') {
    SimState.conformity = 0.60;
    SimState.envy = 0.90;
    SimState.delta = 1.10;
  } else if (type === 'meritocratic') {
    SimState.conformity = 0.35;
    SimState.envy = 0.30;
    SimState.delta = 0.85;
  }

  // Update slider UI
  document.getElementById('param-conformity').value = SimState.conformity;
  document.getElementById('val-conformity').textContent = SimState.conformity.toFixed(2);
  document.getElementById('param-envy').value = SimState.envy;
  document.getElementById('val-envy').textContent = SimState.envy.toFixed(2);
  document.getElementById('param-delta').value = SimState.delta;
  document.getElementById('val-delta').textContent = SimState.delta.toFixed(2);

  resetSimulation();
}

// Game Theory Calculator Update
function updateGameTheoryMatrix() {
  const a = parseFloat(document.getElementById('gt-param-a').value);
  const r = parseFloat(document.getElementById('gt-param-r').value);
  const c = parseFloat(document.getElementById('gt-param-c').value);
  const p = parseFloat(document.getElementById('gt-param-p').value);
  const e = parseFloat(document.getElementById('gt-param-e').value);

  document.getElementById('gt-val-a').textContent = a.toFixed(1);
  document.getElementById('gt-val-r').textContent = r.toFixed(1);
  document.getElementById('gt-val-c').textContent = c.toFixed(1);
  document.getElementById('gt-val-p').textContent = p.toFixed(1);
  document.getElementById('gt-val-e').textContent = e.toFixed(1);

  // Payoffs
  const cc = [a, a];
  const cs = [a - e, r - c - p];
  const sc = [r - c - p, a - e];
  const ss = [r - c, r - c];

  document.getElementById('cell-cc').innerHTML = `<span class="payoff-p1">$a = ${cc[0].toFixed(1)}$</span>, <span class="payoff-p2">$a = ${cc[1].toFixed(1)}$</span><div class="cell-label">Mediocrity Trap</div>`;
  document.getElementById('cell-cs').innerHTML = `<span class="payoff-p1">$a - e = ${cs[0].toFixed(1)}$</span>, <span class="payoff-p2">$r - c - p = ${cs[1].toFixed(1)}$</span><div class="cell-label">Punished Outlier</div>`;
  document.getElementById('cell-sc').innerHTML = `<span class="payoff-p1">$r - c - p = ${sc[0].toFixed(1)}$</span>, <span class="payoff-p2">$a - e = ${sc[1].toFixed(1)}$</span><div class="cell-label">Peer Friction</div>`;
  document.getElementById('cell-ss').innerHTML = `<span class="payoff-p1">$r - c = ${ss[0].toFixed(1)}$</span>, <span class="payoff-p2">$r - c = ${ss[1].toFixed(1)}$</span><div class="cell-label">Collective Excellence</div>`;

  // Highlight Nash
  document.getElementById('cell-cc').classList.toggle('highlight-nash', cc[0] >= sc[0] && cc[1] >= cs[1]);
  document.getElementById('cell-ss').classList.toggle('highlight-nash', ss[0] >= cs[0] && ss[1] >= sc[1]);
}

// OFI Questionnaire Initialization
function initOFI() {
  const container = document.getElementById('questions-container');
  container.innerHTML = '';

  OFI_Questions.forEach(q => {
    const div = document.createElement('div');
    div.className = 'ofi-question-item';
    div.innerHTML = `
      <div class="ofi-q-text">${q.id}. ${q.text}</div>
      <div class="rating-bar" data-qid="${q.id}">
        ${[1, 2, 3, 4, 5].map(v => `<button type="button" class="rating-btn ${v === 3 ? 'active' : ''}" data-val="${v}">${v}</button>`).join('')}
      </div>
    `;
    container.appendChild(div);
  });

  // Attach rating click listeners
  container.addEventListener('click', (e) => {
    if (e.target.classList.contains('rating-btn')) {
      const parent = e.target.parentElement;
      parent.querySelectorAll('.rating-btn').forEach(b => b.classList.remove('active'));
      e.target.classList.add('active');
    }
  });

  document.getElementById('btn-calc-ofi').addEventListener('click', calculateOFI);
}

function calculateOFI() {
  const buttons = document.querySelectorAll('.rating-btn.active');
  let total = 0;
  buttons.forEach(b => {
    total += parseInt(b.getAttribute('data-val'), 10);
  });

  const display = document.getElementById('ofi-score-display');
  const statusDisplay = document.getElementById('ofi-status-display');
  const strategyText = document.getElementById('ofi-strategy-text');
  const circle = document.getElementById('score-circle');

  display.textContent = total;

  if (total < 20) {
    statusDisplay.textContent = "Low Friction (Healthy Open Environment)";
    statusDisplay.style.color = "var(--accent-emerald)";
    circle.style.borderColor = "var(--accent-emerald)";
    strategyText.innerHTML = "<strong>Status:</strong> Your environment has minimal horizontal hostility. Continue proactive collaboration and exercise open 'Voice' to resolve friction.";
  } else if (total < 32) {
    statusDisplay.textContent = "Moderate Friction (Latent Envy & Conformity Pressure)";
    statusDisplay.style.color = "var(--accent-gold)";
    circle.style.borderColor = "var(--accent-gold)";
    strategyText.innerHTML = "<strong>Status:</strong> Unspoken mediocrity norms exist. <em>Counter-Strategy:</em> Maintain tactical distance; avoid disclosing work in progress; form external alliances.";
  } else if (total < 42) {
    statusDisplay.textContent = "Severe Peer Mobbing & Lateral Violence";
    statusDisplay.style.color = "var(--accent-crimson)";
    circle.style.borderColor = "var(--accent-crimson)";
    strategyText.innerHTML = "<strong>Status:</strong> Active cabal & mob-gaslighting in progress. <em>Counter-Strategy:</em> Completely cease seeking peer approval. Do not defend yourself or explain. Formulate an Exit strategy.";
  } else {
    statusDisplay.textContent = "Critical Ostracism Trap (Nerve Hazard)";
    statusDisplay.style.color = "#dc2626";
    circle.style.borderColor = "#dc2626";
    strategyText.innerHTML = "<strong>Status:</strong> Total communicative isolation and ontological erasure. <em>Hirschman Mandate:</em> <strong>IMMEDIATE EXIT.</strong> Channel 100% of your intellect to macro-ecosystems outside this closed basin.";
  }
}

// Monograph Tab Handler
function initMonograph() {
  const article = document.getElementById('monograph-text');
  article.innerHTML = MonographContent.tr;

  document.getElementById('btn-mono-tr').addEventListener('click', function() {
    this.classList.add('active');
    document.getElementById('btn-mono-en').classList.remove('active');
    article.innerHTML = MonographContent.tr;
  });

  document.getElementById('btn-mono-en').addEventListener('click', function() {
    this.classList.add('active');
    document.getElementById('btn-mono-tr').classList.remove('active');
    article.innerHTML = MonographContent.en;
  });

  document.getElementById('btn-copy-bib').addEventListener('click', function() {
    const bib = `@article{outlier_friction_2026,\n  title={The Outlier Friction: Mediocrity Consensus, Outlier Liquidation, and Horizontal Violence in Micro-Communities},\n  author={The Outlier Friction Contributors},\n  journal={Open Research Platform},\n  year={2026}\n}`;
    navigator.clipboard.writeText(bib).then(() => {
      const prev = this.innerHTML;
      this.innerHTML = "&#10003; Copied!";
      setTimeout(() => { this.innerHTML = prev; }, 2000);
    });
  });
}

// Global Animation Frame Loop
function animationLoop() {
  updatePhysics();
  drawSimulation();
  requestAnimationFrame(animationLoop);
}

// Setup Event Listeners
document.addEventListener('DOMContentLoaded', () => {
  initSimulation();
  initOFI();
  initMonograph();
  updateGameTheoryMatrix();

  // Playback
  document.getElementById('btn-play').addEventListener('click', () => {
    if (SimState.running) pauseSimulation();
    else playSimulation();
  });
  document.getElementById('btn-step').addEventListener('click', stepSimulation);
  document.getElementById('btn-reset').addEventListener('click', resetSimulation);

  // Sliders
  document.getElementById('param-agents').addEventListener('input', (e) => {
    SimState.agentsCount = parseInt(e.target.value, 10);
    document.getElementById('val-agents').textContent = SimState.agentsCount;
    resetSimulation();
  });

  document.getElementById('param-conformity').addEventListener('input', (e) => {
    SimState.conformity = parseFloat(e.target.value);
    document.getElementById('val-conformity').textContent = SimState.conformity.toFixed(2);
    resetSimulation();
  });

  document.getElementById('param-envy').addEventListener('input', (e) => {
    SimState.envy = parseFloat(e.target.value);
    document.getElementById('val-envy').textContent = SimState.envy.toFixed(2);
    resetSimulation();
  });

  document.getElementById('param-delta').addEventListener('input', (e) => {
    SimState.delta = parseFloat(e.target.value);
    document.getElementById('val-delta').textContent = SimState.delta.toFixed(2);
    resetSimulation();
  });

  document.getElementById('scenario-select').addEventListener('change', (e) => {
    applyScenario(e.target.value);
  });

  // Game theory sliders
  ['a', 'r', 'c', 'p', 'e'].forEach(p => {
    document.getElementById(`gt-param-${p}`).addEventListener('input', updateGameTheoryMatrix);
  });

  // Theme toggle
  document.getElementById('theme-toggle').addEventListener('click', () => {
    const current = document.documentElement.getAttribute('data-theme');
    const target = current === 'dark' ? 'light' : 'dark';
    document.documentElement.setAttribute('data-theme', target);
  });

  // Language toggle
  document.getElementById('lang-toggle').addEventListener('click', () => {
    const btnEn = document.getElementById('btn-mono-en');
    const btnTr = document.getElementById('btn-mono-tr');
    if (btnEn.classList.contains('active')) {
      btnTr.click();
    } else {
      btnEn.click();
    }
  });

  // Start smooth physics rendering loop
  requestAnimationFrame(animationLoop);
});
