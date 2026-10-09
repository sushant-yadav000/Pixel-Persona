document.addEventListener("DOMContentLoaded", () => {

  lucide.createIcons();

  initDisintegrationArtwork();
  initScenarioSelector();
  initAmbientCanvas();
  initDigitalIncinerator();
  initBoxBreathing();
  initPanicModal();
  initBrownNoiseEngine();
});

function initDisintegrationArtwork() {
  const canvas = document.getElementById("disintegrationCanvas");
  if (!canvas) return;
  const ctx = canvas.getContext("2d");

  let w = (canvas.width = canvas.parentElement.clientWidth);
  let h = (canvas.height = canvas.parentElement.clientHeight);

  window.addEventListener("resize", () => {
    if (!canvas.parentElement) return;
    w = canvas.width = canvas.parentElement.clientWidth;
    h = canvas.height = canvas.parentElement.clientHeight;
    createVoxelSilhouette();
  });

  let mouse = { x: -1000, y: -1000, radius: 90 };

  canvas.addEventListener("mousemove", (e) => {
    const rect = canvas.getBoundingClientRect();
    mouse.x = e.clientX - rect.left;
    mouse.y = e.clientY - rect.top;
  });

  canvas.addEventListener("mouseleave", () => {
    mouse.x = -1000;
    mouse.y = -1000;
  });

  class VoxelCube {
    constructor(originX, originY, size, isShatteringPart) {
      this.originX = originX;
      this.originY = originY;
      this.x = originX;
      this.y = originY;
      this.size = size;
      this.baseSize = size;
      this.isShattered = isShatteringPart;

      this.angle = Math.random() * Math.PI * 2;
      this.floatSpeed = 0.015 + Math.random() * 0.02;
      this.floatRange = isShatteringPart ? 6 + Math.random() * 12 : 1.5;

      this.driftX = isShatteringPart ? (Math.random() * 1.5 + 0.5) : 0;
      this.driftY = isShatteringPart ? (Math.random() - 0.5) * 0.8 : 0;
      this.alpha = isShatteringPart ? 0.35 + Math.random() * 0.6 : 0.85;
      this.color = Math.random() > 0.4 ? "#f43f5e" : "#fb7185";
    }

    update() {
      this.angle += this.floatSpeed;

      let targetX = this.originX + Math.sin(this.angle) * this.floatRange;
      let targetY = this.originY + Math.cos(this.angle) * this.floatRange;

      if (this.isShattered) {
        this.originX += this.driftX * 0.2;
        this.originY += this.driftY * 0.2;

        if (this.originX > w + 20) {
          this.originX = w * 0.52; 
          this.originY = h * 0.4 + (Math.random() - 0.5) * 80;
        }
      }

      const dx = mouse.x - this.x;
      const dy = mouse.y - this.y;
      const dist = Math.sqrt(dx * dx + dy * dy);

      if (dist < mouse.radius) {
        const force = (mouse.radius - dist) / mouse.radius;
        const angle = Math.atan2(dy, dx);
        targetX -= Math.cos(angle) * force * 45;
        targetY -= Math.sin(angle) * force * 45;
      }
      this.x += (targetX - this.x) * 0.08;
      this.y += (targetY - this.y) * 0.08;
    }

    draw() {
      ctx.save();
      ctx.translate(this.x, this.y);
      const s = this.size;
      ctx.fillStyle = this.color;
      ctx.globalAlpha = this.alpha * 0.8;
      ctx.fillRect(-s / 2, -s / 2, s, s);
      ctx.beginPath();
      ctx.moveTo(-s / 2, -s / 2);
      ctx.lineTo(-s / 4, -s / 2 - s / 3);
      ctx.lineTo(s * 0.75, -s / 2 - s / 3);
      ctx.lineTo(s / 2, -s / 2);
      ctx.closePath();
      ctx.fillStyle = "#ffffff";
      ctx.globalAlpha = this.alpha * 0.25;
      ctx.fill();
      ctx.beginPath();
      ctx.moveTo(s / 2, -s / 2);
      ctx.lineTo(s * 0.75, -s / 2 - s / 3);
      ctx.lineTo(s * 0.75, s / 2 - s / 3);
      ctx.lineTo(s / 2, s / 2);
      ctx.closePath();
      ctx.fillStyle = "#000000";
      ctx.globalAlpha = this.alpha * 0.45;
      ctx.fill();


      if (this.isShattered && Math.random() > 0.6) {
        ctx.strokeStyle = "rgba(244, 63, 94, 0.8)";
        ctx.lineWidth = 1;
        ctx.strokeRect(-s / 2, -s / 2, s, s);
      }

      ctx.restore();
    }
  }

  let cubes = [];

  function createVoxelSilhouette() {
    cubes = [];
    const centerX = w * 0.42;
    const centerY = h * 0.48;
    const step = 8; 

    for (let py = -80; py <= 80; py += step) {
      for (let px = -65; px <= 65; px += step) {
        let inside = false;

        const dHead = Math.sqrt((px + 5) * (px + 5) + (py + 45) * (py + 45));
        if (dHead < 24) inside = true;
        if (py >= -25 && py <= -10 && Math.abs(px + 4) < 11) inside = true;
        if (py > -10 && py < 75) {
          const halfWidth = 38 - (py * py) / 280;
          if (px > -halfWidth && px < halfWidth) inside = true;
        }

        if (inside) {
          const isRightEdge = px > 2;
          const isDissolving = isRightEdge && Math.random() > 0.3;

          const size = isDissolving ? Math.random() * 6 + 4 : step - 1.5;
          cubes.push(new VoxelCube(centerX + px, centerY + py, size, isDissolving));
        }
      }
    }

    for (let i = 0; i < 65; i++) {
      const spreadX = centerX + 30 + Math.random() * (w * 0.45);
      const spreadY = centerY - 70 + Math.random() * 150;
      const size = Math.random() * 7 + 3;
      cubes.push(new VoxelCube(spreadX, spreadY, size, true));
    }
  }

  createVoxelSilhouette();

  function renderArtwork() {
    ctx.clearRect(0, 0, w, h);

    ctx.strokeStyle = "rgba(244, 63, 94, 0.1)";
    ctx.lineWidth = 1;
    ctx.beginPath();
    ctx.moveTo(w * 0.1, h * 0.8);
    ctx.lineTo(w * 0.9, h * 0.8);
    ctx.stroke();

    for (let i = 0; i < cubes.length; i++) {
      cubes[i].update();
      cubes[i].draw();
    }

    requestAnimationFrame(renderArtwork);
  }

  renderArtwork();
}

