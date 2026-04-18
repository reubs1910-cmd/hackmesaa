/* =========================================================
   Financial Survival Semester — APP
   Presentation + orchestration. All DOM lives here.
   Classes: Logger, Leaderboard, UI, Game + bootstrap.
   ========================================================= */

// =========================================================
// Logger — writes WIN/HIT/INFO entries to the log panel.
// =========================================================
class Logger {
  constructor(targetEl) {
    this.el = targetEl;
    this.entries = [];
  }

  clear() { this.el.innerHTML = ''; this.entries = []; }

  write(kind, msg) {
    this.entries.push({ kind, msg });
    const div = document.createElement('div');
    div.className = 'entry ' + kind;
    const tag = kind === 'good' ? '✓ WIN' : kind === 'bad' ? '✗ HIT' : 'ℹ INFO';
    div.innerHTML = `<span class="tag">${tag}</span>${msg}`;
    this.el.appendChild(div);
    this.el.scrollTop = this.el.scrollHeight;
  }

  info(msg) { this.write('info', msg); }
  good(msg) { this.write('good', msg); }
  bad(msg)  { this.write('bad', msg); }
}

// =========================================================
// Leaderboard — campus ranking with player injected.
// =========================================================
class Leaderboard {
  static PEERS = [
    { name: 'Maya R. (Nursing)',        gpa: 3.82 },
    { name: 'Jordan P. (Business)',     gpa: 3.41 },
    { name: 'Aisha N. (CS)',            gpa: 3.12 },
    { name: 'Diego M. (Welding)',       gpa: 2.88 },
    { name: 'Sam K. (Liberal Arts)',    gpa: 2.55 },
    { name: 'Priya V. (Biology)',       gpa: 2.21 },
    { name: 'Tony L. (Criminal Just.)', gpa: 1.94 }
  ];

  static rankWith(playerGpa) {
    return [...Leaderboard.PEERS, { name: 'YOU', gpa: playerGpa, isMe: true }]
      .sort((a, b) => b.gpa - a.gpa);
  }

  static render(targetEl, playerGpa) {
    targetEl.innerHTML = '';
    Leaderboard.rankWith(playerGpa).forEach((p, i) => {
      const row = document.createElement('div');
      row.className = 'row' + (p.isMe ? ' me' : '');
      row.innerHTML = `
        <div class="rank">#${i + 1}</div>
        <div class="name">${p.name}</div>
        <div class="score">${p.gpa.toFixed(2)}</div>
      `;
      targetEl.appendChild(row);
    });
  }
}

// =========================================================
// UI — owns ALL DOM queries and screen-level rendering.
// Game talks to UI; UI talks to DOM.
// =========================================================
class UI {
  static TOTAL_WEEKS = 12;

  constructor() {
    this.screens = {
      title:  document.getElementById('screen-title'),
      select: document.getElementById('screen-select'),
      game:   document.getElementById('screen-game'),
      end:    document.getElementById('screen-end')
    };

    this.howto = document.getElementById('howto');
    this.charGrid = document.getElementById('charGrid');
    this.startBtn = document.getElementById('startBtn');

    this.charLabel   = document.getElementById('charLabel');
    this.charTitle   = document.getElementById('charTitle');
    this.weekCounter = document.getElementById('weekCounter');
    this.weekTag     = document.getElementById('weekTag');
    this.scholarTag  = document.getElementById('scholarTag');
    this.eventCard   = document.getElementById('eventCard');
    this.choicesEl   = document.getElementById('choices');
    this.logEl       = document.getElementById('log');

    this.hud = {
      cash:      document.getElementById('hudCash'),
      credit:    document.getElementById('hudCredit'),
      stress:    document.getElementById('hudStress'),
      stressBar: document.getElementById('hudStressBar'),
      debt:      document.getElementById('hudDebt'),
      coins:     document.getElementById('hudCoins')
    };

    this.end = {
      charTag:     document.getElementById('endCharTag'),
      gpa:         document.getElementById('finalGPA'),
      tier:        document.getElementById('finalTier'),
      caption:     document.getElementById('finalCaption'),
      survival:    document.getElementById('mSurvival'),
      credit:      document.getElementById('mCredit'),
      scholar:     document.getElementById('mScholar'),
      debt:        document.getElementById('mDebt'),
      debrief:     document.getElementById('debriefList'),
      leaderboard: document.getElementById('leaderboardList')
    };
  }

