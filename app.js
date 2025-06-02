// Die Konfiguration wird aus src/config.js geladen (Variable: config)

let state = {
  started: false,
  finished: false,
  current: 0,
  selected: null,
  solved: false,
  correctCount: 0,
  wrongColors: [] // speichert falsch angeklickte Farben
};

function $(q) { return document.querySelector(q); }
function $all(q) { return Array.from(document.querySelectorAll(q)); }

function konfetti() {
  const container = document.getElementById('confetti-container');
  if (!container) return;
  for (let i = 0; i < 42; i++) {
    const conf = document.createElement('div');
    conf.className = 'confetti';
    conf.style.left = Math.random() * 100 + 'vw';
    conf.style.background = `hsl(${Math.random()*360},90%,60%)`;
    conf.style.animationDuration = (1.2 + Math.random()*0.8) + 's';
    conf.style.opacity = 0.7 + Math.random()*0.3;
    conf.style.transform = `rotate(${Math.random()*360}deg)`;
    container.appendChild(conf);
    setTimeout(() => conf.remove(), 1800);
  }
}

function render() {
  const root = $("#app");
  root.innerHTML = '';
  if (!window.config || config.length === 0) {
    root.innerHTML = '<div class="loading">Keine Konfiguration gefunden. Passe <b>src/config.js</b> an.</div>';
    return;
  }
  if (!state.started) {
    root.innerHTML = `
      <div class="startscreen animate-in">
        <h1>Guess the Color</h1>
        <p class="subtitle">Errate die Twitch-Farbe anhand des Usernamens!</p>
        <button class="start-btn" id="startbtn">Spiel starten</button>
      </div>
    `;
    $("#startbtn").onclick = () => { state.started = true; render(); };
    return;
  }
  if (state.finished) {
    root.innerHTML = `
      <div class="endscreen animate-in">
        <h1>Fertig!</h1>
        <p class="subtitle">Du hast <b>${state.correctCount}</b> von <b>${config.length}</b> richtig erraten.</p>
        <button class="start-btn" id="restartbtn">Nochmal spielen</button>
      </div>
    `;
    $("#restartbtn").onclick = () => {
      state = { started: false, finished: false, current: 0, selected: null, solved: false, correctCount: 0, wrongColors: [] };
      render();
    };
    return;
  }
  // Fortschrittsbalken
  const progress = (state.current / config.length) * 100;
  const user = config[state.current];
  let correctColor = user.real_color;
  // Antwortmöglichkeiten generieren
  let answerColors = user.colors;
  root.innerHTML = `
    <div class="progress-bar-outer"><div class="progress-bar-inner" style="width:${progress}%"></div></div>
    <div class="userbox animate-in"><span class="username">${user.username}</span></div>
    <div class="colors">
      ${answerColors.map((color,i) => `
        <button class="color-btn${state.selected===color && color.toLowerCase()===correctColor.toLowerCase()?' correct':''}${state.selected===color && color.toLowerCase()!==correctColor.toLowerCase()?' super-wrong':''}${state.wrongColors.includes(color)?' wrong-persist':''}" style="background:${color};transition-delay:${i*30}ms" data-color="${color}" ${state.solved?'disabled':''}></button>
      `).join('')}
    </div>
    <div class="nav">
      <button id="prevbtn" ${state.current===0?'disabled':''}>Zurück</button>
      <button id="nextbtn" ${state.current===config.length-1?'disabled':''}>Weiter</button>
    </div>
  `;
  $all('.color-btn').forEach(btn => {
    btn.onclick = () => {
      if(state.solved) return;
      const color = btn.getAttribute('data-color');
      state.selected = color;
      if(color.toLowerCase() === correctColor.toLowerCase()) {
        state.solved = true;
        btn.classList.add('super-correct');
        konfetti();
        setTimeout(() => {
          state.correctCount++;
          setTimeout(() => {
            state.wrongColors = [];
            if(state.current < config.length-1) {
              state.current++;
              state.selected = null;
              state.solved = false;
              render();
            } else {
              state.finished = true;
              render();
            }
          }, 900);
        }, 600);
        render();
      } else {
        btn.classList.add('super-wrong');
        if(!state.wrongColors.includes(color)) state.wrongColors.push(color);
        setTimeout(() => render(), 700);
      }
    };
  });
  $("#prevbtn").onclick = () => {
    if(state.current > 0) {
      state.current--;
      state.selected = null;
      state.solved = false;
      state.wrongColors = [];
      render();
    }
  };
  $("#nextbtn").onclick = () => {
    if(state.current < config.length-1) {
      state.current++;
      state.selected = null;
      state.solved = false;
      state.wrongColors = [];
      render();
    }
  };
}

document.addEventListener('DOMContentLoaded', render); 