function initScenarioSelector() {
  const chips = document.querySelectorAll(".stress-chip");
  const meterFill = document.getElementById("meterFill");
  const psiValue = document.getElementById("psiValue");
  const diagHeader = document.getElementById("diagHeader");
  const diagText = document.getElementById("diagText");
  const severityBadge = document.getElementById("severityBadge");
  const breakdownFeed = document.getElementById("breakdownFeed");
  const selectedCount = document.getElementById("selectedCount");
  const navStatus = document.getElementById("navStatus");
  const resetBtn = document.getElementById("resetChipsBtn");
  const orb1 = document.getElementById("orb1");

  let activeStressors = [];

  chips.forEach((chip) => {
    chip.addEventListener("click", () => {
      chip.classList.toggle("active");
      const title = chip.getAttribute("data-title");
      const impact = parseInt(chip.getAttribute("data-impact"));

      if (chip.classList.contains("active")) {
        activeStressors.push({ title, impact });
      } else {
        activeStressors = activeStressors.filter((s) => s.title !== title);
      }

      updateTelemetry();
    });
  });

  resetBtn.addEventListener("click", () => {
    chips.forEach((c) => c.classList.remove("active"));
    activeStressors = [];
    updateTelemetry();
  });

  function updateTelemetry() {
    selectedCount.textContent = activeStressors.length;

    const rawTotal = activeStressors.reduce((acc, curr) => acc + curr.impact, 0);
    const score = Math.min(rawTotal, 100);

    psiValue.textContent = score;

    const perimeter = 427;
    const offset = perimeter - (score / 100) * perimeter;
    meterFill.style.strokeDashoffset = offset;

    breakdownFeed.innerHTML = "";
    if (activeStressors.length === 0) {
      breakdownFeed.innerHTML = `<div class="feed-placeholder">No stressors selected. System in resting state.</div>`;
    } else {
      activeStressors.forEach((s) => {
        const row = document.createElement("div");
        row.className = "feed-item";
        row.innerHTML = `<span>• ${s.title}</span><span class="text-rose">+${s.impact} PSI</span>`;
        breakdownFeed.appendChild(row);
      });
    }

    if (score === 0) {
      meterFill.style.stroke = "var(--neon-emerald)";
      severityBadge.className = "badge-safe";
      severityBadge.textContent = "OPTIMAL";
      diagHeader.textContent = "EQUILIBRIUM MAINTAINED";
      diagHeader.style.color = "var(--neon-emerald)";
      diagText.textContent = "Select what you are facing on the left to measure neurological load.";
      navStatus.textContent = "STATUS: RESTING";
      navStatus.className = "status-pill text-emerald";
      orb1.style.background = "radial-gradient(circle, rgba(16, 185, 129, 0.12) 0%, transparent 70%)";
    } else if (score < 40) {
      meterFill.style.stroke = "var(--neon-emerald)";
      severityBadge.className = "badge-safe";
      severityBadge.textContent = "LIGHT TENSION";
      diagHeader.textContent = "MANAGEABLE FRICTION";
      diagHeader.style.color = "var(--neon-emerald)";
      diagText.textContent = "Cognitive endurance stable. Deep learning retention remains intact.";
      navStatus.textContent = "STATUS: MILD LOAD";
      navStatus.className = "status-pill text-emerald";
      orb1.style.background = "radial-gradient(circle, rgba(16, 185, 129, 0.15) 0%, transparent 70%)";
    } else if (score < 75) {
      meterFill.style.stroke = "var(--neon-amber)";
      severityBadge.className = "badge-safe text-amber";
      severityBadge.style.borderColor = "rgba(245, 158, 11, 0.4)";
      severityBadge.style.background = "rgba(245, 158, 11, 0.15)";
      severityBadge.textContent = "ELEVATED BURDEN";
      diagHeader.textContent = "ATTENTION DRAIN TRIGGERED";
      diagHeader.style.color = "var(--neon-amber)";
      diagText.textContent = "Working memory constricted. Procrastination and self-doubt loops amplify.";
      navStatus.textContent = "STATUS: ELEVATED";
      navStatus.className = "status-pill text-amber";
      orb1.style.background = "radial-gradient(circle, rgba(245, 158, 11, 0.15) 0%, transparent 70%)";
    } else {
      meterFill.style.stroke = "var(--neon-rose)";
      severityBadge.className = "badge-safe text-rose";
      severityBadge.style.borderColor = "rgba(244, 63, 94, 0.4)";
      severityBadge.style.background = "rgba(244, 63, 94, 0.15)";
      severityBadge.textContent = "BURNOUT ZONE";
      diagHeader.textContent = "CRITICAL NEURAL PARALYSIS";
      diagHeader.style.color = "var(--neon-rose)";
      diagText.textContent = "High risk of total academic burnout, sleep disruption, and panic symptoms.";
      navStatus.textContent = "STATUS: CRITICAL";
      navStatus.className = "status-pill text-rose";
      orb1.style.background = "radial-gradient(circle, rgba(244, 63, 94, 0.22) 0%, transparent 70%)";
    }
  }

  updateTelemetry();
}