  goTo(name) {
    Object.entries(this.screens).forEach(([k, el]) => el.classList.toggle('hidden', k !== name));
    window.scrollTo({ top: 0, behavior: 'smooth' });
  }

  toggleHowTo() { this.howto.classList.toggle('hidden'); }

  renderCharacterGrid(characters, selectedId, onSelect) {
    this.charGrid.innerHTML = '';
    characters.forEach(c => this.charGrid.appendChild(c.renderCard({ selected: c.id === selectedId, onSelect })));
    this.startBtn.disabled = !selectedId;
  }

  setGameHeader(character) {
    this.charLabel.textContent = `${character.emoji} ${character.name}`;
    this.charTitle.textContent = character.name;
  }

  updateHUD(player) {
    const oldCash = parseInt(this.hud.cash.textContent.replace(/[$,]/g, '')) || 0;
    const newCash = Math.round(player.cash);
    const cashChange = newCash - oldCash;

    this.hud.cash.textContent   = `$${newCash.toLocaleString()}`;
    this.hud.credit.textContent = player.credit;
    this.hud.stress.textContent = player.stress;
    this.hud.stressBar.style.width = player.stress + '%';
    this.hud.debt.textContent   = `$${Math.round(player.debt).toLocaleString()}`;
    this.hud.coins.textContent  = player.coins;

    // Trigger coin animation if cash changed
    if (cashChange !== 0) {
      this.showCoinEffect(cashChange);
    }
  }

  showCoinEffect(amount) {
    const cashStat = document.querySelector('.stat.cash');
    if (!cashStat) return;

    const rect = cashStat.getBoundingClientRect();
    const effect = document.createElement('div');
    effect.className = `coin-effect ${amount > 0 ? 'gain' : 'loss'}`;
    effect.textContent = `${amount > 0 ? '+' : ''}$${Math.abs(amount)}`;
    effect.style.left = `${rect.left + rect.width / 2}px`;
    effect.style.top = `${rect.top + rect.height / 2}px`;
    
    document.body.appendChild(effect);

    // Play sound
    if (window.game) {
      try {
        if (amount > 0) {
          window.game.playChaChingSound();
        } else {
          window.game.playDingSound();
        }
      } catch (e) {
        console.log('Audio playback failed:', e);
      }
    }

    // Remove after animation
    setTimeout(() => effect.remove(), 1000);
  }

  updateWeekTicker(week, scholarCount) {
    this.weekTag.textContent     = `Week ${week} of ${UI.TOTAL_WEEKS}`;
    this.weekCounter.textContent = `Week ${week} of ${UI.TOTAL_WEEKS}`;
    this.scholarTag.textContent  = `🎯 Scholarships: ${scholarCount} found`;
    
    // Update progress bar if it exists
    const progressBar = document.getElementById('weekProgressBar');
    if (progressBar) {
      const progress = (week / UI.TOTAL_WEEKS) * 100;
      progressBar.style.width = `${progress}%`;
      progressBar.style.background = 'white';
    }
  }

  renderEvent(event, onChoose) {
    event.renderCard(this.eventCard);
    event.renderChoices(this.choicesEl, onChoose);
  }

