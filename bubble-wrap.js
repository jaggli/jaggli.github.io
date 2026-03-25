(async () => {
  await new Promise(r => { const s = document.createElement('script'); s.src = 'https://cdnjs.cloudflare.com/ajax/libs/html2canvas/1.4.1/html2canvas.min.js'; s.onload = r; document.head.appendChild(s) });

  const shot = await html2canvas(document.documentElement, { width: innerWidth, height: innerHeight, windowWidth: innerWidth, windowHeight: innerHeight, x: scrollX, y: scrollY, useCORS: true, scrollX: -scrollX, scrollY: -scrollY });

  const c = document.createElement('canvas');
  c.width = innerWidth; c.height = innerHeight;
  Object.assign(c.style, { position: 'fixed', top: '0', left: '0', width: '100vw', height: '100vh', zIndex: '999999', cursor: 'pointer' });
  let alive = true;

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
    return { noise, lfo };
  }
  const waves = createWaves();

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

  // Pre-composed melodic phrases (scale degrees 0-7)
  const phrases = [
    [4, 2, 0, 2, 4, 5, 4, -1],      // rising and falling
    [7, 5, 4, 2, 0, -1, -1, -1],     // gentle descent
    [0, 2, 4, 5, 4, 2, 0, -1],       // wave shape
    [2, 4, 5, 7, 5, 4, 2, 0],        // arch
    [5, 4, 2, 0, 2, 4, -1, -1],      // dip and rise
  ];

  let chordIdx = 0;
  let musicAlive = true;
  const beatLen = 0.5; // seconds per beat

  function scheduleBar() {
    if (!musicAlive) return;
    const now = actx.currentTime;
    const chord = chords[chordIdx];
    chordIdx = (chordIdx + 1) % chords.length;

    // Soft pad chord — triangle waves, long sustain
    chord.forEach((freq, i) => {
      playNote(freq, now + i * 0.05, beatLen * 7.5, 'triangle', 0.1);
    });

    // Bass — root note, square with low vol
    playNote(chord[0] * 0.5, now, beatLen * 4, 'square', 0.15);
    playNote(chord[0] * 0.5, now + beatLen * 4, beatLen * 3.5, 'square', 0.12);

    // Melodic phrase
    const phrase = phrases[Math.floor(Math.random() * phrases.length)];
    phrase.forEach((deg, i) => {
      if (deg < 0) return; // rest
      const time = now + i * beatLen;
      const note = melody[deg];
      const dur = beatLen * (0.6 + Math.random() * 0.6);
      playNote(note, time, dur, 'triangle', 0.18);
    });

    // Occasional high sparkle notes (like sun on water)
    if (Math.random() > 0.4) {
      const sparkleTime = now + Math.random() * beatLen * 6;
      const sparkleNote = melody[4 + Math.floor(Math.random() * 4)]; // high notes
      playNote(sparkleNote * 2, sparkleTime, 0.2, 'sine', 0.06);
    }

    setTimeout(scheduleBar, beatLen * 8 * 1000);
  }
  scheduleBar();

  c.onclick = () => { alive = false; musicAlive = false; waves.noise.stop(); waves.lfo.stop(); actx.close(); c.remove(); };
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

void main(){
  float gridR=40.0; // fixed grid spacing (accommodates largest bubbles)
  vec2 pixel=uv*res+offset;

  float row=floor(pixel.y/(gridR*1.732));
  float off=mod(row,2.0)*gridR;
  float col=floor((pixel.x+off)/(gridR*2.0));
  vec2 center=vec2(col*gridR*2.0-off, row*gridR*1.732);
  center+=vec2(gridR, gridR*0.866);

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

  vec2 diff=pixel-center;
  float dist=length(diff);

  if(dist<r){
    float z=sqrt(r*r-dist*dist);
    vec3 normal=normalize(vec3(diff,z));

    vec2 refracted=diff-normal.xy*z*0.4;
    vec2 newUV=(center+refracted-offset)/res;

    float highlight=pow(max(dot(normal,normalize(vec3(0.3,0.5,1.0))),0.0),16.0)*0.6;

    float edge=smoothstep(r,r*0.7,dist);

    vec3 col=texture2D(tex,newUV).rgb;
    col=col*0.92+vec3(0.95,0.96,0.98)*0.08;

    // Thin-film iridescence (soap bubble rainbow)
    float angle=dot(normal, normalize(vec3(0.0,0.0,1.0)));
    float film=1.0-angle; // thicker at edges
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
  gl.uniform2f(gl.getUniformLocation(prog, 'res'), innerWidth, innerHeight);

  const offsetLoc = gl.getUniformLocation(prog, 'offset');
  const mouseLoc = gl.getUniformLocation(prog, 'mouse');

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

  // Accumulate offset over time based on mouse direction + distance
  let ox = 0, oy = 0;
  const speed = 0.003; // pixels per frame per pixel of mouse distance from center

  function frame() {
    if (!alive) return;
    ox += mouseX * speed;
    oy += mouseY * speed;
    gl.uniform2f(offsetLoc, ox, oy);
    gl.uniform2f(mouseLoc, mousePxX, mousePxY);
    gl.viewport(0, 0, innerWidth, innerHeight);
    gl.drawArrays(gl.TRIANGLE_STRIP, 0, 4);
    requestAnimationFrame(frame);
  }
  frame();

  console.log('Bubble wrap applied! Click to remove.');
})();