function initAmbientCanvas() {
  const canvas = document.getElementById("ambientCanvas");
  const ctx = canvas.getContext("2d");
  let particles = [];

  function resize() {
    canvas.width = window.innerWidth;
    canvas.height = window.innerHeight;
  }
  window.addEventListener("resize", resize);
  resize();

  class Particle {
    constructor() {
      this.x = Math.random() * canvas.width;
      this.y = Math.random() * canvas.height;
      this.size = Math.random() * 2 + 0.5;
      this.speedX = (Math.random() - 0.5) * 0.3;
      this.speedY = (Math.random() - 0.5) * 0.3;
      this.alpha = Math.random() * 0.3 + 0.1;
    }
    update() {
      this.x += this.speedX;
      this.y += this.speedY;
      if (this.x < 0) this.x = canvas.width;
      if (this.x > canvas.width) this.x = 0;
      if (this.y < 0) this.y = canvas.height;
      if (this.y > canvas.height) this.y = 0;
    }
    draw() {
      ctx.fillStyle = `rgba(244, 63, 94, ${this.alpha})`;
      ctx.beginPath();
      ctx.arc(this.x, this.y, this.size, 0, Math.PI * 2);
      ctx.fill();
    }
  }

  for (let i = 0; i < 40; i++) {
    particles.push(new Particle());
  }

  function render() {
    ctx.clearRect(0, 0, canvas.width, canvas.height);
    particles.forEach((p) => {
      p.update();
      p.draw();
    });
    requestAnimationFrame(render);
  }
  render();
}

