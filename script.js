// --- Slot Machine Logic (identical to your original file, except for modularization) ---
const symbols = ["💎", "🪙", "💰", "🤑", "💳", "💵"];
const JACKPOT_MULTIPLIER = 100;
const DOUBLE_MULTIPLIER = 2.5;
const STORAGE_KEY = "slots_credits";
const NAME_KEY = "slots_playername";
const LEADERBOARD_KEY = "slots_leaderboard";
const INITIAL_CREDITS = 100;

function getLeaderboard() {
  return JSON.parse(localStorage.getItem(LEADERBOARD_KEY) || "[]");
}
function setLeaderboard(lb) {
  localStorage.setItem(LEADERBOARD_KEY, JSON.stringify(lb));
}
function getPlayerName() {
  return localStorage.getItem(NAME_KEY) || "Player";
}
function setPlayerName(name) {
  localStorage.setItem(NAME_KEY, name);
}

if (document.getElementById("spinButton")) {
  let credits = parseInt(localStorage.getItem(STORAGE_KEY)) || INITIAL_CREDITS;
  const reels = ["reel0", "reel1", "reel2"].map(id => document.querySelector(`#${id} .symbols`));

  function updateCredits(val) {
    credits += val;
    if (credits < 0) credits = 0;
    localStorage.setItem(STORAGE_KEY, credits);
    document.getElementById("credits").textContent = "Money: $" + credits;
    updateLeaderboard();
  }

  function toggleSpinButton() {
    document.getElementById("spinButton").disabled = credits <= 0;
  }

  function playWinningSound() {
    try {
      const ctx = new (window.AudioContext || window.webkitAudioContext)();
      const o = ctx.createOscillator();
      const g = ctx.createGain();
      o.type = 'sine';
      o.frequency.setValueAtTime(880, ctx.currentTime);
      g.gain.setValueAtTime(0.12, ctx.currentTime);
      o.connect(g).connect(ctx.destination);
      o.start();
      o.frequency.exponentialRampToValueAtTime(1760, ctx.currentTime + 0.3);
      g.gain.exponentialRampToValueAtTime(0.001, ctx.currentTime + 0.3);
      o.stop(ctx.currentTime + 0.3);
    } catch (e) {}
  }

  function playSpinSound() {
    try {
      const ctx = new (window.AudioContext || window.webkitAudioContext)();
      const o = ctx.createOscillator();
      const g = ctx.createGain();
      o.type = 'triangle';
      o.frequency.setValueAtTime(400, ctx.currentTime);
      o.frequency.exponentialRampToValueAtTime(800, ctx.currentTime + 0.5);
      g.gain.setValueAtTime(0.15, ctx.currentTime);
      g.gain.exponentialRampToValueAtTime(0.001, ctx.currentTime + 0.5);
      o.connect(g);
      g.connect(ctx.destination);
      o.start();
      o.stop(ctx.currentTime + 0.5);
    } catch (e) {}
  }

  function spinSlots() {
    let bet = parseInt(document.getElementById("bet").value);
    if (bet <= 0 || bet > credits) {
      document.getElementById("message").textContent = "Invalid bet.";
      return;
    }
    credits -= bet;
    updateCredits(0);
    playSpinSound();
    let res = [];
    for (let i = 0; i < 3; i++) {
      res[i] = symbols[Math.floor(Math.random() * symbols.length)];
      let reel = document.getElementById("reel" + i).querySelector(".symbols");
      reel.innerHTML = `<div class='symbol'>${res[i]}</div>`;
    }
    let payout = 0;
    if (res[0] === res[1] && res[1] === res[2]) {
      payout = bet * JACKPOT_MULTIPLIER;
      document.getElementById("message").textContent = `Jackpot! Won $${payout}`;
      playWinningSound();
    } else if (res[0] === res[1] || res[1] === res[2] || res[0] === res[2]) {
      payout = Math.round(bet * DOUBLE_MULTIPLIER);
      document.getElementById("message").textContent = `Double! Won $${payout}`;
      playWinningSound();
    } else {
      document.getElementById("message").textContent = "Try again!";
    }
    updateCredits(payout);
    toggleSpinButton();
  }

  function resetGame() {
    credits = INITIAL_CREDITS;
    localStorage.setItem(STORAGE_KEY, credits);
    document.getElementById("message").textContent = "Game reset.";
    updateCredits(0);
    toggleSpinButton();
  }

  document.getElementById("spinButton").onclick = spinSlots;
  document.getElementById("resetButton").onclick = resetGame;
  document.getElementById("bet").oninput = toggleSpinButton;
  updateCredits(0);
  toggleSpinButton();

  // --- Leaderboard integration ---
  function updateLeaderboard() {
    let lb = getLeaderboard();
    let name = getPlayerName();
    let found = lb.find(e => e.name === name);
    if (found) {
      if (credits > found.credits) found.credits = credits;
    } else {
      lb.push({ name, credits });
    }
    lb.sort((a, b) => b.credits - a.credits);
    setLeaderboard(lb.slice(0, 10));
  }
  updateLeaderboard();
}

// --- Leaderboard Page Logic ---
if (document.getElementById("board")) {
  function renderBoard() {
    let lb = getLeaderboard();
    let name = getPlayerName();
    let html = '<table><tr><th>Rank</th><th>Name</th><th>Credits</th></tr>';
    lb.forEach((e, i) => {
      html += `<tr${e.name === name ? ' style="font-weight:bold;color:#facc15"' : ''}><td>${i + 1}</td><td>${e.name}</td><td>${e.credits}</td></tr>`;
    });
    html += '</table>';
    document.getElementById("board").innerHTML = html;
    document.getElementById("playerName").value = name;
  }
  function saveName() {
    let n = document.getElementById("playerName").value.trim() || "Player";
    setPlayerName(n);
    renderBoard();
  }
  function resetBoard() {
    setLeaderboard([]);
    renderBoard();
  }
  document.getElementById("saveName").onclick = saveName;
  document.getElementById("resetBoard").onclick = resetBoard;
  renderBoard();
}
