(async () => {
  // Static layer: background gradient + stars, painted once per resize
  function buildStatic(w, h) {
    const canvas = document.createElement('canvas');
    canvas.width = w; canvas.height = h;
    const ctx = canvas.getContext('2d');

    const bg = ctx.createLinearGradient(0, 0, 0, h);
    bg.addColorStop(0, '#0a0a1a');
    bg.addColorStop(0.4, '#1a0a2e');
    bg.addColorStop(0.7, '#2d1b4e');
    bg.addColorStop(1, '#1a0a2e');
    ctx.fillStyle = bg;
    ctx.fillRect(0, 0, w, h);

    const stars = [
      [0.10, 0.05, 1, 0.6], [0.20, 0.15, 1, 0.4], [0.40, 0.075, 1, 0.5],
      [0.55, 0.04, 1, 0.3], [0.70, 0.125, 1, 0.6], [0.85, 0.06, 1, 0.4],
      [0.95, 0.175, 1, 0.5], [0.15, 0.20, 1, 0.3], [0.35, 0.025, 1, 0.5],
      [0.60, 0.20, 1, 0.4], [0.75, 0.025, 1, 0.3], [0.05, 0.125, 1, 0.5],
      [0.48, 0.10, 1, 0.4], [0.90, 0.225, 1, 0.3],
      [0.30, 0.01, 2, 0.7], [0.80, 0.09, 2, 0.6],
    ];
    for (const [sx, sy, sr, sa] of stars) {
      ctx.fillStyle = `rgba(255,255,255,${sa})`;
      ctx.beginPath();
      ctx.arc(sx * w, sy * h, sr, 0, Math.PI * 2);
      ctx.fill();
    }
    return canvas;
  }

  let staticLayer;
  const sceneCanvas = document.createElement('canvas');
  const sceneCtx = sceneCanvas.getContext('2d');

  // Tesla-coil lightning bolts: each click spawns one that arcs from the pointer to the sun
  const bolts = [];

  function jaggedSegments(x1, y1, x2, y2, segments, maxOffset) {
    const dx = x2 - x1, dy = y2 - y1;
    const len = Math.hypot(dx, dy) || 1;
    const nx = -dy / len, ny = dx / len;
    const pts = [];
    for (let i = 0; i <= segments; i++) {
      const t = i / segments;
      const px = x1 + dx * t;
      const py = y1 + dy * t;
      const falloff = Math.sin(t * Math.PI); // 0 at ends, 1 mid
      const off = (Math.random() - 0.5) * 2 * maxOffset * falloff;
      pts.push([px + nx * off, py + ny * off]);
    }
    return pts;
  }

  function rebuildBoltPaths(b) {
    const mainPath = jaggedSegments(b.startX, b.startY, b.endX, b.endY, 16, 35);
    const forks = [];
    const forkCount = 3 + Math.floor(Math.random() * 4);
    const baseAngle = Math.atan2(b.endY - b.startY, b.endX - b.startX);
    for (let i = 0; i < forkCount; i++) {
      const tOnMain = 0.2 + Math.random() * 0.6;
      const idx = Math.min(mainPath.length - 1, Math.floor(tOnMain * mainPath.length));
      const [fx, fy] = mainPath[idx];
      const a = baseAngle + (Math.random() - 0.5) * 1.8;
      const fl = 40 + Math.random() * 90;
      const ex = fx + Math.cos(a) * fl;
      const ey = fy + Math.sin(a) * fl;
      forks.push(jaggedSegments(fx, fy, ex, ey, 5, 18));
    }
    b.paths = { mainPath, forks };
    b.lastRebuild = performance.now();
  }

  function spawnBolt(x, y, live = false) {
    const w = sceneCanvas.width, h = sceneCanvas.height;
    const b = {
      startX: x, startY: y,
      endX: w / 2, endY: h * 0.70,
      bornAt: performance.now(),
      life: 380 + Math.random() * 140,
      paths: null,
      lastRebuild: 0,
      live,
    };
    rebuildBoltPaths(b);
    bolts.push(b);
    return b;
  }

  function addPolyline(ctx, pts) {
    pts.forEach(([x, y], i) => i === 0 ? ctx.moveTo(x, y) : ctx.lineTo(x, y));
  }

  function drawBolts(ctx, nowMs) {
    for (let i = bolts.length - 1; i >= 0; i--) {
      const b = bolts[i];
      const age = nowMs - b.bornAt;
      if (!b.live && age > b.life) { bolts.splice(i, 1); continue; }
      // Live bolts track current screen center (handles resize mid-hold)
      if (b.live) {
        b.endX = sceneCanvas.width / 2;
        b.endY = sceneCanvas.height * 0.70;
      }
      // Re-jitter every ~45ms for that crackling flicker
      if (nowMs - b.lastRebuild > 45) rebuildBoltPaths(b);

      // Live = sustained full-strength strobe. Released = decay from now.
      let envelope;
      if (b.live) {
        envelope = 0.85 + 0.15 * Math.random();
      } else {
        const lifeT = age / b.life;
        envelope = Math.pow(1 - lifeT, 1.6) * (0.7 + 0.3 * Math.random());
      }
      const alpha = Math.max(0, envelope);

      ctx.save();
      ctx.lineCap = 'round';
      ctx.lineJoin = 'round';

      // Outer blue haze
      ctx.shadowColor = `rgba(120, 180, 255, ${alpha * 0.9})`;
      ctx.shadowBlur = 28;
      ctx.strokeStyle = `rgba(180, 210, 255, ${alpha * 0.55})`;
      ctx.lineWidth = 7;
      ctx.beginPath();
      addPolyline(ctx, b.paths.mainPath);
      for (const f of b.paths.forks) addPolyline(ctx, f);
      ctx.stroke();

      // Mid cyan glow
      ctx.shadowColor = `rgba(200, 230, 255, ${alpha})`;
      ctx.shadowBlur = 14;
      ctx.strokeStyle = `rgba(230, 240, 255, ${alpha * 0.8})`;
      ctx.lineWidth = 3;
      ctx.beginPath();
      addPolyline(ctx, b.paths.mainPath);
      for (const f of b.paths.forks) addPolyline(ctx, f);
      ctx.stroke();

      // White-hot core
      ctx.shadowBlur = 0;
      ctx.strokeStyle = `rgba(255, 255, 255, ${alpha})`;
      ctx.lineWidth = 1.2;
      ctx.beginPath();
      addPolyline(ctx, b.paths.mainPath);
      for (const f of b.paths.forks) addPolyline(ctx, f);
      ctx.stroke();

      // Impact flash at the sun end
      const flashR = 60 * envelope;
      const grd = ctx.createRadialGradient(b.endX, b.endY, 0, b.endX, b.endY, flashR);
      grd.addColorStop(0, `rgba(255, 255, 255, ${alpha * 0.9})`);
      grd.addColorStop(0.4, `rgba(200, 220, 255, ${alpha * 0.4})`);
      grd.addColorStop(1, 'rgba(150, 180, 255, 0)');
      ctx.fillStyle = grd;
      ctx.beginPath();
      ctx.arc(b.endX, b.endY, flashR, 0, Math.PI * 2);
      ctx.fill();

      ctx.restore();
    }
  }

  function resizeScene(w, h) {
    staticLayer = buildStatic(w, h);
    sceneCanvas.width = w;
    sceneCanvas.height = h;
  }

  // Dynamic layer: grid ripple, sun glow pulse, horizon shimmer, text flicker
  function paintScene(time) {
    const w = sceneCanvas.width;
    const h = sceneCanvas.height;
    const ctx = sceneCtx;
    ctx.globalCompositeOperation = 'source-over';
    ctx.drawImage(staticLayer, 0, 0);

    const gridHorizonY = h * 0.68;
    const horizonY = h * 0.70;

    // Grid with multi-wave ripples across both axes
    ctx.save();
    const gridTop = gridHorizonY;
    const gridBottom = h;
    const gridH = gridBottom - gridTop;
    const vanishX = w / 2;
    ctx.strokeStyle = 'rgba(255, 0, 200, 0.35)';
    ctx.lineWidth = 1;

    // Rippled coordinate warp — two crossing wave fields shift each sample point
    const warp = (x, y) => {
      const tr = Math.max(0, Math.min(1, (y - gridTop) / gridH));
      const amp = 1 + 4 * tr; // stronger near viewer, still visible near horizon
      const dx = Math.sin(y * 0.03 + time * 1.4) * amp + Math.sin(y * 0.08 - time * 0.9) * amp * 0.5;
      const dy = Math.sin(x * 0.012 + time * 1.8) * amp + Math.cos(x * 0.025 + time * 1.1) * amp * 0.4;
      return [x + dx, y + dy];
    };

    const rows = 12;
    for (let i = 1; i <= rows; i++) {
      const tr = i / rows;
      const baseY = gridTop + (1 - Math.pow(1 - tr, 2.2)) * gridH;
      ctx.beginPath();
      for (let x = 0; x <= w; x += 8) {
        const [wx, wy] = warp(x, baseY);
        if (x === 0) ctx.moveTo(wx, wy);
        else ctx.lineTo(wx, wy);
      }
      ctx.stroke();
    }
    const cols = 24;
    for (let i = -cols; i <= cols; i++) {
      const xBottom = vanishX + (i / cols) * w * 1.6;
      ctx.beginPath();
      const steps = 18;
      for (let s = 0; s <= steps; s++) {
        const t = s / steps;
        const x = xBottom + (vanishX - xBottom) * t;
        const y = gridBottom + (gridTop - gridBottom) * t;
        const [wx, wy] = warp(x, y);
        if (s === 0) ctx.moveTo(wx, wy);
        else ctx.lineTo(wx, wy);
      }
      ctx.stroke();
    }
    ctx.restore();

    // Sun — size pulse, color shift, large glow breathing
    const sunPulse = 0.5 + 0.5 * Math.sin(time * 1.1);
    const sunPulse2 = 0.5 + 0.5 * Math.sin(time * 1.9 + 1.3);
    const sunPulse3 = 0.5 + 0.5 * Math.sin(time * 0.5 + 2.1);
    const sizeMod = 1 + 0.08 * Math.sin(time * 0.7); // 8% size breathing
    const sunW = Math.min(300, w * 0.5) * sizeMod;
    const sunH = Math.min(150, w * 0.25) * sizeMod;
    const sunLeft = w / 2 - sunW / 2;
    const sunTop = horizonY - sunH;

    ctx.save();
    const glowR = Math.floor(200 + 55 * sunPulse3);
    const glowG = Math.floor(30 * sunPulse2);
    const glowB = Math.floor(140 + 60 * sunPulse);
    ctx.shadowColor = `rgba(${glowR}, ${glowG}, ${glowB}, ${0.4 + 0.4 * sunPulse})`;
    ctx.shadowBlur = 50 + 70 * sunPulse;
    ctx.beginPath();
    ctx.ellipse(w / 2, horizonY, sunW / 2, sunH, 0, Math.PI, 2 * Math.PI);
    ctx.closePath();
    const sunGrad = ctx.createLinearGradient(0, sunTop, 0, horizonY);
    const topR = 255;
    const topG = Math.floor(100 + 80 * sunPulse2);
    const topB = Math.floor(180 + 50 * sunPulse3);
    sunGrad.addColorStop(0, `rgb(${topR}, ${topG}, ${topB})`);
    const midR = Math.floor(230 + 25 * sunPulse);
    sunGrad.addColorStop(0.5, `rgb(${midR}, 0, ${Math.floor(100 + 50 * sunPulse2)})`);
    const botR = Math.floor(255);
    const botG = Math.floor(40 + 40 * sunPulse3);
    sunGrad.addColorStop(1, `rgb(${botR}, ${botG}, 0)`);
    ctx.fillStyle = sunGrad;
    ctx.fill();
    ctx.restore();

    // Sun stripes — wavier drift for heat shimmer
    ctx.save();
    ctx.beginPath();
    ctx.ellipse(w / 2, horizonY, sunW / 2, sunH, 0, Math.PI, 2 * Math.PI);
    ctx.clip();
    ctx.fillStyle = '#0a0a1a';
    const stripeDrift = Math.sin(time * 0.9) * 4 + Math.sin(time * 2.3) * 1.5;
    for (let y = horizonY - 4 + stripeDrift; y > sunTop - 8; y -= 12) {
      const thicknessMod = 3 + Math.sin(time * 1.5 + y * 0.05) * 1.2;
      ctx.fillRect(sunLeft, y, sunW, thicknessMod);
    }
    ctx.restore();

    // Horizon bar with intensity shimmer
    ctx.save();
    const barShimmer = 0.45 + 0.2 * Math.sin(time * 2.1);
    const horizonGrad = ctx.createLinearGradient(0, 0, w, 0);
    horizonGrad.addColorStop(0, 'rgba(255,0,200,0)');
    horizonGrad.addColorStop(0.3, '#ff00c8');
    horizonGrad.addColorStop(0.5, '#00fff2');
    horizonGrad.addColorStop(0.7, '#ff00c8');
    horizonGrad.addColorStop(1, 'rgba(255,0,200,0)');
    ctx.shadowColor = `rgba(255,0,200,${barShimmer})`;
    ctx.shadowBlur = 30 + 15 * Math.sin(time * 1.3);
    ctx.fillStyle = horizonGrad;
    ctx.fillRect(0, horizonY - 3, w, 6);
    ctx.restore();

    // Neon text with flicker: modulate glow intensity + rare dim frames
    const noise = Math.sin(time * 17.3) * 0.5 + Math.sin(time * 7.1 + 1.2) * 0.3 + Math.sin(time * 31.7) * 0.2;
    const intensity = Math.max(0.55, 0.9 + noise * 0.12);
    const glowScale = intensity;
    const textAlpha = intensity;

    const fontSize = Math.max(40, Math.min(128, w * 0.1));
    ctx.font = `700 ${fontSize}px 'Courier New', Courier, monospace`;
    ctx.textBaseline = 'middle';
    const textY = h * 0.3 + fontSize * 0.6;

    const parts = [
      { text: 'jaggli', color: '#fff', glow: '#ff00c8' },
      { text: '.', color: '#00fff2', glow: '#00b4d8' },
      { text: 'com', color: '#fff', glow: '#ff00c8' },
    ];
    const totalW = parts.reduce((s, p) => s + ctx.measureText(p.text).width, 0);
    let x = w / 2 - totalW / 2;
    ctx.save();
    ctx.globalAlpha = textAlpha;
    for (const p of parts) {
      ctx.fillStyle = p.color;
      ctx.shadowColor = p.glow;
      for (const blur of [10, 21, 42, 82, 102]) {
        ctx.shadowBlur = blur * glowScale;
        ctx.fillText(p.text, x, textY);
      }
      ctx.shadowBlur = 0;
      ctx.fillText(p.text, x, textY);
      x += ctx.measureText(p.text).width;
    }
    ctx.restore();

    drawBolts(ctx, time * 1000);

    return sceneCanvas;
  }

  resizeScene(innerWidth, innerHeight);
  const shot = paintScene(0);

  const c = document.createElement('canvas');
  c.width = innerWidth; c.height = innerHeight;
  Object.assign(c.style, { position: 'fixed', top: '0', left: '0', width: '100vw', height: '100vh', zIndex: '999999' });

  // Beach chiptune ambient
  const actx = new (window.AudioContext || window.webkitAudioContext)();
  const masterGain = actx.createGain();
  masterGain.gain.value = 0.12;
  masterGain.connect(actx.destination);

  // Warm filter — like sun-baked speakers
  const filter = actx.createBiquadFilter();
  filter.type = 'lowpass';
  filter.frequency.value = 1800;
  filter.Q.value = 1;
  filter.connect(masterGain);

  // Lush delay for that dreamy feel
  const delay = actx.createDelay();
  delay.delayTime.value = 0.45;
  const fb = actx.createGain();
  fb.gain.value = 0.35;
  const delayFilter = actx.createBiquadFilter();
  delayFilter.type = 'lowpass';
  delayFilter.frequency.value = 900;
  delay.connect(delayFilter);
  delayFilter.connect(fb);
  fb.connect(delay);
  delay.connect(masterGain);

  function playNote(freq, startTime, duration, type = 'triangle', vol = 0.25) {
    const osc = actx.createOscillator();
    const env = actx.createGain();
    osc.type = type;
    osc.frequency.value = freq;
    // Soft attack, gentle decay
    env.gain.setValueAtTime(0, startTime);
    env.gain.linearRampToValueAtTime(vol, startTime + 0.08);
    env.gain.setValueAtTime(vol * 0.7, startTime + duration * 0.5);
    env.gain.exponentialRampToValueAtTime(0.001, startTime + duration);
    osc.connect(env);
    env.connect(filter);
    env.connect(delay);
    osc.start(startTime);
    osc.stop(startTime + duration + 0.1);
  }

  function playKick(time) {
    const osc = actx.createOscillator();
    const env = actx.createGain();
    osc.frequency.setValueAtTime(110, time);
    osc.frequency.exponentialRampToValueAtTime(38, time + 0.1);
    env.gain.setValueAtTime(0, time);
    env.gain.linearRampToValueAtTime(0.28, time + 0.005);
    env.gain.exponentialRampToValueAtTime(0.001, time + 0.25);
    osc.connect(env);
    env.connect(masterGain);
    osc.start(time);
    osc.stop(time + 0.3);
  }

  function playHat(time, vol, open = false) {
    const decay = open ? 0.18 : 0.05;
    const bufSize = Math.floor(actx.sampleRate * (decay + 0.05));
    const buf = actx.createBuffer(1, bufSize, actx.sampleRate);
    const data = buf.getChannelData(0);
    for (let i = 0; i < bufSize; i++) data[i] = Math.random() * 2 - 1;
    const src = actx.createBufferSource();
    src.buffer = buf;
    const hp = actx.createBiquadFilter();
    hp.type = 'highpass';
    hp.frequency.value = 7000;
    const env = actx.createGain();
    env.gain.setValueAtTime(0, time);
    env.gain.linearRampToValueAtTime(vol, time + 0.002);
    env.gain.exponentialRampToValueAtTime(0.001, time + decay);
    src.connect(hp);
    hp.connect(env);
    env.connect(masterGain);
    src.start(time);
    src.stop(time + decay + 0.03);
  }

  function playClap(time, vol) {
    // Three quick bursts give that classic "clap" sound
    for (let i = 0; i < 3; i++) {
      const t = time + i * 0.011;
      const bufSize = Math.floor(actx.sampleRate * 0.04);
      const buf = actx.createBuffer(1, bufSize, actx.sampleRate);
      const data = buf.getChannelData(0);
      for (let j = 0; j < bufSize; j++) data[j] = Math.random() * 2 - 1;
      const src = actx.createBufferSource();
      src.buffer = buf;
      const bp = actx.createBiquadFilter();
      bp.type = 'bandpass';
      bp.frequency.value = 1400;
      bp.Q.value = 0.7;
      const env = actx.createGain();
      env.gain.setValueAtTime(0, t);
      env.gain.linearRampToValueAtTime(vol, t + 0.002);
      env.gain.exponentialRampToValueAtTime(0.001, t + 0.12);
      src.connect(bp);
      bp.connect(env);
      env.connect(masterGain);
      src.start(t);
      src.stop(t + 0.15);
    }
  }

  // Ocean white noise (gentle waves)
  function createWaves() {
    const bufSize = actx.sampleRate * 4;
    const buf = actx.createBuffer(1, bufSize, actx.sampleRate);
    const data = buf.getChannelData(0);
    for (let i = 0; i < bufSize; i++) data[i] = Math.random() * 2 - 1;
    const noise = actx.createBufferSource();
    noise.buffer = buf;
    noise.loop = true;
    // Shape it into slow waves with LFO on volume
    const waveGain = actx.createGain();
    waveGain.gain.value = 0;
    const lfo = actx.createOscillator();
    lfo.frequency.value = 0.12; // slow wave rhythm
    const lfoGain = actx.createGain();
    lfoGain.gain.value = 0.03;
    lfo.connect(lfoGain);
    lfoGain.connect(waveGain.gain);
    waveGain.gain.setValueAtTime(0.02, actx.currentTime);
    // Bandpass to make it sound like surf
    const bp = actx.createBiquadFilter();
    bp.type = 'bandpass';
    bp.frequency.value = 600;
    bp.Q.value = 0.5;
    noise.connect(bp);
    bp.connect(waveGain);
    waveGain.connect(masterGain);
    noise.start();
    lfo.start();
  }
  createWaves();

  // Chord progressions — warm beach vibes (Cmaj7 → Fmaj7 → Am7 → G7)
  const chords = [
    [130.81, 164.81, 196.00, 246.94], // Cmaj7: C3 E3 G3 B3
    [174.61, 220.00, 261.63, 329.63], // Fmaj7: F3 A3 C4 E4
    [110.00, 130.81, 164.81, 196.00], // Am7:   A2 C3 E3 G3
    [98.00, 123.47, 146.83, 185.00],  // G7:    G2 B2 D3 F#3
  ];

  // Melody notes — C major scale, upper register for that bright island sound
  const melody = [
    523.25, 587.33, 659.25, 698.46, 783.99, 880.00, 987.77, 1046.50, // C5-C6
  ];

  // Fixed 4-bar melody, one bar per chord. Notes: [startBeat, scaleDegree, durBeats].
  // Each bar emphasizes chord tones on strong beats, with a repeating motif that
  // resolves through G7 back to Cmaj7.
  const tune = [
    // Bar 1 — Cmaj7: E held, arpeggio E→G→B, settle on G
    [[0, 2, 1.5], [2, 4, 0.5], [2.5, 6, 0.5], [3, 4, 1.5], [5, 2, 0.5], [5.5, 4, 2.5]],
    // Bar 2 — Fmaj7: same motif lifted — F, A, C, back to A
    [[0, 3, 1.5], [2, 5, 0.5], [2.5, 7, 0.5], [3, 5, 1.5], [5, 3, 0.5], [5.5, 5, 2.5]],
    // Bar 3 — Am7: more movement, climbing to C6 then descending
    [[0, 4, 0.5], [0.5, 5, 1.5], [2, 7, 0.5], [2.5, 6, 0.5], [3, 5, 1], [4, 4, 1], [5, 2, 1], [6, 4, 2]],
    // Bar 4 — G7: stepwise descent B→A→G→F→E→D, long G to turn around
    [[0, 6, 0.5], [0.5, 5, 0.5], [1, 4, 1], [2, 3, 1], [3, 2, 1], [4, 1, 0.5], [4.5, 4, 3]],
  ];

  let chordIdx = 0;
  const beatLen = 0.5; // seconds per beat

  function scheduleBar() {
    const now = actx.currentTime;
    const chord = chords[chordIdx];
    const bar = tune[chordIdx];
    chordIdx = (chordIdx + 1) % chords.length;

    // Soft pad chord — triangle waves, long sustain
    chord.forEach((freq, i) => {
      playNote(freq, now + i * 0.05, beatLen * 7.5, 'triangle', 0.1);
    });

    // Bass — root note, square with low vol
    playNote(chord[0] * 0.5, now, beatLen * 4, 'square', 0.07);
    playNote(chord[0] * 0.5, now + beatLen * 4, beatLen * 3.5, 'square', 0.055);

    // Melody
    for (const [startBeat, deg, durBeats] of bar) {
      playNote(melody[deg], now + startBeat * beatLen, durBeats * beatLen, 'triangle', 0.18);
    }

    // Drums — kick on 1 & 3, clap on 2 & 4, hats every 8th with swing + open hat lifts
    const swing = beatLen * 0.12; // push off-beat hats late for that laid-back shuffle
    for (let i = 0; i < 8; i++) {
      const offset = i % 2 === 1 ? swing : 0;
      const t = now + i * beatLen + offset;
      if (i === 0 || i === 4) playKick(t);
      if (i === 2 || i === 6) playClap(t, 0.12);
      const open = i === 3 || i === 7; // "and of 2" and "and of 4"
      playHat(t, i % 2 === 0 ? 0.05 : 0.035, open);
    }

    setTimeout(scheduleBar, beatLen * 8 * 1000);
  }

  const startMusic = () => {
    if (actx.state === 'running') {
      scheduleBar();
      return;
    }
    const kick = () => actx.resume().then(() => {
      if (actx.state === 'running') {
        scheduleBar();
        removeAll();
      }
    });
    const events = ['pointerdown', 'keydown', 'touchstart'];
    const removeAll = () => events.forEach(ev => window.removeEventListener(ev, kick));
    events.forEach(ev => window.addEventListener(ev, kick, { once: false }));
  };
  startMusic();

  document.body.appendChild(c);

  const gl = c.getContext('webgl');
  if (!gl) { alert('No WebGL'); return }

  const compile = (type, src) => { const s = gl.createShader(type); gl.shaderSource(s, src); gl.compileShader(s); if (!gl.getShaderParameter(s, gl.COMPILE_STATUS)) console.error(gl.getShaderInfoLog(s)); return s };

  const vs = `attribute vec2 p;varying vec2 uv;void main(){uv=vec2(p.x*.5+.5, .5-p.y*.5);gl_Position=vec4(p,0,1);}`;

  const fs =`
precision highp float;
varying vec2 uv;
uniform sampler2D tex;
uniform vec2 res;
uniform vec2 offset;
uniform vec2 mouse;
uniform float angle;

void main(){
  float gridR=40.0; // fixed grid spacing (accommodates largest bubbles)
  vec2 pixel=uv*res+offset;

  // Rotate the hex lattice around the pan-adjusted screen center
  float ca=cos(angle), sa=sin(angle);
  vec2 pivot=offset+res*0.5;
  vec2 rel=pixel-pivot;
  vec2 rotPixel=vec2(ca*rel.x - sa*rel.y, sa*rel.x + ca*rel.y)+pivot;

  float row=floor(rotPixel.y/(gridR*1.732));
  float off=mod(row,2.0)*gridR;
  float col=floor((rotPixel.x+off)/(gridR*2.0));
  vec2 centerRot=vec2(col*gridR*2.0-off, row*gridR*1.732);
  centerRot+=vec2(gridR, gridR*0.866);

  // Un-rotate center to world/screen frame for mouse distance + texture sampling
  vec2 centerRel=centerRot-pivot;
  vec2 center=vec2(ca*centerRel.x + sa*centerRel.y, -sa*centerRel.x + ca*centerRel.y)+pivot;

  // Distance from bubble center to mouse cursor
  vec2 centerScreen=center-offset;
  float crossDist=length(centerScreen-mouse);

  // Bubble radius: 40 (80px diameter) on the cross, shrinking to 20 (40px) far away
  float maxR=38.0;
  float minR=0.0;
  float falloff=600.0; // pixels over which the size transitions
  float t=smoothstep(0.0, falloff, crossDist);
  float bubbleR=mix(maxR, minR, t);
  float r=bubbleR*0.92;

  vec2 diff=rotPixel-centerRot;
  float dist=length(diff);

  if(dist<r){
    float z=sqrt(r*r-dist*dist);
    vec3 normal=normalize(vec3(diff,z));

    // Refracted offset lives in rotated frame — un-rotate before sampling texture
    vec2 refractedRot=diff-normal.xy*z*0.4;
    vec2 refracted=vec2(ca*refractedRot.x + sa*refractedRot.y, -sa*refractedRot.x + ca*refractedRot.y);
    vec2 newUV=(center+refracted-offset)/res;

    // Highlight faces the sun: take direction from bubble (screen space) to sun,
    // rotate into the lattice frame so it aligns with the rotated normal
    vec2 sunPos=vec2(res.x*0.5, res.y*0.70);
    vec2 toSun=normalize(sunPos-centerScreen);
    vec2 toSunRot=vec2(ca*toSun.x - sa*toSun.y, sa*toSun.x + ca*toSun.y);
    vec3 lightDir=normalize(vec3(toSunRot, 0.5));
    float highlight=pow(max(dot(normal, lightDir),0.0),16.0)*0.6;

    float edge=smoothstep(r,r*0.7,dist);

    vec3 col=texture2D(tex,newUV).rgb;
    col=col*0.92+vec3(0.95,0.96,0.98)*0.08;

    // Thin-film iridescence (soap bubble rainbow)
    float facing=dot(normal, normalize(vec3(0.0,0.0,1.0)));
    float film=1.0-facing; // thicker at edges
    float phase=film*6.0+length(center)*0.01; // vary by position
    vec3 rainbow=vec3(
      sin(phase)*0.5+0.5,
      sin(phase+2.094)*0.5+0.5,
      sin(phase+4.189)*0.5+0.5
    );
    col=mix(col, rainbow, 0.08*film);

    col+=highlight;
    col*=0.9+0.1*edge;

    gl_FragColor=vec4(col,1.0);
  } else {
    // Light transparent seam
    vec3 base=texture2D(tex,uv).rgb;
    float seam=smoothstep(r,r+1.0,dist);
    vec3 groove=mix(base*0.9, base, seam);
    gl_FragColor=vec4(groove,1.0);
  }
}`;

  const vsh = compile(gl.VERTEX_SHADER, vs);
  const fsh = compile(gl.FRAGMENT_SHADER, fs);
  const prog = gl.createProgram();
  gl.attachShader(prog, vsh); gl.attachShader(prog, fsh); gl.linkProgram(prog); gl.useProgram(prog);

  const buf = gl.createBuffer();
  gl.bindBuffer(gl.ARRAY_BUFFER, buf);
  gl.bufferData(gl.ARRAY_BUFFER, new Float32Array([-1, -1, 1, -1, -1, 1, 1, 1]), gl.STATIC_DRAW);
  const loc = gl.getAttribLocation(prog, 'p');
  gl.enableVertexAttribArray(loc);
  gl.vertexAttribPointer(loc, 2, gl.FLOAT, false, 0, 0);

  const t = gl.createTexture();
  gl.bindTexture(gl.TEXTURE_2D, t);
  gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_WRAP_S, gl.CLAMP_TO_EDGE);
  gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_WRAP_T, gl.CLAMP_TO_EDGE);
  gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_MIN_FILTER, gl.LINEAR);
  gl.texImage2D(gl.TEXTURE_2D, 0, gl.RGBA, gl.RGBA, gl.UNSIGNED_BYTE, shot);

  gl.uniform1i(gl.getUniformLocation(prog, 'tex'), 0);
  const resLoc = gl.getUniformLocation(prog, 'res');
  gl.uniform2f(resLoc, innerWidth, innerHeight);

  const offsetLoc = gl.getUniformLocation(prog, 'offset');
  const mouseLoc = gl.getUniformLocation(prog, 'mouse');
  const angleLoc = gl.getUniformLocation(prog, 'angle');

  window.addEventListener('resize', () => {
    c.width = innerWidth;
    c.height = innerHeight;
    resizeScene(innerWidth, innerHeight);
    gl.uniform2f(resLoc, innerWidth, innerHeight);
  });

  // Track mouse position
  let mouseX = 0, mouseY = 0;
  let mousePxX = innerWidth / 2, mousePxY = innerHeight / 2;
  const onMove = (e) => {
    mouseX = e.clientX - innerWidth / 2;
    mouseY = e.clientY - innerHeight / 2;
    mousePxX = e.clientX;
    mousePxY = e.clientY;
  };
  c.addEventListener('mousemove', onMove);

  let liveBolt = null;
  c.addEventListener('pointerdown', (e) => {
    liveBolt = spawnBolt(e.clientX, e.clientY, true);
    c.setPointerCapture(e.pointerId);
  });
  c.addEventListener('pointermove', (e) => {
    if (!liveBolt) return;
    liveBolt.startX = e.clientX;
    liveBolt.startY = e.clientY;
  });
  const releaseBolt = () => {
    if (!liveBolt) return;
    liveBolt.live = false;
    liveBolt.bornAt = performance.now(); // start the decay from "now"
    liveBolt = null;
  };
  c.addEventListener('pointerup', releaseBolt);
  c.addEventListener('pointercancel', releaseBolt);

  // Accumulate offset over time based on mouse direction + distance
  let ox = 0, oy = 0;
  const speed = 0.003; // pixels per frame per pixel of mouse distance from center

  // Lattice rotation: drift angular velocity toward random targets, sometimes resting at 0
  let angle = 0;
  let angVel = 0;
  // Start with a non-zero target so motion kicks in right away
  let angTargetVel = (Math.random() < 0.5 ? -1 : 1) * 0.002;
  let nextTargetAt = performance.now() + 4000 + Math.random() * 5000;

  function updateRotation(nowMs) {
    if (nowMs >= nextTargetAt) {
      const r = Math.random();
      if (r < 0.25) angTargetVel = 0; // brief pause
      else angTargetVel = (Math.random() * 2 - 1) * 0.0022; // rad/frame, ~7° per second max
      nextTargetAt = nowMs + 4000 + Math.random() * 7000;
    }
    angVel += (angTargetVel - angVel) * 0.015; // easing rate (~1.1s to change direction)
    angle += angVel;
  }

  function frame(nowMs) {
    const ms = nowMs || performance.now();
    ox += mouseX * speed;
    oy += mouseY * speed;
    updateRotation(ms);
    paintScene(ms / 1000);
    gl.bindTexture(gl.TEXTURE_2D, t);
    gl.texImage2D(gl.TEXTURE_2D, 0, gl.RGBA, gl.RGBA, gl.UNSIGNED_BYTE, sceneCanvas);
    gl.uniform2f(offsetLoc, ox, oy);
    gl.uniform2f(mouseLoc, mousePxX, mousePxY);
    gl.uniform1f(angleLoc, angle);
    gl.viewport(0, 0, innerWidth, innerHeight);
    gl.drawArrays(gl.TRIANGLE_STRIP, 0, 4);
    requestAnimationFrame(frame);
  }
  frame();
})();