function initDigitalIncinerator() {
  const btn = document.getElementById("burnActionBtn");
  const textarea = document.getElementById("burnInput");
  const card = document.getElementById("burnCard");
  const canvas = document.getElementById("ashCanvas");
  const ctx = canvas.getContext("2d");

  let ashes = [];

  function resizeAsh() {
    canvas.width = card.parentElement.clientWidth;
    canvas.height = card.parentElement.clientHeight;
  }
  window.addEventListener("resize", resizeAsh);
  resizeAsh();

  class Ash {
    constructor(x, y) {
      this.x = x;
      this.y = y;
      this.vx = (Math.random() - 0.5) * 7;
      this.vy = -(Math.random() * 7 + 4);
      this.alpha = 1;
      this.size = Math.random() * 4 + 2;
      this.color = Math.random() > 0.4 ? "#f43f5e" : "#f59e0b";
    }
    update() {
      this.x += this.vx;
      this.y += this.vy;
      this.vy += 0.15;
      this.alpha -= 0.015;
    }
    draw() {
      ctx.fillStyle = this.color;
      ctx.globalAlpha = Math.max(0, this.alpha);
      ctx.beginPath();
      ctx.arc(this.x, this.y, this.size, 0, Math.PI * 2);
      ctx.fill();
      ctx.globalAlpha = 1;
    }
  }

  function loopAsh() {
    ctx.clearRect(0, 0, canvas.width, canvas.height);
    ashes.forEach((a) => {
      a.update();
      a.draw();
    });
    ashes = ashes.filter((a) => a.alpha > 0);
    if (ashes.length > 0) requestAnimationFrame(loopAsh);
  }

  btn.addEventListener("click", () => {
    if (!textarea.value.trim()) {
      textarea.placeholder = "Please write a toxic fear or burden first to incinerate it!";
      textarea.focus();
      return;
    }

    resizeAsh();
    const rect = card.getBoundingClientRect();
    const parentRect = card.parentElement.getBoundingClientRect();
    const originX = rect.left - parentRect.left + rect.width / 2;
    const originY = rect.top - parentRect.top + rect.height / 2;

    for (let i = 0; i < 90; i++) {
      ashes.push(new Ash(originX, originY));
    }
    loopAsh();

    card.classList.add("card-incinerated");

    setTimeout(() => {
      textarea.value = "";
      card.classList.remove("card-incinerated");
      textarea.placeholder = "Incinerated completely into digital ash. It carries no weight here.";
    }, 1000);
  });
}