  renderEndScreen({ player, score, debrief }) {
    this.end.charTag.textContent = `${player.character.emoji} ${player.character.name}`;
    this.end.gpa.textContent     = score.gpa.toFixed(2);
    this.end.tier.innerHTML      = `${score.tier.emoji} ${score.tier.name}`;
    this.end.caption.textContent = score.tier.caption;
    this.end.survival.textContent = `$${Math.round(player.netWorth).toLocaleString()}`;
    this.end.credit.textContent   = (player.creditDelta >= 0 ? '+' : '') + player.creditDelta + ' pts';
    this.end.scholar.textContent  = `${player.scholar} found`;
    this.end.debt.textContent     = `$${player.avoidedDebt.toLocaleString()}`;

    this.end.debrief.innerHTML = '';
    debrief.forEach(line => {
      const li = document.createElement('li');
      li.textContent = line;
      this.end.debrief.appendChild(li);
    });

    Leaderboard.render(this.end.leaderboard, score.gpa);
  }
}

// =========================================================
// Game — top-level orchestrator. Wires Player, UI, Deck, Logger.
// =========================================================
class Game {
  constructor() {
    this.ui = new UI();
    this.logger = new Logger(this.ui.logEl);
    this.characters = Character.all();
    this.deck = new EventDeck(EventCard.all());
    this.selectedCharId = null;
    this.player = null;

    // Create audio context for sound effects
    this.audioContext = new (window.AudioContext || window.webkitAudioContext)();

    this.bindActions();
    this.ui.goTo('title');
  }

  // Cha-ching sound for gaining money
  playChaChingSound() {
    const ctx = this.audioContext;
    const now = ctx.currentTime;
    
    // First "cha" - higher pitch
    const osc1 = ctx.createOscillator();
    const gain1 = ctx.createGain();
    osc1.connect(gain1);
    gain1.connect(ctx.destination);
    osc1.frequency.setValueAtTime(800, now);
    osc1.frequency.exponentialRampToValueAtTime(1200, now + 0.1);
    gain1.gain.setValueAtTime(0.3, now);
    gain1.gain.exponentialRampToValueAtTime(0.01, now + 0.15);
    osc1.start(now);
    osc1.stop(now + 0.15);

    // Second "ching" - even higher
    const osc2 = ctx.createOscillator();
    const gain2 = ctx.createGain();
    osc2.connect(gain2);
    gain2.connect(ctx.destination);
    osc2.frequency.setValueAtTime(1200, now + 0.1);
    osc2.frequency.exponentialRampToValueAtTime(1600, now + 0.25);
    gain2.gain.setValueAtTime(0.3, now + 0.1);
    gain2.gain.exponentialRampToValueAtTime(0.01, now + 0.3);
    osc2.start(now + 0.1);
    osc2.stop(now + 0.3);
  }

  // Ding sound for losing money
  playDingSound() {
    const ctx = this.audioContext;
    const now = ctx.currentTime;
    
    const osc = ctx.createOscillator();
    const gain = ctx.createGain();
    osc.connect(gain);
    gain.connect(ctx.destination);
    
    // Single descending tone
    osc.frequency.setValueAtTime(600, now);
    osc.frequency.exponentialRampToValueAtTime(300, now + 0.3);
    gain.gain.setValueAtTime(0.3, now);
    gain.gain.exponentialRampToValueAtTime(0.01, now + 0.3);
    
    osc.start(now);
    osc.stop(now + 0.3);
  }

  // Buzzer sound for failing GPA
  playBuzzerSound() {
    const ctx = this.audioContext;
    const now = ctx.currentTime;
    
    // Harsh buzzer sound - low frequency oscillating
    const osc = ctx.createOscillator();
    const gain = ctx.createGain();
    osc.connect(gain);
    gain.connect(ctx.destination);
    
    osc.type = 'sawtooth';
    osc.frequency.setValueAtTime(120, now);
    osc.frequency.setValueAtTime(100, now + 0.15);
    osc.frequency.setValueAtTime(120, now + 0.3);
    osc.frequency.setValueAtTime(100, now + 0.45);
    
    gain.gain.setValueAtTime(0.4, now);
    gain.gain.exponentialRampToValueAtTime(0.01, now + 0.6);
    
    osc.start(now);
    osc.stop(now + 0.6);
  }