function initBoxBreathing() {
  const btn = document.getElementById("breathToggle");
  const icon = document.getElementById("breathBtnIcon");
  const label = document.getElementById("breathBtnLabel");
  const circle = document.getElementById("breathCircle");
  const status = document.getElementById("breathStatus");
  const countdown = document.getElementById("breathCountdown");

  let isRunning = false;
  let interval = null;
  let phase = 0;
  let seconds = 4;

  const phases = [
    { text: "INHALE", scale: "scale(1.4)", color: "#10b981" },
    { text: "HOLD", scale: "scale(1.4)", color: "#06b6d4" },
    { text: "EXHALE", scale: "scale(1)", color: "#8b5cf6" },
    { text: "HOLD", scale: "scale(1)", color: "#64748b" },
  ];

  function stop() {
    clearInterval(interval);
    isRunning = false;
    circle.style.transform = "scale(1)";
    circle.style.borderColor = "rgba(16, 185, 129, 0.4)";
    status.textContent = "STANDBY";
    countdown.textContent = "4s";
    label.textContent = "START 60-SEC PACER";
    icon.setAttribute("data-lucide", "play");
    lucide.createIcons();
  }

  btn.addEventListener("click", () => {
    if (isRunning) {
      stop();
      return;
    }

    isRunning = true;
    label.textContent = "HALT PACER";
    icon.setAttribute("data-lucide", "square");
    lucide.createIcons();

    phase = 0;
    seconds = 4;

    function tick() {
      const cur = phases[phase];
      status.textContent = cur.text;
      status.style.color = cur.color;
      circle.style.transform = cur.scale;
      circle.style.borderColor = cur.color;
      countdown.textContent = `${seconds}s`;

      seconds--;
      if (seconds < 0) {
        phase = (phase + 1) % phases.length;
        seconds = 4;
      }
    }

    tick();
    interval = setInterval(tick, 1000);
  });
}

function initPanicModal() {
  const panicBtn = document.getElementById("panicBtn");
  const panicScreen = document.getElementById("panicScreen");
  const exitBtn = document.getElementById("exitPanic");
  const disc = document.getElementById("groundingDisc");
  const action = document.getElementById("groundingAction");

  let timer = null;

  panicBtn.addEventListener("click", () => {
    panicScreen.classList.add("open");
    let state = 0;
    timer = setInterval(() => {
      state = !state;
      disc.style.transform = state ? "scale(1.4)" : "scale(1)";
      action.textContent = state ? "EXHALE" : "INHALE";
    }, 4000);
  });

  exitBtn.addEventListener("click", () => {
    panicScreen.classList.remove("open");
    clearInterval(timer);
  });
}

function initBrownNoiseEngine() {
  const btn = document.getElementById("audioBtn");
  const icon = document.getElementById("audioIcon");
  const text = document.getElementById("audioText");

  let ctx = null;
  let noiseNode = null;
  let isPlaying = false;

  btn.addEventListener("click", () => {
    if (!ctx) {
      ctx = new (window.AudioContext || window.webkitAudioContext)();
    }

    if (!isPlaying) {
      const sampleRate = ctx.sampleRate;
      const buffer = ctx.createBuffer(1, sampleRate * 2, sampleRate);
      const data = buffer.getChannelData(0);

      let lastOut = 0.0;
      for (let i = 0; i < buffer.length; i++) {
        const white = Math.random() * 2 - 1;
        data[i] = (lastOut + 0.02 * white) / 1.02;
        lastOut = data[i];
        data[i] *= 2.8;
      }

      noiseNode = ctx.createBufferSource();
      noiseNode.buffer = buffer;
      noiseNode.loop = true;

      const filter = ctx.createBiquadFilter();
      filter.type = "lowpass";
      filter.frequency.value = 340;

      noiseNode.connect(filter);
      filter.connect(ctx.destination);
      noiseNode.start();

      isPlaying = true;
      text.textContent = "CALM HUM";
      icon.setAttribute("data-lucide", "volume-2");
      btn.style.borderColor = "var(--neon-emerald)";
      btn.style.color = "var(--neon-emerald)";
    } else {
      if (noiseNode) noiseNode.stop();
      isPlaying = false;
      text.textContent = "MUTE";
      icon.setAttribute("data-lucide", "volume-x");
      btn.style.borderColor = "var(--panel-border)";
      btn.style.color = "var(--text-dim)";
    }
    lucide.createIcons();
  });
}