  // Tada/Success sound for passing GPA
  playSuccessSound() {
    const ctx = this.audioContext;
    const now = ctx.currentTime;
    
    // Triumphant ascending fanfare
    // First note
    const osc1 = ctx.createOscillator();
    const gain1 = ctx.createGain();
    osc1.connect(gain1);
    gain1.connect(ctx.destination);
    osc1.frequency.setValueAtTime(523, now); // C5
    gain1.gain.setValueAtTime(0.3, now);
    gain1.gain.exponentialRampToValueAtTime(0.01, now + 0.2);
    osc1.start(now);
    osc1.stop(now + 0.2);

    // Second note
    const osc2 = ctx.createOscillator();
    const gain2 = ctx.createGain();
    osc2.connect(gain2);
    gain2.connect(ctx.destination);
    osc2.frequency.setValueAtTime(659, now + 0.15); // E5
    gain2.gain.setValueAtTime(0.3, now + 0.15);
    gain2.gain.exponentialRampToValueAtTime(0.01, now + 0.35);
    osc2.start(now + 0.15);
    osc2.stop(now + 0.35);

    // Third note (highest)
    const osc3 = ctx.createOscillator();
    const gain3 = ctx.createGain();
    osc3.connect(gain3);
    gain3.connect(ctx.destination);
    osc3.frequency.setValueAtTime(784, now + 0.3); // G5
    gain3.gain.setValueAtTime(0.35, now + 0.3);
    gain3.gain.exponentialRampToValueAtTime(0.01, now + 0.6);
    osc3.start(now + 0.3);
    osc3.stop(now + 0.6);
  }

  bindActions() {
    document.body.addEventListener('click', (e) => {
      const action = e.target.closest('[data-action]')?.dataset.action;
      if (!action) return;
      switch (action) {
        case 'start':         this.ui.goTo('select'); return this.refreshCharSelect();
        case 'toggleHowTo':   return this.ui.toggleHowTo();
        case 'backToTitle':   return this.ui.goTo('title');
        case 'beginSemester': return this.beginSemester();
        case 'playAgain':     return location.reload();
        case 'shareScore':    return this.shareScore();
      }
    });
    this.refreshCharSelect();
  }

  refreshCharSelect() {
    this.ui.renderCharacterGrid(this.characters, this.selectedCharId, (c) => {
      this.selectedCharId = c.id;
      this.refreshCharSelect();
    });
  }

  beginSemester() {
    const character = Character.byId(this.selectedCharId);
    if (!character) return;
    this.player = new Player(character);
    this.deck = new EventDeck(EventCard.all());
    this.logger.clear();
    this.ui.setGameHeader(character);
    this.logger.info(`Semester begins. Welcome, ${character.name}.`);
    this.ui.goTo('game');
    this.tickWeek();
  }

  tickWeek() {
    if (this.player.week > UI.TOTAL_WEEKS || this.player.isBankrupt) return this.endGame();

    const { earned, rent, burnedOut } = this.player.processWeeklyBudget();
    if (burnedOut) this.logger.bad('Burnout: you missed shifts this week. Income drops.');
    this.logger.info(`Week ${this.player.week}: Paycheck +$${earned}, Rent −$${rent}.`);

    this.ui.updateHUD(this.player);
    this.ui.updateWeekTicker(this.player.week, this.player.scholar);

    const event = this.deck.draw();
    this.ui.renderEvent(event, (evt, choice) => this.onChoice(evt, choice));
  }

  onChoice(event, choice) {
    const summary = this.player.applyEffect(choice.effect);
    const kind = Player.categorizeEffect(choice.effect);
    this.logger.write(kind, `${event.icon} ${choice.label} → ${summary}`);

    this.player.week += 1;
    this.ui.updateHUD(this.player);
    setTimeout(() => this.tickWeek(), 350);
  }

  endGame() {
    const score = ScoreCalculator.calculate(this.player);
    const debrief = ScoreCalculator.buildDebrief(this.player, score.gpa);
    this.ui.renderEndScreen({ player: this.player, score, debrief });
    this.ui.goTo('end');

    // Play sound based on GPA and show explanation if needed
    setTimeout(() => {
      if (score.gpa < 2.5) {
        this.playBuzzerSound();
        setTimeout(() => this.showGPAExplanation(score.gpa, score.tier), 600);
      } else {
        this.playSuccessSound();
      }
    }, 500);
  }

  showGPAExplanation(gpa, tier) {
    const explanation = document.createElement('div');
    explanation.style.cssText = `
      position: fixed;
      top: 50%;
      left: 50%;
      transform: translate(-50%, -50%);
      background: var(--cream);
      border: 4px solid var(--danger);
      padding: 32px;
      max-width: 500px;
      z-index: 10000;
      box-shadow: 8px 8px 0 var(--night), 0 0 0 9999px rgba(0,0,0,0.7);
      font-family: 'VT323', monospace;
      font-size: 20px;
      line-height: 1.6;
    `;

    let message = '';
    if (gpa === 0.0) {
      message = `<h3 style="font-family: 'Press Start 2P', monospace; font-size: 16px; color: var(--danger); margin-top: 0;">💀 SEMESTER FAILED</h3>
        <p><b>You went bankrupt.</b> Your cash dropped below -$500, meaning you couldn't afford basic necessities to continue the semester.</p>
        <p><b>What this means:</b> In real life, this could mean dropping out, taking a leave of absence, or accumulating dangerous debt.</p>
        <p><b>Key lesson:</b> Build an emergency fund ($500-1000) before unexpected expenses hit. Use campus resources like emergency grants and food pantries.</p>`;
    } else if (gpa < 2.0) {
      message = `<h3 style="font-family: 'Press Start 2P', monospace; font-size: 16px; color: var(--danger); margin-top: 0;">😬 ACADEMIC PROBATION</h3>
        <p><b>Your GPA: ${gpa.toFixed(2)}</b> - This semester was financially rough. Debt piled up, stress stayed high, and you missed key opportunities.</p>
        <p><b>What this means:</b> You're surviving but barely. High stress, growing debt, and missed aid opportunities are warning signs.</p>
        <p><b>Key lesson:</b> Prioritize finding scholarships, avoid payday loans, and use campus financial aid resources before taking on debt.</p>`;
    } else {
      message = `<h3 style="font-family: 'Press Start 2P', monospace; font-size: 16px; color: var(--coin-dark); margin-top: 0;">📚 PASSING (BARELY)</h3>
        <p><b>Your GPA: ${gpa.toFixed(2)}</b> - You made it through, but there's significant room for improvement.</p>
        <p><b>What this means:</b> You finished the semester, but accumulated some debt or missed opportunities that could have helped you build wealth.</p>
        <p><b>Key lesson:</b> Focus on the 50/30/20 rule (50% needs, 30% wants, 20% savings), hunt for scholarships early, and avoid high-interest debt.</p>`;
    }

    explanation.innerHTML = `
      ${message}
      <button onclick="this.parentElement.remove()" style="
        margin-top: 20px;
        background: var(--coin);
        border: 3px solid var(--night);
        padding: 12px 24px;
        font-family: 'Press Start 2P', monospace;
        font-size: 10px;
        cursor: pointer;
        box-shadow: 3px 3px 0 var(--night);
        text-transform: uppercase;
      ">Got It</button>
    `;

    document.body.appendChild(explanation);
  }

  shareScore() {
    const gpa = this.ui.end.gpa.textContent;
    const name = this.player?.character?.name || 'a student';
    const txt = `I scored ${gpa} Financial GPA as ${name} in Financial Survival Semester (EduCents)!`;
    navigator.clipboard?.writeText(txt);
    alert('Score copied to clipboard!\n\n' + txt);
  }
}

// =========================================================
// Bootstrap
// =========================================================
document.addEventListener('DOMContentLoaded', () => {
  window.game = new Game();
});